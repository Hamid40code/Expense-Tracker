
import CircleProgress from "./CircleProgress";
import "./CircleGroup.css";

const CATEGORY_COLORS = {
    "food & drinks": "#168BFF",
    "shopping": "#12D66B",
    "entertainment": "#FFAA00",
    "others": "#922BFF",
    "other": "#922BFF",
};

function getCategoryName(item) {
    return (
        item.label ||
        item.category ||
        item.categoryName ||
        item.name ||
        "Other"
    );
}

function getCategoryColor(item) {
    const category = getCategoryName(item).toLowerCase();

    return CATEGORY_COLORS[category] || item.color || "#168BFF";
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString("en-US", {
        maximumFractionDigits: 2,
    });
}

function CircleGroup({ items = [] }) {
    let currentAngle = -90;

    const hasTransactions = items.length > 0;

    // Calculate total spending from all category amounts.
    const totalSpending = items.reduce(
        (total, item) => total + Math.abs(Number(item.amount) || 0),
        0
    );

    return (
        <section className="circle-group" aria-label="Spending summary">

            {/* Header */}
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

            {/* Chart and category legend */}
            <div className="spending-content">

                {/* Circular chart */}
                <div className="circle-chart">
                    <svg
                        viewBox="0 0 200 200"
                        className="circle-chart-svg"
                        role="img"
                        aria-label={
                            hasTransactions
                                ? "Spending breakdown by category"
                                : "No spending data available"
                        }
                    >
                        {!hasTransactions ? (
                            <circle
                                cx="100"
                                cy="100"
                                r="90"
                                fill="#172E56"
                                className="circle-empty"
                            />
                        ) : (
                            items.map((item) => {
                                const startAngle = currentAngle;
                                const percentage = Math.max(
                                    0,
                                    Math.min(100, Number(item.percentage) || 0)
                                );

                                currentAngle += (percentage / 100) * 360;

                                const coloredItem = {
                                    ...item,
                                    color: getCategoryColor(item),
                                };

                                return (
                                    <CircleProgress
                                        key={item.id}
                                        item={coloredItem}
                                        startAngle={startAngle}
                                    />
                                );
                            })
                        )}

                        {!hasTransactions && (
                            <text
                                x="100"
                                y="100"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="circle-empty-label"
                            >
                                0%
                            </text>
                        )}
                    </svg>
                </div>

                {/* Category legend */}
                <ul className="circle-legend">
                    {hasTransactions ? (
                        items.map((item) => (
                            <li className="circle-legend-item" key={item.id}>
                                <span
                                    className="circle-legend-color"
                                    style={{
                                        backgroundColor: getCategoryColor(item),
                                    }}
                                />

                                <span
                                    className="circle-legend-label"
                                    title={getCategoryName(item)}
                                >
                                    {getCategoryName(item)}
                                </span>

                                <span className="circle-legend-amount">
                                    ${formatMoney(item.amount)}
                                </span>

                                <span className="circle-legend-percentage">
                                    {Number(item.percentage || 0)}%
                                </span>
                            </li>
                        ))
                    ) : (
                        <li className="circle-empty-message">
                            No expenses yet
                        </li>
                    )}
                </ul>
            </div>

            {/* Total spending */}
            <footer className="total-spending">
                <div className="total-spending-icon" aria-hidden="true">
                    <svg viewBox="0 0 32 32" fill="none">
                        <path
                            d="M5 9.5L22 5V9H25.5C27.4 9 29 10.6 29 12.5V25C29 26.7 27.7 28 26 28H7C5.3 28 4 26.7 4 25V12.5C4 11.2 4.4 10.2 5 9.5Z"
                            fill="#168BFF"
                        />
                        <path
                            d="M5 10L22 5V9H25.5"
                            stroke="#69B7FF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M22 16H29V22H22C20.3 22 19 20.7 19 19C19 17.3 20.3 16 22 16Z"
                            fill="#0B58C8"
                        />
                        <circle cx="23" cy="19" r="1.3" fill="white" />
                    </svg>
                </div>

                <div className="total-spending-info">
                    <span className="total-spending-label">
                        Total Spending
                    </span>

                    <strong className="total-spending-amount">
                        ${formatMoney(totalSpending)}
                    </strong>
                </div>
            </footer>
        </section>
    );
}

export default CircleGroup;
