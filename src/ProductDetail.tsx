import { useState } from 'react';
import {
    ShoppingCart, Star, Info, ShieldCheck, TrendingUp,
    AlertCircle, CheckCircle2, RefreshCw, Download
} from 'lucide-react';
import {
    useSupplyChainResonance,
    useMarginVelocity,
    useDermalGraph,
    IngredientFunction
} from './ProductTelemetry';
import type { ProductTelemetry } from './ProductTelemetry';



export const ProductDetail = ({ product, isDropshipper = false, onBack }: { product: ProductTelemetry, isDropshipper?: boolean, onBack: () => void }) => {
    // Wiring the Engines
    const stockEngine = useSupplyChainResonance(product.stockQty);
    const profitEngine = useMarginVelocity(product.basePrice);
    const ingredients = useDermalGraph(product.ingredients);

    const [activeMedia, setActiveMedia] = useState(0);

    return (
        <div className="min-h-screen bg-white pb-20 animate-fade-in-up">
            {/* Nav / Back */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <button onClick={onBack} className="text-sm font-semibold text-slate-500 hover:text-[#FF6B9D]">
                    ← Back to Store
                </button>
                <div className="text-xs font-mono text-slate-400">
                    SKU: {product.sku} | SYNC: {stockEngine.status === 'UPDATING' ? '...' : 'OK'}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16">

                {/* 1. MEDIA GALLERY */}
                <div className="space-y-6">
                    <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 relative group">
                        <img
                            src={product.media[activeMedia].url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {isDropshipper && (
                            <button className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:text-[#FF6B9D]">
                                <Download size={20} />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {product.media.map((m, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveMedia(i)}
                                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeMedia === i ? 'border-[#FF6B9D]' : 'border-transparent opacity-70'}`}
                            >
                                <img src={m.url} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. PRODUCT INFO & LOGIC */}
                <div className="space-y-10">

                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-[#FF6B9D]/10 text-[#FF6B9D] px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                                {product.brand}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                <Star size={14} fill="currentColor" />
                                <span>4.8</span>
                                <span className="text-slate-400 font-normal">(142 Reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            Advanced dermatological formula designed to target specific skin vectors using high-efficacy molecular compounds.
                        </p>
                    </div>

                    {/* Stock & Price Logic */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <div className="text-3xl font-bold text-slate-900">
                                Rp {product.marketPrice.toLocaleString()}
                            </div>
                            {isDropshipper && (
                                <div className="text-xs text-slate-500 mt-1 font-mono">
                                    BASE: Rp {product.basePrice.toLocaleString()}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${stockEngine.stockStatus.bg} ${stockEngine.stockStatus.color}`}>
                                {stockEngine.status === 'UPDATING' ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                {stockEngine.stockStatus.label} ({stockEngine.stock})
                            </div>
                        </div>
                    </div>

                    {/* 5. PROFIT ESTIMATOR (Dropshipper Only) */}
                    {isDropshipper && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={100} /></div>
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-[#FF6B9D]" />
                                Margin Velocity Calculator
                            </h3>

                            <div className="grid grid-cols-2 gap-8 mb-6 relative z-10">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Selling Price</label>
                                    <input
                                        type="number"
                                        value={profitEngine.sellingPrice}
                                        onChange={(e) => profitEngine.setSellingPrice(Number(e.target.value))}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white font-mono focus:border-[#FF6B9D] focus:outline-none"
                                    />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Est. Profit</div>
                                    <div className={`text-2xl font-bold font-mono ${profitEngine.metrics.isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        Rp {profitEngine.metrics.profit.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Margin: {profitEngine.metrics.margin}%
                                    </div>
                                </div>
                            </div>
                            {!profitEngine.metrics.isHealthy && (
                                <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-900/30 p-2 rounded-lg">
                                    <AlertCircle size={12} /> Low yield warning. Consider raising price.
                                </div>
                            )}
                        </div>
                    )}

                    {/* CTA */}
                    <div className="flex gap-4">
                        <button
                            disabled={!stockEngine.stockStatus.actionable}
                            className="flex-1 bg-[#FF6B9D] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-pink-200/50 hover:bg-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            <ShoppingCart size={20} />
                            {stockEngine.stockStatus.actionable ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>

                    {/* 2. INGREDIENT & BENEFIT BREAKDOWN */}
                    <div className="border-t border-slate-100 pt-8">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Info size={18} className="text-[#FF6B9D]" /> Molecular Composition
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {ingredients.map(ing => (
                                <div key={ing.id} className="p-4 rounded-xl border border-slate-100 hover:border-pink-100 hover:bg-pink-50/30 transition-all">
                                    <div className="font-bold text-sm text-slate-800 mb-1">{ing.name}</div>
                                    <p className="text-xs text-slate-500 leading-relaxed">{ing.description}</p>
                                    <div className="mt-2 flex gap-2">
                                        {(ing.functionMask & IngredientFunction.ACNE_FIGHTING) ? <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded">Acne</span> : null}
                                        {(ing.functionMask & IngredientFunction.BRIGHTENING) ? <span className="text-[10px] bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">Bright</span> : null}
                                        {(ing.functionMask & IngredientFunction.HYDRATING) ? <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Hydra</span> : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. REVIEWS (Marketplace Sync) */}
                    <div className="border-t border-slate-100 pt-8">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#FF6B9D]" /> Marketplace Verification
                        </h3>
                        <div className="space-y-4">
                            {product.reviews.map(review => (
                                <div key={review.id} className="bg-slate-50 p-4 rounded-xl text-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-slate-800">{review.user}</div>
                                        <div className="flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2 py-1 rounded">
                                            {review.source === 'Shopee' ? <span className="text-orange-500">Shopee</span> : <span className="text-green-500">Tokopedia</span>}
                                            {review.isVerified && <CheckCircle2 size={10} className="text-blue-500" />}
                                        </div>
                                    </div>
                                    <div className="flex text-amber-400 mb-2">
                                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                    </div>
                                    <p className="text-slate-600">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
