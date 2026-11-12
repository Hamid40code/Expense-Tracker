const STORAGE_KEY = "finance-transactions";

export function getTransactions() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData === null) {
            return { transactions: [], persisted: false };
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            return { transactions: [], persisted: false };
        }

        const transactions = parsedData
            .filter((transaction) => (
                transaction &&
                typeof transaction.name === "string" &&
                transaction.name.trim().length > 0 &&
                typeof transaction.amount === "number" &&
                Number.isFinite(transaction.amount)
            ))
            .map((transaction) => ({
                ...transaction,
                name: transaction.name.trim(),
                id: transaction.id || crypto.randomUUID(),
            }));

        return { transactions, persisted: true };
    } catch (error) {
        console.error("Failed to load transactions:", error);
        return { transactions: [], persisted: false };
    }
}

export function saveTransactions(transactions) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
        console.error("Failed to save transactions:", error);
    }
}
