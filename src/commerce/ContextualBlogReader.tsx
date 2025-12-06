// ContextualBlogReader.tsx - Blog with Live Product Integration
// Pattern: DOMHydrationProtocol + NavigationBridge

import { useState, useMemo, useRef, useEffect } from 'react';
import { BookOpen, Package, ShoppingCart, CheckCircle } from 'lucide-react';
import {
    calculateInjectionPoints,
    highlightKeywords,
    calculateReadingProgress,
    generateMockArticle
} from '../engines/ContentResonanceEngine';
import { type ProductTelemetry } from '../ProductTelemetry';

interface ContextualBlogReaderProps {
    onProductSelect?: (productId: string) => void;
}

// EmbeddedProductWidget - Hydrated from ProductTelemetry
const EmbeddedProductWidget = ({
    product,
    onSelect
}: {
    product: ProductTelemetry;
    onSelect?: (id: string) => void;
}) => {
    // DOMHydrationProtocol: Widget only stores productId, 
    // all data (image, price, stock) comes from ProductTelemetry

    if (!product || product.stockQty <= 0) {
        // Collapse if product unavailable
        return null;
    }

    const imageUrl = product.media[0]?.url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=100&q=80';
    const stockLabel = product.stockQty < 20 ? 'Stok Menipis!' : 'Tersedia';
    const stockColor = product.stockQty < 20 ? 'text-amber-500' : 'text-emerald-500';

    return (
        <div className="my-6 bg-gradient-to-r from-pink-50 via-white to-purple-50 border border-pink-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
                {/* Product Image - Live from ProductTelemetry */}
                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider">Produk Terkait</span>
                        <CheckCircle size={12} className="text-emerald-500" />
                    </div>

                    {/* Brand & Name */}
                    <div className="text-xs text-slate-400 font-bold">{product.brand}</div>
                    <div className="font-bold text-slate-800 truncate">{product.name}</div>

                    {/* Live Price & Stock */}
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-pink-500 font-black">Rp {product.marketPrice.toLocaleString()}</span>
                        <span className={`text-[10px] font-bold ${stockColor}`}>
                            • {stockLabel}
                        </span>
                    </div>
                </div>

                {/* NavigationBridge: Click to navigate via state, not <a> */}
                <button
                    onClick={() => onSelect?.(product.id)}
                    className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-pink-500/20"
                >
                    <ShoppingCart size={14} /> Lihat
                </button>
            </div>

            {/* Benefit tags */}
            {product.benefitClaims.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-pink-100">
                    {product.benefitClaims.slice(0, 3).map((claim, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-pink-200 text-[10px] text-pink-500 rounded-full">
                            {claim}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ContextualBlogReader = ({ onProductSelect }: ContextualBlogReaderProps) => {
    const [article] = useState(generateMockArticle);
    const [readingProgress, setReadingProgress] = useState(0);
    const [showRecommendation, setShowRecommendation] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Parse article into paragraphs
    const paragraphs = useMemo(() =>
        article.content.split(/\n\n+/).filter(p => p.trim().length > 0),
        [article.content]
    );

    // Calculate injection points using KeywordResonanceScan
    const injectionPoints = useMemo(() =>
        calculateInjectionPoints(paragraphs, 2),
        [paragraphs]
    );

    // Track scroll progress
    useEffect(() => {
        const container = contentRef.current;
        if (!container) return;

        const handleScroll = () => {
            const progress = calculateReadingProgress(
                container.scrollTop,
                container.scrollHeight,
                container.clientHeight
            );
            setReadingProgress(progress);

            // Trigger recommendation at 70%
            if (progress >= 70 && !showRecommendation) {
                setShowRecommendation(true);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [showRecommendation]);

    // NavigationBridge: Handle product selection via state
    const handleProductClick = (productId: string) => {
        if (onProductSelect) {
            onProductSelect(productId);
        } else {
            console.log('Navigation to product:', productId);
        }
    };

    // Build content with product injections
    const renderContent = () => {
        const elements: React.ReactNode[] = [];

        paragraphs.forEach((para, idx) => {
            // Highlight keywords in paragraph
            const highlightedHtml = highlightKeywords(para);

            elements.push(
                <p
                    key={`para-${idx}`}
                    className="text-slate-700 leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
            );

            // Check for injection point after this paragraph
            const injection = injectionPoints.find(ip => ip.afterParagraphIndex === idx);
            if (injection) {
                elements.push(
                    <EmbeddedProductWidget
                        key={`inject-${injection.product.id}-${idx}`}
                        product={injection.product}
                        onSelect={handleProductClick}
                    />
                );
            }
        });

        return elements;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-2 rounded-xl text-white">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Contextual Blog</h3>
                        <p className="text-xs text-slate-500">Smart content with product integration</p>
                    </div>
                </div>

                {/* Reading Progress Bar */}
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
                        style={{ width: `${readingProgress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                    <span>Progress</span>
                    <span>{readingProgress}%</span>
                </div>
            </div>

            {/* Article Content */}
            <div className="p-6">
                <h2 className="text-2xl font-black text-slate-900 mb-2">{article.title}</h2>
                <div className="text-xs text-slate-400 mb-6">
                    {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </div>

                <div
                    ref={contentRef}
                    className="max-h-[500px] overflow-y-auto pr-4"
                >
                    {renderContent()}
                </div>
            </div>

            {/* Keyword Legend */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase mb-2">Keyword Types</div>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-emerald-500" /> Ingredients
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-purple-500" /> Concerns
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-pink-500" /> Brands
                    </span>
                </div>
            </div>

            {/* Pop-up Recommendation */}
            {showRecommendation && injectionPoints.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl max-w-xs">
                    <button
                        onClick={() => setShowRecommendation(false)}
                        className="absolute top-2 right-3 text-slate-400 hover:text-white text-lg"
                    >
                        ×
                    </button>
                    <div className="flex items-center gap-2 text-xs text-purple-400 mb-2">
                        <Package size={14} /> Based on your reading
                    </div>
                    <div className="text-sm font-bold mb-3">Produk yang mungkin kamu butuhkan</div>
                    <div className="flex gap-2">
                        {injectionPoints.slice(0, 2).map(ip => (
                            <button
                                key={ip.product.id}
                                onClick={() => handleProductClick(ip.product.id)}
                                className="w-14 h-14 bg-slate-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition-all"
                            >
                                <img
                                    src={ip.product.media[0]?.url}
                                    alt={ip.product.name}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
