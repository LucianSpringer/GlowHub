// VelocityTrendDashboard.tsx - Best Seller with Momentum Badges
import { useState, useRef, useEffect } from 'react';
import { Flame, TrendingUp, Clock, Zap } from 'lucide-react';
import {
    rankByVelocity,
    generateMockTransactions
} from '../engines/TrendVelocityMatrix';

const MOMENTUM_STYLES = {
    BLAZING: { bg: 'bg-red-500', text: 'text-red-500', icon: '🔥🔥', label: 'BLAZING' },
    HOT: { bg: 'bg-orange-500', text: 'text-orange-500', icon: '🔥', label: 'HOT' },
    WARM: { bg: 'bg-yellow-500', text: 'text-yellow-500', icon: '⬆️', label: 'WARM' },
    COOLING: { bg: 'bg-slate-400', text: 'text-slate-400', icon: '➡️', label: 'COOLING' }
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

export const VelocityTrendDashboard = () => {
    const [products] = useState(() => {
        const base = Array.from({ length: 10 }, (_, i) => ({
            id: `BEST-${1000 + i}`,
            name: `Best Seller ${i + 1}`,
            brand: ['SCARLETT', 'SOMETHINC', 'AVOSKIN', 'WARDAH', 'EMINA'][i % 5],
            price: Math.floor(Math.random() * 100000) + 50000,
            image: `https://images.unsplash.com/photo-1601049541289-9b3b7d5d7fb5?auto=format&fit=crop&w=200&q=80`,
            stock: Math.floor(Math.random() * 300) + 20
        }));
        const transactions = generateMockTransactions(base.map(p => p.id), 800);
        return rankByVelocity(base, transactions);
    });

    return (
        <div className="bg-gradient-to-br from-orange-950 to-slate-900 rounded-2xl p-6 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-xl">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Velocity Trend</h3>
                        <p className="text-xs text-slate-400">Real-time sales momentum</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-full">
                    <Clock size={14} className="text-orange-400" />
                    <span className="text-xs text-orange-400 font-mono">Live</span>
                </div>
            </div>

            {/* Top Performer */}
            {products.hottest && (
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden">
                            <img src={products.hottest.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-orange-400 text-xs font-bold">{products.hottest.brand}</span>
                                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">
                                    🔥🔥 #1 VELOCITY
                                </span>
                            </div>
                            <div className="text-lg font-bold mb-1">{products.hottest.name}</div>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-orange-400 font-bold">Rp {products.hottest.price.toLocaleString()}</span>
                                <span className="text-slate-400">
                                    <Zap size={12} className="inline text-yellow-400" /> {products.hottest.velocityScore.toFixed(1)}/hr
                                </span>
                            </div>
                        </div>
                        <Sparkline data={products.hottest.salesLast7Days} className="w-24 h-10" />
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-3 gap-3">
                {products.products.slice(1, 7).map((product, i) => {
                    const style = MOMENTUM_STYLES[product.momentum];

                    return (
                        <div key={product.id} className="bg-slate-800/60 rounded-xl p-3 relative">
                            {/* Rank Badge */}
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold border-2 border-slate-700">
                                {i + 2}
                            </div>

                            {/* Momentum Badge */}
                            <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${style.bg}`}>
                                {style.icon}
                            </div>

                            <div className="aspect-square bg-slate-700 rounded-lg mb-2 overflow-hidden">
                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                            </div>

                            <div className="text-[10px] text-slate-400 font-bold">{product.brand}</div>
                            <div className="text-xs font-medium truncate mb-2">{product.name}</div>

                            {/* Stock Depletion Bar */}
                            <div className="mb-2">
                                <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                                    <span>Depletion</span>
                                    <span>{product.depletionRate.toFixed(1)}%/hr</span>
                                </div>
                                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${product.depletionRate > 5 ? 'bg-red-500' :
                                            product.depletionRate > 2 ? 'bg-orange-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${Math.min(100, product.depletionRate * 10)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Sparkline */}
                            <Sparkline data={product.salesLast7Days} className="w-full h-6" />

                            <div className="flex justify-between items-center mt-2">
                                <span className="text-orange-400 font-bold text-xs">Rp {(product.price / 1000).toFixed(0)}k</span>
                                <span className={`text-[10px] font-mono ${style.text}`}>
                                    <TrendingUp size={10} className="inline" /> {product.velocityScore.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Stats */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between text-xs text-slate-500">
                <span>Avg Velocity: <span className="text-orange-400 font-mono">{products.avgVelocity.toFixed(2)}</span>/hr</span>
                <span>Last 7 days data</span>
            </div>
        </div>
    );
};
