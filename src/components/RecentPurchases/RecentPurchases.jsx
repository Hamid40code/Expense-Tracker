import { useMemo, useRef, useState } from "react";

import TransactionListIcon from "../shared/TransactionListIcon.jsx";
import useEscapeKey from "../../hooks/useEscapeKey.js";
import { isExpense } from "../../utils/transactions.js";
import PurchaseHistoryDialog from "./PurchaseHistoryDialog.jsx";
import PurchaseRow from "./PurchaseRow.jsx";

import "./RecentPurchases.css";

const PREVIEW_LIMIT = 4;

export default function RecentPurchases({ transactions = [] }) {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const [showAll, setShowAll] = useState(false);
    const viewAllButtonRef = useRef(null);

    const purchases = useMemo(
        () => safeTransactions.filter(isExpense),
        [safeTransactions]
    );

    const previewPurchases = purchases.slice(0, PREVIEW_LIMIT);
    const closeHistory = () => {
        setShowAll(false);
        viewAllButtonRef.current?.focus();
    };

    useEscapeKey(closeHistory, showAll);

    return (
        <>
            <section
                className="recent-purchases"
                aria-labelledby="recent-purchases-title"
            >
                <header className="recent-purchases-header">
                    <div className="recent-purchases-heading">
                        <span className="recent-purchases-title-icon" aria-hidden="true">
                            <TransactionListIcon size={19} />
                        </span>

                        <h2 id="recent-purchases-title">Recent Purchases</h2>
                    </div>

                    <button
                        ref={viewAllButtonRef}
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
                <PurchaseHistoryDialog
                    purchases={purchases}
                    onClose={closeHistory}
                />
            )}
        </>
    );
}
