import type { ProductTelemetry } from '../ProductTelemetry';


export interface ProductHealthMetric {
    productId: string;
    returnRate: number; // Percentage
    sentimentScore: number; // 0-5
    qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    totalReviews: number;
}

/**
 * FeedbackSync
 * Aggregates post-purchase signals to grade product quality.
 */
export const calculateProductHealth = (
    products: ProductTelemetry[]
): Map<string, ProductHealthMetric> => {
    const healthMap = new Map<string, ProductHealthMetric>();

    products.forEach(product => {
        // 1. Calculate Sentiment
        const reviews = product.reviews || [];
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0; // Default to neutral if no reviews

        // 2. Calculate Return Rate (Simulation)
        // We look for orders with this product that might be "cancelled" or hypothetical "returned" status
        // For simulation, we'll assume orders with 'PENDING' for too long or specific flag are issues.
        // Since we don't have explicit Return logic in Order interface yet, we'll mock it based on randomness seeded by ID
        // In real impl: const returns = orders.filter(o => o.items.some(i => i.productId === p.id) && o.status === 'RETURNED');

        // Mocking return rate stability based on rating
        // High rating = Low return rate
        const mockReturnRate = Math.max(0, (5 - avgRating) * 2); // e.g. 4.0 rating -> 2% return rate

        // 3. Grade
        let grade: ProductHealthMetric['qualityGrade'] = 'B';
        if (avgRating >= 4.5 && mockReturnRate < 2) grade = 'A';
        else if (avgRating >= 4.0) grade = 'B';
        else if (avgRating >= 3.0) grade = 'C';
        else if (avgRating >= 2.0) grade = 'D';
        else grade = 'F';

        healthMap.set(product.id, {
            productId: product.id,
            returnRate: parseFloat(mockReturnRate.toFixed(1)),
            sentimentScore: parseFloat(avgRating.toFixed(1)),
            qualityGrade: grade,
            totalReviews: reviews.length
        });
    });

    return healthMap;
};
