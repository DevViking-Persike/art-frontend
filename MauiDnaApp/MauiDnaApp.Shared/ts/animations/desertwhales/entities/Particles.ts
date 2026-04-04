import { DustMote, SpiritOrb } from '../types';

export class Particles {
    private dust: DustMote[] = [];
    private orbs: SpiritOrb[] = [];

    init(w: number, h: number) {
        this.dust = [];
        for (let i = 0; i < 80; i++) {
            this.dust.push({
                x: Math.random() * w,
                y: h * 0.5 + Math.random() * h * 0.5,
                size: 0.5 + Math.random() * 2,
                alpha: 0.1 + Math.random() * 0.3,
                vx: 0.1 + Math.random() * 0.3,
                vy: -0.05 - Math.random() * 0.1,
                twinkle: Math.random() * Math.PI * 2
            });
        }

        this.orbs = [];
        for (let i = 0; i < 12; i++) {
            this.orbs.push({
                x: Math.random() * w,
                y: h * 0.15 + Math.random() * h * 0.45,
                radius: 2 + Math.random() * 5,
                alpha: 0.1 + Math.random() * 0.2,
                speed: 0.2 + Math.random() * 0.4,
                phase: Math.random() * Math.PI * 2,
                hue: 180 + Math.random() * 80
            });
        }
    }

    update(dt: number, w: number, h: number) {
        this.dust.forEach(d => {
            d.x += d.vx;
            d.y += d.vy;
            d.twinkle += 0.02;
            if (d.x > w + 10) d.x = -10;
            if (d.y < h * 0.5) d.y = h;
        });

        this.orbs.forEach(orb => {
            orb.phase += 0.01;
            orb.x += Math.sin(orb.phase * 0.7) * orb.speed;
            orb.y += Math.cos(orb.phase) * orb.speed * 0.3;
            if (orb.x > w + 20) orb.x = -20;
            if (orb.x < -20) orb.x = w + 20;
        });
    }

    drawDust(ctx: CanvasRenderingContext2D) {
        this.dust.forEach(d => {
            const twinkle = (Math.sin(d.twinkle) + 1) / 2;
            ctx.globalAlpha = d.alpha * (0.5 + twinkle * 0.5);
            ctx.fillStyle = '#ffddaa';
            ctx.fillRect(d.x, d.y, d.size, d.size);
        });
        ctx.globalAlpha = 1;
    }

    drawOrbs(ctx: CanvasRenderingContext2D) {
        this.orbs.forEach(orb => {
            const pulse = (Math.sin(orb.phase * 2) + 1) / 2;
            ctx.save();
            ctx.globalAlpha = orb.alpha * (0.5 + pulse * 0.5);
            const orbGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * (1 + pulse * 0.5));
            orbGrad.addColorStop(0, `hsla(${orb.hue}, 70%, 90%, 0.8)`);
            orbGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius * (1 + pulse * 0.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}
