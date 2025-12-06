// DynamicBundleBuilder.tsx - Smart Bundle Creator v2.0
// Pattern: Template Selector + Synergy HUD + Yield Breakdown + Gamification
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Package, Plus, Trash2, Sparkles, AlertTriangle, Lightbulb,
    CheckCircle, Copy, DollarSign, Zap, Gift, ChevronRight
} from 'lucide-react';
import {
    calculateBundle,
    suggestNextProduct,
    generateMockBundleItems,
    BUNDLE_TEMPLATES,
    type BundleItem,
    type SkincareCategory
} from '../engines/BundleEconomicsKernel';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// BundleTemplateSelector - Preset routine cards
const BundleTemplateSelector = ({
    templates,
    allProducts,
    onSelect
}: {
    templates: typeof BUNDLE_TEMPLATES;
    allProducts: BundleItem[];
    onSelect: (items: BundleItem[]) => void;
}) => {
    const handleSelect = (template: typeof BUNDLE_TEMPLATES[0]) => {
        const items = template.productIds
            .map(id => allProducts.find(p => p.id === id))
            .filter((p): p is BundleItem => p !== undefined);
        onSelect(items);
    };

    return (
        <div className="mb-6">
            <div className="text-xs font-medium text-slate-500 uppercase mb-3 flex items-center gap-2">
                <Sparkles size={14} /> Quick Start Templates
            </div>
            <div className="grid grid-cols-4 gap-2">
                {templates.map(template => (
                    <button
                        key={template.id}
                        onClick={() => handleSelect(template)}
                        className="bg-gradient-to-br from-slate-50 to-slate-100 hover:from-emerald-50 hover:to-emerald-100 border border-slate-200 hover:border-emerald-300 rounded-xl p-3 text-left transition-all group"
                    >
                        <div className="text-2xl mb-1">{template.emoji}</div>
                        <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 mb-0.5">
                            {template.name}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                            {template.description}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// SynergyStatusHUD - Skincare Routine Progress
const SynergyStatusHUD = ({
    progress,
    isComplete,
    onComplete
}: {
    progress: Record<SkincareCategory, boolean>;
    isComplete: boolean;
    onComplete: () => void;
}) => {
    const categories: { id: SkincareCategory; label: string; emoji: string }[] = [
        { id: 'CLEANSER', label: 'Cleanser', emoji: '🧴' },
        { id: 'TONER', label: 'Toner', emoji: '💧' },
        { id: 'SERUM', label: 'Serum', emoji: '✨' },
        { id: 'MOISTURIZER', label: 'Moisturizer', emoji: '🧈' },
        { id: 'PROTECTION', label: 'Protection', emoji: '☀️' }
    ];

    const completedCount = Object.values(progress).filter(Boolean).length;
    const percentage = (completedCount / 5) * 100;

    useEffect(() => {
        if (isComplete) {
            onComplete();
        }
    }, [isComplete, onComplete]);

    return (
        <div className={`rounded-xl p-4 mb-4 transition-all ${isComplete
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : 'bg-slate-100'
            }`}>
            <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase ${isComplete ? 'text-white' : 'text-slate-600'}`}>
                    Routine Progress
                </span>
                <span className={`text-sm font-mono font-bold ${isComplete ? 'text-white' : 'text-emerald-600'}`}>
                    {completedCount}/5
                </span>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-1 mb-3">
                {categories.map((cat, i) => (
                    <div key={cat.id} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className={`w-full h-2 rounded-full transition-all ${progress[cat.id]
                                    ? isComplete ? 'bg-white' : 'bg-emerald-500'
                                    : 'bg-slate-300'
                                } ${progress[cat.id] ? 'shadow-lg' : ''}`}
                        />
                        <span className={`text-lg ${progress[cat.id] ? '' : 'grayscale opacity-50'}`}>
                            {cat.emoji}
                        </span>
                        <span className={`text-[9px] ${isComplete ? 'text-white/80' : 'text-slate-500'}`}>
                            {cat.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Completion Badge */}
            {isComplete && (
                <div className="flex items-center justify-center gap-2 bg-white/20 rounded-lg py-2 animate-pulse">
                    <CheckCircle size={16} />
                    <span className="text-sm font-bold">CHAIN COMPLETE! +10% Bonus</span>
                    <Gift size={16} />
                </div>
            )}
        </div>
    );
};

// YieldBreakdownPanel - Detailed Savings Table
const YieldBreakdownPanel = ({
    breakdown,
    originalTotal,
    isDropshipper
}: {
    breakdown: {
        inventoryRebate: number;
        synergyBonus: number;
        chainBonus: number;
        completionBonus: number;
        rolePrivilege: number;
        multiItemBonus: number;
        total: number;
    };
    originalTotal: number;
    isDropshipper: boolean;
}) => {
    const formatPercent = (value: number) => ((value / originalTotal) * 100).toFixed(1);

    const rows = [
        { label: 'Inventory Rebate', value: breakdown.inventoryRebate, icon: '📦' },
        { label: 'Synergy Bonus', value: breakdown.synergyBonus, icon: '🔗' },
        { label: 'Chain Bonus', value: breakdown.chainBonus, icon: '⛓️' },
        { label: 'Completion Bonus', value: breakdown.completionBonus, icon: '🎯' },
        ...(isDropshipper ? [{ label: 'Dropshipper Privilege', value: breakdown.rolePrivilege, icon: '👔' }] : []),
        { label: 'Multi-item Bonus', value: breakdown.multiItemBonus, icon: '📚' },
    ].filter(r => r.value > 0);

    if (rows.length === 0) return null;

    return (
        <div className="bg-slate-50 rounded-xl p-3 mb-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Savings Breakdown</div>
            <div className="space-y-1">
                {rows.map((row, i) => (
                    <div key={i} className="flex justify-between text-xs">
                        <span className="text-slate-600">{row.icon} {row.label}</span>
                        <span className="text-emerald-600 font-mono font-bold">
                            -Rp {Math.round(row.value).toLocaleString()} ({formatPercent(row.value)}%)
                        </span>
                    </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200">
                    <span className="text-slate-800">Total Savings</span>
                    <span className="text-emerald-600">-Rp {Math.round(breakdown.total).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

// ContextualSuggester - Smart Product Suggestion
const ContextualSuggester = ({
    suggestion,
    isDropshipper,
    onAdd
}: {
    suggestion: BundleItem | null;
    isDropshipper: boolean;
    onAdd: (item: BundleItem) => void;
}) => {
    if (!suggestion) return null;

    const margin = ((suggestion.price - suggestion.cost) / suggestion.price * 100).toFixed(0);

    return (
        <div
            className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => onAdd(suggestion)}
        >
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold mb-1">
                <Lightbulb size={14} className="group-hover:animate-bounce" />
                {isDropshipper ? 'High Margin Suggestion' : 'Next Step Suggestion'}
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-sm font-bold text-slate-700">{suggestion.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{suggestion.category}</span>
                        {isDropshipper && (
                            <span className="text-emerald-600 font-bold">Margin {margin}%</span>
                        )}
                    </div>
                </div>
                <ChevronRight className="text-amber-500 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
};

// DropshipperProfitPanel - Profit Simulator Display
const DropshipperProfitPanel = ({
    profit,
    retailPrice,
    copywriting,
    onCopy
}: {
    profit: number;
    retailPrice: number;
    copywriting: string;
    onCopy: () => void;
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(copywriting);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onCopy();
    };

    return (
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white mt-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase mb-3 text-purple-200">
                <DollarSign size={14} /> Profit Simulator
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-[10px] text-purple-200">Recommended Price</div>
                    <div className="text-lg font-bold">Rp {Math.round(retailPrice).toLocaleString()}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-[10px] text-purple-200">Your Profit</div>
                    <div className="text-lg font-bold text-emerald-300">+Rp {Math.round(profit).toLocaleString()}</div>
                </div>
            </div>
            <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-bold transition-all"
            >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy Marketing Text'}
            </button>
        </div>
    );
};

// Confetti Animation Component
const ConfettiExplosion = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full animate-ping"
                    style={{
                        backgroundColor: ['#f43f5e', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'][i % 5],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                    }}
                />
            ))}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface DynamicBundleBuilderProps {
    userMode?: 'GUEST' | 'DROPSHIPPER';
}

export const DynamicBundleBuilder = ({ userMode = 'GUEST' }: DynamicBundleBuilderProps) => {
    const [availableItems] = useState(generateMockBundleItems);
    const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
    const [animatingPrice, setAnimatingPrice] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasTriggeredComplete, setHasTriggeredComplete] = useState(false);

    const isDropshipper = userMode === 'DROPSHIPPER';

    const bundleResult = useMemo(() =>
        calculateBundle(bundleItems, isDropshipper),
        [bundleItems, isDropshipper]
    );

    const suggestion = useMemo(() =>
        suggestNextProduct(bundleItems, availableItems, isDropshipper),
        [bundleItems, availableItems, isDropshipper]
    );

    const addToBundle = useCallback((item: BundleItem) => {
        if (bundleItems.find(i => i.id === item.id)) return;
        setBundleItems(prev => [...prev, item]);
        setAnimatingPrice(true);
        setTimeout(() => setAnimatingPrice(false), 500);
    }, [bundleItems]);

    const removeFromBundle = useCallback((id: string) => {
        setBundleItems(prev => prev.filter(i => i.id !== id));
        setAnimatingPrice(true);
        setTimeout(() => setAnimatingPrice(false), 500);
        setHasTriggeredComplete(false); // Allow re-trigger on completion
    }, []);

    const loadTemplate = useCallback((items: BundleItem[]) => {
        setBundleItems(items);
        setAnimatingPrice(true);
        setTimeout(() => setAnimatingPrice(false), 500);
    }, []);

    const handleRoutineComplete = useCallback(() => {
        if (!hasTriggeredComplete) {
            setShowConfetti(true);
            setHasTriggeredComplete(true);
        }
    }, [hasTriggeredComplete]);

    return (
        <>
            {showConfetti && <ConfettiExplosion onComplete={() => setShowConfetti(false)} />}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500 p-2 rounded-xl text-white">
                                <Package size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Dynamic Bundle Builder v2.0</h3>
                                <p className="text-xs text-slate-500">
                                    {isDropshipper ? 'Dropshipper Mode • Profit Optimization Active' : 'Build your perfect routine'}
                                </p>
                            </div>
                        </div>
                        {bundleItems.length > 0 && (
                            <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-full">
                                <Zap size={14} />
                                <span className="text-sm font-bold">{bundleItems.length} items</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {/* Template Selector (when empty) */}
                    {bundleItems.length === 0 && (
                        <BundleTemplateSelector
                            templates={BUNDLE_TEMPLATES}
                            allProducts={availableItems}
                            onSelect={loadTemplate}
                        />
                    )}

                    {/* Synergy HUD (when has items) */}
                    {bundleItems.length > 0 && (
                        <SynergyStatusHUD
                            progress={bundleResult.routineProgress}
                            isComplete={bundleResult.routineComplete}
                            onComplete={handleRoutineComplete}
                        />
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        {/* Left: Available Products */}
                        <div>
                            <div className="text-xs font-medium text-slate-500 uppercase mb-3">Available Products</div>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {availableItems.filter(i => !bundleItems.find(b => b.id === i.id)).map(item => (
                                    <div
                                        key={item.id}
                                        className="bg-slate-50 rounded-xl p-3 flex items-center justify-between hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all cursor-pointer"
                                        onClick={() => addToBundle(item)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{item.name}</div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-emerald-600 font-bold">{item.category}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-slate-400">Stock: {item.stock}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-emerald-600 font-bold text-sm">
                                                Rp {(item.price / 1000).toFixed(0)}k
                                            </span>
                                            <Plus size={16} className="text-emerald-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Contextual Suggester */}
                            <ContextualSuggester
                                suggestion={suggestion}
                                isDropshipper={isDropshipper}
                                onAdd={addToBundle}
                            />
                        </div>

                        {/* Right: Bundle Preview */}
                        <div>
                            <div className="text-xs font-medium text-slate-500 uppercase mb-3">Your Bundle</div>

                            {bundleItems.length === 0 ? (
                                <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                    <Package size={32} className="mb-2 opacity-50" />
                                    <span>Select a template or add products</span>
                                </div>
                            ) : (
                                <>
                                    {/* Bundle Items */}
                                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                                        {bundleItems.map(item => (
                                            <div key={item.id} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                        className="w-8 h-8 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-800">{item.name}</div>
                                                        <span className="text-[10px] text-emerald-600 font-bold">{item.category}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-slate-600 text-sm">Rp {item.price.toLocaleString()}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeFromBundle(item.id); }}
                                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chemical Collisions Warning */}
                                    {bundleResult.collisions.length > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                            <div className="flex items-center gap-2 text-red-600 text-xs font-bold mb-2">
                                                <AlertTriangle size={14} /> Peringatan Komposisi
                                            </div>
                                            {bundleResult.collisions.map((col, i) => (
                                                <div key={i} className="text-xs text-red-700">{col.warning}</div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Yield Breakdown */}
                                    <YieldBreakdownPanel
                                        breakdown={bundleResult.savingsBreakdown}
                                        originalTotal={bundleResult.originalTotal}
                                        isDropshipper={isDropshipper}
                                    />

                                    {/* Synergy Badges */}
                                    {bundleResult.synergies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {bundleResult.synergies.map((s, i) => (
                                                <span key={i} className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Sparkles size={10} /> {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Price Display */}
                                    <div className="bg-slate-900 rounded-xl p-4 text-white">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-slate-400">Original</span>
                                            <span className="text-slate-400 line-through">
                                                Rp {bundleResult.originalTotal.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-emerald-400">You Save</span>
                                            <span className="text-emerald-400 font-bold">
                                                -Rp {Math.round(bundleResult.savings).toLocaleString()} ({bundleResult.savingsPercent.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                                            <span className="text-sm font-bold">Bundle Price</span>
                                            <span className={`text-2xl font-mono font-black text-emerald-400 transition-all ${animatingPrice ? 'scale-110' : ''}`}>
                                                Rp {Math.round(bundleResult.discountedTotal).toLocaleString()}
                                            </span>
                                        </div>

                                        {bundleResult.circuitBreakerTriggered && (
                                            <div className="mt-3 flex items-center gap-2 text-yellow-400 text-xs">
                                                <AlertTriangle size={14} />
                                                Maksimal diskon tercapai (margin protection)
                                            </div>
                                        )}

                                        {!bundleResult.isValid && (
                                            <div className="mt-3 bg-red-500/20 text-red-400 text-xs p-2 rounded-lg">
                                                ⚠️ Bundle tidak valid. Periksa komposisi bahan.
                                            </div>
                                        )}
                                    </div>

                                    {/* Dropshipper Profit Panel */}
                                    {isDropshipper && bundleResult.dropshipperProfit && bundleResult.recommendedRetailPrice && (
                                        <DropshipperProfitPanel
                                            profit={bundleResult.dropshipperProfit}
                                            retailPrice={bundleResult.recommendedRetailPrice}
                                            copywriting={bundleResult.copywritingTemplate || ''}
                                            onCopy={() => console.log('Copied marketing text')}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
