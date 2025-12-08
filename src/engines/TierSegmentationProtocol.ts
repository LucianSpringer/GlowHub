// TierSegmentationProtocol.ts - Automated Partner Classification
// Pattern: Weighted Scoring & Percentile Bucketing

export type PartnerTier = 'SILVER' | 'GOLD' | 'PLATINUM';

export interface DropshipperProfile {
    id: string;
    totalSalesAmount: number;     // GMV
    transactionCount: number;     // Frequency
    daysSinceLastSale: number;    // Recency
    joinDate: number;
    currentTier: PartnerTier;
}

export interface TierDefinition {
    tier: PartnerTier;
    minScore: number;
    marginBonus: number;          // % Discount on Base Price
    perks: string[];
}

// Configurable Weights
const SCORING_WEIGHTS = {
    SALES: 0.7,      // 70% weight on GMV
    FREQUENCY: 0.3   // 30% weight on consistency
};

const BASE_SCORE_DIVISOR = 100000; // Normalize money (e.g., 100k = 1 point)

export const TIER_CONFIG: TierDefinition[] = [
    {
        tier: 'PLATINUM',
        minScore: 80,
        marginBonus: 5.0,
        perks: ['Priority Support', 'Early Access', 'Max Margin']
    },
    {
        tier: 'GOLD',
        minScore: 30,
        marginBonus: 2.5,
        perks: ['Monthly Report', 'Standard Margin']
    },
    {
        tier: 'SILVER',
        minScore: 0,
        marginBonus: 0,
        perks: ['Basic Catalog']
    }
];

/**
 * 1. Calculate weighted performance score
 */
export const calculatePartnerScore = (profile: DropshipperProfile): number => {
    // Sales Score: 1 point per 100k revenue
    const salesScore = (profile.totalSalesAmount / BASE_SCORE_DIVISOR) * SCORING_WEIGHTS.SALES;

    // Frequency Score: 5 points per transaction
    const frequencyScore = (profile.transactionCount * 5) * SCORING_WEIGHTS.FREQUENCY;

    // Recency Penalty: -1 point per day inactive (max -50)
    const recencyPenalty = Math.min(50, profile.daysSinceLastSale);

    return Math.max(0, salesScore + frequencyScore - recencyPenalty);
};

/**
 * 2. Bucket Sort into Tiers
 */
export const determineTier = (score: number): TierDefinition => {
    // Find highest tier where score >= minScore
    return TIER_CONFIG.find(t => score >= t.minScore) || TIER_CONFIG[TIER_CONFIG.length - 1];
};

/**
 * 3. Generate Discount Vector (Session Injection)
 */
export const generateDiscountVector = (tier: PartnerTier): number => {
    const config = TIER_CONFIG.find(t => t.tier === tier);
    return config ? config.marginBonus : 0;
};

/**
 * Batch Rescoring Simulation
 * Returns the impact of a potential rules change
 */
export const simulateTierDistribution = (
    profiles: DropshipperProfile[],
    proposedConfig: TierDefinition[] = TIER_CONFIG
): Record<PartnerTier, number> => {
    const distribution: Record<PartnerTier, number> = {
        'SILVER': 0,
        'GOLD': 0,
        'PLATINUM': 0
    };

    profiles.forEach(p => {
        const score = calculatePartnerScore(p);
        const tierDef = proposedConfig.find(t => score >= t.minScore) || proposedConfig[proposedConfig.length - 1];
        distribution[tierDef.tier]++;
    });

    return distribution;
};
