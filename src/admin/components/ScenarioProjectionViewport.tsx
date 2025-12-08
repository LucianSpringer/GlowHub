// ScenarioProjectionViewport.tsx - The Crystal Ball
import { useEffect, useRef, useState, useMemo } from 'react';
import { generateScenarios, type HistoricalDatapoint } from '../../engines/RevenueForecastingAlgorithm';

export const ScenarioProjectionViewport = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Mock Historical Data (Last 30 Days)
    const [history] = useState<HistoricalDatapoint[]>(() =>
        Array.from({ length: 30 }, (_, i) => {
            void _;
            return {
                timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
                revenue: 1000000 + (i * 50000) + (Math.random() * 200000) // Upward trend
            };
        })
    );

    const scenarios = useMemo(() => generateScenarios(history, 30), [history]);

    useEffect(() => {
        if (!canvasRef.current || !scenarios) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        const padding = 20;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate scales
        const allPoints = [
            ...history,
            ...scenarios.OPTIMISTIC.points,
            ...scenarios.BASELINE.points,
            ...scenarios.PESSIMISTIC.points
        ];

        const minRevenue = Math.min(...allPoints.map(p => p.revenue));
        const maxRevenue = Math.max(...allPoints.map(p => p.revenue));
        const minTime = allPoints[0].timestamp;
        const maxTime = allPoints[allPoints.length - 1].timestamp;

        const getX = (t: number) => padding + ((t - minTime) / (maxTime - minTime)) * (width - 2 * padding);
        const getY = (r: number) => height - padding - ((r - minRevenue) / (maxRevenue - minRevenue)) * (height - 2 * padding);

        // Helper to draw lines
        const drawLine = (points: { timestamp: number, revenue: number }[], color: string, dash: number[] = []) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash(dash);
            points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(getX(p.timestamp), getY(p.revenue));
                else ctx.lineTo(getX(p.timestamp), getY(p.revenue));
            });
            ctx.stroke();
            ctx.setLineDash([]);
        };

        // Draw Historical (Solid Grey)
        drawLine(history, '#94a3b8');

        // Draw Scenarios
        // Optimistic (Green Dotted)
        drawLine(scenarios.OPTIMISTIC.points, '#22c55e', [5, 3]);

        // Baseline (Blue Solid)
        drawLine(scenarios.BASELINE.points, '#3b82f6');

        // Pessimistic (Red Dotted)
        drawLine(scenarios.PESSIMISTIC.points, '#ef4444', [5, 3]);

        // Draw "Now" Line
        const nowX = getX(history[history.length - 1].timestamp);
        ctx.beginPath();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.moveTo(nowX, padding);
        ctx.lineTo(nowX, height - padding);
        ctx.stroke();

        // Labels
        ctx.font = '10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('NOW', nowX - 10, height - 5);

    }, [history, scenarios]);

    return (
        <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg border border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-sm text-slate-100 mb-1">Scenario Projection</h4>
                    <p className="text-[10px] text-slate-400">AI Forecast (30 Days)</p>
                </div>
                <div className="flex gap-3 text-[10px]">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-400">Bull (+{scenarios.OPTIMISTIC.growthRate.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-blue-400">Base (+{scenarios.BASELINE.growthRate.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-red-400">Bear ({scenarios.PESSIMISTIC.growthRate.toFixed(1)}%)</span>
                    </div>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={500}
                height={200}
                className="w-full h-40 bg-slate-800/50 rounded-lg"
            />
        </div>
    );
};
