import { BaseRenderer } from '../../core/BaseRenderer';

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number = 1.0;
    color: string;
    size: number;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = Math.random() * 15 + 5;
        this.color = color;
        this.size = Math.random() * 5 + 2;
    }

    update(): boolean {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        return this.life > 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

export class ThrustRenderer extends BaseRenderer {
    private thrust: number = 0;
    private state: 'charging' | 'max' | 'cooldown' = 'charging';
    private countdown: number = 3;
    private particles: Particle[] = [];
    private shake: number = 0;

    protected init(): void {
        this.thrust = 0;
        this.state = 'charging';
        this.countdown = 3;
        this.particles = [];
        this.shake = 0;
    }

    protected render(dt: number, time: number): void {
        const ctx = this.ctx;

        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        if (this.shake > 0) {
            ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
            this.shake *= 0.9;
        }

        const gW = 100;
        const gH = Math.min(500, this.height * 0.6);
        const gX = this.cx - gW / 2;
        const gY = this.cy - gH / 2;

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.strokeRect(gX, gY, gW, gH);

        if (this.state === 'charging') {
            this.thrust += dt * 25; 
            if (this.thrust >= 100) {
                this.thrust = 100;
                this.state = 'max';
                this.countdown = 3;
                this.shake = 15;
            }
        } else if (this.state === 'max') {
            this.countdown -= dt;
            this.shake = 10;
            for (let i = 0; i < 5; i++) {
                this.particles.push(new Particle(gX + gW / 2 + (Math.random() - 0.5) * 80, gY + gH, '#ff4400'));
            }
            if (this.countdown <= 0) this.state = 'cooldown';
        } else if (this.state === 'cooldown') {
            this.thrust -= dt * 50;
            if (this.thrust <= 0) {
                this.thrust = 0;
                this.state = 'charging';
            }
        }

        let color = '#00ccff';
        if (this.thrust >= 70) color = '#ffcc00';
        if (this.thrust >= 95) color = '#ff0000';

        const fillH = (this.thrust / 100) * gH;
        ctx.fillStyle = color;
        if (this.thrust >= 95) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = color;
        }
        ctx.fillRect(gX + 5, gY + gH - fillH + 5, gW - 10, fillH - 10);
        ctx.shadowBlur = 0;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update()) {
                this.particles.splice(i, 1);
            } else {
                this.particles[i].draw(ctx);
            }
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('THRUST GAUGE', this.cx, gY - 40);
        ctx.font = 'bold 50px "Courier New"';
        ctx.fillStyle = color;
        ctx.fillText(Math.floor(this.thrust) + '%', this.cx, gY + gH + 60);

        if (this.state === 'max') {
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 30px "Courier New"';
            ctx.fillText('MAX POWER!', this.cx, gY - 80);
            ctx.font = '20px "Courier New"';
            ctx.fillText('RESET IN: ' + Math.ceil(this.countdown), this.cx, gY - 110);
        }

        ctx.restore();
    }
}

export function startThrustAnimation(canvasId: string) {
    new ThrustRenderer(canvasId).start();
}
