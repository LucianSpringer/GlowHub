// ProfitArchitectureConsole.tsx - Profit Intelligence Hub (V2.0)
import { useState } from 'react';
import { LayoutGrid, TrendingUp, Settings } from 'lucide-react';

// Sub-Modules
import { MarginSensitivitySimulator } from './components/MarginSensitivitySimulator';
import { PartnerTierMatrix } from './components/PartnerTierMatrix';
import { ScenarioProjectionViewport } from './components/ScenarioProjectionViewport';
import { SupplyChainStack } from './components/SupplyChainStack';
import { DeviationWatchdogPanel } from './components/DeviationWatchdogPanel';

export const ProfitArchitectureConsole = () => {
    // Global State for the Console
    const [ownerMargin, setOwnerMargin] = useState(15);
    const [dropshipperMargin, setDropshipperMargin] = useState(25);
    const [activeTab, setActiveTab] = useState<'CONTROLS' | 'TIERS'>('CONTROLS');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
                        <LayoutGrid size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">Profit Intelligence Hub</h3>
                        <p className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">V2.0 • Dynamic Loop Active</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('CONTROLS')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'CONTROLS' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <TrendingUp size={14} className="inline mr-1" /> Strategy
                    </button>
                    <button
                        onClick={() => setActiveTab('TIERS')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'TIERS' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Settings size={14} className="inline mr-1" /> Governance
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 p-6 bg-slate-50/50">
                <div className="grid grid-cols-12 gap-6 h-full">

                    {/* LEFT COLUMN (Input & Simulation) */}
                    <div className="col-span-8 space-y-6">
                        {activeTab === 'CONTROLS' ? (
                            <>
                                <div className="grid grid-cols-2 gap-6">
                                    <MarginSensitivitySimulator
                                        currentMargin={ownerMargin}
                                        onChange={setOwnerMargin}
                                        velocityScores={145} // Avg orders/day
                                    />
                                    <MarginSensitivitySimulator
                                        currentMargin={dropshipperMargin}
                                        onChange={setDropshipperMargin}
                                        velocityScores={320} // Reseller enthusiasm proxy
                                    />
                                </div>
                                <ScenarioProjectionViewport />
                                <DeviationWatchdogPanel />
                            </>
                        ) : (
                            <PartnerTierMatrix />
                        )}
                    </div>

                    {/* RIGHT COLUMN (Visualization Stack) */}
                    <div className="col-span-4 h-full">
                        <SupplyChainStack
                            supplierCost={55000} // Mock Avg Supplier Cost
                            ownerMarginPercent={ownerMargin}
                            resellerMarginPercent={activeTab === 'TIERS' ? 20 : dropshipperMargin} // Show base if in Tier mode
                            marketCap={95000} // Mock Market Ceiling
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
