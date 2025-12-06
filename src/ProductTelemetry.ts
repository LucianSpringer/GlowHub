import { useState, useEffect, useMemo } from 'react';

// --- 1. DATA STRUCTURES ---

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
}

export interface Review {
    id: string;
    user: string;
    rating: number;
    text: string;
    source: 'GlowHub' | 'Shopee' | 'Tokopedia';
    isVerified: boolean;
    timestamp: number;
}

export interface UsageStep {
    order: number;
    text: string;
    time: 'AM' | 'PM' | 'BOTH';
    icon?: string;
}

export interface ProductTelemetry {
    id: string;
    sku: string;
    name: string;
    brand: string;
    basePrice: number;
    marketPrice: number;
    stockQty: number;
    ingredients: string[];
    media: { type: 'image' | 'video', url: string }[];
    reviews: Review[];
    benefitClaims: string[];
    usage: UsageStep[];
    vectorMask: number; // For compatibility
}

// --- 2. ENTROPY DATABASE (Expanded) ---

const _INGREDIENT_DB: Record<string, Ingredient> = {
    'ING-01': { id: 'ING-01', name: 'Niacinamide 10%', functionMask: IngredientFunction.BRIGHTENING | IngredientFunction.ACNE_FIGHTING, description: "Vitamin B3 derivative. Regulates sebum." },
    'ING-02': { id: 'ING-02', name: 'Hyaluronic Acid', functionMask: IngredientFunction.HYDRATING, description: "Holds 1000x weight in water." },
    'ING-03': { id: 'ING-03', name: 'Salicylic Acid', functionMask: IngredientFunction.ACNE_FIGHTING | IngredientFunction.EXFOLIATING, description: "BHA keratolytic agent." },
    'ING-04': { id: 'ING-04', name: 'Ceramide NP', functionMask: IngredientFunction.BARRIER_REPAIR, description: "Lipid barrier restoration." },
    'ING-05': { id: 'ING-05', name: 'Retinol 0.5%', functionMask: IngredientFunction.ANTI_AGING, description: "Cell turnover accelerator." },
    'ING-06': { id: 'ING-06', name: 'Centella Asiatica', functionMask: IngredientFunction.HYDRATING | IngredientFunction.BARRIER_REPAIR, description: "Soothing botanical extract." },
};

const _PRODUCT_DB: ProductTelemetry[] = [
    {
        id: 'L-01', sku: 'GH-SCAR-001', name: 'Phyto-Biotic Serum', brand: 'SCARLETT',
        basePrice: 55000, marketPrice: 75000, stockQty: 142, vectorMask: 18,
        ingredients: ['ING-01', 'ING-03'],
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=500' }],
        reviews: [{ id: 'R1', user: 'Siti A.', rating: 5, text: 'Jerawat kempes!', source: 'Shopee', isVerified: true, timestamp: Date.now() }],
        benefitClaims: ["Acne Reduction", "Sebum Control"],
        usage: [
            { order: 1, text: "Cleanse face", time: 'BOTH' },
            { order: 2, text: "Apply 2-3 drops", time: 'BOTH' },
            { order: 3, text: "Massage gently", time: 'BOTH' }
        ]
    },
    {
        id: 'L-02', sku: 'GH-SOME-001', name: 'Niacinamide Barrier', brand: 'SOMETHINC',
        basePrice: 85000, marketPrice: 115000, stockQty: 89, vectorMask: 22,
        ingredients: ['ING-01', 'ING-04', 'ING-06'],
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1601049541289-9b3b7d5d7fb5?auto=format&fit=crop&q=80&w=500' }],
        reviews: [{ id: 'R2', user: 'Budi', rating: 5, text: 'Tekstur ringan.', source: 'Tokopedia', isVerified: true, timestamp: Date.now() }],
        benefitClaims: ["Brightening", "Skin Barrier"],
        usage: [{ order: 1, text: "Use after toner", time: 'BOTH' }, { order: 2, text: "Follow with moisturizer", time: 'BOTH' }]
    },
    {
        id: 'L-03', sku: 'GH-AVO-001', name: 'Miraculous Retinol', brand: 'AVOSKIN',
        basePrice: 110000, marketPrice: 149000, stockQty: 34, vectorMask: 40,
        ingredients: ['ING-05', 'ING-02'],
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1571781348782-92c8812e8836?auto=format&fit=crop&q=80&w=500' }],
        reviews: [{ id: 'R3', user: 'Dina', rating: 4, text: 'Efektif tapi tingling.', source: 'GlowHub', isVerified: true, timestamp: Date.now() }],
        benefitClaims: ["Anti-Aging", "Cell Renewal"],
        usage: [{ order: 1, text: "Apply thin layer", time: 'PM' }, { order: 2, text: "MUST use sunscreen next day", time: 'AM' }]
    },
    {
        id: 'L-04', sku: 'GH-AZA-001', name: 'Hydrasoothe Gel', brand: 'AZARINE',
        basePrice: 45000, marketPrice: 65000, stockQty: 210, vectorMask: 26,
        ingredients: ['ING-02', 'ING-06'],
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=500' }],
        reviews: [],
        benefitClaims: ["Soothing", "Oil Free"],
        usage: [{ order: 1, text: "Apply liberally", time: 'AM' }]
    }
];

// --- 3. LOGIC ENGINES ---

export function useSupplyChainResonance(initialStock: number) {
    const [stock, setStock] = useState(initialStock);
    const [status, setStatus] = useState<'SYNCED' | 'UPDATING'>('SYNCED');

    useEffect(() => {
        setStock(initialStock); // Reset when product changes
        const interval = setInterval(() => {
            if (Math.random() > 0.8) {
                setStatus('UPDATING');
                setTimeout(() => {
                    setStock(prev => Math.max(0, prev - 1));
                    setStatus('SYNCED');
                }, 800);
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [initialStock]);

    const stockStatus = useMemo(() => {
        if (stock <= 0) return { label: 'HABIS', color: 'text-gray-400', bg: 'bg-gray-100', actionable: false };
        if (stock < 20) return { label: 'STOK MENIPIS', color: 'text-amber-600', bg: 'bg-amber-100', actionable: true };
        return { label: 'TERSEDIA', color: 'text-emerald-600', bg: 'bg-emerald-100', actionable: true };
    }, [stock]);

    return { stock, status, stockStatus };
}

export function useMarginVelocity(basePrice: number) {
    const [sellingPrice, setSellingPrice] = useState(basePrice * 1.25);

    // Reset when product changes
    useEffect(() => { setSellingPrice(basePrice * 1.25); }, [basePrice]);

    const metrics = useMemo(() => {
        const profit = sellingPrice - basePrice;
        const margin = (profit / sellingPrice) * 100;
        return { profit, margin: margin.toFixed(1), isHealthy: margin >= 15 };
    }, [basePrice, sellingPrice]);

    return { sellingPrice, setSellingPrice, metrics };
}

export function useDermalGraph(ingredientIds: string[]) {
    return useMemo(() => ingredientIds.map(id => _INGREDIENT_DB[id]).filter(Boolean), [ingredientIds]);
}

// SIMILARITY ENGINE: Finds products with overlapping ingredients/functions
export function getRelatedProducts(currentId: string): ProductTelemetry[] {
    const current = _PRODUCT_DB.find(p => p.id === currentId);
    if (!current) return [];

    return _PRODUCT_DB
        .filter(p => p.id !== currentId)
        .map(p => {
            // Jaccard Index Logic (Simplified)
            const shared = p.ingredients.filter(i => current.ingredients.includes(i)).length;
            return { product: p, score: shared };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => x.product);
}

export function getProductById(id: string) {
    return _PRODUCT_DB.find(p => p.id === id) || _PRODUCT_DB[0];
}
