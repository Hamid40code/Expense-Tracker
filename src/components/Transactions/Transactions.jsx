
import { useState, useEffect, useMemo } from "react";

import {
    getTransactions,
    saveTransactions
} from "../../HookUp/localStorage.js";

import {
    getTransactionStats
} from "../../HookUp/transactionStats.js";

import TransactionItem from "./TransactionItem";
import TransactionModal from "./TransactionModal";

import "./Transactions.css";


export default function Transactions({ onStatsChange }) {

    // Load transactions from localStorage
    const [transactions, setTransactions] = useState(
        () => getTransactions()
    );

    // Modal state
    const [showForm, setShowForm] = useState(false);

    // Calculate statistics whenever transactions change
    const stats = useMemo(
        () => getTransactionStats(transactions),
        [transactions]
    );

    // Send statistics to App.jsx
    useEffect(() => {
        onStatsChange(stats);
    }, [stats, onStatsChange]);

    // Save transactions automatically
    useEffect(() => {
        saveTransactions(transactions);
    }, [transactions]);

    // Add transaction
    function handleAddTransaction(transaction) {
        setTransactions((prev) => [
            transaction,
            ...prev,
        ]);

        setShowForm(false);
    }

    // Delete transaction
    function handleDeleteTransaction(id) {
        setTransactions((prev) =>
            prev.filter(
                (transaction) => transaction.id !== id
            )
        );
    }

    // Open modal
    function handleOpenModal() {
        setShowForm(true);
    }

    // Close modal
    function handleCloseModal() {
        setShowForm(false);
    }

    return (
        <section className="transactions-section">

            {/* Header */}

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


            {/* Transaction list */}

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


            {/* Add transaction button */}

            <button
                type="button"
                className="add-transaction-btn"
                onClick={handleOpenModal}
            >
                <span className="add-transaction-icon">
                    +
                </span>

                Add New Transaction

            </button>


            {/* Transaction modal */}

            {showForm && (

                <TransactionModal
                    onClose={handleCloseModal}
                    onAdd={handleAddTransaction}
                />

            )}

        </section>
    );
}
