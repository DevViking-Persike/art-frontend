import { CoreParticle } from '../types';
import { project3D } from '../mathUtils';

export class CoreSphere {
    private particles: CoreParticle[] = [];
    private readonly NUM_CORE = 350;
    readonly BASE_RADIUS = 160;

    init() {
        this.particles = [];
        for (let i = 0; i < this.NUM_CORE; i++) {
            this.particles.push({
                theta: Math.random() * Math.PI * 2,
                phi: Math.acos((Math.random() * 2) - 1),
                baseRadius: this.BASE_RADIUS + (Math.random() - 0.5) * 45,
                pulse: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.05,
                hue: Math.random() > 0.7 ? 280 + Math.random() * 40 : 190 + Math.random() * 40,
                size: 0.8 + Math.random() * 1.5,
                orbitSpeed: (Math.random() - 0.5) * 0.012
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, time: number, rotX: number, rotY: number) {
        const projected = this.particles.map(p => {
            p.theta += p.orbitSpeed;
            p.pulse += p.speed;
            const pulseVal = (Math.sin(p.pulse) + 1) / 2;
            const breathe = Math.sin(time * 1.2) * 15;
            const r = (p.baseRadius + breathe) * scale;
            const proj = project3D(p.theta, p.phi, r, rotX, rotY, cx, cy);
            return { ...proj, pulse: pulseVal, hue: p.hue, size: p.size };
        });

        // Connections
        ctx.save();
        ctx.lineWidth = 0.5;
        const connectDist = 35 * scale;
        const distSqThresh = connectDist * connectDist;
        for (let i = 0; i < projected.length; i += 3) {
            const p1 = projected[i];
            if (p1.pulse < 0.2) continue;
            for (let j = i + 1; j < projected.length; j += 3) {
                const p2 = projected[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < distSqThresh) {
                    const alpha = (1 - Math.sqrt(distSq) / connectDist) * 0.3 * p1.pulse * p2.pulse;
                    if (alpha > 0.05) {
                        ctx.strokeStyle = `hsla(${(p1.hue + p2.hue) / 2}, 80%, 75%, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        }
        ctx.restore();

        // Particles sorted by depth
        projected.sort((a, b) => a.z - b.z);
        const maxR = this.BASE_RADIUS * scale;
        projected.forEach(p => {
            const depthScale = (p.z + maxR) / (2 * maxR);
            const size = (depthScale * p.size * 2.0 + p.pulse * 1.5) * scale;
            const alpha = 0.15 + depthScale * 0.85;

            ctx.save();
            ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
            ctx.fillStyle = p.pulse > 0.85 ? '#ffffff' : `hsl(${p.hue}, 90%, ${50 + p.pulse * 20}%)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}
