import { useCallback, useEffect, useRef, useState } from "react";

import {
    loadTransactionsResult,
    saveTransactions,
} from "../services/transactionStorage.js";
import { getErrorMessage } from "../utils/errors.js";
import {
    normalizeTransaction,
    sortTransactionsNewestFirst,
} from "../utils/transactions.js";

export default function useTransactions() {
    const [initialData] = useState(() => loadTransactionsResult());
    const [transactions, setTransactions] = useState(
        () => sortTransactionsNewestFirst(initialData.transactions)
    );
    const [storageError, setStorageError] = useState(
        () => initialData.errorCode ? getErrorMessage(initialData.errorCode) : ""
    );
    const shouldPersistRef = useRef(false);

    useEffect(() => {
        // Do not immediately overwrite unreadable/corrupt storage with an empty array.
        // Only persist after the user changes the transaction list.
        if (!shouldPersistRef.current) return;
        shouldPersistRef.current = false;

        const result = saveTransactions(transactions);
        setStorageError(result.ok ? "" : getErrorMessage(result.reason));
    }, [transactions]);

    const addTransaction = useCallback((transaction) => {
        const normalizedTransaction = normalizeTransaction(transaction);
        if (!normalizedTransaction) return false;

        shouldPersistRef.current = true;
        setTransactions((currentTransactions) =>
            sortTransactionsNewestFirst([...currentTransactions, normalizedTransaction])
        );

        return true;
    }, []);

    const deleteTransaction = useCallback((transactionId) => {
        if (typeof transactionId !== "string" || !transactionId.trim()) return false;

        shouldPersistRef.current = true;
        setTransactions((currentTransactions) => currentTransactions.filter(
            (transaction) => transaction.id !== transactionId
        ));

        return true;
    }, []);

    return {
        transactions,
        addTransaction,
        deleteTransaction,
        storageError,
    };
}
