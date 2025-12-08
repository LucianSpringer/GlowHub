import { useState, useEffect, useMemo } from 'react';
import { Upload, Archive, RefreshCw } from 'lucide-react';
import {
    generateMockSupplierData,
    normalizeSupplierFeed,
    type NormalizedProduct
} from '../engines/SupplierDataNormalization';
import {
    IngestionControlPanel,
    ProductCuratorRow,
    ProfitSimulationModal,
    SyncLogTerminal
} from './InventoryComponents';
import { SupplierPerformanceWidget } from './SupplierPerformanceWidget';
import { useGlobalStore } from '../context/GlobalStoreContext';
// Engines
import { analyzePriceElasticity } from '../engines/PriceIntelligence';
import { calculateProductHealth } from '../engines/FeedbackAnalytics';

export const InventoryIngestionHub = () => {
    // --- GLOBAL STORE CONNECTION ---
    const {
        products,
        orders,
        logs,
        updateProductPrice,
        isAutoPilot,
        toggleAutoPilot
    } = useGlobalStore();

    // Local UI State
    const [viewMode, setViewMode] = useState<'raw' | 'curated'>('curated');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSimulating, setIsSimulating] = useState(false);

    // Normalized Data State (Local buffer for "Raw Feed" view)
    const [rawProducts, setRawProducts] = useState<NormalizedProduct[]>([]);

    // --- ANALYTICS PIPELINE ---
    // 1. Price Intelligence
    const priceSuggestions = useMemo(() => {
        return analyzePriceElasticity(products, orders);
    }, [products, orders]);

    // 2. Feedback/Health Analytics
    const productHealthMap = useMemo(() => {
        return calculateProductHealth(products);
    }, [products, orders]);

    // --- INITIALIZATION ---
    useEffect(() => {
        // Load Raw Feed (Simulated)
        const rawData = generateMockSupplierData();
        const normalized = normalizeSupplierFeed(JSON.stringify(rawData), 'JSON');
        setRawProducts(normalized);
    }, []);

    // --- HANDLERS ---
    const handleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const handleBulkPriceUpdate = (marginPercent: number) => {
        // Find selected products in the GLOBAL store
        const selectedProducts = products.filter(p => selectedIds.has(p.id));

        selectedProducts.forEach(p => {
            // Mock cost: assume current price is 120% of cost. Cost = Price / 1.2
            const approxCost = p.basePrice / 1.2;
            const newPrice = Math.ceil(approxCost * (1 + marginPercent / 100));
            updateProductPrice(p.id, newPrice);
        });

        setIsSimulating(false);
        setSelectedIds(new Set());
    };

    // --- RENDER HELPERS ---
    // Transform Global Products to Normalized Format for Table
    const displayProducts: NormalizedProduct[] = viewMode === 'curated'
        ? products.map(p => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            supplierPrice: p.basePrice * 0.8, // Mock supplier price
            appBasePrice: p.basePrice,
            recommendedSellingPrice: p.basePrice,
            stockActual: p.stockQty,
            stockBuffer: 5,
            stockAvailable: p.stockQty,
            category: 'Skincare',
            imageUrl: p.media[0]?.url || '',
            isActive: true, // Assuming global products are active
            createdAt: 0 // Mock timestamp to avoid purity error
        }))
        : rawProducts;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <IngestionControlPanel
                        totalItems={displayProducts.length}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onAutoPilotToggle={toggleAutoPilot}
                        autoPilotEnabled={isAutoPilot}
                    />
                </div>
                <div>
                    {/* New Supplier Widget */}
                    <SupplierPerformanceWidget />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Bulk Actions Toolbar */}
                {selectedIds.size > 0 && (
                    <div className="bg-slate-900 text-white p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-emerald-400">{selectedIds.size} Selected</span>
                            <div className="h-4 w-px bg-slate-700" />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsSimulating(true)}
                                    className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors flex items-center gap-2"
                                >
                                    <RefreshCw size={14} /> Update Prices
                                </button>
                                <button className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors flex items-center gap-2">
                                    <Archive size={14} /> Archive
                                </button>
                            </div>
                        </div>
                        <button onClick={() => setSelectedIds(new Set())} className="text-slate-500 hover:text-white">
                            <Upload size={18} className="rotate-45" />
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                                    <div className="w-4 h-4 border-2 border-slate-300 rounded" />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing Logic</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Margin Health</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Pulse</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayProducts.map(product => {
                                const health = productHealthMap.get(product.id);
                                const suggestion = priceSuggestions.find(s => s.productId === product.id);

                                return (
                                    <ProductCuratorRow
                                        key={product.id}
                                        product={product}
                                        isSelected={selectedIds.has(product.id)}
                                        onSelect={() => handleSelect(product.id)}
                                        onPriceUpdate={(price) => updateProductPrice(product.id, price)}
                                        onStatusToggle={() => { }}
                                        // Intelligence Props
                                        velocityScore={health ? (health.totalReviews * 0.1) : 0} // Mock velocity based on activity
                                        sentimentScore={health?.sentimentScore}
                                        suggestion={suggestion ? {
                                            type: suggestion.actionType,
                                            reason: suggestion.reason,
                                            price: suggestion.suggestedPrice
                                        } : undefined}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Logs from Global Store */}
            <SyncLogTerminal logs={logs} />

            <ProfitSimulationModal
                isOpen={isSimulating}
                onClose={() => setIsSimulating(false)}
                onApply={handleBulkPriceUpdate}
                selectedCount={selectedIds.size}
            />
        </div>
    );
};
