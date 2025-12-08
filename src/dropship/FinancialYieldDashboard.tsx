// FinancialYieldDashboard.tsx - Profit Tracker UI
import { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, DollarSign, Target, Activity } from 'lucide-react';
import {
    calculateMetrics,
    aggregateByDay,
    type FinancialMetrics,
    type DailyDataPoint,
    forecastNextWeekProfit,
    type ProfitForecast
} from '../engines/MarginVelocityEngine';
import { useProfitChart } from '../hooks/useProfitChart';
import { useGlobalStore } from '../context/GlobalStoreContext';

export const FinancialYieldDashboard = () => {
    // --- GLOBAL STORE CONNECTION ---
    const { orders } = useGlobalStore();

    // Internal state
    const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
    const [dailyData, setDailyData] = useState<DailyDataPoint[]>([]);
    const [forecast, setForecast] = useState<ProfitForecast | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Filter relevant orders (PROCESSED or PENDING)
    const validTransactions = useMemo(() =>
        orders.filter(o => o.status !== 'PENDING'),
        [orders]);

    useEffect(() => {
        // Transform Global Orders to Engine Format
        // Engine expects: { id, timestamp, totalAmount, grossMargin, items: [] }
        const engineTransactions = validTransactions.flatMap(o =>
            o.items.map(i => ({
                id: o.id,
                timestamp: o.timestamp,
                totalAmount: o.totalAmount, // This might duplicate revenue if not careful, better to split by item price if available, else keep generic
                grossMargin: (o.totalAmount * 0.25) / o.items.length, // Split margin across items
                productId: i.productId,
                productName: 'Unknown Product', // We'd need product lookup here ideally
                basePrice: 0,
                sellingPrice: 0,
                quantity: i.quantity,
                items: [] // Legacy field to satisfy type if needed, or we adjust type
            }))
        );

        if (engineTransactions.length > 0) {
            const data = aggregateByDay(engineTransactions);
            const calcMetrics = calculateMetrics(engineTransactions, 5000000, 168);

            setMetrics(calcMetrics);
            setDailyData(data);
            setForecast(forecastNextWeekProfit(data));
        } else {
            // Fallback for empty state (mock small data or just zeroes)
            setMetrics({
                netProfit: 0,
                profitPerHour: 0,
                roiPercent: 0,
                goalProgress: 0,
                totalRevenue: 0,
                totalCOGS: 0,
                profitMarginPercent: 0
            });
        }
    }, [validTransactions]);

    useProfitChart(canvasRef, dailyData);

    if (!metrics) return <div className="bg-slate-900 rounded-2xl p-6 animate-pulse h-80" />;

    // Latest Cashflow Ticker from Orders
    const recentSales = orders.slice(0, 5);

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
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

                <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-emerald-400">
                        {metrics.roiPercent.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">ROI</div>
                </div>
            </div>

            {/* AI Profit Forecast Widget */}
            {forecast && (
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-3 mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold mb-1">AI Prediction (Next 7 Days)</div>
                            <div className="text-xl font-mono font-bold text-white">
                                Rp {forecast.predictedWeeklyProfit.toLocaleString()}
                            </div>
                        </div>
                        <div className={`text-right ${forecast.trend === 'UP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <div className="flex items-center justify-end gap-1">
                                {forecast.trend === 'UP' ? <TrendingUp size={14} /> : <Activity size={14} />}
                                <span className="font-bold text-xs">{forecast.nextWeekROI} ROI</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Confidence: {forecast.confidenceScore}%</div>
                        </div>
                    </div>
                </div>
            )}

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

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <div className="text-[10px] text-emerald-400 uppercase mb-2">Live Transactions</div>
                <div className="flex gap-2 overflow-hidden">
                    {recentSales.map((order, i) => (
                        <span
                            key={order.id}
                            className={`text-sm font-mono font-bold text-emerald-400 whitespace-nowrap transition-opacity ${i === 0 ? 'animate-pulse' : 'opacity-50'}`}
                        >
                            +Rp {order.totalAmount.toLocaleString()}
                        </span>
                    ))}
                    {recentSales.length === 0 && <span className="text-xs text-slate-500">Waiting for sales...</span>}
                </div>
            </div>
        </div>
    );
};
