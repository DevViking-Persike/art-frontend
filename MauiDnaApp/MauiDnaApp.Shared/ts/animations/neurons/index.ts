import { BaseRenderer } from '../../core/BaseRenderer';

const PALETTE = [
    '#00d2ff', // Cyan
    '#3a7bd5', // Blue
    '#8a2be2', // Purple
    '#ff007f'  // Neon Pink
];

class Neuron {
    originX: number;
    originY: number;
    z: number;
    radius: number;
    color: string;
    angle: number;
    speed: number;
    wobbleSpeed: number;
    wobblePhaseX: number;
    wobblePhaseY: number;
    connections: any[] = [];

    constructor(public x: number, public y: number) {
        this.originX = x;
        this.originY = y;
        this.z = Math.random();
        this.radius = 1.5 + (1 - this.z) * 3.5;
        this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (0.2 + Math.random() * 0.4) * (1 - this.z);
        this.wobbleSpeed = 0.001 + Math.random() * 0.003;
        this.wobblePhaseX = Math.random() * Math.PI * 2;
        this.wobblePhaseY = Math.random() * Math.PI * 2;
    }

    update(dtMs: number, timeMs: number, mouseInfo: {active: boolean, x: number, y: number}, width: number, height: number) {
        this.originX += Math.cos(this.angle) * this.speed * dtMs;
        this.originY += Math.sin(this.angle) * this.speed * dtMs;
        
        const margin = 50;
        if (this.originX < -margin) this.angle = Math.PI - this.angle;
        if (this.originX > width + margin) this.angle = Math.PI - this.angle;
        if (this.originY < -margin) this.angle = -this.angle;
        if (this.originY > height + margin) this.angle = -this.angle;

        this.x = this.originX + Math.sin(timeMs * this.wobbleSpeed + this.wobblePhaseX) * 20 * (1 - this.z);
        this.y = this.originY + Math.cos(timeMs * this.wobbleSpeed + this.wobblePhaseY) * 20 * (1 - this.z);

        if (mouseInfo.active) {
            const dx = mouseInfo.x - this.x;
            const dy = mouseInfo.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x -= (dx / dist) * force * 15 * (1 - this.z);
                this.y -= (dy / dist) * force * 15 * (1 - this.z);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, timeMs: number) {
        const glow = (Math.sin(timeMs * 0.005 + this.wobblePhaseX) + 1) * 0.5;
        const alpha = 0.2 + (1 - this.z) * 0.8;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (1 + glow), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class Pulse {
    progress: number = 0;
    speed: number;

    constructor(
        public startX: number, public startY: number, 
        public endX: number, public endY: number, 
        public color: string, public z: number
    ) {
        this.speed = 0.01 + Math.random() * 0.02;
    }

    update(dtMs: number) {
        this.progress += this.speed * dtMs;
        return this.progress >= 1;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const x = this.startX + (this.endX - this.startX) * this.progress;
        const y = this.startY + (this.endY - this.startY) * this.progress;
        
        const alpha = Math.sin(this.progress * Math.PI) * (1 - this.z);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.arc(x, y, 3 * (1 - this.z), 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

export class NeuronsRenderer extends BaseRenderer {
    private neurons: Neuron[] = [];
    private pulses: Pulse[] = [];
    private readonly NUM_NEURONS = 120;
    private readonly CONNECTION_DISTANCE = 180;

    protected init(): void {
        this.neurons = [];
        this.pulses = [];
        for (let i = 0; i < this.NUM_NEURONS; i++) {
            this.neurons.push(new Neuron(Math.random() * this.width, Math.random() * this.height));
        }
    }

    protected render(dt: number, time: number): void {
        const ctx = this.ctx;
        const dtMs = 16; // The original used a fixed 16 for logic stability
        const timeMs = time * 1000;

        const grad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(this.width, this.height));
        grad.addColorStop(0, '#0a0515');
        grad.addColorStop(1, '#020104');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.03)';
        ctx.lineWidth = 1;
        for(let i = 0; i < this.width; i += 60) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, this.height); ctx.stroke();
        }
        for(let i = 0; i < this.height; i += 60) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(this.width, i); ctx.stroke();
        }
        ctx.restore();

        const mouseInfo = { active: this.mouse.active, x: this.mouse.x, y: this.mouse.y };
        this.neurons.forEach(n => n.update(dtMs, timeMs, mouseInfo, this.width, this.height));

        ctx.save();
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = i + 1; j < this.neurons.length; j++) {
                const n1 = this.neurons[i];
                const n2 = this.neurons[j];
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < this.CONNECTION_DISTANCE * this.CONNECTION_DISTANCE) {
                    const dist = Math.sqrt(distSq);
                    const alpha = (1 - dist / this.CONNECTION_DISTANCE) * 0.4 * (1 - (n1.z + n2.z)/2);
                    
                    if (alpha > 0) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
                        ctx.lineWidth = 1 + (1 - (n1.z + n2.z)/2);
                        
                        const midX = (n1.x + n2.x) / 2 + (n1.y - n2.y) * 0.1;
                        const midY = (n1.y + n2.y) / 2 + (n2.x - n1.x) * 0.1;

                        ctx.moveTo(n1.x, n1.y);
                        ctx.quadraticCurveTo(midX, midY, n2.x, n2.y);
                        ctx.stroke();

                        if (Math.random() < 0.002) {
                            this.pulses.push(new Pulse(n1.x, n1.y, n2.x, n2.y, n1.color, (n1.z + n2.z)/2));
                        }
                    }
                }
            }
        }
        ctx.restore();

        for (let i = this.pulses.length - 1; i >= 0; i--) {
            if (this.pulses[i].update(dtMs)) {
                this.pulses.splice(i, 1);
            } else {
                this.pulses[i].draw(ctx);
            }
        }

        this.neurons.sort((a,b) => b.z - a.z).forEach(n => n.draw(ctx, timeMs));

        this.drawHUD(timeMs);
    }

    private drawHUD(tMs: number) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 200, 255, 0.4)';
        ctx.font = '12px "Courier New", monospace';
        
        ctx.fillText(`NEURAL MAP V2.0 // ACTIVE`, 20, 30);
        ctx.fillText(`SYNAPSES: ${this.pulses.length}`, 20, 50);
        ctx.fillText(`NODES: ${this.neurons.length}`, 20, 70);
        
        ctx.textAlign = 'right';
        ctx.fillText(`CORTEX LINK: STABLE`, this.width - 20, 30);
        
        const scanPos = (tMs * 0.05) % this.width;
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.fillRect(scanPos, 0, 50, 2);

        const size = 20;
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
        ctx.lineWidth = 2;
        
        ctx.beginPath(); ctx.moveTo(10, 10 + size); ctx.lineTo(10, 10); ctx.lineTo(10 + size, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.width - 10 - size, 10); ctx.lineTo(this.width - 10, 10); ctx.lineTo(this.width - 10, 10 + size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, this.height - 10 - size); ctx.lineTo(10, this.height - 10); ctx.lineTo(10 + size, this.height - 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.width - 10 - size, this.height - 10); ctx.lineTo(this.width - 10, this.height - 10); ctx.lineTo(this.width - 10, this.height - 10 - size); ctx.stroke();
        
        ctx.restore();
    }
}

export function startNeuronsAnimation(canvasId: string) {
    new NeuronsRenderer(canvasId).start();
}
