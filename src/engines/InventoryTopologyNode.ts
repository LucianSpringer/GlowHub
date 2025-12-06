// InventoryTopologyNode.ts - Bitwise Product Filtering Engine
// Pattern: Bitmask Operations + Vector Distance Sorting

// Concern Bitmask Definitions
export const ConcernMask = {
    NONE: 0,
    ACNE: 1 << 0,        // 1
    DULL: 1 << 1,        // 2
    DRY: 1 << 2,         // 4
    OILY: 1 << 3,        // 8
    SENSITIVE: 1 << 4,   // 16
    AGING: 1 << 5,       // 32
    PORES: 1 << 6,       // 64
    DARK_SPOTS: 1 << 7   // 128
} as const;

export type ConcernType = keyof typeof ConcernMask;

export interface FilterableProduct {
    id: string;
    name: string;
    brand: string;
    concernMask: number;     // Bitwise concerns this product addresses
    specialization: string;  // "Acne Specialist" | "Barrier Hero" etc
    stock: number;
    price: number;
    image: string;
}

export interface FilterResult {
    products: FilterableProduct[];
    matchCount: number;
    filterMask: number;
    sortedByRelevance: boolean;
}

// Convert concern array to bitmask
export const concernsToBitmask = (concerns: ConcernType[]): number => {
    return concerns.reduce((mask, concern) => mask | ConcernMask[concern], 0);
};

// Convert bitmask to concern array
export const bitmaskToConcerns = (mask: number): ConcernType[] => {
    return Object.entries(ConcernMask)
        .filter(([key, value]) => key !== 'NONE' && (mask & value) !== 0)
        .map(([key]) => key as ConcernType);
};

// Count matching bits (Hamming weight for relevance)
const countMatchingBits = (productMask: number, userMask: number): number => {
    const matched = productMask & userMask;
    let count = 0;
    let n = matched;
    while (n) {
        count += n & 1;
        n >>= 1;
    }
    return count;
};

// Calculate total bits set
const popCount = (n: number): number => {
    let count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;
    }
    return count;
};

// RAPID FILTERING - O(n) with O(1) per-item comparison
export const filterProductsByMask = (
    products: FilterableProduct[],
    userMask: number,
    sortByRelevance: boolean = true
): FilterResult => {
    if (userMask === 0) {
        return {
            products,
            matchCount: products.length,
            filterMask: userMask,
            sortedByRelevance: false
        };
    }

    // Bitwise AND filtering - instant match
    const matched = products.filter(p => (p.concernMask & userMask) !== 0);

    if (sortByRelevance) {
        // Vector Distance Sorting - products that match MORE bits rank higher
        matched.sort((a, b) => {
            const aMatches = countMatchingBits(a.concernMask, userMask);
            const bMatches = countMatchingBits(b.concernMask, userMask);

            // Primary: more matching concerns
            if (bMatches !== aMatches) return bMatches - aMatches;

            // Secondary: exact match bonus (product covers exactly what user needs)
            const aExact = popCount(a.concernMask) === popCount(userMask);
            const bExact = popCount(b.concernMask) === popCount(userMask);
            if (aExact !== bExact) return aExact ? -1 : 1;

            // Tertiary: stock availability
            return b.stock - a.stock;
        });
    }

    return {
        products: matched,
        matchCount: matched.length,
        filterMask: userMask,
        sortedByRelevance: sortByRelevance
    };
};

// Brand Topology - Group by specialization
export interface BrandNode {
    specialization: string;
    brands: string[];
    productCount: number;
    avgPrice: number;
}

export const buildBrandTopology = (products: FilterableProduct[]): BrandNode[] => {
    const topology = new Map<string, { brands: Set<string>; prices: number[]; count: number }>();

    products.forEach(p => {
        if (!topology.has(p.specialization)) {
            topology.set(p.specialization, { brands: new Set(), prices: [], count: 0 });
        }
        const node = topology.get(p.specialization)!;
        node.brands.add(p.brand);
        node.prices.push(p.price);
        node.count++;
    });

    return Array.from(topology.entries()).map(([specialization, data]) => ({
        specialization,
        brands: Array.from(data.brands),
        productCount: data.count,
        avgPrice: data.prices.reduce((a, b) => a + b, 0) / data.prices.length
    }));
};

// Compatibility Indicator - Preview match count
export const previewFilterCount = (
    products: FilterableProduct[],
    currentMask: number,
    toggleConcern: ConcernType
): { newCount: number; delta: number } => {
    const newMask = currentMask ^ ConcernMask[toggleConcern]; // XOR toggle
    const newCount = products.filter(p => newMask === 0 || (p.concernMask & newMask) !== 0).length;
    const currentCount = products.filter(p => currentMask === 0 || (p.concernMask & currentMask) !== 0).length;

    return {
        newCount,
        delta: newCount - currentCount
    };
};

// Generate filterable products from real ProductTelemetry
// This maps vectorMask from ProductTelemetry to concernMask for filtering
import { PRODUCT_CATALOG } from '../ProductTelemetry';

export const generateFilterableProducts = (): FilterableProduct[] => {
    const specs = ['Acne Specialist', 'Barrier Hero', 'Brightening Expert', 'Anti-Aging Pro', 'Oil Control Master'];

    return PRODUCT_CATALOG.map((product, i) => {
        // Map vectorMask to concernMask (simplified mapping)
        let concernMask = 0;
        if (product.vectorMask & 0b000010) concernMask |= ConcernMask.ACNE;      // Bit 1: ACNE
        if (product.vectorMask & 0b000100) concernMask |= ConcernMask.DULL;      // Bit 2: DULL
        if (product.vectorMask & 0b010000) concernMask |= ConcernMask.AGING;     // Bit 4: AGING
        if (product.vectorMask & 0b000001) concernMask |= ConcernMask.DRY;       // Bit 0: DRY
        if (product.vectorMask & 0b001000) concernMask |= ConcernMask.SENSITIVE; // Bit 3: SENSITIVE
        if (concernMask === 0) concernMask = ConcernMask.ACNE; // Default

        return {
            id: product.id, // Use REAL ProductTelemetry ID
            name: product.name,
            brand: product.brand,
            concernMask,
            specialization: specs[i % specs.length],
            stock: product.stockQty,
            price: product.marketPrice,
            image: product.media[0]?.url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80'
        };
    });
};

