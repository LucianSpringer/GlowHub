// TrendHeuristicScanner.ts - Weighted Sorting Algorithm for Product Trends
// Pattern: Scoring & FOMO Injection

export interface TrendProduct {
    id: string;
    name: string;
    brand: string;
    price: number;
    margin: number;
    salesThisWeek: number;
    rating: number;         // 0-5
    stockRemaining: number;
    imageUrl: string;

    // Computed
    viralityScore?: number;
    trendDirection?: 'UP' | 'DOWN' | 'STABLE';
    urgencyFlag?: 'NONE' | 'LOW' | 'HIGH';
    depletionRate?: number; // % per day
}

// Scoring Weights
const WEIGHTS = {
    SALES: 0.5,
    RATING: 0.3,
    STOCK_PENALTY: -0.2
};

// Virality Score Calculator
export function calculateViralityScore(product: TrendProduct): number {
    const salesScore = Math.min(product.salesThisWeek / 100, 1) * 100; // Normalize to 0-100
    const ratingScore = (product.rating / 5) * 100;
    const stockScore = Math.min(product.stockRemaining / 50, 1) * 100;

    return (
        salesScore * WEIGHTS.SALES +
        ratingScore * WEIGHTS.RATING +
        stockScore * WEIGHTS.STOCK_PENALTY
    );
}

// Trend Direction (compared to previous week - simulated)
export function determineTrendDirection(product: TrendProduct): TrendProduct['trendDirection'] {
    // Simulate based on sales volume
    if (product.salesThisWeek > 50) return 'UP';
    if (product.salesThisWeek < 20) return 'DOWN';
    return 'STABLE';
}

// FOMO Injection
export function determineUrgency(product: TrendProduct): TrendProduct['urgencyFlag'] {
    if (product.stockRemaining < 10) return 'HIGH';
    if (product.stockRemaining < 25) return 'LOW';
    return 'NONE';
}

// Depletion Rate Calculator
export function calculateDepletionRate(product: TrendProduct): number {
    // Assume weekly sales divided by 7 days, compared to stock
    const dailySales = product.salesThisWeek / 7;
    if (product.stockRemaining === 0) return 100;
    return Math.min(100, (dailySales / product.stockRemaining) * 100);
}

// Main Scanner Function
export function scanTrendingProducts(products: TrendProduct[]): TrendProduct[] {
    return products
        .map(p => ({
            ...p,
            viralityScore: calculateViralityScore(p),
            trendDirection: determineTrendDirection(p),
            urgencyFlag: determineUrgency(p),
            depletionRate: calculateDepletionRate(p)
        }))
        .sort((a, b) => (b.viralityScore || 0) - (a.viralityScore || 0));
}

// Filter by Urgency (for notifications)
export function getUrgentProducts(products: TrendProduct[]): TrendProduct[] {
    return scanTrendingProducts(products).filter(p => p.urgencyFlag === 'HIGH');
}

// Calculate Potential Margin on Hover
export function calculatePotentialMargin(product: TrendProduct, quantity: number = 1): {
    costPrice: number;
    sellPrice: number;
    grossMargin: number;
    marginPercent: number;
} {
    const costPrice = (product.price - product.margin) * quantity;
    const sellPrice = product.price * quantity;
    const grossMargin = product.margin * quantity;
    const marginPercent = (grossMargin / sellPrice) * 100;

    return { costPrice, sellPrice, grossMargin, marginPercent };
}

// Mock Product Generator
export function generateMockTrendProducts(): TrendProduct[] {
    return [
        {
            id: 'TP-01', name: 'Scarlett Brightening Serum', brand: 'SCARLETT',
            price: 89000, margin: 18000, salesThisWeek: 78, rating: 4.8, stockRemaining: 8,
            imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300'
        },
        {
            id: 'TP-02', name: 'Niacinamide 10%', brand: 'SOMETHINC',
            price: 125000, margin: 28000, salesThisWeek: 92, rating: 4.9, stockRemaining: 45,
            imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b3b7d5d7fb5?w=300'
        },
        {
            id: 'TP-03', name: 'Miraculous Retinol Ampoule', brand: 'AVOSKIN',
            price: 159000, margin: 38000, salesThisWeek: 34, rating: 4.7, stockRemaining: 5,
            imageUrl: 'https://images.unsplash.com/photo-1571781348782-92c8812e8836?w=300'
        },
        {
            id: 'TP-04', name: 'Hydrasoothe Sunscreen SPF50', brand: 'AZARINE',
            price: 72000, margin: 14000, salesThisWeek: 156, rating: 4.6, stockRemaining: 120,
            imageUrl: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=300'
        },
        {
            id: 'TP-05', name: '5X Ceramide Barrier Cream', brand: 'SKINTIFIC',
            price: 145000, margin: 32000, salesThisWeek: 67, rating: 4.9, stockRemaining: 22,
            imageUrl: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300'
        },
        {
            id: 'TP-06', name: 'Pink Juice Brightening', brand: 'WHITELAB',
            price: 85000, margin: 17000, salesThisWeek: 41, rating: 4.5, stockRemaining: 3,
            imageUrl: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=300'
        }
    ];
}
