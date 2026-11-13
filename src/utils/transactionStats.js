import { DEFAULT_CATEGORY } from "../constants/transactions.js";
import { getTransactionCents } from "./transactions.js";

export function getTransactionStats(transactions = []) {
    if (!Array.isArray(transactions)) {
        return {
            totalExpensesCents: "0",
            totalExpenses: 0,
            categoryStats: [],
        };
    }

    const categoryTotals = new Map();
    let totalExpenseCents = 0n;

    for (const transaction of transactions) {
        const transactionCents = getTransactionCents(transaction);
        if (transactionCents === null || transactionCents >= 0n) continue;

        const amountCents = -transactionCents;
        const category = String(transaction.category || DEFAULT_CATEGORY);

        totalExpenseCents += amountCents;
        categoryTotals.set(
            category,
            (categoryTotals.get(category) || 0n) + amountCents
        );
    }

    const rawStats = Array.from(categoryTotals, ([category, amountCents], index) => ({
        category,
        amountCents,
        index,
        scaledShare: totalExpenseCents > 0n
            ? (amountCents * 10000n) / totalExpenseCents
            : 0n,
        remainder: totalExpenseCents > 0n
            ? (amountCents * 10000n) % totalExpenseCents
            : 0n,
    }));

    // Allocate rounded basis points by largest remainder so percentages add to 100.00%.
    let allocatedBasisPoints = rawStats.reduce(
        (total, item) => total + item.scaledShare,
        0n
    );
    let remainingBasisPoints = totalExpenseCents > 0n
        ? 10000n - allocatedBasisPoints
        : 0n;
    const allocationOrder = [...rawStats].sort((first, second) => {
        if (first.remainder === second.remainder) return first.index - second.index;
        return first.remainder > second.remainder ? -1 : 1;
    });

    for (let index = 0; remainingBasisPoints > 0n && allocationOrder.length > 0; index += 1) {
        allocationOrder[index % allocationOrder.length].scaledShare += 1n;
        remainingBasisPoints -= 1n;
    }

    const categoryStats = rawStats.map((item) => ({
        category: item.category,
        amountCents: item.amountCents.toString(),
        amount: Number(item.amountCents) / 100,
        percentage: Number(item.scaledShare) / 100,
    }));

    return {
        totalExpensesCents: totalExpenseCents.toString(),
        totalExpenses: Number(totalExpenseCents) / 100,
        categoryStats,
    };
}
