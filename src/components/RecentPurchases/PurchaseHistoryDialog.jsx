import { useRef, useState } from "react";

import useModalAccessibility from "../../hooks/useModalAccessibility.js";
import PurchaseRow from "./PurchaseRow.jsx";

const PAGE_SIZE = 100;

export default function PurchaseHistoryDialog({ purchases, onClose }) {
    const dialogRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const visiblePurchases = purchases.slice(0, visibleCount);

    useModalAccessibility(dialogRef);

    return (
        <div
            className="purchases-overlay"
            onClick={onClose}
        >
            <section
                ref={dialogRef}
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
                        <h2 id="purchases-page-title">All Purchases</h2>
                        <p className="purchases-page-description">
                            {purchases.length} {purchases.length === 1 ? "purchase" : "purchases"} recorded
                        </p>
                    </div>

                    <button
                        type="button"
                        className="purchases-page-close"
                        onClick={onClose}
                        aria-label="Close purchase history"
                    >
                        ×
                    </button>
                </header>

                <div className="purchases-page-list">
                    {purchases.length > 0 ? (
                        <>
                            {visiblePurchases.map((transaction) => (
                                <PurchaseRow
                                    key={transaction.id}
                                    transaction={transaction}
                                />
                            ))}
                            {visibleCount < purchases.length && (
                                <button
                                    type="button"
                                    className="purchases-load-more"
                                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                                >
                                    Show next {PAGE_SIZE} ({purchases.length - visibleCount} remaining)
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="purchases-page-empty">
                            No purchases have been recorded yet.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
