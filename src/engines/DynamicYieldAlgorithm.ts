// DynamicYieldAlgorithm.ts - Margin Calculation & Propagation
// Pattern: Recursive Calculation with Validation

export interface TierConfig {
    tier: 'SILVER' | 'GOLD' | 'PLATINUM';
    minSales: number;
    marginBonus: number; // Additional % for dropshipper
    label: string;
}

export const TIER_LEVELS: TierConfig[] = [
    { tier: 'SILVER', minSales: 0, marginBonus: 0, label: 'Silver Partner' },
    { tier: 'GOLD', minSales: 50, marginBonus: 2, label: 'Gold Partner' },
    { tier: 'PLATINUM', minSales: 200, marginBonus: 5, label: 'Platinum Partner' }
];

export interface YieldResult {
    supplierPrice: number;
    ownerMargin: number;
    appBasePrice: number;
    dropshipperMargin: number;
    recommendedPrice: number;
    tierBonus: number;
    finalDropshipperMargin: number;
    isCompetitive: boolean;
    warning?: string;
}

// Calculate yield for a single product
export function calculateYield(
    supplierPrice: number,
    ownerMarginPercent: number,
    dropshipperMarginPercent: number,
    dropshipperTier: TierConfig['tier'] = 'SILVER',
    marketplaceCap?: number
): YieldResult {
    const tier = TIER_LEVELS.find(t => t.tier === dropshipperTier) || TIER_LEVELS[0];

    // Owner margin calculation
    const ownerMargin = supplierPrice * (ownerMarginPercent / 100);
    const appBasePrice = Math.ceil(supplierPrice + ownerMargin);

    // Dropshipper margin with tier bonus
    const baseDropshipperMargin = appBasePrice * (dropshipperMarginPercent / 100);
    const tierBonus = appBasePrice * (tier.marginBonus / 100);
    const finalDropshipperMargin = baseDropshipperMargin + tierBonus;
    const recommendedPrice = Math.ceil(appBasePrice + finalDropshipperMargin);

    // Competitiveness check
    let isCompetitive = true;
    let warning: string | undefined;

    if (marketplaceCap && recommendedPrice > marketplaceCap) {
        isCompetitive = false;
        warning = `Harga tidak kompetitif! Rp ${(recommendedPrice - marketplaceCap).toLocaleString()} di atas rata-rata pasar.`;
    }

    return {
        supplierPrice,
        ownerMargin,
        appBasePrice,
        dropshipperMargin: baseDropshipperMargin,
        recommendedPrice,
        tierBonus,
        finalDropshipperMargin,
        isCompetitive,
        warning
    };
}

// Simulate revenue projection
export interface RevenueProjection {
    currentMonthly: number;
    projectedMonthly: number;
    change: number;
    changePercent: number;
}

export function projectRevenue(
    currentOwnerMargin: number,
    newOwnerMargin: number,
    avgMonthlySales: number,
    avgProductPrice: number
): RevenueProjection {
    const currentMonthly = avgMonthlySales * avgProductPrice * (currentOwnerMargin / 100);
    const projectedMonthly = avgMonthlySales * avgProductPrice * (newOwnerMargin / 100);
    const change = projectedMonthly - currentMonthly;
    const changePercent = currentMonthly > 0 ? (change / currentMonthly) * 100 : 0;

    return { currentMonthly, projectedMonthly, change, changePercent };
}

// Propagate price changes across catalog
export interface CatalogItem {
    id: string;
    name: string;
    supplierPrice: number;
    currentAppPrice: number;
    currentRecommendedPrice: number;
}

export function propagatePriceChanges(
    catalog: CatalogItem[],
    ownerMarginPercent: number,
    dropshipperMarginPercent: number
): Array<CatalogItem & { newAppPrice: number; newRecommendedPrice: number }> {
    return catalog.map(item => {
        const yield_ = calculateYield(item.supplierPrice, ownerMarginPercent, dropshipperMarginPercent);
        return {
            ...item,
            newAppPrice: yield_.appBasePrice,
            newRecommendedPrice: yield_.recommendedPrice
        };
    });
}

// Get tier for dropshipper based on sales
export function getDropshipperTier(totalSales: number): TierConfig {
    return [...TIER_LEVELS].reverse().find(t => totalSales >= t.minSales) || TIER_LEVELS[0];
}
