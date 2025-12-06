

// --- BRAND DATA (Expanded for Intelligence Hub) ---

// Bitwise Tags
export const BrandTag = {
    VEGAN: 1 << 0,      // 1
    HALAL: 1 << 1,      // 2
    BPOM: 1 << 2,       // 4
    CRUELTYFREE: 1 << 3, // 8
    LOCAL: 1 << 4       // 16
} as const;

export interface BrandProfile {
    id: string;
    name: string;
    tier: 'PLATINUM' | 'GOLD' | 'SILVER';
    productCount: number;
    avgRating: number;
    isFeatured: boolean;
    stockStatus: 'AMPLE' | 'LIMITED' | 'CRITICAL';
    heroProduct: string;
    // NEW: Intelligence Hub fields
    themeColor: string;         // HEX for procedural CSS
    slug: string;               // SEO-friendly URL segment
    tags: number;               // Bitwise flags
    promotionalWeight: number;  // Score boost for promo
    avgMargin?: number;         // For Dropshipper view
}

export const _BRAND_DB: BrandProfile[] = [
    {
        id: 'B-01', name: 'SCARLETT', tier: 'PLATINUM',
        productCount: 42, avgRating: 4.9, isFeatured: true,
        stockStatus: 'AMPLE', heroProduct: 'Whitening Lotion',
        themeColor: '#E65797', slug: 'scarlett',
        tags: BrandTag.BPOM | BrandTag.HALAL | BrandTag.LOCAL,
        promotionalWeight: 50, avgMargin: 28
    },
    {
        id: 'B-02', name: 'SOMETHINC', tier: 'PLATINUM',
        productCount: 56, avgRating: 4.8, isFeatured: true,
        stockStatus: 'LIMITED', heroProduct: 'Game Changer Eye Gel',
        themeColor: '#6366F1', slug: 'somethinc',
        tags: BrandTag.BPOM | BrandTag.CRUELTYFREE | BrandTag.LOCAL,
        promotionalWeight: 0, avgMargin: 32
    },
    {
        id: 'B-03', name: 'AVOSKIN', tier: 'GOLD',
        productCount: 28, avgRating: 4.9, isFeatured: true,
        stockStatus: 'CRITICAL', heroProduct: 'Miraculous Toner',
        themeColor: '#22C55E', slug: 'avoskin',
        tags: BrandTag.BPOM | BrandTag.VEGAN | BrandTag.LOCAL,
        promotionalWeight: 30, avgMargin: 35
    },
    {
        id: 'B-04', name: 'AZARINE', tier: 'GOLD',
        productCount: 31, avgRating: 4.7, isFeatured: true,
        stockStatus: 'AMPLE', heroProduct: 'Hydrasoothe Gel',
        themeColor: '#06B6D4', slug: 'azarine',
        tags: BrandTag.BPOM | BrandTag.HALAL | BrandTag.LOCAL,
        promotionalWeight: 0, avgMargin: 25
    },
    {
        id: 'B-05', name: 'SKINTIFIC', tier: 'PLATINUM',
        productCount: 19, avgRating: 4.9, isFeatured: false,
        stockStatus: 'AMPLE', heroProduct: '5X Ceramide',
        themeColor: '#8B5CF6', slug: 'skintific',
        tags: BrandTag.BPOM | BrandTag.CRUELTYFREE,
        promotionalWeight: 20, avgMargin: 30
    },
    {
        id: 'B-06', name: 'WARDAH', tier: 'PLATINUM',
        productCount: 85, avgRating: 4.6, isFeatured: true,
        stockStatus: 'AMPLE', heroProduct: 'Lightening Series',
        themeColor: '#14B8A6', slug: 'wardah',
        tags: BrandTag.BPOM | BrandTag.HALAL | BrandTag.LOCAL,
        promotionalWeight: 0, avgMargin: 22
    },
];

// --- HERO CONFIG ---
export const HERO_CONFIG = {
    newVisitor: {
        headline: "Mulai Perawatan Kulit Alami.",
        sub: "Kurasi terbaik dari 100% Brand Lokal Indonesia.",
        cta: "Belanja Sekarang"
    },
    returningVisitor: {
        headline: "Welcome Back, Glowing Squad.",
        sub: "Stok favoritmu menipis. Cek sekarang sebelum kehabisan.",
        cta: "Lanjut Belanja"
    },
    dropshipper: {
        headline: "Dashboard Penjualan Pusat.",
        sub: "Pantau margin profit dan stok supplier secara real-time.",
        cta: "Lihat Dashboard"
    }
};
