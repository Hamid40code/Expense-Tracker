
const STORAGE_KEY = "finance-transactions";

export function getTransactions() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) return [];

        const transactions = JSON.parse(savedData);

        return Array.isArray(transactions) ? transactions : [];
    } catch (error) {
        console.error("Failed to load transactions:", error);
        return [];
    }
}

export function saveTransactions(transactions) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );
    } catch (error) {
        console.error("Failed to save transactions:", error);
    }
}

export function clearTransactions() {
    localStorage.removeItem(STORAGE_KEY);
}
