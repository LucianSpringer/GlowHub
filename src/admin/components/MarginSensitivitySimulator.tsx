// MarginSensitivitySimulator.tsx - Smart Slider with Impact Prediction
import { useState, useRef } from 'react';
import { Info, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { type PricingSensors } from '../../engines/YieldOptimizationKernel';

interface MarginSensitivitySimulatorProps {
    currentMargin: number;
    onChange: (newMargin: number) => void;
    velocityScores: number; // Avg Daily Sales
}

export const MarginSensitivitySimulator = ({
    currentMargin,
    onChange,
    velocityScores
}: MarginSensitivitySimulatorProps) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const sliderRef = useRef<HTMLInputElement>(null);

    // Mock sensors for future real-time feedback
    const sensors: PricingSensors = {
        averageVelocity: velocityScores,
        currentROI: 15,
        inventoryLevel: 500
    };

    // Silence linter for mock data
    void setHoverValue;
    void sensors;

    // Calculate prediction based on hover or current value
    const activeValue = hoverValue ?? currentMargin;

    // Simple elasticity simulation for tooltip
    // If margin goes UP, Velocity goes DOWN
    // Elasticity: 1% margin increase = 1.2% velocity drop
    const calculateImpact = (margin: number) => {
        const baseVelocity = velocityScores;
        const marginResults = margin - 10; // Baseline 10%
        const velocityChangePercent = marginResults * -1.2;
        const predictedVelocity = baseVelocity * (1 + velocityChangePercent / 100);

        return {
            velocityChangePercent,
            predictedVelocity: Math.max(0, predictedVelocity)
        };
    };

    const impact = calculateImpact(activeValue);

    // Dynamic Color for Slider Track (Heatmap)
    // Red (High Risk) -> Green (Optimal) -> Red (Greedy)
    const getTrackGradient = () => {
        return `linear-gradient(to right, 
            #ef4444 0%, 
            #f97316 20%, 
            #22c55e 50%, 
            #f97316 80%, 
            #ef4444 100%)`;
    };

    return (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        Margin Sensitivity
                        <Info size={14} className="text-slate-400 cursor-help" />
                    </h4>
                    <p className="text-[10px] text-slate-500">Adjust margin to see volume impact</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-purple-600">
                        {activeValue}%
                    </div>
                    {impact.velocityChangePercent !== 0 && (
                        <div className={`text-[10px] font-bold flex items-center justify-end gap-1 ${impact.velocityChangePercent < 0 ? 'text-red-500' : 'text-emerald-500'
                            }`}>
                            {impact.velocityChangePercent < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                            {Math.abs(impact.velocityChangePercent).toFixed(1)}% Vol.
                        </div>
                    )}
                </div>
            </div>

            <div className="relative h-12 flex items-center">
                {/* Heatmap Background */}
                <div
                    className="absolute w-full h-2 rounded-full opacity-30"
                    style={{ background: getTrackGradient() }}
                />

                <input
                    ref={sliderRef}
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={currentMargin}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    onMouseEnter={() => { }} // Add logic if needed
                    onMouseMove={() => {
                        // Calculate hover value approximation logic could go here
                        // For now we just use the actual value interactions
                    }}
                    className="w-full h-2 bg-transparent appearance-none cursor-pointer z-10 relative [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
                />

                {/* Optimal Marker */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-1">
                    <div className="w-0.5 h-4 bg-emerald-500 rounded-full" />
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-600">
                        AI
                    </span>
                </div>
            </div>

            {/* AI Insight Box */}
            <div className="mt-3 bg-white border border-slate-100 rounded-lg p-3 flex  items-start gap-3 shadow-sm">
                <div className={`mt-0.5 p-1 rounded-full ${impact.velocityChangePercent < -10 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    {impact.velocityChangePercent < -10 ? <AlertTriangle size={14} /> : <TrendingUp size={14} />}
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-700">Impact Prediction</div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        {impact.velocityChangePercent < -10
                            ? `High Churn Risk! Increasing margin to ${activeValue}% is predicted to drop sales volume by ${Math.abs(impact.velocityChangePercent).toFixed(1)}%. Revenue may decrease.`
                            : `Safe Zone. Current setting maintains healthy volume (${Math.round(impact.predictedVelocity)} units/day) while capturing value.`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};
