

// --- BRAND DATA ---
export interface BrandProfile {
    id: string;
    name: string;
    tier: 'PLATINUM' | 'GOLD' | 'SILVER';
    productCount: number;
    avgRating: number;
    isFeatured: boolean;
    stockStatus: 'AMPLE' | 'LIMITED' | 'CRITICAL';
    heroProduct: string;
}

export const _BRAND_DB: BrandProfile[] = [
    { id: 'B-01', name: 'SCARLETT', tier: 'PLATINUM', productCount: 42, avgRating: 4.9, isFeatured: true, stockStatus: 'AMPLE', heroProduct: 'Whitening Lotion' },
    { id: 'B-02', name: 'SOMETHINC', tier: 'PLATINUM', productCount: 56, avgRating: 4.8, isFeatured: true, stockStatus: 'LIMITED', heroProduct: 'Game Changer Eye Gel' },
    { id: 'B-03', name: 'AVOSKIN', tier: 'GOLD', productCount: 28, avgRating: 4.9, isFeatured: true, stockStatus: 'CRITICAL', heroProduct: 'Miraculous Toner' },
    { id: 'B-04', name: 'AZARINE', tier: 'GOLD', productCount: 31, avgRating: 4.7, isFeatured: true, stockStatus: 'AMPLE', heroProduct: 'Hydrasoothe Gel' },
    { id: 'B-05', name: 'SKINTIFIC', tier: 'PLATINUM', productCount: 19, avgRating: 4.9, isFeatured: false, stockStatus: 'AMPLE', heroProduct: '5X Ceramide' },
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
