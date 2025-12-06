// ContextualBlogReader.tsx - Intelligent Content Engine v2.0
// Pattern: AttentionHeatmap + SemanticClustering + DynamicTheming + ResellerIntelligence

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    BookOpen, ShoppingCart, CheckCircle, Lock, Unlock, Gift,
    Copy, TrendingUp, X, Sparkles, ExternalLink
} from 'lucide-react';
import {
    calculateInjectionPoints,
    highlightKeywords,
    calculateReadingProgress,
    generateMockArticle,
    detectThemeCategory,
    THEME_CONFIGS,
    buildRoutineCluster,
    scanAndMatchProducts,
    generateCoupon,
    generateResellerInsights,
    tagProductClick,
    type ThemeConfig,
    type RoutineCluster,
    type ResellerInsights
} from '../engines/ContentResonanceEngine';
import { type ProductTelemetry, PRODUCT_CATALOG } from '../ProductTelemetry';
import { injectCouponToSession } from '../engines/TransactionSettlementEngine';

// ============================================================================
// PROPS
// ============================================================================

interface ContextualBlogReaderProps {
    onProductSelect?: (productId: string) => void;
    userMode?: 'GUEST' | 'DROPSHIPPER';
    affiliateId?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// ReadingTelemetryHUD - Gamification Progress Bar with Unlock Animation
const ReadingTelemetryHUD = ({
    progress,
    isUnlocked,
    theme,
    onUnlock
}: {
    progress: number;
    isUnlocked: boolean;
    theme: ThemeConfig;
    onUnlock: () => void;
}) => {
    const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

    useEffect(() => {
        if (isUnlocked && !showUnlockAnimation) {
            setShowUnlockAnimation(true);
            onUnlock();
        }
    }, [isUnlocked, showUnlockAnimation, onUnlock]);

    return (
        <div className="relative">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Lock Icon */}
            <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-slate-400">
                    Reading Progress
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold" style={{ color: theme.primary }}>
                        {progress}%
                    </span>
                    {isUnlocked ? (
                        <Unlock size={14} className="text-emerald-500 animate-bounce" />
                    ) : (
                        <Lock size={14} className="text-slate-400" />
                    )}
                </div>
            </div>

            {/* Unlock Animation Overlay */}
            {showUnlockAnimation && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg animate-pulse">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <Gift size={16} className="animate-bounce" />
                        REWARD UNLOCKED!
                    </div>
                </div>
            )}
        </div>
    );
};

// SemanticClusterWidget - Multi-Product Routine Suggestion
const SemanticClusterWidget = ({
    cluster,
    theme,
    onProductSelect,
    articleId
}: {
    cluster: RoutineCluster;
    theme: ThemeConfig;
    onProductSelect: (id: string) => void;
    articleId: string;
}) => {
    const allProducts = [cluster.primary, ...cluster.supporting];

    const handleClick = (productId: string) => {
        tagProductClick(articleId, productId, 'blog_widget');
        onProductSelect(productId);
    };

    return (
        <div
            className="my-6 rounded-2xl p-4 border-2 transition-all"
            style={{
                background: `linear-gradient(135deg, ${theme.primary}10, ${theme.secondary}10)`,
                borderColor: `${theme.primary}30`
            }}
        >
            <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} style={{ color: theme.primary }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
                    Routine Suggestion
                </span>
                {cluster.totalSavings > 0 && (
                    <span className="ml-auto text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                        Hemat Rp {cluster.totalSavings.toLocaleString()}
                    </span>
                )}
            </div>

            {/* Horizontal scroll products */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {allProducts.map((product, idx) => (
                    <div
                        key={product.id}
                        onClick={() => handleClick(product.id)}
                        className="flex-shrink-0 w-32 bg-white rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
                    >
                        {idx === 0 && (
                            <div
                                className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mb-2 inline-block"
                                style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                            >
                                Primary
                            </div>
                        )}
                        <div className="w-full aspect-square bg-slate-100 rounded-lg overflow-hidden mb-2">
                            <img
                                src={product.media[0]?.url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">{product.brand}</div>
                        <div className="text-xs font-bold text-slate-800 truncate">{product.name}</div>
                        <div className="text-sm font-bold mt-1" style={{ color: theme.primary }}>
                            Rp {(product.marketPrice / 1000).toFixed(0)}k
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// TopicAdaptiveModal - Context-aware recommendation popup
const TopicAdaptiveModal = ({
    isOpen,
    onClose,
    theme,
    products,
    couponCode,
    onProductSelect,
    articleId
}: {
    isOpen: boolean;
    onClose: () => void;
    theme: ThemeConfig;
    products: ProductTelemetry[];
    couponCode?: string;
    onProductSelect: (id: string) => void;
    articleId: string;
}) => {
    const [copiedCoupon, setCopiedCoupon] = useState(false);

    if (!isOpen) return null;

    const handleCopyCoupon = () => {
        if (couponCode) {
            navigator.clipboard.writeText(couponCode);
            setCopiedCoupon(true);
            setTimeout(() => setCopiedCoupon(false), 2000);
        }
    };

    const handleProductClick = (productId: string) => {
        tagProductClick(articleId, productId, 'blog_modal');
        onProductSelect(productId);
    };

    // Dynamic copywriting based on theme
    const headlines: Record<string, string> = {
        'ACNE': 'Jerawat Membandel? Ini Solusinya! 🎯',
        'BRIGHTENING': 'Kulit Kusam? Saatnya Glow Up! ✨',
        'HYDRATION': 'Kulit Kering? Hidrasi Intensif! 💧',
        'ANTI_AGING': 'Anti-Aging Efektif Untukmu! ⏳',
        'BARRIER': 'Perkuat Skin Barrier-mu! 🛡️',
        'DEFAULT': 'Produk yang Cocok Untukmu! 🌸'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                style={{ borderTop: `4px solid ${theme.primary}` }}
            >
                <div className="p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>

                    <div className="text-center mb-4">
                        <span className="text-4xl">{theme.emoji}</span>
                        <h3 className="text-xl font-black text-slate-900 mt-2">
                            {headlines[theme.label.toUpperCase().replace('-', '_').replace(' ', '_')] || headlines['DEFAULT']}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Berdasarkan bacaanmu, produk ini cocok untukmu
                        </p>
                    </div>

                    {/* Coupon Reward */}
                    {couponCode && (
                        <div
                            className="p-4 rounded-xl mb-4 flex items-center justify-between"
                            style={{ backgroundColor: `${theme.primary}10` }}
                        >
                            <div className="flex items-center gap-2">
                                <Gift size={20} style={{ color: theme.primary }} />
                                <div>
                                    <div className="text-xs text-slate-500">Kupon Hadiah</div>
                                    <div className="font-mono font-bold" style={{ color: theme.primary }}>
                                        {couponCode}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleCopyCoupon}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-xs font-bold shadow-sm"
                                style={{ color: theme.primary }}
                            >
                                <Copy size={12} />
                                {copiedCoupon ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {products.slice(0, 4).map(product => (
                            <button
                                key={product.id}
                                onClick={() => handleProductClick(product.id)}
                                className="bg-slate-50 rounded-xl p-3 text-left hover:bg-slate-100 transition-colors group"
                            >
                                <div className="w-full aspect-square bg-white rounded-lg overflow-hidden mb-2 shadow-sm">
                                    <img
                                        src={product.media[0]?.url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold">{product.brand}</div>
                                <div className="text-xs font-bold text-slate-800 truncate">{product.name}</div>
                                <div className="text-sm font-bold mt-1" style={{ color: theme.primary }}>
                                    Rp {product.marketPrice.toLocaleString()}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ResellerIntelligenceSidebar - Dropshipper-only panel
const ResellerIntelligenceSidebar = ({
    insights,
    onCopyLink
}: {
    insights: ResellerInsights;
    onCopyLink: () => void;
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(insights.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onCopyLink();
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase mb-3 text-indigo-200">
                <TrendingUp size={14} /> Reseller Intelligence
            </div>

            {/* Trending Rank */}
            <div className="bg-white/10 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-200">Trending Rank</span>
                    <span className="text-lg font-bold">#{insights.trendingRank}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-indigo-200">Weekly Views</span>
                    <span className="text-sm font-bold">{insights.weeklyViews.toLocaleString()}</span>
                </div>
            </div>

            {/* Inventory Opportunities */}
            <div className="text-xs font-bold uppercase mb-2 text-indigo-200">
                Inventory Opportunities
            </div>
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {insights.inventoryOpportunities.slice(0, 3).map(opp => (
                    <div key={opp.product.id} className="bg-white/10 rounded-lg p-2 flex justify-between items-center">
                        <div className="text-xs truncate flex-1">{opp.product.name}</div>
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-300 font-bold text-xs">
                                {opp.margin.toFixed(0)}%
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded ${opp.stockStatus === 'SAFE' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}>
                                {opp.stockStatus}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Copy Referral Link */}
            <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 py-2.5 rounded-lg text-sm font-bold transition-all"
            >
                {copied ? <CheckCircle size={14} /> : <ExternalLink size={14} />}
                {copied ? 'Link Copied!' : 'Copy Referral Link'}
            </button>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ContextualBlogReader = ({
    onProductSelect,
    userMode = 'GUEST',
    affiliateId
}: ContextualBlogReaderProps) => {
    const [article] = useState(generateMockArticle);
    const [readingProgress, setReadingProgress] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [hasUnlockedReward, setHasUnlockedReward] = useState(false);
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const isDropshipper = userMode === 'DROPSHIPPER';

    // Detect theme from article content
    const themeCategory = useMemo(() =>
        detectThemeCategory(article.content + ' ' + article.title),
        [article]
    );
    const theme = THEME_CONFIGS[themeCategory];

    // Parse article into paragraphs
    const paragraphs = useMemo(() =>
        article.content.split(/\n\n+/).filter(p => p.trim().length > 0),
        [article.content]
    );

    // Scan for matched products
    const { matchedProducts, concernMask } = useMemo(() =>
        scanAndMatchProducts(article.content),
        [article.content]
    );

    // Build routine cluster
    const routineCluster = useMemo(() => {
        if (matchedProducts.length === 0) return null;
        return buildRoutineCluster(matchedProducts[0], PRODUCT_CATALOG, concernMask);
    }, [matchedProducts, concernMask]);

    // Calculate injection points
    const injectionPoints = useMemo(() =>
        calculateInjectionPoints(paragraphs, 2),
        [paragraphs]
    );

    // Reseller insights (for dropshippers)
    const resellerInsights = useMemo(() =>
        generateResellerInsights(article.id, matchedProducts, affiliateId),
        [article.id, matchedProducts, affiliateId]
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

            // Unlock reward at 80%
            if (progress >= 80 && !hasUnlockedReward) {
                setHasUnlockedReward(true);
            }

            // Show modal at 90%
            if (progress >= 90 && !showModal && hasUnlockedReward) {
                setShowModal(true);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [hasUnlockedReward, showModal]);

    // Handle reward unlock
    const handleRewardUnlock = useCallback(() => {
        const coupon = generateCoupon(article.id);
        setCouponCode(coupon.code);
        // Inject coupon to session storage for auto-fill in checkout
        injectCouponToSession(coupon.code, 'blog');
    }, [article.id]);

    // Handle product click with attribution
    const handleProductClick = (productId: string) => {
        tagProductClick(article.id, productId, 'blog_widget');
        onProductSelect?.(productId);
    };

    // Build content with product injections
    const renderContent = () => {
        const elements: React.ReactNode[] = [];

        paragraphs.forEach((para, idx) => {
            const highlightedHtml = highlightKeywords(para);

            elements.push(
                <p
                    key={`para-${idx}`}
                    className="text-slate-700 leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
            );

            // Inject routine cluster after first paragraph
            if (idx === 0 && routineCluster) {
                elements.push(
                    <SemanticClusterWidget
                        key="cluster"
                        cluster={routineCluster}
                        theme={theme}
                        onProductSelect={handleProductClick}
                        articleId={article.id}
                    />
                );
            }

            // Inject single product widgets
            const injection = injectionPoints.find(ip => ip.afterParagraphIndex === idx);
            if (injection && idx !== 0) {
                elements.push(
                    <EmbeddedProductWidget
                        key={`inject-${injection.product.id}-${idx}`}
                        product={injection.product}
                        theme={theme}
                        onSelect={handleProductClick}
                    />
                );
            }
        });

        return elements;
    };

    return (
        <>
            <div
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                style={{ '--theme-primary': theme.primary } as React.CSSProperties}
            >
                {/* Header with Theme */}
                <div
                    className="p-6 border-b"
                    style={{
                        borderColor: `${theme.primary}20`,
                        background: `linear-gradient(135deg, ${theme.primary}05, ${theme.secondary}05)`
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="p-2 rounded-xl text-white"
                            style={{ backgroundColor: theme.primary }}
                        >
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Intelligent Content Engine</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <span>{theme.emoji} {theme.label}</span>
                                {isDropshipper && (
                                    <span className="bg-indigo-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                                        RESELLER MODE
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Reading Telemetry HUD */}
                    <ReadingTelemetryHUD
                        progress={readingProgress}
                        isUnlocked={hasUnlockedReward}
                        theme={theme}
                        onUnlock={handleRewardUnlock}
                    />
                </div>

                <div className={`grid ${isDropshipper ? 'grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    {/* Article Content */}
                    <div className={`p-6 ${isDropshipper ? 'col-span-2' : ''}`}>
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

                    {/* Reseller Intelligence Sidebar */}
                    {isDropshipper && (
                        <div className="p-6 border-l border-slate-100">
                            <ResellerIntelligenceSidebar
                                insights={resellerInsights}
                                onCopyLink={() => console.log('Referral link copied')}
                            />
                        </div>
                    )}
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
            </div>

            {/* Topic Adaptive Modal */}
            <TopicAdaptiveModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                theme={theme}
                products={matchedProducts}
                couponCode={couponCode || undefined}
                onProductSelect={handleProductClick}
                articleId={article.id}
            />
        </>
    );
};

// ============================================================================
// EMBEDDED PRODUCT WIDGET (Updated with Theme)
// ============================================================================

const EmbeddedProductWidget = ({
    product,
    theme,
    onSelect
}: {
    product: ProductTelemetry;
    theme: ThemeConfig;
    onSelect?: (id: string) => void;
}) => {
    if (!product || product.stockQty <= 0) return null;

    const imageUrl = product.media[0]?.url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=100&q=80';
    const stockLabel = product.stockQty < 20 ? 'Stok Menipis!' : 'Tersedia';
    const stockColor = product.stockQty < 20 ? 'text-amber-500' : 'text-emerald-500';

    return (
        <div
            className="my-6 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group border"
            style={{
                background: `linear-gradient(135deg, ${theme.primary}08, white, ${theme.secondary}08)`,
                borderColor: `${theme.primary}20`
            }}
        >
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: theme.primary }}
                        >
                            Produk Terkait
                        </span>
                        <CheckCircle size={12} className="text-emerald-500" />
                    </div>

                    <div className="text-xs text-slate-400 font-bold">{product.brand}</div>
                    <div className="font-bold text-slate-800 truncate">{product.name}</div>

                    <div className="flex items-center gap-3 mt-1">
                        <span className="font-black" style={{ color: theme.primary }}>
                            Rp {product.marketPrice.toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-bold ${stockColor}`}>
                            • {stockLabel}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => onSelect?.(product.id)}
                    className="flex-shrink-0 px-4 py-2.5 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        boxShadow: `0 4px 14px ${theme.primary}40`
                    }}
                >
                    <ShoppingCart size={14} /> Lihat
                </button>
            </div>

            {product.benefitClaims.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t" style={{ borderColor: `${theme.primary}20` }}>
                    {product.benefitClaims.slice(0, 3).map((claim, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 bg-white border text-[10px] rounded-full"
                            style={{ borderColor: `${theme.primary}30`, color: theme.primary }}
                        >
                            {claim}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
