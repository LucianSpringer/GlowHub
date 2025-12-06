// BundleEconomicsKernel.ts - Dynamic Pricing Engine
// Pattern: Inventory Pressure + Synergy Discounting + Circuit Breaker

export interface BundleItem {
    id: string;
    name: string;
    price: number;
    cost: number;       // HPP
    stock: number;
    category: string;   // for synergy detection
}

export interface BundleResult {
    items: BundleItem[];
    originalTotal: number;
    discountedTotal: number;
    savings: number;
    savingsPercent: number;
    synergies: string[];
    pressureFactors: Array<{ id: string; pressure: 'HIGH' | 'MEDIUM' | 'LOW'; discount: number }>;
    isValid: boolean;
    circuitBreakerTriggered: boolean;
}

// Synergy pairs - products that complement each other
const SYNERGY_PAIRS: Record<string, string[]> = {
    'Toner': ['Cleanser', 'Serum', 'Cotton Pad'],
    'Serum': ['Toner', 'Moisturizer', 'Essence'],
    'Moisturizer': ['Serum', 'Sunscreen', 'Sleeping Mask'],
    'Sunscreen': ['Moisturizer', 'Cleanser'],
    'Cleanser': ['Toner', 'Makeup Remover'],
    'Cotton Pad': ['Toner', 'Micellar Water']
};

// Constants
const MIN_MARGIN_PERCENT = 12; // Circuit breaker threshold
const SYNERGY_BONUS_PERCENT = 5; // Extra discount for synergy

// Calculate inventory pressure
export const calculatePressure = (stock: number): { pressure: 'HIGH' | 'MEDIUM' | 'LOW'; discount: number } => {
    if (stock > 1000) return { pressure: 'HIGH', discount: 15 };
    if (stock > 500) return { pressure: 'MEDIUM', discount: 8 };
    if (stock > 100) return { pressure: 'LOW', discount: 3 };
    return { pressure: 'LOW', discount: 0 }; // Scarce stock = no discount
};

// Detect synergies between items
export const detectSynergies = (items: BundleItem[]): string[] => {
    const synergies: string[] = [];

    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const cat1 = items[i].category;
            const cat2 = items[j].category;

            if (SYNERGY_PAIRS[cat1]?.includes(cat2) || SYNERGY_PAIRS[cat2]?.includes(cat1)) {
                synergies.push(`${cat1} + ${cat2}`);
            }
        }
    }

    return synergies;
};

// Calculate bundle economics
export const calculateBundle = (items: BundleItem[]): BundleResult => {
    if (items.length === 0) {
        return {
            items: [],
            originalTotal: 0,
            discountedTotal: 0,
            savings: 0,
            savingsPercent: 0,
            synergies: [],
            pressureFactors: [],
            isValid: true,
            circuitBreakerTriggered: false
        };
    }

    const originalTotal = items.reduce((sum, item) => sum + item.price, 0);
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

    // 1. Calculate pressure-based discounts per item
    const pressureFactors = items.map(item => {
        const pressure = calculatePressure(item.stock);
        return { id: item.id, ...pressure };
    });

    let discountAmount = 0;

    // Apply pressure discounts
    items.forEach((item, i) => {
        discountAmount += item.price * (pressureFactors[i].discount / 100);
    });

    // 2. Detect synergies and apply bonus
    const synergies = detectSynergies(items);
    if (synergies.length > 0) {
        discountAmount += originalTotal * (SYNERGY_BONUS_PERCENT / 100) * synergies.length;
    }

    // 3. Multi-item bonus (more items = more discount)
    if (items.length >= 3) {
        discountAmount += originalTotal * 0.03; // 3% for 3+ items
    }
    if (items.length >= 5) {
        discountAmount += originalTotal * 0.05; // Extra 5% for 5+ items
    }

    // 4. Calculate proposed final price
    let discountedTotal = originalTotal - discountAmount;

    // 5. CIRCUIT BREAKER - Ensure minimum margin
    const proposedMargin = ((discountedTotal - totalCost) / discountedTotal) * 100;
    let circuitBreakerTriggered = false;

    if (proposedMargin < MIN_MARGIN_PERCENT) {
        // Recalculate to maintain minimum margin
        discountedTotal = totalCost / (1 - MIN_MARGIN_PERCENT / 100);
        discountAmount = originalTotal - discountedTotal;
        circuitBreakerTriggered = true;
    }

    const savings = originalTotal - discountedTotal;
    const savingsPercent = (savings / originalTotal) * 100;

    return {
        items,
        originalTotal,
        discountedTotal,
        savings,
        savingsPercent,
        synergies,
        pressureFactors,
        isValid: discountedTotal > 0,
        circuitBreakerTriggered
    };
};

// Smart suggestion - find complementary products
export const suggestComplement = (
    currentItems: BundleItem[],
    allProducts: BundleItem[]
): BundleItem | null => {
    const currentCategories = new Set(currentItems.map(i => i.category));
    const currentIds = new Set(currentItems.map(i => i.id));

    // Find products that synergize with current items but aren't in bundle
    const candidates = allProducts.filter(p => {
        if (currentIds.has(p.id)) return false;

        // Check if this product synergizes with any current item
        for (const cat of currentCategories) {
            if (SYNERGY_PAIRS[cat]?.includes(p.category)) {
                return true;
            }
        }
        return false;
    });

    // Prioritize high-stock items (to clear inventory)
    candidates.sort((a, b) => b.stock - a.stock);

    return candidates[0] || null;
};

// Generate mock bundle items
export const generateMockBundleItems = (): BundleItem[] => {
    const categories = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Cotton Pad', 'Sleeping Mask'];

    return Array.from({ length: 10 }, (_, i) => ({
        id: `BUNDLE-${1000 + i}`,
        name: `${categories[i % categories.length]} Product ${i + 1}`,
        price: Math.floor(Math.random() * 100000) + 30000,
        cost: Math.floor(Math.random() * 40000) + 15000,
        stock: Math.floor(Math.random() * 2000) + 50,
        category: categories[i % categories.length]
    }));
};
