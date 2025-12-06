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

// ============================================================================
// OOS PREDICTION ALGORITHM - Time-Series Stock Prediction
// ============================================================================

export type StockStatus = 'CRITICAL' | 'WARNING' | 'SAFE';

export interface OOSPrediction {
    timeToEmptyHours: number;
    status: StockStatus;
    velocityPerHour: number;
    formattedTime: string;
}

/**
 * Estimate time until product runs out of stock
 * Uses velocity from last 6 hours for accurate prediction
 */
export const estimateTimeToEmpty = (
    stock: number,
    velocityPerHour: number
): OOSPrediction => {
    if (velocityPerHour <= 0 || stock <= 0) {
        return {
            timeToEmptyHours: stock <= 0 ? 0 : Infinity,
            status: stock <= 0 ? 'CRITICAL' : 'SAFE',
            velocityPerHour: 0,
            formattedTime: stock <= 0 ? 'HABIS' : '∞'
        };
    }

    const timeToZero = stock / velocityPerHour;

    // Status thresholds
    let status: StockStatus;
    if (timeToZero < 12) status = 'CRITICAL';
    else if (timeToZero < 48) status = 'WARNING';
    else status = 'SAFE';

    // Format time string
    let formattedTime: string;
    if (timeToZero < 1) {
        formattedTime = `${Math.round(timeToZero * 60)} menit`;
    } else if (timeToZero < 24) {
        formattedTime = `${Math.round(timeToZero)} jam`;
    } else if (timeToZero < 168) { // < 1 week
        formattedTime = `${Math.round(timeToZero / 24)} hari`;
    } else {
        formattedTime = `${Math.round(timeToZero / 168)} minggu`;
    }

    return {
        timeToEmptyHours: timeToZero,
        status,
        velocityPerHour,
        formattedTime
    };
};

// ============================================================================
// TREND MOMENTUM DERIVATIVE - Rate of Change Detection
// ============================================================================

export type TrendDirection = 'ACCELERATING' | 'STABLE' | 'DECELERATING';

export interface MomentumDerivative {
    direction: TrendDirection;
    deltaPercent: number;
    emoji: string;
}

/**
 * Calculate rate of change between current and previous velocity
 * +20% = ACCELERATING, -20% = DECELERATING
 */
export const calculateMomentumDerivative = (
    currentVelocity: number,
    previousVelocity: number
): MomentumDerivative => {
    if (previousVelocity === 0) {
        return {
            direction: currentVelocity > 0 ? 'ACCELERATING' : 'STABLE',
            deltaPercent: currentVelocity > 0 ? 100 : 0,
            emoji: currentVelocity > 0 ? '🚀' : '➡️'
        };
    }

    const deltaPercent = ((currentVelocity - previousVelocity) / previousVelocity) * 100;

    if (deltaPercent > 20) {
        return { direction: 'ACCELERATING', deltaPercent, emoji: '🚀' };
    } else if (deltaPercent < -20) {
        return { direction: 'DECELERATING', deltaPercent, emoji: '📉' };
    } else {
        return { direction: 'STABLE', deltaPercent, emoji: '➡️' };
    }
};

// ============================================================================
// LIVE TRANSACTION STREAM - Stochastic Injection
// ============================================================================

/**
 * Inject random transactions to simulate real-time activity
 */
export const injectRandomTransactions = (
    transactions: SaleTransaction[],
    productIds: string[],
    count: number = 3
): SaleTransaction[] => {
    const now = Date.now();
    const newTransactions: SaleTransaction[] = Array.from({ length: count }, () => ({
        productId: productIds[Math.floor(Math.random() * productIds.length)],
        quantity: Math.floor(Math.random() * 3) + 1,
        timestamp: now - Math.random() * 60000 // Last minute
    }));

    return [...transactions, ...newTransactions];
};

// ============================================================================
// BRAND DISTRIBUTION ANALYSIS
// ============================================================================

export interface BrandDistribution {
    brand: string;
    count: number;
    percentage: number;
    color: string;
}

const BRAND_COLORS: Record<string, string> = {
    'SCARLETT': '#FF6B9D',
    'SOMETHINC': '#8B5CF6',
    'AVOSKIN': '#10B981',
    'WARDAH': '#06B6D4',
    'EMINA': '#F59E0B',
};

/**
 * Calculate brand distribution in top products
 */
export const calculateBrandDistribution = (
    products: VelocityProduct[]
): BrandDistribution[] => {
    const brandCounts = new Map<string, number>();

    products.forEach(p => {
        brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
    });

    const total = products.length || 1;

    return Array.from(brandCounts.entries())
        .map(([brand, count]) => ({
            brand,
            count,
            percentage: (count / total) * 100,
            color: BRAND_COLORS[brand] || '#64748B'
        }))
        .sort((a, b) => b.count - a.count);
};

