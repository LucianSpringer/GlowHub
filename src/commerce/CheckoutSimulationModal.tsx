// CheckoutSimulationModal.tsx - Full Checkout Flow with Coupon & Calculation
// Pattern: VoucherRedemption + YieldBreakdown + SessionAutoInjection

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    X, Tag, CheckCircle, XCircle, Loader2, ShoppingCart,
    Truck, Receipt, Percent, DollarSign, Gift, AlertTriangle,
    ChevronRight, CreditCard, TrendingUp
} from 'lucide-react';
import {
    verifyIncentive,
    calculateCartTotal,
    retrieveInjectedCoupon,
    clearInjectedCoupon,
    formatCouponCode,
    validateCouponFormat,
    type DiscountVector,
    type LocationProfile,
    type CartItem
} from '../engines/TransactionSettlementEngine';
import type { ProductTelemetry } from '../ProductTelemetry';

// ============================================================================
// PROPS
// ============================================================================

interface CheckoutSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductTelemetry;
    quantity: number;
    isDropshipper: boolean;
    onConfirmOrder: (orderData: OrderSummary) => void;
}

export interface OrderSummary {
    product: ProductTelemetry;
    quantity: number;
    subtotal: number;
    discountCode: string | null;
    discountAmount: number;
    logisticsFee: number;
    tax: number;
    netTotal: number;
    timestamp: number;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// VoucherRedemptionInterface
const VoucherRedemptionInterface = ({
    onApply,
    initialCode,
    isFromBlog
}: {
    onApply: (code: string) => void;
    initialCode?: string;
    isFromBlog: boolean;
}) => {
    const [inputValue, setInputValue] = useState(initialCode || '');
    const [isLoading, setIsLoading] = useState(false);
    const [hasAutoApplied, setHasAutoApplied] = useState(false);

    // Auto-apply if code from blog
    useEffect(() => {
        if (initialCode && isFromBlog && !hasAutoApplied) {
            setIsLoading(true);
            setTimeout(() => {
                onApply(initialCode);
                setIsLoading(false);
                setHasAutoApplied(true);
            }, 800);
        }
    }, [initialCode, isFromBlog, hasAutoApplied, onApply]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCouponCode(e.target.value);
        setInputValue(formatted);
    };

    const handleApply = () => {
        if (!validateCouponFormat(inputValue)) return;
        setIsLoading(true);
        setTimeout(() => {
            onApply(inputValue);
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                <Tag size={16} className="text-pink-500" />
                Kode Voucher
                {isFromBlog && initialCode && (
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Gift size={10} /> Auto-filled
                    </span>
                )}
            </div>

            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Masukkan kode (e.g. GLOW10)"
                        maxLength={15}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none font-mono text-sm uppercase tracking-wide"
                    />
                    {isFromBlog && initialCode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Gift size={16} className="text-emerald-500" />
                        </div>
                    )}
                </div>
                <button
                    onClick={handleApply}
                    disabled={isLoading || !validateCouponFormat(inputValue)}
                    className="px-6 py-3 bg-pink-500 text-white rounded-lg font-bold text-sm hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                    {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        'Apply'
                    )}
                </button>
            </div>
        </div>
    );
};

// VoucherStatusBadge
const VoucherStatusBadge = ({
    discount
}: {
    discount: DiscountVector | null;
}) => {
    if (!discount) return null;

    if (discount.isValid) {
        return (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                <CheckCircle size={18} className="text-emerald-500" />
                <div className="flex-1">
                    <div className="text-sm font-bold text-emerald-700">
                        Kupon "{discount.code}" Aktif!
                    </div>
                    <div className="text-xs text-emerald-600">
                        Hemat Rp {discount.calculatedDeduction.toLocaleString()}
                    </div>
                </div>
                <div className="text-lg font-bold text-emerald-500">
                    -{discount.type === 'PERCENT' ? `${discount.value}%` : `${(discount.value / 1000).toFixed(0)}k`}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
            <XCircle size={18} className="text-rose-500" />
            <div className="flex-1">
                <div className="text-sm font-bold text-rose-700">
                    Kupon Tidak Valid
                </div>
                <div className="text-xs text-rose-600">
                    {discount.errorMessage}
                </div>
            </div>
        </div>
    );
};

// YieldBreakdownHUD
const YieldBreakdownHUD = ({
    subtotal,
    discountDeduction,
    logisticsFee,
    tax,
    netTotal,
    isDropshipper,
    dropshipperCost,
    projectedMargin,
    marginPercent
}: {
    subtotal: number;
    discountDeduction: number;
    logisticsFee: number;
    tax: number;
    netTotal: number;
    isDropshipper: boolean;
    dropshipperCost?: number;
    projectedMargin?: number;
    marginPercent?: number;
}) => {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                <Receipt size={16} className="text-slate-500" />
                Rincian Pembayaran
            </div>

            <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Subtotal</span>
                    <span className="font-mono font-bold text-slate-800">
                        Rp {subtotal.toLocaleString()}
                    </span>
                </div>

                {/* Discount */}
                {discountDeduction > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                        <span className="text-sm flex items-center gap-2">
                            <Percent size={14} />
                            Incentive Deduction
                        </span>
                        <span className="font-mono font-bold">
                            -Rp {discountDeduction.toLocaleString()}
                        </span>
                    </div>
                )}

                {/* Logistics */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Truck size={14} />
                        Logistics Fee
                        {logisticsFee === 0 && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">FREE</span>
                        )}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                        {logisticsFee === 0 ? 'GRATIS' : `Rp ${logisticsFee.toLocaleString()}`}
                    </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center text-slate-500">
                    <span className="text-sm flex items-center gap-2">
                        <DollarSign size={14} />
                        PPN (11%)
                    </span>
                    <span className="font-mono text-sm">
                        Rp {tax.toLocaleString()}
                    </span>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-slate-200 my-2" />

                {/* Net Total */}
                <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900">Net Yield</span>
                    <span className="text-xl font-mono font-black text-pink-500">
                        Rp {netTotal.toLocaleString()}
                    </span>
                </div>

                {/* Dropshipper Margin Panel */}
                {isDropshipper && dropshipperCost !== undefined && projectedMargin !== undefined && (
                    <div className="mt-4 bg-slate-900 rounded-lg p-4 text-white">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3">
                            <TrendingUp size={14} />
                            DROPSHIPPER MARGIN ANALYSIS
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase">HPP Total</div>
                                <div className="font-mono font-bold">
                                    Rp {dropshipperCost.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase">Projected Margin</div>
                                <div className={`font-mono font-bold ${projectedMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {projectedMargin >= 0 ? '+' : ''}Rp {projectedMargin.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        {projectedMargin < 0 && (
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-rose-400">
                                <AlertTriangle size={12} />
                                Diskon memakan profit Anda!
                            </div>
                        )}
                        {marginPercent !== undefined && marginPercent > 0 && (
                            <div className="mt-2 text-right">
                                <span className="text-[10px] text-slate-500">Margin: </span>
                                <span className={`font-mono font-bold ${marginPercent >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {marginPercent}%
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// LocationSelector
const LocationSelector = ({
    zone,
    onZoneChange
}: {
    zone: LocationProfile['logisticsZone'];
    onZoneChange: (zone: LocationProfile['logisticsZone']) => void;
}) => {
    const zones: { id: LocationProfile['logisticsZone']; label: string }[] = [
        { id: 'JAVA', label: 'Jawa' },
        { id: 'SUMATRA', label: 'Sumatera' },
        { id: 'KALIMANTAN', label: 'Kalimantan' },
        { id: 'SULAWESI', label: 'Sulawesi' },
        { id: 'PAPUA', label: 'Papua' },
        { id: 'OTHER', label: 'Lainnya' }
    ];

    return (
        <div className="mb-4">
            <div className="text-xs text-slate-500 mb-2">Lokasi Pengiriman</div>
            <div className="flex flex-wrap gap-2">
                {zones.map(z => (
                    <button
                        key={z.id}
                        onClick={() => onZoneChange(z.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${zone === z.id
                                ? 'bg-pink-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {z.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CheckoutSimulationModal = ({
    isOpen,
    onClose,
    product,
    quantity,
    isDropshipper,
    onConfirmOrder
}: CheckoutSimulationModalProps) => {
    const [discount, setDiscount] = useState<DiscountVector | null>(null);
    const [logisticsZone, setLogisticsZone] = useState<LocationProfile['logisticsZone']>('JAVA');
    const [injectedCoupon, setInjectedCoupon] = useState<{ code: string; source: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Check for auto-injected coupon from Blog
    useEffect(() => {
        if (isOpen) {
            const coupon = retrieveInjectedCoupon();
            if (coupon) {
                setInjectedCoupon(coupon);
            }
        }
    }, [isOpen]);

    // Create cart items
    const cartItems: CartItem[] = useMemo(() => [
        { product, quantity }
    ], [product, quantity]);

    // Calculate totals
    const calculation = useMemo(() =>
        calculateCartTotal(cartItems, discount, logisticsZone, isDropshipper),
        [cartItems, discount, logisticsZone, isDropshipper]
    );

    // Handle coupon apply
    const handleApplyCoupon = useCallback((code: string) => {
        const result = verifyIncentive(code, {
            subtotal: calculation.subtotal,
            productCategoryMask: product.vectorMask,
            isDropshipper
        });
        setDiscount(result);
    }, [calculation.subtotal, product.vectorMask, isDropshipper]);

    // Handle confirm order
    const handleConfirmOrder = useCallback(() => {
        setIsProcessing(true);

        setTimeout(() => {
            const orderSummary: OrderSummary = {
                product,
                quantity,
                subtotal: calculation.subtotal,
                discountCode: discount?.isValid ? discount.code : null,
                discountAmount: calculation.discountDeduction,
                logisticsFee: calculation.logisticsFee,
                tax: calculation.tax,
                netTotal: calculation.netTotal,
                timestamp: Date.now()
            };

            // Clear injected coupon after use
            if (injectedCoupon) {
                clearInjectedCoupon();
            }

            onConfirmOrder(orderSummary);
            setIsProcessing(false);
            onClose();
        }, 1500);
    }, [product, quantity, calculation, discount, injectedCoupon, onConfirmOrder, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-pink-500 text-white p-2 rounded-xl">
                            <ShoppingCart size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-900">Checkout</h2>
                            <p className="text-xs text-slate-500">Konfirmasi pesanan Anda</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Product Summary */}
                    <div className="flex gap-4 bg-slate-50 rounded-xl p-4 mb-4">
                        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                                src={product.media[0]?.url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-pink-500 font-bold uppercase">{product.brand}</div>
                            <div className="font-bold text-slate-900 truncate">{product.name}</div>
                            <div className="text-sm text-slate-600 mt-1">
                                Qty: {quantity} × Rp {product.marketPrice.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Location Selector */}
                    <LocationSelector zone={logisticsZone} onZoneChange={setLogisticsZone} />

                    {/* Voucher Redemption */}
                    <VoucherRedemptionInterface
                        onApply={handleApplyCoupon}
                        initialCode={injectedCoupon?.code}
                        isFromBlog={injectedCoupon?.source === 'blog'}
                    />

                    {/* Voucher Status */}
                    <VoucherStatusBadge discount={discount} />

                    {/* Yield Breakdown */}
                    <YieldBreakdownHUD
                        subtotal={calculation.subtotal}
                        discountDeduction={calculation.discountDeduction}
                        logisticsFee={calculation.logisticsFee}
                        tax={calculation.tax}
                        netTotal={calculation.netTotal}
                        isDropshipper={isDropshipper}
                        dropshipperCost={calculation.dropshipperCost}
                        projectedMargin={calculation.projectedMargin}
                        marginPercent={calculation.marginPercent}
                    />
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4">
                    <button
                        onClick={handleConfirmOrder}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard size={20} />
                                Konfirmasi Pesanan
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                        Dengan melanjutkan, Anda menyetujui syarat dan ketentuan
                    </p>
                </div>
            </div>
        </div>
    );
};
