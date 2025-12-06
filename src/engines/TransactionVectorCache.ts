// TransactionVectorCache.ts - Client-side Cart Database
// Pattern: Map-based O(1) Access + LocalStorage Persistence

import type { ProductTelemetry } from '../ProductTelemetry';

const CART_STORAGE_KEY = 'glowhub_cart_vector';

export interface CartItem {
    product: ProductTelemetry;
    quantity: number;
    addedAt: number;
}

export interface CartData {
    items: Map<string, CartItem>;
    lastModified: number;
}

/**
 * Serialize Map to JSON-compatible format
 */
const serializeCart = (items: Map<string, CartItem>): string => {
    const obj: Record<string, CartItem> = {};
    items.forEach((value, key) => {
        obj[key] = value;
    });
    return JSON.stringify({ items: obj, lastModified: Date.now() });
};

/**
 * Deserialize JSON to Map
 */
const deserializeCart = (json: string): Map<string, CartItem> => {
    try {
        const parsed = JSON.parse(json);
        const map = new Map<string, CartItem>();
        if (parsed.items) {
            Object.entries(parsed.items).forEach(([key, value]) => {
                map.set(key, value as CartItem);
            });
        }
        return map;
    } catch {
        return new Map();
    }
};

/**
 * Load cart from localStorage
 */
export const loadCart = (): Map<string, CartItem> => {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            return deserializeCart(stored);
        }
    } catch {
        // Handle storage access errors
    }
    return new Map();
};

/**
 * Save cart to localStorage
 */
export const saveCart = (items: Map<string, CartItem>): void => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, serializeCart(items));
    } catch {
        // Handle quota exceeded
    }
};

/**
 * Add item to cart (or increment quantity)
 */
export const addToCart = (
    cart: Map<string, CartItem>,
    product: ProductTelemetry,
    quantity: number = 1
): Map<string, CartItem> => {
    const newCart = new Map(cart);
    const existing = newCart.get(product.id);

    if (existing) {
        newCart.set(product.id, {
            ...existing,
            quantity: existing.quantity + quantity
        });
    } else {
        newCart.set(product.id, {
            product,
            quantity,
            addedAt: Date.now()
        });
    }

    saveCart(newCart);
    return newCart;
};

/**
 * Remove item from cart
 */
export const removeFromCart = (
    cart: Map<string, CartItem>,
    productId: string
): Map<string, CartItem> => {
    const newCart = new Map(cart);
    newCart.delete(productId);
    saveCart(newCart);
    return newCart;
};

/**
 * Update item quantity
 */
export const updateQuantity = (
    cart: Map<string, CartItem>,
    productId: string,
    quantity: number
): Map<string, CartItem> => {
    const newCart = new Map(cart);
    const item = newCart.get(productId);

    if (item) {
        if (quantity <= 0) {
            newCart.delete(productId);
        } else {
            newCart.set(productId, { ...item, quantity });
        }
    }

    saveCart(newCart);
    return newCart;
};

/**
 * Clear entire cart
 */
export const clearCart = (): Map<string, CartItem> => {
    const emptyCart = new Map<string, CartItem>();
    saveCart(emptyCart);
    return emptyCart;
};

/**
 * Calculate TotalYield (total price)
 */
export const getTotalYield = (cart: Map<string, CartItem>): number => {
    let total = 0;
    cart.forEach(item => {
        total += item.product.marketPrice * item.quantity;
    });
    return total;
};

/**
 * Calculate VolumeMetric (total items)
 */
export const getVolumeMetric = (cart: Map<string, CartItem>): number => {
    let count = 0;
    cart.forEach(item => {
        count += item.quantity;
    });
    return count;
};

/**
 * Get cart items as array
 */
export const getCartItems = (cart: Map<string, CartItem>): CartItem[] => {
    return Array.from(cart.values());
};

/**
 * Validate stock availability
 */
export const validateStock = (
    product: ProductTelemetry,
    requestedQty: number
): { valid: boolean; message: string } => {
    if (product.stockQty <= 0) {
        return { valid: false, message: 'Stok habis' };
    }
    if (requestedQty > product.stockQty) {
        return { valid: false, message: `Stok tersedia: ${product.stockQty}` };
    }
    return { valid: true, message: 'OK' };
};
