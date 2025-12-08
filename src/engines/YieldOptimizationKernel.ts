// YieldOptimizationKernel.ts - Autonomous Pricing Logic
// Pattern: Control Loop (Sensors -> Logic -> Actuator)

export interface YieldSensors {
    currentROI: number;
    avgVelocity: number;           // 0-1 normalized velocity score
    marketDemand: 'LOW' | 'MEDIUM' | 'HIGH';
    inventoryLevel?: number;
    competitorPrice?: number;
}

export interface OptimizationResult {
    action: 'INCREASE' | 'DECREASE' | 'HOLD';
    adjustmentPercent: number;
    reason: string;
    confidence: number;
}

export interface OptimizationConfig {
    targetROI: number;            // e.g., 20%
    targetVelocity: number;       // e.g., 0.5 (normalized)
    safetyMinMargin: number;      // e.g., 5% (Circuit Breaker)
    safetyMaxMargin: number;      // e.g., 50% (Gouging Prevention)
    elasticityFactor: number;     // Sensitivity to velocity changes (0.1 - 1.0)
}

/**
 * YieldOptimizationKernel - Core decision engine for margin optimization
 * [FIXED] Now using roiDiff for threshold-based decisions
 */
export const YieldOptimizationKernel = {
    evaluate: (sensors: YieldSensors, targetROI: number): OptimizationResult => {
        // [FIXED] Activated Logic - Compare current ROI vs target
        const roiDiff = sensors.currentROI - targetROI;

        // High Yield Logic: Elasticity Check based on ROI differential
        if (roiDiff < -5) {
            // Profit is MORE THAN 5% below target - need to raise margins
            if (sensors.avgVelocity > 0.8) {
                // High velocity supports price increase
                return {
                    action: 'INCREASE',
                    adjustmentPercent: 5,
                    reason: 'Velocity supports margin expansion (+5%)',
                    confidence: 90
                };
            } else if (sensors.avgVelocity > 0.5) {
                // Moderate velocity - smaller increase
                return {
                    action: 'INCREASE',
                    adjustmentPercent: 3,
                    reason: 'Moderate velocity allows cautious price hike (+3%)',
                    confidence: 75
                };
            } else {
                // Low velocity - cannot raise prices
                return {
                    action: 'HOLD',
                    adjustmentPercent: 0,
                    reason: 'Velocity too low to support price hike',
                    confidence: 60
                };
            }
        }

        if (roiDiff > 10) {
            // Profit is WAY above target (+10%) - opportunity for market capture
            return {
                action: 'DECREASE',
                adjustmentPercent: -3,
                reason: 'Aggressive pricing to boost volume (-3%)',
                confidence: 85
            };
        }

        if (roiDiff > 5) {
            // Profit moderately above target
            if (sensors.avgVelocity < 0.3) {
                // Low velocity, high profit - reduce to stimulate demand
                return {
                    action: 'DECREASE',
                    adjustmentPercent: -2,
                    reason: 'Stimulating demand via price correction (-2%)',
                    confidence: 70
                };
            }
        }

        // Within optimal corridor (-5% to +5% of target)
        return {
            action: 'HOLD',
            adjustmentPercent: 0,
            reason: 'Yield within optimal corridor',
            confidence: 95
        };
    },

    /**
     * Batch evaluation for catalog optimization
     */
    evaluateCatalog: (
        products: Array<{ id: string; sensors: YieldSensors }>,
        targetROI: number
    ): Array<{ id: string; result: OptimizationResult }> => {
        return products.map(p => ({
            id: p.id,
            result: YieldOptimizationKernel.evaluate(p.sensors, targetROI)
        }));
    }
};

// Legacy export for backward compatibility
export const calculateOptimization = (
    currentMargin: number,
    sensors: { averageVelocity: number; currentROI: number; inventoryLevel: number },
    config: OptimizationConfig
): { action: 'RAISE' | 'LOWER' | 'HOLD'; recommendedMargin: number; reason: string; confidence: number; isSafetyTriggered: boolean } => {
    const yieldSensors: YieldSensors = {
        currentROI: sensors.currentROI,
        avgVelocity: sensors.averageVelocity / config.targetVelocity, // Normalize
        marketDemand: sensors.averageVelocity > config.targetVelocity * 1.5 ? 'HIGH'
            : sensors.averageVelocity < config.targetVelocity * 0.5 ? 'LOW' : 'MEDIUM',
        inventoryLevel: sensors.inventoryLevel
    };

    const result = YieldOptimizationKernel.evaluate(yieldSensors, config.targetROI);

    let newMargin = currentMargin + result.adjustmentPercent;
    let isSafetyTriggered = false;

    // Safety Circuit Breaker
    if (newMargin < config.safetyMinMargin) {
        newMargin = config.safetyMinMargin;
        isSafetyTriggered = true;
    } else if (newMargin > config.safetyMaxMargin) {
        newMargin = config.safetyMaxMargin;
        isSafetyTriggered = true;
    }

    const actionMap = { 'INCREASE': 'RAISE', 'DECREASE': 'LOWER', 'HOLD': 'HOLD' } as const;

    return {
        action: actionMap[result.action],
        recommendedMargin: Math.round(newMargin * 10) / 10,
        reason: isSafetyTriggered ? `Safety Breaker: ${result.reason}` : result.reason,
        confidence: result.confidence,
        isSafetyTriggered
    };
};

export const optimizeCatalog = (
    products: Array<{ id: string; margin: number; sensors: { averageVelocity: number; currentROI: number; inventoryLevel: number } }>,
    config: OptimizationConfig
) => products.map(p => ({
    id: p.id,
    recommendation: calculateOptimization(p.margin, p.sensors, config)
}));
