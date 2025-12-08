// SupplyChainDistributor.ts - Multi-Layer Pricing Calculator
// Pattern: Cascade Calculation

export interface SupplyChainNode {
    supplierCost: number;     // HPP from Source
    ownerMargin: number;      // Platform Cut
    ownerPrice: number;       // Price sold to Reseller
    resellerMargin: number;   // Reseller Profit
    consumerPrice: number;    // End Consumer Price
    affiliateCut: number;     // Optional affiliate commission (included in margin)
    marketCap: number;        // Market Ceiling
    isCompetitive: boolean;
}

export interface PricingConfig {
    ownerMarginPercent: number;
    resellerMarginPercent: number;
    affiliatePercent?: number; // % of Consumer Price
}

/**
 * Calculate the full stack of pricing
 */
export const calculateSupplyChainStack = (
    supplierCost: number,
    marketCap: number,
    config: PricingConfig
): SupplyChainNode => {
    // 1. Owner Layer
    const ownerProfit = supplierCost * (config.ownerMarginPercent / 100);
    const ownerPrice = supplierCost + ownerProfit;

    // 2. Reseller Layer (Markup on Owner Price)
    const resellerProfit = ownerPrice * (config.resellerMarginPercent / 100);
    const consumerPrice = ownerPrice + resellerProfit;

    // 3. Affiliate Layer (Taken FROM Consumer Price, usually by Reseller's decision, or platform enforced)
    // Here we treat it as a portion of the Reseller's potential profit or a separate add-on. 
    // To match common models: Affiliate fee is usually marketing cost DEDUCTED from Reseller Margin, OR added on top.
    // Let's assume standard model: Consumer Price includes everything. Affiliate cut is calculated for visibility.
    const affiliateCut = config.affiliatePercent ? consumerPrice * (config.affiliatePercent / 100) : 0;

    // 4. Validation
    const isCompetitive = consumerPrice <= marketCap;

    return {
        supplierCost: Math.round(supplierCost),
        ownerMargin: Math.round(ownerProfit),
        ownerPrice: Math.round(ownerPrice),
        resellerMargin: Math.round(resellerProfit),
        consumerPrice: Math.round(consumerPrice),
        affiliateCut: Math.round(affiliateCut),
        marketCap,
        isCompetitive
    };
};

/**
 * "What If" Simulator
 * Returns max viable Owner Margin given a fixed Market Cap and required Reseller Margin
 */
export const findMaxViableOwnerMargin = (
    supplierCost: number,
    marketCap: number,
    requiredResellerMarginPercent: number
): number => {
    // Reverse Engineering:
    // ConsumerPrice = OwnerPrice * (1 + Reseller%)
    // OwnerPrice = SupplierCost * (1 + Owner%)
    // Therefore: MarketCap = SupplierCost * (1 + Owner%) * (1 + Reseller%)

    // (1 + Owner%) = MarketCap / (SupplierCost * (1 + Reseller%))
    // Owner% = (MarketCap / (SupplierCost * (1 + Reseller%))) - 1

    const resellerMultiplier = 1 + (requiredResellerMarginPercent / 100);
    const maxOwnerMultiplier = marketCap / (supplierCost * resellerMultiplier);
    const maxOwnerPercent = (maxOwnerMultiplier - 1) * 100;

    return Math.max(0, Math.floor(maxOwnerPercent));
};
