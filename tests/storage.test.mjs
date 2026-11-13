import test from 'node:test';
import assert from 'node:assert/strict';
import {
    loadTransactions,
    loadTransactionsResult,
    saveTransactions,
} from '../src/services/transactionStorage.js';
import { ERROR_CODES } from '../src/utils/errors.js';

function withWindow(localStorage, callback) {
    const previousWindow = globalThis.window;
    globalThis.window = { localStorage };
    try {
        return callback();
    } finally {
        if (previousWindow === undefined) delete globalThis.window;
        else globalThis.window = previousWindow;
    }
}

function withoutErrorLogs(callback) {
    const previousError = console.error;
    console.error = () => {};
    try {
        return callback();
    } finally {
        console.error = previousError;
    }
}

test('storage unavailable outside a browser is handled safely', () => {
    const previousWindow = globalThis.window;
    delete globalThis.window;
    try {
        assert.deepEqual(loadTransactions(), []);
        assert.equal(withoutErrorLogs(() => loadTransactionsResult()).errorCode, ERROR_CODES.STORAGE_UNAVAILABLE);
        assert.equal(saveTransactions([]).reason, ERROR_CODES.STORAGE_UNAVAILABLE);
    } finally {
        if (previousWindow !== undefined) globalThis.window = previousWindow;
    }
});

test('loads and saves normalized transactions', () => {
    const store = new Map();
    withWindow({
        getItem: (key) => store.get(key) ?? null,
        setItem: (key, value) => store.set(key, value),
    }, () => {
        assert.deepEqual(loadTransactions(), []);
        assert.equal(saveTransactions([{ name: 'Coffee', amountCents: '-100' }]).ok, true);
        assert.equal(loadTransactions().length, 1);
    });
});

test('corrupted JSON is reported and is not treated as a successful empty load', () => {
    withWindow({ getItem: () => '{not json' }, () => {
        const result = withoutErrorLogs(() => loadTransactionsResult());
        assert.deepEqual(result.transactions, []);
        assert.equal(result.errorCode, ERROR_CODES.STORAGE_DATA_CORRUPTED);
    });
});

test('unexpected persisted shape is classified as corrupted data', () => {
    withWindow({ getItem: () => JSON.stringify({ name: 'not an array' }) }, () => {
        assert.equal(loadTransactionsResult().errorCode, ERROR_CODES.STORAGE_DATA_CORRUPTED);
    });
});

test('invalid persisted rows are skipped and reported', () => {
    withWindow({ getItem: () => JSON.stringify([
        { name: 'Valid', amountCents: '-10' },
        { name: 'Invalid', amountCents: '0' },
    ]) }, () => {
        const result = loadTransactionsResult();
        assert.equal(result.transactions.length, 1);
        assert.equal(result.errorCode, ERROR_CODES.STORAGE_INVALID_RECORDS);
    });
});

test('storage access security exceptions are caught', () => {
    const storage = Object.defineProperty({}, 'getItem', {
        get() { throw Object.assign(new Error('blocked'), { name: 'SecurityError' }); },
    });
    withWindow(storage, () => {
        assert.equal(withoutErrorLogs(() => loadTransactionsResult()).errorCode, ERROR_CODES.STORAGE_UNAVAILABLE);
    });
});

test('quota errors produce a distinct result', () => {
    withWindow({
        setItem() { throw Object.assign(new Error('full'), { name: 'QuotaExceededError' }); },
    }, () => {
        assert.equal(withoutErrorLogs(() => saveTransactions([])).reason, ERROR_CODES.STORAGE_QUOTA_EXCEEDED);
    });
});

test('invalid save input is rejected', () => {
    withWindow({ setItem() {} }, () => {
        assert.equal(saveTransactions(null).reason, ERROR_CODES.STORAGE_SERIALIZATION_FAILED);
    });
});


test('generic storage read failures are distinguished from corrupted JSON', () => {
    withWindow({
        getItem() { throw new Error('read denied'); },
    }, () => {
        assert.equal(withoutErrorLogs(() => loadTransactionsResult()).errorCode, ERROR_CODES.STORAGE_READ_FAILED);
    });
});

test('transaction normalization failures are reported as serialization failures', () => {
    const badRecord = new Proxy({}, {
        get() { throw new Error('hostile property accessor'); },
    });
    withWindow({ setItem() {} }, () => {
        assert.equal(
            withoutErrorLogs(() => saveTransactions([badRecord])).reason,
            ERROR_CODES.STORAGE_SERIALIZATION_FAILED,
        );
    });
});
