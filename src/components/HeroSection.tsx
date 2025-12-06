import { useState, useEffect } from 'react';
import { Star, Zap, ArrowRight } from 'lucide-react';
import { HERO_CONFIG } from '../data/MarketData';

export const HeroSection = ({ userMode, onCtaClick }: { userMode: string, onCtaClick: () => void }) => {
    const [visitorType, setVisitorType] = useState<'newVisitor' | 'returningVisitor'>('newVisitor');

    // Simulate Cookie Detection
    useEffect(() => {
        const hasVisited = Math.random() > 0.5; // Random simulation
        setVisitorType(hasVisited ? 'returningVisitor' : 'newVisitor');
    }, []);

    const content = userMode === 'DROPSHIPPER' ? HERO_CONFIG.dropshipper : HERO_CONFIG[visitorType];

    return (
        <section id="home" className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-[#FFF0E6]">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F8BFBF]/90 via-white/40 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop"
                    alt="Model"
                    className="w-full h-full object-cover object-top opacity-80"
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
                <div className="md:w-3/5 space-y-6 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-pink-200 text-pink-600 text-xs font-bold tracking-wide shadow-sm">
                        <Star size={12} fill="currentColor" />
                        {userMode === 'DROPSHIPPER' ? 'PARTNER ACCESS GRANTED' : '#1 PLATFORM SKINCARE LOKAL'}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                        {content.headline}
                    </h1>

                    <p className="text-xl text-slate-700 max-w-lg leading-relaxed font-medium">
                        {content.sub}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                            onClick={onCtaClick}
                            className="bg-[#FF6B9D] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-xl shadow-pink-300/50 hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            {content.cta} <ArrowRight size={20} />
                        </button>
                        {userMode !== 'DROPSHIPPER' && (
                            <a href="#quiz" className="px-8 py-4 rounded-full font-bold text-[#FF6B9D] bg-white/50 border-2 border-[#FF6B9D] hover:bg-white transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                                <Zap size={18} /> Cek Jenis Kulit
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
