// SkinTwinEvidenceGallery.tsx - Personalized Testimonials with Timeline
import { useState, useMemo } from 'react';
import { Users, Star, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import {
    filterTestimonials,
    validateClaim,
    generateMockTestimonials,
    type SkinProfile,
    type MatchedTestimonial
} from '../engines/DermatologicalMatchSolver';
import { ConcernMask } from '../engines/InventoryTopologyNode';

export const SkinTwinEvidenceGallery = () => {
    // Simulated logged-in user profile
    const [userProfile] = useState<SkinProfile>({
        concernMask: ConcernMask.OILY | ConcernMask.ACNE,
        skinType: 'OILY',
        age: 25,
        sensitivity: 3
    });

    const [testimonials] = useState(generateMockTestimonials);
    const [onlyMatching, setOnlyMatching] = useState(true);
    const [selectedTestimonial, setSelectedTestimonial] = useState<MatchedTestimonial | null>(null);
    const [weekSlider, setWeekSlider] = useState(3); // Week 4 (0-indexed)

    const filteredTestimonials = useMemo(() => {
        if (onlyMatching) {
            return filterTestimonials(testimonials, userProfile, 30);
        }
        return testimonials.map(t => ({
            ...t,
            matchScore: 0,
            matchReasons: [],
            isRelevant: true
        }));
    }, [testimonials, userProfile, onlyMatching]);

    const handleSelect = (t: MatchedTestimonial) => {
        setSelectedTestimonial(t);
        setWeekSlider(3);
    };

    const validation = selectedTestimonial
        ? validateClaim(selectedTestimonial, 'acne')
        : null;

    return (
        <div className="bg-gradient-to-br from-teal-950 to-slate-900 rounded-2xl p-6 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-500 p-2 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Skin Twin Gallery</h3>
                        <p className="text-xs text-slate-400">Personalized testimonials</p>
                    </div>
                </div>

                {/* Profile Matcher Toggle */}
                <button
                    onClick={() => setOnlyMatching(!onlyMatching)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${onlyMatching
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                >
                    👤 {onlyMatching ? 'Showing Similar' : 'Show All'}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Left: Testimonial List */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {filteredTestimonials.slice(0, 6).map(t => (
                        <div
                            key={t.id}
                            onClick={() => handleSelect(t)}
                            className={`bg-slate-800/60 rounded-xl p-3 cursor-pointer transition-all hover:bg-slate-800 ${selectedTestimonial?.id === t.id ? 'ring-2 ring-teal-500' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
                                        {t.reviewerName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{t.reviewerName}</div>
                                        <div className="text-[10px] text-slate-400">
                                            {t.reviewerProfile.skinType} | {t.usageDurationDays} day
                                        </div>
                                    </div>
                                </div>
                                {onlyMatching && (
                                    <div className="bg-teal-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-teal-400">
                                        {t.matchScore}% match
                                    </div>
                                )}
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

                            <div className="text-xs text-slate-300 line-clamp-2">{t.comment}</div>

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
                </div>

                {/* Right: Detail View with Timeline */}
                <div>
                    {selectedTestimonial ? (
                        <>
                            {/* Before/After with Timeline Slider */}
                            <div className="bg-slate-800 rounded-xl p-4 mb-4">
                                <div className="flex gap-4 mb-4">
                                    <div className="flex-1 text-center">
                                        <div className="text-[10px] text-slate-400 uppercase mb-2">Before</div>
                                        <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                                            <img src={selectedTestimonial.beforeImage} alt="Before" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="text-[10px] text-slate-400 uppercase mb-2">Week {weekSlider + 1}</div>
                                        <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                                            <img
                                                src={selectedTestimonial.weeklyProgress[weekSlider] || selectedTestimonial.afterImage}
                                                alt={`Week ${weekSlider + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Slider */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                        <span>Week 1</span>
                                        <span>Week 4</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={3}
                                        value={weekSlider}
                                        onChange={(e) => setWeekSlider(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                    />
                                    <div className="flex justify-between mt-1">
                                        <button
                                            onClick={() => setWeekSlider(Math.max(0, weekSlider - 1))}
                                            disabled={weekSlider === 0}
                                            className="p-1 text-slate-400 disabled:opacity-30"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => setWeekSlider(Math.min(3, weekSlider + 1))}
                                            disabled={weekSlider === 3}
                                            className="p-1 text-slate-400 disabled:opacity-30"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

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

                            {/* Metadata */}
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                    <div className="text-lg font-mono font-bold text-teal-400">{selectedTestimonial.usageDurationDays}</div>
                                    <div className="text-[9px] text-slate-500">Days Used</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                    <div className="text-lg font-mono font-bold text-purple-400">{selectedTestimonial.reviewerProfile.skinType}</div>
                                    <div className="text-[9px] text-slate-500">Skin Type</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                    <div className="text-lg font-mono font-bold text-pink-400">{selectedTestimonial.verifiedPurchase ? '✓' : '✗'}</div>
                                    <div className="text-[9px] text-slate-500">Verified</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                            Select a testimonial to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
