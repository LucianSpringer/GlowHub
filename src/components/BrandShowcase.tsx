import { useState } from 'react';
import { _BRAND_DB } from '../data/MarketData';
import { Crown, AlertTriangle, TrendingUp } from 'lucide-react';

export const BrandShowcase = () => {
    const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

    const featuredBrands = _BRAND_DB.filter(b => b.isFeatured);

    return (
        <section id="brands" className="py-20 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                <span className="text-[#FF6B9D] font-bold tracking-widest text-xs uppercase">Official Partners</span>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">Curated Local Excellence</h3>
            </div>

            <div className="flex flex-wrap gap-8 justify-center px-6">
                {featuredBrands.map((brand) => (
                    <div
                        key={brand.id}
                        className="relative group cursor-pointer"
                        onMouseEnter={() => setHoveredBrand(brand.id)}
                        onMouseLeave={() => setHoveredBrand(null)}
                    >
                        {/* Brand Logo Placeholder (Text for Purity) */}
                        <div className="text-2xl md:text-4xl font-black text-slate-300 group-hover:text-[#FF6B9D] transition-colors duration-300 select-none">
                            {brand.name}
                        </div>

                        {/* Hover Quick Card */}
                        <div className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white p-4 rounded-xl shadow-xl transition-all duration-300 z-30 pointer-events-none ${hoveredBrand === brand.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-lg">{brand.name}</span>
                                {brand.tier === 'PLATINUM' && <Crown size={16} className="text-amber-400" />}
                            </div>
                            <div className="text-xs text-slate-400 mb-3 space-y-1">
                                <div className="flex justify-between">
                                    <span>Rating:</span> <span className="text-white font-mono">{brand.avgRating} / 5.0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Products:</span> <span className="text-white font-mono">{brand.productCount} SKUs</span>
                                </div>
                            </div>

                            {brand.stockStatus !== 'AMPLE' && (
                                <div className="flex items-center gap-2 text-[10px] bg-rose-500/20 text-rose-300 px-2 py-1 rounded">
                                    <AlertTriangle size={12} /> Stock: {brand.stockStatus}
                                </div>
                            )}

                            <div className="mt-3 pt-3 border-t border-slate-700">
                                <div className="text-[10px] text-slate-500 uppercase">Top Pick</div>
                                <div className="text-xs font-bold text-[#FF6B9D] flex items-center gap-1">
                                    <TrendingUp size={12} /> {brand.heroProduct}
                                </div>
                            </div>

                            {/* Triangle */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-slate-900"></div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
