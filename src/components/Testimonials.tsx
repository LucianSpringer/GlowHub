import { useState, useEffect } from 'react';
import { Star, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { getGlobalReviews, type Review } from '../ProductTelemetry';

// FIX: Terima props navigasi dari App.tsx
interface TestimonialsProps {
    onProductSelect: (id: string) => void;
}

export const Testimonials = ({ onProductSelect }: TestimonialsProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        setReviews(getGlobalReviews());
    }, []);

    return (
        <section className="py-24 bg-[#E0F2F1]/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-3xl font-bold text-slate-900">Real Stories</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((t) => (
                        <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 relative group hover:shadow-xl transition-all">

                            {/* FIX: Tombol Cart yang BENAR-BENAR BISA DIKLIK */}
                            <button
                                onClick={() => onProductSelect(t.productId)}
                                className="absolute top-4 right-4 p-3 bg-slate-100 rounded-full text-slate-400 hover:bg-[#FF6B9D] hover:text-white transition-all z-10"
                                title="Beli Produk Ini"
                            >
                                <ShoppingBag size={20} />
                            </button>

                            <div className="flex gap-1 mb-4 text-yellow-400">
                                {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-slate-700 italic mb-6">"{t.text}"</p>

                            <div className="border-t border-slate-50 pt-4 cursor-pointer" onClick={() => onProductSelect(t.productId)}>
                                <div className="font-bold text-slate-900">{t.user}</div>
                                {/* FIX: Nama Produk jadi Link */}
                                <div className="text-xs text-[#FF6B9D] font-bold mt-1 flex items-center gap-1">
                                    {t.productName} <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
