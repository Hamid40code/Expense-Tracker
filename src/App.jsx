import { useMemo } from "react";

import RecentPurchases from "./components/RecentPurchases/RecentPurchases.jsx";
import SpendingSummary from "./components/Summary/SpendingSummary.jsx";
import Transactions from "./components/Transactions/Transactions.jsx";
import { getCategoryColor } from "./constants/transactions.js";
import useTransactions from "./hooks/useTransactions.js";
import {
    getLatestTransactionBalanceTrace,
    getTransactionStats,
} from "./utils/transactionStats.js";

function App() {
    const {
        transactions,
        addTransaction,
        deleteTransaction,
        storageError,
    } = useTransactions();

    const transactionStats = useMemo(
        () => getTransactionStats(transactions),
        [transactions]
    );

    const latestBalanceTrace = useMemo(
        () => getLatestTransactionBalanceTrace(transactions),
        [transactions]
    );

    const categoryChartItems = useMemo(
        () => transactionStats.categoryStats.map((category) => ({
            id: category.category,
            label: category.category,
            amountCents: category.amountCents,
            percentage: category.percentage,
            color: getCategoryColor(category.category),
        })),
        [transactionStats.categoryStats]
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
                    <SpendingSummary
                        items={categoryChartItems}
                        totalSpendingCents={transactionStats.totalExpensesCents}
                        latestBalanceTrace={latestBalanceTrace}
                    />
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
