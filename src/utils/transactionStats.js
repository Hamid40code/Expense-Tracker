import { DEFAULT_CATEGORY } from "../constants/transactions.js";
import { getTransactionCents } from "./transactions.js";

/**
 * Build the latest-only balance calculation for a newest-first transaction list.
 * The returned values are strings so callers can keep exact integer-cent precision.
 */
export function getLatestTransactionBalanceTrace(transactions = []) {
    if (!Array.isArray(transactions) || transactions.length === 0) return null;

    let latestTransaction = null;
    let latestAmountCents = null;
    let currentBalanceCents = 0n;

    for (const transaction of transactions) {
        const amountCents = getTransactionCents(transaction);
        if (amountCents === null) continue;

        // The hook supplies newest-first rows, so the first valid row is the latest one.
        if (latestTransaction === null) {
            latestTransaction = transaction;
            latestAmountCents = amountCents;
        }

        currentBalanceCents += amountCents;
    }

    if (latestTransaction === null) return null;

    return {
        transactionId: latestTransaction.id,
        previousBalanceCents: (currentBalanceCents - latestAmountCents).toString(),
        transactionAmountCents: latestAmountCents.toString(),
        currentBalanceCents: currentBalanceCents.toString(),
    };
}

export function getTransactionStats(transactions = []) {
    if (!Array.isArray(transactions)) {
        return {
            totalExpensesCents: "0",
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
        percentage: Number(item.scaledShare) / 100,
    }));

    return {
        totalExpensesCents: totalExpenseCents.toString(),
        categoryStats,
    };
}
