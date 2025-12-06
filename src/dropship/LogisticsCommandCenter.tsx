// LogisticsCommandCenter.tsx - Order Forwarder UI
import { useState, useEffect } from 'react';
import { Package, Truck, AlertCircle, Clock, Zap, RefreshCw } from 'lucide-react';
import {
    type DropshipOrder,
    OrderStatus,
    generateMockOrders,
    batchProcessOrders
} from '../engines/OrderRelayProtocol';

export const LogisticsCommandCenter = () => {
    const [orders, setOrders] = useState<DropshipOrder[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [supplierStatus, setSupplierStatus] = useState<'ONLINE' | 'OFFLINE' | 'SYNCING'>('ONLINE');

    useEffect(() => {
        setOrders(generateMockOrders(8));
        // Simulate supplier status changes
        const interval = setInterval(() => {
            const roll = Math.random();
            setSupplierStatus(roll > 0.9 ? 'OFFLINE' : roll > 0.7 ? 'SYNCING' : 'ONLINE');
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);

    const handleBatchProcess = async () => {
        if (supplierStatus === 'OFFLINE') return;
        setProcessing(true);

        const result = await batchProcessOrders(pendingOrders, (current, total) => {
            setProgress({ current, total });
        });

        setOrders(prev => prev.map(order => {
            if (result.successful.includes(order.id)) {
                return { ...order, status: OrderStatus.PROCESSING };
            }
            if (result.failed.includes(order.id)) {
                return { ...order, status: OrderStatus.REVIEW };
            }
            return order;
        }));

        setProcessing(false);
    };

    const urgencyColor = (level: DropshipOrder['urgencyLevel']) => {
        switch (level) {
            case 'CRITICAL': return 'bg-red-500 text-white animate-pulse';
            case 'HIGH': return 'bg-orange-500 text-white';
            case 'MEDIUM': return 'bg-yellow-500 text-slate-900';
            default: return 'bg-slate-200 text-slate-600';
        }
    };

    const statusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return <Clock size={14} className="text-yellow-500" />;
            case 'PROCESSING': return <RefreshCw size={14} className="text-blue-500 animate-spin" />;
            case 'SHIPPED': return <Truck size={14} className="text-green-500" />;
            case 'REVIEW': return <AlertCircle size={14} className="text-red-500" />;
            default: return <Package size={14} />;
        }
    };

    return (
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-2 rounded-xl">
                        <Package size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Logistics Command</h3>
                        <p className="text-xs text-slate-400">{pendingOrders.length} orders pending</p>
                    </div>
                </div>

                {/* Supplier Bridge Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${supplierStatus === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' :
                    supplierStatus === 'SYNCING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${supplierStatus === 'ONLINE' ? 'bg-emerald-400' :
                        supplierStatus === 'SYNCING' ? 'bg-yellow-400 animate-pulse' :
                            'bg-red-400'
                        }`} />
                    Supplier: {supplierStatus}
                </div>
            </div>

            {/* Order Queue */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 mb-4">
                {orders.slice(0, 6).map(order => (
                    <div key={order.id} className="bg-slate-800 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {statusIcon(order.status)}
                            <div>
                                <div className="font-medium text-sm">{order.productName}</div>
                                <div className="text-xs text-slate-400">
                                    {order.quantity}x • Rp {order.totalPrice.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${urgencyColor(order.urgencyLevel)}`}>
                                {order.urgencyLevel}
                            </span>
                            <span className="text-xs text-slate-500">{order.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Matrix */}
            <div className="flex gap-3">
                <button
                    onClick={handleBatchProcess}
                    disabled={processing || supplierStatus === 'OFFLINE' || pendingOrders.length === 0}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${processing || supplierStatus === 'OFFLINE'
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90'
                        }`}
                >
                    {processing ? (
                        <>
                            <RefreshCw size={16} className="animate-spin" />
                            Processing {progress.current}/{progress.total}
                        </>
                    ) : (
                        <>
                            <Zap size={16} />
                            Batch Process ({pendingOrders.length})
                        </>
                    )}
                </button>
            </div>

            {/* Stats Footer */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                    <div className="text-xl font-mono font-bold text-emerald-400">
                        {orders.filter(o => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.PROCESSING).length}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Processed</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-mono font-bold text-yellow-400">
                        {pendingOrders.length}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Pending</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-mono font-bold text-red-400">
                        {orders.filter(o => o.status === OrderStatus.REVIEW).length}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Review</div>
                </div>
            </div>
        </div>
    );
};
