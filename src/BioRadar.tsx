import React, { useEffect, useRef } from 'react';
import { SkinVector } from './useBioMatrix';

interface BioRadarProps {
    mask: number;
    width?: number;
    height?: number;
}

export const BioRadar: React.FC<BioRadarProps> = ({ mask, width = 300, height = 300 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // HIGH YIELD LOGIC: Trigonometric State Mapping
        const vectors = Object.keys(SkinVector).filter(k => isNaN(Number(k)));
        const total = vectors.length;
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(cx, cy) - 40;

        let animationFrameId: number;
        let t = 0;

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Web (Static Geometry)
            ctx.strokeStyle = '#e2e8f0'; // slate-200
            ctx.lineWidth = 1;
            for (let i = 1; i <= 4; i++) {
                ctx.beginPath();
                for (let j = 0; j <= total; j++) {
                    const angle = (Math.PI * 2 * j) / total - Math.PI / 2;
                    const r = (radius / 4) * i;
                    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
                }
                ctx.stroke();
            }

            // Draw Data Polygon (Dynamic State)
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 107, 157, 0.2)'; // #FF6B9D (Brand)
            ctx.strokeStyle = '#FF6B9D';
            ctx.lineWidth = 2;

            const vertices: [number, number][] = [];

            vectors.forEach((key, index) => {
                const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
                const flag = (SkinVector as any)[key];
                const isActive = (mask & flag) === flag;

                // Animate magnitude based on bitwise state
                const baseMag = isActive ? 1.0 : 0.2;
                const pulse = isActive ? Math.sin(t * 0.1) * 0.05 : 0;
                const r = radius * (baseMag + pulse);

                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                vertices.push([x, y]);

                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                // Draw Axis Labels
                if (isActive) {
                    ctx.font = '10px monospace';
                    ctx.fillStyle = '#be123c'; // rose-700
                    ctx.fillText(key, x + (x > cx ? 10 : -40), y);
                }
            });

            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Draw Vertex Nodes
            vertices.forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.stroke();
            });

            t++;
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mask, width, height]);

    return <canvas ref={canvasRef} width={width} height={height} className="mx-auto" />;
};
