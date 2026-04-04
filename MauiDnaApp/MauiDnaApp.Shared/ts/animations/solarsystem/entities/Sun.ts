export class Sun {
    draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, time: number) {
        const sunR = 30 * scale;
        const pulse = Math.sin(time * 1.5) * 3 * scale;

        // Outer halo
        const haloR = sunR + 40 * scale + pulse;
        const halo = ctx.createRadialGradient(cx, cy, sunR * 0.5, cx, cy, haloR);
        halo.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
        halo.addColorStop(0.4, 'rgba(255, 150, 20, 0.1)');
        halo.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Sun body
        const sunGrad = ctx.createRadialGradient(
            cx - sunR * 0.3, cy - sunR * 0.3, 0, cx, cy, sunR
        );
        sunGrad.addColorStop(0, '#fff8e0');
        sunGrad.addColorStop(0.3, '#ffdd44');
        sunGrad.addColorStop(0.7, '#ff9900');
        sunGrad.addColorStop(1, '#cc4400');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
        ctx.fill();

        // Solar flares
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 5; i++) {
            const a = time * 0.3 + (i / 5) * Math.PI * 2;
            const fx = cx + Math.cos(a) * sunR * 0.6;
            const fy = cy + Math.sin(a) * sunR * 0.6;
            const fr = sunR * (0.3 + Math.sin(time * 2 + i) * 0.1);
            const flareG = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
            flareG.addColorStop(0, '#ffffaa');
            flareG.addColorStop(1, 'transparent');
            ctx.fillStyle = flareG;
            ctx.beginPath();
            ctx.arc(fx, fy, fr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Label
        ctx.fillStyle = 'rgba(255, 220, 100, 0.5)';
        ctx.font = `${10 * scale}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('☀ SOL', cx, cy + sunR + 16 * scale);
    }
}
