// useProfitChart.ts - Canvas Chart Hook (Extracted for Purity)
import { useEffect, type RefObject } from 'react';
import type { DailyDataPoint } from '../engines/MarginVelocityEngine';

export const useProfitChart = (
    canvasRef: RefObject<HTMLCanvasElement | null>,
    data: DailyDataPoint[]
) => {
    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;

        ctx.clearRect(0, 0, width, height);

        // Find max value for scaling
        const maxProfit = Math.max(...data.map(d => d.profit));
        const maxCogs = Math.max(...data.map(d => d.cogs));
        const maxVal = Math.max(maxProfit, maxCogs) * 1.2;

        const xStep = (width - padding * 2) / (data.length - 1 || 1);

        // Draw grid lines
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + ((height - padding * 2) / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw COGS line (red)
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        data.forEach((d, i) => {
            const x = padding + i * xStep;
            const y = height - padding - (d.cogs / maxVal) * (height - padding * 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw Profit line (green)
        ctx.beginPath();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        data.forEach((d, i) => {
            const x = padding + i * xStep;
            const y = height - padding - (d.profit / maxVal) * (height - padding * 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw points
        data.forEach((d, i) => {
            const x = padding + i * xStep;
            const yProfit = height - padding - (d.profit / maxVal) * (height - padding * 2);

            ctx.beginPath();
            ctx.arc(x, yProfit, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e';
            ctx.fill();
        });

    }, [data, canvasRef]);
};
