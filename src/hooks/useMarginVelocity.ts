import { useState, useEffect } from 'react';
import {
    generateMockTransactions,
    analyzeProductROI,
    type ProductROI,
    type Transaction
} from '../engines/MarginVelocityEngine';

export function useMarginVelocity() {
    const [products, setProducts] = useState<ProductROI[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const tx = generateMockTransactions(7);
        setTransactions(tx);
        setProducts(analyzeProductROI(tx));
    }, []);

    const optimizePrice = (_productId: string, _action: 'INCREASE' | 'DECREASE') => {
        // In a real app, this would mutate state or call an API
        // Here we just simulate a refresh for feedback
        const tx = generateMockTransactions(7); // effective "refresh"
        setProducts(analyzeProductROI(tx));
    };

    return {
        products,
        transactions,
        optimizePrice
    };
}
