
export function getTransactionStats(transactions = []) {

    // Only include expenses (negative amounts)
    const expenses = transactions.filter(
        (transaction) => Number(transaction.amount) < 0
    );

    // Calculate total expenses
    const totalExpenses = expenses.reduce(
        (total, transaction) =>
            total + Math.abs(Number(transaction.amount)),
        0
    );

    // Group expenses by category
    const categories = expenses.reduce((result, transaction) => {

        const category = transaction.category || "Other";

        if (!result[category]) {
            result[category] = 0;
        }

        result[category] += Math.abs(Number(transaction.amount));

        return result;

    }, {});

    // Calculate percentages
    const categoryStats = Object.entries(categories).map(
        ([category, amount]) => ({
            category,
            amount,
            percentage: totalExpenses > 0
                ? Number(((amount / totalExpenses) * 100).toFixed(2))
                : 0
        })
    );

    return {
        totalExpenses,
        categoryStats
    };
}
