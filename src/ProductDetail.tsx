import { useState } from 'react';
import {
    ShoppingCart, Star, Info, TrendingUp,
    CheckCircle2, RefreshCw, Download,
    Clock, ListChecks, ArrowRight
} from 'lucide-react';
import {
    useSupplyChainResonance,
    useMarginVelocity,
    useDermalGraph,
    getRelatedProducts,
} from './ProductTelemetry';
import type { ProductTelemetry } from './ProductTelemetry';

export const ProductDetail = ({ product, isDropshipper = false, onBack, onSelectProduct, onAddToCart }: {
    product: ProductTelemetry,
    isDropshipper?: boolean,
    onBack: () => void,
    onSelectProduct: (id: string) => void,
    onAddToCart?: (product: ProductTelemetry) => { success: boolean; message: string }
}) => {

    // Engine Wiring
    const stockEngine = useSupplyChainResonance(product.stockQty);
    const profitEngine = useMarginVelocity(product.basePrice);
    const ingredients = useDermalGraph(product.ingredients);
    const relatedProducts = getRelatedProducts(product.id);

    const [activeMedia] = useState(0);
    const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-white pb-20 animate-fade-in-up">
            {/* Header / Nav */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
                <button onClick={onBack} className="text-sm font-semibold text-slate-500 hover:text-[#FF6B9D] flex items-center gap-2">
                    <ArrowRight className="rotate-180" size={16} /> Kembali
                </button>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                    SKU: {product.sku} • SYNC: {stockEngine.status === 'UPDATING' ? '...' : 'OK'}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* LEFT: VISUALS */}
                    <div className="space-y-6">
                        <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 relative group shadow-sm">
                            <img
                                src={product.media[activeMedia]?.url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {isDropshipper && (
                                <button className="absolute bottom-4 right-4 bg-white text-slate-700 p-3 rounded-full shadow-lg hover:text-[#FF6B9D] hover:scale-110 transition-all">
                                    <Download size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: LOGIC & INFO */}
                    <div className="space-y-8">

                        {/* Title & Brand */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-[#FF6B9D]/10 text-[#FF6B9D] px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                                    {product.brand}
                                </span>
                                {product.reviews.length > 0 && (
                                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                        <Star size={14} fill="currentColor" />
                                        <span>4.9</span>
                                        <span className="text-slate-400 font-normal">({product.reviews.length} Ulasan)</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>

                            {/* Stock & Price */}
                            <div className="flex items-end justify-between border-b border-slate-100 pb-6">
                                <div>
                                    <div className="text-3xl font-bold text-[#FF6B9D]">
                                        Rp {product.marketPrice.toLocaleString()}
                                    </div>
                                    {isDropshipper && (
                                        <div className="text-xs text-slate-500 font-mono mt-1">
                                            HPP: Rp {product.basePrice.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${stockEngine.stockStatus.bg} ${stockEngine.stockStatus.color}`}>
                                    {stockEngine.status === 'UPDATING' ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                    {stockEngine.stockStatus.label} ({stockEngine.stock})
                                </div>
                            </div>
                        </div>

                        {/* PROFIT ESTIMATOR (Dropshipper) */}
                        {isDropshipper && (
                            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                    <TrendingUp size={150} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <TrendingUp size={18} className="text-emerald-400" />
                                            Profit Simulator
                                        </h3>
                                        {profitEngine.metrics.isHealthy ?
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">High Yield</span> :
                                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-1 rounded">Low Margin</span>
                                        }
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2">Harga Jual Kamu</label>
                                            <div className="flex items-center bg-slate-800 rounded-lg px-3 border border-slate-700 focus-within:border-[#FF6B9D]">
                                                <span className="text-slate-400 text-sm">Rp</span>
                                                <input
                                                    type="number"
                                                    value={profitEngine.sellingPrice}
                                                    onChange={(e) => profitEngine.setSellingPrice(Number(e.target.value))}
                                                    className="w-full bg-transparent py-2 px-2 text-white font-mono focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2">Potensi Profit</label>
                                            <div className={`text-2xl font-bold font-mono ${profitEngine.metrics.isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                +{profitEngine.metrics.profit.toLocaleString()}
                                            </div>
                                            <div className="text-[10px] text-slate-500">Margin: {profitEngine.metrics.margin}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <button
                            disabled={!stockEngine.stockStatus.actionable}
                            onClick={() => {
                                if (onAddToCart && stockEngine.stockStatus.actionable) {
                                    const result = onAddToCart(product);
                                    setAddedFeedback(result.message);
                                    setTimeout(() => setAddedFeedback(null), 2000);
                                }
                            }}
                            className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-3 ${addedFeedback
                                ? 'bg-emerald-500 shadow-emerald-200/50'
                                : 'bg-[#FF6B9D] hover:bg-pink-600 shadow-pink-200/50'
                                }`}
                        >
                            <ShoppingCart size={20} className={addedFeedback ? 'animate-bounce' : ''} />
                            {addedFeedback || (stockEngine.stockStatus.actionable ? 'Tambah ke Keranjang' : 'Stok Habis')}
                        </button>

                        {/* USAGE GUIDE (New Feature) */}
                        <div className="bg-[#E0F2F1]/50 rounded-2xl p-6 border border-[#E0F2F1]">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <ListChecks size={18} className="text-teal-600" /> Cara Pemakaian
                            </h3>
                            <div className="space-y-3">
                                {product.usage.map((step, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <div className="bg-white text-teal-600 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm shrink-0">
                                            {step.order}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-700">{step.text}</p>
                                            <div className="flex gap-2 mt-1">
                                                {step.time !== 'PM' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded flex items-center gap-1"><Clock size={10} /> AM</span>}
                                                {step.time !== 'AM' && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1"><Clock size={10} /> PM</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* INGREDIENTS */}
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Info size={18} className="text-[#FF6B9D]" /> Key Ingredients
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ingredients.map(ing => (
                                    <div key={ing.id} className="p-3 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all">
                                        <div className="font-bold text-xs text-slate-800 mb-1">{ing.name}</div>
                                        <p className="text-[10px] text-slate-500 leading-relaxed">{ing.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* RELATED PRODUCTS (New Feature) */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 border-t border-slate-100 pt-12">
                        <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                            Produk Serupa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedProducts.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => onSelectProduct(p.id)}
                                    className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-xl transition-all cursor-pointer group"
                                >
                                    <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden mb-4 relative">
                                        <img src={p.media[0]?.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute top-2 right-2 bg-white/90 text-[10px] font-bold px-2 py-1 rounded-full">
                                            {p.brand}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-1">{p.name}</h4>
                                    <div className="text-[#FF6B9D] font-bold">Rp {p.marketPrice.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
