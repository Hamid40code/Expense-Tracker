import { useEffect, useMemo, useState } from "react";

import Transactions from "./components/Transactions/Transactions.jsx";
import RecentPurchases from "./components/RecentPurchases/RecentPurchases.jsx";
import CircleGroup from "./components/Summery/CircleGroup.jsx";

import {
    getTransactions,
    saveTransactions,
} from "./HookUp/localStorage.js";

import {
    getTransactionStats,
} from "./HookUp/transactionStats.js";

const CATEGORY_COLORS = {
    food: "#3B82F6",
    "food & drinks": "#3B82F6",
    shopping: "#F97316",
    transport: "#14B8A6",
    entertainment: "#A855F7",
    bills: "#E11D48",
    other: "#EAB308",
};

function App() {
    const [transactions, setTransactions] = useState(
        () => getTransactions()
    );

    useEffect(() => {
        saveTransactions(transactions);
    }, [transactions]);

    const stats = useMemo(
        () => getTransactionStats(transactions),
        [transactions]
    );

    const circleData = stats.categoryStats.map((stat) => ({
        id: stat.category,
        label: stat.category,
        amount: stat.amount,
        percentage: stat.percentage,
        color: CATEGORY_COLORS[stat.category.toLowerCase()] || "#06B6D4",
    }));

    return (
        <main className="app-shell">
            <div className="dashboard-grid">
                <div className="dashboard-main-column">
                    <CircleGroup items={circleData} />
                    <RecentPurchases transactions={transactions} />
                </div>

                <aside className="dashboard-side-column">
                    <Transactions
                        transactions={transactions}
                        setTransactions={setTransactions}
                    />
                </aside>
            </div>
        </main>
    );
}

export default App;
