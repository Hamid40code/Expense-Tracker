
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

  // Close modal with Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  // Update form fields
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Submit transaction
  function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const amount = Number(formData.amount);

    if (
      !name ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
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
      amount:
        formData.type === "income"
          ? amount
          : -amount,
      icon: getCategoryIcon(formData.category),
    };

    onAdd(transaction);
  }

  // Category icons
  function getCategoryIcon(category) {
    const icons = {
      Food: "🛒",
      Shopping: "🛍️",
      Transport: "🚘",
      Entertainment: "🎮",
      Bills: "📄",
      Income: "💰",
      Other: "💳",
    };

    return icons[category] || "💳";
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
        {/* Header */}

        <div className="transaction-modal-header">
          <div className="transaction-modal-title">
            <div className="transaction-modal-icon">
              +
            </div>

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

        {/* Name */}

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

        {/* Category */}

        <label htmlFor="transaction-category">
          Category
        </label>

        <select
          id="transaction-category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Transport">Transport</option>
          <option value="Entertainment">
            Entertainment
          </option>
          <option value="Bills">Bills</option>
          <option value="Income">Income</option>
          <option value="Other">Other</option>
        </select>

        {/* Type */}

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

        {/* Amount */}

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

        {/* Buttons */}

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
