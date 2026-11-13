import test from 'node:test';
import assert from 'node:assert/strict';
import {
    normalizeTransaction,
    normalizeTransactions,
    sortTransactionsNewestFirst,
} from '../src/utils/transactions.js';
import { getTransactionStats } from '../src/utils/transactionStats.js';

test('stress: normalizes, aggregates, and sorts 50,000 records', { timeout: 30000 }, () => {
    const rows = Array.from({ length: 50_000 }, (_, index) => ({
        id: `stress-${index}`,
        name: `Expense ${index}`,
        amountCents: String(-(index + 1)),
        category: index % 2 ? 'Food' : 'Bills',
        createdAt: new Date(1_700_000_000_000 + index).toISOString(),
    }));

    const normalized = normalizeTransactions(rows);
    const stats = getTransactionStats(normalized);
    const sorted = sortTransactionsNewestFirst(normalized);

    assert.equal(normalized.length, 50_000);
    assert.equal(sorted.length, 50_000);
    assert.ok(BigInt(stats.totalExpensesCents) > 0n);
    assert.deepEqual(sorted[0].id, 'stress-49999');
});

test('stress: randomized totals match category sums and percentages add to 100', () => {
    let seed = 12_345;
    const random = () => {
        seed = (seed * 16_807) % 2_147_483_647;
        return seed / 2_147_483_647;
    };
    const categories = ['Food', 'Bills', 'Transport', 'Shopping', 'Other'];
    const rows = Array.from({ length: 10_000 }, (_, index) => ({
        id: `random-${index}`,
        name: `Item ${index}`,
        amountCents: String(-1 - Math.floor(random() * 1_000_000)),
        category: categories[Math.floor(random() * categories.length)],
    }));

    const stats = getTransactionStats(rows);
    const categoryTotal = stats.categoryStats.reduce((total, item) => total + BigInt(item.amountCents), 0n);

    assert.equal(categoryTotal.toString(), stats.totalExpensesCents);
    assert.equal(stats.categoryStats.reduce((total, item) => total + item.percentage, 0), 100);
});

test('stress: duplicate identifiers are repaired without dropping rows', () => {
    const rows = Array.from({ length: 2_000 }, (_, index) => ({
        id: 'same-id',
        name: `Item ${index}`,
        amountCents: '-100',
    }));
    const normalized = normalizeTransactions(rows);

    assert.equal(normalized.length, rows.length);
    assert.equal(new Set(normalized.map((row) => row.id)).size, rows.length);
});

test('stress: a very large display name is reduced to the supported length', () => {
    const transaction = normalizeTransaction({
        name: 'A'.repeat(2_000_000),
        amountCents: '-100',
    });

    assert.equal(transaction.name.length, 120);
});

test('duplicate IDs remain repairable even when random ID generation repeats', () => {
    const rows = normalizeTransactions([
        { id: 'same', name: 'First', amountCents: '-100' },
        { id: 'same', name: 'Second', amountCents: '-200' },
        { id: 'same~1', name: 'Already suffixed', amountCents: '-300' },
        { id: 'same', name: 'Third', amountCents: '-400' },
    ]);

    assert.equal(rows.length, 4);
    assert.equal(new Set(rows.map((row) => row.id)).size, 4);
});
