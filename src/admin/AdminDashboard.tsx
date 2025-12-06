// AdminDashboard.tsx - God Mode Control Center
import { useState } from 'react';
import { InventoryIngestionHub } from './InventoryIngestionHub';
import { ProfitArchitectureConsole } from './ProfitArchitectureConsole';
import { ResonanceBroadcastSystem } from './ResonanceBroadcastSystem';
import { MarketplaceSynchronizationGrid } from './MarketplaceSynchronizationGrid';
import { Shield, ArrowLeft, Package, Percent, Bell, RefreshCw } from 'lucide-react';

interface AdminDashboardProps {
    onBack: () => void;
}

type AdminTab = 'inventory' | 'profit' | 'broadcast' | 'sync';

const TABS: { id: AdminTab; label: string; icon: typeof Package }[] = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'profit', label: 'Profit', icon: Percent },
    { id: 'broadcast', label: 'Broadcast', icon: Bell },
    { id: 'sync', label: 'Sync', icon: RefreshCw },
];

export const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('inventory');

    return (
        <div className="min-h-screen bg-slate-100 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 bg-white hover:bg-slate-50 text-slate-600 shadow-sm rounded-xl transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-2xl shadow-lg shadow-red-500/20">
                                <Shield size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Admin Control Center</h1>
                                <p className="text-sm text-slate-500">God Mode - Full Ecosystem Control</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-red-600">ADMIN MODE</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'inventory' && <InventoryIngestionHub />}
                    {activeTab === 'profit' && <ProfitArchitectureConsole />}
                    {activeTab === 'broadcast' && <ResonanceBroadcastSystem />}
                    {activeTab === 'sync' && <MarketplaceSynchronizationGrid />}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>GlowHub Admin OS v1.0 • God Mode Active</span>
                        <span>Last sync: {new Date().toLocaleTimeString('id-ID')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
