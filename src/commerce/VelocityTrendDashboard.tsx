// VelocityTrendDashboard.tsx - Live Trading Floor for Skincare Products
// Pattern: Real-time Updates + Dropshipper Context + OOS Prediction
import { useState, useRef, useEffect, useCallback } from 'react';
import { Flame, TrendingUp, Clock, Zap, AlertTriangle, Package, Plus, Rocket, TrendingDown } from 'lucide-react';
import {
    rankByVelocity,
    generateMockTransactions,
    estimateTimeToEmpty,
    calculateMomentumDerivative,
    injectRandomTransactions,
    calculateBrandDistribution,
    type SaleTransaction,
    type RankingResult,
    type BrandDistribution
} from '../engines/TrendVelocityMatrix';

// ============================================================================
// CONSTANTS
// ============================================================================

const MOMENTUM_STYLES = {
    BLAZING: { bg: 'bg-red-500', text: 'text-red-500', icon: '🔥🔥', label: 'BLAZING' },
    HOT: { bg: 'bg-orange-500', text: 'text-orange-500', icon: '🔥', label: 'HOT' },
    WARM: { bg: 'bg-yellow-500', text: 'text-yellow-500', icon: '⬆️', label: 'WARM' },
    COOLING: { bg: 'bg-slate-400', text: 'text-slate-400', icon: '➡️', label: 'COOLING' }
};

const OOS_STATUS_STYLES = {
    CRITICAL: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-400', label: 'CRITICAL' },
    WARNING: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400', label: 'WARNING' },
    SAFE: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400', label: 'SAFE' }
};

const LIVE_UPDATE_INTERVAL_MS = 3000; // Every 3 seconds
const STALE_DATA_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// TemporalPulseIndicator - Live Status Badge
const TemporalPulseIndicator = ({ lastUpdate, isUpdating }: { lastUpdate: number; isUpdating: boolean }) => {
    const now = Date.now();
    const staleData = now - lastUpdate > STALE_DATA_THRESHOLD_MS;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${staleData ? 'bg-amber-500/20' : 'bg-emerald-500/20'
            }`}>
            <div className={`w-2 h-2 rounded-full ${staleData ? 'bg-amber-400' : 'bg-emerald-400'
                } ${isUpdating ? 'animate-ping' : 'animate-pulse'}`} />
            <span className={`text-xs font-mono ${staleData ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isUpdating ? 'UPDATING...' : staleData ? 'STALE' : 'LIVE'}
            </span>
        </div>
    );
};

// DepletionCountdownBar - Time-based OOS Prediction
const DepletionCountdownBar = ({ stock, velocityScore }: { stock: number; velocityScore: number }) => {
    const prediction = estimateTimeToEmpty(stock, velocityScore);
    const style = OOS_STATUS_STYLES[prediction.status];
    const isCritical = prediction.status === 'CRITICAL';

    return (
        <div className="mb-2">
            <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                <span className="flex items-center gap-1">
                    {isCritical && <AlertTriangle size={10} className="text-red-400" />}
                    Est. Habis
                </span>
                <span className={style.text}>{prediction.formattedTime}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${style.bg} ${isCritical ? 'animate-pulse bg-gradient-to-r from-red-600 to-red-400' : ''
                        }`}
                    style={{
                        width: `${Math.min(100, Math.max(5, 100 - (prediction.timeToEmptyHours / 72) * 100))}%`,
                        backgroundImage: isCritical ? 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 6px)' : undefined
                    }}
                />
            </div>
        </div>
    );
};

// ProfitHologramOverlay - Dropshipper Profit Display
const ProfitHologramOverlay = ({ basePrice, sellPrice }: { basePrice: number; sellPrice: number }) => {
    const profit = sellPrice - basePrice;
    const marginPercent = ((profit / basePrice) * 100).toFixed(0);

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500/90 to-emerald-500/60 backdrop-blur-sm px-2 py-1.5 rounded-b-xl">
            <div className="flex justify-between items-center">
                <span className="text-[9px] text-white/80">Profit</span>
                <span className="text-xs font-bold text-white">
                    +Rp {profit.toLocaleString()} ({marginPercent}%)
                </span>
            </div>
        </div>
    );
};

// BrandMomentumPie - Mini Brand Distribution Chart
const BrandMomentumPie = ({ distribution }: { distribution: BrandDistribution[] }) => {
    const topBrand = distribution[0];
    if (!topBrand) return null;

    // Calculate cumulative angles for pie
    let cumulativeAngle = 0;
    const segments = distribution.map(d => {
        const startAngle = cumulativeAngle;
        cumulativeAngle += (d.percentage / 100) * 360;
        return { ...d, startAngle, endAngle: cumulativeAngle };
    });

    return (
        <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="flex items-center gap-3">
                {/* Mini Pie */}
                <div className="relative w-12 h-12">
                    <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
                        {segments.map((seg, i) => {
                            const startAngle = (seg.startAngle * Math.PI) / 180;
                            const endAngle = (seg.endAngle * Math.PI) / 180;
                            const largeArc = seg.percentage > 50 ? 1 : 0;
                            const x1 = 16 + 14 * Math.cos(startAngle);
                            const y1 = 16 + 14 * Math.sin(startAngle);
                            const x2 = 16 + 14 * Math.cos(endAngle);
                            const y2 = 16 + 14 * Math.sin(endAngle);

                            return (
                                <path
                                    key={i}
                                    d={`M 16 16 L ${x1} ${y1} A 14 14 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={seg.color}
                                    className="opacity-80"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{topBrand.percentage.toFixed(0)}%</span>
                    </div>
                </div>
                {/* Legend */}
                <div className="flex-1">
                    <div className="text-[10px] text-slate-400 uppercase mb-1">Dominasi Brand</div>
                    <div className="text-sm font-bold" style={{ color: topBrand.color }}>{topBrand.brand}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {distribution.slice(0, 3).map(d => (
                            <span key={d.brand} className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// TrendDerivativeBadge - Accelerating/Decelerating indicator
const TrendDerivativeBadge = ({ currentVelocity, previousVelocity }: { currentVelocity: number; previousVelocity: number }) => {
    const derivative = calculateMomentumDerivative(currentVelocity, previousVelocity);

    if (derivative.direction === 'STABLE') return null;

    const isAccelerating = derivative.direction === 'ACCELERATING';

    return (
        <div className={`absolute top-8 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5 ${isAccelerating ? 'bg-emerald-500' : 'bg-red-500'
            }`}>
            {isAccelerating ? <Rocket size={8} /> : <TrendingDown size={8} />}
            {Math.abs(derivative.deltaPercent).toFixed(0)}%
        </div>
    );
};

// Mini Sparkline Component
const Sparkline = ({ data, className = '' }: { data: number[]; className?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const max = Math.max(...data, 1);
        const step = width / (data.length - 1);

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;

        data.forEach((val, i) => {
            const x = i * step;
            const y = height - (val / max) * height * 0.8 - 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        // Fill under curve
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
        ctx.fill();
    }, [data]);

    return <canvas ref={canvasRef} width={100} height={30} className={className} />;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface VelocityTrendDashboardProps {
    userMode?: 'GUEST' | 'DROPSHIPPER';
    onAddToCatalog?: (productId: string) => void;
}

export const VelocityTrendDashboard = ({
    userMode = 'GUEST',
    onAddToCatalog
}: VelocityTrendDashboardProps) => {
    // Base product data
    const [baseProducts] = useState(() =>
        Array.from({ length: 10 }, (_, i) => ({
            id: `BEST-${1000 + i}`,
            name: `Best Seller ${i + 1}`,
            brand: ['SCARLETT', 'SOMETHINC', 'AVOSKIN', 'WARDAH', 'EMINA'][i % 5],
            price: Math.floor(Math.random() * 100000) + 50000,
            basePrice: Math.floor(Math.random() * 50000) + 30000,
            image: `https://images.unsplash.com/photo-1601049541289-9b3b7d5d7fb5?auto=format&fit=crop&w=200&q=80`,
            stock: Math.floor(Math.random() * 300) + 20
        }))
    );

    // Transaction stream (mutable for live updates)
    const [transactions, setTransactions] = useState<SaleTransaction[]>(() =>
        generateMockTransactions(baseProducts.map(p => p.id), 800)
    );

    // Previous ranking for derivative calculation
    const [previousRanking, setPreviousRanking] = useState<RankingResult | null>(null);

    // Current ranking
    const [ranking, setRanking] = useState<RankingResult>(() =>
        rankByVelocity(baseProducts, transactions)
    );

    // Live update state
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // Brand distribution
    const [brandDistribution, setBrandDistribution] = useState<BrandDistribution[]>([]);

    // Live Transaction Stream - Stochastic Injection
    const updateRanking = useCallback(() => {
        setIsUpdating(true);

        // Inject new random transactions
        setTransactions(prev => {
            const updated = injectRandomTransactions(prev, baseProducts.map(p => p.id), Math.floor(Math.random() * 3) + 1);

            // Store previous ranking for derivative
            setPreviousRanking(ranking);

            // Recalculate ranking
            const newRanking = rankByVelocity(baseProducts, updated);
            setRanking(newRanking);

            // Update brand distribution
            setBrandDistribution(calculateBrandDistribution(newRanking.products.slice(0, 10)));

            setLastUpdate(Date.now());
            setTimeout(() => setIsUpdating(false), 500);

            return updated;
        });
    }, [baseProducts, ranking]);

    // Live update interval
    useEffect(() => {
        const interval = setInterval(updateRanking, LIVE_UPDATE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [updateRanking]);

    // Initial brand distribution
    useEffect(() => {
        setBrandDistribution(calculateBrandDistribution(ranking.products.slice(0, 10)));
    }, []);

    const isDropshipper = userMode === 'DROPSHIPPER';

    return (
        <div className="bg-gradient-to-br from-orange-950 to-slate-900 rounded-2xl p-6 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-xl">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Velocity Trading Floor</h3>
                        <p className="text-xs text-slate-400">
                            {isDropshipper ? 'Dropshipper Mode • Live Profit Tracking' : 'Real-time sales momentum'}
                        </p>
                    </div>
                </div>

                <TemporalPulseIndicator lastUpdate={lastUpdate} isUpdating={isUpdating} />
            </div>

            {/* Brand Momentum Pie */}
            {brandDistribution.length > 0 && (
                <div className="mb-4">
                    <BrandMomentumPie distribution={brandDistribution} />
                </div>
            )}

            {/* Top Performer */}
            {ranking.hottest && (
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4 mb-6 relative overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden relative">
                            <img src={ranking.hottest.image} alt="" className="w-full h-full object-cover" />
                            {isDropshipper && (
                                <ProfitHologramOverlay
                                    basePrice={baseProducts.find(p => p.id === ranking.hottest!.id)?.basePrice || 0}
                                    sellPrice={ranking.hottest.price}
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-orange-400 text-xs font-bold">{ranking.hottest.brand}</span>
                                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">
                                    🔥🔥 #1 VELOCITY
                                </span>
                            </div>
                            <div className="text-lg font-bold mb-1">{ranking.hottest.name}</div>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-orange-400 font-bold">Rp {ranking.hottest.price.toLocaleString()}</span>
                                <span className="text-slate-400">
                                    <Zap size={12} className="inline text-yellow-400" /> {ranking.hottest.velocityScore.toFixed(1)}/hr
                                </span>
                                <span className="text-slate-400">
                                    <Package size={12} className="inline" /> {ranking.hottest.stock} unit
                                </span>
                            </div>
                            {/* OOS Prediction for top product */}
                            <div className="mt-2">
                                <DepletionCountdownBar stock={ranking.hottest.stock} velocityScore={ranking.hottest.velocityScore} />
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Sparkline data={ranking.hottest.salesLast7Days} className="w-24 h-10" />
                            {isDropshipper && onAddToCatalog && (
                                <button
                                    onClick={() => onAddToCatalog(ranking.hottest!.id)}
                                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                                >
                                    <Plus size={12} /> Quick Add
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-3 gap-3">
                {ranking.products.slice(1, 7).map((product, i) => {
                    const style = MOMENTUM_STYLES[product.momentum];
                    const baseProduct = baseProducts.find(p => p.id === product.id);
                    const prevProduct = previousRanking?.products.find(p => p.id === product.id);

                    return (
                        <div key={product.id} className="bg-slate-800/60 rounded-xl p-3 relative group hover:bg-slate-800/80 transition-all">
                            {/* Rank Badge */}
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold border-2 border-slate-700">
                                {i + 2}
                            </div>

                            {/* Momentum Badge */}
                            <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${style.bg}`}>
                                {style.icon}
                            </div>

                            {/* Trend Derivative Badge */}
                            <TrendDerivativeBadge
                                currentVelocity={product.velocityScore}
                                previousVelocity={prevProduct?.velocityScore || product.velocityScore}
                            />

                            <div className="aspect-square bg-slate-700 rounded-lg mb-2 overflow-hidden relative">
                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                                {isDropshipper && baseProduct && (
                                    <ProfitHologramOverlay basePrice={baseProduct.basePrice} sellPrice={product.price} />
                                )}
                            </div>

                            <div className="text-[10px] text-slate-400 font-bold">{product.brand}</div>
                            <div className="text-xs font-medium truncate mb-2">{product.name}</div>

                            {/* OOS Countdown Bar */}
                            <DepletionCountdownBar stock={product.stock} velocityScore={product.velocityScore} />

                            {/* Sparkline */}
                            <Sparkline data={product.salesLast7Days} className="w-full h-6" />

                            <div className="flex justify-between items-center mt-2">
                                <span className="text-orange-400 font-bold text-xs">Rp {(product.price / 1000).toFixed(0)}k</span>
                                <span className={`text-[10px] font-mono ${style.text}`}>
                                    <TrendingUp size={10} className="inline" /> {product.velocityScore.toFixed(1)}
                                </span>
                            </div>

                            {/* Dropshipper Quick Add */}
                            {isDropshipper && onAddToCatalog && (
                                <button
                                    onClick={() => onAddToCatalog(product.id)}
                                    className="mt-2 w-full flex items-center justify-center gap-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[10px] px-2 py-1.5 rounded-lg font-bold transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Plus size={10} /> Add to Catalog
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Stats */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between text-xs text-slate-500">
                <span>Avg Velocity: <span className="text-orange-400 font-mono">{ranking.avgVelocity.toFixed(2)}</span>/hr</span>
                <span>
                    <Clock size={12} className="inline mr-1" />
                    Updated {Math.round((Date.now() - lastUpdate) / 1000)}s ago
                </span>
            </div>
        </div>
    );
};
