// ContentResonanceEngine.ts - Intelligent Content Engine v2.0
// Pattern: AttentionHeatmap + SemanticVectorMapping + DynamicThemeSynthesis

import { PRODUCT_CATALOG, type ProductTelemetry } from '../ProductTelemetry';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface KeywordMatch {
    keyword: string;
    position: number;
    paragraphIndex: number;
    matchType: 'INGREDIENT' | 'CONCERN' | 'BRAND';
}

export interface BlogArticle {
    id: string;
    title: string;
    content: string;
    paragraphs: string[];
    tags: number;  // Bitwise tags
    primaryKeyword: string;
    themeCategory: ThemeCategory;
    embeddedSku?: string;
    publishedAt: number;
}

export interface InjectionPoint {
    afterParagraphIndex: number;
    product: ProductTelemetry;
    relevanceScore: number;
    matchedKeywords: string[];
}

// Theme categories for DynamicThemeSynthesizer
export type ThemeCategory = 'ACNE' | 'BRIGHTENING' | 'HYDRATION' | 'ANTI_AGING' | 'BARRIER' | 'DEFAULT';

// Routine cluster for multi-product recommendation
export interface RoutineCluster {
    primary: ProductTelemetry;
    supporting: ProductTelemetry[];
    totalSavings: number;
    routineName: string;
}

// Reading telemetry data
export interface ReadingSegment {
    id: string;
    index: number;
    keywords: string[];
    timeSpentMs: number;
    isActive: boolean;
}

// Conversion attribution
export interface ConversionAttribution {
    articleId: string;
    productId: string;
    source: 'blog_widget' | 'blog_modal' | 'blog_sidebar';
    timestamp: number;
}

// ============================================================================
// KEYWORD DICTIONARIES
// ============================================================================

const INGREDIENT_KEYWORDS: Record<string, string[]> = {
    'niacinamide': ['ING-01'],
    'retinol': ['ING-05'],
    'vitamin c': ['ING-01'],
    'hyaluronic acid': ['ING-02'],
    'hyaluronic': ['ING-02'],
    'salicylic acid': ['ING-03'],
    'salicylic': ['ING-03'],
    'ceramide': ['ING-04'],
    'centella': ['ING-06'],
    'centella asiatica': ['ING-06'],
    'aha': ['ING-03'],
    'bha': ['ING-03'],
    'tea tree': ['ING-03']
};

const CONCERN_KEYWORDS: Record<string, number> = {
    'jerawat': 0b00000100,
    'acne': 0b00000100,
    'kusam': 0b00000001,
    'dull': 0b00000001,
    'kering': 0b00000010,
    'dry': 0b00000010,
    'berminyak': 0b00000100,
    'oily': 0b00000100,
    'anti aging': 0b00001000,
    'kerut': 0b00001000,
    'wrinkle': 0b00001000,
    'penuaan': 0b00001000,
    'sensitive': 0b00010000,
    'sensitif': 0b00010000,
    'barrier': 0b00010000,
    'hidrasi': 0b00000010,
    'hydrating': 0b00000010
};

const BRAND_KEYWORDS = ['scarlett', 'somethinc', 'avoskin', 'azarine', 'wardah', 'emina'];

// ============================================================================
// DYNAMIC THEME SYNTHESIZER
// ============================================================================

export interface ThemeConfig {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    emoji: string;
    label: string;
}

export const THEME_CONFIGS: Record<ThemeCategory, ThemeConfig> = {
    'ACNE': {
        primary: '#10B981',    // Emerald
        secondary: '#059669',
        accent: '#34D399',
        gradient: 'from-emerald-500 to-teal-500',
        emoji: '🌿',
        label: 'Acne Care'
    },
    'BRIGHTENING': {
        primary: '#EC4899',    // Pink
        secondary: '#DB2777',
        accent: '#F472B6',
        gradient: 'from-pink-500 to-rose-500',
        emoji: '✨',
        label: 'Brightening'
    },
    'HYDRATION': {
        primary: '#3B82F6',    // Blue
        secondary: '#2563EB',
        accent: '#60A5FA',
        gradient: 'from-blue-500 to-cyan-500',
        emoji: '💧',
        label: 'Hydration'
    },
    'ANTI_AGING': {
        primary: '#8B5CF6',    // Purple
        secondary: '#7C3AED',
        accent: '#A78BFA',
        gradient: 'from-purple-500 to-indigo-500',
        emoji: '⏳',
        label: 'Anti-Aging'
    },
    'BARRIER': {
        primary: '#F59E0B',    // Amber
        secondary: '#D97706',
        accent: '#FBBF24',
        gradient: 'from-amber-500 to-orange-500',
        emoji: '🛡️',
        label: 'Barrier Repair'
    },
    'DEFAULT': {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        accent: '#A78BFA',
        gradient: 'from-slate-500 to-slate-700',
        emoji: '📚',
        label: 'Skincare'
    }
};

/**
 * Determine theme category from article keywords
 */
export const detectThemeCategory = (text: string): ThemeCategory => {
    const lower = text.toLowerCase();

    // Check for theme keywords
    if (lower.includes('jerawat') || lower.includes('acne') || lower.includes('tea tree')) {
        return 'ACNE';
    }
    if (lower.includes('kusam') || lower.includes('dull') || lower.includes('brightening') || lower.includes('vitamin c')) {
        return 'BRIGHTENING';
    }
    if (lower.includes('kering') || lower.includes('dry') || lower.includes('hidrasi') || lower.includes('hyaluronic')) {
        return 'HYDRATION';
    }
    if (lower.includes('retinol') || lower.includes('aging') || lower.includes('kerut') || lower.includes('wrinkle')) {
        return 'ANTI_AGING';
    }
    if (lower.includes('barrier') || lower.includes('ceramide') || lower.includes('sensitif') || lower.includes('sensitive')) {
        return 'BARRIER';
    }

    return 'DEFAULT';
};

/**
 * Generate CSS variables for theme
 */
export const generateThemeCSS = (theme: ThemeConfig): React.CSSProperties => ({
    '--theme-primary': theme.primary,
    '--theme-secondary': theme.secondary,
    '--theme-accent': theme.accent,
} as React.CSSProperties);

// ============================================================================
// SEMANTIC VECTOR MAPPER (Routine Clustering)
// ============================================================================

// Synergy pairs for routine building
const PRODUCT_SYNERGIES: Record<string, string[]> = {
    'Serum': ['Toner', 'Moisturizer', 'Essence'],
    'Toner': ['Cleanser', 'Serum'],
    'Moisturizer': ['Serum', 'Sunscreen'],
    'Cleanser': ['Toner', 'Oil Cleanser'],
    'Sunscreen': ['Moisturizer']
};

/**
 * Build routine cluster from primary product
 */
export const buildRoutineCluster = (
    primaryProduct: ProductTelemetry,
    allProducts: ProductTelemetry[],
    concernMask: number
): RoutineCluster => {
    const supporting: ProductTelemetry[] = [];

    // Find supporting products with synergy
    const otherProducts = allProducts.filter(p => p.id !== primaryProduct.id && p.stockQty > 0);

    // Add product with matching concern but different type
    const complementary = otherProducts.find(p =>
        (p.vectorMask & concernMask) !== 0 &&
        p.name.toLowerCase() !== primaryProduct.name.toLowerCase()
    );
    if (complementary) supporting.push(complementary);

    // Add sunscreen if not present
    const hasSunscreen = supporting.some(p => p.name.toLowerCase().includes('sunscreen') || p.name.toLowerCase().includes('spf'));
    if (!hasSunscreen) {
        const sunscreen = otherProducts.find(p =>
            p.name.toLowerCase().includes('sunscreen') ||
            p.name.toLowerCase().includes('protection')
        );
        if (sunscreen) supporting.push(sunscreen);
    }

    // Calculate bundle savings (simulated)
    const totalOriginal = primaryProduct.marketPrice + supporting.reduce((s, p) => s + p.marketPrice, 0);
    const totalSavings = Math.round(totalOriginal * 0.12); // 12% bundle discount

    return {
        primary: primaryProduct,
        supporting: supporting.slice(0, 2),
        totalSavings,
        routineName: `${primaryProduct.name} Routine`
    };
};

// ============================================================================
// ATTENTION HEATMAP ALGORITHM
// ============================================================================

/**
 * Parse article into segments for tracking
 */
export const segmentArticle = (content: string): ReadingSegment[] => {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

    return paragraphs.map((para, index) => {
        // Extract keywords from segment
        const keywords: string[] = [];
        const lower = para.toLowerCase();

        for (const keyword of Object.keys(INGREDIENT_KEYWORDS)) {
            if (lower.includes(keyword)) keywords.push(keyword);
        }
        for (const keyword of Object.keys(CONCERN_KEYWORDS)) {
            if (lower.includes(keyword)) keywords.push(keyword);
        }

        return {
            id: `segment-${index}`,
            index,
            keywords,
            timeSpentMs: 0,
            isActive: false
        };
    });
};

/**
 * Calculate attention score from reading segments
 */
export const calculateAttentionScore = (segments: ReadingSegment[]): {
    totalReadingTime: number;
    completionPercent: number;
    focusedKeywords: string[];
    engagementLevel: 'LOW' | 'MEDIUM' | 'HIGH';
} => {
    const totalTime = segments.reduce((sum, s) => sum + s.timeSpentMs, 0);
    const readSegments = segments.filter(s => s.timeSpentMs > 2000); // >2 seconds = read
    const completionPercent = Math.round((readSegments.length / segments.length) * 100);

    // Find keywords where user spent >5 seconds
    const focusedKeywords: string[] = [];
    segments.forEach(s => {
        if (s.timeSpentMs > 5000) {
            focusedKeywords.push(...s.keywords);
        }
    });

    let engagementLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (totalTime > 120000) engagementLevel = 'HIGH';      // >2 min
    else if (totalTime > 60000) engagementLevel = 'MEDIUM'; // >1 min
    else engagementLevel = 'LOW';

    return {
        totalReadingTime: totalTime,
        completionPercent,
        focusedKeywords: [...new Set(focusedKeywords)],
        engagementLevel
    };
};

// ============================================================================
// CONVERSION ATTRIBUTION PROTOCOL
// ============================================================================

const ATTRIBUTION_KEY = 'glowhub_blog_attribution';

/**
 * Tag a product click with source attribution
 */
export const tagProductClick = (articleId: string, productId: string, source: ConversionAttribution['source']): void => {
    const attribution: ConversionAttribution = {
        articleId,
        productId,
        source,
        timestamp: Date.now()
    };

    // Store in session
    try {
        const existing = sessionStorage.getItem(ATTRIBUTION_KEY);
        const attributions: ConversionAttribution[] = existing ? JSON.parse(existing) : [];
        attributions.push(attribution);
        sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attributions.slice(-10))); // Keep last 10
    } catch (e) {
        console.warn('Attribution storage failed:', e);
    }
};

/**
 * Check if current purchase should be attributed to blog
 */
export const getAttributionForProduct = (productId: string): ConversionAttribution | null => {
    try {
        const existing = sessionStorage.getItem(ATTRIBUTION_KEY);
        if (!existing) return null;

        const attributions: ConversionAttribution[] = JSON.parse(existing);
        const recent = attributions.find(a =>
            a.productId === productId &&
            Date.now() - a.timestamp < 30 * 60 * 1000 // Within 30 minutes
        );

        return recent || null;
    } catch {
        return null;
    }
};

// ============================================================================
// COUPON GENERATION (Gamification)
// ============================================================================

export const generateCoupon = (articleId: string): {
    code: string;
    discount: number;
    expiresAt: number;
} => {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `READ${randomPart}`;

    return {
        code,
        discount: 5, // 5% discount
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };
};

// ============================================================================
// RESELLER INTELLIGENCE
// ============================================================================

export interface ResellerInsights {
    trendingRank: number;
    weeklyViews: number;
    inventoryOpportunities: Array<{
        product: ProductTelemetry;
        margin: number;
        stockStatus: 'SAFE' | 'LOW' | 'OUT';
    }>;
    referralLink: string;
}

export const generateResellerInsights = (
    articleId: string,
    relatedProducts: ProductTelemetry[],
    affiliateId?: string
): ResellerInsights => {
    const inventoryOpportunities = relatedProducts
        .map(product => {
            const margin = ((product.marketPrice - product.basePrice) / product.marketPrice) * 100;
            let stockStatus: 'SAFE' | 'LOW' | 'OUT' = 'SAFE';
            if (product.stockQty <= 0) stockStatus = 'OUT';
            else if (product.stockQty < 50) stockStatus = 'LOW';

            return { product, margin, stockStatus };
        })
        .filter(o => o.stockStatus !== 'OUT')
        .sort((a, b) => b.margin - a.margin);

    const referralLink = affiliateId
        ? `https://glowhub.id/blog/${articleId}?ref=${affiliateId}`
        : `https://glowhub.id/blog/${articleId}`;

    return {
        trendingRank: Math.floor(Math.random() * 10) + 1,
        weeklyViews: Math.floor(Math.random() * 5000) + 500,
        inventoryOpportunities,
        referralLink
    };
};

// ============================================================================
// EXISTING FUNCTIONS (Preserved)
// ============================================================================

export const scanAndMatchProducts = (text: string): {
    matches: KeywordMatch[];
    matchedProducts: ProductTelemetry[];
    matchedIngredients: string[];
    concernMask: number;
} => {
    const lowerText = text.toLowerCase();
    const matches: KeywordMatch[] = [];
    const foundIngredientIds = new Set<string>();
    let concernMask = 0;

    // 1. Scan for ingredient keywords
    for (const [keyword, ingredientIds] of Object.entries(INGREDIENT_KEYWORDS)) {
        const pos = lowerText.indexOf(keyword);
        if (pos !== -1) {
            matches.push({ keyword, position: pos, paragraphIndex: 0, matchType: 'INGREDIENT' });
            ingredientIds.forEach(id => foundIngredientIds.add(id));
        }
    }

    // 2. Scan for concern keywords
    for (const [keyword, mask] of Object.entries(CONCERN_KEYWORDS)) {
        const pos = lowerText.indexOf(keyword);
        if (pos !== -1) {
            matches.push({ keyword, position: pos, paragraphIndex: 0, matchType: 'CONCERN' });
            concernMask |= mask;
        }
    }

    // 3. Scan for brand keywords
    for (const brand of BRAND_KEYWORDS) {
        const pos = lowerText.indexOf(brand);
        if (pos !== -1) {
            matches.push({ keyword: brand, position: pos, paragraphIndex: 0, matchType: 'BRAND' });
        }
    }

    // 4. Match products based on findings
    const matchedProducts = PRODUCT_CATALOG.filter(product => {
        const hasMatchingIngredient = product.ingredients.some(ing => foundIngredientIds.has(ing));
        const hasMatchingConcern = concernMask > 0 && (product.vectorMask & concernMask) !== 0;
        const matchesBrand = matches.some(m =>
            m.matchType === 'BRAND' &&
            product.brand.toLowerCase().includes(m.keyword)
        );

        return hasMatchingIngredient || hasMatchingConcern || matchesBrand;
    })
        .filter(p => p.stockQty > 0)
        .sort((a, b) => b.stockQty - a.stockQty);

    return {
        matches,
        matchedProducts,
        matchedIngredients: Array.from(foundIngredientIds),
        concernMask
    };
};

export const calculateInjectionPoints = (
    paragraphs: string[],
    maxInjections: number = 2
): InjectionPoint[] => {
    const points: InjectionPoint[] = [];
    const scanText = paragraphs.slice(0, 3).join(' ');
    const { matchedProducts, matches, matchedIngredients } = scanAndMatchProducts(scanText);

    if (matchedProducts.length === 0) return points;

    if (paragraphs.length >= 2 && matchedProducts[0]) {
        points.push({
            afterParagraphIndex: 1,
            product: matchedProducts[0],
            relevanceScore: matches.length,
            matchedKeywords: matches.map(m => m.keyword)
        });
    }

    if (paragraphs.length >= 4 && matchedProducts[1] && maxInjections >= 2) {
        points.push({
            afterParagraphIndex: 3,
            product: matchedProducts[1],
            relevanceScore: matches.length,
            matchedKeywords: matchedIngredients
        });
    }

    return points.slice(0, maxInjections);
};

export const highlightKeywords = (text: string): string => {
    let result = text;

    for (const keyword of Object.keys(INGREDIENT_KEYWORDS)) {
        const regex = new RegExp(`(${keyword})`, 'gi');
        result = result.replace(regex,
            '<span class="text-emerald-500 font-bold cursor-pointer hover:underline" data-type="ingredient">$1</span>'
        );
    }

    for (const keyword of Object.keys(CONCERN_KEYWORDS)) {
        const regex = new RegExp(`(${keyword})`, 'gi');
        result = result.replace(regex,
            '<span class="text-purple-500 font-bold cursor-pointer hover:underline" data-type="concern">$1</span>'
        );
    }

    for (const brand of BRAND_KEYWORDS) {
        const regex = new RegExp(`(${brand})`, 'gi');
        result = result.replace(regex,
            '<span class="text-pink-500 font-bold cursor-pointer hover:underline" data-type="brand">$1</span>'
        );
    }

    return result;
};

export const calculateReadingProgress = (
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number
): number => {
    const scrollable = scrollHeight - clientHeight;
    if (scrollable <= 0) return 100;
    return Math.min(100, Math.round((scrollTop / scrollable) * 100));
};

// ============================================================================
// MOCK ARTICLE GENERATOR
// ============================================================================

export const generateMockArticle = (): BlogArticle => ({
    id: 'BLOG-001',
    title: 'Panduan Lengkap: Niacinamide untuk Kulit Berminyak',
    content: `Untuk kamu yang memiliki kulit sensitif, jangan khawatir! Niacinamide termasuk bahan yang gentle dan cocok untuk semua jenis kulit. Brand lokal seperti Somethinc dan Avoskin sudah banyak yang menggunakan niacinamide konsentrasi tinggi.

Apa itu Niacinamide? Niacinamide adalah bentuk vitamin B3 yang larut dalam air. Bahan ini bekerja dengan memperkuat skin barrier dan mengontrol produksi sebum berlebih yang menjadi penyebab utama jerawat dan komedo.

Kombinasi terbaik untuk niacinamide adalah dengan hyaluronic acid. Kedua bahan ini saling melengkapi untuk memberikan hidrasi optimal sekaligus mengontrol minyak. Jangan lupa untuk selalu menggunakan sunscreen SPF 50 di siang hari!

Hasil yang terlihat biasanya setelah 4-8 minggu pemakaian rutin. Kulit akan terasa lebih halus, pori-pori tersamar, dan produksi minyak berkurang signifikan.

Untuk pemilik kulit berminyak dan berjerawat, carilah produk dengan konsentrasi niacinamide 10% atau lebih. Produk dari Scarlett juga memiliki formula yang bagus untuk acne-prone skin.`,
    paragraphs: [],
    tags: 0b00000101, // BRIGHTENING | ACNE_FIGHTING
    primaryKeyword: 'niacinamide',
    themeCategory: 'BRIGHTENING',
    publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000
});

// Additional mock articles for variety
export const BLOG_ARTICLES: BlogArticle[] = [
    generateMockArticle(),
    {
        id: 'BLOG-002',
        title: 'Retinol 101: Anti-Aging untuk Pemula',
        content: `Retinol adalah derivat Vitamin A yang sudah terbukti secara klinis sebagai bahan anti aging paling efektif. Banyak dermatologist merekomendasikan retinol untuk mengatasi tanda-tanda penuaan.

Mulailah dengan konsentrasi rendah 0.25% untuk menghindari iritasi. Gunakan hanya di malam hari karena retinol sensitif terhadap sinar UV. Brand seperti Avoskin memiliki produk retinol yang formulanya gentle.

Kombinasikan dengan ceramide dan hyaluronic acid untuk menjaga hidrasi kulit. Jangan gunakan bersama AHA/BHA di waktu yang sama untuk menghindari over-exfoliation.

Hasil nyata biasanya terlihat setelah 12 minggu pemakaian konsisten. Garis halus berkurang, tekstur kulit membaik, dan wajah terlihat lebih cerah.`,
        paragraphs: [],
        tags: 0b00001000,
        primaryKeyword: 'retinol',
        themeCategory: 'ANTI_AGING',
        publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
    },
    {
        id: 'BLOG-003',
        title: 'Kulit Kering? Ini Solusi Hidrasi Maksimal',
        content: `Kulit kering membutuhkan perhatian khusus dalam hal hidrasi. Hyaluronic acid adalah bahan wajib yang bisa menahan 1000x beratnya dalam air.

Gunakan hydrating toner sebagai langkah pertama setelah membersihkan wajah. Layer dengan serum hyaluronic acid, lalu kunci dengan moisturizer yang mengandung ceramide.

Brand Azarine memiliki gel moisturizer yang cocok untuk kulit kering tanpa membuat greasy. Somethinc juga punya range hidrasi yang bagus.

Jangan lupa minum air yang cukup dan gunakan humidifier di ruangan ber-AC untuk menjaga kelembaban kulit dari dalam dan luar.`,
        paragraphs: [],
        tags: 0b00000010,
        primaryKeyword: 'hyaluronic',
        themeCategory: 'HYDRATION',
        publishedAt: Date.now() - 5 * 24 * 60 * 60 * 1000
    }
];
