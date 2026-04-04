export class CyberGrid {
    draw(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, thrustRatio: number) {
        // Deep cyber background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#05010a'); // absolute dark purple
        bgGrad.addColorStop(0.5, '#0f0524'); // deep magenta
        bgGrad.addColorStop(1, '#001a1a'); // dark cyan
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.translate(w / 2, h * 0.75); // Horizon line lower down
        
        // Dynamic speed based on thrust
        const speed = time * (0.05 + thrustRatio * 0.2); 
        const spacing = 60;
        
        ctx.strokeStyle = '#e01e69'; // Synthwave neon pink/magenta
        ctx.lineWidth = 2;
        ctx.globalCompositeOperation = 'screen';
        
        // Draw perspective grid
        // Horizontal lines (moving forward)
        for (let i = 1; i < 20; i++) {
            let offset = (i * spacing - speed) % (spacing * 1);
            if (offset < 0) offset += spacing;
            const y = Math.pow(offset * 0.05, 2) * 5; // Perspective curve
            
            // Fade out near horizon
            const alpha = Math.min(1, y / 300);
            ctx.globalAlpha = alpha * 0.5 * (1 + thrustRatio);
            
            ctx.beginPath();
            ctx.moveTo(-w, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Vertical converging lines
        ctx.globalAlpha = 0.4 * (1 + thrustRatio);
        for (let i = -20; i <= 20; i++) {
            const x = i * spacing * 1.5;
            ctx.beginPath();
            ctx.moveTo(0, 0); // converge at horizon
            ctx.lineTo(x * 4, h); // fan out to bottom
            ctx.stroke();
        }

        // Horizon glow (Cyan & Magenta split)
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'lighter';
        const horizonGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, w * 0.8);
        horizonGlow.addColorStop(0, `rgba(0, 255, 255, ${0.4 + thrustRatio * 0.4})`); // Cyan
        horizonGlow.addColorStop(0.3, `rgba(255, 0, 128, ${0.2 + thrustRatio * 0.3})`); // Magenta
        horizonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = horizonGlow;
        ctx.beginPath();
        ctx.rect(-w, -h*0.75, w*2, h*1.5);
        ctx.fill();

        ctx.restore();
    }
}
