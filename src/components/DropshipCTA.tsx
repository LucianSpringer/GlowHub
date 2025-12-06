import { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, ArrowRight } from 'lucide-react';

export const DropshipCTA = ({ onRegister }: { onRegister: () => void }) => {
    const [stats, setStats] = useState({ users: 1240, sold: 8500, profit: 450 });

    // Live Ticker Engine
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                users: prev.users + (Math.random() > 0.8 ? 1 : 0),
                sold: prev.sold + Math.floor(Math.random() * 5),
                profit: prev.profit // Static avg
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="dropship" className="py-24 bg-gradient-to-br from-[#FF6B9D] to-orange-400 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
                <div className="text-left">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold mb-6 border border-white/30">
                        <TrendingUp size={14} /> GLOWHUB PARTNER PROGRAM
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        Ingin Penghasilan Tambahan?
                    </h2>
                    <p className="text-xl mb-10 text-white/90 leading-relaxed font-medium">
                        Jadilah Dropshipper GlowHub. Tanpa stok barang, packing kami yang urus, profit hingga 40%.
                    </p>
                    <button
                        onClick={onRegister}
                        className="bg-white text-[#FF6B9D] px-10 py-5 rounded-full font-bold text-xl hover:bg-slate-50 transition-all shadow-2xl transform hover:-translate-y-1 flex items-center gap-3"
                    >
                        Daftar Jadi Dropshipper <ArrowRight size={24} />
                    </button>
                </div>

                {/* Live Metrics Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <h3 className="font-bold text-lg mb-6 border-b border-white/10 pb-4">Live Platform Metrics</h3>
                    <div className="grid gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl"><Users size={24} /></div>
                            <div>
                                <div className="text-3xl font-mono font-bold">{stats.users.toLocaleString()}</div>
                                <div className="text-xs text-white/70 uppercase tracking-widest">Active Dropshippers</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl"><Package size={24} /></div>
                            <div>
                                <div className="text-3xl font-mono font-bold">{stats.sold.toLocaleString()}</div>
                                <div className="text-xs text-white/70 uppercase tracking-widest">Products Sold (This Month)</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl"><TrendingUp size={24} /></div>
                            <div>
                                <div className="text-3xl font-mono font-bold">Rp {stats.profit}k</div>
                                <div className="text-xs text-white/70 uppercase tracking-widest">Avg. Partner Profit</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
