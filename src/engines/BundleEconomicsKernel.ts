// BundleEconomicsKernel.ts - Dynamic Pricing Engine v2.0
// Pattern: Synergy Chain + Logarithmic Pressure + Chemical Collision + Profit Simulator

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SkincareCategory = 'CLEANSER' | 'TONER' | 'SERUM' | 'MOISTURIZER' | 'PROTECTION';

// Chemical collision bitmasks
export const ChemicalMask = {
    VITAMIN_C: 1 << 0,      // 1
    RETINOL: 1 << 1,        // 2
    AHA: 1 << 2,            // 4
    BHA: 1 << 3,            // 8
    NIACINAMIDE: 1 << 4,    // 16
    BENZOYL: 1 << 5,        // 32
} as const;

// Collision pairs (should NOT mix)
const CHEMICAL_COLLISIONS: [number, number, string][] = [
    [ChemicalMask.VITAMIN_C, ChemicalMask.RETINOL, 'Vitamin C + Retinol: Bisa menyebabkan iritasi'],
    [ChemicalMask.AHA, ChemicalMask.RETINOL, 'AHA + Retinol: Kombinasi terlalu kuat'],
    [ChemicalMask.BENZOYL, ChemicalMask.RETINOL, 'Benzoyl Peroxide + Retinol: Tidak kompatibel'],
    [ChemicalMask.AHA, ChemicalMask.VITAMIN_C, 'AHA + Vitamin C: pH tidak cocok'],
];

// Skincare routine order (1-5)
const ROUTINE_ORDER: Record<SkincareCategory, number> = {
    'CLEANSER': 1,
    'TONER': 2,
    'SERUM': 3,
    'MOISTURIZER': 4,
    'PROTECTION': 5
};

export interface BundleItem {
    id: string;
    name: string;
    price: number;
    cost: number;           // HPP (Harga Pokok Penjualan)
    stock: number;
    category: SkincareCategory;
    chemicalMask: number;   // Bitmask for chemical collision detection
    velocity?: number;      // Sales velocity for pressure calculation
    image?: string;
}

export interface SavingsBreakdown {
    inventoryRebate: number;
    synergyBonus: number;
    chainBonus: number;
    completionBonus: number;
    rolePrivilege: number;
    multiItemBonus: number;
    total: number;
}

export interface ChemicalCollision {
    item1Id: string;
    item2Id: string;
    warning: string;
}

export interface BundleResult {
    items: BundleItem[];
    originalTotal: number;
    discountedTotal: number;
    savings: number;
    savingsPercent: number;
    savingsBreakdown: SavingsBreakdown;
    synergies: string[];
    routineProgress: Record<SkincareCategory, boolean>;
    routineComplete: boolean;
    collisions: ChemicalCollision[];
    isValid: boolean;
    circuitBreakerTriggered: boolean;
    // Dropshipper fields
    dropshipperProfit?: number;
    recommendedRetailPrice?: number;
    copywritingTemplate?: string;
}

// ============================================================================
// BUNDLE TEMPLATES (Preset Routines)
// ============================================================================

export interface BundleTemplate {
    id: string;
    name: string;
    description: string;
    emoji: string;
    productIds: string[];
    targetConcern: string;
}

export const BUNDLE_TEMPLATES: BundleTemplate[] = [
    {
        id: 'TPL-ACNE',
        name: 'Acne Warrior Set',
        description: 'Paket lengkap untuk kulit berjerawat',
        emoji: '🎯',
        productIds: ['BUNDLE-1000', 'BUNDLE-1001', 'BUNDLE-1002', 'BUNDLE-1003', 'BUNDLE-1004'],
        targetConcern: 'Acne'
    },
    {
        id: 'TPL-GLOW',
        name: 'Glass Skin Starter',
        description: 'Rutin dasar untuk kulit glowing',
        emoji: '✨',
        productIds: ['BUNDLE-1000', 'BUNDLE-1001', 'BUNDLE-1003', 'BUNDLE-1004'],
        targetConcern: 'Brightening'
    },
    {
        id: 'TPL-HYDRA',
        name: 'Deep Hydration Bundle',
        description: 'Untuk kulit kering dan dehidrasi',
        emoji: '💧',
        productIds: ['BUNDLE-1000', 'BUNDLE-1001', 'BUNDLE-1003'],
        targetConcern: 'Hydration'
    },
    {
        id: 'TPL-ANTIAGE',
        name: 'Age Defiance Protocol',
        description: 'Rutin anti-aging premium',
        emoji: '⏳',
        productIds: ['BUNDLE-1000', 'BUNDLE-1002', 'BUNDLE-1003', 'BUNDLE-1004'],
        targetConcern: 'Anti-Aging'
    }
];

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_MARGIN_PERCENT = 12;          // Circuit breaker threshold
const ADJACENCY_BONUS_PERCENT = 2;      // Per adjacent step in routine
const COMPLETION_MULTIPLIER = 1.1;      // 10% extra for complete routine
const DROPSHIPPER_PRIVILEGE_PERCENT = 3; // Extra discount for dropshippers

// ============================================================================
// SYNERGY CALCULATION ALGORITHM
// ============================================================================

/**
 * Calculate routine chain bonuses based on skincare step adjacency
 */
export const calculateRoutineChain = (items: BundleItem[]): {
    progress: Record<SkincareCategory, boolean>;
    chainLength: number;
    isComplete: boolean;
    adjacencyBonus: number;
} => {
    const progress: Record<SkincareCategory, boolean> = {
        'CLEANSER': false,
        'TONER': false,
        'SERUM': false,
        'MOISTURIZER': false,
        'PROTECTION': false
    };

    // Mark present categories
    items.forEach(item => {
        if (progress[item.category] !== undefined) {
            progress[item.category] = true;
        }
    });

    // Calculate chain (consecutive steps)
    const steps = Object.entries(ROUTINE_ORDER)
        .filter(([cat]) => progress[cat as SkincareCategory])
        .map(([, order]) => order)
        .sort((a, b) => a - b);

    let chainLength = 0;
    let maxChain = 0;
    for (let i = 0; i < steps.length; i++) {
        if (i === 0 || steps[i] === steps[i - 1] + 1) {
            chainLength++;
            maxChain = Math.max(maxChain, chainLength);
        } else {
            chainLength = 1;
        }
    }

    const isComplete = Object.values(progress).every(v => v);
    const adjacencyBonus = Math.max(0, maxChain - 1) * ADJACENCY_BONUS_PERCENT;

    return { progress, chainLength: maxChain, isComplete, adjacencyBonus };
};

// ============================================================================
// CHEMICAL COLLISION DETECTION
// ============================================================================

export const detectChemicalCollisions = (items: BundleItem[]): ChemicalCollision[] => {
    const collisions: ChemicalCollision[] = [];

    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            for (const [mask1, mask2, warning] of CHEMICAL_COLLISIONS) {
                if ((items[i].chemicalMask & mask1) && (items[j].chemicalMask & mask2) ||
                    (items[i].chemicalMask & mask2) && (items[j].chemicalMask & mask1)) {
                    collisions.push({
                        item1Id: items[i].id,
                        item2Id: items[j].id,
                        warning
                    });
                }
            }
        }
    }

    return collisions;
};

// ============================================================================
// INVENTORY PRESSURE HEURISTIC (Logarithmic Decay)
// ============================================================================

/**
 * Calculate discount based on stock and velocity
 * High velocity = lower discount (demand is high)
 * High stock + low velocity = higher discount (liquidation)
 */
export const calculateInventoryPressure = (
    stock: number,
    velocity: number = 1
): { discount: number; pressure: 'HIGH' | 'MEDIUM' | 'LOW' } => {
    if (stock <= 0) return { discount: 0, pressure: 'LOW' };

    // Logarithmic decay formula
    const velocityFactor = Math.max(0.5, 2 - (velocity / 10)); // Higher velocity = lower factor
    const baseDiscount = Math.log10(stock + 1) * velocityFactor;
    const discount = Math.min(20, Math.max(0, baseDiscount));

    // Pressure level
    let pressure: 'HIGH' | 'MEDIUM' | 'LOW';
    if (stock > 500 && velocity < 2) pressure = 'HIGH';
    else if (stock > 200) pressure = 'MEDIUM';
    else pressure = 'LOW';

    return { discount, pressure };
};

// ============================================================================
// CATEGORY SYNERGY DETECTION
// ============================================================================

const CATEGORY_SYNERGIES: [SkincareCategory, SkincareCategory][] = [
    ['CLEANSER', 'TONER'],
    ['TONER', 'SERUM'],
    ['SERUM', 'MOISTURIZER'],
    ['MOISTURIZER', 'PROTECTION'],
];

export const detectCategorySynergies = (items: BundleItem[]): string[] => {
    const synergies: string[] = [];
    const categories = new Set(items.map(i => i.category));

    for (const [cat1, cat2] of CATEGORY_SYNERGIES) {
        if (categories.has(cat1) && categories.has(cat2)) {
            synergies.push(`${cat1} → ${cat2}`);
        }
    }

    return synergies;
};

// ============================================================================
// DROPSHIPPER PROFIT SIMULATOR
// ============================================================================

export const simulateDropshipperProfit = (
    items: BundleItem[],
    discountedTotal: number
): {
    totalCost: number;
    recommendedRetailPrice: number;
    projectedYield: number;
    copywritingTemplate: string;
} => {
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    const originalTotal = items.reduce((sum, item) => sum + item.price, 0);

    // Recommended retail = discounted price + 25% margin
    const recommendedRetailPrice = discountedTotal * 1.25;
    const projectedYield = recommendedRetailPrice - totalCost;

    const savingsPercent = ((originalTotal - discountedTotal) / originalTotal * 100).toFixed(0);

    const copywritingTemplate = `🌸 PAKET HEMAT SKINCARE! 🌸
${items.map(i => `✅ ${i.name}`).join('\n')}

💰 Harga Normal: Rp ${originalTotal.toLocaleString()}
🔥 HARGA PROMO: Rp ${Math.round(recommendedRetailPrice).toLocaleString()}
💸 HEMAT ${savingsPercent}%!

📦 FREE ONGKIR | 🎁 BONUS SAMPLE
⚡ Stok Terbatas! Order sekarang!`;

    return {
        totalCost,
        recommendedRetailPrice,
        projectedYield,
        copywritingTemplate
    };
};

// ============================================================================
// MAIN BUNDLE CALCULATOR
// ============================================================================

export const calculateBundle = (
    items: BundleItem[],
    isDropshipper: boolean = false
): BundleResult => {
    if (items.length === 0) {
        return {
            items: [],
            originalTotal: 0,
            discountedTotal: 0,
            savings: 0,
            savingsPercent: 0,
            savingsBreakdown: {
                inventoryRebate: 0,
                synergyBonus: 0,
                chainBonus: 0,
                completionBonus: 0,
                rolePrivilege: 0,
                multiItemBonus: 0,
                total: 0
            },
            synergies: [],
            routineProgress: {
                'CLEANSER': false,
                'TONER': false,
                'SERUM': false,
                'MOISTURIZER': false,
                'PROTECTION': false
            },
            routineComplete: false,
            collisions: [],
            isValid: true,
            circuitBreakerTriggered: false
        };
    }

    const originalTotal = items.reduce((sum, item) => sum + item.price, 0);
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

    // 1. Inventory Pressure (Logarithmic)
    let inventoryRebate = 0;
    items.forEach(item => {
        const { discount } = calculateInventoryPressure(item.stock, item.velocity || 1);
        inventoryRebate += item.price * (discount / 100);
    });

    // 2. Category Synergy Detection
    const synergies = detectCategorySynergies(items);
    const synergyBonus = synergies.length * (originalTotal * 0.03); // 3% per synergy

    // 3. Routine Chain Calculation
    const chain = calculateRoutineChain(items);
    const chainBonus = originalTotal * (chain.adjacencyBonus / 100);

    // 4. Completion Bonus (Full Routine)
    const completionBonus = chain.isComplete ? originalTotal * 0.10 : 0;

    // 5. Role Privilege (Dropshipper)
    const rolePrivilege = isDropshipper ? originalTotal * (DROPSHIPPER_PRIVILEGE_PERCENT / 100) : 0;

    // 6. Multi-item bonus
    let multiItemBonus = 0;
    if (items.length >= 3) multiItemBonus += originalTotal * 0.02;
    if (items.length >= 5) multiItemBonus += originalTotal * 0.03;

    // Calculate total savings
    const totalSavings = inventoryRebate + synergyBonus + chainBonus + completionBonus + rolePrivilege + multiItemBonus;

    // Proposed discounted price
    let discountedTotal = originalTotal - totalSavings;

    // Apply completion multiplier
    if (chain.isComplete) {
        discountedTotal = discountedTotal / COMPLETION_MULTIPLIER;
    }

    // CIRCUIT BREAKER - Ensure minimum margin
    const proposedMargin = ((discountedTotal - totalCost) / discountedTotal) * 100;
    let circuitBreakerTriggered = false;

    if (proposedMargin < MIN_MARGIN_PERCENT) {
        discountedTotal = totalCost / (1 - MIN_MARGIN_PERCENT / 100);
        circuitBreakerTriggered = true;
    }

    const savings = originalTotal - discountedTotal;
    const savingsPercent = (savings / originalTotal) * 100;

    // Chemical collisions
    const collisions = detectChemicalCollisions(items);

    // Dropshipper profit simulation
    let dropshipperProfit, recommendedRetailPrice, copywritingTemplate;
    if (isDropshipper) {
        const profitSim = simulateDropshipperProfit(items, discountedTotal);
        dropshipperProfit = profitSim.projectedYield;
        recommendedRetailPrice = profitSim.recommendedRetailPrice;
        copywritingTemplate = profitSim.copywritingTemplate;
    }

    return {
        items,
        originalTotal,
        discountedTotal,
        savings,
        savingsPercent,
        savingsBreakdown: {
            inventoryRebate,
            synergyBonus,
            chainBonus,
            completionBonus,
            rolePrivilege,
            multiItemBonus,
            total: totalSavings
        },
        synergies,
        routineProgress: chain.progress,
        routineComplete: chain.isComplete,
        collisions,
        isValid: collisions.length === 0 && discountedTotal > 0,
        circuitBreakerTriggered,
        dropshipperProfit,
        recommendedRetailPrice,
        copywritingTemplate
    };
};

// ============================================================================
// CONTEXTUAL SUGGESTER
// ============================================================================

export const suggestNextProduct = (
    currentItems: BundleItem[],
    allProducts: BundleItem[],
    isDropshipper: boolean = false
): BundleItem | null => {
    const currentCategories = new Set(currentItems.map(i => i.category));
    const currentIds = new Set(currentItems.map(i => i.id));

    // Find missing routine steps in order
    const missingCategories: SkincareCategory[] = [];
    for (const [cat, _order] of Object.entries(ROUTINE_ORDER)) {
        if (!currentCategories.has(cat as SkincareCategory)) {
            missingCategories.push(cat as SkincareCategory);
        }
    }

    // Prioritize next step in routine
    const priorityCategory = missingCategories[0];

    // Find candidates
    let candidates = allProducts.filter(p =>
        !currentIds.has(p.id) &&
        (!priorityCategory || p.category === priorityCategory)
    );

    // Dropshipper priority: high margin products
    if (isDropshipper) {
        candidates.sort((a, b) => {
            const marginA = ((a.price - a.cost) / a.price) * 100;
            const marginB = ((b.price - b.cost) / b.price) * 100;
            return marginB - marginA; // Higher margin first
        });
    } else {
        // Regular user: high stock first (better discount)
        candidates.sort((a, b) => b.stock - a.stock);
    }

    return candidates[0] || null;
};

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

export const generateMockBundleItems = (): BundleItem[] => {
    const categories: SkincareCategory[] = ['CLEANSER', 'TONER', 'SERUM', 'MOISTURIZER', 'PROTECTION'];
    const names: Record<SkincareCategory, string[]> = {
        'CLEANSER': ['Gentle Foam Cleanser', 'Oil Cleanser', 'Low pH Cleanser'],
        'TONER': ['Hydrating Toner', 'Exfoliating Toner', 'Calming Essence'],
        'SERUM': ['Vitamin C Serum', 'Niacinamide Serum', 'Retinol Serum', 'Hyaluronic Serum'],
        'MOISTURIZER': ['Gel Moisturizer', 'Barrier Cream', 'Sleeping Mask'],
        'PROTECTION': ['SPF50 Sunscreen', 'UV Shield Gel', 'Tinted Sunscreen']
    };

    const chemicalsByCategory: Record<SkincareCategory, number[]> = {
        'CLEANSER': [0],
        'TONER': [ChemicalMask.AHA, ChemicalMask.BHA, 0],
        'SERUM': [ChemicalMask.VITAMIN_C, ChemicalMask.NIACINAMIDE, ChemicalMask.RETINOL],
        'MOISTURIZER': [ChemicalMask.NIACINAMIDE, 0],
        'PROTECTION': [0]
    };

    return categories.flatMap((category, catIdx) => {
        const catNames = names[category];
        const chemicals = chemicalsByCategory[category];

        return catNames.map((name, nameIdx) => ({
            id: `BUNDLE-${1000 + catIdx * 10 + nameIdx}`,
            name,
            price: Math.floor(Math.random() * 100000) + 50000,
            cost: Math.floor(Math.random() * 40000) + 20000,
            stock: Math.floor(Math.random() * 1500) + 50,
            category,
            chemicalMask: chemicals[nameIdx % chemicals.length],
            velocity: Math.random() * 5 + 0.5,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=80'
        }));
    });
};
