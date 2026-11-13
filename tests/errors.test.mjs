import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppError, ERROR_CODES, getErrorMessage } from '../src/utils/errors.js';

test('every declared error has a safe user-facing message', () => {
    for (const code of Object.values(ERROR_CODES)) {
        assert.equal(typeof getErrorMessage(code), 'string');
        assert.ok(getErrorMessage(code).length > 0);
    }
});

test('unknown and inherited object-property codes safely fall back to the generic message', () => {
    assert.equal(getErrorMessage('NOT_A_REAL_ERROR'), getErrorMessage(ERROR_CODES.UNKNOWN_ERROR));
    assert.equal(getErrorMessage('__proto__'), getErrorMessage(ERROR_CODES.UNKNOWN_ERROR));
    assert.equal(createAppError('__proto__').code, ERROR_CODES.UNKNOWN_ERROR);
});

test('application errors preserve stable codes and causes', () => {
    const cause = new Error('technical detail');
    const error = createAppError(ERROR_CODES.APP_ROOT_MISSING, cause);
    assert.equal(error.name, 'AppError');
    assert.equal(error.code, ERROR_CODES.APP_ROOT_MISSING);
    assert.equal(error.cause, cause);
    assert.equal(error.message, getErrorMessage(ERROR_CODES.APP_ROOT_MISSING));
});
