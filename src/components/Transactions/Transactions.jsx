import { useMemo, useRef, useState } from "react";

import TransactionListIcon from "../shared/TransactionListIcon.jsx";
import TransactionItem from "./TransactionItem.jsx";
import TransactionModal from "./TransactionModal.jsx";

import "./Transactions.css";

export default function Transactions({
    transactions = [],
    onAddTransaction,
    onDeleteTransaction,
}) {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const [showForm, setShowForm] = useState(false);
    const [visibleCount, setVisibleCount] = useState(100);
    const addButtonRef = useRef(null);
    const visibleTransactions = useMemo(
        () => safeTransactions.slice(0, visibleCount),
        [safeTransactions, visibleCount]
    );

    return (
        <>
            <button
                ref={addButtonRef}
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
                        <div className="transactions-title-icon" aria-hidden="true">
                            <TransactionListIcon size={22} />
                        </div>

                        <div>
                            <h2>Your Transactions</h2>
                            <p>Manage your income and expenses</p>
                        </div>
                    </div>

                    <span className="transactions-count">
                        {safeTransactions.length}
                    </span>
                </div>

                <div className="transactions-list">
                    {safeTransactions.length === 0 ? (
                        <div className="transactions-empty">
                            <span aria-hidden="true">💳</span>
                            <h3>No transactions yet</h3>
                            <p>Add your first transaction to get started.</p>
                        </div>
                    ) : (
                        <>
                            {visibleTransactions.map((transaction) => (
                                <TransactionItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    onDelete={onDeleteTransaction}
                                />
                            ))}
                            {visibleCount < safeTransactions.length && (
                                <button
                                    type="button"
                                    className="transactions-load-more"
                                    onClick={() => setVisibleCount((count) => count + 100)}
                                >
                                    Show next 100 ({safeTransactions.length - visibleCount} remaining)
                                </button>
                            )}
                        </>
                    )}
                </div>
            </section>

            {showForm && (
                <TransactionModal
                    onClose={() => {
                        setShowForm(false);
                        addButtonRef.current?.focus();
                    }}
                    onAdd={(transaction) => {
                        const wasAdded = onAddTransaction(transaction);
                        if (wasAdded !== false) {
                            setShowForm(false);
                            return true;
                        }
                        return false;
                    }}
                />
            )}
        </>
    );
}
