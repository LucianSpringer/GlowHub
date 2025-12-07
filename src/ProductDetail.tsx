import { } from 'react';
import { Info, ArrowLeft } from 'lucide-react';
import type { ProductTelemetry } from './ProductTelemetry';
import { useDermalGraph, getRelatedProducts } from './ProductTelemetry';

interface ProductDetailProps {
    product: ProductTelemetry;
    isDropshipper?: boolean;
    onBack: () => void;
    onSelectProduct: (id: string) => void;
    // FIX: Tambahkan prop ini
    onMoleculeSelect: (ingredientId: string) => void;
}

export const ProductDetail = ({ product, onBack, onSelectProduct, onMoleculeSelect }: ProductDetailProps) => {
    // const stockEngine = useSupplyChainResonance(product.stockQty);
    // const profitEngine = useMarginVelocity(product.basePrice);
    const ingredients = useDermalGraph(product.ingredients);
    const relatedProducts = getRelatedProducts(product.id);

    return (
        <div className="min-h-screen bg-white pb-20 animate-fade-in-up">
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#FF6B9D]">
                    <ArrowLeft size={18} /> Kembali
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Section (Sederhana) */}
                <div className="bg-slate-50 rounded-3xl aspect-square overflow-hidden">
                    <img src={product.media[0]?.url} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-8">
                    <h1 className="text-4xl font-black">{product.name}</h1>
                    <div className="text-3xl font-bold text-[#FF6B9D]">Rp {product.marketPrice.toLocaleString()}</div>

                    <button className="w-full bg-[#FF6B9D] text-white py-4 rounded-xl font-bold text-lg shadow-lg">
                        Tambah ke Keranjang
                    </button>

                    {/* FIX: INGREDIENTS SECTION */}
                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Info size={18} className="text-[#FF6B9D]" /> Key Ingredients (Klik untuk Filter)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ingredients.map(ing => (
                                <button
                                    key={ing.id}
                                    // FIX: Panggil fungsi parent saat diklik
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMoleculeSelect(ing.id);
                                    }}
                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-[#FF6B9D] hover:bg-pink-50 transition-all text-left w-full group"
                                >
                                    <div className="font-bold text-xs text-slate-800 mb-1 group-hover:text-[#FF6B9D]">{ing.name}</div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">{ing.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-8">
                            <h3 className="font-bold mb-4">Produk Serupa</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {relatedProducts.map(p => (
                                    <div key={p.id} onClick={() => onSelectProduct(p.id)} className="cursor-pointer group">
                                        <div className="aspect-square bg-slate-100 rounded-lg mb-2 overflow-hidden">
                                            <img src={p.media[0]?.url} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="text-xs font-bold truncate">{p.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
