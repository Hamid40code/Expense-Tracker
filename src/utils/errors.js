/**
 * Centralized application errors.
 * Keep stable codes here and map them to safe, user-facing messages in one place.
 * Do not put raw storage contents, user input, or internal exception details in messages.
 */
export const ERROR_CODES = Object.freeze({
    APP_ROOT_MISSING: "APP_ROOT_MISSING",
    FORM_INVALID: "FORM_INVALID",
    TRANSACTION_NAME_REQUIRED: "TRANSACTION_NAME_REQUIRED",
    TRANSACTION_NAME_TOO_LONG: "TRANSACTION_NAME_TOO_LONG",
    TRANSACTION_AMOUNT_REQUIRED: "TRANSACTION_AMOUNT_REQUIRED",
    TRANSACTION_AMOUNT_INVALID: "TRANSACTION_AMOUNT_INVALID",
    TRANSACTION_AMOUNT_MUST_BE_POSITIVE: "TRANSACTION_AMOUNT_MUST_BE_POSITIVE",
    TRANSACTION_AMOUNT_TOO_SMALL: "TRANSACTION_AMOUNT_TOO_SMALL",
    TRANSACTION_AMOUNT_TOO_LARGE: "TRANSACTION_AMOUNT_TOO_LARGE",
    TRANSACTION_TYPE_INVALID: "TRANSACTION_TYPE_INVALID",
    TRANSACTION_ADD_FAILED: "TRANSACTION_ADD_FAILED",
    STORAGE_UNAVAILABLE: "storage-unavailable",
    STORAGE_READ_FAILED: "storage-read-failed",
    STORAGE_DATA_CORRUPTED: "storage-data-corrupted",
    STORAGE_INVALID_RECORDS: "storage-invalid-records",
    STORAGE_QUOTA_EXCEEDED: "quota-exceeded",
    STORAGE_SERIALIZATION_FAILED: "storage-serialization-failed",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
});

const ERROR_MESSAGES = Object.freeze({
    [ERROR_CODES.APP_ROOT_MISSING]: 'The application could not start because the "root" element is missing from the page.',
    [ERROR_CODES.FORM_INVALID]: "Please check the transaction details and try again.",
    [ERROR_CODES.TRANSACTION_NAME_REQUIRED]: "Enter a transaction name.",
    [ERROR_CODES.TRANSACTION_NAME_TOO_LONG]: "The transaction name must be 120 characters or fewer.",
    [ERROR_CODES.TRANSACTION_AMOUNT_REQUIRED]: "Enter an amount.",
    [ERROR_CODES.TRANSACTION_AMOUNT_INVALID]: "Enter a valid amount using digits and an optional decimal point.",
    [ERROR_CODES.TRANSACTION_AMOUNT_MUST_BE_POSITIVE]: "The amount must be greater than zero.",
    [ERROR_CODES.TRANSACTION_AMOUNT_TOO_SMALL]: "The amount must round to at least $0.01.",
    [ERROR_CODES.TRANSACTION_AMOUNT_TOO_LARGE]: "The amount is too large. Enter a smaller value.",
    [ERROR_CODES.TRANSACTION_TYPE_INVALID]: "Choose either income or expense.",
    [ERROR_CODES.TRANSACTION_ADD_FAILED]: "The transaction could not be added. Please review the details and try again.",
    [ERROR_CODES.STORAGE_UNAVAILABLE]: "Browser storage is unavailable. Changes will only be kept for this session.",
    [ERROR_CODES.STORAGE_READ_FAILED]: "Saved transactions could not be read. Your current session will start without them.",
    [ERROR_CODES.STORAGE_DATA_CORRUPTED]: "Saved transaction data could not be read. Your current session will start without it.",
    [ERROR_CODES.STORAGE_INVALID_RECORDS]: "Some saved transactions were invalid and have been skipped.",
    [ERROR_CODES.STORAGE_QUOTA_EXCEEDED]: "Browser storage is full. Changes will only be kept for this session.",
    [ERROR_CODES.STORAGE_SERIALIZATION_FAILED]: "Transactions could not be prepared for saving. Changes will only be kept for this session.",
    [ERROR_CODES.UNKNOWN_ERROR]: "Something went wrong. Please try again.",
});

/** Return a safe message for an error code, result object, or Error instance. */
export function getErrorMessage(errorOrCode, fallbackCode = ERROR_CODES.UNKNOWN_ERROR) {
    const code = typeof errorOrCode === "string"
        ? errorOrCode
        : errorOrCode?.code || errorOrCode?.errorCode || errorOrCode?.reason;

    if (typeof code === "string" && Object.hasOwn(ERROR_MESSAGES, code)) {
        return ERROR_MESSAGES[code];
    }

    if (typeof fallbackCode === "string" && Object.hasOwn(ERROR_MESSAGES, fallbackCode)) {
        return ERROR_MESSAGES[fallbackCode];
    }

    return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}

/** Create an Error carrying a stable application code and an optional cause. */
export function createAppError(code, cause) {
    const error = new Error(getErrorMessage(code));
    error.name = "AppError";
    error.code = typeof code === "string" && Object.hasOwn(ERROR_MESSAGES, code)
        ? code
        : ERROR_CODES.UNKNOWN_ERROR;

    if (cause !== undefined) {
        error.cause = cause;
    }

    return error;
}

/** Log technical detail for developers without exposing it in the UI. */
export function reportAppError(error, context = "Application error") {
    if (typeof console === "undefined" || typeof console.error !== "function") return;

    console.error(`[${context}]`, error);
}
