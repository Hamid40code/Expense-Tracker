import { useEffect, useRef, useState } from "react";

import { EXPENSE_CATEGORIES, getCategoryDefinition, INCOME_ICON } from "../../lib/categories.js";
import "./TransactionModal.css";

export default function TransactionModal({ onClose, onAdd, returnFocusRef }) {
    const [formData, setFormData] = useState({
        name: "",
        category: "Food",
        amount: "",
        type: "expense",
    });
    const [formError, setFormError] = useState("");
    const dialogRef = useRef(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialogRef.current?.querySelector("#transaction-name")?.focus();

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== "Tab") return;

            const focusable = dialogRef.current?.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            const elements = Array.from(focusable || []);

            if (elements.length === 0) {
                event.preventDefault();
                dialogRef.current?.focus();
                return;
            }

            const first = elements[0];
            const last = elements[elements.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && (activeElement === first || !dialogRef.current?.contains(activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (activeElement === last || !dialogRef.current?.contains(activeElement))) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            returnFocusRef?.current?.focus();
        };
    }, [onClose, returnFocusRef]);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
        if (formError) setFormError("");
    }

    function handleSubmit(event) {
        event.preventDefault();

        const name = formData.name.trim();
        const amount = Number(formData.amount);

        if (!name) {
            setFormError("Enter a name.");
            dialogRef.current?.querySelector("#transaction-name")?.focus();
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setFormError("Enter an amount greater than 0.");
            dialogRef.current?.querySelector("#transaction-amount")?.focus();
            return;
        }

        const isIncome = formData.type === "income";
        const category = isIncome ? null : formData.category;
        const transaction = {
            id: crypto.randomUUID(),
            name,
            category,
            date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            createdAt: new Date().toISOString(),
            amount: isIncome ? amount : -amount,
            icon: isIncome ? INCOME_ICON : getCategoryDefinition(category).icon,
        };

        onAdd(transaction);
    }

    return (
        <div
            className="transaction-modal-overlay"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <form
                ref={dialogRef}
                className="transaction-form transaction-modal"
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="transaction-modal-title"
                tabIndex={-1}
                noValidate
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

                <label htmlFor="transaction-name">Transaction Name</label>
                <input
                    id="transaction-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Supermarket"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={formError === "Enter a name."}
                    aria-describedby={formError ? "transaction-form-error" : undefined}
                />
                {formError && (
                    <p id="transaction-form-error" className="transaction-form-error" role="alert">
                        {formError}
                    </p>
                )}

                <label htmlFor="transaction-category">Category</label>
                <select
                    id="transaction-category"
                    name="category"
                    value={formData.type === "income" ? "" : formData.category}
                    onChange={handleChange}
                    disabled={formData.type === "income"}
                    aria-describedby={formData.type === "income" ? "income-category-help" : undefined}
                >
                    {formData.type === "income" && (
                        <option value="">Not applicable</option>
                    )}
                    {EXPENSE_CATEGORIES.map((category) => (
                        <option key={category.label} value={category.label}>
                            {category.label}
                        </option>
                    ))}
                </select>
                {formData.type === "income" && (
                    <p id="income-category-help" className="transaction-category-help">
                        Category is unavailable for income transactions.
                    </p>
                )}

                <label htmlFor="transaction-type">Transaction Type</label>
                <select
                    id="transaction-type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>

                <label htmlFor="transaction-amount">Amount</label>
                <div className="transaction-amount-input">
                    <span>$</span>
                    <input
                        id="transaction-amount"
                        type="number"
                        name="amount"
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        aria-invalid={formError === "Enter an amount greater than 0."}
                        aria-describedby={formError ? "transaction-form-error" : undefined}
                    />
                </div>

                <div className="transaction-form-buttons">
                    <button type="button" className="cancel-transaction" onClick={onClose}>
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
