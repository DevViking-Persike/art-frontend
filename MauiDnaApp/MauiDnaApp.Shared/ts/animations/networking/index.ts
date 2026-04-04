import { BaseRenderer } from '../../core/BaseRenderer';

const COLORS = {
    primary: '#ffb300',
    secondary: '#ff9100',
    highlight: '#ffffff',
    bgCore: '#0d0800',
    bgOuter: '#030100'
};

class NetworkNode {
    originX: number;
    originY: number;
    z: number;
    radius: number;
    angle: number;
    speed: number;
    wobblePhaseX: number;
    wobblePhaseY: number;
    wobbleSpeed: number;
    pulse: number;
    pulseSpeed: number;

    constructor(public x: number, public y: number) {
        this.originX = x;
        this.originY = y;
        this.z = Math.random();
        this.radius = 1.5 + (1 - this.z) * 3;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (0.1 + Math.random() * 0.2) * (1 - this.z);
        this.wobblePhaseX = Math.random() * Math.PI * 2;
        this.wobblePhaseY = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.001 + Math.random() * 0.002;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.03;
    }

    update(dtMs: number, time: number, mouseInfo: {active: boolean, x: number, y: number}, width: number, height: number) {
        this.originX += Math.cos(this.angle) * this.speed;
        this.originY += Math.sin(this.angle) * this.speed;

        const margin = 50;
        if (this.originX < -margin) this.angle = Math.PI - this.angle;
        if (this.originX > width + margin) this.angle = Math.PI - this.angle;
        if (this.originY < -margin) this.angle = -this.angle;
        if (this.originY > height + margin) this.angle = -this.angle;

        this.x = this.originX + Math.sin(time * 1000 * this.wobbleSpeed + this.wobblePhaseX) * 15 * (1 - this.z);
        this.y = this.originY + Math.cos(time * 1000 * this.wobbleSpeed + this.wobblePhaseY) * 15 * (1 - this.z);

        if (mouseInfo.active) {
            const dx = mouseInfo.x - this.x;
            const dy = mouseInfo.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const force = (200 - dist) / 200;
                const pushX = -(dx / dist) * force * 10 * (1 - this.z);
                const pushY = -(dy / dist) * force * 10 * (1 - this.z);
                const spinX = (dy / dist) * force * 5;
                const spinY = -(dx / dist) * force * 5;

                this.x += pushX + spinX;
                this.y += pushY + spinY;
            }
        }
        
        this.pulse += dtMs * this.pulseSpeed * 0.01;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const depthScale = (1 - this.z);
        const alpha = 0.3 + depthScale * 0.7;
        const glow = (Math.sin(this.pulse) + 1) * 0.5;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLORS.primary;
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.secondary;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (1 + glow*0.5), 0, Math.PI * 2);
        ctx.fill();

        if (glow > 0.5) {
            ctx.fillStyle = COLORS.highlight;
            ctx.globalAlpha = alpha * glow;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class DataPacket {
    progress: number = 0;
    speed: number;
    size: number;

    constructor(public n1: NetworkNode, public n2: NetworkNode) {
        this.speed = 0.01 + Math.random() * 0.02;
        this.size = 2 + Math.random() * 2;
    }

    update(dtMs: number): boolean {
        this.progress += this.speed * dtMs * 0.1;
        return this.progress >= 1;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const x = this.n1.x + (this.n2.x - this.n1.x) * this.progress;
        const y = this.n1.y + (this.n2.y - this.n1.y) * this.progress;
        
        const depthScale = (1 - (this.n1.z + this.n2.z)/2);
        const alpha = Math.sin(this.progress * Math.PI) * depthScale; 

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLORS.highlight;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.primary;
        
        ctx.beginPath();
        ctx.arc(x, y, this.size * depthScale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        const tailX = this.n1.x + (this.n2.x - this.n1.x) * (this.progress - 0.05);
        const tailY = this.n1.y + (this.n2.y - this.n1.y) * (this.progress - 0.05);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = COLORS.highlight;
        ctx.lineWidth = this.size * depthScale;
        ctx.stroke();

        ctx.restore();
    }
}

export class NetworkingRenderer extends BaseRenderer {
    private nodes: NetworkNode[] = [];
    private packets: DataPacket[] = [];
    private readonly NUM_NODES = 140;
    private readonly CONNECTION_DISTANCE = 160;

    protected init(): void {
        this.nodes = [];
        this.packets = [];
        for (let i = 0; i < this.NUM_NODES; i++) {
            this.nodes.push(new NetworkNode(Math.random() * this.width, Math.random() * this.height));
        }
    }

    protected render(dt: number, time: number): void {
        const ctx = this.ctx;
        const dtMs = dt * 1000;

        const grad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(this.width, this.height) * 1.2);
        grad.addColorStop(0, COLORS.bgCore);
        grad.addColorStop(1, COLORS.bgOuter);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 179, 0, 0.03)';
        ctx.lineWidth = 1;
        const hexSize = 60;
        const widthHalf = hexSize/2;
        const heightHalf = hexSize*0.866; 
        
        ctx.beginPath();
        for (let x = 0; x < this.width + hexSize; x += hexSize * 1.5) {
            for (let y = 0; y < this.height + hexSize; y += heightHalf * 2) {
                ctx.moveTo(x, y); ctx.lineTo(x + widthHalf, y - heightHalf);
                ctx.moveTo(x, y); ctx.lineTo(x - widthHalf, y - heightHalf);
                ctx.moveTo(x, y); ctx.lineTo(x - widthHalf, y + heightHalf);
            }
        }
        ctx.stroke();
        ctx.restore();

        const mouseInfo = { active: this.mouse.active, x: this.mouse.x, y: this.mouse.y };
        this.nodes.forEach(n => n.update(dtMs, time, mouseInfo, this.width, this.height));

        ctx.save();
        ctx.lineWidth = 1;
        for (let i = 0; i < this.nodes.length; i++) {
            let connectionsCount = 0;
            for (let j = i + 1; j < this.nodes.length; j++) {
                if (connectionsCount > 5) break; 

                const n1 = this.nodes[i];
                const n2 = this.nodes[j];
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < this.CONNECTION_DISTANCE * this.CONNECTION_DISTANCE) {
                    connectionsCount++;
                    const dist = Math.sqrt(distSq);
                    
                    const depthFactor = (1 - (n1.z + n2.z)/2);
                    const alpha = (1 - dist / this.CONNECTION_DISTANCE) * 0.5 * depthFactor;
                    
                    if (alpha > 0.01) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 179, 0, ${alpha})`;
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();

                        if (Math.random() < 0.001) {
                            this.packets.push(new DataPacket(n1, n2));
                        }
                    }
                }
            }
        }
        ctx.restore();

        for (let i = this.packets.length - 1; i >= 0; i--) {
            if (this.packets[i].update(dtMs)) {
                this.packets.splice(i, 1);
            } else {
                this.packets[i].draw(ctx);
            }
        }

        this.nodes.sort((a,b) => b.z - a.z).forEach(n => n.draw(ctx));

        this.drawHUD(time * 1000);
    }

    private drawHUD(tMs: number) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 179, 0, 0.4)';
        ctx.font = '12px "Courier New", monospace';
        
        ctx.fillText(`GLOBAL ROUTING MESH // ONLINE`, 20, 30);
        ctx.fillText(`ACTIVE NODES: ${this.nodes.length}`, 20, 50);
        ctx.fillText(`DATA PACKETS: ${this.packets.length}`, 20, 70);
        ctx.fillText(`LATENCY: ${(10 + Math.sin(tMs*0.001)*5).toFixed(1)}ms`, 20, 90);
        
        ctx.textAlign = 'right';
        ctx.fillText(`DECENTRALIZED CHUNK V4`, this.width - 20, 30);
        
        const pulse = (tMs * 0.05) % this.width;
        ctx.fillStyle = 'rgba(255, 179, 0, 0.05)';
        ctx.fillRect(pulse, 0, this.width/4, this.height);

        ctx.restore();
    }
}

export function startNetworkingAnimation(canvasId: string) {
    new NetworkingRenderer(canvasId).start();
}
