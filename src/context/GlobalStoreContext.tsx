import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { ProductTelemetry } from '../ProductTelemetry';
import { PRODUCT_CATALOG } from '../ProductTelemetry';

// --- Types ---

export interface Order {
    id: string;
    items: { productId: string; quantity: number }[];
    totalAmount: number;
    status: 'PENDING' | 'PROCESSED' | 'SHIPPED';
    timestamp: number;
    customerName: string;
}

export interface SupplierStatus {
    id: string;
    name: string;
    reliabilityScore: number; // 0-100
    lastSync: number; // timestamp
    status: 'ONLINE' | 'LAGGING' | 'OFFLINE';
    isDirty: boolean; // true if sync found changes
}

export interface GlobalStore {
    products: ProductTelemetry[];
    orders: Order[];
    logs: string[];
    supplierStatus: SupplierStatus[];
    metrics: {
        totalRevenue: number;
        activeDropshippers: number;
    };
    // Actions
    updateProductPrice: (id: string, newPrice: number) => void;
    updateProductStock: (id: string, delta: number) => void;
    addOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => void;
    toggleAutoPilot: (enabled: boolean) => void;
    isAutoPilot: boolean;
}

// --- Context ---

const GlobalStoreContext = createContext<GlobalStore | null>(null);

export const useGlobalStore = () => {
    const context = useContext(GlobalStoreContext);
    if (!context) throw new Error("useGlobalStore must be used within a GlobalStoreProvider");
    return context;
};

// --- Provider ---

export const GlobalStoreProvider = ({ children }: { children: ReactNode }) => {
    // State
    const [products, setProducts] = useState<ProductTelemetry[]>(PRODUCT_CATALOG);
    const [orders, setOrders] = useState<Order[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [isAutoPilot, setIsAutoPilot] = useState(false);
    const [supplierStatus, setSupplierStatus] = useState<SupplierStatus[]>([
        { id: 'SUP-01', name: 'Scarlett Official', reliabilityScore: 98, lastSync: Date.now(), status: 'ONLINE', isDirty: false },
        { id: 'SUP-02', name: 'Somethinc Direct', reliabilityScore: 94, lastSync: Date.now(), status: 'ONLINE', isDirty: false },
        { id: 'SUP-03', name: 'Avoskin Distro', reliabilityScore: 88, lastSync: Date.now() - 50000, status: 'LAGGING', isDirty: false }
    ]);

    // Helpers
    const addLog = useCallback((msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    }, []);

    // Actions
    const updateProductPrice = useCallback((id: string, newPrice: number) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, basePrice: newPrice } : p
        ));
        addLog(`PRICE_UPDATE: Product ${id} price set to ${newPrice}`);
    }, [addLog]);

    const updateProductStock = useCallback((id: string, delta: number) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, stockQty: Math.max(0, p.stockQty + delta) } : p
        ));
        // Don't log every stock change to avoid spam, or log only significant ones
    }, []);

    const addOrder = useCallback((pendingOrder: Omit<Order, 'id' | 'status' | 'timestamp'>) => {
        const newOrder: Order = {
            ...pendingOrder,
            id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: 'PENDING',
            timestamp: Date.now()
        };

        setOrders(prev => [newOrder, ...prev]);
        addLog(`ORDER_RECEIVED: ${newOrder.id} from ${newOrder.customerName}`);

        // Trigger Stock Reduction
        newOrder.items.forEach(item => {
            updateProductStock(item.productId, -item.quantity);
        });

        // Simulate Relay Processing
        setTimeout(() => {
            setOrders(prev => prev.map(o =>
                o.id === newOrder.id ? { ...o, status: 'PROCESSED' } : o
            ));
            addLog(`ORDER_PROCESSED: ${newOrder.id} relayed to supplier`);
        }, 3000);
    }, [updateProductStock, addLog]);


    // --- ENGINES (The Invisible Logic) ---

    // 1. SupplierSyncJob (Simulation)
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly fluctuate supplier status
            setSupplierStatus(prev => prev.map(s => ({
                ...s,
                lastSync: Date.now(),
                reliabilityScore: Math.min(100, Math.max(70, s.reliabilityScore + (Math.random() > 0.5 ? 1 : -1))),
                status: Math.random() > 0.9 ? 'LAGGING' : 'ONLINE'
            })));

            // Simulate stock drift / sync
            if (Math.random() > 0.7) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                if (randomProduct) {
                    const drift = Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
                    if (drift !== 0) {
                        // Only update if AutoPilot is ON or just mark as dirty (simplified for now: just update)
                        if (isAutoPilot) {
                            updateProductStock(randomProduct.id, drift);
                            addLog(`AUTO_SYNC: Adjusted stock for ${randomProduct.name} by ${drift}`);
                        }
                    }
                }
            }
        }, 30000); // Run every 30s

        return () => clearInterval(interval);
    }, [products, isAutoPilot, updateProductStock, addLog]);

    // Derived Metrics
    const metrics = {
        totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        activeDropshippers: 142 // Mock
    };

    return (
        <GlobalStoreContext.Provider value={{
            products,
            orders,
            logs,
            supplierStatus,
            metrics,
            updateProductPrice,
            updateProductStock,
            addOrder,
            toggleAutoPilot: setIsAutoPilot,
            isAutoPilot
        }}>
            {children}
        </GlobalStoreContext.Provider>
    );
};
