export class PlasmaGauge {
    draw(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, thrustRatio: number, state: 'idle' | 'charging' | 'max' | 'cooldown') {
        const gw = Math.min(120, w * 0.1);
        const gh = Math.min(500, h * 0.6);
        const gx = w / 2 - gw / 2;
        const gy = h / 2 - gh / 2;

        ctx.save();
        
        // Glitch calculations for Max Power
        let ox = 0;
        let oy = 0;
        if (state === 'max' || thrustRatio > 0.95) {
            // Intense jitter
            ox = (Math.random() - 0.5) * 8;
            oy = (Math.random() - 0.5) * 8;
            ctx.translate(ox, oy);
        }

        // 1. Futuristic Tech Background Casing
        ctx.fillStyle = 'rgba(0, 5, 20, 0.8)';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.fillRect(gx, gy, gw, gh);
        
        // Outer tech frame
        ctx.beginPath();
        ctx.rect(gx - 10, gy - 10, gw + 20, gh + 20);
        ctx.moveTo(gx - 20, gy + 20); ctx.lineTo(gx - 10, gy + 10);
        ctx.moveTo(gx + gw + 20, gy + gh - 20); ctx.lineTo(gx + gw + 10, gy + gh - 10);
        ctx.stroke();

        // Warning Stripes around border
        ctx.strokeStyle = '#ff003c'; // Cyberpunk red/magenta
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 15]);
        ctx.strokeRect(gx - 25, gy - 25, gw + 50, gh + 50);
        ctx.setLineDash([]);

        // 2. Fragmented Neon Plasma Fill
        // Dynamic color: Cyan -> Yellow -> Intense Neon Red
        let mainColor = '#00ffff'; // Electric Cyan
        let secondaryColor = '#0077ff';
        if (thrustRatio > 0.6) {
            mainColor = '#ffea00'; // Warning Yellow
            secondaryColor = '#ff5500';
        }
        if (thrustRatio > 0.9) {
            mainColor = '#ff003c'; // Critical Red
            secondaryColor = '#ff00ff'; // Hot Magenta
        }

        const segments = 30;
        const segH = gh / segments;
        const fillSegments = Math.floor(thrustRatio * segments);

        // Render each block of plasma
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < fillSegments; i++) {
            // Draw from bottom up
            const sy = gy + gh - (i + 1) * segH;
            
            // Jitter blocks at high thrust
            const blockOx = (thrustRatio > 0.8) ? (Math.random() - 0.5) * (thrustRatio * 15) : 0;
            
            ctx.fillStyle = (i % 5 === 0) ? '#ffffff' : mainColor;
            ctx.globalAlpha = 0.8 + Math.random() * 0.2; // pulse
            
            ctx.beginPath();
            ctx.rect(gx + 5 + blockOx, sy + 2, gw - 10, segH - 4);
            ctx.fill();
            
            // Core bright line
            if (thrustRatio > 0.3) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(gx + gw / 2 - 5 + blockOx, sy + 2, 10, segH - 4);
            }
        }

        // 3. Digital HUD Overlays
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = mainColor;
        ctx.font = 'bold 24px "Courier New"';
        ctx.textAlign = 'center';
        
        // Status Text
        let statusText = 'SYSTEM IDLE [ HOLD TO OVERRIDE ]';
        if (state === 'charging') statusText = 'ENGAGING THRUSTER CORE...';
        if (state === 'max') statusText = '/// CRITICAL OVERLOAD ///';
        if (state === 'cooldown') statusText = 'VENTING PLASMA REFUSAL...';

        // Chromatic aberration glitch text function
        const drawGlitchText = (txt: string, cx: number, cy: number, doGlitch: boolean) => {
            if (doGlitch && Math.random() > 0.5) {
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = '#00ffff'; ctx.fillText(txt, cx - 2, cy); // Cyan shift
                ctx.fillStyle = '#ff00ff'; ctx.fillText(txt, cx + 2, cy); // Magenta shift
                ctx.globalCompositeOperation = 'source-over';
            }
            ctx.fillStyle = '#ffffff';
            ctx.fillText(txt, cx, cy);
        };

        ctx.font = 'bold 35px "Courier New"';
        drawGlitchText(`THRUST: ${Math.floor(thrustRatio * 100)}%`, w / 2, gy - 60, thrustRatio > 0.8);
        
        ctx.font = '16px "Courier New"';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(statusText, w / 2, gy - 20);

        // Sidebar details
        ctx.textAlign = 'right';
        ctx.font = '14px "Courier New"';
        ctx.fillStyle = '#00ffff';
        ctx.fillText('TEMP: ' + Math.floor(25 + thrustRatio * 400) + '°C', gx - 40, gy + gh);
        ctx.fillText('PRES: ' + (thrustRatio * 10.5).toFixed(2) + ' BAR', gx - 40, gy + gh - 20);

        ctx.restore();
    }
}
