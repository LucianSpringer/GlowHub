// MarketplaceSynchronizationGrid.tsx - Integration Health Monitor
import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';
import {
    checkConnectionHealth,
    generateMockStockData,
    generateConflictReport,
    createSyncLog,
    type ConnectionHealth,
    type SyncLog
} from '../engines/InventoryReconciliationProtocol';

export const MarketplaceSynchronizationGrid = () => {
    const [connections, setConnections] = useState<ConnectionHealth[]>([]);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [syncing, setSyncing] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial health check
        setConnections(checkConnectionHealth());

        // Simulate periodic health checks
        const interval = setInterval(() => {
            setConnections(checkConnectionHealth());
        }, 5000);

        // Generate some initial logs
        setLogs([
            createSyncLog('SYSTEM', 'Admin panel initialized'),
            createSyncLog('SHOPEE_API', 'Connected successfully'),
            createSyncLog('TOKOPEDIA_API', 'Connected successfully'),
            createSyncLog('GOOGLE_SHEETS', 'Supplier data synced: 156 products'),
        ]);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const handleForceSync = async () => {
        setSyncing(true);
        setLogs(prev => [...prev, createSyncLog('MANUAL', 'Force sync initiated...')]);

        // Simulate sync process
        const stockData = generateMockStockData();

        for (const item of stockData) {
            await new Promise(resolve => setTimeout(resolve, 300));

            const report = generateConflictReport(
                item.productId,
                item.sku,
                item.appStock,
                item.supplierStock,
                { shopee: item.shopeeStock, tokopedia: item.tokopediaStock }
            );

            const status: SyncLog['status'] = report.conflicts.includes('SYNC_OK') ? 'SUCCESS' : 'WARNING';
            setLogs(prev => [...prev, createSyncLog('RECONCILIATION', report.recommendation, status)]);
        }

        setLogs(prev => [...prev, createSyncLog('MANUAL', 'Force sync completed')]);
        setSyncing(false);
    };

    const getStatusIcon = (status: ConnectionHealth['status']) => {
        switch (status) {
            case 'ONLINE': return <Wifi size={16} className="text-emerald-500" />;
            case 'OFFLINE': return <WifiOff size={16} className="text-red-500" />;
            case 'DEGRADED': return <AlertTriangle size={16} className="text-yellow-500" />;
        }
    };

    const getStatusColor = (status: ConnectionHealth['status']) => {
        switch (status) {
            case 'ONLINE': return 'bg-emerald-500';
            case 'OFFLINE': return 'bg-red-500';
            case 'DEGRADED': return 'bg-yellow-500';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyan-500 p-2 rounded-xl text-white">
                            <RefreshCw size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Marketplace Sync Grid</h3>
                            <p className="text-xs text-slate-500">Integration health monitor</p>
                        </div>
                    </div>

                    <button
                        onClick={handleForceSync}
                        disabled={syncing}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${syncing
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-cyan-500 text-white hover:bg-cyan-600'
                            }`}
                    >
                        <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Force Sync Now'}
                    </button>
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
                {/* Left: Health Status Indicators */}
                <div>
                    <div className="text-xs font-medium text-slate-500 uppercase mb-4">Connection Health</div>
                    <div className="space-y-3">
                        {connections.map((conn, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(conn.status)}
                                        <span className="font-medium text-slate-800">{conn.name}</span>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(conn.status)} animate-pulse`} />
                                </div>
                                <div className="flex gap-4 text-xs text-slate-500">
                                    <span>Latency: <span className="font-mono">{conn.latency}ms</span></span>
                                    <span>Error Rate: <span className="font-mono">{conn.errorRate.toFixed(1)}%</span></span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Overall Status */}
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Overall System Status</span>
                            {connections.every(c => c.status === 'ONLINE') ? (
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle size={16} />
                                    <span className="text-sm font-bold">All Systems Operational</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <AlertTriangle size={16} />
                                    <span className="text-sm font-bold">Issues Detected</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Sync Log Terminal */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase mb-4">
                        <Terminal size={14} /> Sync Log Terminal
                    </div>
                    <div
                        ref={logContainerRef}
                        className="bg-slate-900 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs"
                    >
                        {logs.map((log, i) => (
                            <div key={log.id} className="mb-1">
                                <span className="text-slate-500">
                                    [{new Date(log.timestamp).toLocaleTimeString('id-ID')}]
                                </span>
                                <span className={`ml-2 ${log.status === 'SUCCESS' ? 'text-emerald-400' :
                                        log.status === 'WARNING' ? 'text-yellow-400' :
                                            'text-red-400'
                                    }`}>
                                    [{log.source}]
                                </span>
                                <span className="text-slate-300 ml-2">{log.message}</span>
                            </div>
                        ))}
                        {syncing && (
                            <div className="text-cyan-400 animate-pulse">▌</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
