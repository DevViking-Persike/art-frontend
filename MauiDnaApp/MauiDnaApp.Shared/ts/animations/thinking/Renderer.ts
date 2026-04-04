import { BaseRenderer } from '../../core/BaseRenderer';
import { CoreSphere } from './entities/CoreSphere';
import { OrbitalRings } from './entities/OrbitalRings';
import { SynapseNetwork } from './entities/SynapseNetwork';
import { DataBeams } from './entities/DataBeams';
import { CodeFragments } from './entities/CodeFragments';
import { PulseWaves } from './entities/PulseWaves';
import { HUD } from './entities/HUD';

export class ThinkingRenderer extends BaseRenderer {
    private currentRotX: number = 0;
    private currentRotY: number = 0;

    private coreSphere = new CoreSphere();
    private orbitalRings = new OrbitalRings();
    private synapseNetwork = new SynapseNetwork();
    private dataBeams = new DataBeams();
    private codeFragments = new CodeFragments();
    private pulseWaves = new PulseWaves();
    private hud = new HUD();

    protected init(): void {
        this.coreSphere.init();
        this.orbitalRings.init();
        this.synapseNetwork.init();
        this.dataBeams.init();
        this.codeFragments.init();
    }

    protected render(dt: number, time: number): void {
        const ctx = this.ctx;
        const scale = Math.min(this.width, this.height) / 900;

        // Camera follow mouse
        const targetRotX = (this.mouse.ny - 0.5) * 1.5;
        const targetRotY = (this.mouse.nx - 0.5) * 1.5;
        this.currentRotX += (targetRotX - this.currentRotX) * 0.08;
        this.currentRotY += (targetRotY - this.currentRotY) * 0.08;

        const rotX = time * 0.15 + this.currentRotX;
        const rotY = time * 0.25 + this.currentRotY;

        // Background
        const bgGrad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(this.width, this.height) * 0.8);
        bgGrad.addColorStop(0, '#0a0d15');
        bgGrad.addColorStop(0.5, '#05070a');
        bgGrad.addColorStop(1, '#020305');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.globalCompositeOperation = 'lighter';

        // Grid overlay
        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 1;
        const gridSize = 50 * scale;
        for (let gx = (this.cx % gridSize); gx < this.width; gx += gridSize) {
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, this.height); ctx.stroke();
        }
        for (let gy = (this.cy % gridSize); gy < this.height; gy += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(this.width, gy); ctx.stroke();
        }
        ctx.restore();

        // Ambient glow
        const pulseGlow = (Math.sin(time * 2) + 1) / 2;
        const ambientGrad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, (220 + pulseGlow * 30) * scale);
        ambientGrad.addColorStop(0, `rgba(0, 180, 255, ${0.1 + pulseGlow * 0.05})`);
        ambientGrad.addColorStop(0.5, `rgba(180, 0, 255, ${0.05 + pulseGlow * 0.02})`);
        ambientGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = ambientGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Entities
        this.dataBeams.draw(ctx, this.cx, this.height, scale, dt, rotY);
        this.pulseWaves.update(dt, scale);
        this.pulseWaves.draw(ctx, this.cx, this.cy);
        this.coreSphere.draw(ctx, this.cx, this.cy, scale, time, rotX, rotY);
        this.synapseNetwork.draw(ctx, this.cx, this.cy, scale, dt, rotX, rotY, this.coreSphere.BASE_RADIUS);
        this.orbitalRings.draw(ctx, this.cx, this.cy, scale, rotX);

        ctx.globalCompositeOperation = 'source-over';

        this.codeFragments.draw(ctx, this.width, this.height, scale, dt);

        // HUD
        this.hud.update(dt);
        this.hud.draw(ctx, this.cx, this.cy, this.width, this.height, scale, time);
    }
}
