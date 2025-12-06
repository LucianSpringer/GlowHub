// HighVelocityVault.tsx - Fast-Moving Product Catalog
import { useState, useEffect } from 'react';
import { Flame, TrendingUp, TrendingDown, Minus, AlertTriangle, Calculator } from 'lucide-react';
import {
    type TrendProduct,
    scanTrendingProducts,
    generateMockTrendProducts,
    calculatePotentialMargin
} from '../engines/TrendHeuristicScanner';

export const HighVelocityVault = () => {
    const [products, setProducts] = useState<TrendProduct[]>([]);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

    useEffect(() => {
        const mock = generateMockTrendProducts();
        setProducts(scanTrendingProducts(mock));
    }, []);

    const getTrendIcon = (direction?: TrendProduct['trendDirection']) => {
        switch (direction) {
            case 'UP': return <TrendingUp size={14} className="text-emerald-400" />;
            case 'DOWN': return <TrendingDown size={14} className="text-red-400" />;
            default: return <Minus size={14} className="text-slate-400" />;
        }
    };

    return (
        <div className="bg-gradient-to-br from-orange-950 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-xl">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">High Velocity Vault</h3>
                        <p className="text-xs text-slate-400">Fast-moving products</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map(product => {
                    const isHovered = hoveredProduct === product.id;
                    const marginData = calculatePotentialMargin(product, 1);

                    return (
                        <div
                            key={product.id}
                            className="relative bg-slate-800/60 rounded-xl p-3 cursor-pointer transition-all hover:bg-slate-800"
                            onMouseEnter={() => setHoveredProduct(product.id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                        >
                            {product.urgencyFlag === 'HIGH' && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold animate-pulse flex items-center gap-1">
                                    <AlertTriangle size={10} /> LOW STOCK
                                </div>
                            )}

                            <div className="aspect-square bg-slate-700 rounded-lg mb-2 overflow-hidden">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-slate-400 font-bold">{product.brand}</span>
                                {getTrendIcon(product.trendDirection)}
                            </div>
                            <div className="text-xs font-bold truncate mb-2">{product.name}</div>

                            <div className="mb-2">
                                <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                                    <span>Stock: {product.stockRemaining}</span>
                                    <span>{product.depletionRate?.toFixed(0)}%/day</span>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${(product.depletionRate || 0) > 50 ? 'bg-red-500' :
                                                (product.depletionRate || 0) > 25 ? 'bg-orange-500' :
                                                    'bg-emerald-500'
                                            }`}
                                        style={{ width: `${Math.min(100, product.depletionRate || 0)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-orange-400 font-bold text-sm">
                                    Rp {product.price.toLocaleString()}
                                </span>
                                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-mono">
                                    VS: {product.viralityScore?.toFixed(0)}
                                </span>
                            </div>

                            {isHovered && (
                                <div className="absolute inset-0 bg-slate-900/95 rounded-xl p-3 flex flex-col justify-center items-center backdrop-blur-sm">
                                    <Calculator size={20} className="text-emerald-400 mb-2" />
                                    <div className="text-[10px] text-slate-400 uppercase mb-1">Potential Margin</div>
                                    <div className="text-lg font-mono font-bold text-emerald-400">
                                        +Rp {marginData.grossMargin.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {marginData.marginPercent.toFixed(1)}% per unit
                                    </div>
                                    <div className="mt-2 text-[9px] text-slate-500">
                                        Modal: Rp {marginData.costPrice.toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-slate-700/50 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><TrendingUp size={12} className="text-emerald-400" /> Rising</span>
                <span className="flex items-center gap-1"><TrendingDown size={12} className="text-red-400" /> Falling</span>
                <span className="flex items-center gap-1"><Minus size={12} /> Stable</span>
            </div>
        </div>
    );
};
