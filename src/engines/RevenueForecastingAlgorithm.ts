// RevenueForecastingAlgorithm.ts - Future Projection Engine
// Pattern: Linear Regression + Chaos Theory (Scenario Planning)

export interface HistoricalDatapoint {
    timestamp: number;
    revenue: number;
}

export type ForecastScenario = 'OPTIMISTIC' | 'BASELINE' | 'PESSIMISTIC';

export interface ProjectionPoint {
    timestamp: number;
    revenue: number;
    scenario: ForecastScenario;
}

export interface ScenarioResult {
    totalRevenue: number;
    growthRate: number;
    points: ProjectionPoint[];
}

const SCENARIO_MULTIPLIERS = {
    OPTIMISTIC: 1.15, // Viral Growth (+15% deviation)
    BASELINE: 1.0,    // Standard Trend
    PESSIMISTIC: 0.85 // Market Churn (-15% deviation)
};

/**
 * Calculate basic linear regression slope and intercept
 */
const calculateTrend = (data: HistoricalDatapoint[]): { slope: number; intercept: number; anchor: HistoricalDatapoint } => {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: 0, anchor: data[0] || { timestamp: Date.now(), revenue: 0 } };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    // Normalize X to 0,1,2... to avoid massive timestamp numbers causing float errors
    const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
    // [FIXED] Activated - Use first point as anchor for projection baseline
    const startObj = sorted[0];

    sorted.forEach((p, i) => {
        sumX += i;
        sumY += p.revenue;
        sumXY += i * p.revenue;
        sumXX += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept, anchor: startObj };
};

/**
 * Generate 3-Line Forecast for "The Crystal Ball" Viewport
 */
export const generateScenarios = (
    history: HistoricalDatapoint[],
    daysToProject: number = 30
): Record<ForecastScenario, ScenarioResult> => {
    const { slope, intercept } = calculateTrend(history);
    const lastTimestamp = history[history.length - 1].timestamp;
    const dayMs = 24 * 60 * 60 * 1000;

    const createProjection = (multiplier: number, type: ForecastScenario): ScenarioResult => {
        const points: ProjectionPoint[] = [];
        let runningTotal = 0;

        for (let i = 1; i <= daysToProject; i++) {
            // y = mx + b (x is history length + i)
            // Apply multiplier to the SLOPE (velocity), not just the result
            const baseValue = (slope * (history.length + i)) + intercept;

            // Apply chaos/scenario factor
            // Logic: Optimistic grows faster over time, Pessimistic decays
            const timeWeight = 1 + ((multiplier - 1) * (i / daysToProject));
            const adjustedRevenue = Math.max(0, baseValue * timeWeight);

            points.push({
                timestamp: lastTimestamp + (i * dayMs),
                revenue: adjustedRevenue,
                scenario: type
            });
            runningTotal += adjustedRevenue;
        }

        const startRev = history[history.length - 1].revenue;
        const endRev = points[points.length - 1].revenue;
        const growthRate = startRev > 0 ? ((endRev - startRev) / startRev) * 100 : 0;

        return {
            totalRevenue: runningTotal,
            growthRate,
            points
        };
    };

    return {
        OPTIMISTIC: createProjection(SCENARIO_MULTIPLIERS.OPTIMISTIC, 'OPTIMISTIC'),
        BASELINE: createProjection(SCENARIO_MULTIPLIERS.BASELINE, 'BASELINE'),
        PESSIMISTIC: createProjection(SCENARIO_MULTIPLIERS.PESSIMISTIC, 'PESSIMISTIC')
    };
};
