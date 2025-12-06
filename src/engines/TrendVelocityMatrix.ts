// TrendVelocityMatrix.ts - Time-Decay Moving Average Engine
// Pattern: Exponential Decay + Velocity Ranking

export interface SaleTransaction {
    productId: string;
    quantity: number;
    timestamp: number;
}

export interface VelocityProduct {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    velocityScore: number;
    momentum: 'BLAZING' | 'HOT' | 'WARM' | 'COOLING';
    depletionRate: number;      // % per hour
    stock: number;
    salesLast7Days: number[];   // Sparkline data
}

// Time decay constants
const DECAY_HALF_LIFE_HOURS = 12; // Value halves every 12 hours
const DECAY_FACTOR = Math.LN2 / (DECAY_HALF_LIFE_HOURS * 60 * 60 * 1000);

// Calculate time-weighted value
export const calculateTimeWeight = (timestamp: number, now: number = Date.now()): number => {
    const ageMs = now - timestamp;
    return Math.exp(-DECAY_FACTOR * ageMs);
};

// Calculate velocity score for a product
export const calculateVelocity = (
    transactions: SaleTransaction[],
    productId: string,
    windowHours: number = 24
): number => {
    const now = Date.now();
    const windowStart = now - (windowHours * 60 * 60 * 1000);

    const relevantTx = transactions.filter(
        tx => tx.productId === productId && tx.timestamp >= windowStart
    );

    if (relevantTx.length === 0) return 0;

    // Time-weighted sum
    const weightedSum = relevantTx.reduce((sum, tx) => {
        const weight = calculateTimeWeight(tx.timestamp, now);
        return sum + (tx.quantity * weight);
    }, 0);

    // Normalize by time window
    const hoursPassed = windowHours;
    return weightedSum / hoursPassed;
};

// Calculate depletion rate
export const calculateDepletionRate = (
    transactions: SaleTransaction[],
    productId: string,
    currentStock: number,
    hoursWindow: number = 24
): number => {
    const velocity = calculateVelocity(transactions, productId, hoursWindow);
    if (currentStock === 0) return 100;
    // % of stock depleted per hour
    return Math.min(100, (velocity / currentStock) * 100);
};

// Get momentum classification
export const getMomentum = (velocityScore: number): VelocityProduct['momentum'] => {
    if (velocityScore > 10) return 'BLAZING';
    if (velocityScore > 5) return 'HOT';
    if (velocityScore > 2) return 'WARM';
    return 'COOLING';
};

// Generate sparkline data (7 days)
export const generateSparklineData = (
    transactions: SaleTransaction[],
    productId: string
): number[] => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return Array.from({ length: 7 }, (_, i) => {
        const dayStart = now - ((6 - i) * dayMs);
        const dayEnd = dayStart + dayMs;

        return transactions
            .filter(tx =>
                tx.productId === productId &&
                tx.timestamp >= dayStart &&
                tx.timestamp < dayEnd
            )
            .reduce((sum, tx) => sum + tx.quantity, 0);
    });
};

// Rank products by velocity
export interface RankingResult {
    products: VelocityProduct[];
    hottest: VelocityProduct | null;
    avgVelocity: number;
}

export const rankByVelocity = (
    products: Array<{ id: string; name: string; brand: string; price: number; image: string; stock: number }>,
    transactions: SaleTransaction[]
): RankingResult => {
    const velocityProducts: VelocityProduct[] = products.map(p => {
        const velocityScore = calculateVelocity(transactions, p.id);
        const depletionRate = calculateDepletionRate(transactions, p.id, p.stock);
        const salesLast7Days = generateSparklineData(transactions, p.id);

        return {
            ...p,
            velocityScore,
            momentum: getMomentum(velocityScore),
            depletionRate,
            salesLast7Days
        };
    });

    // Sort by velocity (highest first)
    velocityProducts.sort((a, b) => b.velocityScore - a.velocityScore);

    const totalVelocity = velocityProducts.reduce((sum, p) => sum + p.velocityScore, 0);

    return {
        products: velocityProducts,
        hottest: velocityProducts[0] || null,
        avgVelocity: velocityProducts.length > 0 ? totalVelocity / velocityProducts.length : 0
    };
};

// Detect slow movers (for bundle integration)
export const detectSlowMovers = (
    velocityProducts: VelocityProduct[],
    threshold: number = 1.0
): VelocityProduct[] => {
    return velocityProducts.filter(p => p.velocityScore < threshold && p.stock > 100);
};

// Generate mock transactions
export const generateMockTransactions = (productIds: string[], count: number = 500): SaleTransaction[] => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    return Array.from({ length: count }, () => ({
        productId: productIds[Math.floor(Math.random() * productIds.length)],
        quantity: Math.floor(Math.random() * 5) + 1,
        timestamp: now - Math.random() * weekMs
    }));
};
