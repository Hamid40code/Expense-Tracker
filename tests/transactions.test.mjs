import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createTransaction,
    createTransactionResult,
    getTransactionCents,
    normalizeTransaction,
    normalizeTransactions,
    formatCents,
    formatSignedCents,
    isValidAmountDraft,
    formatTransactionTime,
    sortTransactionsNewestFirst,
    isExpense,
    validateTransactionForm,
} from '../src/utils/transactions.js';
import { ERROR_CODES, getErrorMessage } from '../src/utils/errors.js';
import { getLatestTransactionBalanceTrace, getTransactionStats } from '../src/utils/transactionStats.js';
import { getCategoryIcon } from '../src/constants/transactions.js';

const now = new Date('2026-11-12T09:00:00.000Z');

test('creates expense and income transactions with canonical signed cents', () => {
    const expense = createTransaction({ name: 'Coffee', amount: '3.50', type: 'expense', category: 'Food' }, now);
    const income = createTransaction({ name: 'Salary', amount: '1500', type: 'income', category: 'Food' }, now);
    assert.equal(expense.amountCents, '-350');
    assert.equal(expense.amount, -3.5);
    assert.equal(expense.icon, '🍔');
    assert.equal(income.amountCents, '150000');
    assert.equal(income.category, 'Other');
});

test('whitespace-only names produce a field-specific error', () => {
    const result = createTransactionResult({ name: '   \n\t', amount: '12.00', type: 'expense' }, now);
    assert.equal(result.ok, false);
    assert.equal(result.errors.name, ERROR_CODES.TRANSACTION_NAME_REQUIRED);
    assert.equal(getErrorMessage(result.errors.name), 'Enter a transaction name.');
    assert.equal(createTransaction({ name: '   ', amount: '12' }, now), null);
});

test('new transaction names longer than 120 characters are rejected instead of silently truncated', () => {
    const result = validateTransactionForm({ name: 'x'.repeat(121), amount: '1' });
    assert.equal(result.errors.name, ERROR_CODES.TRANSACTION_NAME_TOO_LONG);
});

test('validates missing, malformed, negative, zero, tiny, and too-large amounts', () => {
    const cases = [
        ['', ERROR_CODES.TRANSACTION_AMOUNT_REQUIRED],
        ['   ', ERROR_CODES.TRANSACTION_AMOUNT_REQUIRED],
        ['abc', ERROR_CODES.TRANSACTION_AMOUNT_INVALID],
        ['$2', ERROR_CODES.TRANSACTION_AMOUNT_INVALID],
        ['1,000', ERROR_CODES.TRANSACTION_AMOUNT_INVALID],
        ['1e3', ERROR_CODES.TRANSACTION_AMOUNT_INVALID],
        ['-1', ERROR_CODES.TRANSACTION_AMOUNT_MUST_BE_POSITIVE],
        ['0', ERROR_CODES.TRANSACTION_AMOUNT_TOO_SMALL],
        ['0.001', ERROR_CODES.TRANSACTION_AMOUNT_TOO_SMALL],
        ['90071992547409.92', ERROR_CODES.TRANSACTION_AMOUNT_TOO_LARGE],
        ['9'.repeat(100000), ERROR_CODES.TRANSACTION_AMOUNT_TOO_LARGE],
    ];
    for (const [amount, expectedCode] of cases) {
        const result = createTransactionResult({ name: 'Test', amount, type: 'expense' }, now);
        assert.equal(result.ok, false, `Expected ${amount} to be rejected`);
        assert.equal(result.errors.amount, expectedCode, `Unexpected error for ${amount}`);
    }
});

test('rounds decimal input half-up to integer cents', () => {
    assert.equal(createTransaction({ name: 'A', amount: '1.004' }, now).amountCents, '-100');
    assert.equal(createTransaction({ name: 'A', amount: '1.005' }, now).amountCents, '-101');
    assert.equal(createTransaction({ name: 'A', amount: '.5' }, now).amountCents, '-50');
    assert.equal(createTransaction({ name: 'A', amount: '0001.2' }, now).amountCents, '-120');
});

test('rejects unsupported transaction types', () => {
    const result = createTransactionResult({ name: 'Test', amount: '1', type: 'transfer' }, now);
    assert.equal(result.ok, false);
    assert.equal(result.errors.type, ERROR_CODES.TRANSACTION_TYPE_INVALID);
});

test('normalizes legacy signed amounts, bounds hostile names, and removes control characters', () => {
    const transaction = normalizeTransaction({
        name: ' <script>\n' + 'x'.repeat(200),
        amount: '-2.00',
        date: 'Nov 1, 2026',
    });
    assert.ok(transaction);
    assert.equal(transaction.amountCents, '-200');
    assert.equal(transaction.name.length, 120);
    assert.ok(!transaction.name.includes('\n'));
});

test('rejects malformed records and zero-cent records', () => {
    for (const value of [null, undefined, [], 'text', 3, {}, { name: 'x', amount: '0' }, { name: 'x', amount: 'NaN' }]) {
        assert.equal(normalizeTransaction(value), null);
    }
});

test('normalizes legacy rows and regenerates duplicate IDs', () => {
    const rows = normalizeTransactions([
        { id: 'same', name: 'old', amount: -1, date: 'Nov 1, 2026' },
        { id: 'same', name: 'old 2', amount: -2, date: 'Nov 2, 2026' },
        { name: 'legacy', amount: -3, date: 'Nov 3, 2026' },
    ]);
    assert.equal(rows.length, 3);
    assert.equal(new Set(rows.map((row) => row.id)).size, 3);
    assert.equal(rows[0].createdAt, '');
});

test('sorts newest first and retains stable order for equal or invalid timestamps', () => {
    const rows = [
        { id: 'a', createdAt: '2026-01-01' },
        { id: 'b', createdAt: '2026-02-01' },
        { id: 'c', createdAt: 'bad' },
        { id: 'd', createdAt: 'bad' },
    ];
    assert.deepEqual(sortTransactionsNewestFirst(rows).map((row) => row.id), ['b', 'a', 'c', 'd']);
});

test('formats cents safely and clamps invalid fraction-digit options', () => {
    assert.equal(formatCents('123456'), '1,234.56');
    assert.equal(formatCents('-5'), '-0.05');
    assert.equal(formatCents('12345', { minimumFractionDigits: 0, maximumFractionDigits: 1 }), '123.5');
    assert.equal(formatCents('12345', { minimumFractionDigits: 0, maximumFractionDigits: 0 }), '123');
    assert.equal(formatCents('12345', { maximumFractionDigits: Number.NaN }), '123.45');
    assert.equal(formatCents('12345', { maximumFractionDigits: Number.POSITIVE_INFINITY }), '123.45');
    assert.equal(formatCents('12345', { minimumFractionDigits: -10, maximumFractionDigits: 8 }), '123.45');
    assert.equal(formatCents('-1', { maximumFractionDigits: 0 }), '0');
    assert.doesNotThrow(() => formatCents('1', { minimumFractionDigits: Symbol('bad') }));
});

test('invalid timestamps are handled safely', () => {
    assert.equal(formatTransactionTime('bad-date'), null);
    assert.equal(formatTransactionTime(''), null);
});

test('expense helper recognizes only negative valid cents', () => {
    assert.equal(getTransactionCents({ amountCents: '-1' }), -1n);
    assert.equal(isExpense({ amountCents: '-1' }), true);
    assert.equal(isExpense({ amountCents: '1' }), false);
    assert.equal(isExpense({ amountCents: 'bad', amount: 'x' }), false);
});

test('statistics use exact cents and percentages total exactly 100.00', () => {
    const rows = [
        normalizeTransaction({ name: 'A', amountCents: '-100', category: 'Food' }),
        normalizeTransaction({ name: 'B', amountCents: '-200', category: 'Bills' }),
        normalizeTransaction({ name: 'C', amountCents: '100', category: 'Other' }),
    ];
    const stats = getTransactionStats(rows);
    assert.equal(stats.totalExpensesCents, '300');
    assert.equal(stats.categoryStats.reduce((total, item) => total + item.percentage, 0), 100);
    assert.equal(stats.categoryStats.length, 2);
});

test('largest-remainder percentage allocation is deterministic', () => {
    const rows = Array.from({ length: 7 }, (_, index) => ({ amountCents: '-1', category: `c${index}` }));
    const stats = getTransactionStats(rows);
    assert.equal(stats.categoryStats.reduce((total, item) => total + item.percentage, 0), 100);
    assert.deepEqual(stats.categoryStats.map((item) => item.percentage), [14.29, 14.29, 14.29, 14.29, 14.28, 14.28, 14.28]);
});

test('defensive helpers handle non-array input and hostile date types', () => {
    assert.deepEqual(sortTransactionsNewestFirst(null), []);
    assert.equal(formatTransactionTime(Symbol('not a date')), null);
    assert.equal(getTransactionStats(null).totalExpensesCents, '0');
    assert.deepEqual(getTransactionStats(null).categoryStats, []);
});


test('category icon lookup does not leak inherited object properties', () => {
    assert.equal(getCategoryIcon('__proto__'), '💳');
    assert.equal(getCategoryIcon('constructor'), '💳');
});



test('amount drafts allow numeric input and partial decimals only', () => {
    for (const value of ['', '.', '0', '12', '12.3', '12.34', '12345678901234.56']) {
        assert.equal(isValidAmountDraft(value), true, `Expected ${JSON.stringify(value)} to be accepted while typing`);
    }

    for (const value of ['abc', '-10', '+10', '1e3', '10.999', '123456789012345', ' 10', '10 ']) {
        assert.equal(isValidAmountDraft(value), false, `Expected ${JSON.stringify(value)} to be rejected while typing`);
    }

    assert.equal(isValidAmountDraft(12), false);
});

test('signed balance formatting preserves exact cents and signs', () => {
    assert.equal(formatSignedCents('12345'), '+$123.45');
    assert.equal(formatSignedCents('-500'), '−$5.00');
    assert.equal(formatSignedCents('0'), '+$0.00');
    assert.equal(formatSignedCents('invalid'), '+$0.00');
});

test('latest balance trace shows only the newest transaction calculation', () => {
    const transactions = [
        { id: 'newest', amountCents: '2000' },
        { id: 'expense', amountCents: '-5000' },
        { id: 'opening', amountCents: '10000' },
    ];

    assert.deepEqual(getLatestTransactionBalanceTrace(transactions), {
        transactionId: 'newest',
        previousBalanceCents: '5000',
        transactionAmountCents: '2000',
        currentBalanceCents: '7000',
    });
});

test('latest balance trace handles a newest expense and negative balances exactly', () => {
    const transactions = [
        { id: 'latest-expense', amountCents: '-1500' },
        { id: 'older-expense', amountCents: '-2500' },
        { id: 'income', amountCents: '3000' },
    ];

    assert.deepEqual(getLatestTransactionBalanceTrace(transactions), {
        transactionId: 'latest-expense',
        previousBalanceCents: '500',
        transactionAmountCents: '-1500',
        currentBalanceCents: '-1000',
    });
});

test('latest balance trace safely handles empty or invalid transaction lists', () => {
    assert.equal(getLatestTransactionBalanceTrace([]), null);
    assert.equal(getLatestTransactionBalanceTrace(null), null);
    assert.equal(getLatestTransactionBalanceTrace([{ id: 'invalid', amountCents: 'bad' }]), null);
});


test('latest balance trace recalculates after deleting the newest transaction', () => {
    const transactions = [
        { id: 'newest', amountCents: '-1000' },
        { id: 'older', amountCents: '6000' },
    ];

    const afterDelete = getLatestTransactionBalanceTrace(transactions.slice(1));
    assert.deepEqual(afterDelete, {
        transactionId: 'older',
        previousBalanceCents: '0',
        transactionAmountCents: '6000',
        currentBalanceCents: '6000',
    });
});

test('latest balance trace handles a large transaction history with exact cents', () => {
    const transactions = Array.from({ length: 50000 }, (_, index) => ({
        id: `transaction-${index}`,
        amountCents: index === 0 ? '-1' : '1',
    }));

    const trace = getLatestTransactionBalanceTrace(transactions);
    assert.equal(trace.transactionId, 'transaction-0');
    assert.equal(trace.previousBalanceCents, '49999');
    assert.equal(trace.transactionAmountCents, '-1');
    assert.equal(trace.currentBalanceCents, '49998');
});
