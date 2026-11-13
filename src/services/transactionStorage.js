import { ERROR_CODES, reportAppError } from "../utils/errors.js";
import { normalizeTransactions } from "../utils/transactions.js";

const STORAGE_KEY = "finance-transactions";

function isQuotaExceeded(error) {
    return error?.name === "QuotaExceededError" || error?.code === 22 || error?.code === 1014;
}

/** Detailed loader used by the app so storage problems can be shown to the user. */
export function loadTransactionsResult() {
    try {
        if (typeof window === "undefined" || !window.localStorage) {
            return { transactions: [], errorCode: ERROR_CODES.STORAGE_UNAVAILABLE };
        }

        const savedData = window.localStorage.getItem(STORAGE_KEY);
        if (!savedData) return { transactions: [], errorCode: null };

        let parsedData;
        try {
            parsedData = JSON.parse(savedData);
        } catch (error) {
            reportAppError(error, "Could not parse saved transactions");
            return { transactions: [], errorCode: ERROR_CODES.STORAGE_DATA_CORRUPTED };
        }

        if (!Array.isArray(parsedData)) {
            return { transactions: [], errorCode: ERROR_CODES.STORAGE_DATA_CORRUPTED };
        }

        const transactions = normalizeTransactions(parsedData);
        const hasInvalidRecords = transactions.length !== parsedData.length;

        return {
            transactions,
            errorCode: hasInvalidRecords ? ERROR_CODES.STORAGE_INVALID_RECORDS : null,
        };
    } catch (error) {
        reportAppError(error, "Failed to load transactions");
        return {
            transactions: [],
            errorCode: error?.name === "SecurityError"
                ? ERROR_CODES.STORAGE_UNAVAILABLE
                : ERROR_CODES.STORAGE_READ_FAILED,
        };
    }
}

/** Backwards-compatible loader for non-UI callers. */
export function loadTransactions() {
    return loadTransactionsResult().transactions;
}

/** Persist only normalized transaction data and return an explicit result. */
export function saveTransactions(transactions) {
    if (!Array.isArray(transactions)) {
        return { ok: false, reason: ERROR_CODES.STORAGE_SERIALIZATION_FAILED };
    }

    let serialized;
    try {
        const normalizedTransactions = normalizeTransactions(transactions);
        serialized = JSON.stringify(normalizedTransactions);

        if (typeof serialized !== "string") {
            return { ok: false, reason: ERROR_CODES.STORAGE_SERIALIZATION_FAILED };
        }
    } catch (error) {
        reportAppError(error, "Could not prepare transactions for saving");
        return { ok: false, reason: ERROR_CODES.STORAGE_SERIALIZATION_FAILED };
    }

    try {
        if (typeof window === "undefined" || !window.localStorage) {
            return { ok: false, reason: ERROR_CODES.STORAGE_UNAVAILABLE };
        }

        window.localStorage.setItem(STORAGE_KEY, serialized);
        return { ok: true };
    } catch (error) {
        reportAppError(error, "Failed to save transactions");
        return {
            ok: false,
            reason: isQuotaExceeded(error)
                ? ERROR_CODES.STORAGE_QUOTA_EXCEEDED
                : ERROR_CODES.STORAGE_UNAVAILABLE,
        };
    }
}
