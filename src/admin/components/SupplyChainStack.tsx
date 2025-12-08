// SupplyChainStack.tsx - Multi-Layer Pricing Visualization
import { AlertCircle } from 'lucide-react';
import { calculateSupplyChainStack } from '../../engines/SupplyChainDistributor';

interface SupplyChainStackProps {
    supplierCost: number;
    ownerMarginPercent: number;
    resellerMarginPercent: number;
    marketCap: number;
}

export const SupplyChainStack = ({
    supplierCost,
    ownerMarginPercent,
    resellerMarginPercent,
    marketCap
}: SupplyChainStackProps) => {
    const stack = calculateSupplyChainStack(supplierCost, marketCap, {
        ownerMarginPercent,
        resellerMarginPercent,
        affiliatePercent: 0 // Simplification for UI
    });

    const maxVal = Math.max(stack.consumerPrice, stack.marketCap) * 1.1;
    const getHeight = (val: number) => (val / maxVal) * 100;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 h-full flex flex-col">
            <h4 className="font-bold text-slate-800 text-sm mb-4">Pricing Stack</h4>

            <div className="flex-1 flex items-end justify-center gap-8 px-4">
                {/* The Stack */}
                <div className="relative w-16 h-full flex flex-col justify-end group">
                    {/* Market Cap Line */}
                    <div
                        className="absolute w-32 -left-8 border-t-2 border-dashed border-red-500 z-10 flex items-center gap-1"
                        style={{ bottom: `${getHeight(stack.marketCap)}%` }}
                    >
                        <span className="text-[10px] bg-red-50 text-red-600 px-1 font-bold absolute -right-0 -top-5">
                            Market Cap
                        </span>
                    </div>

                    {/* Reseller Margin */}
                    <div
                        className="w-full bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600 cursor-pointer relative"
                        style={{ height: `${getHeight(stack.resellerMargin)}%` }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100">
                            Rp {stack.resellerMargin.toLocaleString()}
                        </div>
                    </div>

                    {/* Owner Margin */}
                    <div
                        className="w-full bg-purple-500 transition-all hover:bg-purple-600 cursor-pointer relative"
                        style={{ height: `${getHeight(stack.ownerMargin)}%` }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100">
                            Rp {stack.ownerMargin.toLocaleString()}
                        </div>
                    </div>

                    {/* Supplier Cost */}
                    <div
                        className="w-full bg-slate-400 rounded-b-sm transition-all hover:bg-slate-500 cursor-pointer relative"
                        style={{ height: `${getHeight(stack.supplierCost)}%` }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100">
                            Rp {stack.supplierCost.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                        <span className="text-slate-600">Dropshipper</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-purple-500 rounded-sm" />
                        <span className="text-slate-600">Platform Cut</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-slate-400 rounded-sm" />
                        <span className="text-slate-600">COGS</span>
                    </div>
                </div>
            </div>

            {/* Price Tag */}
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Final Price</div>
                <div className={`text-xl font-mono font-bold ${stack.isCompetitive ? 'text-slate-800' : 'text-red-600'}`}>
                    Rp {stack.consumerPrice.toLocaleString()}
                </div>
                {!stack.isCompetitive && (
                    <div className="flex items-center justify-center gap-1 text-[10px] text-red-500 mt-1 font-medium">
                        <AlertCircle size={10} /> Over Market Cap
                    </div>
                )}
            </div>
        </div>
    );
};
