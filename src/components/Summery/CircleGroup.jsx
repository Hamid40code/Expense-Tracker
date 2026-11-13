import CircleProgress from "./CircleProgress.jsx";
import "./CircleGroup.css";

import { formatCents } from "../../utils/transactions.js";

function CircleGroup({ items = [] }) {
    const hasTransactions = items.length > 0;
    const totalSpendingCents = items.reduce(
        (total, item) => total + (item.amountCents !== undefined
            ? (BigInt(item.amountCents) < 0n ? -BigInt(item.amountCents) : BigInt(item.amountCents))
            : BigInt(Math.max(0, Math.round(Math.abs(Number(item.amount) || 0) * 100)))),
        0n
    );

    let currentAngle = -90;
    const segments = items.map((item) => {
        const percentage = Math.max(0, Math.min(100, Number(item.percentage) || 0));
        const segment = {
            item: { ...item, percentage },
            startAngle: currentAngle,
        };

        currentAngle += (percentage / 100) * 360;
        return segment;
    });

    return (
        <section className="circle-group" aria-label="Spending summary">
            <header className="spending-header">
                <div className="spending-title">
                    <span className="spending-title-icon" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                    </span>
                    <h2>Spending Summary</h2>
                </div>
            </header>

            <div className="spending-content">
                <div className="circle-chart">
                    <svg
                        viewBox="0 0 200 200"
                        className="circle-chart-svg"
                        role="img"
                        aria-label={hasTransactions
                            ? "Spending breakdown by category"
                            : "No spending data available"}
                    >
                        {hasTransactions ? (
                            segments.map(({ item, startAngle }) => (
                                <CircleProgress
                                    key={item.id}
                                    item={item}
                                    startAngle={startAngle}
                                />
                            ))
                        ) : (
                            <>
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="#172E56"
                                    className="circle-empty"
                                />
                                <text
                                    x="100"
                                    y="100"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="circle-empty-label"
                                >
                                    0%
                                </text>
                            </>
                        )}
                    </svg>
                </div>

                <ul className="circle-legend">
                    {hasTransactions ? (
                        items.map((item) => (
                            <li className="circle-legend-item" key={item.id}>
                                <span
                                    className="circle-legend-color"
                                    style={{ backgroundColor: item.color }}
                                    aria-hidden="true"
                                />
                                <span className="circle-legend-label" title={item.label}>
                                    {item.label}
                                </span>
                                <span className="circle-legend-amount">
                                    ${formatCents(item.amountCents ?? Math.round((Number(item.amount) || 0) * 100), { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                </span>
                                <span className="circle-legend-percentage">
                                    {Number(item.percentage || 0)}%
                                </span>
                            </li>
                        ))
                    ) : (
                        <li className="circle-empty-message">No expenses yet</li>
                    )}
                </ul>
            </div>

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
                    <span className="total-spending-label">Total Spending</span>
                    <strong className="total-spending-amount">
                        ${formatCents(totalSpendingCents, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </strong>
                </div>
            </footer>
        </section>
    );
}

export default CircleGroup;
