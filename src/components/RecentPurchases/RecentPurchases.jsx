import { useEffect, useMemo, useState } from "react";

import "./RecentPurchases.css";

const PREVIEW_LIMIT = 4;

function getTransactionTime(transaction) {
    // New transactions have an exact ISO timestamp.
    if (transaction.createdAt) {
        const createdAt = Date.parse(transaction.createdAt);

        if (Number.isFinite(createdAt)) {
            return createdAt;
        }
    }

    // Older saved transactions only have a formatted date.
    const legacyDate = Date.parse(transaction.date || "");

    return Number.isFinite(legacyDate) ? legacyDate : 0;
}

function sortNewestFirst(transactions) {
    return transactions
        .map((transaction, originalIndex) => ({
            transaction,
            originalIndex,
            timestamp: getTransactionTime(transaction),
        }))
        .sort((first, second) => {
            const timeDifference = second.timestamp - first.timestamp;

            // Keep the existing array order for transactions on the same
            // date, which also preserves newest-first order for legacy data.
            return timeDifference || first.originalIndex - second.originalIndex;
        })
        .map(({ transaction }) => transaction);
}

function PurchaseRow({ transaction }) {
    const amount = Math.abs(Number(transaction.amount) || 0);
    const createdAt = transaction.createdAt ? new Date(transaction.createdAt) : null;
    const transactionTime = createdAt && !Number.isNaN(createdAt.getTime())
        ? createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : null;

    return (
        <article className="purchase-row">
            <div className="purchase-row-icon" aria-hidden="true">
                {transaction.icon || "💳"}
            </div>

            <div className="purchase-row-info">
                <h3 title={transaction.name}>
                    {transaction.name || "Untitled transaction"}
                </h3>

                <p>
                    <span>{transaction.date || "Date unavailable"}</span>
                    {transactionTime && (
                        <>
                            <span className="purchase-row-separator">·</span>
                            <time dateTime={transaction.createdAt}>{transactionTime}</time>
                        </>
                    )}
                    <span className="purchase-row-separator">·</span>
                    <span>{transaction.category || "Other"}</span>
                </p>
            </div>

            <span className="purchase-row-amount">
                -${amount.toFixed(2)}
            </span>
        </article>
    );
}

export default function RecentPurchases({ transactions = [] }) {
    const [showAll, setShowAll] = useState(false);

    // Purchases means expense transactions; income is not shown here.
    const purchases = useMemo(() => {
        const expenses = transactions.filter(
            (transaction) => Number(transaction.amount) < 0
        );

        return sortNewestFirst(expenses);
    }, [transactions]);

    useEffect(() => {
        if (!showAll) return undefined;

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setShowAll(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showAll]);

    const previewPurchases = purchases.slice(0, PREVIEW_LIMIT);

    return (
        <>
            <section
                className="recent-purchases"
                aria-labelledby="recent-purchases-title"
            >
                <header className="recent-purchases-header">
                    <div className="recent-purchases-heading">
                        <span className="recent-purchases-title-icon">
                            <svg
                                width="19"
                                height="19"
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
                        </span>

                        <h2 id="recent-purchases-title">
                            Recent Purchases
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="recent-purchases-view-all"
                        onClick={() => setShowAll(true)}
                        disabled={purchases.length === 0}
                    >
                        View All
                        <span aria-hidden="true">→</span>
                    </button>
                </header>

                <div className="recent-purchases-list">
                    {previewPurchases.length > 0 ? (
                        previewPurchases.map((transaction) => (
                            <PurchaseRow
                                key={transaction.id}
                                transaction={transaction}
                            />
                        ))
                    ) : (
                        <div className="recent-purchases-empty">
                            <span aria-hidden="true">🧾</span>
                            <p>Your purchases will appear here.</p>
                        </div>
                    )}
                </div>
            </section>

            {showAll && (
                <div
                    className="purchases-overlay"
                    onClick={() => setShowAll(false)}
                >
                    <section
                        className="purchases-page"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="purchases-page-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <header className="purchases-page-header">
                            <div>
                                <p className="purchases-page-eyebrow">
                                    TRANSACTION HISTORY
                                </p>
                                <h2 id="purchases-page-title">
                                    All Purchases
                                </h2>
                                <p className="purchases-page-description">
                                    {purchases.length}{" "}
                                    {purchases.length === 1
                                        ? "purchase"
                                        : "purchases"}{" "}
                                    recorded
                                </p>
                            </div>

                            <button
                                type="button"
                                className="purchases-page-close"
                                onClick={() => setShowAll(false)}
                                aria-label="Close purchase history"
                            >
                                ×
                            </button>
                        </header>

                        <div className="purchases-page-list">
                            {purchases.length > 0 ? (
                                purchases.map((transaction) => (
                                    <PurchaseRow
                                        key={transaction.id}
                                        transaction={transaction}
                                    />
                                ))
                            ) : (
                                <div className="purchases-page-empty">
                                    No purchases have been recorded yet.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
