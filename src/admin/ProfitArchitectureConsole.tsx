// ProfitArchitectureConsole.tsx - Margin Management Panel
import { useState, useRef, useEffect } from 'react';
import { Percent, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import {
    calculateYield,
    projectRevenue,
    TIER_LEVELS,
    type TierConfig
} from '../engines/DynamicYieldAlgorithm';

export const ProfitArchitectureConsole = () => {
    const [ownerMargin, setOwnerMargin] = useState(10);
    const [dropshipperMargin, setDropshipperMargin] = useState(20);
    const [samplePrice, setSamplePrice] = useState(50000);
    const [marketplaceCap, setMarketplaceCap] = useState(75000);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const yield_ = calculateYield(samplePrice, ownerMargin, dropshipperMargin, 'SILVER', marketplaceCap);
    const projection = projectRevenue(10, ownerMargin, 500, samplePrice);

    // Draw simulation graph
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Draw projection bars
        const margins = [5, 10, 15, 20, 25];
        const barWidth = (width - 60) / margins.length;
        const maxRevenue = Math.max(...margins.map(m => samplePrice * 500 * (m / 100)));

        margins.forEach((m, i) => {
            const revenue = samplePrice * 500 * (m / 100);
            const barHeight = (revenue / maxRevenue) * (height - 40);
            const x = 30 + i * barWidth + 5;
            const y = height - 20 - barHeight;

            // Bar
            ctx.fillStyle = m === ownerMargin ? '#8b5cf6' : '#e2e8f0';
            ctx.fillRect(x, y, barWidth - 10, barHeight);

            // Label
            ctx.fillStyle = '#64748b';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${m}%`, x + (barWidth - 10) / 2, height - 5);
        });
    }, [ownerMargin, samplePrice]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-500 p-2 rounded-xl text-white">
                        <Percent size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Profit Architecture</h3>
                        <p className="text-xs text-slate-500">Global margin configuration</p>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
                {/* Left: Margin Controls */}
                <div className="space-y-6">
                    {/* Owner Margin Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-slate-700">Owner Margin</label>
                            <span className="text-lg font-mono font-bold text-purple-600">{ownerMargin}%</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="30"
                            value={ownerMargin}
                            onChange={(e) => setOwnerMargin(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>

                    {/* Dropshipper Margin Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-slate-700">Dropshipper Margin (Recommended)</label>
                            <span className="text-lg font-mono font-bold text-emerald-600">{dropshipperMargin}%</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="40"
                            value={dropshipperMargin}
                            onChange={(e) => setDropshipperMargin(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* Tier System */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={16} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Tier Bonus System</span>
                        </div>
                        <div className="space-y-2">
                            {TIER_LEVELS.map(tier => (
                                <div key={tier.tier} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${tier.tier === 'SILVER' ? 'bg-slate-400' :
                                                tier.tier === 'GOLD' ? 'bg-yellow-400' : 'bg-purple-400'
                                            }`} />
                                        <span className="text-sm font-medium text-slate-700">{tier.label}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">+{tier.marginBonus}% bonus</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Simulation */}
                <div className="space-y-4">
                    {/* Price Calculator */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="text-xs font-medium text-slate-500 uppercase mb-3">Price Simulation</div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Supplier Price</span>
                                <span className="font-medium">Rp {yield_.supplierPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-purple-600">
                                <span>+ Owner Margin ({ownerMargin}%)</span>
                                <span className="font-medium">Rp {Math.round(yield_.ownerMargin).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-slate-500">App Base Price</span>
                                <span className="font-bold">Rp {yield_.appBasePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                                <span>+ Dropshipper Margin</span>
                                <span className="font-medium">Rp {Math.round(yield_.finalDropshipperMargin).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-lg">
                                <span className="text-slate-700 font-medium">Recommended Price</span>
                                <span className="font-bold text-emerald-600">Rp {yield_.recommendedPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        {!yield_.isCompetitive && (
                            <div className="mt-3 flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs">
                                <AlertTriangle size={14} />
                                {yield_.warning}
                            </div>
                        )}
                    </div>

                    {/* Revenue Projection Graph */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase">
                                <TrendingUp size={14} /> Revenue Projection
                            </div>
                            <span className={`text-sm font-bold ${projection.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {projection.change >= 0 ? '+' : ''}{projection.changePercent.toFixed(1)}%
                            </span>
                        </div>
                        <canvas ref={canvasRef} width={300} height={120} className="w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};
