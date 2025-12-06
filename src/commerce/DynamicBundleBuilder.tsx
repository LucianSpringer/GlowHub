// DynamicBundleBuilder.tsx - Smart Bundle Creator with Live Pricing
import { useState, useMemo } from 'react';
import { Package, Plus, Trash2, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
import {
    calculateBundle,
    suggestComplement,
    generateMockBundleItems,
    type BundleItem
} from '../engines/BundleEconomicsKernel';

export const DynamicBundleBuilder = () => {
    const [availableItems] = useState(generateMockBundleItems);
    const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
    const [animatingPrice, setAnimatingPrice] = useState(false);

    const bundleResult = useMemo(() => calculateBundle(bundleItems), [bundleItems]);
    const suggestion = useMemo(() =>
        suggestComplement(bundleItems, availableItems),
        [bundleItems, availableItems]
    );

    const addToBundle = (item: BundleItem) => {
        if (bundleItems.find(i => i.id === item.id)) return;
        setBundleItems(prev => [...prev, item]);
        setAnimatingPrice(true);
        setTimeout(() => setAnimatingPrice(false), 500);
    };

    const removeFromBundle = (id: string) => {
        setBundleItems(prev => prev.filter(i => i.id !== id));
        setAnimatingPrice(true);
        setTimeout(() => setAnimatingPrice(false), 500);
    };

    const getPressureColor = (level: 'HIGH' | 'MEDIUM' | 'LOW') => {
        switch (level) {
            case 'HIGH': return 'text-emerald-500 bg-emerald-500/10';
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10';
            case 'LOW': return 'text-slate-400 bg-slate-500/10';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-xl text-white">
                        <Package size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Dynamic Bundle Builder</h3>
                        <p className="text-xs text-slate-500">Intelligent savings calculator</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 p-6">
                {/* Left: Available Products */}
                <div>
                    <div className="text-xs font-medium text-slate-500 uppercase mb-3">Available Products</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {availableItems.filter(i => !bundleItems.find(b => b.id === i.id)).map(item => (
                            <div
                                key={item.id}
                                className="bg-slate-50 rounded-xl p-3 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
                                onClick={() => addToBundle(item)}
                            >
                                <div>
                                    <div className="text-sm font-medium text-slate-800">{item.name}</div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-500">{item.category}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-400">Stock: {item.stock}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-600 font-bold text-sm">Rp {(item.price / 1000).toFixed(0)}k</span>
                                    <Plus size={16} className="text-emerald-500" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Smart Suggestion */}
                    {suggestion && bundleItems.length > 0 && (
                        <div
                            className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
                            onClick={() => addToBundle(suggestion)}
                        >
                            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold mb-1">
                                <Lightbulb size={14} /> Suggestion
                            </div>
                            <div className="text-sm text-slate-700">
                                Add <strong>{suggestion.name}</strong> for extra synergy discount!
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Bundle Preview */}
                <div>
                    <div className="text-xs font-medium text-slate-500 uppercase mb-3">Your Bundle</div>

                    {bundleItems.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                            Add products to build your bundle
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2 mb-4">
                                {bundleItems.map(item => {
                                    const pressure = bundleResult.pressureFactors.find(p => p.id === item.id);

                                    return (
                                        <div key={item.id} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-800">{item.name}</div>
                                                    {pressure && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getPressureColor(pressure.pressure)}`}>
                                                            -{pressure.discount}% (Stock Pressure)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-600 text-sm">Rp {item.price.toLocaleString()}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFromBundle(item.id); }}
                                                    className="text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Synergy Meter */}
                            <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                        <Sparkles size={14} /> Synergy Meter
                                    </span>
                                    <span className="text-lg font-mono font-bold text-emerald-600">
                                        {bundleResult.savingsPercent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-3 bg-emerald-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, bundleResult.savingsPercent * 3)}%` }}
                                    />
                                </div>
                                {bundleResult.synergies.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {bundleResult.synergies.map((s, i) => (
                                            <span key={i} className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded">
                                                ✓ {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Live Price Ticker */}
                            <div className="bg-slate-900 rounded-xl p-4 text-white">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400">Original</span>
                                    <span className="text-slate-400 line-through">Rp {bundleResult.originalTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-emerald-400">You Save</span>
                                    <span className="text-emerald-400 font-bold">-Rp {bundleResult.savings.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                                    <span className="text-sm font-bold">Bundle Price</span>
                                    <span className={`text-2xl font-mono font-black text-emerald-400 transition-all ${animatingPrice ? 'scale-110' : ''}`}>
                                        Rp {bundleResult.discountedTotal.toLocaleString()}
                                    </span>
                                </div>

                                {bundleResult.circuitBreakerTriggered && (
                                    <div className="mt-3 flex items-center gap-2 text-yellow-400 text-xs">
                                        <AlertTriangle size={14} />
                                        Maksimal diskon tercapai (margin protection)
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
