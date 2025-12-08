import { ArrowUp, ArrowDown, DollarSign, TrendingUp } from 'lucide-react';
import { useMarginVelocity } from '../hooks/useMarginVelocity';

export const MarginOptimizerWidget = () => {
    const { products } = useMarginVelocity();

    // Filter for meaningful opportunities (e.g., high volume or strange margins)
    const opportunities = products
        .filter(p => p.unitsSold > 0)
        .slice(0, 3); // Take top 3 for the widget

    // Simple heuristic for suggestion
    const getSuggestion = (p: typeof products[0]) => {
        // High volume, low margin -> Increase Price
        if (p.unitsSold > 10 && p.avgMarginPercent < 20) {
            return { action: 'INCREASE', label: 'Raise Price (+5%)', color: 'text-emerald-400', icon: ArrowUp };
        }
        // Low volume, high margin -> Decrease Price
        if (p.unitsSold < 5 && p.avgMarginPercent > 35) {
            return { action: 'DECREASE', label: 'Discount (-10%)', color: 'text-rose-400', icon: ArrowDown };
        }
        // Steady
        return { action: 'HOLD', label: 'Maintain Price', color: 'text-blue-400', icon: TrendingUp };
    };

    return (
        <div className="bg-slate-900 rounded-2xl p-6 h-full flex flex-col text-white">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-500 p-2 rounded-xl">
                    <DollarSign size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Price Optimizer</h3>
                    <p className="text-xs text-slate-400">AI-driven pricing signals</p>
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {opportunities.map(p => {
                    const suggestion = getSuggestion(p);
                    const Icon = suggestion.icon;
                    return (
                        <div key={p.productId} className="bg-slate-800 rounded-xl p-3 flex justify-between items-center group hover:bg-slate-750 transition-colors border border-transparent hover:border-slate-700">
                            <div className="flex-1 min-w-0 mr-3">
                                <div className="font-bold text-sm text-white mb-1 truncate">{p.productName}</div>
                                <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                                    <span className="bg-slate-900 px-1.5 py-0.5 rounded">Margin: {p.avgMarginPercent.toFixed(0)}%</span>
                                    <span className="bg-slate-900 px-1.5 py-0.5 rounded">Vol: {p.unitsSold}</span>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className={`flex items-center justify-end gap-1 text-xs font-bold ${suggestion.color} bg-slate-900/50 px-2 py-1 rounded-lg mb-1`}>
                                    <Icon size={12} />
                                    {suggestion.label}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    Impact: High
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                    View All Recommendations →
                </button>
            </div>
        </div>
    );
};
