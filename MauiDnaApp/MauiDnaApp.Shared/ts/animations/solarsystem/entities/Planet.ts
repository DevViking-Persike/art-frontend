import { PlanetData } from '../types';
import { darkenColor, projectOrbit } from '../mathUtils';

export class Planet {
    constructor(private data: PlanetData) {}

    get name() { return this.data.name; }
    get orbitRadius() { return this.data.orbitRadius; }
    get period() { return this.data.period; }

    getPosition(time: number, scale: number, viewRotX: number, viewRotY: number, cx: number, cy: number) {
        const angle = (time / this.data.period) * Math.PI * 2;
        return projectOrbit(angle, this.data.orbitRadius, scale, viewRotX, viewRotY, cx, cy);
    }

    draw(ctx: CanvasRenderingContext2D, time: number, scale: number, viewRotX: number, viewRotY: number, cx: number, cy: number, mouseX: number, mouseY: number): string | null {
        const pos = this.getPosition(time, scale, viewRotX, viewRotY, cx, cy);
        const r = this.data.radius * scale;
        const maxZ = this.data.orbitRadius * scale;
        const depthFactor = (pos.z + maxZ) / (2 * maxZ);
        const alpha = 0.4 + depthFactor * 0.6;
        const sizeScale = 0.7 + depthFactor * 0.3;
        const drawR = r * sizeScale;

        // Glow
        ctx.save();
        ctx.globalAlpha = alpha * 0.4;
        const glow = ctx.createRadialGradient(pos.x, pos.y, drawR * 0.5, pos.x, pos.y, drawR * 3);
        glow.addColorStop(0, this.data.glowColor);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, drawR * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Rings
        if (this.data.hasRing) {
            this.drawRings(ctx, pos, drawR, alpha);
        }

        // Body
        ctx.save();
        ctx.globalAlpha = alpha;
        const bodyGrad = ctx.createRadialGradient(
            pos.x - drawR * 0.35, pos.y - drawR * 0.35, drawR * 0.1,
            pos.x, pos.y, drawR
        );
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.25, this.data.color);
        bodyGrad.addColorStop(1, darkenColor(this.data.color, 0.3));
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, drawR, 0, Math.PI * 2);
        ctx.fill();

        // Planet-specific details
        this.drawSurfaceDetails(ctx, pos, drawR);
        ctx.restore();

        // Moons
        this.drawMoons(ctx, pos, time, scale, sizeScale, alpha, viewRotX);

        // Label
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = this.data.glowColor;
        ctx.font = `${Math.max(9, 11 * scale)}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(this.data.name.toUpperCase(), pos.x, pos.y + drawR + 14 * scale);
        ctx.restore();

        // Hover detection
        const dx = mouseX - pos.x;
        const dy = mouseY - pos.y;
        if (dx * dx + dy * dy < (drawR + 10) * (drawR + 10)) {
            this.drawTooltip(ctx, pos, drawR, scale);
            return this.data.name;
        }
        return null;
    }

    private drawRings(ctx: CanvasRenderingContext2D, pos: {x: number, y: number}, drawR: number, alpha: number) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = this.data.ringColor || '#d4c090';
        ctx.lineWidth = drawR * 0.3;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, drawR * 2.5, drawR * 0.7, -0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = drawR * 0.15;
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, drawR * 2, drawR * 0.55, -0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    private drawSurfaceDetails(ctx: CanvasRenderingContext2D, pos: {x: number, y: number}, drawR: number) {
        if (this.data.name === 'Jupiter') {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.clip();
            for (let b = -3; b <= 3; b++) {
                ctx.fillStyle = b % 2 === 0 ? '#c49060' : '#b07840';
                ctx.fillRect(pos.x - drawR, pos.y + b * drawR * 0.25, drawR * 2, drawR * 0.15);
            }
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = '#cc4422';
            ctx.beginPath();
            ctx.ellipse(pos.x + drawR * 0.3, pos.y + drawR * 0.1, drawR * 0.25, drawR * 0.15, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.data.name === 'Earth') {
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.clip();
            ctx.fillStyle = '#2d8f4e';
            ctx.beginPath();
            ctx.ellipse(pos.x - drawR * 0.2, pos.y - drawR * 0.15, drawR * 0.35, drawR * 0.25, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(pos.x + drawR * 0.3, pos.y + drawR * 0.2, drawR * 0.2, drawR * 0.3, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.data.name === 'Mars') {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.clip();
            ctx.fillStyle = '#eeddcc';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y - drawR * 0.8, drawR * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pos.x, pos.y + drawR * 0.85, drawR * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    private drawMoons(ctx: CanvasRenderingContext2D, pos: {x: number, y: number}, time: number, scale: number, sizeScale: number, alpha: number, viewRotX: number) {
        if (!this.data.moons) return;
        this.data.moons.forEach(moon => {
            const moonAngle = (time / moon.period) * Math.PI * 2;
            const mx = pos.x + Math.cos(moonAngle) * moon.orbitRadius * scale * sizeScale;
            const my = pos.y + Math.sin(moonAngle) * moon.orbitRadius * scale * sizeScale * Math.sin(viewRotX);
            const mr = moon.radius * scale * sizeScale;

            ctx.save();
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = moon.color;
            ctx.beginPath();
            ctx.arc(mx, my, Math.max(0.5, mr), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    private drawTooltip(ctx: CanvasRenderingContext2D, pos: {x: number, y: number}, drawR: number, scale: number) {
        if (!this.data.detail) return;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = 'rgba(5, 10, 20, 0.85)';
        ctx.strokeStyle = this.data.glowColor;
        ctx.lineWidth = 1;

        const textWidth = ctx.measureText(this.data.detail).width + 24;
        const tx = pos.x - textWidth / 2;
        const ty = pos.y - drawR - 30 * scale;

        ctx.beginPath();
        ctx.roundRect(tx, ty, textWidth, 22 * scale, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e8e8e8';
        ctx.font = `${10 * scale}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(this.data.detail, pos.x, ty + 15 * scale);
        ctx.restore();
    }
}
