import CircleProgress from "./CircleProgress.jsx";
import { formatMoney, formatPercent } from "../../lib/format.js";
import { getCategoryColor as resolveCategoryColor } from "../../lib/categories.js";
import "./CircleGroup.css";

function getCategoryName(item) {
    return item.label || item.category || item.categoryName || item.name || "Other";
}

function CircleGroup({ items = [], balance = {} }) {
    const hasTransactions = items.length > 0;
    const circumference = 2 * Math.PI * 72;
    let currentOffset = 0;

    return (
        <section className="circle-group" aria-label="Spending summary">
            <header className="spending-header">
                <div className="spending-title">
                    <span className="spending-title-icon" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                    <h2>Spending Summary</h2>
                </div>
            </header>

            <div className="spending-balance" aria-label="Account balance">
                <div className="spending-balance-item">
                    <span>Income</span>
                    <strong className="balance-income">
                        {formatMoney(balance.totalIncome)}
                    </strong>
                </div>
                <div className="spending-balance-item">
                    <span>Expenses</span>
                    <strong>{formatMoney(balance.totalExpenses)}</strong>
                </div>
                <div className="spending-balance-item">
                    <span>Net</span>
                    <strong className={balance.net > 0 ? "balance-positive" : "balance-neutral-or-negative"}>
                        {formatMoney(balance.net)}
                    </strong>
                </div>
            </div>

            <div className="spending-content">
                <div className="circle-chart">
                    <svg
                        viewBox="0 0 200 200"
                        className="circle-chart-svg"
                        role="img"
                        aria-label={hasTransactions
                            ? "Expense breakdown by category"
                            : "No expenses yet"}
                    >
                        <circle
                            className="circle-track"
                            cx="100"
                            cy="100"
                            r="72"
                            fill="none"
                            strokeWidth="36"
                        />

                        {hasTransactions && items.map((item) => {
                            const percentage = Math.max(
                                0,
                                Math.min(100, Number(item.percentage) || 0)
                            );
                            const startOffset = currentOffset;
                            currentOffset += (percentage / 100) * circumference;

                            return (
                                <CircleProgress
                                    key={item.id}
                                    item={{ ...item, color: item.color || resolveCategoryColor(getCategoryName(item)) }}
                                    startOffset={startOffset}
                                    circumference={circumference}
                                />
                            );
                        })}

                        <text
                            x="100"
                            y="91"
                            textAnchor="middle"
                            className="circle-center-label"
                        >
                            Spent
                        </text>
                        <text
                            x="100"
                            y="116"
                            textAnchor="middle"
                            className="circle-center-amount"
                        >
                            {formatMoney(balance.totalExpenses)}
                        </text>
                    </svg>
                </div>

                <ul className="circle-legend">
                    {hasTransactions ? (
                        items.map((item) => (
                            <li className="circle-legend-item" key={item.id}>
                                <span
                                    className="circle-legend-color"
                                    style={{ backgroundColor: item.color || resolveCategoryColor(getCategoryName(item)) }}
                                />
                                <span
                                    className="circle-legend-label"
                                    title={getCategoryName(item)}
                                >
                                    {getCategoryName(item)}
                                </span>
                                <span className="circle-legend-amount">
                                    {formatMoney(item.amount)}
                                </span>
                                <span className="circle-legend-percentage">
                                    {formatPercent(item.percentage)}
                                </span>
                            </li>
                        ))
                    ) : (
                        <li className="circle-empty-message">No expenses yet</li>
                    )}
                </ul>
            </div>
        </section>
    );
}

export default CircleGroup;
