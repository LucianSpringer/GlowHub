// VectorFilterInterface.tsx - Advanced Product Filter UI
import { useState, useMemo } from 'react';
import { Filter, Grid3X3, Package, Sparkles } from 'lucide-react';
import {
    ConcernMask,
    type ConcernType,
    filterProductsByMask,
    buildBrandTopology,
    previewFilterCount,
    generateFilterableProducts,
    bitmaskToConcerns
} from '../engines/InventoryTopologyNode';

const CONCERN_LABELS: Record<ConcernType, { label: string; emoji: string }> = {
    NONE: { label: 'None', emoji: '' },
    ACNE: { label: 'Jerawat', emoji: '🔴' },
    DULL: { label: 'Kusam', emoji: '😶' },
    DRY: { label: 'Kering', emoji: '🏜️' },
    OILY: { label: 'Berminyak', emoji: '💧' },
    SENSITIVE: { label: 'Sensitif', emoji: '🌸' },
    AGING: { label: 'Anti-Aging', emoji: '✨' },
    PORES: { label: 'Pori-pori', emoji: '🔍' },
    DARK_SPOTS: { label: 'Flek Hitam', emoji: '🌑' }
};

interface VectorFilterInterfaceProps {
    onProductSelect?: (productId: string) => void;
}

export const VectorFilterInterface = ({ onProductSelect }: VectorFilterInterfaceProps) => {
    const [products] = useState(generateFilterableProducts);
    const [filterMask, setFilterMask] = useState(0);

    const filteredResult = useMemo(() => filterProductsByMask(products, filterMask), [products, filterMask]);
    const topology = useMemo(() => buildBrandTopology(products), [products]);

    const toggleConcern = (concern: ConcernType) => {
        setFilterMask(prev => prev ^ ConcernMask[concern]);
    };

    const activeConcerns = bitmaskToConcerns(filterMask);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500 p-2 rounded-xl text-white">
                            <Filter size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Vector Filter</h3>
                            <p className="text-xs text-slate-500">Bitwise-powered product matching</p>
                        </div>
                    </div>

                    {/* Compatibility Indicator */}
                    <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                        <Package size={16} className="text-purple-500" />
                        <span className="text-lg font-mono font-bold text-purple-600">{filteredResult.matchCount}</span>
                        <span className="text-xs text-slate-500">matches</span>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
                {/* Left: Concern Matrix */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase mb-4">
                        <Grid3X3 size={14} /> Concern Matrix
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(ConcernMask)
                            .filter(([key]) => key !== 'NONE')
                            .map(([key, value]) => {
                                const concern = key as ConcernType;
                                const isActive = (filterMask & value) !== 0;
                                const preview = previewFilterCount(products, filterMask, concern);

                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggleConcern(concern)}
                                        className={`relative px-3 py-2.5 rounded-xl text-left transition-all ${isActive
                                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">
                                            {CONCERN_LABELS[concern].emoji} {CONCERN_LABELS[concern].label}
                                        </span>
                                        {!isActive && preview.delta !== 0 && (
                                            <span className={`absolute top-1 right-2 text-[10px] font-mono ${preview.delta < 0 ? 'text-red-400' : 'text-emerald-400'
                                                }`}>
                                                {preview.delta > 0 ? '+' : ''}{preview.delta}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                    </div>

                    {/* Active Filters */}
                    {activeConcerns.length > 0 && (
                        <div className="mt-4 p-3 bg-purple-50 rounded-xl">
                            <div className="text-[10px] text-purple-500 uppercase mb-2">Active Filter Mask: 0b{filterMask.toString(2).padStart(8, '0')}</div>
                            <div className="flex flex-wrap gap-1">
                                {activeConcerns.map(c => (
                                    <span key={c} className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded">
                                        {CONCERN_LABELS[c].label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Brand Topology Map */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase mb-4">
                        <Sparkles size={14} /> Brand Topology
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {topology.map(node => (
                            <div key={node.specialization} className="bg-slate-50 rounded-xl p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-800">{node.specialization}</span>
                                    <span className="text-xs text-slate-400">{node.productCount} produk</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {node.brands.map(brand => (
                                        <span key={brand} className="px-2 py-0.5 bg-white border border-slate-200 text-xs text-slate-600 rounded">
                                            {brand}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Grid Preview */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="grid grid-cols-4 gap-3">
                    {filteredResult.products.slice(0, 8).map(p => (
                        <div
                            key={p.id}
                            onClick={() => onProductSelect?.(p.id)}
                            className="bg-white rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group"
                        >
                            <div className="aspect-square bg-slate-100 rounded-lg mb-2 overflow-hidden">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold">{p.brand}</div>
                            <div className="text-xs font-medium text-slate-800 truncate">{p.name}</div>
                            <div className="text-xs text-purple-500 font-bold mt-1">Rp {p.price.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
