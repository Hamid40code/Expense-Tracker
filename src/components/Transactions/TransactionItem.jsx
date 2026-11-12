import "./TransactionItem.css";

export default function TransactionItem({
  transaction,
  onDelete,
}) {
  const isIncome = transaction.amount > 0;

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

        <p>{transaction.date}</p>
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
