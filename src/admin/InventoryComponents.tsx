import { useState } from 'react';
import {
    Package, Check, Eye,
    TrendingUp, AlertTriangle,
    FileText, X
} from 'lucide-react';
import {
    type NormalizedProduct,
    getStockStatus,
    checkPriceCompetitiveness
} from '../engines/SupplierDataNormalization';

// --- 1. INGESTION CONTROL PANEL ---
interface ControlPanelProps {
    totalItems: number;
    viewMode: 'raw' | 'curated';
    setViewMode: (mode: 'raw' | 'curated') => void;
    onAutoPilotToggle: (enabled: boolean) => void;
    autoPilotEnabled: boolean;
}

export const IngestionControlPanel = ({
    totalItems, viewMode, setViewMode, onAutoPilotToggle, autoPilotEnabled
}: ControlPanelProps) => (
    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <Package size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-900">Inventory Command</h3>
                <p className="text-xs text-slate-500">{totalItems} SKUs in pipeline</p>
            </div>
        </div>

        <div className="flex items-center gap-4">
            {/* Source Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'raw'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Eye size={14} /> Raw Feed
                </button>
                <button
                    onClick={() => setViewMode('curated')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'curated'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Check size={14} /> Curated
                </button>
            </div>

            {/* Auto Pilot Switch */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600">Auto-Pilot</span>
                <button
                    onClick={() => onAutoPilotToggle(!autoPilotEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${autoPilotEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoPilotEnabled ? 'left-6' : 'left-1'}`} />
                </button>
            </div>
        </div>
    </div>
);

// --- 2. PRODUCT CURATOR ROW ---
interface CuratorRowProps {
    product: NormalizedProduct;
    isSelected: boolean;
    onSelect: () => void;
    onPriceUpdate: (newPrice: number) => void;
    onStatusToggle: () => void;
    // New Props for Intelligence
    velocityScore?: number;
    sentimentScore?: number;
    suggestion?: { type: 'INCREASE' | 'DECREASE' | 'HOLD', reason: string, price: number };
}

export const ProductCuratorRow = ({
    product, isSelected, onSelect, onPriceUpdate, onStatusToggle,
    velocityScore = 0.5, sentimentScore = 4.2, suggestion
}: CuratorRowProps) => {
    const stockStatus = getStockStatus(product.stockActual);
    const competitiveness = checkPriceCompetitiveness(product, 150000); // Mock MarketCap

    return (
        <tr className={`group transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                    />
                    <div>
                        <div className="font-medium text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {product.name}
                        </div>
                        <div className="text-xs text-slate-500 flex gap-2 items-center">
                            <span>{product.sku}</span>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1 text-slate-500" title="Sentiment Score">
                                <span className="text-yellow-400">★</span> {sentimentScore.toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 line-through">
                        Rp {product.supplierPrice.toLocaleString()}
                    </span>
                    <input
                        type="number"
                        className="w-24 text-sm font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none p-0"
                        value={product.recommendedSellingPrice}
                        onChange={(e) => onPriceUpdate(parseInt(e.target.value) || 0)}
                    />

                    {/* Intelligence Suggestion */}
                    {suggestion && suggestion.type !== 'HOLD' && (
                        <div
                            className={`flex items-center gap-1 text-[10px] mt-1 cursor-pointer hover:underline ${suggestion.type === 'INCREASE' ? 'text-emerald-600' : 'text-amber-600'
                                }`}
                            onClick={() => onPriceUpdate(suggestion.price)}
                            title={suggestion.reason}
                        >
                            <TrendingUp size={10} className={suggestion.type === 'DECREASE' ? 'rotate-180' : ''} />
                            {suggestion.type === 'INCREASE' ? 'Raise' : 'Cut'} to {suggestion.price.toLocaleString()}?
                        </div>
                    )}

                    {!competitiveness.isCompetitive && !suggestion && (
                        <div className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
                            <AlertTriangle size={10} />
                            {competitiveness.warning}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Margin</span>
                        <span className="font-bold text-emerald-600">
                            {((product.recommendedSellingPrice - product.supplierPrice) / product.recommendedSellingPrice * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, (product.recommendedSellingPrice - product.supplierPrice) / product.recommendedSellingPrice * 100)}%` }}
                        />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border w-max ${stockStatus === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' :
                        stockStatus === 'LIMITED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                        {stockStatus} ({product.stockAvailable})
                    </span>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        Velocity: <span className="font-mono text-slate-600">{velocityScore.toFixed(2)}/hr</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <button
                    onClick={onStatusToggle}
                    className={`relative px-3 py-1 rounded-full text-[10px] font-bold transition-all ${product.isActive
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 pl-6'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 pl-6'
                        }`}
                >
                    <div className={`absolute left-1.5 top-1.5 w-2 h-2 rounded-full ${product.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {product.isActive ? 'ACTIVE' : 'DRAFT'}
                </button>
            </td>
        </tr>
    );
};

// --- 3. PROFIT SIMULATION MODAL ---
interface SimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (margin: number) => void;
    selectedCount: number;
}

export const ProfitSimulationModal = ({ isOpen, onClose, onApply, selectedCount }: SimulationModalProps) => {
    const [margin, setMargin] = useState(20);
    const [projectedRevenue, setProjectedRevenue] = useState(15000000); // Mock starting point

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Profit Simulator</h3>
                            <p className="text-xs text-slate-500">Updating {selectedCount} products</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                            <span>Target Margin</span>
                            <span className="text-indigo-600">{margin}%</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={margin}
                            onChange={(e) => {
                                setMargin(parseInt(e.target.value));
                                setProjectedRevenue(15000000 * (1 + (parseInt(e.target.value) - 20) / 100)); // Simple mock math
                            }}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>Conservative (5%)</span>
                            <span>Aggressive (50%)</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="text-xs text-slate-500 uppercase mb-1">Projected Monthly Revenue</div>
                        <div className="text-2xl font-mono font-bold text-slate-900 flex items-center gap-2">
                            Rp {Math.round(projectedRevenue).toLocaleString()}
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-sans">
                                +{(margin - 20) > 0 ? (margin - 20) : 0}% vs Baseline
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => onApply(margin)}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95"
                    >
                        Apply New Pricing
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 4. SYNC LOG TERMINAL ---
export const SyncLogTerminal = ({ logs }: { logs: string[] }) => (
    <div className="bg-slate-900 text-slate-300 p-4 font-mono text-xs h-32 overflow-y-auto border-t border-slate-800">
        <div className="flex items-center gap-2 text-slate-500 mb-2 uppercase tracking-wider font-bold text-[10px]">
            <FileText size={10} /> System Audit Trail
        </div>
        <div className="space-y-1">
            {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                    <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                    <span className={log.includes('Error') ? 'text-red-400' : 'text-emerald-400'}>
                        {'>'}
                    </span>
                    <span>{log}</span>
                </div>
            ))}
            <div className="animate-pulse">_</div>
        </div>
    </div>
);
