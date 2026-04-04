export type CosmicType = 'majestic_whale' | 'neon_fish' | 'light_beam_fish';

export interface CosmicData {
    id: number;
    type: CosmicType;
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    depth: number;
    phase: number;
    swimSpeed: number;
    color: string;
    targetY?: number;
}

export class CosmicCreature {
    private data: CosmicData;

    constructor(data: CosmicData) {
        this.data = data;
    }

    update(dt: number, time: number, w: number, h: number, mouseNY: number) {
        const d = this.data;
        d.x -= d.speedX * (60 * dt / 1000); 
        d.phase += d.swimSpeed * dt * 0.001;
        d.y += Math.sin(d.phase) * d.speedY;
        
        if (d.type === 'light_beam_fish' && d.targetY !== undefined) {
             d.y += (d.targetY - d.y) * 0.02 * (60 * dt / 1000);
             d.targetY -= 0.5 * (60 * dt / 1000); 
        }

        d.y += (mouseNY - 0.5) * d.depth * 0.2;

        if (d.x < -d.size * 5) {
            d.x = w + Math.random() * w * 0.5;
            if (d.type === 'light_beam_fish') {
                d.targetY = h * 0.8 + Math.random() * h * 0.2;
                d.y = d.targetY;
            } else {
                d.y = h * 0.1 + Math.random() * h * 0.6;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, time: number, scale: number) {
        const d = this.data;
        const s = d.size * scale;
        
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.globalCompositeOperation = 'lighter';
        
        if (d.type === 'majestic_whale') {
            this.drawGhostWhale(ctx, s, d.color, d.phase);
        } else if (d.type === 'neon_fish') {
            this.drawGhostFish(ctx, s, d.color, d.phase, 0.8);
        } else if (d.type === 'light_beam_fish') {
            this.drawGhostFish(ctx, s, d.color, d.phase, 1.0);
            
            const beamAura = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 6);
            beamAura.addColorStop(0, `rgba(255, 255, 255, 0.4)`);
            beamAura.addColorStop(0.2, `rgba(200, 255, 255, 0.1)`);
            beamAura.addColorStop(1, 'transparent');
            ctx.fillStyle = beamAura;
            ctx.beginPath(); ctx.arc(0, 0, s * 6, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore();
    }

    private drawGhostWhale(ctx: CanvasRenderingContext2D, s: number, color: string, phase: number) {
        const tailSwing = Math.sin(phase * 1.5) * s * 0.3;
        const finSwing = Math.sin(phase * 2) * s * 0.2;

        const buildBody = () => {
            ctx.beginPath();
            ctx.moveTo(-s * 0.6, 0); // nose
            ctx.bezierCurveTo(-s * 0.4, -s * 0.3, s * 0.1, -s * 0.3, s * 0.5, -s * 0.05 + tailSwing * 0.4); // back
            ctx.bezierCurveTo(s * 0.9, tailSwing * 0.7, s * 1.2, tailSwing * 0.9, s * 1.5, tailSwing * 1.4); // tail
            ctx.bezierCurveTo(s * 1.1, tailSwing * 1.1, s * 0.7, s * 0.1 + tailSwing * 0.6, s * 0.5, s * 0.1 + tailSwing * 0.4); // belly up
            ctx.bezierCurveTo(s * 0.1, s * 0.3, -s * 0.3, s * 0.2, -s * 0.6, 0); // belly to nose
            ctx.closePath();
        };

        // 1. Ghostly translucent body fill
        ctx.shadowColor = color;
        ctx.shadowBlur = s * 1.0;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.15; // Very translucent!
        buildBody();
        ctx.fill();

        // 2. Glowing Silhouette Edge
        ctx.shadowBlur = s * 0.5;
        ctx.strokeStyle = color;
        ctx.lineWidth = s * 0.04;
        ctx.globalAlpha = 0.9;
        ctx.stroke();

        // 3. Glowing Internal SKELETON (Fish Night Style)
        ctx.shadowBlur = s * 0.8;
        ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = '#ffffff'; 
        ctx.lineWidth = s * 0.03;
        ctx.globalAlpha = 0.9;

        // Central Spine
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, 0);
        ctx.quadraticCurveTo(0, -s * 0.1, s * 0.6, tailSwing * 0.5);
        ctx.quadraticCurveTo(s * 0.9, tailSwing * 0.7, s * 1.4, tailSwing * 1.3);
        ctx.stroke();

        // Ribs branching off spine
        ctx.lineWidth = s * 0.02;
        for(let i=0; i<8; i++) {
            const t = i / 8;
            const sx = -s * 0.3 + t * s * 1.2;
            const sy = Math.sin(t * Math.PI) * (-s * 0.1) + t * tailSwing * 0.7; // rough curve
            const ribLen = Math.sin(t * Math.PI) * s * 0.15; // wide in middle, tapers
            const ribAngle = Math.PI * 0.2 + t * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(sx - ribLen * 0.5, sy + ribLen, sx + Math.cos(ribAngle) * ribLen, sy + Math.sin(ribAngle) * ribLen * 1.5);
            ctx.stroke();
        }

        // 4. Ghostly Fins (Translucent with glowing edges)
        ctx.shadowColor = color;
        ctx.shadowBlur = s * 0.5;
        ctx.lineWidth = s * 0.02;

        const buildPectoral = () => {
            ctx.beginPath();
            ctx.moveTo(-s * 0.1, s * 0.15); 
            ctx.bezierCurveTo(-s * 0.2, s * 0.5, -s * 0.1, s * 0.8 + finSwing, s * 0.2, s * 1.0 + finSwing); 
            ctx.bezierCurveTo(0, s * 0.6 + finSwing, 0, s * 0.3, 0.1 * s, s * 0.2);
            ctx.closePath();
        };
        ctx.globalAlpha = 0.2; ctx.fillStyle = color; buildPectoral(); ctx.fill();
        ctx.globalAlpha = 0.8; ctx.strokeStyle = color; ctx.stroke();

        // Elaborate flowing tail fluke (split tail)
        const buildFluke = () => {
            ctx.beginPath();
            ctx.moveTo(s * 1.4, tailSwing * 1.3);
            ctx.bezierCurveTo(s * 1.6, tailSwing * 1.5, s * 1.8, s * 0.2 + tailSwing * 1.8, s * 2.2, tailSwing * 2.2);
            ctx.lineTo(s * 1.7, s * 0.05 + tailSwing * 1.6);
            ctx.bezierCurveTo(s * 1.9, -s * 0.2 + tailSwing * 1.5, s * 1.8, -s * 0.3 + tailSwing * 1.3, s * 2.1, -s * 0.1 + tailSwing * 1.0);
            ctx.lineTo(s * 1.5, -s * 0.05 + tailSwing * 1.2);
            ctx.closePath();
        };
        ctx.globalAlpha = 0.15; ctx.fillStyle = color; buildFluke(); ctx.fill();
        ctx.globalAlpha = 0.8; ctx.strokeStyle = color; ctx.stroke();
    }

    private drawGhostFish(ctx: CanvasRenderingContext2D, s: number, color: string, phase: number, alpha: number) {
        const tailSwing = Math.sin(phase * 3) * s * 0.3;
        
        ctx.shadowBlur = 0; // Optimization: Disable expensive shadows for 120 entities

        const buildFish = () => {
            ctx.beginPath();
            ctx.moveTo(-s * 0.5, 0); 
            ctx.quadraticCurveTo(0, -s * 0.3, s * 0.5, tailSwing * 0.5); 
            ctx.lineTo(s * 0.8, -s * 0.2 + tailSwing); 
            ctx.lineTo(s * 0.6, tailSwing); 
            ctx.lineTo(s * 0.8, s * 0.2 + tailSwing); 
            ctx.lineTo(s * 0.5, tailSwing * 0.5); 
            ctx.quadraticCurveTo(0, s * 0.3, -s * 0.5, 0); 
        };

        // Ghostly body
        ctx.globalAlpha = alpha * 0.15;
        ctx.fillStyle = color;
        buildFish();
        ctx.fill();

        // Glowing Silhouette
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = color;
        ctx.lineWidth = s * 0.04;
        ctx.stroke();

        // Bright internal skeleton core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.ellipse(-s * 0.1, 0, s * 0.15, s * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Mini spine line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = s * 0.03;
        ctx.beginPath();
        ctx.moveTo(s * 0.1, tailSwing * 0.1);
        ctx.lineTo(s * 0.4, tailSwing * 0.4);
        ctx.stroke();
    }

    get z(): number { return this.data.depth; }
}
