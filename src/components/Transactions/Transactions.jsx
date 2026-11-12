import { useCallback, useRef, useState } from "react";

import TransactionItem from "./TransactionItem.jsx";
import TransactionModal from "./TransactionModal.jsx";
import "./Transactions.css";

export default function Transactions({
    transactions,
    setTransactions,
    onTransactionsChange,
}) {
    const [showForm, setShowForm] = useState(false);
    const addButtonRef = useRef(null);

    const closeForm = useCallback(() => setShowForm(false), []);

    function handleAddTransaction(transaction) {
        const nextTransactions = [transaction, ...transactions];
        setTransactions(nextTransactions);
        onTransactionsChange?.(nextTransactions);
        closeForm();
    }

    function handleDeleteTransaction(id) {
        const nextTransactions = transactions.filter(
            (transaction) => transaction.id !== id
        );
        setTransactions(nextTransactions);
        onTransactionsChange?.(nextTransactions);
    }

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
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M7 8H17M7 12H17M7 16H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <h2>Your Transactions</h2>
                            <p>Manage your income and expenses</p>
                        </div>
                    </div>
                    <span className="transactions-count">{transactions.length}</span>
                </div>

                <div className="transactions-list">
                    {transactions.length === 0 ? (
                        <div className="transactions-empty">
                            <span>💳</span>
                            <h3>No transactions yet</h3>
                            <p>Add your first transaction to get started.</p>
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
                    onClose={closeForm}
                    onAdd={handleAddTransaction}
                    returnFocusRef={addButtonRef}
                />
            )}
        </>
    );
}
