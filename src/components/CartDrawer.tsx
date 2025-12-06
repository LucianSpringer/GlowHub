// CartDrawer.tsx - Slide-over Cart Panel (ProcurementManifestUI)
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import type { CartItem } from '../engines/TransactionVectorCache';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    subtotal: number;
    tax: number;
    totalPrice: number;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onCheckout: () => void;
}

export const CartDrawer = ({
    isOpen,
    onClose,
    items,
    subtotal,
    tax,
    totalPrice,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout
}: CartDrawerProps) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-pink-100 p-2 rounded-xl">
                            <ShoppingBag size={24} className="text-pink-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-900">Keranjang</h2>
                            <p className="text-xs text-slate-500">{items.length} produk</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag size={48} className="text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500">Keranjang kosong</p>
                            <button
                                onClick={onClose}
                                className="mt-4 text-pink-500 font-bold text-sm hover:underline"
                            >
                                Mulai Belanja
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div
                                key={item.product.id}
                                className="flex gap-4 p-4 bg-slate-50 rounded-2xl"
                            >
                                {/* Image */}
                                <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                    <img
                                        src={item.product.media[0]?.url}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">{item.product.brand}</div>
                                    <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                                    <div className="text-pink-500 font-bold mt-1">
                                        Rp {item.product.marketPrice.toLocaleString()}
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200">
                                            <button
                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                                className="p-1.5 hover:bg-slate-50 rounded-l-lg transition-colors"
                                            >
                                                <Minus size={14} className="text-slate-600" />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                                className="p-1.5 hover:bg-slate-50 rounded-r-lg transition-colors"
                                            >
                                                <Plus size={14} className="text-slate-600" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => onRemoveItem(item.product.id)}
                                            className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer - Summary & Checkout */}
                {items.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 space-y-4">
                        {/* Summary */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <span>Rp {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>PPN (11%)</span>
                                <span>Rp {tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-slate-900 pt-2 border-t border-slate-100">
                                <span>Total</span>
                                <span className="text-pink-500">Rp {totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button
                            onClick={onCheckout}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-pink-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            Checkout <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
