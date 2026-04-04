import { BaseRenderer } from '../../core/BaseRenderer';
import { PLANETS } from './data';
import { projectOrbit } from './mathUtils';
import { Planet } from './entities/Planet';
import { Starfield } from './entities/Starfield';
import { Sun } from './entities/Sun';

export class SolarSystemRenderer extends BaseRenderer {
    private planets: Planet[] = [];
    private starfield = new Starfield();
    private sun = new Sun();

    private viewRotX: number = 0.35;
    private viewRotY: number = 0;
    private targetRotX: number = 0.35;
    private targetRotY: number = 0;
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private dragStartRotX: number = 0;
    private dragStartRotY: number = 0;
    private scale: number = 1;

    protected init(): void {
        this.planets = PLANETS.map(d => new Planet(d));
        this.starfield.generate(600);
        this.bindDragEvents();
    }

    private bindDragEvents() {
        this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.dragStartRotX = this.targetRotX;
            this.dragStartRotY = this.targetRotY;
            this.canvas.style.cursor = 'grabbing';
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });

        window.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.dragStartX;
            const dy = e.clientY - this.dragStartY;
            this.targetRotY = this.dragStartRotY + dx * 0.005;
            this.targetRotX = Math.max(0.05, Math.min(1.2, this.dragStartRotX + dy * 0.005));
        });

        this.canvas.style.cursor = 'grab';
    }

    private drawOrbitPath(orbitRadius: number) {
        const ctx = this.ctx;
        const segments = 120;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const p = projectOrbit(angle, orbitRadius, this.scale, this.viewRotX, this.viewRotY, this.cx, this.cy);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    private drawHUD() {
        const ctx = this.ctx;
        const s = this.scale;

        ctx.save();
        ctx.fillStyle = 'rgba(100, 180, 255, 0.35)';
        ctx.font = `bold ${12 * s}px "Courier New", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('SOLAR SYSTEM EXPLORER', 20 * s, 28 * s);

        ctx.fillStyle = 'rgba(100, 180, 255, 0.2)';
        ctx.font = `${9 * s}px "Courier New", monospace`;
        ctx.fillText('DRAG TO ORBIT  ·  HOVER FOR DETAILS', 20 * s, 44 * s);

        const sz = 18;
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(10, 10 + sz); ctx.lineTo(10, 10); ctx.lineTo(10 + sz, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.width - 10 - sz, 10); ctx.lineTo(this.width - 10, 10); ctx.lineTo(this.width - 10, 10 + sz); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, this.height - 10 - sz); ctx.lineTo(10, this.height - 10); ctx.lineTo(10 + sz, this.height - 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.width - 10 - sz, this.height - 10); ctx.lineTo(this.width - 10, this.height - 10); ctx.lineTo(this.width - 10, this.height - 10 - sz); ctx.stroke();

        ctx.restore();
    }

    protected render(dt: number, time: number): void {
        const ctx = this.ctx;
        this.scale = Math.min(this.width, this.height) / 1050;

        this.viewRotX += (this.targetRotX - this.viewRotX) * 0.06;
        this.viewRotY += (this.targetRotY - this.viewRotY) * 0.06;

        // Background
        const bgGrad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(this.width, this.height));
        bgGrad.addColorStop(0, '#0a0d18');
        bgGrad.addColorStop(0.5, '#050810');
        bgGrad.addColorStop(1, '#010208');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        this.starfield.draw(ctx, this.width, this.height, time);

        // Nebulae
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.globalCompositeOperation = 'lighter';
        const neb1 = ctx.createRadialGradient(this.width * 0.2, this.height * 0.3, 0, this.width * 0.2, this.height * 0.3, 200 * this.scale);
        neb1.addColorStop(0, '#4466ff');
        neb1.addColorStop(1, 'transparent');
        ctx.fillStyle = neb1;
        ctx.fillRect(0, 0, this.width, this.height);
        const neb2 = ctx.createRadialGradient(this.width * 0.8, this.height * 0.7, 0, this.width * 0.8, this.height * 0.7, 180 * this.scale);
        neb2.addColorStop(0, '#ff4488');
        neb2.addColorStop(1, 'transparent');
        ctx.fillStyle = neb2;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();

        // Orbit paths
        PLANETS.forEach(p => this.drawOrbitPath(p.orbitRadius));

        // Sort planets by z
        const sorted = this.planets.map(p => ({
            planet: p,
            z: p.getPosition(time, this.scale, this.viewRotX, this.viewRotY, this.cx, this.cy).z
        }));
        sorted.sort((a, b) => a.z - b.z);

        // Behind sun
        sorted.filter(s => s.z <= 0).forEach(s =>
            s.planet.draw(ctx, time, this.scale, this.viewRotX, this.viewRotY, this.cx, this.cy, this.mouse.x, this.mouse.y)
        );

        this.sun.draw(ctx, this.cx, this.cy, this.scale, time);

        // In front of sun
        sorted.filter(s => s.z > 0).forEach(s =>
            s.planet.draw(ctx, time, this.scale, this.viewRotX, this.viewRotY, this.cx, this.cy, this.mouse.x, this.mouse.y)
        );

        this.drawHUD();
    }
}
