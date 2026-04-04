import { Wave } from '../types';

export class PulseWaves {
    private waves: Wave[] = [];
    private timer: number = 0;

    update(dt: number, scale: number) {
        this.timer += dt;
        if (this.timer > 1.5) {
            this.timer = 0;
            this.waves.push({
                radius: 0,
                maxRadius: 380 + Math.random() * 100,
                alpha: 0.4,
                hue: Math.random() > 0.5 ? 200 : 280,
                speed: 1.5 + Math.random() * 1.5,
                width: 1.5 + Math.random() * 2
            });
        }

        for (let i = this.waves.length - 1; i >= 0; i--) {
            const wave = this.waves[i];
            wave.radius += wave.speed * scale;
            wave.alpha -= 0.003;
            if (wave.alpha <= 0 || wave.radius > wave.maxRadius * scale) {
                this.waves.splice(i, 1);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
        this.waves.forEach(wave => {
            ctx.save();
            ctx.globalAlpha = wave.alpha * 0.3;
            ctx.strokeStyle = `hsl(${wave.hue}, 90%, 65%)`;
            ctx.lineWidth = wave.width;
            ctx.beginPath();
            ctx.arc(cx, cy, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });
    }
}
