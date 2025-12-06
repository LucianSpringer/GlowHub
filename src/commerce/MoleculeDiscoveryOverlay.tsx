// MoleculeDiscoveryOverlay.tsx - Product Discovery by Ingredient
// Pattern: Cross-Reference Modal + ActiveMoleculeNode

import { useState, useEffect, useMemo } from 'react';
import {
    X, FlaskConical, ShoppingCart, Star, Sparkles,
    ChevronRight, AlertCircle
} from 'lucide-react';
import {
    getCrossReferenceResult,
    getIngredientProductCount,
    type CrossReferenceResult,
    type MoleculeMatch
} from '../engines/MolecularCrossReferenceEngine';

// ============================================================================
// PROPS
// ============================================================================

interface MoleculeDiscoveryOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    ingredientId: string;
    ingredientName: string;
    currentProductId: string;
    onProductSelect: (productId: string) => void;
}

interface ActiveMoleculeNodeProps {
    ingredientId: string;
    ingredientName: string;
    description: string;
    currentProductId: string;
    onClick: (ingredientId: string, ingredientName: string) => void;
}

// ============================================================================
// ACTIVE MOLECULE NODE (Clickable Ingredient Button)
// ============================================================================

export const ActiveMoleculeNode = ({
    ingredientId,
    ingredientName,
    description,
    currentProductId,
    onClick
}: ActiveMoleculeNodeProps) => {
    const productCount = useMemo(() =>
        getIngredientProductCount(ingredientId, currentProductId),
        [ingredientId, currentProductId]
    );

    return (
        <button
            onClick={() => onClick(ingredientId, ingredientName)}
            className="p-3 rounded-xl border border-slate-100 bg-white hover:shadow-lg hover:border-pink-200 hover:-translate-y-1 transition-all text-left group cursor-pointer relative"
        >
            {/* Badge - "Lihat X Produk Lain" */}
            {productCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                    +{productCount} Produk
                </div>
            )}

            <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FlaskConical size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-800 mb-1 flex items-center gap-1">
                        {ingredientName}
                        {productCount > 0 && (
                            <ChevronRight size={12} className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{description}</p>
                </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
};

// ============================================================================
// MOLECULE DISCOVERY OVERLAY (Modal)
// ============================================================================

const ProductMatchCard = ({
    match,
    onSelect
}: {
    match: MoleculeMatch;
    onSelect: (id: string) => void;
}) => {
    const { product, sharedIngredients, matchScore } = match;

    return (
        <div
            onClick={() => onSelect(product.id)}
            className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-lg hover:border-pink-200 transition-all cursor-pointer group"
        >
            <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                        src={product.media[0]?.url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-pink-500 font-bold uppercase">{product.brand}</div>
                    <div className="font-bold text-slate-900 truncate">{product.name}</div>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-pink-500 font-bold">
                            Rp {product.marketPrice.toLocaleString()}
                        </span>
                        {product.stockQty < 20 && (
                            <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">
                                Sisa {product.stockQty}
                            </span>
                        )}
                    </div>

                    {/* Shared Ingredients */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {sharedIngredients.slice(0, 2).map((ing, i) => (
                            <span key={i} className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Match Score & CTA */}
                <div className="flex flex-col items-end justify-between">
                    <div className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold">
                        {matchScore}% Match
                    </div>
                    <button className="bg-pink-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <ShoppingCart size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const MoleculeDiscoveryOverlay = ({
    isOpen,
    onClose,
    ingredientId,
    ingredientName,
    currentProductId,
    onProductSelect
}: MoleculeDiscoveryOverlayProps) => {
    const [result, setResult] = useState<CrossReferenceResult | null>(null);

    useEffect(() => {
        if (isOpen && ingredientId) {
            const crossRef = getCrossReferenceResult(ingredientId, currentProductId);
            setResult(crossRef);
        }
    }, [isOpen, ingredientId, currentProductId]);

    if (!isOpen) return null;

    const handleProductClick = (productId: string) => {
        onProductSelect(productId);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-5">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <FlaskConical size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">{ingredientName}</h2>
                            <p className="text-sm text-white/80">
                                Produk lain dengan bahan ini
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {result?.isUnique ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-purple-100 p-4 rounded-full mb-4">
                                <Sparkles size={32} className="text-purple-500" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Bahan Eksklusif!</h3>
                            <p className="text-sm text-slate-500 max-w-xs">
                                {ingredientName} adalah bahan unik yang hanya ditemukan di produk ini.
                            </p>
                        </div>
                    ) : result?.matches && result.matches.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-500">
                                    Ditemukan <span className="font-bold text-slate-900">{result.totalMatches}</span> produk
                                </span>
                                <div className="text-[10px] text-slate-400">
                                    Diurutkan berdasarkan kecocokan
                                </div>
                            </div>

                            {result.matches.map((match) => (
                                <ProductMatchCard
                                    key={match.product.id}
                                    match={match}
                                    onSelect={handleProductClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle size={32} className="text-slate-300 mb-2" />
                            <span className="text-slate-400">Loading...</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 p-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// LINKED TESTIMONIAL CARD (For use in Testimonials)
// ============================================================================

interface LinkedTestimonialCardProps {
    review: {
        id: string;
        reviewerName: string;
        rating: number;
        comment: string;
        productId: string;
        productName: string;
        productBrand: string;
        productImage: string;
        productPrice: number;
        isProductAvailable: boolean;
    };
    onShopNow: (productId: string) => void;
}

export const LinkedTestimonialCard = ({
    review,
    onShopNow
}: LinkedTestimonialCardProps) => {
    return (
        <div className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-all relative group">
            {/* Mini Product Thumbnail */}
            <div className="absolute top-3 right-3 w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shadow-sm">
                <img
                    src={review.productImage}
                    alt={review.productName}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Reviewer Info */}
            <div className="flex items-center gap-2 mb-3 pr-14">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.reviewerName.charAt(0)}
                </div>
                <div>
                    <div className="font-bold text-slate-900">{review.reviewerName}</div>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                            <Star
                                key={i}
                                size={12}
                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Review Text */}
            <p className="text-sm text-slate-600 mb-4 line-clamp-3">{review.comment}</p>

            {/* Product Link & Shop Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex-1 min-w-0 pr-4">
                    <div className="text-[10px] text-slate-400 uppercase">{review.productBrand}</div>
                    <div className="text-xs font-bold text-slate-800 truncate">{review.productName}</div>
                    <div className="text-xs text-pink-500 font-bold">
                        Rp {review.productPrice.toLocaleString()}
                    </div>
                </div>

                <button
                    onClick={() => onShopNow(review.productId)}
                    disabled={!review.isProductAvailable}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingCart size={16} />
                    Shop This
                </button>
            </div>

            {/* Availability Warning */}
            {!review.isProductAvailable && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-sm text-slate-500 font-bold">Produk Habis</span>
                </div>
            )}
        </div>
    );
};
