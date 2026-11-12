import "./TransactionItem.css";

export default function TransactionItem({
  transaction,
  onDelete,
}) {
  const isIncome = transaction.amount > 0;
  const createdAt = transaction.createdAt ? new Date(transaction.createdAt) : null;
  const transactionTime = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div className="transaction-item">

      <div
        className={`transaction-icon ${
          isIncome ? "income-icon" : "expense-icon"
        }`}
      >
        <span>{transaction.icon}</span>
      </div>

      <div className="transaction-info">
        <h3>{transaction.name}</h3>

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

        <span
          className={`transaction-amount ${
            isIncome ? "income" : "expense"
          }`}
        >
          {isIncome ? "+" : "-"}$
          {Math.abs(transaction.amount).toFixed(2)}
        </span>

        <button
          type="button"
          className="transaction-delete"
          onClick={() => onDelete(transaction.id)}
          aria-label={`Delete ${transaction.name}`}
          title="Delete transaction"
        >
          ×
        </button>

      </div>

    </div>
  );
}
