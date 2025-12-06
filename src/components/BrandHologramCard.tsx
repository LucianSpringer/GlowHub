// BrandHologramCard.tsx - Smart Hover Popup with Dynamic Theming
import { Crown, Award, Star, AlertTriangle, TrendingUp, Percent } from 'lucide-react';
import { generateCardStyle, getTierBadge } from '../engines/TierVisualizerKernel';
import { type ScoredBrand } from '../engines/BrandResonanceEngine';
import { BrandTag } from '../data/MarketData';

interface BrandHologramCardProps {
    brand: ScoredBrand;
    isVisible: boolean;
    userMode: 'GUEST' | 'DROPSHIPPER';
}

const TierIcon = ({ tier }: { tier: 'crown' | 'badge' | 'star' }) => {
    switch (tier) {
        case 'crown': return <Crown size={16} />;
        case 'badge': return <Award size={16} />;
        case 'star': return <Star size={16} />;
    }
};

const TagBadge = ({ tag, active }: { tag: string; active: boolean }) => (
    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-500'
        }`}>
        {tag}
    </span>
);

export const BrandHologramCard = ({ brand, isVisible, userMode }: BrandHologramCardProps) => {
    const cardStyle = generateCardStyle(brand.themeColor);
    const tierBadge = getTierBadge(brand.tier);

    return (
        <div
            className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-72 rounded-2xl shadow-2xl 
                transition-all duration-300 z-30 pointer-events-none overflow-hidden
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
                background: `linear-gradient(135deg, ${brand.themeColor}ee, ${brand.themeColor}99)`,
                boxShadow: `0 20px 40px ${cardStyle.shadowColor}`
            }}
        >
            {/* Header */}
            <div className="p-4 pb-2">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span
                            className="font-black text-xl"
                            style={{ color: cardStyle.textColor }}
                        >
                            {brand.name}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                            <span
                                className="text-xs opacity-80"
                                style={{ color: cardStyle.textColor }}
                            >
                                {tierBadge.label}
                            </span>
                        </div>
                    </div>
                    <div
                        className="p-1.5 rounded-lg"
                        style={{ backgroundColor: tierBadge.color, color: '#000' }}
                    >
                        <TierIcon tier={tierBadge.icon} />
                    </div>
                </div>

                {/* Tags */}
                <div className="flex gap-1 flex-wrap mb-3">
                    <TagBadge tag="BPOM" active={(brand.tags & BrandTag.BPOM) !== 0} />
                    <TagBadge tag="HALAL" active={(brand.tags & BrandTag.HALAL) !== 0} />
                    <TagBadge tag="VEGAN" active={(brand.tags & BrandTag.VEGAN) !== 0} />
                    <TagBadge tag="LOCAL" active={(brand.tags & BrandTag.LOCAL) !== 0} />
                </div>

                {/* Stats */}
                <div
                    className="text-xs space-y-1.5 opacity-90"
                    style={{ color: cardStyle.textColor }}
                >
                    {userMode === 'GUEST' ? (
                        <>
                            <div className="flex justify-between">
                                <span>Rating:</span>
                                <span className="font-mono font-bold">{brand.avgRating} / 5.0 ★</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Products:</span>
                                <span className="font-mono font-bold">{brand.productCount} SKUs</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1"><Percent size={10} /> Avg Margin:</span>
                                <span className="font-mono font-bold text-emerald-300">{brand.avgMargin || 25}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Products:</span>
                                <span className="font-mono font-bold">{brand.productCount} SKUs</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Stock Alert */}
            {brand.stockStatus !== 'AMPLE' && (
                <div
                    className="flex items-center gap-2 text-[10px] px-4 py-2"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        color: brand.stockStatus === 'CRITICAL' ? '#FCA5A5' : '#FDE68A'
                    }}
                >
                    <AlertTriangle size={12} />
                    Stock: {brand.stockStatus}
                </div>
            )}

            {/* Hero Product */}
            <div
                className="px-4 py-3 border-t"
                style={{
                    borderColor: 'rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(0,0,0,0.15)'
                }}
            >
                <div
                    className="text-[10px] uppercase opacity-60"
                    style={{ color: cardStyle.textColor }}
                >
                    Top Pick
                </div>
                <div
                    className="text-sm font-bold flex items-center gap-1"
                    style={{ color: cardStyle.textColor }}
                >
                    <TrendingUp size={14} /> {brand.heroProduct}
                </div>
            </div>

            {/* Resonance Score Badge */}
            <div className="absolute top-2 right-2 bg-black/30 px-2 py-1 rounded-full">
                <span className="text-[10px] font-mono text-white/80">
                    RS: {brand.resonanceScore}
                </span>
            </div>

            {/* Triangle Pointer */}
            <div
                className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent"
                style={{ borderTopColor: `${brand.themeColor}99` }}
            />
        </div>
    );
};
