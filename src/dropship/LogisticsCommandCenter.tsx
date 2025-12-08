// LogisticsCommandCenter.tsx - Order Forwarder UI
import { useState, useEffect } from 'react';
import { Package, Truck, AlertCircle, Clock, Zap, RefreshCw, Activity, ChevronDown, Printer, FileText } from 'lucide-react';
import {
    type DropshipOrder,
    OrderStatus,
    generateMockOrders,
    batchProcessOrders,
    getSupplierHealth,
    type SupplierHealth
} from '../engines/OrderRelayProtocol';

export const LogisticsCommandCenter = () => {
    const [orders, setOrders] = useState<DropshipOrder[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [supplierHealth, setSupplierHealth] = useState<SupplierHealth>({
        status: 'STABLE',
        averageLatency: 200,
        reliabilityScore: 100,
        lastPing: Date.now()
    });
    const [showActionMenu, setShowActionMenu] = useState(false);

    useEffect(() => {
        setOrders(generateMockOrders(8));
        const interval = setInterval(() => {
            setSupplierHealth(getSupplierHealth());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);

    const handleBatchProcess = async () => {
        if (supplierHealth.status === 'DOWN') return;
        setProcessing(true);
        setShowActionMenu(false);

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

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'STABLE': return 'text-emerald-400';
            case 'LATENCY': return 'text-yellow-400';
            case 'DOWN': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-visible">
            {/* Header with Supplier Pulse */}
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

                {/* SupplierPulseIndicator */}
                <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-2 ${getHealthColor(supplierHealth.status)}`}>
                        <Activity size={16} className={supplierHealth.status !== 'DOWN' ? 'animate-pulse' : ''} />
                        <span className="font-bold text-sm tracking-widest">{supplierHealth.status}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                        {supplierHealth.averageLatency}ms • Score: {supplierHealth.reliabilityScore}
                    </div>
                </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-700">
                {orders.slice(0, 6).map(order => (
                    <div key={order.id} className="bg-slate-800 rounded-xl p-3 flex items-center justify-between group hover:bg-slate-750 transition-colors">
                        <div className="flex items-center gap-3">
                            {statusIcon(order.status)}
                            <div>
                                <div className="font-medium text-sm group-hover:text-blue-400 transition-colors">{order.productName}</div>
                                <div className="text-xs text-slate-400">
                                    {order.quantity}x • Rp {order.totalPrice.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${urgencyColor(order.urgencyLevel)}`}>
                                {order.urgencyLevel}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* SmartBatchActionPanel */}
            <div className="relative">
                <div className="flex gap-2">
                    <button
                        onClick={handleBatchProcess}
                        disabled={processing || supplierHealth.status === 'DOWN' || pendingOrders.length === 0}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${processing || supplierHealth.status === 'DOWN'
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 shadow-lg shadow-blue-500/20'
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
                                Auto-Relay ({pendingOrders.length})
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setShowActionMenu(!showActionMenu)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl px-4 transition-colors"
                    >
                        <ChevronDown size={20} className={`transition-transformDuration-300 ${showActionMenu ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Dropdown Menu */}
                {showActionMenu && (
                    <div className="absolute bottom-full mb-2 right-0 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left">
                            <Printer size={16} className="text-purple-400" />
                            <span>Print Shipping Manifest</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left border-t border-slate-700">
                            <FileText size={16} className="text-orange-400" />
                            <span>Invoice Pooling (Net-30)</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                    <div className="text-xl font-mono font-bold text-emerald-400">
                        {orders.filter(o => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.PROCESSING).length}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Processed</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-mono font-bold text-yellow-400">{pendingOrders.length}</div>
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
