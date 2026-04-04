export class Sky {
    private time: number = 0;

    drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
        this.time = time;
        // Deep neon midnight gospel cosmic void
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#10002b'); // deep cosmic indigo
        bg.addColorStop(0.4, '#240046'); // rich magenta-purple
        bg.addColorStop(0.8, '#3c096c'); // vivid violet
        bg.addColorStop(1, '#5a189a'); // glowing neon base
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
    }

    drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, stars: {x: number, y: number, r: number, b: number, s: number}[]) {
        // High density stars
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#ffffff';
        
        stars.forEach(star => {
            const py = star.y * h;
            const twinkle = (Math.sin(time * star.s + star.x * 100) + 1) / 2;
            const starAlpha = star.b * (0.3 + twinkle * 0.7);
            
            ctx.globalAlpha = starAlpha;
            ctx.beginPath();
            ctx.arc(star.x * w, py, star.r, 0, Math.PI * 2);
            ctx.fill();
            
            // "Fake" shadow blur using a low alpha larger circle for big stars
            if (star.r > 1.2) {
                ctx.globalAlpha = starAlpha * 0.4;
                ctx.beginPath();
                ctx.arc(star.x * w, py, star.r * 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();
    }

    drawBokeh(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
        // Massive out-of-focus magical lens flares (Bokeh)
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const colors = ['#f72585', '#7209b7', '#3a0ca3', '#4cc9f0', '#ffea00'];
        
        for (let i = 0; i < 20; i++) {
            const bx = (Math.sin(i * 13.3 + time * 0.1) * 0.6 + 0.5) * w;
            const by = (Math.cos(i * 7.7 + time * 0.15) * 0.6 + 0.5) * h;
            const size = 30 + (i % 6) * 40;
            const alpha = 0.05 + Math.sin(time * 0.5 + i) * 0.05;
            
            ctx.beginPath();
            ctx.arc(bx, by, size, 0, Math.PI * 2);
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fill();
        }
        ctx.restore();
    }
}
