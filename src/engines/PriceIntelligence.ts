import type { ProductTelemetry } from '../ProductTelemetry';
import type { Order } from '../context/GlobalStoreContext';

export interface PriceSuggestion {
    productId: string;
    productName: string;
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    actionType: 'INCREASE' | 'DECREASE' | 'HOLD';
}

/**
 * PriceIntelligenceProtocol
 * Heuristic engine to suggest pricing adjustments based on velocity and stock levels.
 */
export const analyzePriceElasticity = (
    products: ProductTelemetry[],
    orders: Order[]
): PriceSuggestion[] => {
    const suggestions: PriceSuggestion[] = [];
    const now = Date.now();
    const HOURS_TO_ANALYZE = 24;

    products.forEach(product => {
        // 1. Calculate Velocity (Units sold per hour)
        // Filter orders from last 24h
        const recentOrders = orders.filter(o => (now - o.timestamp) < (HOURS_TO_ANALYZE * 3600 * 1000));
        let unitsSold = 0;

        recentOrders.forEach(o => {
            const item = o.items.find(i => i.productId === product.id);
            if (item) unitsSold += item.quantity;
        });

        const velocityScore = unitsSold / HOURS_TO_ANALYZE;

        // 2. Analyze Stock Pressure
        const isScarcity = product.stockQty < 20;
        const isOverstock = product.stockQty > 100;

        // 3. Heuristic Rules
        if (velocityScore > 1.2 && isScarcity) {
            // High Demand + Low Stock -> Increase Price
            suggestions.push({
                productId: product.id,
                productName: product.name,
                currentPrice: product.basePrice,
                suggestedPrice: Math.ceil(product.basePrice * 1.05), // +5%
                reason: `High Velocity (${velocityScore.toFixed(2)}/hr) & Scarcity`,
                priority: 'HIGH',
                actionType: 'INCREASE'
            });
        } else if (velocityScore < 0.1 && isOverstock) {
            // Low Demand + High Stock -> Decrease Price (Clearance)
            suggestions.push({
                productId: product.id,
                productName: product.name,
                currentPrice: product.basePrice,
                suggestedPrice: Math.floor(product.basePrice * 0.90), // -10%
                reason: `Stagnant Inventory (>${product.stockQty} units)`,
                priority: 'MEDIUM',
                actionType: 'DECREASE'
            });
        }
    });

    return suggestions;
};
