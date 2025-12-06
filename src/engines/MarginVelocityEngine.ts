// MarginVelocityEngine.ts - Profit Calculations & Velocity Tracking
// Pattern: Aggregation & Projection Math

export interface Transaction {
    id: string;
    productId: string;
    productName: string;
    basePrice: number;      // Harga Modal
    sellingPrice: number;   // Harga Jual
    quantity: number;
    timestamp: number;
}

export interface FinancialMetrics {
    totalRevenue: number;
    totalCOGS: number;      // Cost of Goods Sold
    netProfit: number;
    profitMarginPercent: number;
    profitPerHour: number;
    roiPercent: number;
    goalProgress: number;   // 0-100%
}

// Aggregation Engine using Array.reduce
export function calculateMetrics(
    transactions: Transaction[],
    monthlyGoal: number = 5000000,
    hoursTracked: number = 24
): FinancialMetrics {
    const aggregated = transactions.reduce(
        (acc, tx) => {
            const revenue = tx.sellingPrice * tx.quantity;
            const cogs = tx.basePrice * tx.quantity;
            const profit = revenue - cogs;

            return {
                totalRevenue: acc.totalRevenue + revenue,
                totalCOGS: acc.totalCOGS + cogs,
                netProfit: acc.netProfit + profit
            };
        },
        { totalRevenue: 0, totalCOGS: 0, netProfit: 0 }
    );

    const profitMarginPercent = aggregated.totalRevenue > 0
        ? (aggregated.netProfit / aggregated.totalRevenue) * 100
        : 0;

    const profitPerHour = hoursTracked > 0
        ? aggregated.netProfit / hoursTracked
        : 0;

    const roiPercent = aggregated.totalCOGS > 0
        ? (aggregated.netProfit / aggregated.totalCOGS) * 100
        : 0;

    const goalProgress = Math.min(100, (aggregated.netProfit / monthlyGoal) * 100);

    return {
        ...aggregated,
        profitMarginPercent,
        profitPerHour,
        roiPercent,
        goalProgress
    };
}

// Daily Trend Data for Graph
export interface DailyDataPoint {
    date: string;
    revenue: number;
    cogs: number;
    profit: number;
}

export function aggregateByDay(transactions: Transaction[]): DailyDataPoint[] {
    const byDay = new Map<string, { revenue: number; cogs: number; profit: number }>();

    transactions.forEach(tx => {
        const date = new Date(tx.timestamp).toISOString().split('T')[0];
        const existing = byDay.get(date) || { revenue: 0, cogs: 0, profit: 0 };

        const revenue = tx.sellingPrice * tx.quantity;
        const cogs = tx.basePrice * tx.quantity;

        byDay.set(date, {
            revenue: existing.revenue + revenue,
            cogs: existing.cogs + cogs,
            profit: existing.profit + (revenue - cogs)
        });
    });

    return Array.from(byDay.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

// Product-Level ROI Analysis
export interface ProductROI {
    productId: string;
    productName: string;
    unitsSold: number;
    totalProfit: number;
    avgMarginPercent: number;
    roiPercent: number;
}

export function analyzeProductROI(transactions: Transaction[]): ProductROI[] {
    const byProduct = new Map<string, {
        name: string;
        units: number;
        revenue: number;
        cogs: number;
    }>();

    transactions.forEach(tx => {
        const existing = byProduct.get(tx.productId) || {
            name: tx.productName,
            units: 0,
            revenue: 0,
            cogs: 0
        };

        byProduct.set(tx.productId, {
            name: tx.productName,
            units: existing.units + tx.quantity,
            revenue: existing.revenue + (tx.sellingPrice * tx.quantity),
            cogs: existing.cogs + (tx.basePrice * tx.quantity)
        });
    });

    return Array.from(byProduct.entries()).map(([productId, data]) => {
        const profit = data.revenue - data.cogs;
        return {
            productId,
            productName: data.name,
            unitsSold: data.units,
            totalProfit: profit,
            avgMarginPercent: data.revenue > 0 ? (profit / data.revenue) * 100 : 0,
            roiPercent: data.cogs > 0 ? (profit / data.cogs) * 100 : 0
        };
    }).sort((a, b) => b.roiPercent - a.roiPercent);
}

// Mock Transaction Generator
export function generateMockTransactions(days: number = 7): Transaction[] {
    const products = [
        { id: 'P1', name: 'Scarlett Whitening', base: 60000, sell: 75000 },
        { id: 'P2', name: 'Somethinc Niacinamide', base: 90000, sell: 115000 },
        { id: 'P3', name: 'Avoskin Retinol', base: 114000, sell: 149000 },
        { id: 'P4', name: 'Azarine Sunscreen', base: 53000, sell: 65000 },
    ];

    const transactions: Transaction[] = [];
    const now = Date.now();

    for (let d = 0; d < days; d++) {
        const txPerDay = 3 + Math.floor(Math.random() * 8);
        for (let t = 0; t < txPerDay; t++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const qty = 1 + Math.floor(Math.random() * 4);

            transactions.push({
                id: `TX-${d}-${t}`,
                productId: product.id,
                productName: product.name,
                basePrice: product.base,
                sellingPrice: product.sell,
                quantity: qty,
                timestamp: now - (d * 24 * 60 * 60 * 1000) - (Math.random() * 12 * 60 * 60 * 1000)
            });
        }
    }

    return transactions;
}
