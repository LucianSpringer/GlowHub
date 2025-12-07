import { X, ArrowRight, Beaker } from 'lucide-react';
import { getProductById, PRODUCT_CATALOG, useDermalGraph } from '../ProductTelemetry';

export const MoleculeDiscoveryOverlay = ({ ingredientId, onClose, onSelectProduct }: any) => {
    // Cari info ingredient
    const ingredientInfo = useDermalGraph([ingredientId])[0];

    // Cari produk yang punya ingredient ini
    const matches = PRODUCT_CATALOG.filter(p => p.ingredients.includes(ingredientId));

    if (!ingredientInfo) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop Gelap - Klik untuk tutup */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            {/* Panel Kanan */}
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 overflow-y-auto animate-slide-in-right">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full">
                    <X size={24} />
                </button>

                <div className="mt-12 mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                        <Beaker size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{ingredientInfo.name}</h2>
                    <p className="text-slate-500 mt-2">{ingredientInfo.description}</p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Ditemukan di {matches.length} Produk
                    </h3>

                    {matches.map(p => (
                        <div
                            key={p.id}
                            onClick={() => onSelectProduct(p.id)}
                            className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all group"
                        >
                            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                <img src={p.media[0].url} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400">{p.brand}</div>
                                <div className="font-bold text-slate-900 group-hover:text-blue-600">{p.name}</div>
                                <div className="text-sm font-bold text-[#FF6B9D] mt-1">Rp {p.marketPrice.toLocaleString()}</div>
                            </div>
                            <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-blue-500" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
