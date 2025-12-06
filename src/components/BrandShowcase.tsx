// BrandShowcase.tsx - Refactored as BrandOrchestrator
// Pattern: Engine-driven sorting + Telemetry integration + Dynamic theming

import { useState, useCallback } from 'react';
import { useBrandResonance } from '../hooks/useBrandResonance';
import { BrandTelemetrySensor } from './BrandTelemetrySensor';
import { BrandHologramCard } from './BrandHologramCard';
import { constructCatalogUrl } from '../engines/SmartRoutingMatrix';
import { Sparkles } from 'lucide-react';

interface BrandShowcaseProps {
    userMode?: 'GUEST' | 'DROPSHIPPER';
    onBrandClick?: (brandSlug: string, url: string) => void;
}

export const BrandShowcase = ({
    userMode = 'GUEST',
    onBrandClick
}: BrandShowcaseProps) => {
    const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
    const { brands, brandOfTheDay, recordHover, recordClick } = useBrandResonance(true);

    const handleInterest = useCallback((brandId: string, duration: number) => {
        recordHover(brandId, duration);
    }, [recordHover]);

    const handleClick = useCallback((brandId: string) => {
        recordClick(brandId);

        const brand = brands.find(b => b.id === brandId);
        if (brand && onBrandClick) {
            const url = constructCatalogUrl(brand.slug, { source: 'brand_showcase' });
            onBrandClick(brand.slug, url);
        }
    }, [brands, recordClick, onBrandClick]);

    return (
        <section id="brands" className="py-20 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                <span className="text-[#FF6B9D] font-bold tracking-widest text-xs uppercase">
                    Official Partners
                </span>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                    Curated Local Excellence
                </h3>

                {/* Brand of the Day indicator */}
                {brandOfTheDay && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-full border border-pink-200">
                        <Sparkles size={14} className="text-pink-500" />
                        <span className="text-xs text-slate-600">
                            Trending today: <strong className="text-pink-500">
                                {brands.find(b => b.id === brandOfTheDay)?.name || 'Loading...'}
                            </strong>
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-8 justify-center px-6">
                {brands.map((brand) => (
                    <BrandTelemetrySensor
                        key={brand.id}
                        brandId={brand.id}
                        onInterest={handleInterest}
                        onClick={handleClick}
                    >
                        <div
                            className="relative group cursor-pointer"
                            onMouseEnter={() => setHoveredBrand(brand.id)}
                            onMouseLeave={() => setHoveredBrand(null)}
                        >
                            {/* Brand Name with Theme Color on Hover */}
                            <div
                                className="text-2xl md:text-4xl font-black text-slate-300 transition-all duration-300 select-none group-hover:scale-105"
                                style={{
                                    color: hoveredBrand === brand.id ? brand.themeColor : undefined
                                }}
                            >
                                {brand.name}
                            </div>

                            {/* Promotional Badge */}
                            {brand.promotionalWeight > 0 && (
                                <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                    PROMO
                                </div>
                            )}

                            {/* Hologram Card (Hover) */}
                            <BrandHologramCard
                                brand={brand}
                                isVisible={hoveredBrand === brand.id}
                                userMode={userMode}
                            />
                        </div>
                    </BrandTelemetrySensor>
                ))}
            </div>

            {/* Debug: Resonance Scores (remove in production) */}
            <div className="mt-8 text-center text-[10px] text-slate-400">
                Sorted by ResonanceScore • Hover 200ms+ to boost priority
            </div>
        </section>
    );
};
