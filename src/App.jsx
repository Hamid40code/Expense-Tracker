import { useMemo } from "react";

import Transactions from "./components/Transactions/Transactions.jsx";
import RecentPurchases from "./components/RecentPurchases/RecentPurchases.jsx";
import CircleGroup from "./components/Summery/CircleGroup.jsx";
import { CATEGORY_COLORS } from "./constants/transactions.js";
import useTransactions from "./hooks/useTransactions.js";
import { getLatestTransactionBalanceTrace, getTransactionStats } from "./utils/transactionStats.js";

function App() {
    const {
        transactions,
        addTransaction,
        deleteTransaction,
        storageError,
    } = useTransactions();

    const stats = useMemo(
        () => getTransactionStats(transactions),
        [transactions]
    );

    const latestBalanceTrace = useMemo(
        () => getLatestTransactionBalanceTrace(transactions),
        [transactions]
    );

    const circleData = useMemo(
        () => stats.categoryStats.map((stat) => ({
            id: stat.category,
            label: stat.category,
            amount: stat.amount,
            amountCents: stat.amountCents,
            percentage: stat.percentage,
            color: Object.hasOwn(CATEGORY_COLORS, stat.category.toLowerCase())
                ? CATEGORY_COLORS[stat.category.toLowerCase()]
                : "#06B6D4",
        })),
        [stats.categoryStats]
    );

    return (
        <main className="app-shell">
            {storageError && (
                <div className="storage-warning" role="status">
                    <span aria-hidden="true">!</span>
                    <p>{storageError}</p>
                </div>
            )}

            <div className="dashboard-grid">
                <div className="dashboard-main-column">
                    <CircleGroup items={circleData} latestBalanceTrace={latestBalanceTrace} />
                    <RecentPurchases transactions={transactions} />
                </div>

                <aside className="dashboard-side-column">
                    <Transactions
                        transactions={transactions}
                        onAddTransaction={addTransaction}
                        onDeleteTransaction={deleteTransaction}
                    />
                </aside>
            </div>
        </main>
    );
}

export default App;
