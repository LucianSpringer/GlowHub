// MarketingSyntaxSynthesizer.ts - Template-Based Caption Generation
// Pattern: Slot-Filling & Procedural Randomization

export type CaptionVibe = 'GENZ' | 'PERSUASIF' | 'EDUKATIF' | 'HARDSELL';
export type CaptionPlatform = 'INSTAGRAM' | 'TIKTOK';

export interface ProductInfo {
    name: string;
    brand: string;
    benefit: string;
    activeIngredient: string;
    price: number;
}

export interface CaptionResult {
    caption: string;
    hashtags: string[];
    platform: CaptionPlatform;
    vibe: CaptionVibe;
    charCount: number;
}

// Template Banks
const TEMPLATES: Record<CaptionVibe, string[]> = {
    GENZ: [
        "Bestie, {ingredient} ini kuncinya! {benefit} dalam 7 hari. Cek keranjang kuning! 🔥",
        "POV: Kamu pake {product} dan skin barrier langsung {benefit}. No cap! ✨",
        "It's giving... GLOWING SKIN ✨ {product} dari {brand} ini slay banget!",
        "Main character energy activated! 💅 Rahasia {benefit}? {ingredient} dari {brand}!"
    ],
    PERSUASIF: [
        "Ingin {benefit}? {product} dengan {ingredient} adalah jawabannya. Sudah terbukti!",
        "Ribuan customer sudah merasakan manfaat {product}. Giliran kamu sekarang! 💫",
        "Jangan sampai kehabisan! {product} dengan {ingredient} untuk {benefit} yang nyata.",
        "Investasi terbaik untuk kulitmu: {product} dari {brand}. {benefit} guaranteed! ✅"
    ],
    EDUKATIF: [
        "Tahukah kamu? {ingredient} terbukti secara klinis untuk {benefit}. Coba {product}! 📚",
        "Skincare 101: {ingredient} adalah bahan aktif yang membantu {benefit}. Temukan di {product}.",
        "Fakta: Kulit membutuhkan {ingredient} untuk {benefit}. {brand} mengemas ini dalam {product}. 🧬",
        "Dermatologist-approved: {product} mengandung {ingredient} untuk {benefit} optimal. ✔️"
    ],
    HARDSELL: [
        "🚨 PROMO TERBATAS! {product} cuma Rp{price}! Langsung checkout sebelum kehabisan!",
        "FLASH SALE! {product} dari {brand} - {benefit} dengan harga TERJANGKAU! 🏷️",
        "STOK MENIPIS! Grab {product} sekarang! {ingredient} premium, harga ekonomis!",
        "LIMITED OFFER! {product} untuk {benefit} - BELI SEKARANG atau menyesal kemudian! 🔥"
    ]
};

// Hashtag Banks
const HASHTAGS: Record<CaptionPlatform, string[]> = {
    INSTAGRAM: [
        '#skincareindonesia', '#skincarelokal', '#glowingskin', '#skincareaddict',
        '#beautytips', '#skincareroutine', '#healthyskin', '#skincarenatural',
        '#perawatanwajah', '#kulitsehat', '#skincarejunkie', '#beautycommunity'
    ],
    TIKTOK: [
        '#skincaretiktok', '#fyp', '#foryou', '#viral', '#skincare',
        '#glowup', '#beautyhacks', '#skincarecheck'
    ]
};

// Emoji Bank for Entropy
const EMOJIS = ['✨', '💫', '🌟', '💖', '🔥', '💅', '🧴', '✅', '💯', '🌸', '🍃', '💎'];

// Random Selection Helper
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Template Slot Filler
function fillTemplate(template: string, product: ProductInfo): string {
    return template
        .replace(/\{product\}/g, product.name)
        .replace(/\{brand\}/g, product.brand)
        .replace(/\{benefit\}/g, product.benefit)
        .replace(/\{ingredient\}/g, product.activeIngredient)
        .replace(/\{price\}/g, product.price.toLocaleString());
}

// Add Random Emoji Entropy
function injectEmojis(text: string, count: number = 2): string {
    for (let i = 0; i < count; i++) {
        text += ' ' + pickRandom(EMOJIS);
    }
    return text;
}

// Main Synthesizer Function
export function generateCaption(
    product: ProductInfo,
    vibe: CaptionVibe,
    platform: CaptionPlatform
): CaptionResult {
    const templates = TEMPLATES[vibe];
    const template = pickRandom(templates);

    let caption = fillTemplate(template, product);
    caption = injectEmojis(caption, platform === 'TIKTOK' ? 1 : 2);

    // Platform-specific adjustments
    const hashtagCount = platform === 'INSTAGRAM' ? 8 : 4;
    const hashtags = [...HASHTAGS[platform]]
        .sort(() => Math.random() - 0.5)
        .slice(0, hashtagCount);

    // TikTok: Keep it short
    if (platform === 'TIKTOK' && caption.length > 100) {
        caption = caption.slice(0, 97) + '...';
    }

    return {
        caption,
        hashtags,
        platform,
        vibe,
        charCount: caption.length
    };
}

// Generate Multiple Variations
export function generateVariations(
    product: ProductInfo,
    vibe: CaptionVibe,
    platform: CaptionPlatform,
    count: number = 3
): CaptionResult[] {
    const results: CaptionResult[] = [];
    for (let i = 0; i < count; i++) {
        results.push(generateCaption(product, vibe, platform));
    }
    return results;
}

// Check Stock Before Generating (Interconnection)
export function canGenerateCaption(stockRemaining: number): {
    allowed: boolean;
    warning?: string;
} {
    if (stockRemaining <= 0) {
        return { allowed: false, warning: 'Stok habis! Tidak disarankan promosi produk ini.' };
    }
    if (stockRemaining < 5) {
        return { allowed: true, warning: 'Stok sangat terbatas. Pertimbangkan untuk menambah stok.' };
    }
    return { allowed: true };
}
