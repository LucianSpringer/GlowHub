// TransactionSettlementEngine.ts - Coupon & Checkout Calculation Engine
// Pattern: IncentiveVerification + CartArithmetic + AutoInjection

import { type ProductTelemetry } from '../ProductTelemetry';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DiscountType = 'PERCENT' | 'FLAT';

export interface Incentive {
    code: string;
    type: DiscountType;
    value: number;                    // Percent (0-100) or flat amount
    minPurchase: number;              // Minimum purchase to activate
    maxDiscount?: number;             // Cap for percent discounts
    categoryMask?: number;            // Bitwise mask for category restriction
    expiresAt: number;                // Timestamp
    description: string;
    isDropshipperOnly: boolean;
}

export interface DiscountVector {
    code: string;
    type: DiscountType;
    value: number;
    calculatedDeduction: number;
    isValid: boolean;
    errorMessage?: string;
}

export interface CartCalculation {
    subtotal: number;
    discountDeduction: number;
    logisticsFee: number;
    tax: number;
    netTotal: number;
    // Dropshipper specific
    dropshipperCost?: number;
    projectedMargin?: number;
    marginPercent?: number;
}

export interface LocationProfile {
    province: string;
    city: string;
    logisticsZone: 'JAVA' | 'SUMATRA' | 'KALIMANTAN' | 'SULAWESI' | 'PAPUA' | 'OTHER';
}

// ============================================================================
// INCENTIVE REGISTRY (Coupon Database)
// ============================================================================

export const _INCENTIVE_DB: Incentive[] = [
    {
        code: 'GLOW10',
        type: 'PERCENT',
        value: 10,
        minPurchase: 100000,
        maxDiscount: 50000,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        description: 'Diskon 10% untuk pembelian minimal Rp 100.000',
        isDropshipperOnly: false
    },
    {
        code: 'NEWUSER20',
        type: 'PERCENT',
        value: 20,
        minPurchase: 150000,
        maxDiscount: 75000,
        expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
        description: 'Diskon 20% untuk pengguna baru',
        isDropshipperOnly: false
    },
    {
        code: 'ACNESAVER',
        type: 'PERCENT',
        value: 15,
        minPurchase: 80000,
        maxDiscount: 40000,
        categoryMask: 0b00000100, // ACNE products only
        expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000,
        description: 'Diskon 15% untuk produk anti-acne',
        isDropshipperOnly: false
    },
    {
        code: 'DROPSHIP25',
        type: 'PERCENT',
        value: 25,
        minPurchase: 500000,
        maxDiscount: 200000,
        expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000,
        description: 'Diskon 25% eksklusif dropshipper',
        isDropshipperOnly: true
    },
    {
        code: 'FLAT50K',
        type: 'FLAT',
        value: 50000,
        minPurchase: 200000,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        description: 'Potongan langsung Rp 50.000',
        isDropshipperOnly: false
    },
    {
        code: 'READREWARD',
        type: 'PERCENT',
        value: 5,
        minPurchase: 50000,
        maxDiscount: 25000,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours (blog reward)
        description: 'Hadiah membaca artikel - 5% off',
        isDropshipperOnly: false
    }
];

// ============================================================================
// INCENTIVE VERIFICATION PROTOCOL
// ============================================================================

export interface VerificationContext {
    subtotal: number;
    productCategoryMask?: number;
    isDropshipper: boolean;
}

/**
 * Verify and calculate discount from coupon code
 */
export const verifyIncentive = (
    code: string,
    context: VerificationContext
): DiscountVector => {
    const normalizedCode = code.trim().toUpperCase();

    // Lookup in database
    const incentive = _INCENTIVE_DB.find(i => i.code === normalizedCode);

    if (!incentive) {
        return {
            code: normalizedCode,
            type: 'FLAT',
            value: 0,
            calculatedDeduction: 0,
            isValid: false,
            errorMessage: 'Kode kupon tidak ditemukan'
        };
    }

    // Expiry Check
    if (Date.now() > incentive.expiresAt) {
        return {
            code: normalizedCode,
            type: incentive.type,
            value: incentive.value,
            calculatedDeduction: 0,
            isValid: false,
            errorMessage: 'Kode kupon sudah kadaluarsa'
        };
    }

    // Dropshipper-only check
    if (incentive.isDropshipperOnly && !context.isDropshipper) {
        return {
            code: normalizedCode,
            type: incentive.type,
            value: incentive.value,
            calculatedDeduction: 0,
            isValid: false,
            errorMessage: 'Kupon ini hanya untuk Dropshipper'
        };
    }

    // Minimum purchase check
    if (context.subtotal < incentive.minPurchase) {
        return {
            code: normalizedCode,
            type: incentive.type,
            value: incentive.value,
            calculatedDeduction: 0,
            isValid: false,
            errorMessage: `Minimum pembelian Rp ${incentive.minPurchase.toLocaleString()}`
        };
    }

    // Category match check (if applicable)
    if (incentive.categoryMask && context.productCategoryMask) {
        if ((incentive.categoryMask & context.productCategoryMask) === 0) {
            return {
                code: normalizedCode,
                type: incentive.type,
                value: incentive.value,
                calculatedDeduction: 0,
                isValid: false,
                errorMessage: 'Kupon tidak berlaku untuk kategori produk ini'
            };
        }
    }

    // Calculate deduction
    let calculatedDeduction: number;
    if (incentive.type === 'PERCENT') {
        calculatedDeduction = Math.round(context.subtotal * (incentive.value / 100));
        if (incentive.maxDiscount) {
            calculatedDeduction = Math.min(calculatedDeduction, incentive.maxDiscount);
        }
    } else {
        calculatedDeduction = incentive.value;
    }

    // Safety floor - don't exceed subtotal
    calculatedDeduction = Math.min(calculatedDeduction, context.subtotal);

    return {
        code: normalizedCode,
        type: incentive.type,
        value: incentive.value,
        calculatedDeduction,
        isValid: true
    };
};

// ============================================================================
// LOGISTICS FEE CALCULATOR
// ============================================================================

const LOGISTICS_RATES: Record<LocationProfile['logisticsZone'], number> = {
    'JAVA': 15000,
    'SUMATRA': 25000,
    'KALIMANTAN': 35000,
    'SULAWESI': 40000,
    'PAPUA': 55000,
    'OTHER': 30000
};

const FREE_SHIPPING_THRESHOLD = 300000;

export const calculateLogisticsFee = (
    subtotal: number,
    zone: LocationProfile['logisticsZone'] = 'JAVA'
): number => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        return 0; // Free shipping
    }
    return LOGISTICS_RATES[zone];
};

// ============================================================================
// CART ARITHMETIC KERNEL
// ============================================================================

const TAX_RATE = 0.11; // 11% PPN

export interface CartItem {
    product: ProductTelemetry;
    quantity: number;
}

/**
 * Calculate full cart breakdown with discounts
 */
export const calculateCartTotal = (
    items: CartItem[],
    discount: DiscountVector | null,
    logisticsZone: LocationProfile['logisticsZone'] = 'JAVA',
    isDropshipper: boolean = false
): CartCalculation => {
    // Base calculation
    const subtotal = items.reduce((sum, item) =>
        sum + (item.product.marketPrice * item.quantity), 0
    );

    // Discount deduction
    const discountDeduction = discount?.isValid ? discount.calculatedDeduction : 0;

    // Logistics fee
    const logisticsFee = calculateLogisticsFee(subtotal - discountDeduction, logisticsZone);

    // Tax (on discounted subtotal)
    const taxableAmount = subtotal - discountDeduction;
    const tax = Math.round(taxableAmount * TAX_RATE);

    // Net total
    let netTotal = subtotal - discountDeduction + logisticsFee + tax;

    // Safety floor
    netTotal = Math.max(0, netTotal);

    // Dropshipper margin calculation
    let dropshipperCost: number | undefined;
    let projectedMargin: number | undefined;
    let marginPercent: number | undefined;

    if (isDropshipper) {
        dropshipperCost = items.reduce((sum, item) =>
            sum + (item.product.basePrice * item.quantity), 0
        );
        projectedMargin = subtotal - discountDeduction - dropshipperCost;
        marginPercent = subtotal > 0
            ? Math.round((projectedMargin / (subtotal - discountDeduction)) * 100)
            : 0;
    }

    return {
        subtotal,
        discountDeduction,
        logisticsFee,
        tax,
        netTotal,
        dropshipperCost,
        projectedMargin,
        marginPercent
    };
};

// ============================================================================
// AUTO-INJECTION SERVICE (Session Storage)
// ============================================================================

const COUPON_STORAGE_KEY = 'GLOWHUB_ACTIVE_COUPON';
const COUPON_SOURCE_KEY = 'GLOWHUB_COUPON_SOURCE';

/**
 * Store coupon to session storage (called from Blog)
 */
export const injectCouponToSession = (code: string, source: string = 'blog'): void => {
    try {
        sessionStorage.setItem(COUPON_STORAGE_KEY, code);
        sessionStorage.setItem(COUPON_SOURCE_KEY, source);
    } catch (e) {
        console.warn('Failed to inject coupon to session:', e);
    }
};

/**
 * Retrieve coupon from session storage (called from Checkout)
 */
export const retrieveInjectedCoupon = (): { code: string; source: string } | null => {
    try {
        const code = sessionStorage.getItem(COUPON_STORAGE_KEY);
        const source = sessionStorage.getItem(COUPON_SOURCE_KEY) || 'unknown';

        if (code) {
            return { code, source };
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Clear coupon from session storage (after use)
 */
export const clearInjectedCoupon = (): void => {
    try {
        sessionStorage.removeItem(COUPON_STORAGE_KEY);
        sessionStorage.removeItem(COUPON_SOURCE_KEY);
    } catch (e) {
        console.warn('Failed to clear injected coupon:', e);
    }
};

// ============================================================================
// COUPON CODE VALIDATOR (Regex)
// ============================================================================

/**
 * Validate coupon code format (alphanumeric, uppercase)
 */
export const validateCouponFormat = (code: string): boolean => {
    const regex = /^[A-Z0-9]{4,15}$/;
    return regex.test(code.trim().toUpperCase());
};

/**
 * Format coupon code (uppercase, trim)
 */
export const formatCouponCode = (code: string): string => {
    return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
};
