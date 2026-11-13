import { memo } from "react";

import { DEFAULT_TRANSACTION_ICON } from "../../constants/transactions.js";
import {
    formatCents,
    formatTransactionTime,
    getTransactionCents,
} from "../../utils/transactions.js";

function PurchaseRow({ transaction }) {
    const transactionCents = getTransactionCents(transaction) ?? 0n;
    const amountCents = transactionCents < 0n ? -transactionCents : transactionCents;
    const transactionTime = formatTransactionTime(transaction.createdAt);

    return (
        <article className="purchase-row">
            <div className="purchase-row-icon" aria-hidden="true">
                {transaction.icon || DEFAULT_TRANSACTION_ICON}
            </div>

            <div className="purchase-row-info">
                <h3 title={transaction.name || "Untitled transaction"}>
                    {transaction.name || "Untitled transaction"}
                </h3>

                <p>
                    <span>{transaction.date || "Date unavailable"}</span>
                    {transactionTime && (
                        <>
                            <span className="purchase-row-separator" aria-hidden="true">·</span>
                            <time dateTime={transaction.createdAt}>{transactionTime}</time>
                        </>
                    )}
                    <span className="purchase-row-separator" aria-hidden="true">·</span>
                    <span>{transaction.category || "Other"}</span>
                </p>
            </div>

            <span className="purchase-row-amount">
                -${formatCents(amountCents)}
            </span>
        </article>
    );
}

export default memo(PurchaseRow);
