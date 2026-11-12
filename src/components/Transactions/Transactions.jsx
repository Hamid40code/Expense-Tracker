import { useState } from "react";

import TransactionItem from "./TransactionItem";
import TransactionModal from "./TransactionModal";

import "./Transactions.css";

export default function Transactions({
    transactions,
    setTransactions,
}) {
    const [showForm, setShowForm] = useState(false);

    function handleAddTransaction(transaction) {
        setTransactions((previousTransactions) => [
            transaction,
            ...previousTransactions,
        ]);

        setShowForm(false);
    }

    function handleDeleteTransaction(id) {
        setTransactions((previousTransactions) =>
            previousTransactions.filter(
                (transaction) => transaction.id !== id
            )
        );
    }

    return (
        <>
            <button
                type="button"
                className="add-transaction-btn"
                onClick={() => setShowForm(true)}
            >
                <span className="add-transaction-icon" aria-hidden="true">+</span>
                Add Transaction
            </button>

            <section className="transactions-section">
                <div className="transactions-header">
                    <div className="transactions-title">
                        <div className="transactions-title-icon">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="3"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                />
                                <path
                                    d="M7 8H17M7 12H17M7 16H12"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2>Your Transactions</h2>
                            <p>Manage your income and expenses</p>
                        </div>
                    </div>

                    <span className="transactions-count">
                        {transactions.length}
                    </span>
                </div>

                <div className="transactions-list">
                    {transactions.length === 0 ? (
                        <div className="transactions-empty">
                            <span>💳</span>
                            <h3>No transactions yet</h3>
                            <p>
                                Add your first transaction to get started.
                            </p>
                        </div>
                    ) : (
                        transactions.map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                onDelete={handleDeleteTransaction}
                            />
                        ))
                    )}
                </div>
            </section>

            {showForm && (
                <TransactionModal
                    onClose={() => setShowForm(false)}
                    onAdd={handleAddTransaction}
                />
            )}
        </>
    );
}
