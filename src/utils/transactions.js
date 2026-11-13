import { ERROR_CODES } from "./errors.js";
import {
    DEFAULT_CATEGORY,
    DEFAULT_TRANSACTION_ICON,
    TRANSACTION_CATEGORIES,
    TRANSACTION_TYPES,
    getCategoryIcon,
} from "../constants/transactions.js";

const MAX_SAFE_CENTS = BigInt(Number.MAX_SAFE_INTEGER);
const ALLOWED_CATEGORIES = new Set(
    TRANSACTION_CATEGORIES.map(({ value }) => value)
);

function createTransactionId() {
    if (typeof globalThis.crypto?.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }

    return `transaction-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function parseCents(value, allowLarge = false) {
    if (typeof value === "bigint") {
        return allowLarge || (value >= -MAX_SAFE_CENTS && value <= MAX_SAFE_CENTS)
            ? value
            : null;
    }

    if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
        const textValue = value.trim();
        if (textValue.length > (allowLarge ? 100 : 17)) return null;

        try {
            const cents = BigInt(textValue);
            return allowLarge || (cents >= -MAX_SAFE_CENTS && cents <= MAX_SAFE_CENTS)
                ? cents
                : null;
        } catch {
            return null;
        }
    }

    if (typeof value === "number" && Number.isInteger(value) && (allowLarge || Number.isSafeInteger(value))) {
        return BigInt(value);
    }

    return null;
}

function parseSignedAmount(value) {
    if (typeof value === "number" && !Number.isFinite(value)) {
        return { errorCode: ERROR_CODES.TRANSACTION_AMOUNT_INVALID };
    }

    const amountText = String(value ?? "").trim();
    if (!amountText) {
        return { errorCode: ERROR_CODES.TRANSACTION_AMOUNT_REQUIRED };
    }

    const match = amountText.match(/^([+-])?(?:(\d+)(?:\.(\d*))?|\.(\d+))$/);
    if (!match) {
        return { errorCode: ERROR_CODES.TRANSACTION_AMOUNT_INVALID };
    }

    const wholeText = (match[2] || "0").replace(/^0+(?=\d)/, "");

    // A longer integer part cannot fit into a safe integer number of cents.
    // Check its length before constructing a BigInt to keep hostile input bounded.
    if (wholeText.length > 14) {
        return { errorCode: ERROR_CODES.TRANSACTION_AMOUNT_TOO_LARGE };
    }

    const fractionText = match[3] ?? match[4] ?? "";
    const firstTwoFractionDigits = fractionText.slice(0, 2).padEnd(2, "0");
    let absoluteCents = BigInt(wholeText) * 100n + BigInt(firstTwoFractionDigits || "0");

    // Round decimal input half-up using its text representation, not binary floats.
    if (fractionText.length > 2 && fractionText[2] >= "5") {
        absoluteCents += 1n;
    }

    if (absoluteCents > MAX_SAFE_CENTS) {
        return { errorCode: ERROR_CODES.TRANSACTION_AMOUNT_TOO_LARGE };
    }

    const cents = match[1] === "-" ? -absoluteCents : absoluteCents;
    return { cents };
}

function parseAmountInput(value) {
    const result = parseSignedAmount(value);
    if (result.errorCode) return result;

    if (result.cents < 0n) {
        return { errorCode: ERROR_CODES.TRANSACTION_AMOUNT_MUST_BE_POSITIVE };
    }

    if (result.cents === 0n) {
        return { errorCode: ERROR_CODES.TRANSACTION_AMOUNT_TOO_SMALL };
    }

    return result;
}

function amountToCents(value) {
    const result = parseSignedAmount(value);
    return result.cents ?? null;
}

/** Returns the canonical signed amount in cents, or null for invalid data. */
export function getTransactionCents(transaction) {
    const storedCents = parseCents(transaction?.amountCents);

    if (storedCents !== null && storedCents !== 0n) {
        return storedCents;
    }

    return amountToCents(transaction?.amount);
}

export function isExpense(transaction) {
    const cents = getTransactionCents(transaction);
    return cents !== null && cents < 0n;
}

export function getTransactionTimestamp(transaction) {
    const parseDate = (value) => {
        if (typeof value !== "string" || !value.trim()) return Number.NaN;
        try {
            return Date.parse(value);
        } catch {
            return Number.NaN;
        }
    };

    const createdAt = parseDate(transaction?.createdAt);
    if (Number.isFinite(createdAt)) return createdAt;

    const legacyDate = parseDate(transaction?.date);
    return Number.isFinite(legacyDate) ? legacyDate : 0;
}

export function sortTransactionsNewestFirst(transactions = []) {
    if (!Array.isArray(transactions)) return [];

    return transactions
        .map((transaction, originalIndex) => ({
            transaction,
            originalIndex,
            timestamp: getTransactionTimestamp(transaction),
        }))
        .sort((first, second) => {
            const timeDifference = second.timestamp - first.timestamp;
            return timeDifference || first.originalIndex - second.originalIndex;
        })
        .map(({ transaction }) => transaction);
}

export function formatTransactionTime(createdAt) {
    if (typeof createdAt !== "string" && typeof createdAt !== "number") return null;
    if (!createdAt) return null;

    try {
        const date = new Date(createdAt);
        if (Number.isNaN(date.getTime())) return null;

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    } catch {
        return null;
    }
}

/** Formats an integer-cent value without converting the full amount to a float. */
export function formatCents(value, options = {}) {
    const cents = parseCents(value, true);

    if (cents === null) return "0.00";

    const normalizeDigits = (digitsValue, fallback) => {
        try {
            const numericValue = typeof digitsValue === "number" ? digitsValue : Number(digitsValue);
            if (!Number.isFinite(numericValue)) return fallback;
            return Math.min(2, Math.max(0, Math.trunc(numericValue)));
        } catch {
            return fallback;
        }
    };
    const maxDigits = normalizeDigits(options?.maximumFractionDigits ?? 2, 2);
    const minDigits = Math.min(maxDigits, normalizeDigits(options?.minimumFractionDigits ?? 2, 2));
    const precisionFactor = 10n ** BigInt(2 - maxDigits);
    const absoluteCents = cents < 0n ? -cents : cents;
    const roundedCents = maxDigits === 2
        ? absoluteCents
        : ((absoluteCents + precisionFactor / 2n) / precisionFactor) * precisionFactor;

    const whole = roundedCents / 100n;
    let fraction = (roundedCents % 100n).toString().padStart(2, "0").slice(0, maxDigits);

    while (fraction.length > minDigits && fraction.endsWith("0")) {
        fraction = fraction.slice(0, -1);
    }

    const formattedWhole = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    }).format(whole);
    const sign = cents < 0n && roundedCents !== 0n ? "-" : "";

    return `${sign}${formattedWhole}${fraction ? `.${fraction}` : ""}`;
}

function normalizeDate(createdAtValue, displayDateValue) {
    const createdAtText = typeof createdAtValue === "string" ? createdAtValue.trim() : "";
    const displayDate = typeof displayDateValue === "string"
        ? displayDateValue.trim().slice(0, 40)
        : "";
    const createdAtTimestamp = Date.parse(createdAtText);

    if (Number.isFinite(createdAtTimestamp)) {
        return {
            createdAt: new Date(createdAtTimestamp).toISOString(),
            date: displayDate || new Date(createdAtTimestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
        };
    }

    // A date-only legacy field does not contain a reliable time of day. Keep
    // createdAt empty so the UI does not invent a midnight timestamp.
    return { createdAt: "", date: displayDate };
}

/** Validates and normalizes a single persisted or newly-created transaction. */
export function normalizeTransaction(transaction) {
    if (
        transaction === null ||
        typeof transaction !== "object" ||
        Array.isArray(transaction)
    ) {
        return null;
    }

    const name = typeof transaction.name === "string"
        ? transaction.name.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)
        : "";
    const cents = getTransactionCents(transaction);

    if (!name || cents === null || cents === 0n) {
        return null;
    }

    const requestedCategory = typeof transaction.category === "string"
        ? transaction.category.trim()
        : "";
    const category = cents > 0n
        ? DEFAULT_CATEGORY
        : (ALLOWED_CATEGORIES.has(requestedCategory) ? requestedCategory : DEFAULT_CATEGORY);
    const normalizedDate = normalizeDate(transaction.createdAt, transaction.date);
    const id = typeof transaction.id === "string" && transaction.id.trim().length <= 128
        ? transaction.id.trim()
        : "";

    return {
        id: id || createTransactionId(),
        name,
        category,
        date: normalizedDate.date || (typeof transaction.date === "string" ? transaction.date.trim().slice(0, 40) : ""),
        createdAt: normalizedDate.createdAt,
        amountCents: cents.toString(),
        amount: Number(cents) / 100,
        icon: getCategoryIcon(category) || DEFAULT_TRANSACTION_ICON,
    };
}

/** Drops malformed rows and repairs missing or duplicate IDs before rendering. */
export function normalizeTransactions(transactions) {
    if (!Array.isArray(transactions)) return [];

    const seenIds = new Set();
    const normalized = [];

    for (const candidate of transactions) {
        const transaction = normalizeTransaction(candidate);

        if (!transaction) continue;

        if (seenIds.has(transaction.id)) {
            const originalId = transaction.id.slice(0, 112);
            let suffix = 1;
            let candidateId = `${originalId}~${suffix}`;

            while (seenIds.has(candidateId)) {
                suffix += 1;
                candidateId = `${originalId}~${suffix}`;
            }

            transaction.id = candidateId;
        }

        seenIds.add(transaction.id);
        normalized.push(transaction);
    }

    return normalized;
}

/** Validate untrusted form data and return field-specific stable error codes. */
export function validateTransactionForm(formData) {
    const errors = {};

    if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
        return { valid: false, errors: { form: ERROR_CODES.FORM_INVALID } };
    }

    const rawName = typeof formData.name === "string" ? formData.name : "";
    const name = rawName.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();

    if (!name) {
        errors.name = ERROR_CODES.TRANSACTION_NAME_REQUIRED;
    } else if (name.length > 120) {
        errors.name = ERROR_CODES.TRANSACTION_NAME_TOO_LONG;
    }

    const amountResult = parseAmountInput(formData.amount);
    if (amountResult.errorCode) {
        errors.amount = amountResult.errorCode;
    }

    if (
        formData.type !== undefined &&
        formData.type !== TRANSACTION_TYPES.EXPENSE &&
        formData.type !== TRANSACTION_TYPES.INCOME
    ) {
        errors.type = ERROR_CODES.TRANSACTION_TYPE_INVALID;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

/** Build a transaction with explicit validation errors for the UI. */
export function createTransactionResult(formData, now = new Date()) {
    const validation = validateTransactionForm(formData);

    if (!validation.valid) {
        return {
            ok: false,
            errors: validation.errors,
            errorCode: Object.values(validation.errors)[0] || ERROR_CODES.FORM_INVALID,
        };
    }

    const name = formData.name.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
    const amountCents = amountToCents(formData.amount);

    // This guard protects the constructor if amount parsing rules change later.
    if (amountCents === null || amountCents < 1n) {
        return {
            ok: false,
            errors: { amount: ERROR_CODES.TRANSACTION_AMOUNT_INVALID },
            errorCode: ERROR_CODES.TRANSACTION_AMOUNT_INVALID,
        };
    }

    const type = formData.type === TRANSACTION_TYPES.INCOME
        ? TRANSACTION_TYPES.INCOME
        : TRANSACTION_TYPES.EXPENSE;
    const signedCents = type === TRANSACTION_TYPES.INCOME
        ? amountCents
        : -amountCents;
    const requestedCategory = typeof formData.category === "string"
        ? formData.category.trim()
        : "";
    const category = type === TRANSACTION_TYPES.INCOME
        ? DEFAULT_CATEGORY
        : (ALLOWED_CATEGORIES.has(requestedCategory) ? requestedCategory : DEFAULT_CATEGORY);
    const transactionDate = now instanceof Date && Number.isFinite(now.getTime())
        ? now
        : new Date();

    return {
        ok: true,
        transaction: {
            id: createTransactionId(),
            name,
            category,
            date: transactionDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            createdAt: transactionDate.toISOString(),
            amountCents: signedCents.toString(),
            amount: Number(signedCents) / 100,
            icon: getCategoryIcon(category),
        },
    };
}

/** Backwards-compatible helper: returns a transaction or null. */
export function createTransaction(formData, now = new Date()) {
    const result = createTransactionResult(formData, now);
    return result.ok ? result.transaction : null;
}
