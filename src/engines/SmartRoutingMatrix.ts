// SmartRoutingMatrix.ts - SEO-Friendly URL Construction + Pre-Fetch
// Pattern: Parameter Parsing + Cache Warming

import { getBrandBySlug, type ScoredBrand } from './BrandResonanceEngine';

export interface RouteParams {
    brand: string;
    sort: 'bestseller' | 'newest' | 'price-low' | 'price-high';
    source: string;
    filters?: string[];
}

/**
 * Construct SEO-friendly catalog URL
 */
export const constructCatalogUrl = (
    brandSlug: string,
    options: Partial<RouteParams> = {}
): string => {
    const params = new URLSearchParams();

    params.set('brand', brandSlug);
    params.set('sort', options.sort || 'bestseller');
    params.set('source', options.source || 'homepage_highlight');

    if (options.filters && options.filters.length > 0) {
        params.set('filters', options.filters.join(','));
    }

    return `/catalog?${params.toString()}`;
};

/**
 * Parse URL parameters back to RouteParams
 */
export const parseRouteParams = (search: string): RouteParams | null => {
    const params = new URLSearchParams(search);
    const brand = params.get('brand');

    if (!brand) return null;

    return {
        brand,
        sort: (params.get('sort') as RouteParams['sort']) || 'bestseller',
        source: params.get('source') || 'direct',
        filters: params.get('filters')?.split(',').filter(Boolean)
    };
};

/**
 * Pre-fetch brand data for cache warming
 * Call this before navigation to make transition feel instant
 */
export const preFetchBrandData = async (brandSlug: string): Promise<boolean> => {
    const brand = getBrandBySlug(brandSlug);
    if (!brand) return false;

    // Simulate cache warming (in real app, would pre-load products)
    // Store in sessionStorage for instant access
    try {
        const cacheKey = `brand_prefetch_${brandSlug}`;
        const cacheData = {
            brand,
            fetchedAt: Date.now(),
            isWarmed: true
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        return true;
    } catch {
        return false;
    }
};

/**
 * Check if brand data is already cached
 */
export const isBrandCached = (brandSlug: string): boolean => {
    try {
        const cacheKey = `brand_prefetch_${brandSlug}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (!cached) return false;

        const data = JSON.parse(cached);
        // Cache valid for 5 minutes
        return Date.now() - data.fetchedAt < 5 * 60 * 1000;
    } catch {
        return false;
    }
};

/**
 * Generate navigation handler with pre-fetch
 */
export const createBrandNavigator = (
    brand: ScoredBrand,
    onNavigate: (url: string, brandId: string) => void
): (() => void) => {
    return () => {
        const url = constructCatalogUrl(brand.slug, { source: 'brand_showcase' });

        // Pre-fetch in background
        preFetchBrandData(brand.slug);

        // Trigger navigation
        onNavigate(url, brand.id);
    };
};
