// useCart.ts - React Hook wrapping TransactionVectorCache
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    loadCart,
    addToCart as addToCartEngine,
    removeFromCart as removeFromCartEngine,
    updateQuantity as updateQuantityEngine,
    clearCart as clearCartEngine,
    getTotalYield,
    getVolumeMetric,
    getCartItems,
    validateStock,
    type CartItem
} from '../engines/TransactionVectorCache';
import type { ProductTelemetry } from '../ProductTelemetry';

export interface UseCartReturn {
    items: CartItem[];
    itemCount: number;
    totalPrice: number;
    subtotal: number;
    tax: number;
    addToCart: (product: ProductTelemetry, quantity?: number) => { success: boolean; message: string };
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: string) => boolean;
    getItemQuantity: (productId: string) => number;
}

const TAX_RATE = 0.11; // 11% PPN

export const useCart = (): UseCartReturn => {
    const [cart, setCart] = useState(() => loadCart());

    // Sync with localStorage on mount
    useEffect(() => {
        setCart(loadCart());
    }, []);

    // Derived values
    const items = useMemo(() => getCartItems(cart), [cart]);
    const itemCount = useMemo(() => getVolumeMetric(cart), [cart]);
    const subtotal = useMemo(() => getTotalYield(cart), [cart]);
    const tax = useMemo(() => Math.round(subtotal * TAX_RATE), [subtotal]);
    const totalPrice = useMemo(() => subtotal + tax, [subtotal, tax]);

    // Add to cart with stock validation
    const addToCart = useCallback((product: ProductTelemetry, quantity: number = 1): { success: boolean; message: string } => {
        const existingItem = cart.get(product.id);
        const currentQty = existingItem?.quantity || 0;
        const totalQty = currentQty + quantity;

        const validation = validateStock(product, totalQty);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        setCart(prev => addToCartEngine(prev, product, quantity));
        return { success: true, message: 'Ditambahkan ke keranjang!' };
    }, [cart]);

    // Remove from cart
    const removeFromCart = useCallback((productId: string) => {
        setCart(prev => removeFromCartEngine(prev, productId));
    }, []);

    // Update quantity
    const updateQuantity = useCallback((productId: string, quantity: number) => {
        setCart(prev => updateQuantityEngine(prev, productId, quantity));
    }, []);

    // Clear cart
    const clearCart = useCallback(() => {
        setCart(clearCartEngine());
    }, []);

    // Check if product in cart
    const isInCart = useCallback((productId: string): boolean => {
        return cart.has(productId);
    }, [cart]);

    // Get item quantity
    const getItemQuantity = useCallback((productId: string): number => {
        return cart.get(productId)?.quantity || 0;
    }, [cart]);

    return {
        items,
        itemCount,
        totalPrice,
        subtotal,
        tax,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity
    };
};
