import { useState, useEffect, useMemo } from 'react';

// --- 1. DATA STRUCTURES (High Density) ---

export const IngredientFunction = {
    BRIGHTENING: 1 << 0,
    HYDRATING: 1 << 1,
    ACNE_FIGHTING: 1 << 2,
    ANTI_AGING: 1 << 3,
    BARRIER_REPAIR: 1 << 4,
    EXFOLIATING: 1 << 5
} as const;

export type IngredientFunction = number;

export interface Ingredient {
    id: string;
    name: string;
    functionMask: number;
    description: string;
    molecularWeight?: string; // Scientific filler
}

export interface Review {
    id: string;
    user: string;
    rating: 1 | 2 | 3 | 4 | 5;
    text: string;
    source: 'GlowHub' | 'Shopee' | 'Tokopedia';
    isVerified: boolean;
    timestamp: number;
}

export interface ProductTelemetry {
    id: string;
    sku: string;
    name: string;
    brand: string;
    basePrice: number; // HPP
    marketPrice: number; // MSRP
    stockQty: number;
    lastSync: number;
    ingredients: string[]; // IDs
    media: { type: 'image' | 'video', url: string, thumbnail?: string }[];
    reviews: Review[];
    benefitClaims: string[];
}

// --- 2. MOCK DATABASE (Entropy Injection) ---

const _INGREDIENT_DB: Record<string, Ingredient> = {
    'ING-01': { id: 'ING-01', name: 'Niacinamide 10%', functionMask: IngredientFunction.BRIGHTENING | IngredientFunction.ACNE_FIGHTING, description: "Vitamin B3 derivative. Regulates sebum and inhibits melanosome transfer." },
    'ING-02': { id: 'ING-02', name: 'Hyaluronic Acid', functionMask: IngredientFunction.HYDRATING | IngredientFunction.BARRIER_REPAIR, description: "Humectant capable of holding 1000x its weight in water." },
    'ING-03': { id: 'ING-03', name: 'Salicylic Acid', functionMask: IngredientFunction.ACNE_FIGHTING | IngredientFunction.EXFOLIATING, description: "Beta Hydroxy Acid (BHA). Oil-soluble keratolytic agent." },
    'ING-04': { id: 'ING-04', name: 'Ceramide NP', functionMask: IngredientFunction.BARRIER_REPAIR, description: "Lipid molecule essential for stratum corneum integrity." },
};

const _PRODUCT_DB: ProductTelemetry[] = [
    {
        id: 'L-01', sku: 'GH-SCAR-001', name: 'Phyto-Biotic Serum', brand: 'SCARLETT',
        basePrice: 55000, marketPrice: 75000, stockQty: 142, lastSync: Date.now(),
        ingredients: ['ING-01', 'ING-03'],
        media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=500' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=500' }
        ],
        reviews: [
            { id: 'R1', user: 'Siti A.', rating: 5, text: 'Jerawat kempes dalam 3 hari!', source: 'Shopee', isVerified: true, timestamp: Date.now() - 100000 },
            { id: 'R2', user: 'Budi S.', rating: 4, text: 'Pengiriman agak lama tapi barang ori.', source: 'Tokopedia', isVerified: true, timestamp: Date.now() - 500000 }
        ],
        benefitClaims: ["99% Acne Reduction", "Non-Comedogenic Tested"]
    },
    // More products can be added here for volume...
];

// --- 3. LOGIC HOOKS (The Engines) ---

// Engine 1: Stock Sync Simulation
export function useSupplyChainResonance(initialStock: number) {
    const [stock, setStock] = useState(initialStock);
    const [status, setStatus] = useState<'SYNCED' | 'UPDATING'>('SYNCED');

    useEffect(() => {
        // Simulate random purchases globally
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setStatus('UPDATING');
                setTimeout(() => {
                    setStock(prev => Math.max(0, prev - Math.floor(Math.random() * 3)));
                    setStatus('SYNCED');
                }, 800);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const stockStatus = useMemo(() => {
        if (stock <= 0) return { label: 'OUT OF STOCK', color: 'text-gray-400', bg: 'bg-gray-100', actionable: false };
        if (stock < 20) return { label: 'LOW STOCK', color: 'text-amber-600', bg: 'bg-amber-100', actionable: true };
        return { label: 'AVAILABLE', color: 'text-emerald-600', bg: 'bg-emerald-100', actionable: true };
    }, [stock]);

    return { stock, status, stockStatus };
}

// Engine 2: Profit Calculator
export function useMarginVelocity(basePrice: number) {
    const [sellingPrice, setSellingPrice] = useState(basePrice * 1.2); // Default 20% margin

    const metrics = useMemo(() => {
        const profit = sellingPrice - basePrice;
        const margin = (profit / sellingPrice) * 100;
        const roi = (profit / basePrice) * 100;

        return {
            profit: profit,
            margin: margin.toFixed(1),
            roi: roi.toFixed(1),
            isHealthy: margin >= 15
        };
    }, [basePrice, sellingPrice]);

    return { sellingPrice, setSellingPrice, metrics };
}

// Engine 3: Ingredient Analysis
export function useDermalGraph(ingredientIds: string[]) {
    return useMemo(() => {
        return ingredientIds.map(id => _INGREDIENT_DB[id]).filter(Boolean);
    }, [ingredientIds]);
}

// Helper to get Product
export function getProductById(id: string) {
    return _PRODUCT_DB.find(p => p.id === id) || _PRODUCT_DB[0];
}
