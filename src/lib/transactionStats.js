import { getCategoryLabel } from "./categories.js";

function getRoundedPercentages(categoryEntries, totalExpenses) {
    if (totalExpenses <= 0 || categoryEntries.length === 0) {
        return categoryEntries.map(() => 0);
    }

    // Work in tenths of a percent so the displayed values always total 100.0%.
    const shares = categoryEntries.map(([, amount]) => {
        const exactTenths = (amount / totalExpenses) * 1000;
        return {
            wholeTenths: Math.floor(exactTenths),
            remainder: exactTenths - Math.floor(exactTenths),
        };
    });

    let remainingTenths = 1000 - shares.reduce(
        (total, share) => total + share.wholeTenths,
        0
    );

    const remainderOrder = shares
        .map((share, index) => ({ index, remainder: share.remainder }))
        .sort((first, second) => second.remainder - first.remainder);

    for (let index = 0; index < remainingTenths; index += 1) {
        shares[remainderOrder[index].index].wholeTenths += 1;
    }

    return shares.map((share) => share.wholeTenths / 10);
}

export function getTransactionStats(transactions = []) {
    const expenses = transactions.filter(
        (transaction) => Number(transaction.amount) < 0
    );
    const income = transactions.filter(
        (transaction) => Number(transaction.amount) > 0
    );

    const totalExpenses = expenses.reduce(
        (total, transaction) => total + Math.abs(Number(transaction.amount)),
        0
    );
    const totalIncome = income.reduce(
        (total, transaction) => total + Number(transaction.amount),
        0
    );
    const net = totalIncome - totalExpenses;

    const categoryTotals = new Map();

    expenses.forEach((transaction) => {
        const originalCategory = String(transaction.category || "Other").trim() || "Other";
        const key = originalCategory.toLowerCase();
        const existing = categoryTotals.get(key);

        if (existing) {
            existing.amount += Math.abs(Number(transaction.amount));
        } else {
            categoryTotals.set(key, {
                category: getCategoryLabel(originalCategory),
                amount: Math.abs(Number(transaction.amount)),
            });
        }
    });

    const categoryEntries = Array.from(categoryTotals.values());
    const percentages = getRoundedPercentages(
        categoryEntries.map((entry) => [entry.category, entry.amount]),
        totalExpenses
    );

    const categoryStats = categoryEntries.map((entry, index) => ({
        ...entry,
        percentage: percentages[index],
    }));

    return {
        totalIncome,
        totalExpenses,
        net,
        categoryStats,
    };
}
