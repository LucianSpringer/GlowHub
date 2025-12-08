import { useGlobalStore } from '../context/GlobalStoreContext';
import { Activity, Wifi, WifiOff } from 'lucide-react';

export const SupplierPerformanceWidget = () => {
    const { supplierStatus } = useGlobalStore();

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                    <Activity size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Supplier Pulse</h3>
            </div>

            <div className="space-y-4">
                {supplierStatus.map(supplier => (
                    <div key={supplier.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <div className="font-bold text-sm text-slate-800">{supplier.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                <span>Score: {supplier.reliabilityScore}%</span>
                                <span>•</span>
                                <span>Last sync: {new Date(supplier.lastSync).toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div className={`p-2 rounded-full ${supplier.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-600' :
                            supplier.status === 'LAGGING' ? 'bg-amber-100 text-amber-600' :
                                'bg-red-100 text-red-600'
                            }`}>
                            {supplier.status === 'ONLINE' && <Wifi size={16} />}
                            {supplier.status === 'LAGGING' && <Activity size={16} className="animate-pulse" />}
                            {supplier.status === 'OFFLINE' && <WifiOff size={16} />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <div className="text-xs text-slate-400">
                    Real-time monitoring via <span className="font-mono text-blue-500">OrderRelayProcotol</span>
                </div>
            </div>
        </div>
    );
};
