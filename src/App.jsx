import { useMemo, useState } from "react";

import Transactions from "./components/Transactions/Transactions.jsx";
import RecentPurchases from "./components/RecentPurchases/RecentPurchases.jsx";
import CircleGroup from "./components/Summary/CircleGroup.jsx";
import { getTransactions, saveTransactions } from "./lib/localStorage.js";
import { getTransactionStats } from "./lib/transactionStats.js";
import { getCategoryColor } from "./lib/categories.js";

function App() {
    const [loadedStorage] = useState(() => getTransactions());
    const [transactions, setTransactions] = useState(loadedStorage.transactions);

    const stats = useMemo(
        () => getTransactionStats(transactions),
        [transactions]
    );

    const circleData = stats.categoryStats.map((stat) => ({
        id: stat.category.toLowerCase(),
        label: stat.category,
        amount: stat.amount,
        percentage: stat.percentage,
        color: getCategoryColor(stat.category),
    }));

    return (
        <main className="app-shell">
            <div className="dashboard-grid">
                <div className="dashboard-main-column">
                    <CircleGroup
                        items={circleData}
                        balance={{
                            totalIncome: stats.totalIncome,
                            totalExpenses: stats.totalExpenses,
                            net: stats.net,
                        }}
                    />
                    <RecentPurchases transactions={transactions} />
                </div>

                <aside className="dashboard-side-column">
                    <Transactions
                        transactions={transactions}
                        setTransactions={setTransactions}
                        onTransactionsChange={saveTransactions}
                    />
                </aside>
            </div>
        </main>
    );
}

export default App;
