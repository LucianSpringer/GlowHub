// BrandResonanceEngine.ts - Weighted Moving Average Brand Sorting
// Pattern: Scoring + Promotional Injection + Telemetry Integration

import { _BRAND_DB, type BrandProfile } from '../data/MarketData';

export interface ScoredBrand extends BrandProfile {
    resonanceScore: number;
    scoreBreakdown: {
        productScore: number;
        ratingScore: number;
        stockScore: number;
        promoBoost: number;
        telemetryBoost: number;
    };
}

// Stock status scoring
const STOCK_BONUS: Record<string, number> = {
    'AMPLE': 10,
    'LIMITED': -20,
    'CRITICAL': -50
};

// Tier multiplier
const TIER_MULTIPLIER: Record<string, number> = {
    'PLATINUM': 1.2,
    'GOLD': 1.0,
    'SILVER': 0.8
};

/**
 * Calculate ResonanceScore for a single brand
 * Formula: (ProductCount * 0.3) + (Rating * 20) + StockBonus + PromoWeight + TelemetryBoost
 */
export const calculateResonanceScore = (
    brand: BrandProfile,
    telemetryInteractions: number = 0
): ScoredBrand => {
    const productScore = brand.productCount * 0.3;
    const ratingScore = brand.avgRating * 20;
    const stockScore = STOCK_BONUS[brand.stockStatus] || 0;
    const promoBoost = brand.promotionalWeight || 0;
    const telemetryBoost = Math.min(telemetryInteractions * 5, 30); // Cap at 30

    const baseScore = productScore + ratingScore + stockScore + promoBoost + telemetryBoost;
    const finalScore = baseScore * (TIER_MULTIPLIER[brand.tier] || 1);

    return {
        ...brand,
        resonanceScore: Math.round(finalScore * 10) / 10,
        scoreBreakdown: {
            productScore: Math.round(productScore * 10) / 10,
            ratingScore: Math.round(ratingScore * 10) / 10,
            stockScore,
            promoBoost,
            telemetryBoost
        }
    };
};

/**
 * Get all brands sorted by ResonanceScore
 */
export const getSortedBrands = (
    telemetryData: Record<string, number> = {},
    featuredOnly: boolean = false
): ScoredBrand[] => {
    let brands = _BRAND_DB;

    if (featuredOnly) {
        brands = brands.filter(b => b.isFeatured);
    }

    return brands
        .map(brand => calculateResonanceScore(brand, telemetryData[brand.id] || 0))
        .sort((a, b) => b.resonanceScore - a.resonanceScore);
};

/**
 * Get brand by slug for routing
 */
export const getBrandBySlug = (slug: string): BrandProfile | undefined => {
    return _BRAND_DB.find(b => b.slug === slug);
};

/**
 * Get top N brands (for hero section personalization)
 */
export const getTopBrands = (n: number = 3): ScoredBrand[] => {
    return getSortedBrands({}, false).slice(0, n);
};
