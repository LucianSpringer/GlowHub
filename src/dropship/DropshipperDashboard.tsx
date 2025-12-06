// DropshipperDashboard.tsx - Main Dashboard Orchestrator
import { LogisticsCommandCenter } from './LogisticsCommandCenter';
import { FinancialYieldDashboard } from './FinancialYieldDashboard';
import { HighVelocityVault } from './HighVelocityVault';
import { CopywritingForge } from './CopywritingForge';
import { ViralVectorLinker } from './ViralVectorLinker';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';

interface DropshipperDashboardProps {
    onBack: () => void;
}

export const DropshipperDashboard = ({ onBack }: DropshipperDashboardProps) => {
    return (
        <div className="min-h-screen bg-slate-950 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-pink-500 to-orange-500 p-3 rounded-2xl shadow-lg shadow-pink-500/20">
                                <LayoutDashboard size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white">Dropshipper Command Center</h1>
                                <p className="text-sm text-slate-400">Enterprise-grade business intelligence</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-emerald-400">LIVE</span>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Operations */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Top Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <LogisticsCommandCenter />
                            <FinancialYieldDashboard />
                        </div>

                        {/* Fast Moving Products */}
                        <HighVelocityVault />
                    </div>

                    {/* Right Column - Marketing Tools */}
                    <div className="space-y-6">
                        <CopywritingForge />
                        <ViralVectorLinker />
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>GlowHub Dropshipper OS v2.0</span>
                        <span>Last sync: {new Date().toLocaleTimeString('id-ID')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
