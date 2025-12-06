// ContentResonanceEngine.ts - Blog Keyword Parsing Engine
// Pattern: TF-IDF Simulation + ProductTelemetry Integration

import { PRODUCT_CATALOG, type ProductTelemetry } from '../ProductTelemetry';

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
    embeddedSku?: string;  // Manual override
    publishedAt: number;
}

export interface InjectionPoint {
    afterParagraphIndex: number;
    product: ProductTelemetry;
    relevanceScore: number;
    matchedKeywords: string[];
}

// Keyword dictionaries with product mapping
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
    'centella asiatica': ['ING-06']
};

const CONCERN_KEYWORDS: Record<string, number> = {
    'jerawat': 0b00000100,  // ACNE_FIGHTING
    'acne': 0b00000100,
    'kusam': 0b00000001,    // BRIGHTENING
    'dull': 0b00000001,
    'kering': 0b00000010,   // HYDRATING
    'dry': 0b00000010,
    'berminyak': 0b00000100,
    'oily': 0b00000100,
    'anti aging': 0b00001000,
    'kerut': 0b00001000,
    'wrinkle': 0b00001000,
    'penuaan': 0b00001000
};

const BRAND_KEYWORDS = ['scarlett', 'somethinc', 'avoskin', 'azarine', 'wardah', 'emina'];

// KeywordResonanceScan - Find matching products from keywords
export const scanAndMatchProducts = (text: string): {
    matches: KeywordMatch[];
    matchedProducts: ProductTelemetry[];
    matchedIngredients: string[];
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
        // Check ingredient overlap
        const hasMatchingIngredient = product.ingredients.some(ing => foundIngredientIds.has(ing));
        // Check concern/function overlap (vectorMask is approx function mask)
        const hasMatchingConcern = concernMask > 0 && (product.vectorMask & concernMask) !== 0;
        // Check brand match
        const matchesBrand = matches.some(m =>
            m.matchType === 'BRAND' &&
            product.brand.toLowerCase().includes(m.keyword)
        );


        return hasMatchingIngredient || hasMatchingConcern || matchesBrand;
    })
        // Sort by stock (prefer in-stock products)
        .filter(p => p.stockQty > 0)
        .sort((a, b) => b.stockQty - a.stockQty);

    return {
        matches,
        matchedProducts,
        matchedIngredients: Array.from(foundIngredientIds)
    };
};

// Parse article into paragraphs and determine injection points
export const calculateInjectionPoints = (
    paragraphs: string[],
    maxInjections: number = 2
): InjectionPoint[] => {
    const points: InjectionPoint[] = [];

    // Scan first 2-3 paragraphs for keywords
    const scanText = paragraphs.slice(0, 3).join(' ');
    const { matchedProducts, matches, matchedIngredients } = scanAndMatchProducts(scanText);

    if (matchedProducts.length === 0) return points;

    // Inject after paragraph 1 (0-indexed: after first paragraph)
    if (paragraphs.length >= 2 && matchedProducts[0]) {
        points.push({
            afterParagraphIndex: 1,
            product: matchedProducts[0],
            relevanceScore: matches.length,
            matchedKeywords: matches.map(m => m.keyword)
        });
    }

    // Inject after paragraph 3-4 if we have more products
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

// Highlight keywords in text (returns HTML with spans)
export const highlightKeywords = (text: string): string => {
    let result = text;

    // Highlight ingredients (green)
    for (const keyword of Object.keys(INGREDIENT_KEYWORDS)) {
        const regex = new RegExp(`(${keyword})`, 'gi');
        result = result.replace(regex,
            '<span class="text-emerald-500 font-bold cursor-pointer hover:underline" data-type="ingredient">$1</span>'
        );
    }

    // Highlight concerns (purple)
    for (const keyword of Object.keys(CONCERN_KEYWORDS)) {
        const regex = new RegExp(`(${keyword})`, 'gi');
        result = result.replace(regex,
            '<span class="text-purple-500 font-bold cursor-pointer hover:underline" data-type="concern">$1</span>'
        );
    }

    // Highlight brands (pink)
    for (const brand of BRAND_KEYWORDS) {
        const regex = new RegExp(`(${brand})`, 'gi');
        result = result.replace(regex,
            '<span class="text-pink-500 font-bold cursor-pointer hover:underline" data-type="brand">$1</span>'
        );
    }

    return result;
};

// Calculate reading progress for popup trigger
export const calculateReadingProgress = (
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number
): number => {
    const scrollable = scrollHeight - clientHeight;
    if (scrollable <= 0) return 100;
    return Math.min(100, Math.round((scrollTop / scrollable) * 100));
};

// Mock article with real keywords
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
    publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000
});
