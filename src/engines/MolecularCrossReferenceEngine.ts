// MolecularCrossReferenceEngine.ts - Ingredient-based Product Discovery
// Pattern: CrossReference + SocialProofRouting

import { PRODUCT_CATALOG, type ProductTelemetry } from '../ProductTelemetry';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MoleculeMatch {
    product: ProductTelemetry;
    sharedIngredients: string[];
    matchScore: number;
}

export interface CrossReferenceResult {
    ingredientId: string;
    ingredientName: string;
    currentProductId: string;
    matches: MoleculeMatch[];
    totalMatches: number;
    isUnique: boolean;
}

export interface LinkedReview {
    reviewId: string;
    linkedProductId: string;
    productName: string;
    productBrand: string;
    productImage: string;
    productPrice: number;
    isProductAvailable: boolean;
}

// ============================================================================
// MOLECULAR CROSS-REFERENCE ENGINE
// ============================================================================

/**
 * Find all products containing a specific ingredient
 */
export const findProductsByIngredient = (
    ingredientId: string,
    excludeProductId?: string
): ProductTelemetry[] => {
    return PRODUCT_CATALOG.filter(product =>
        product.ingredients.includes(ingredientId) &&
        product.id !== excludeProductId &&
        product.stockQty > 0
    );
};

/**
 * Get cross-reference result for an ingredient
 */
export const getCrossReferenceResult = (
    ingredientId: string,
    currentProductId: string,
    ingredientNameOverride?: string
): CrossReferenceResult => {
    // Use override name or fallback to ID
    const ingredientName = ingredientNameOverride || ingredientId;

    const matchingProducts = findProductsByIngredient(ingredientId, currentProductId);

    const matches: MoleculeMatch[] = matchingProducts.map(product => {
        // Calculate match score based on shared ingredients
        const sharedIngredients = product.ingredients.filter(ing =>
            PRODUCT_CATALOG.find(p => p.id === currentProductId)?.ingredients.includes(ing)
        );

        const matchScore = Math.min(100, sharedIngredients.length * 25);

        return {
            product,
            sharedIngredients,
            matchScore
        };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return {
        ingredientId,
        ingredientName,
        currentProductId,
        matches,
        totalMatches: matches.length,
        isUnique: matches.length === 0
    };
};

/**
 * Get count of products containing an ingredient (for badge)
 */
export const getIngredientProductCount = (
    ingredientId: string,
    excludeProductId?: string
): number => {
    return findProductsByIngredient(ingredientId, excludeProductId).length;
};

// ============================================================================
// SOCIAL PROOF ROUTING PROTOCOL
// ============================================================================

/**
 * Lookup product by ID and validate availability
 */
export const lookupProductForReview = (productId: string): {
    product: ProductTelemetry | null;
    isAvailable: boolean;
} => {
    const product = PRODUCT_CATALOG.find(p => p.id === productId);

    if (!product) {
        return { product: null, isAvailable: false };
    }

    return {
        product,
        isAvailable: product.stockQty > 0
    };
};

/**
 * Enrich review with linked product data
 */
export const enrichReviewWithProduct = (
    review: { id: string; productId?: string },
    fallbackProductName?: string
): LinkedReview | null => {
    // If review has linked product ID
    if (review.productId) {
        const { product, isAvailable } = lookupProductForReview(review.productId);

        if (product) {
            return {
                reviewId: review.id,
                linkedProductId: product.id,
                productName: product.name,
                productBrand: product.brand,
                productImage: product.media[0]?.url || '',
                productPrice: product.marketPrice,
                isProductAvailable: isAvailable
            };
        }
    }

    // Fallback: Try to match by product name
    if (fallbackProductName) {
        const matchedProduct = PRODUCT_CATALOG.find(p =>
            p.name.toLowerCase().includes(fallbackProductName.toLowerCase()) ||
            fallbackProductName.toLowerCase().includes(p.name.toLowerCase())
        );

        if (matchedProduct) {
            return {
                reviewId: review.id,
                linkedProductId: matchedProduct.id,
                productName: matchedProduct.name,
                productBrand: matchedProduct.brand,
                productImage: matchedProduct.media[0]?.url || '',
                productPrice: matchedProduct.marketPrice,
                isProductAvailable: matchedProduct.stockQty > 0
            };
        }
    }

    return null;
};

/**
 * Get related products from testimonial (for "Shop This Look")
 */
export const getTestimonialProducts = (
    testimonialProductId: string,
    limit: number = 3
): ProductTelemetry[] => {
    const mainProduct = PRODUCT_CATALOG.find(p => p.id === testimonialProductId);

    if (!mainProduct) return [];

    // Find products with overlapping ingredients
    const related = PRODUCT_CATALOG
        .filter(p =>
            p.id !== testimonialProductId &&
            p.stockQty > 0 &&
            p.ingredients.some(ing => mainProduct.ingredients.includes(ing))
        )
        .sort((a, b) => {
            // Sort by ingredient overlap
            const overlapA = a.ingredients.filter(ing => mainProduct.ingredients.includes(ing)).length;
            const overlapB = b.ingredients.filter(ing => mainProduct.ingredients.includes(ing)).length;
            return overlapB - overlapA;
        })
        .slice(0, limit);

    return related;
};
