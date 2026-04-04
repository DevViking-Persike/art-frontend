import { Synapse } from '../types';
import { project3D } from '../mathUtils';

export class SynapseNetwork {
    private synapses: Synapse[] = [];

    init() {
        this.synapses = [];
        for (let i = 0; i < 15; i++) {
            this.synapses.push({
                startTheta: Math.random() * Math.PI * 2,
                startPhi: Math.acos((Math.random() * 2) - 1),
                endTheta: Math.random() * Math.PI * 2,
                endPhi: Math.acos((Math.random() * 2) - 1),
                life: Math.random(),
                maxLife: 0.8 + Math.random() * 0.8,
                active: Math.random() > 0.5,
                hue: Math.random() > 0.5 ? 190 : 300
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, dt: number, rotX: number, rotY: number, baseRadius: number) {
        this.synapses.forEach(s => {
            s.life += dt;
            if (s.life > s.maxLife) {
                s.life = 0;
                s.active = !s.active;
                s.startTheta = Math.random() * Math.PI * 2;
                s.startPhi = Math.acos((Math.random() * 2) - 1);
                s.endTheta = Math.random() * Math.PI * 2;
                s.endPhi = Math.acos((Math.random() * 2) - 1);
                s.hue = Math.random() > 0.3 ? 190 : 280;
            }
            if (!s.active) return;

            const fadeIn = Math.min(1, s.life * 5);
            const fadeOut = Math.max(0, 1 - (s.life / s.maxLife));
            const alpha = fadeIn * fadeOut;

            const r = baseRadius * scale;
            const p1 = project3D(s.startTheta, s.startPhi, r, rotX, rotY, cx, cy);
            const p2 = project3D(s.endTheta, s.endPhi, r, rotX, rotY, cx, cy);

            const mx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 40;
            const my = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 40;

            ctx.save();
            ctx.globalAlpha = alpha * 0.6;
            ctx.strokeStyle = `hsl(${s.hue}, 100%, 75%)`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
            ctx.stroke();

            ctx.globalAlpha = alpha * 0.9;
            ctx.fillStyle = `hsl(${s.hue}, 100%, 95%)`;
            ctx.beginPath();
            ctx.arc(mx, my, 1.5 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}
