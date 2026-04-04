import { BaseRenderer } from '../../core/BaseRenderer';

interface CoreParticle {
    theta: number;
    phi: number;
    baseRadius: number;
    pulse: number;
    speed: number;
    hue: number;
    size: number;
    orbitSpeed: number;
}

interface RingTask {
    text: string;
    icon: string;
}

const TASKS: RingTask[] = [
    { text: "Analyzing context", icon: "◉" },
    { text: "Traversing knowledge graph", icon: "◈" },
    { text: "Searching vector space", icon: "◇" },
    { text: "Optimizing neural pathways", icon: "◆" },
    { text: "Synthesizing knowledge", icon: "◎" },
    { text: "Encoding semantic layers", icon: "◐" },
    { text: "Refining attention weights", icon: "◑" },
    { text: "Cross-referencing embeddings", icon: "◒" },
    { text: "Finalizing output tensor", icon: "◓" }
];

export class ThinkingRenderer extends BaseRenderer {
    private currentRotX: number = 0;
    private currentRotY: number = 0;
    private currentTaskIndex: number = 0;
    private taskTimer: number = 0;
    private taskProgress: number = 0;

    private coreParticles: CoreParticle[] = [];
    private rings: any[] = [];
    private synapses: any[] = [];
    private beams: any[] = [];
    private fragments: any[] = [];
    private waves: any[] = [];
    private waveTimer: number = 0;

    private readonly NUM_CORE = 350;
    private readonly BASE_RADIUS = 160;

    protected init(): void {
        this.coreParticles = [];
        for (let i = 0; i < this.NUM_CORE; i++) {
            this.coreParticles.push({
                theta: Math.random() * Math.PI * 2,
                phi: Math.acos((Math.random() * 2) - 1),
                baseRadius: this.BASE_RADIUS + (Math.random() - 0.5) * 45,
                pulse: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.05,
                hue: Math.random() > 0.7 ? 280 + Math.random() * 40 : 190 + Math.random() * 40,
                size: 0.8 + Math.random() * 1.5,
                orbitSpeed: (Math.random() - 0.5) * 0.012
            });
        }

        this.rings = [];
        for (let r = 0; r < 4; r++) {
            const ringParticles = [];
            const count = 100 + r * 35;
            const ringRadius = 220 + r * 55;
            for (let i = 0; i < count; i++) {
                ringParticles.push({
                    angle: (i / count) * Math.PI * 2,
                    radius: ringRadius,
                    pulse: Math.random() * Math.PI * 2,
                    size: 0.5 + Math.random() * 2
                });
            }
            this.rings.push({
                particles: ringParticles,
                tiltX: (r * 0.9) + 0.2,
                tiltY: r * 1.4,
                rotSpeed: 0.002 + r * 0.0015 + (r % 2 === 0 ? 0.001 : -0.002),
                hue: r % 2 === 0 ? 190 : 280,
                rotation: 0
            });
        }

        this.synapses = [];
        for (let i = 0; i < 15; i++) {
            this.synapses.push({
                startTheta: Math.random() * Math.PI * 2,
                startPhi: Math.acos((Math.random() * 2) - 1),
                endTheta: Math.random() * Math.PI * 2,
                endPhi: Math.acos((Math.random() * 2) - 1),
                life: Math.random(),
                maxLife: 0.8 + Math.random() * 0.8,
                active: Math.random() > 0.5,
                hue: Math.random() > 0.5 ? 190 : 300
            });
        }

        this.beams = [];
        for(let i = 0; i < 20; i++) {
            this.beams.push({
                xOffset: (Math.random() - 0.5) * 400,
                zOffset: (Math.random() - 0.5) * 400,
                speed: 2 + Math.random() * 4,
                width: 1 + Math.random() * 3,
                hue: 190 + Math.random() * 40,
                yPos: Math.random() * 1000,
                height: 50 + Math.random() * 150,
                alphaFade: Math.random() * Math.PI * 2
            });
        }

        this.fragments = [];
        const fragTexts = [
            "tensor", "∇loss", "attention(Q,K,V)", "embed", "softmax",
            "weight_decay", "matrix_mul", "ReLU", "norm", "0x3F8",
            "backprop", "dim_768", "heads_12", "GPT_ARCH", "W·x+b", "100.00%"
        ];
        for (let i = 0; i < 35; i++) {
            this.fragments.push({
                x: Math.random(),
                y: Math.random(),
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                text: fragTexts[Math.floor(Math.random() * fragTexts.length)],
                alpha: Math.random(),
                fadeSpeed: 0.005 + Math.random() * 0.015,
                size: 10 + Math.random() * 6
            });
        }
    }

    private spawnWave() {
        this.waves.push({
            radius: 0,
            maxRadius: 380 + Math.random() * 100,
            alpha: 0.4,
            hue: Math.random() > 0.5 ? 200 : 280,
            speed: 1.5 + Math.random() * 1.5,
            width: 1.5 + Math.random() * 2
        });
    }

    private project3D(theta: number, phi: number, r: number, rotX: number, rotY: number) {
        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.sin(phi) * Math.sin(theta);
        let z = r * Math.cos(phi);

        let x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
        let z1 = z * Math.cos(rotY) - x * Math.sin(rotY);

        let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = z1 * Math.cos(rotX) + y * Math.sin(rotX);

        return { x: x1 + this.cx, y: y2 + this.cy, z: z2 };
    }

    private drawSynapse(p1: any, p2: any, alpha: number, hue: number) {
        const mx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 40;
        const my = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 40;

        this.ctx.save();
        this.ctx.globalAlpha = alpha * 0.6;
        this.ctx.strokeStyle = `hsl(${hue}, 100%, 75%)`;
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
        this.ctx.stroke();

        this.ctx.globalAlpha = alpha * 0.9;
        this.ctx.fillStyle = `hsl(${hue}, 100%, 95%)`;
        this.ctx.beginPath();
        this.ctx.arc(mx, my, 1.5 + Math.random() * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    protected render(dt: number, time: number): void {
        const ctx = this.ctx;
        const scale = Math.min(this.width, this.height) / 900;

        this.taskTimer += dt;
        this.waveTimer += dt;

        if (this.taskTimer > 2.2) {
            this.taskTimer = 0;
            this.currentTaskIndex = (this.currentTaskIndex + 1) % TASKS.length;
        }
        this.taskProgress = this.taskTimer / 2.2;

        if (this.waveTimer > 1.5) {
            this.waveTimer = 0;
            this.spawnWave();
        }

        const targetRotX = (this.mouse.ny - 0.5) * 1.5;
        const targetRotY = (this.mouse.nx - 0.5) * 1.5;
        this.currentRotX += (targetRotX - this.currentRotX) * 0.08;
        this.currentRotY += (targetRotY - this.currentRotY) * 0.08;

        const rotX = time * 0.15 + this.currentRotX;
        const rotY = time * 0.25 + this.currentRotY;

        const bgGrad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(this.width, this.height) * 0.8);
        bgGrad.addColorStop(0, '#0a0d15');
        bgGrad.addColorStop(0.5, '#05070a');
        bgGrad.addColorStop(1, '#020305');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.globalCompositeOperation = 'lighter';

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

        this.beams.forEach(beam => {
            beam.yPos -= beam.speed;
            if(beam.yPos < -200) beam.yPos = this.height + 200;
            
            let x = beam.xOffset;
            let z = beam.zOffset;
            let x1 = x * Math.cos(rotY * 0.5) + z * Math.sin(rotY * 0.5);
            let z1 = z * Math.cos(rotY * 0.5) - x * Math.sin(rotY * 0.5);
            
            beam.alphaFade += dt * 2;
            const beamAlpha = (Math.sin(beam.alphaFade) + 1)/2 * 0.15 * Math.max(0, 1 - Math.abs(z1)/500);

            if(z1 < 300) {
                const bGrad = ctx.createLinearGradient(0, beam.yPos, 0, beam.yPos + beam.height);
                bGrad.addColorStop(0, `hsla(${beam.hue}, 80%, 70%, 0)`);
                bGrad.addColorStop(0.5, `hsla(${beam.hue}, 80%, 70%, ${beamAlpha})`);
                bGrad.addColorStop(1, `hsla(${beam.hue}, 80%, 70%, 0)`);
                
                ctx.fillStyle = bGrad;
                ctx.fillRect(this.cx + x1, beam.yPos, beam.width * scale, beam.height);
            }
        });

        const pulseGlow = (Math.sin(time * 2) + 1) / 2;
        const ambientGrad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, (220 + pulseGlow * 30) * scale);
        ambientGrad.addColorStop(0, `rgba(0, 180, 255, ${0.1 + pulseGlow * 0.05})`);
        ambientGrad.addColorStop(0.5, `rgba(180, 0, 255, ${0.05 + pulseGlow * 0.02})`);
        ambientGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = ambientGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        for (let i = this.waves.length - 1; i >= 0; i--) {
            const wave = this.waves[i];
            wave.radius += wave.speed * scale;
            wave.alpha -= 0.003;
            if (wave.alpha <= 0 || wave.radius > wave.maxRadius * scale) {
                this.waves.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.globalAlpha = wave.alpha * 0.3;
            ctx.strokeStyle = `hsl(${wave.hue}, 90%, 65%)`;
            ctx.lineWidth = wave.width;
            ctx.beginPath();
            ctx.arc(this.cx, this.cy, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        const projectedCore = this.coreParticles.map(p => {
            p.theta += p.orbitSpeed;
            p.pulse += p.speed;
            const pulseVal = (Math.sin(p.pulse) + 1) / 2;
            const breathe = Math.sin(time * 1.2) * 15;
            const r = (p.baseRadius + breathe) * scale;
            const proj = this.project3D(p.theta, p.phi, r, rotX, rotY);
            return { ...proj, pulse: pulseVal, hue: p.hue, size: p.size };
        });

        ctx.save();
        ctx.lineWidth = 0.5;
        const connectDist = 35 * scale;
        const distSqThresh = connectDist * connectDist;
        for (let i = 0; i < projectedCore.length; i += 3) {
            const p1 = projectedCore[i];
            if(p1.pulse < 0.2) continue; 
            for (let j = i + 1; j < projectedCore.length; j += 3) {
                const p2 = projectedCore[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx*dx + dy*dy;
                if (distSq < distSqThresh) {
                    const alpha = (1 - Math.sqrt(distSq)/connectDist) * 0.3 * p1.pulse * p2.pulse;
                    if(alpha > 0.05) {
                        ctx.strokeStyle = `hsla(${(p1.hue+p2.hue)/2}, 80%, 75%, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        }
        ctx.restore();

        projectedCore.sort((a, b) => a.z - b.z);

        projectedCore.forEach(p => {
            const maxR = this.BASE_RADIUS * scale;
            const depthScale = (p.z + maxR) / (2 * maxR);
            const size = (depthScale * p.size * 2.0 + p.pulse * 1.5) * scale;
            const alpha = 0.15 + depthScale * 0.85;

            ctx.save();
            ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

            if (p.pulse > 0.85) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = `hsl(${p.hue}, 90%, ${50 + p.pulse * 20}%)`;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        this.synapses.forEach(s => {
            s.life += dt;
            if (s.life > s.maxLife) {
                s.life = 0;
                s.active = !s.active;
                s.startTheta = Math.random() * Math.PI * 2;
                s.startPhi = Math.acos((Math.random() * 2) - 1);
                s.endTheta = Math.random() * Math.PI * 2;
                s.endPhi = Math.acos((Math.random() * 2) - 1);
                s.hue = Math.random() > 0.3 ? 190 : 280;
            }
            if (!s.active) return;

            const fadeIn = Math.min(1, s.life * 5);
            const fadeOut = Math.max(0, 1 - (s.life / s.maxLife));
            const alpha = fadeIn * fadeOut;

            const r = this.BASE_RADIUS * scale;
            const p1 = this.project3D(s.startTheta, s.startPhi, r, rotX, rotY);
            const p2 = this.project3D(s.endTheta, s.endPhi, r, rotX, rotY);
            this.drawSynapse(p1, p2, alpha, s.hue);
        });

        this.rings.forEach(ring => {
            ring.rotation += ring.rotSpeed;
            ctx.save();
            ring.particles.forEach((p: any) => {
                const a = p.angle + ring.rotation;
                let rx = p.radius * scale * Math.cos(a);
                let ry = p.radius * scale * Math.sin(a);

                let z = ry * Math.sin(ring.tiltX);
                ry = ry * Math.cos(ring.tiltX);

                let tempX = rx * Math.cos(ring.tiltY + rotX * 0.5) + z * Math.sin(ring.tiltY + rotX * 0.5);
                let tempZ = z * Math.cos(ring.tiltY + rotX * 0.5) - rx * Math.sin(ring.tiltY + rotX * 0.5);

                p.pulse += 0.04;
                const pulseVal = (Math.sin(p.pulse) + 1) / 2;
                const depthAlpha = (tempZ + p.radius * scale) / (2 * p.radius * scale);
                const alpha = 0.1 + depthAlpha * 0.6 + pulseVal * 0.3;

                ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.6));
                ctx.fillStyle = `hsl(${ring.hue + pulseVal * 20}, 90%, ${60 + pulseVal * 40}%)`;

                ctx.beginPath();
                ctx.arc(this.cx + tempX, this.cy + ry, p.size * scale * (0.8 + pulseVal * 0.6), 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        });

        ctx.globalCompositeOperation = 'source-over';

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
            ctx.fillText(f.text, f.x * this.width, f.y * this.height);
        });
        ctx.restore();

        this.drawHUD(scale, time);
    }

    private drawHUD(scale: number, time: number) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.3 + (Math.sin(time * 0.8) + 1) / 2 * 0.2;
        ctx.fillStyle = '#00f2ff';
        ctx.font = `bold ${12 * scale}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.letterSpacing = `${8 * scale}px`;
        ctx.fillText('N E U R A L   C O R E', this.cx, 40 * scale);
        ctx.letterSpacing = '0px';

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#aaaaff';
        ctx.font = `${9 * scale}px "Courier New", monospace`;
        ctx.fillText(`ID: AETHER-UX  |  ITERATION: ${Math.floor(time * 10)}  |  STATE: SYNTHESIS`, this.cx, 60 * scale);
        ctx.restore();

        const panelY = this.height - 100 * scale;
        const panelHeight = 65 * scale;
        const panelWidth = 400 * scale;
        const panelX = this.cx - panelWidth / 2;

        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'rgba(2, 6, 15, 0.6)';
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.4)';
        ctx.lineWidth = 1.5;

        const rr = 10 * scale;
        ctx.beginPath();
        ctx.moveTo(panelX + rr, panelY);
        ctx.lineTo(panelX + panelWidth - rr, panelY);
        ctx.arcTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + rr, rr);
        ctx.lineTo(panelX + panelWidth, panelY + panelHeight - rr);
        ctx.arcTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - rr, panelY + panelHeight, rr);
        ctx.lineTo(panelX + rr, panelY + panelHeight);
        ctx.arcTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - rr, rr);
        ctx.lineTo(panelX, panelY + rr);
        ctx.arcTo(panelX, panelY, panelX + rr, panelY, rr);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(panelX + 30*scale, panelY);
        ctx.lineTo(panelX + 120*scale, panelY);
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(panelX + panelWidth - 120*scale, panelY + panelHeight);
        ctx.lineTo(panelX + panelWidth - 30*scale, panelY + panelHeight);
        ctx.strokeStyle = '#b700ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        const task = TASKS[this.currentTaskIndex];
        const textY = panelY + 28 * scale;

        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#00f2ff';
        ctx.font = `${18 * scale}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(task.icon, panelX + 20 * scale, textY);

        ctx.fillStyle = '#eef8ff';
        ctx.font = `bold ${14 * scale}px "Courier New", monospace`;
        ctx.fillText(task.text, panelX + 48 * scale, textY - 2*scale);

        const barY = panelY + 45 * scale;
        const barWidth = panelWidth - 40 * scale;
        const barHeight = 4 * scale;
        const barX = panelX + 20 * scale;

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#00f2ff';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth * this.taskProgress, 0);
        barGrad.addColorStop(0, '#00f2ff');
        barGrad.addColorStop(1, '#b700ff');
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = barGrad;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f2ff';
        ctx.fillRect(barX, barY, barWidth * this.taskProgress, barHeight);

        if (this.taskProgress > 0.01) {
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(barX + barWidth * this.taskProgress, barY + barHeight / 2, barHeight + 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.save();
        const metrics = [
            { label: 'QPS', value: (428 + Math.sin(time * 3) * 15).toFixed(0) },
            { label: 'LATENCY', value: (8.2 + Math.sin(time * 2) * 1.5).toFixed(1) + 'ms' },
            { label: 'VRAM', value: (14.3 + Math.sin(time) * 0.2).toFixed(1) + 'GB' }
        ];

        ctx.globalAlpha = 0.4;
        ctx.font = `${10 * scale}px "Courier New", monospace`;
        metrics.forEach((m, i) => {
            const y = 35 * scale + i * 20 * scale;
            ctx.textAlign = 'left';
            ctx.fillStyle = '#00f2ff';
            ctx.fillText(m.label, 20 * scale, y);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(m.value, 80 * scale, y);
        });

        ctx.textAlign = 'right';
        ctx.fillStyle = '#00ffaa';
        ctx.globalAlpha = 0.6 + (Math.sin(time * 5) + 1) / 2 * 0.4;
        ctx.fillText('● SYSTEM OPTIMAL', this.width - 20 * scale, 35 * scale);
        
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#00f2ff';
        ctx.fillText(`THREADS: 128 / CLUSTER 4`, this.width - 20 * scale, 55 * scale);
        ctx.restore();
    }
}

export function startThinkingAnimation(canvasId: string) {
    new ThinkingRenderer(canvasId).start();
}
