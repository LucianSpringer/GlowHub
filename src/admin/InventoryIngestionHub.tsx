// InventoryIngestionHub.tsx - Product Management Panel
import { useState, useEffect } from 'react';
import { Upload, Package, Check, Archive, RefreshCw, Eye, Edit } from 'lucide-react';
import {
    generateMockSupplierData,
    loadProducts,
    type NormalizedProduct,
    type MarginConfig
} from '../engines/SupplierDataNormalization';

export const InventoryIngestionHub = () => {
    const [rawProducts, setRawProducts] = useState(generateMockSupplierData());
    const [normalizedProducts, setNormalizedProducts] = useState<NormalizedProduct[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [config] = useState<MarginConfig>({ ownerMarginPercent: 10, dropshipperMarginPercent: 20 });
    const [view, setView] = useState<'raw' | 'curated'>('raw');

    useEffect(() => {
        setNormalizedProducts(loadProducts(rawProducts, config));
    }, [rawProducts, config]);

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        if (selectedIds.size === normalizedProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(normalizedProducts.map(p => p.id)));
        }
    };

    const handlePublish = () => {
        setNormalizedProducts(prev => prev.map(p =>
            selectedIds.has(p.id) ? { ...p, isActive: true } : p
        ));
        setSelectedIds(new Set());
    };

    const handleArchive = () => {
        setNormalizedProducts(prev => prev.map(p =>
            selectedIds.has(p.id) ? { ...p, isActive: false } : p
        ));
        setSelectedIds(new Set());
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500 p-2 rounded-xl text-white">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Inventory Ingestion Hub</h3>
                            <p className="text-xs text-slate-500">{normalizedProducts.length} products in catalog</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setView('raw')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'raw' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            <Eye size={12} className="inline mr-1" /> Raw Feed
                        </button>
                        <button
                            onClick={() => setView('curated')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'curated' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            <Edit size={12} className="inline mr-1" /> Curated
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                    <span className="text-sm text-indigo-700 font-medium">
                        {selectedIds.size} selected
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePublish}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                            <Check size={12} /> Publish
                        </button>
                        <button
                            onClick={handleArchive}
                            className="px-3 py-1.5 bg-slate-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                            <Archive size={12} /> Archive
                        </button>
                        <button
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                            <RefreshCw size={12} /> Update Prices
                        </button>
                    </div>
                </div>
            )}

            {/* Product Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === normalizedProducts.length && normalizedProducts.length > 0}
                                    onChange={selectAll}
                                    className="rounded"
                                />
                            </th>
                            <th className="px-6 py-3 text-left">Product</th>
                            <th className="px-6 py-3 text-left">Supplier Price</th>
                            <th className="px-6 py-3 text-left">App Price</th>
                            <th className="px-6 py-3 text-left">Recommended</th>
                            <th className="px-6 py-3 text-left">Stock</th>
                            <th className="px-6 py-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {normalizedProducts.map(product => (
                            <tr key={product.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(product.id)}
                                        onChange={() => toggleSelect(product.id)}
                                        className="rounded"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Package size={16} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 text-sm">{product.name}</div>
                                            <div className="text-xs text-slate-500">{product.sku}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-red-500 line-through">
                                    Rp {product.supplierPrice.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                    Rp {product.appBasePrice.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                    Rp {product.recommendedSellingPrice.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <span className="font-medium">{product.stockAvailable}</span>
                                        <span className="text-slate-400 text-xs ml-1">({product.stockBuffer} buffer)</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${product.isActive
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {product.isActive ? 'ACTIVE' : 'ARCHIVED'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
