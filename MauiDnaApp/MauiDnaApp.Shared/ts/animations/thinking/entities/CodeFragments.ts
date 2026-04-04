import { Fragment } from '../types';
import { FRAG_TEXTS } from '../data';

export class CodeFragments {
    private fragments: Fragment[] = [];

    init() {
        this.fragments = [];
        for (let i = 0; i < 35; i++) {
            this.fragments.push({
                x: Math.random(),
                y: Math.random(),
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                text: FRAG_TEXTS[Math.floor(Math.random() * FRAG_TEXTS.length)],
                alpha: Math.random(),
                fadeSpeed: 0.005 + Math.random() * 0.015,
                size: 10 + Math.random() * 6
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number, dt: number) {
        ctx.save();
        ctx.font = `${11 * scale}px "Courier New", monospace`;
        ctx.textAlign = 'center';

        this.fragments.forEach(f => {
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            f.alpha += f.fadeSpeed;

            if (f.x < -0.1) f.x = 1.1;
            if (f.x > 1.1) f.x = -0.1;
            if (f.y < -0.1) f.y = 1.1;
            if (f.y > 1.1) f.y = -0.1;

            const dist = Math.sqrt((f.x - 0.5) ** 2 + (f.y - 0.5) ** 2);
            const fadeByDist = dist < 0.2 ? 0 : Math.min(1, (dist - 0.2) * 2.5);
            const alphaVal = Math.sin(f.alpha) * 0.5 + 0.5;

            ctx.globalAlpha = alphaVal * fadeByDist * 0.4;
            ctx.fillStyle = `hsl(${200 + Math.sin(f.alpha) * 40}, 80%, 70%)`;
            ctx.fillText(f.text, f.x * width, f.y * height);
        });
        ctx.restore();
    }
}
