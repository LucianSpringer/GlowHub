// DermatologicalMatchSolver.ts - Intelligent Evidence Engine v2.0
// Pattern: EvidenceCorrelation + SentimentExtraction + CredibilityScoring

import { PRODUCT_CATALOG } from '../ProductTelemetry';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SkinProfile {
    concernMask: number;
    skinType: 'OILY' | 'DRY' | 'COMBINATION' | 'NORMAL' | 'SENSITIVE';
    age: number;
    sensitivity: number;
}

export type EvidenceMode = 'TWIN' | 'PRODUCT' | 'MOLECULE';

export interface Testimonial {
    id: string;
    userId: string;
    productId: string;
    productName: string;
    productBrand: string;
    productImage: string;
    productIngredients: string[];
    reviewerProfile: SkinProfile;
    reviewerName: string;
    beforeImage: string;
    afterImage: string;
    weeklyProgress: WeeklyProgressSlide[];
    usageDurationDays: number;
    rating: number;
    comment: string;
    verifiedPurchase: boolean;
    hasMedia: boolean;
    transactionId?: string;
    createdAt: number;
}

export interface WeeklyProgressSlide {
    weekNumber: number;
    image: string;
    caption: string;
}

export interface MatchedTestimonial extends Testimonial {
    matchScore: number;
    matchReasons: string[];
    isRelevant: boolean;
    trustScore: number;
    trustBadge: 'GOLD' | 'SILVER' | 'NONE';
    sentimentTags: SentimentTag[];
    highlightSentence: string | null;
    confidenceBreakdown: ConfidenceBreakdown;
}

export interface SentimentTag {
    type: 'TEXTURE' | 'SPEED' | 'EFFICACY' | 'SCENT' | 'VALUE';
    label: string;
    emoji: string;
}

export interface ConfidenceBreakdown {
    dermalMatch: number;   // 0-100
    ageMatch: number;      // 0-100
    concernMatch: number;  // 0-100
    overall: number;       // 0-100
}

export interface AggregateInsights {
    totalReviews: number;
    matchingReviews: number;
    averageRating: number;
    fiveStarPercent: number;
    topSentimentTags: SentimentTag[];
    summaryText: string;
}

export interface ValidationResult {
    isPlausible: boolean;
    warnings: string[];
    confidence: number;
}

// ============================================================================
// SENTIMENT EXTRACTION PROTOCOL
// ============================================================================

const SENTIMENT_KEYWORDS: Record<SentimentTag['type'], { keywords: string[]; label: string; emoji: string }> = {
    'TEXTURE': {
        keywords: ['lembut', 'ringan', 'tidak lengket', 'cepat menyerap', 'watery', 'creamy', 'gel'],
        label: 'Tekstur Nyaman',
        emoji: '✨'
    },
    'SPEED': {
        keywords: ['cepat', 'semalam', 'minggu', 'hari', 'langsung', 'instan', 'seketika'],
        label: 'Hasil Cepat',
        emoji: '⚡'
    },
    'EFFICACY': {
        keywords: ['efektif', 'ampuh', 'works', 'bagus', 'mantap', 'recommended', 'worth it'],
        label: 'Sangat Efektif',
        emoji: '💪'
    },
    'SCENT': {
        keywords: ['wangi', 'harum', 'tidak bau', 'segar', 'fragrance free'],
        label: 'Wangi Enak',
        emoji: '🌸'
    },
    'VALUE': {
        keywords: ['murah', 'worth', 'value', 'harga', 'terjangkau', 'affordable'],
        label: 'Harga Oke',
        emoji: '💰'
    }
};

const POSITIVE_ADJECTIVES = [
    'bagus', 'mantap', 'keren', 'amazing', 'love', 'suka', 'cocok', 'recommended',
    'best', 'great', 'perfect', 'wonderful', 'excellent', 'luar biasa', 'top'
];

/**
 * Extract sentiment tags from review text
 */
export const extractSentimentTags = (text: string): SentimentTag[] => {
    const lower = text.toLowerCase();
    const tags: SentimentTag[] = [];

    for (const [type, config] of Object.entries(SENTIMENT_KEYWORDS)) {
        if (config.keywords.some(kw => lower.includes(kw))) {
            tags.push({
                type: type as SentimentTag['type'],
                label: config.label,
                emoji: config.emoji
            });
        }
    }

    return tags.slice(0, 3); // Max 3 tags
};

/**
 * Find the most positive sentence in review
 */
export const extractHighlightSentence = (text: string): string | null => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    let bestSentence: string | null = null;
    let bestScore = 0;

    for (const sentence of sentences) {
        const lower = sentence.toLowerCase();
        let score = 0;

        for (const adj of POSITIVE_ADJECTIVES) {
            if (lower.includes(adj)) score++;
        }

        if (score > bestScore) {
            bestScore = score;
            bestSentence = sentence.trim();
        }
    }

    return bestSentence;
};

// ============================================================================
// CREDIBILITY SCORING SYSTEM
// ============================================================================

export interface TrustScoreResult {
    score: number;
    badge: 'GOLD' | 'SILVER' | 'NONE';
    breakdown: {
        verified: number;
        hasMedia: number;
        profileComplete: number;
    };
}

/**
 * Calculate trust score for a review
 */
export const calculateTrustScore = (testimonial: Testimonial): TrustScoreResult => {
    let score = 0;
    const breakdown = { verified: 0, hasMedia: 0, profileComplete: 0 };

    // +50 for verified purchase (transactionId exists)
    if (testimonial.transactionId || testimonial.verifiedPurchase) {
        score += 50;
        breakdown.verified = 50;
    }

    // +30 for media (before/after images)
    if (testimonial.hasMedia || testimonial.weeklyProgress.length > 0) {
        score += 30;
        breakdown.hasMedia = 30;
    }

    // +20 for complete profile
    if (testimonial.reviewerProfile.skinType &&
        testimonial.reviewerProfile.concernMask > 0 &&
        testimonial.reviewerProfile.age > 0) {
        score += 20;
        breakdown.profileComplete = 20;
    }

    let badge: 'GOLD' | 'SILVER' | 'NONE' = 'NONE';
    if (score > 80) badge = 'GOLD';
    else if (score > 50) badge = 'SILVER';

    return { score, badge, breakdown };
};

// ============================================================================
// CONFIDENCE BREAKDOWN CALCULATION
// ============================================================================

export const calculateConfidenceBreakdown = (
    userProfile: SkinProfile,
    reviewerProfile: SkinProfile
): ConfidenceBreakdown => {
    // Dermal Match (skin type)
    let dermalMatch = 0;
    if (userProfile.skinType === reviewerProfile.skinType) {
        dermalMatch = 100;
    } else if (
        (userProfile.skinType === 'OILY' && reviewerProfile.skinType === 'COMBINATION') ||
        (userProfile.skinType === 'COMBINATION' && reviewerProfile.skinType === 'OILY') ||
        (userProfile.skinType === 'DRY' && reviewerProfile.skinType === 'SENSITIVE')
    ) {
        dermalMatch = 70;
    } else {
        dermalMatch = 30;
    }

    // Age Match
    const ageDiff = Math.abs(userProfile.age - reviewerProfile.age);
    let ageMatch = 100;
    if (ageDiff > 15) ageMatch = 30;
    else if (ageDiff > 10) ageMatch = 50;
    else if (ageDiff > 5) ageMatch = 70;

    // Concern Match
    const matchingBits = userProfile.concernMask & reviewerProfile.concernMask;
    let bitCount = 0;
    let n = matchingBits;
    while (n) {
        bitCount += n & 1;
        n >>= 1;
    }
    const concernMatch = Math.min(100, bitCount * 25);

    const overall = Math.round((dermalMatch + ageMatch + concernMatch) / 3);

    return { dermalMatch, ageMatch, concernMatch, overall };
};

// ============================================================================
// EVIDENCE CORRELATION ENGINE
// ============================================================================

/**
 * Filter testimonials based on evidence mode
 */
export const filterByEvidenceMode = (
    testimonials: Testimonial[],
    mode: EvidenceMode,
    userProfile: SkinProfile,
    currentProductId?: string,
    productIngredients?: string[]
): MatchedTestimonial[] => {
    let filtered: Testimonial[] = [];

    switch (mode) {
        case 'TWIN':
            // (ReviewerMask & UserMask) == UserMask
            filtered = testimonials.filter(t =>
                (t.reviewerProfile.concernMask & userProfile.concernMask) === userProfile.concernMask ||
                t.reviewerProfile.skinType === userProfile.skinType
            );
            break;

        case 'PRODUCT':
            // ReviewProductID == CurrentProductID
            filtered = currentProductId
                ? testimonials.filter(t => t.productId === currentProductId)
                : testimonials;
            break;

        case 'MOLECULE':
            // Find reviews with matching ingredients
            if (productIngredients && productIngredients.length > 0) {
                filtered = testimonials.filter(t =>
                    t.productIngredients.some(ing => productIngredients.includes(ing))
                );
            } else {
                filtered = testimonials;
            }
            break;
    }

    // Sort: prioritize verified + has media
    filtered.sort((a, b) => {
        const scoreA = (a.verifiedPurchase ? 2 : 0) + (a.hasMedia ? 1 : 0);
        const scoreB = (b.verifiedPurchase ? 2 : 0) + (b.hasMedia ? 1 : 0);
        return scoreB - scoreA;
    });

    // Enrich with match data
    return filtered.map(t => {
        const { score, reasons } = calculateProfileMatch(userProfile, t.reviewerProfile);
        const trust = calculateTrustScore(t);
        const sentimentTags = extractSentimentTags(t.comment);
        const highlightSentence = extractHighlightSentence(t.comment);
        const confidenceBreakdown = calculateConfidenceBreakdown(userProfile, t.reviewerProfile);

        return {
            ...t,
            matchScore: score,
            matchReasons: reasons,
            isRelevant: score >= 30 || mode !== 'TWIN',
            trustScore: trust.score,
            trustBadge: trust.badge,
            sentimentTags,
            highlightSentence,
            confidenceBreakdown
        };
    });
};

// ============================================================================
// AGGREGATE INSIGHTS
// ============================================================================

export const calculateAggregateInsights = (
    testimonials: MatchedTestimonial[],
    userSkinType: string
): AggregateInsights => {
    const total = testimonials.length;
    const matching = testimonials.filter(t => t.matchScore >= 50).length;
    const avgRating = total > 0
        ? testimonials.reduce((sum, t) => sum + t.rating, 0) / total
        : 0;
    const fiveStars = testimonials.filter(t => t.rating >= 4.5).length;
    const fiveStarPercent = total > 0 ? Math.round((fiveStars / total) * 100) : 0;

    // Aggregate sentiment tags
    const tagCounts: Record<string, { tag: SentimentTag; count: number }> = {};
    testimonials.forEach(t => {
        t.sentimentTags.forEach(tag => {
            if (!tagCounts[tag.type]) {
                tagCounts[tag.type] = { tag, count: 0 };
            }
            tagCounts[tag.type].count++;
        });
    });
    const topSentimentTags = Object.values(tagCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(x => x.tag);

    const summaryText = `Dari ${total} user ${userSkinType}, ${fiveStarPercent}% memberikan rating 5 bintang.`;

    return {
        totalReviews: total,
        matchingReviews: matching,
        averageRating: Math.round(avgRating * 10) / 10,
        fiveStarPercent,
        topSentimentTags,
        summaryText
    };
};

// ============================================================================
// EXISTING FUNCTIONS (Preserved)
// ============================================================================

export const calculateProfileMatch = (
    userProfile: SkinProfile,
    reviewerProfile: SkinProfile
): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

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

    const ageDiff = Math.abs(userProfile.age - reviewerProfile.age);
    if (ageDiff <= 5) {
        score += 15;
        reasons.push('Usia serupa (±5 tahun)');
    } else if (ageDiff <= 10) {
        score += 8;
        reasons.push('Rentang usia mendekati');
    }

    const sensitivityDiff = Math.abs(userProfile.sensitivity - reviewerProfile.sensitivity);
    if (sensitivityDiff <= 2) {
        score += 15;
        reasons.push('Level sensitivitas cocok');
    }

    return { score, reasons };
};

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

    const expectedDays = EXPECTED_HEALING_DAYS[claimedImprovement.toLowerCase()] || 30;

    if (testimonial.usageDurationDays < expectedDays * 0.5) {
        warnings.push(`Durasi ${testimonial.usageDurationDays} hari terlalu singkat untuk hasil optimal`);
        confidence -= 30;
    }

    if (!testimonial.verifiedPurchase) {
        warnings.push('Bukan pembelian terverifikasi');
        confidence -= 20;
    }

    if (testimonial.rating < 4 && testimonial.comment.toLowerCase().includes('bagus')) {
        warnings.push('Inkonsistensi rating dan komentar');
        confidence -= 15;
    }

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

export const filterTestimonials = (
    testimonials: Testimonial[],
    userProfile: SkinProfile,
    minMatchScore: number = 30
): MatchedTestimonial[] => {
    return testimonials
        .map(testimonial => {
            const { score, reasons } = calculateProfileMatch(userProfile, testimonial.reviewerProfile);
            const trust = calculateTrustScore(testimonial);
            const sentimentTags = extractSentimentTags(testimonial.comment);
            const highlightSentence = extractHighlightSentence(testimonial.comment);
            const confidenceBreakdown = calculateConfidenceBreakdown(userProfile, testimonial.reviewerProfile);

            return {
                ...testimonial,
                matchScore: score,
                matchReasons: reasons,
                isRelevant: score >= minMatchScore,
                trustScore: trust.score,
                trustBadge: trust.badge,
                sentimentTags,
                highlightSentence,
                confidenceBreakdown
            };
        })
        .filter(t => t.isRelevant)
        .sort((a, b) => b.matchScore - a.matchScore);
};

export const getProductTestimonials = (
    testimonials: MatchedTestimonial[],
    productId: string
): MatchedTestimonial[] => {
    return testimonials.filter(t => t.productId === productId);
};

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

export const generateMockTestimonials = (): Testimonial[] => {
    const skinTypes: SkinProfile['skinType'][] = ['OILY', 'DRY', 'COMBINATION', 'NORMAL', 'SENSITIVE'];

    // Link to real products from ProductTelemetry
    const products = PRODUCT_CATALOG.slice(0, 4).map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        image: p.media[0]?.url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=80',
        ingredients: p.ingredients
    }));

    const comments = [
        'Produk ini sangat bagus dan lembut di kulit! Tekstur ringan, cepat menyerap. Recommended banget.',
        'Hasilnya terlihat dalam seminggu, kulit jadi lebih cerah. Worth it harganya!',
        'Cocok untuk kulit berminyak, tidak lengket. Jerawat berkurang signifikan.',
        'Tekstur creamy tapi tidak berat. Wangi segar, love it!',
        'Ampuh banget untuk dark spots. Pemakaian rutin hasilnya mantap.',
        'Agak lengket awalnya tapi hasilnya oke. Harga terjangkau.',
        'Tidak cocok di kulitku yang sensitif, agak perih. Rating 3.',
        'Amazing! Kulit jadi glowing dalam 2 minggu. Must try!',
        'Tekstur watery, cepat menyerap. Efektif untuk hidrasi.',
        'Bagus untuk anti aging, kerut berkurang. Recommended untuk usia 30+.'
    ];

    const names = ['Siti A.', 'Budi S.', 'Maya R.', 'Rina D.', 'Dewi P.', 'Ani K.', 'Putri L.', 'Wati N.', 'Lina M.', 'Dina Y.'];

    return Array.from({ length: 15 }, (_, i) => {
        const product = products[i % products.length];
        const hasProgress = Math.random() > 0.3;

        return {
            id: `REVIEW-${1000 + i}`,
            userId: `USER-${2000 + i}`,
            productId: product.id,
            productName: product.name,
            productBrand: product.brand,
            productImage: product.image,
            productIngredients: product.ingredients,
            reviewerProfile: {
                concernMask: [1, 2, 4, 8, 16][Math.floor(Math.random() * 5)] |
                    [0, 1, 2, 4][Math.floor(Math.random() * 4)],
                skinType: skinTypes[Math.floor(Math.random() * skinTypes.length)],
                age: 20 + Math.floor(Math.random() * 20),
                sensitivity: Math.floor(Math.random() * 10)
            },
            reviewerName: names[i % names.length],
            beforeImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=200&q=80',
            afterImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=80',
            weeklyProgress: hasProgress ? [
                { weekNumber: 1, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=150&q=80', caption: 'Minggu 1: Adaptasi kulit' },
                { weekNumber: 2, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=150&q=80', caption: 'Minggu 2: Purging ringan' },
                { weekNumber: 3, image: 'https://images.unsplash.com/photo-1556228453-efd21e1a1f77?auto=format&fit=crop&w=150&q=80', caption: 'Minggu 3: Mulai terlihat hasil' },
                { weekNumber: 4, image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=150&q=80', caption: 'Minggu 4: Glowing! ✨' }
            ] : [],
            usageDurationDays: 14 + Math.floor(Math.random() * 60),
            rating: 3 + Math.random() * 2,
            comment: comments[i % comments.length],
            verifiedPurchase: Math.random() > 0.2,
            hasMedia: hasProgress,
            transactionId: Math.random() > 0.3 ? `TXN-${3000 + i}` : undefined,
            createdAt: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        };
    });
};
