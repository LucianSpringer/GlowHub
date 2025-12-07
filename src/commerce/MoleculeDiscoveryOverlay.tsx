// MoleculeDiscoveryOverlay.tsx - Product Discovery by Ingredient
// Simplified version with direct wiring

import { X, ArrowRight, FlaskConical, Sparkles } from 'lucide-react';
import { getProductsByIngredient, useDermalGraph } from '../ProductTelemetry';

interface MoleculeDiscoveryOverlayProps {
    ingredientId: string;
    currentProductId?: string;
    onClose: () => void;
    onSelectProduct: (id: string) => void;
}

export const MoleculeDiscoveryOverlay = ({
    ingredientId,
    currentProductId,
    onClose,
    onSelectProduct
}: MoleculeDiscoveryOverlayProps) => {
    // Get ingredient info
    const ingredientInfo = useDermalGraph([ingredientId])[0];

    // Get products containing this ingredient
    const products = getProductsByIngredient(ingredientId, currentProductId);

    if (!ingredientInfo) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Slide-in Panel */}
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full z-10"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="p-6 pt-16 mb-4 bg-gradient-to-b from-purple-50 to-white">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-4">
                        <FlaskConical size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{ingredientInfo.name}</h2>
                    <p className="text-slate-500 mt-2 leading-relaxed">{ingredientInfo.description}</p>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-4">
                    {products.length > 0 ? (
                        <>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Ditemukan di {products.length} Produk
                            </h3>

                            {products.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => onSelectProduct(p.id)}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50/50 cursor-pointer transition-all group"
                                >
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                        <img
                                            src={p.media[0]?.url}
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-slate-400">{p.brand}</div>
                                        <div className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors truncate">
                                            {p.name}
                                        </div>
                                        <div className="text-sm font-bold text-[#FF6B9D] mt-1">
                                            Rp {p.marketPrice.toLocaleString()}
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-pink-500 shrink-0" />
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-purple-100 p-4 rounded-full mb-4">
                                <Sparkles size={32} className="text-purple-500" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Bahan Eksklusif!</h3>
                            <p className="text-sm text-slate-500 max-w-xs">
                                {ingredientInfo.name} adalah bahan unik yang hanya ditemukan di produk ini.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};
