// SkinTwinEvidenceGallery.tsx - Intelligent Evidence Engine v2.0
// Pattern: EvidenceMode + ConfidenceBreakdown + NarrativeSlider + ResellerIntelligence

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Users, Star, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle,
    Play, Pause, ShoppingCart, Award, FlaskConical, User, Package,
    BarChart3, Quote
} from 'lucide-react';
import {
    filterByEvidenceMode,
    validateClaim,
    generateMockTestimonials,
    calculateAggregateInsights,
    type SkinProfile,
    type MatchedTestimonial,
    type EvidenceMode,
    type AggregateInsights
} from '../engines/DermatologicalMatchSolver';
import { ConcernMask } from '../engines/InventoryTopologyNode';

// ============================================================================
// PROPS
// ============================================================================

interface SkinTwinEvidenceGalleryProps {
    productId?: string;
    productIngredients?: string[];
    onProductSelect?: (productId: string) => void;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// ReviewContextHeader - Product anchor card
const ReviewContextHeader = ({
    testimonial,
    onProductClick
}: {
    testimonial: MatchedTestimonial;
    onProductClick?: (id: string) => void;
}) => {
    const [showQuickView, setShowQuickView] = useState(false);

    return (
        <div
            className="relative bg-slate-800/80 rounded-xl p-3 mb-3 flex items-center gap-3 group cursor-pointer hover:bg-slate-800"
            onMouseEnter={() => setShowQuickView(true)}
            onMouseLeave={() => setShowQuickView(false)}
            onClick={() => onProductClick?.(testimonial.productId)}
        >
            {/* Product Thumbnail */}
            <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                    src={testimonial.productImage}
                    alt={testimonial.productName}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Brand & Name */}
            <div className="flex-1 min-w-0">
                <div className="text-[10px] text-teal-400 font-bold uppercase">{testimonial.productBrand}</div>
                <div className="text-sm font-bold text-white truncate">{testimonial.productName}</div>
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            size={10}
                            className={i < Math.round(testimonial.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                        />
                    ))}
                </div>
            </div>

            {/* View Button */}
            <button
                className="flex-shrink-0 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onProductClick?.(testimonial.productId); }}
            >
                <ShoppingCart size={14} />
            </button>

            {/* Quick View Popup */}
            {showQuickView && (
                <div className="absolute top-full left-0 mt-2 z-20 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl min-w-[200px]">
                    <div className="text-xs text-slate-400 mb-1">Quick View</div>
                    <div className="text-sm font-bold text-white mb-2">{testimonial.productName}</div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Harga</span>
                        <span className="text-teal-400 font-bold">Rp 85.000</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-400">Stok</span>
                        <span className="text-emerald-400 font-bold">Tersedia</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// EvidenceModeSwitcher - Tab control
const EvidenceModeSwitcher = ({
    activeMode,
    onModeChange
}: {
    activeMode: EvidenceMode;
    onModeChange: (mode: EvidenceMode) => void;
}) => {
    const modes: { id: EvidenceMode; label: string; icon: typeof Users; description: string }[] = [
        { id: 'TWIN', label: 'Skin Twin', icon: User, description: 'Profil kulit sama' },
        { id: 'PRODUCT', label: 'Product', icon: Package, description: 'Semua review produk' },
        { id: 'MOLECULE', label: 'Molecule', icon: FlaskConical, description: 'Bahan sama' }
    ];

    return (
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl mb-4">
            {modes.map(mode => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;

                return (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${isActive
                                ? 'bg-teal-500 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

// NarrativeSliderOverlay - Enhanced image slider with captions
const NarrativeSliderOverlay = ({
    testimonial,
    weekSlider,
    onWeekChange
}: {
    testimonial: MatchedTestimonial;
    weekSlider: number;
    onWeekChange: (week: number) => void;
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Auto-play loop
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            onWeekChange(weekSlider >= 3 ? 0 : weekSlider + 1);
        }, 2000);

        return () => clearInterval(interval);
    }, [isPlaying, weekSlider, onWeekChange]);

    const currentSlide = testimonial.weeklyProgress[weekSlider];
    const hasProgress = testimonial.weeklyProgress.length > 0;

    return (
        <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <div className="flex gap-4 mb-4">
                {/* Before */}
                <div className="flex-1 text-center">
                    <div className="text-[10px] text-slate-400 uppercase mb-2">Before</div>
                    <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                        <img src={testimonial.beforeImage} alt="Before" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Progress/After */}
                <div className="flex-1 text-center relative">
                    <div className="text-[10px] text-slate-400 uppercase mb-2">
                        {hasProgress ? `Week ${weekSlider + 1}` : 'After'}
                    </div>
                    <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden relative">
                        <img
                            src={hasProgress && currentSlide ? currentSlide.image : testimonial.afterImage}
                            alt={`Week ${weekSlider + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Caption Overlay */}
                        {hasProgress && currentSlide && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                <div className="text-xs text-white font-bold">{currentSlide.caption}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline Controls */}
            {hasProgress && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="bg-teal-500 hover:bg-teal-600 text-white p-1.5 rounded-lg"
                        >
                            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                        <div className="flex-1 flex gap-1">
                            {testimonial.weeklyProgress.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onWeekChange(idx)}
                                    className={`flex-1 h-1.5 rounded-full transition-all ${idx === weekSlider ? 'bg-teal-500' : 'bg-slate-600'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button
                            onClick={() => onWeekChange(Math.max(0, weekSlider - 1))}
                            disabled={weekSlider === 0}
                            className="p-1 text-slate-400 disabled:opacity-30"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-[10px] text-slate-500">
                            {currentSlide?.caption || `Week ${weekSlider + 1}`}
                        </span>
                        <button
                            onClick={() => onWeekChange(Math.min(3, weekSlider + 1))}
                            disabled={weekSlider >= testimonial.weeklyProgress.length - 1}
                            className="p-1 text-slate-400 disabled:opacity-30"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ConfidenceBreakdownHUD - 3-bar visualization
const ConfidenceBreakdownHUD = ({
    breakdown
}: {
    breakdown: { dermalMatch: number; ageMatch: number; concernMatch: number; overall: number };
}) => {
    const bars = [
        { label: 'Dermal Match', value: breakdown.dermalMatch, color: 'bg-teal-500' },
        { label: 'Age Match', value: breakdown.ageMatch, color: 'bg-purple-500' },
        { label: 'Concern Match', value: breakdown.concernMatch, color: 'bg-pink-500' }
    ];

    return (
        <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase mb-2">
                <BarChart3 size={12} /> Lab Analysis
            </div>

            <div className="space-y-2">
                {bars.map((bar, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-400">{bar.label}</span>
                            <span className="text-white font-bold">{bar.value}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${bar.color} rounded-full transition-all duration-500`}
                                style={{ width: `${bar.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-700 flex justify-between items-center">
                <span className="text-xs text-slate-400">Overall Match</span>
                <span className="text-lg font-mono font-bold text-teal-400">{breakdown.overall}%</span>
            </div>
        </div>
    );
};

// AggregateInsightPanel - Statistics summary
const AggregateInsightPanel = ({
    insights
}: {
    insights: AggregateInsights;
}) => {
    return (
        <div className="bg-gradient-to-r from-teal-900/50 to-slate-800/50 rounded-xl p-4 mt-4">
            <div className="flex items-center gap-2 text-[10px] text-teal-400 uppercase font-bold mb-3">
                <BarChart3 size={12} /> Community Insights
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                    <div className="text-xl font-mono font-bold text-white">{insights.totalReviews}</div>
                    <div className="text-[9px] text-slate-400">Total Reviews</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-mono font-bold text-yellow-400">{insights.averageRating}</div>
                    <div className="text-[9px] text-slate-400">Avg Rating</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-mono font-bold text-emerald-400">{insights.fiveStarPercent}%</div>
                    <div className="text-[9px] text-slate-400">5-Star</div>
                </div>
            </div>

            {/* Top Sentiment Tags */}
            {insights.topSentimentTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {insights.topSentimentTags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full">
                            {tag.emoji} {tag.label}
                        </span>
                    ))}
                </div>
            )}

            {/* Summary Text */}
            <div className="text-xs text-slate-300 italic">
                "{insights.summaryText}"
            </div>
        </div>
    );
};

// Trust Badge Component
const TrustBadge = ({ badge }: { badge: 'GOLD' | 'SILVER' | 'NONE' }) => {
    if (badge === 'NONE') return null;

    return (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${badge === 'GOLD'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-slate-500/20 text-slate-300'
            }`}>
            <Award size={10} />
            {badge === 'GOLD' ? 'Gold Verified' : 'Verified'}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SkinTwinEvidenceGallery = ({
    productId,
    productIngredients,
    onProductSelect
}: SkinTwinEvidenceGalleryProps) => {
    // User profile (simulated)
    const [userProfile] = useState<SkinProfile>({
        concernMask: ConcernMask.OILY | ConcernMask.ACNE,
        skinType: 'OILY',
        age: 25,
        sensitivity: 3
    });

    const [testimonials] = useState(generateMockTestimonials);
    const [evidenceMode, setEvidenceMode] = useState<EvidenceMode>('TWIN');
    const [selectedTestimonial, setSelectedTestimonial] = useState<MatchedTestimonial | null>(null);
    const [weekSlider, setWeekSlider] = useState(0);

    // Filter testimonials based on mode
    const filteredTestimonials = useMemo(() => {
        return filterByEvidenceMode(
            testimonials,
            evidenceMode,
            userProfile,
            productId,
            productIngredients
        );
    }, [testimonials, evidenceMode, userProfile, productId, productIngredients]);

    // Aggregate insights
    const aggregateInsights = useMemo(() =>
        calculateAggregateInsights(filteredTestimonials, userProfile.skinType),
        [filteredTestimonials, userProfile.skinType]
    );

    // Validation for selected testimonial
    const validation = selectedTestimonial
        ? validateClaim(selectedTestimonial, 'acne')
        : null;

    const handleSelect = useCallback((t: MatchedTestimonial) => {
        setSelectedTestimonial(t);
        setWeekSlider(0);
    }, []);

    const handleProductClick = useCallback((id: string) => {
        onProductSelect?.(id);
    }, [onProductSelect]);

    return (
        <div className="bg-gradient-to-br from-teal-950 to-slate-900 rounded-2xl p-6 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-500 p-2 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Intelligent Evidence Gallery</h3>
                        <p className="text-xs text-slate-400">AI-powered testimonial matching</p>
                    </div>
                </div>
            </div>

            {/* Evidence Mode Switcher */}
            <EvidenceModeSwitcher
                activeMode={evidenceMode}
                onModeChange={setEvidenceMode}
            />

            <div className="grid grid-cols-2 gap-6">
                {/* Left: Testimonial List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {filteredTestimonials.slice(0, 8).map(t => (
                        <div
                            key={t.id}
                            onClick={() => handleSelect(t)}
                            className={`bg-slate-800/60 rounded-xl p-3 cursor-pointer transition-all hover:bg-slate-800 ${selectedTestimonial?.id === t.id ? 'ring-2 ring-teal-500' : ''
                                }`}
                        >
                            {/* Highlight Sentence */}
                            {t.highlightSentence && (
                                <div className="flex items-start gap-2 mb-2 text-[11px] text-teal-300 italic">
                                    <Quote size={10} className="flex-shrink-0 mt-0.5" />
                                    "{t.highlightSentence}"
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
                                        {t.reviewerName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            {t.reviewerName}
                                            <TrustBadge badge={t.trustBadge} />
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            {t.reviewerProfile.skinType} | {t.usageDurationDays} hari
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-teal-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-teal-400">
                                    {t.matchScore}%
                                </div>
                            </div>

                            <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                        key={i}
                                        size={12}
                                        className={i < Math.round(t.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                                    />
                                ))}
                            </div>

                            <div className="text-xs text-slate-300 line-clamp-2 mb-2">{t.comment}</div>

                            {/* Sentiment Tags */}
                            {t.sentimentTags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {t.sentimentTags.map((tag, i) => (
                                        <span key={i} className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                                            {tag.emoji} {tag.label}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Match Reasons */}
                            {t.matchReasons.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {t.matchReasons.slice(0, 2).map((reason, i) => (
                                        <span key={i} className="text-[9px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded">
                                            ✓ {reason}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredTestimonials.length === 0 && (
                        <div className="text-center text-slate-500 py-8">
                            Tidak ada review yang cocok dengan filter ini
                        </div>
                    )}
                </div>

                {/* Right: Detail View */}
                <div>
                    {selectedTestimonial ? (
                        <>
                            {/* Product Context Header */}
                            <ReviewContextHeader
                                testimonial={selectedTestimonial}
                                onProductClick={handleProductClick}
                            />

                            {/* Confidence Breakdown HUD */}
                            <ConfidenceBreakdownHUD
                                breakdown={selectedTestimonial.confidenceBreakdown}
                            />

                            {/* Narrative Slider */}
                            <NarrativeSliderOverlay
                                testimonial={selectedTestimonial}
                                weekSlider={weekSlider}
                                onWeekChange={setWeekSlider}
                            />

                            {/* Verification Badge */}
                            {validation && (
                                <div className={`rounded-xl p-3 ${validation.isPlausible
                                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                                        : 'bg-yellow-500/10 border border-yellow-500/30'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {validation.isPlausible ? (
                                            <CheckCircle size={16} className="text-emerald-400" />
                                        ) : (
                                            <AlertTriangle size={16} className="text-yellow-400" />
                                        )}
                                        <span className={`text-xs font-bold ${validation.isPlausible ? 'text-emerald-400' : 'text-yellow-400'
                                            }`}>
                                            Confidence: {validation.confidence}%
                                        </span>
                                    </div>
                                    {validation.warnings.length > 0 && (
                                        <div className="space-y-1">
                                            {validation.warnings.map((w, i) => (
                                                <div key={i} className="text-[10px] text-slate-400">• {w}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Metadata Grid */}
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                    <div className="text-lg font-mono font-bold text-teal-400">
                                        {selectedTestimonial.usageDurationDays}
                                    </div>
                                    <div className="text-[9px] text-slate-500">Days Used</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                    <div className="text-lg font-mono font-bold text-purple-400">
                                        {selectedTestimonial.reviewerProfile.skinType}
                                    </div>
                                    <div className="text-[9px] text-slate-500">Skin Type</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                    <div className="text-lg font-mono font-bold text-pink-400">
                                        {selectedTestimonial.trustScore}
                                    </div>
                                    <div className="text-[9px] text-slate-500">Trust Score</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                            <Users size={48} className="mb-4 opacity-30" />
                            <span>Select a testimonial to view details</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Aggregate Insight Panel */}
            <AggregateInsightPanel insights={aggregateInsights} />
        </div>
    );
};
