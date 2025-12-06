import { useState, useEffect } from 'react';
import { Star, CheckCircle2, ShoppingBag } from 'lucide-react';

const _MOCK_REVIEWS = [
    { id: 1, user: "Rina S.", rating: 5, text: "Jerawat batu kempes dalam 3 hari! Gila sih ini serum.", source: "Shopee", item: "Scarlett Acne Serum" },
    { id: 2, user: "Dinda K.", rating: 5, text: "Pengiriman cepet banget, packaging aman bubble wrap tebel.", source: "Tokopedia", item: "Somethinc Toner" },
    { id: 3, user: "Putri A.", rating: 4, text: "Baru coba seminggu, kulit berasa lebih plumpy.", source: "GlowHub Direct", item: "Avoskin Retinol" },
];

export const Testimonials = () => {
    const [reviews] = useState(_MOCK_REVIEWS);
    const [syncStatus, setSyncStatus] = useState("SYNCED");

    // Simulated WebSocket Sync
    useEffect(() => {
        const interval = setInterval(() => {
            setSyncStatus("PULLING DATA...");
            setTimeout(() => {
                setSyncStatus("SYNCED");
                // In a real app, this would append new data
            }, 1500);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 bg-[#E0F2F1]/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Real Stories, <span className="text-[#FF6B9D]">Real Glow</span>
                        </h2>
                        <p className="text-slate-500 mt-2">Verified purchases from all platforms.</p>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                        MARKETPLACE SYNC: <span className={syncStatus === "SYNCED" ? "text-emerald-500" : "text-amber-500"}>{syncStatus}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((t) => (
                        <div key={t.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShoppingBag size={100} />
                            </div>

                            <div className="flex gap-1 mb-4 text-yellow-400">
                                {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>

                            <p className="text-slate-700 italic mb-6 leading-relaxed relative z-10">"{t.text}"</p>

                            <div className="border-t border-slate-50 pt-4">
                                <div className="font-bold text-slate-900">{t.user}</div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-500">
                                        <CheckCircle2 size={10} className="text-emerald-500" /> Verified via {t.source}
                                    </div>
                                </div>
                                <div className="text-[10px] text-[#FF6B9D] font-bold mt-2 truncate">
                                    {t.item}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
