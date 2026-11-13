import CircleProgress from "./CircleProgress.jsx";
import { formatCents, formatSignedCents } from "../../utils/transactions.js";

import "./SpendingSummary.css";

function createBalancePresentation(trace) {
    if (!trace) return null;

    const transactionCents = BigInt(trace.transactionAmountCents);
    const currentBalanceCents = BigInt(trace.currentBalanceCents);
    const absoluteTransactionCents = transactionCents < 0n
        ? -transactionCents
        : transactionCents;

    return {
        previousBalance: formatSignedCents(trace.previousBalanceCents),
        operator: transactionCents < 0n ? "−" : "+",
        transactionAmount: `$${formatCents(absoluteTransactionCents)}`,
        currentBalance: formatSignedCents(currentBalanceCents),
        isNegative: currentBalanceCents < 0n,
        accessibleText: `Previous balance ${formatSignedCents(trace.previousBalanceCents)}, ${transactionCents < 0n ? "expense" : "income"} of $${formatCents(absoluteTransactionCents)}, resulting balance ${formatSignedCents(currentBalanceCents)}.`,
    };
}

function buildChartSegments(items) {
    let currentAngle = -90;

    return items.map((item) => {
        const percentage = Math.min(100, Math.max(0, Number(item.percentage) || 0));
        const segment = { item: { ...item, percentage }, startAngle: currentAngle };
        currentAngle += (percentage / 100) * 360;
        return segment;
    });
}

function SpendingTitle() {
    return (
        <div className="spending-title">
            <span className="spending-title-icon" aria-hidden="true">
                <span />
                <span />
                <span />
            </span>
            <h2 id="spending-summary-title">Spending Summary</h2>
        </div>
    );
}

function LatestBalance({ trace }) {
    const balance = createBalancePresentation(trace);

    return (
        <section className="latest-balance" aria-label="Latest balance calculation">
            <div className="latest-balance-heading">
                <span className="latest-balance-indicator" aria-hidden="true">↗</span>
                <span>Latest Balance</span>
            </div>

            {balance ? (
                <>
                    <p className="latest-balance-sr-only" aria-live="polite">
                        {balance.accessibleText}
                    </p>
                    <div className="latest-balance-equation" aria-hidden="true">
                        <span className="balance-previous">{balance.previousBalance}</span>
                        <span className="balance-operator">{balance.operator}</span>
                        <span className="balance-change">{balance.transactionAmount}</span>
                        <span className="balance-equals">=</span>
                        <strong className={`balance-result${balance.isNegative ? " is-negative" : ""}`}>
                            {balance.currentBalance}
                        </strong>
                    </div>
                    <span className="latest-balance-caption">After your newest transaction</span>
                </>
            ) : (
                <p className="latest-balance-empty">Add a transaction to see your balance</p>
            )}
        </section>
    );
}

function TotalSpending({ amountCents }) {
    return (
        <div className="total-spending">
            <div className="total-spending-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                    <path
                        d="M5 9.5L22 5V9H25.5C27.4 9 29 10.6 29 12.5V25C29 26.7 27.7 28 26 28H7C5.3 28 4 26.7 4 25V12.5C4 11.2 4.4 10.2 5 9.5Z"
                        fill="#168BFF"
                    />
                    <path d="M5 10L22 5V9H25.5" stroke="#69B7FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 16H29V22H22C20.3 22 19 20.7 19 19C19 17.3 20.3 16 22 16Z" fill="#0B58C8" />
                    <circle cx="23" cy="19" r="1.3" fill="white" />
                </svg>
            </div>

            <div className="total-spending-info">
                <span className="total-spending-label">Total Spending</span>
                <strong className="total-spending-amount">
                    ${formatCents(amountCents, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </strong>
            </div>
        </div>
    );
}

export default function SpendingSummary({
    items = [],
    totalSpendingCents = "0",
    latestBalanceTrace = null,
}) {
    const safeItems = Array.isArray(items) ? items : [];
    const hasSpending = safeItems.length > 0;
    const segments = buildChartSegments(safeItems);

    return (
        <section className="spending-summary" aria-labelledby="spending-summary-title">
            <header className="spending-header">
                <SpendingTitle />
                <LatestBalance trace={latestBalanceTrace} />
            </header>

            <div className="spending-content">
                <div className="circle-chart">
                    <svg
                        viewBox="0 0 200 200"
                        className="circle-chart-svg"
                        role="img"
                        aria-label={hasSpending ? "Spending breakdown by category" : "No spending data available"}
                    >
                        {hasSpending ? (
                            segments.map(({ item, startAngle }) => (
                                <CircleProgress key={item.id} item={item} startAngle={startAngle} />
                            ))
                        ) : (
                            <>
                                <circle cx="100" cy="100" r="90" fill="#172E56" className="circle-empty" />
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
                    {hasSpending ? (
                        safeItems.map((item) => (
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
                                    ${formatCents(item.amountCents, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                </span>
                                <span className="circle-legend-percentage">{item.percentage}%</span>
                            </li>
                        ))
                    ) : (
                        <li className="circle-empty-message">No expenses yet</li>
                    )}
                </ul>
            </div>

            <footer className="summary-metrics">
                <TotalSpending amountCents={totalSpendingCents} />
            </footer>
        </section>
    );
}
