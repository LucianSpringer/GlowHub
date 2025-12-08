// DeviationWatchdogPanel.tsx - Anomaly Detection
import { useState } from 'react';
import { AlertOctagon, CheckCircle, ArrowRight } from 'lucide-react';

interface Anomaly {
    id: string;
    productName: string;
    issue: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    timestamp: number;
}

export const DeviationWatchdogPanel = () => {
    const [anomalies] = useState<Anomaly[]>(() => [
        { id: 'ERR-01', productName: 'Scarlett Whitening', issue: 'Margin deviation -12%', severity: 'HIGH', timestamp: Date.now() },
        { id: 'ERR-02', productName: 'Avoskin Retinol', issue: 'Unusual velocity spike', severity: 'MEDIUM', timestamp: Date.now() - 500000 },
    ]);

    if (anomalies.length === 0) {
        return (
            <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between border border-emerald-100">
                <div className="flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={18} />
                    <span className="text-sm font-bold text-emerald-700">System Nominal. No deviations detected.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-3">
                <AlertOctagon className="text-red-500 animate-pulse" size={18} />
                <h4 className="font-bold text-red-800 text-sm">Active Deviations ({anomalies.length})</h4>
            </div>

            <div className="space-y-2">
                {anomalies.map(a => (
                    <div key={a.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-slate-800">{a.productName}</div>
                            <div className="text-[10px] text-slate-500">{a.issue}</div>
                        </div>
                        <button className="text-[10px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                            Resolve <ArrowRight size={10} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
