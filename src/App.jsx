
import { useState } from "react";

import Transactions from "./components/Transactions/Transactions.jsx";
import CircleGroup from "./components/Summery/CircleGroup.jsx";

const CATEGORY_COLORS = [
    "#5689E8",
    "#34BFA3",
    "#F0A44B",
    "#A78BFA",
    "#EF6B78",
    "#38BDF8",
    "#E879F9",
    "#A3A3A3"
];

function App() {

    const [stats, setStats] = useState({
        totalExpenses: 0,
        categoryStats: []
    });

    // Prepare circle data
    const circleData = stats.categoryStats.map(
        (stat, index) => ({
            id: stat.category,
            label: stat.category,
            amount: stat.amount,
            percentage: stat.percentage,
            color: CATEGORY_COLORS[
                index % CATEGORY_COLORS.length
            ]
        })
    );

    return (
        <>
            <Transactions onStatsChange={setStats} />

            <CircleGroup items={circleData} />
        </>
    );
}

export default App;
