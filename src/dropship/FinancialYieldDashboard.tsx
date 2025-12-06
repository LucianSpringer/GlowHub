// FinancialYieldDashboard.tsx - Profit Tracker UI
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Target, Activity } from 'lucide-react';
import {
    generateMockTransactions,
    calculateMetrics,
    aggregateByDay,
    type FinancialMetrics,
    type DailyDataPoint
} from '../engines/MarginVelocityEngine';

export const FinancialYieldDashboard = () => {
    const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
    const [dailyData, setDailyData] = useState<DailyDataPoint[]>([]);
    const [cashflowTicker, setCashflowTicker] = useState<string[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const transactions = generateMockTransactions(7);
        setMetrics(calculateMetrics(transactions, 5000000, 168)); // 7 days = 168 hours
        setDailyData(aggregateByDay(transactions));

        // Cashflow Stream Ticker
        const interval = setInterval(() => {
            const amounts = [15000, 25000, 35000, 50000, 75000, 12000, 28000];
            const amount = amounts[Math.floor(Math.random() * amounts.length)];
            setCashflowTicker(prev => [`+Rp ${amount.toLocaleString()}`, ...prev.slice(0, 4)]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Draw Chart
    useEffect(() => {
        if (!canvasRef.current || dailyData.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;

        ctx.clearRect(0, 0, width, height);

        // Find max value for scaling
        const maxProfit = Math.max(...dailyData.map(d => d.profit));
        const maxCogs = Math.max(...dailyData.map(d => d.cogs));
        const maxVal = Math.max(maxProfit, maxCogs) * 1.2;

        const xStep = (width - padding * 2) / (dailyData.length - 1 || 1);

        // Draw grid lines
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + ((height - padding * 2) / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw COGS line (red)
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        dailyData.forEach((d, i) => {
            const x = padding + i * xStep;
            const y = height - padding - (d.cogs / maxVal) * (height - padding * 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw Profit line (green)
        ctx.beginPath();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        dailyData.forEach((d, i) => {
            const x = padding + i * xStep;
            const y = height - padding - (d.profit / maxVal) * (height - padding * 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw points
        dailyData.forEach((d, i) => {
            const x = padding + i * xStep;
            const yProfit = height - padding - (d.profit / maxVal) * (height - padding * 2);

            ctx.beginPath();
            ctx.arc(x, yProfit, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e';
            ctx.fill();
        });

    }, [dailyData]);

    if (!metrics) return <div className="bg-slate-900 rounded-2xl p-6 animate-pulse h-80" />;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Financial Yield</h3>
                        <p className="text-xs text-slate-400">Real-time profit tracking</p>
                    </div>
                </div>

                {/* ROI Gauge */}
                <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-emerald-400">
                        {metrics.roiPercent.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">ROI</div>
                </div>
            </div>

            {/* Margin Delta Graph */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">Margin Delta (7 Days)</span>
                    <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-emerald-500 rounded" /> Profit
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-red-500 rounded" /> COGS
                        </span>
                    </div>
                </div>
                <canvas ref={canvasRef} width={400} height={150} className="w-full" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <DollarSign size={12} /> Net Profit
                    </div>
                    <div className="text-xl font-mono font-bold text-emerald-400">
                        Rp {metrics.netProfit.toLocaleString()}
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Activity size={12} /> Profit/Hour
                    </div>
                    <div className="text-xl font-mono font-bold text-cyan-400">
                        Rp {Math.round(metrics.profitPerHour).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Goal Progress */}
            <div className="bg-slate-800 rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Target size={12} /> Monthly Goal
                    </div>
                    <span className="text-xs font-mono text-amber-400">{metrics.goalProgress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, metrics.goalProgress)}%` }}
                    />
                </div>
            </div>

            {/* Cashflow Stream */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <div className="text-[10px] text-emerald-400 uppercase mb-2">Cashflow Stream</div>
                <div className="flex gap-2 overflow-hidden">
                    {cashflowTicker.map((amount, i) => (
                        <span
                            key={i}
                            className={`text-sm font-mono font-bold text-emerald-400 whitespace-nowrap transition-opacity ${i === 0 ? 'animate-pulse' : 'opacity-50'}`}
                        >
                            {amount}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
