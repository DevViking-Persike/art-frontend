export function drawTinyScrew(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((x + y) * 0.05);

    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2); ctx.fill();

    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, '#e0e0e0');
    g.addColorStop(1, '#616161');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#212121';
    ctx.fillRect(-r * 0.8, -r * 0.15, r * 1.6, r * 0.3);

    ctx.restore();
}

export function drawRubyPin(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#ffca28';
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = '#c62828'; ctx.stroke();

    const rG = ctx.createRadialGradient(-2, -2, 0, 0, 0, 6);
    rG.addColorStop(0, '#ff8a80');
    rG.addColorStop(0.3, '#d50000');
    rG.addColorStop(1, '#3e2723');
    ctx.fillStyle = rG;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(-2, -2, 1.5, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
}

export function drawScrewsOnRing(ctx: CanvasRenderingContext2D, radius: number, count: number, screwRadius: number) {
    for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        drawTinyScrew(ctx, x, y, screwRadius);
    }
}

export function drawGear(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, angle: number, color: string, teeth: number, skeletize: boolean) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const g = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
    g.addColorStop(0, '#ffffffaa');
    g.addColorStop(0.3, color);
    g.addColorStop(1, '#000000dd');

    ctx.fillStyle = g;

    ctx.beginPath();
    const innerR = radius * 0.85;
    for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        ctx.lineTo(Math.cos(a - 0.05) * innerR, Math.sin(a - 0.05) * innerR);
        ctx.lineTo(Math.cos(a - 0.02) * radius, Math.sin(a - 0.02) * radius);
        ctx.lineTo(Math.cos(a + 0.02) * radius, Math.sin(a + 0.02) * radius);
        ctx.lineTo(Math.cos(a + 0.05) * innerR, Math.sin(a + 0.05) * innerR);
    }
    ctx.closePath();

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (skeletize) {
        ctx.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * radius * 0.5, Math.sin(a) * radius * 0.5, radius * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';

        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * radius * 0.5, Math.sin(a) * radius * 0.5, radius * 0.25, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    ctx.restore();
}

export function drawEscapementWheel(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, angle: number, color: string, teeth: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        ctx.lineTo(Math.cos(a - 0.1) * (radius * 0.7), Math.sin(a - 0.1) * (radius * 0.7));
        ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
        ctx.lineTo(Math.cos(a + 0.1) * radius, Math.sin(a + 0.1) * radius);
        ctx.lineTo(Math.cos(a + 0.15) * (radius * 0.9), Math.sin(a + 0.15) * (radius * 0.9));
    }
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = '#5c4d1f'; ctx.stroke();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const sa = (i / 4) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sa) * radius * 0.7, Math.sin(sa) * radius * 0.7);
    }
    ctx.lineWidth = 4; ctx.stroke();

    ctx.restore();
}
