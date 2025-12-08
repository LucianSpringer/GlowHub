// PartnerTierMatrix.tsx - Gamified Tier Management
import { useState } from 'react';
import { Users, Award, RefreshCw, ChevronRight } from 'lucide-react';
import {
    TIER_CONFIG,
    simulateTierDistribution,
    type TierDefinition,
    type DropshipperProfile
} from '../../engines/TierSegmentationProtocol';

// Mock Data for Simulation
const MOCK_PROFILES: DropshipperProfile[] = Array.from({ length: 250 }, (_, i) => ({
    id: `DS-${i}`,
    totalSalesAmount: Math.random() * 50000000, // 0 - 50jt
    transactionCount: Math.floor(Math.random() * 50),
    daysSinceLastSale: Math.floor(Math.random() * 30),
    joinDate: Date.now(),
    currentTier: 'SILVER'
}));

export const PartnerTierMatrix = () => {
    const [configs, setConfigs] = useState<TierDefinition[]>(TIER_CONFIG);
    const [distribution, setDistribution] = useState(simulateTierDistribution(MOCK_PROFILES, TIER_CONFIG));
    const [isSimulating, setIsSimulating] = useState(false);

    const handleRecalculate = () => {
        setIsSimulating(true);
        // Simulate "thinking" delay
        setTimeout(() => {
            const newDist = simulateTierDistribution(MOCK_PROFILES, configs);
            setDistribution(newDist);
            setIsSimulating(false);
        }, 800);
    };

    const updateConfig = (tierIndex: number, field: keyof TierDefinition, value: string | number) => {
        const newConfigs = [...configs];
        newConfigs[tierIndex] = { ...newConfigs[tierIndex], [field]: value };
        setConfigs(newConfigs);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Award className="text-purple-600" size={18} />
                    <h3 className="font-bold text-slate-800 text-sm">Tier Configuration</h3>
                </div>
                <button
                    onClick={handleRecalculate}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSimulating
                        ? 'bg-slate-200 text-slate-400'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                >
                    <RefreshCw size={12} className={isSimulating ? 'animate-spin' : ''} />
                    {isSimulating ? 'Simulating...' : 'Recalculate Distribution'}
                </button>
            </div>

            <div className="divide-y divide-slate-100">
                {configs.map((tier, idx) => {
                    const count = distribution[tier.tier];
                    const percent = ((count / MOCK_PROFILES.length) * 100).toFixed(1);

                    return (
                        <div key={tier.tier} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                            {/* Tier Badge */}
                            <div className="col-span-3 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${tier.tier === 'PLATINUM' ? 'bg-gradient-to-br from-slate-700 to-black text-white' :
                                    tier.tier === 'GOLD' ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white' :
                                        'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-600'
                                    }`}>
                                    {tier.tier[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{tier.tier}</div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Users size={10} /> {count} Users ({percent}%)
                                    </div>
                                </div>
                            </div>

                            {/* Threshold Control */}
                            <div className="col-span-4">
                                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                                    Min Score
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={tier.minScore}
                                        onChange={(e) => updateConfig(idx, 'minScore', parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 text-xs border border-slate-200 rounded focus:border-indigo-500 outline-none font-mono"
                                    />
                                    <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, tier.minScore)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Benefit Control */}
                            <div className="col-span-4">
                                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                                    Margin Bonus
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        +{tier.marginBonus}%
                                    </span>
                                    <span className="text-[10px] text-slate-400">on top of base</span>
                                </div>
                            </div>

                            {/* Expand */}
                            <div className="col-span-1 text-right">
                                <ChevronRight size={16} className="text-slate-300 inline-block" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total Summary */}
            <div className="bg-slate-50 p-3 text-center border-t border-slate-200">
                <p className="text-[10px] text-slate-500">
                    Total Ecosystem Value: <span className="font-mono font-bold text-slate-700">250 Dropshippers</span>
                </p>
            </div>
        </div>
    );
};
