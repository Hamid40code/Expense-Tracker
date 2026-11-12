import { useEffect, useState } from "react";

import "./TransactionModal.css";

export default function TransactionModal({
    onClose,
    onAdd,
}) {
    const [formData, setFormData] = useState({
        name: "",
        category: "Food",
        amount: "",
        type: "expense",
    });

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    }

    function getCategoryIcon(category) {
        const icons = {
            Food: "🍔",
            Shopping: "🛍️",
            Transport: "🚘",
            Entertainment: "🎮",
            Bills: "📄",
            Other: "💳",
        };

        return icons[category] || "💳";
    }

    function handleSubmit(event) {
        event.preventDefault();

        const name = formData.name.trim();
        const amount = Number(formData.amount);

        if (!name || !Number.isFinite(amount) || amount <= 0) {
            return;
        }

        const transaction = {
            id: crypto.randomUUID(),
            name,
            category: formData.category,
            date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            // ISO timestamp gives the Recent Purchases section an exact
            // creation time for reliable newest-first ordering.
            createdAt: new Date().toISOString(),
            amount: formData.type === "income" ? amount : -amount,
            icon: getCategoryIcon(formData.category),
        };

        onAdd(transaction);
    }

    return (
        <div
            className="transaction-modal-overlay"
            onClick={onClose}
        >
            <form
                className="transaction-form transaction-modal"
                onSubmit={handleSubmit}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="transaction-modal-header">
                    <div className="transaction-modal-title">
                        <div className="transaction-modal-icon">+</div>

                        <div>
                            <h3>New Transaction</h3>
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

                <label htmlFor="transaction-name">
                    Transaction Name
                </label>

                <input
                    id="transaction-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Supermarket"
                    value={formData.name}
                    onChange={handleChange}
                    autoFocus
                    required
                />

                <label htmlFor="transaction-category">
                    Category
                </label>

                <select
                    id="transaction-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={formData.type === "income"}
                    aria-describedby={formData.type === "income" ? "income-category-help" : undefined}
                >
                    <option value="Food">Food</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Bills">Bills</option>
                    <option value="Other">Other</option>
                </select>
                {formData.type === "income" && (
                    <p id="income-category-help" className="transaction-category-help">
                        Category is unavailable for income transactions.
                    </p>
                )}

                <label htmlFor="transaction-type">
                    Transaction Type
                </label>

                <select
                    id="transaction-type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>

                <label htmlFor="transaction-amount">
                    Amount
                </label>

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
                        required
                    />
                </div>

                <div className="transaction-form-buttons">
                    <button
                        type="button"
                        className="cancel-transaction"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="save-transaction"
                    >
                        Add Transaction
                    </button>
                </div>
            </form>
        </div>
    );
}
