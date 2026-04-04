import { BaseRenderer } from '../../core/BaseRenderer';
import { drawTinyScrew, drawRubyPin, drawScrewsOnRing, drawGear, drawEscapementWheel } from './entities/MechanicalParts';

export class PocketWatchRenderer extends BaseRenderer {
    private TICK_HZ = 5;
    private startTime: number = 0;

    protected init(): void {
        this.startTime = Date.now();
    }

    protected render(dt: number, time: number): void {
        const ctx = this.ctx;
        const now = Date.now();
        const loopDuration = 60000;
        const elapsedTotal = now - this.startTime;
        const elapsed = (elapsedTotal % loopDuration) / 1000;

        const totalTicks = Math.floor(elapsed * this.TICK_HZ);
        const tickCycle = (elapsed * this.TICK_HZ) % 1;

        const vibrationIntensity = Math.max(0, 1 - tickCycle * 15);
        const vibX = (Math.random() - 0.5) * vibrationIntensity * 1.5;
        const vibY = (Math.random() - 0.5) * vibrationIntensity * 1.5;

        const bgGrad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(this.width, this.height));
        bgGrad.addColorStop(0, '#151000');
        bgGrad.addColorStop(1, '#050200');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = '#ffb300';
        const gridSpc = 50;
        for (let i = 0; i < this.width; i += gridSpc) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, this.height); ctx.stroke(); }
        for (let j = 0; j < this.height; j += gridSpc) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(this.width, j); ctx.stroke(); }
        ctx.restore();

        ctx.save();
        const scale = Math.min(this.width, this.height) / 850;
        ctx.translate(this.width / 2, this.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(vibX, vibY);

        this.drawOuterCase(ctx);
        this.drawMovement(ctx, elapsed, totalTicks, tickCycle);
        this.drawDialRing(ctx);
        this.drawHands(ctx, elapsed, totalTicks);
        this.drawGlass(ctx);

        ctx.restore();
    }

    private drawOuterCase(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(0, -360);

        const crownG = ctx.createLinearGradient(-35, 0, 35, 0);
        crownG.addColorStop(0, '#795548');
        crownG.addColorStop(0.2, '#d7ccc8');
        crownG.addColorStop(0.5, '#ffd54f');
        crownG.addColorStop(0.8, '#a1887f');
        crownG.addColorStop(1, '#4e342e');

        ctx.fillStyle = crownG;
        ctx.beginPath();
        ctx.roundRect(-30, -30, 60, 40, 5);
        ctx.fill();

        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        for (let i = -24; i <= 24; i += 6) {
            ctx.beginPath(); ctx.moveTo(i, -30); ctx.lineTo(i, 10); ctx.stroke();
        }

        ctx.strokeStyle = '#bcaaa4';
        ctx.lineWidth = 12;
        ctx.beginPath(); ctx.arc(0, -35, 35, 0, Math.PI, true); ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -35, 30, 0, Math.PI, true); ctx.stroke();

        ctx.restore();

        const caseRadius = 370;
        const caseG = ctx.createRadialGradient(-100, -100, caseRadius * 0.5, 0, 0, caseRadius * 1.1);
        caseG.addColorStop(0, '#efebe9');
        caseG.addColorStop(0.3, '#8d6e63');
        caseG.addColorStop(0.7, '#4e342e');
        caseG.addColorStop(1, '#212121');

        ctx.beginPath(); ctx.arc(0, 0, caseRadius, 0, Math.PI * 2);
        ctx.fillStyle = caseG; ctx.fill();

        ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2);
        ctx.lineWidth = 4; ctx.strokeStyle = '#261914'; ctx.stroke();

        drawScrewsOnRing(ctx, 355, 6, 6);
    }

    private drawMovement(ctx: CanvasRenderingContext2D, elapsed: number, totalTicks: number, tickCycle: number) {
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2); ctx.clip();

        ctx.fillStyle = '#1c1c1c';
        ctx.fill();

        ctx.strokeStyle = '#2b2b2b';
        ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
            ctx.beginPath(); ctx.arc(0, 0, i * 15, 0, Math.PI * 2); ctx.stroke();
        }

        drawGear(ctx, -80, -90, 140, (elapsed / 60) * Math.PI * 2, '#424242', 40, true);
        drawRubyPin(ctx, -80, -90);

        drawGear(ctx, 110, 80, 100, -(elapsed / 15) * Math.PI * 2, '#8d6e63', 24, true);
        drawRubyPin(ctx, 110, 80);

        drawGear(ctx, 0, 0, 80, (elapsed / 60) * Math.PI * 6, '#bcaaa4', 20, false);
        drawRubyPin(ctx, 0, 0);

        this.drawEscapementSystem(ctx, -120, 140, elapsed, totalTicks, tickCycle);
        this.drawBridge(ctx);

        ctx.restore();
    }

    private drawEscapementSystem(ctx: CanvasRenderingContext2D, x: number, y: number, elapsed: number, totalTicks: number, tickCycle: number) {
        ctx.save();
        ctx.translate(x, y);

        const teeth = 15;
        const smoothTick = totalTicks + Math.pow(tickCycle, 0.4);

        ctx.save();
        ctx.translate(60, -60);
        const escapeRotation = (smoothTick / teeth) * Math.PI * 2;
        drawEscapementWheel(ctx, 0, 0, 50, escapeRotation, '#ffd54f', teeth);
        drawRubyPin(ctx, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(30, -30);
        const forkOsc = Math.sin(smoothTick * Math.PI) * 0.15;
        ctx.rotate(forkOsc - Math.PI / 4);

        ctx.fillStyle = '#cfd8dc';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(40, -15);
        ctx.lineTo(40, 15);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = '#546e7a'; ctx.stroke();

        ctx.fillStyle = '#ff1744';
        ctx.fillRect(35, -18, 5, 8);
        ctx.fillRect(35, 10, 5, 8);
        drawRubyPin(ctx, 0, 0);
        ctx.restore();

        ctx.save();
        const balanceOsc = Math.cos(elapsed * this.TICK_HZ * Math.PI) * 1.5;
        ctx.rotate(balanceOsc);

        ctx.strokeStyle = '#ffb300';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.stroke();

        for (let j = 0; j < 12; j++) {
            const ba = (j / 12) * Math.PI * 2;
            const bx = Math.cos(ba) * 63;
            const by = Math.sin(ba) * 63;
            ctx.fillStyle = '#eceff1';
            ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
        }

        ctx.beginPath();
        ctx.moveTo(-60, 0); ctx.lineTo(60, 0);
        ctx.moveTo(0, -60); ctx.lineTo(0, 60);
        ctx.stroke();

        const springLayers = 5;
        ctx.strokeStyle = '#b0bec5';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2 * springLayers; a += 0.1) {
            const r = 5 + (a / (Math.PI * 2)) * 8 + (balanceOsc * a * 0.1);
            const sx = Math.cos(a) * r;
            const sy = Math.sin(a) * r;
            if (a === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        drawRubyPin(ctx, 0, 0);

        ctx.restore();
        ctx.restore();
    }

    private drawBridge(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const g = ctx.createLinearGradient(-100, -100, 200, 200);
        g.addColorStop(0, '#757575');
        g.addColorStop(0.5, '#bdbdbd');
        g.addColorStop(1, '#424242');
        ctx.fillStyle = g;

        ctx.beginPath();
        ctx.moveTo(80, -140);
        ctx.bezierCurveTo(200, -120, 220, 40, 160, 140);
        ctx.lineTo(40, 180);
        ctx.bezierCurveTo(20, 60, -20, 60, -60, -60);
        ctx.closePath();

        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = -5;
        ctx.shadowOffsetY = 10;
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        drawTinyScrew(ctx, 120, -100, 6);
        drawTinyScrew(ctx, 160, 60, 6);
        drawTinyScrew(ctx, 80, 140, 6);

        ctx.save();
        ctx.translate(110, 80);
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
        drawRubyPin(ctx, 0, 0);
        drawTinyScrew(ctx, -10, -10, 3);
        drawTinyScrew(ctx, 10, 10, 3);
        ctx.restore();

        ctx.restore();
    }

    private drawDialRing(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.arc(0, 0, 340, 0, Math.PI * 2);
        ctx.arc(0, 0, 220, 0, Math.PI * 2, true);

        const g = ctx.createRadialGradient(0, 0, 220, -50, -50, 340);
        g.addColorStop(0, '#fdfaf6');
        g.addColorStop(0.8, '#e6e0d4');
        g.addColorStop(1, '#c7bea9');
        ctx.fillStyle = g;
        ctx.fill();

        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = '#b87333';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 220, 0, Math.PI * 2); ctx.stroke();

        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 325, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 315, 0, Math.PI * 2); ctx.stroke();

        for (let i = 0; i < 60; i++) {
            const a = (i / 60) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 315, Math.sin(a) * 315);
            ctx.lineTo(Math.cos(a) * 325, Math.sin(a) * 325);
            ctx.stroke();

            if (i % 5 === 0) {
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 308, Math.sin(a) * 308);
                ctx.lineTo(Math.cos(a) * 325, Math.sin(a) * 325);
                ctx.stroke();
                ctx.lineWidth = 2;
            }
        }

        const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        ctx.fillStyle = '#212121';
        ctx.font = 'bold 38px "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < 12; i++) {
            const a = (i * 30 - 90) * (Math.PI / 180);
            const nx = Math.cos(a) * 275;
            const ny = Math.sin(a) * 275;

            ctx.save();
            ctx.translate(nx, ny);
            let alignAngle = a + Math.PI / 2;
            if (i > 3 && i < 9) alignAngle += Math.PI;
            ctx.rotate(alignAngle);

            ctx.shadowColor = 'rgba(255,255,255,0.8)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText(numerals[i], 0, 0);
            ctx.restore();
        }

        drawTinyScrew(ctx, -200, 0, 6);
        drawTinyScrew(ctx, 200, 0, 6);
        drawTinyScrew(ctx, 0, 200, 6);

        ctx.restore();
    }

    private drawHands(ctx: CanvasRenderingContext2D, elapsed: number, totalTicks: number) {
        const time = new Date();
        const s = time.getSeconds() + time.getMilliseconds() / 1000;
        const m = time.getMinutes() + s / 60;
        const h = (time.getHours() % 12) + m / 60;

        const hourRot = h * (Math.PI * 2 / 12);
        const minRot = m * (Math.PI * 2 / 60);
        const secRot = (totalTicks / (60 * this.TICK_HZ)) * Math.PI * 2;

        this.drawOrnateHand(ctx, hourRot, 140, 16, 'rgba(0,0,0,0.6)', true);
        this.drawOrnateHand(ctx, minRot, 210, 10, 'rgba(0,0,0,0.6)', true);
        this.drawSecondHand(ctx, secRot, 240, 'rgba(0,0,0,0.6)', true);

        const blueSteel = '#1a237e';
        this.drawOrnateHand(ctx, hourRot, 140, 16, blueSteel, false);
        this.drawOrnateHand(ctx, minRot, 210, 10, blueSteel, false);
        this.drawSecondHand(ctx, secRot, 240, '#bf360c', false);

        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#ffca28';
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = 'transparent';
    }

    private drawOrnateHand(ctx: CanvasRenderingContext2D, angle: number, length: number, width: number, color: string, isShadow: boolean) {
        ctx.save();
        ctx.rotate(angle);
        if (isShadow) {
            ctx.shadowColor = "transparent";
            ctx.translate(6, 6);
        } else {
            ctx.shadowColor = 'transparent';
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 15, width * 0.8, Math.PI, 0);
        ctx.lineTo(width * 0.6, -length * 0.4);
        ctx.bezierCurveTo(width * 1.5, -length * 0.5, width * 2, -length * 0.7, 0, -length);
        ctx.bezierCurveTo(-width * 2, -length * 0.7, -width * 1.5, -length * 0.5, -width * 0.6, -length * 0.4);
        ctx.closePath();
        ctx.fill();

        if (!isShadow) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(0, -length * 0.85);
            ctx.bezierCurveTo(width * 0.8, -length * 0.7, width * 0.4, -length * 0.45, 0, -length * 0.45);
            ctx.bezierCurveTo(-width * 0.4, -length * 0.45, -width * 0.8, -length * 0.7, 0, -length * 0.85);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';

            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }

    private drawSecondHand(ctx: CanvasRenderingContext2D, angle: number, length: number, color: string, isShadow: boolean) {
        ctx.save();
        ctx.rotate(angle);
        if (isShadow) ctx.translate(8, 8);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 40, 6, Math.PI, 0);
        ctx.lineTo(2, -length * 0.8);
        ctx.arc(0, -length * 0.85, 8, 0, Math.PI * 2);
        ctx.lineTo(-2, -length * 0.8);
        ctx.fill();

        if (!isShadow) {
            ctx.fillStyle = '#0a0a0a';
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath(); ctx.arc(0, -length * 0.85, 4, 0, Math.PI * 2); ctx.fill();
            ctx.globalCompositeOperation = 'source-over';

            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }

    private drawGlass(ctx: CanvasRenderingContext2D) {
        ctx.save();

        const g1 = ctx.createLinearGradient(-300, -300, 300, 300);
        g1.addColorStop(0, 'rgba(255,255,255,0.4)');
        g1.addColorStop(0.3, 'rgba(255,255,255,0)');
        g1.addColorStop(0.7, 'rgba(255,255,255,0)');
        g1.addColorStop(1, 'rgba(255,255,255,0.1)');

        ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2);
        ctx.fillStyle = g1; ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 320, Math.PI, Math.PI * 1.5);
        ctx.lineTo(-200, -200);
        ctx.bezierCurveTo(-200, -300, -300, -200, -320, 0);

        const g2 = ctx.createRadialGradient(-150, -150, 0, -150, -150, 200);
        g2.addColorStop(0, 'rgba(200, 220, 255, 0.15)');
        g2.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g2;
        ctx.fill();

        ctx.restore();
    }
}
