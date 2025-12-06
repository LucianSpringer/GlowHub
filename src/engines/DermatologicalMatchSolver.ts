// DermatologicalMatchSolver.ts - Testimonial Matching Engine
// Pattern: Attribute Matching + Validation

export interface SkinProfile {
    concernMask: number;      // Bitwise concerns
    skinType: 'OILY' | 'DRY' | 'COMBINATION' | 'NORMAL' | 'SENSITIVE';
    age: number;
    sensitivity: number;      // 0-10 scale
}

export interface Testimonial {
    id: string;
    userId: string;
    productId: string;
    productName: string;
    reviewerProfile: SkinProfile;
    reviewerName: string;
    beforeImage: string;
    afterImage: string;
    weeklyProgress: string[]; // Week 1, 2, 3, 4 images
    usageDurationDays: number;
    rating: number;           // 1-5
    comment: string;
    verifiedPurchase: boolean;
    createdAt: number;
}

export interface MatchedTestimonial extends Testimonial {
    matchScore: number;       // 0-100
    matchReasons: string[];
    isRelevant: boolean;
}

// Calculate profile similarity
export const calculateProfileMatch = (
    userProfile: SkinProfile,
    reviewerProfile: SkinProfile
): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Skin Type Match (30 points)
    if (userProfile.skinType === reviewerProfile.skinType) {
        score += 30;
        reasons.push(`Tipe kulit sama: ${userProfile.skinType}`);
    } else if (
        (userProfile.skinType === 'OILY' && reviewerProfile.skinType === 'COMBINATION') ||
        (userProfile.skinType === 'COMBINATION' && reviewerProfile.skinType === 'OILY')
    ) {
        score += 15;
        reasons.push('Tipe kulit serupa');
    }

    // 2. Concern Overlap (40 points max)
    const matchingBits = userProfile.concernMask & reviewerProfile.concernMask;
    let bitCount = 0;
    let n = matchingBits;
    while (n) {
        bitCount += n & 1;
        n >>= 1;
    }
    const concernScore = Math.min(40, bitCount * 10);
    score += concernScore;
    if (bitCount > 0) {
        reasons.push(`${bitCount} concern sama`);
    }

    // 3. Age Proximity (15 points)
    const ageDiff = Math.abs(userProfile.age - reviewerProfile.age);
    if (ageDiff <= 5) {
        score += 15;
        reasons.push('Usia serupa (±5 tahun)');
    } else if (ageDiff <= 10) {
        score += 8;
        reasons.push('Rentang usia mendekati');
    }

    // 4. Sensitivity Match (15 points)
    const sensitivityDiff = Math.abs(userProfile.sensitivity - reviewerProfile.sensitivity);
    if (sensitivityDiff <= 2) {
        score += 15;
        reasons.push('Level sensitivitas cocok');
    }

    return { score, reasons };
};

// Validate claim plausibility
export interface ValidationResult {
    isPlausible: boolean;
    warnings: string[];
    confidence: number; // 0-100
}

const EXPECTED_HEALING_DAYS: Record<string, number> = {
    'acne': 28,
    'dark_spots': 56,
    'wrinkles': 90,
    'dryness': 14,
    'oiliness': 21
};

export const validateClaim = (
    testimonial: Testimonial,
    claimedImprovement: string
): ValidationResult => {
    const warnings: string[] = [];
    let confidence = 100;

    // Check usage duration vs expected
    const expectedDays = EXPECTED_HEALING_DAYS[claimedImprovement.toLowerCase()] || 30;

    if (testimonial.usageDurationDays < expectedDays * 0.5) {
        warnings.push(`Durasi ${testimonial.usageDurationDays} hari terlalu singkat untuk hasil optimal`);
        confidence -= 30;
    }

    // Check if verified purchase
    if (!testimonial.verifiedPurchase) {
        warnings.push('Bukan pembelian terverifikasi');
        confidence -= 20;
    }

    // Check rating consistency
    if (testimonial.rating < 4 && testimonial.comment.toLowerCase().includes('bagus')) {
        warnings.push('Inkonsistensi rating dan komentar');
        confidence -= 15;
    }

    // Check for progress images
    if (testimonial.weeklyProgress.length < 2) {
        warnings.push('Progress mingguan tidak lengkap');
        confidence -= 10;
    }

    return {
        isPlausible: confidence > 50,
        warnings,
        confidence: Math.max(0, confidence)
    };
};

// Filter and rank testimonials by match
export const filterTestimonials = (
    testimonials: Testimonial[],
    userProfile: SkinProfile,
    minMatchScore: number = 30
): MatchedTestimonial[] => {
    return testimonials
        .map(testimonial => {
            const { score, reasons } = calculateProfileMatch(userProfile, testimonial.reviewerProfile);
            return {
                ...testimonial,
                matchScore: score,
                matchReasons: reasons,
                isRelevant: score >= minMatchScore
            };
        })
        .filter(t => t.isRelevant)
        .sort((a, b) => b.matchScore - a.matchScore);
};

// Get testimonials for specific product
export const getProductTestimonials = (
    testimonials: MatchedTestimonial[],
    productId: string
): MatchedTestimonial[] => {
    return testimonials.filter(t => t.productId === productId);
};

// Generate mock testimonials
export const generateMockTestimonials = (): Testimonial[] => {
    const skinTypes: SkinProfile['skinType'][] = ['OILY', 'DRY', 'COMBINATION', 'NORMAL', 'SENSITIVE'];
    const products = [
        { id: 'PROD-1001', name: 'Brightening Serum' },
        { id: 'PROD-1002', name: 'Acne Spot Treatment' },
        { id: 'PROD-1003', name: 'Hydrating Toner' }
    ];

    return Array.from({ length: 15 }, (_, i) => {
        const product = products[i % products.length];
        return {
            id: `REVIEW-${1000 + i}`,
            userId: `USER-${2000 + i}`,
            productId: product.id,
            productName: product.name,
            reviewerProfile: {
                concernMask: [1, 2, 4, 8, 16][Math.floor(Math.random() * 5)] |
                    [0, 1, 2, 4][Math.floor(Math.random() * 4)],
                skinType: skinTypes[Math.floor(Math.random() * skinTypes.length)],
                age: 20 + Math.floor(Math.random() * 20),
                sensitivity: Math.floor(Math.random() * 10)
            },
            reviewerName: `Reviewer ${i + 1}`,
            beforeImage: `https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=200&q=80`,
            afterImage: `https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=80`,
            weeklyProgress: [
                `https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=150&q=80`,
                `https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=150&q=80`,
                `https://images.unsplash.com/photo-1556228453-efd21e1a1f77?auto=format&fit=crop&w=150&q=80`,
                `https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=150&q=80`
            ],
            usageDurationDays: 14 + Math.floor(Math.random() * 60),
            rating: 3 + Math.random() * 2,
            comment: `Review produk ${product.name}. Hasil terlihat setelah beberapa minggu pemakaian rutin.`,
            verifiedPurchase: Math.random() > 0.2,
            createdAt: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        };
    });
};
