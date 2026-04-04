import { Star } from '../types';

export class Starfield {
    private stars: Star[] = [];

    generate(count: number = 600) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random(),
                r: Math.random() * 1.5 + 0.3,
                brightness: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.5 + Math.random() * 2
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];
            const twinkle = (Math.sin(time * s.twinkleSpeed + i) + 1) * 0.5;
            ctx.globalAlpha = s.brightness * (0.5 + twinkle * 0.5);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(s.x * width, s.y * height, s.r, s.r);
        }
        ctx.globalAlpha = 1;
    }
}
