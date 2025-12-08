// DropshipperDashboard.tsx - Main Dashboard Orchestrator (Light Theme Default)
import { useState } from 'react';
import { LogisticsCommandCenter } from './LogisticsCommandCenter';
import { FinancialYieldDashboard } from './FinancialYieldDashboard';
import { HighVelocityVault } from './HighVelocityVault';
import { CopywritingForge } from './CopywritingForge';
import { ViralVectorLinker } from './ViralVectorLinker';
import { MarginOptimizerWidget } from './MarginOptimizerWidget';
import { LayoutDashboard, ArrowLeft, Sun, Moon } from 'lucide-react';

interface DropshipperDashboardProps {
    onBack: () => void;
}

export const DropshipperDashboard = ({ onBack }: DropshipperDashboardProps) => {
    const [isDark, setIsDark] = useState(false);

    return (
        <div className={`min-h-screen pt-20 pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-slate-50 text-slate-600 shadow-sm'}`}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-pink-500 to-orange-500 p-3 rounded-2xl shadow-lg shadow-pink-500/20">
                                <LayoutDashboard size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Dropshipper Command Center</h1>
                                <p className="text-sm text-slate-500">Enterprise-grade business intelligence</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 shadow-sm'}`}
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-emerald-500">LIVE</span>
                        </div>
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
                    <div className="space-y-6 h-full flex flex-col">
                        <CopywritingForge />
                        <ViralVectorLinker />
                        <MarginOptimizerWidget />
                    </div>
                </div>

                {/* Footer Stats */}
                <div className={`mt-8 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>GlowHub Dropshipper OS v2.0</span>
                        <span>Last sync: {new Date().toLocaleTimeString('id-ID')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};