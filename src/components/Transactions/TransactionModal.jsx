import { useRef, useState } from "react";

import {
    DEFAULT_CATEGORY,
    TRANSACTION_CATEGORIES,
    TRANSACTION_TYPES,
} from "../../constants/transactions.js";
import useEscapeKey from "../../hooks/useEscapeKey.js";
import useModalAccessibility from "../../hooks/useModalAccessibility.js";
import { createTransactionResult } from "../../utils/transactions.js";
import { ERROR_CODES, getErrorMessage, reportAppError } from "../../utils/errors.js";

import "./TransactionModal.css";

const INITIAL_FORM_DATA = {
    name: "",
    category: "Food",
    amount: "",
    type: TRANSACTION_TYPES.EXPENSE,
};

export default function TransactionModal({ onClose, onAdd }) {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState({});
    const dialogRef = useRef(null);
    const isIncome = formData.type === TRANSACTION_TYPES.INCOME;

    useEscapeKey(onClose);
    useModalAccessibility(dialogRef);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
            ...(name === "type" && value === TRANSACTION_TYPES.INCOME
                ? { category: DEFAULT_CATEGORY }
                : {}),
        }));
        setErrors((currentErrors) => {
            const nextErrors = { ...currentErrors };
            delete nextErrors[name];
            delete nextErrors.form;
            return nextErrors;
        });
    }

    function handleSubmit(event) {
        event.preventDefault();

        const result = createTransactionResult({
            ...formData,
            category: formData.category || DEFAULT_CATEGORY,
        });

        if (!result.ok) {
            setErrors(Object.fromEntries(
                Object.entries(result.errors).map(([field, code]) => [field, getErrorMessage(code)])
            ));
            return;
        }

        if (typeof onAdd !== "function") {
            setErrors({ form: getErrorMessage(ERROR_CODES.TRANSACTION_ADD_FAILED) });
            return;
        }

        try {
            const wasAdded = onAdd(result.transaction);
            if (wasAdded === false) {
                setErrors({ form: getErrorMessage(ERROR_CODES.TRANSACTION_ADD_FAILED) });
            }
        } catch (error) {
            reportAppError(error, "Could not add transaction");
            setErrors({ form: getErrorMessage(ERROR_CODES.TRANSACTION_ADD_FAILED) });
        }
    }

    return (
        <div
            className="transaction-modal-overlay"
            onClick={onClose}
        >
            <form
                ref={dialogRef}
                className="transaction-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="transaction-modal-title"
                onSubmit={handleSubmit}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="transaction-modal-header">
                    <div className="transaction-modal-title">
                        <div className="transaction-modal-icon" aria-hidden="true">+</div>

                        <div>
                            <h3 id="transaction-modal-title">New Transaction</h3>
                            <p>Add a new income or expense</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="transaction-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {(errors.form || errors.type) && (
                    <p className="transaction-form-error" role="alert">
                        {errors.form || errors.type}
                    </p>
                )}

                <label htmlFor="transaction-name">Transaction Name</label>
                <input
                    id="transaction-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Supermarket"
                    value={formData.name}
                    onChange={handleChange}
                    autoFocus
                    maxLength={120}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "transaction-name-error" : undefined}
                    required
                />
                {errors.name && (
                    <p id="transaction-name-error" className="transaction-field-error" role="alert">
                        {errors.name}
                    </p>
                )}

                <label htmlFor="transaction-category">Category</label>
                <select
                    id="transaction-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isIncome}
                    aria-describedby={isIncome ? "income-category-help" : undefined}
                >
                    {TRANSACTION_CATEGORIES.map(({ value }) => (
                        <option key={value} value={value}>{value}</option>
                    ))}
                </select>
                {isIncome && (
                    <p id="income-category-help" className="transaction-category-help">
                        Income transactions are saved under Other.
                    </p>
                )}

                <label htmlFor="transaction-type">Transaction Type</label>
                <select
                    id="transaction-type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.type)}
                >
                    <option value={TRANSACTION_TYPES.EXPENSE}>Expense</option>
                    <option value={TRANSACTION_TYPES.INCOME}>Income</option>
                </select>

                <label htmlFor="transaction-amount">Amount</label>
                <div className="transaction-amount-input">
                    <span aria-hidden="true">$</span>
                    <input
                        id="transaction-amount"
                        type="text"
                        inputMode="decimal"
                        name="amount"
                        placeholder="0.00"
                        maxLength={32}
                        value={formData.amount}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.amount)}
                        aria-describedby={errors.amount ? "transaction-amount-error" : undefined}
                        required
                    />
                </div>
                {errors.amount && (
                    <p id="transaction-amount-error" className="transaction-field-error" role="alert">
                        {errors.amount}
                    </p>
                )}

                <div className="transaction-form-buttons">
                    <button
                        type="button"
                        className="cancel-transaction"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button type="submit" className="save-transaction">
                        Add Transaction
                    </button>
                </div>
            </form>
        </div>
    );
}
