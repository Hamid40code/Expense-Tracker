import { memo } from "react";

import { DEFAULT_TRANSACTION_ICON } from "../../constants/transactions.js";
import { formatCents, formatTransactionTime, getTransactionCents } from "../../utils/transactions.js";
import "./TransactionItem.css";

function TransactionItem({ transaction, onDelete }) {
    const amountCents = getTransactionCents(transaction) ?? 0n;
    const isIncome = amountCents > 0n;
    const transactionTime = formatTransactionTime(transaction.createdAt);
    const transactionName = transaction.name || "Untitled transaction";

    return (
        <article className="transaction-item">
            <div
                className={`transaction-icon ${isIncome ? "income-icon" : "expense-icon"}`}
                aria-hidden="true"
            >
                <span>{transaction.icon || DEFAULT_TRANSACTION_ICON}</span>
            </div>

            <div className="transaction-info">
                <h3>{transactionName}</h3>

                <p>
                    <span>{transaction.date || "Date unavailable"}</span>
                    {transactionTime && (
                        <>
                            <span aria-hidden="true"> · </span>
                            <time dateTime={transaction.createdAt}>{transactionTime}</time>
                        </>
                    )}
                </p>
            </div>

            <div className="transaction-right">
                <span className={isIncome ? "transaction-amount income" : "transaction-amount"}>
                    {isIncome ? "+" : "-"}${formatCents(amountCents < 0n ? -amountCents : amountCents)}
                </span>

                <button
                    type="button"
                    className="transaction-delete"
                    onClick={() => onDelete(transaction.id)}
                    aria-label={`Delete ${transactionName}`}
                    title="Delete transaction"
                >
                    ×
                </button>
            </div>
        </article>
    );
}

export default memo(TransactionItem);
