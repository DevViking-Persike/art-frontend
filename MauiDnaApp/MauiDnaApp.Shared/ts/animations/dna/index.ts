import { BaseRenderer } from '../../core/BaseRenderer';

const CODE_SNIPPETS = [
    "const neural_link = allocate(0xFFFF);",
    "await matrix.sync();",
    "if (entropy < threshold) rebuild();",
    "class Hologram extends Entity {\n  render() { emit(PHOTON); }\n}",
    "export function decode(dna) {\n  return compile(dna.sequence);\n}",
    "struct Helix { int basePairs; };",
    "import { quantum } from '@core';",
    "sys.override_protocols(true);",
    "float d = length(p) - radius;",
    "vec3 color = mix(cyan, magenta, v);"
];

class DnaParticle {
    public colorA = '#00f2ff';
    public colorB = '#b200ff';
    public codeFrag: string;

    constructor(public index: number, public total: number, public isStrandA: boolean) {
        this.codeFrag = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    }

    get3D(t: number, mY: number) {
        const spacing = 20;
        const yScrollSpeed = 60;
        
        const totalHeight = this.total * spacing / 2; 
        const yOffset = (this.index * spacing) - (t * yScrollSpeed) % totalHeight;
        
        let y = yOffset;
        if (y < -100) y += totalHeight + 200;
        
        const frequency = 0.015;
        const phase = this.isStrandA ? 0 : Math.PI;
        const userRot = (mY - 0.5) * Math.PI * 4;
        
        const angle = y * frequency + phase + t * 0.5 + userRot;
        const radius = 120 + Math.sin(y * 0.01 + t) * 10;
        
        let x = Math.cos(angle) * radius;
        let z = Math.sin(angle) * radius;
        
        let morphed = false;
        let alpha = 1.0;
        let renderText: string | null = null;
        
        const breakPoint = Math.sin(y * 0.005 - t * 2) * 50; 
        
        if (x > 80 + breakPoint) {
            morphed = true;
            x += Math.pow((x - 80), 1.2);
            alpha = Math.max(0, 1 - (x - 150) / 400);
            
            if (Math.random() < 0.02 && alpha > 0.3) {
                 renderText = this.codeFrag;
            }
        }
        return { x, y, z, morphed, alpha, renderText };
    }
}

interface FloatingText {
    text: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
}

export class DnaRenderer extends BaseRenderer {
    private dnaPairs: { a: DnaParticle, b: DnaParticle }[] = [];
    private floatingCode: FloatingText[] = [];
    private readonly NUM_PAIRS = 80;

    protected init(): void {
        this.dnaPairs = [];
        this.floatingCode = [];
        for (let i = 0; i < this.NUM_PAIRS; i++) {
            this.dnaPairs.push({
                a: new DnaParticle(i, this.NUM_PAIRS, true),
                b: new DnaParticle(i, this.NUM_PAIRS, false)
            });
        }
    }

    protected render(dt: number, time: number): void {
        const ctx = this.ctx;

        const grad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(this.width, this.height) * 0.8);
        grad.addColorStop(0, '#0d111a');
        grad.addColorStop(1, '#030508');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.strokeStyle = '#00f2ff';
        const gridSpc = 50;
        for (let i = 0; i < this.width; i += gridSpc) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, this.height); ctx.stroke(); }
        for (let j = 0; j < this.height; j += gridSpc) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(this.width, j); ctx.stroke(); }
        ctx.restore();

        const renderList: any[] = [];
        const mY = this.mouse.active ? this.mouse.ny : 0.5 + Math.sin(time * 0.2) * 0.2;

        this.dnaPairs.forEach(pair => {
            const pA = pair.a.get3D(time, mY);
            const pB = pair.b.get3D(time, mY);
            
            (pA as any).screenX = this.cx + pA.x - 100;
            (pA as any).screenY = pA.y + (this.height / 2 - this.NUM_PAIRS * 10);
            
            (pB as any).screenX = this.cx + pB.x - 100;
            (pB as any).screenY = pB.y + (this.height / 2 - this.NUM_PAIRS * 10);

            if (pA.renderText && Math.random() < 0.1) {
                this.floatingCode.push({
                    text: pA.renderText,
                    x: (pA as any).screenX + 20,
                    y: (pA as any).screenY,
                    vx: 2 + Math.random() * 2,
                    vy: (Math.random() - 0.5),
                    alpha: pA.alpha
                });
            }

            renderList.push({ type: 'node', data: pA, color: pair.a.colorA });
            renderList.push({ type: 'node', data: pB, color: pair.b.colorB });
            renderList.push({ type: 'link', pA, pB });
        });

        renderList.sort((a, b) => {
            let zA = a.type === 'link' ? (a.pA.z + a.pB.z) / 2 : a.data.z;
            let zB = b.type === 'link' ? (b.pA.z + b.pB.z) / 2 : b.data.z;
            return zA - zB;
        });

        this.drawHUD(time);

        renderList.forEach(item => {
            if (item.type === 'link') {
                const { pA, pB } = item;
                const zDist = (pA.z + pB.z) / 2;
                const zAlpha = (zDist + 200) / 400;
                const baseAlpha = Math.min(pA.alpha, pB.alpha) * zAlpha * 0.6;
                
                if (baseAlpha > 0.05 && !pA.morphed && !pB.morphed) {
                    ctx.save();
                    ctx.globalAlpha = baseAlpha;
                    
                    const lGrad = ctx.createLinearGradient(pA.screenX, pA.screenY, pB.screenX, pB.screenY);
                    lGrad.addColorStop(0, '#00f2ff');
                    lGrad.addColorStop(1, '#b200ff');
                    
                    ctx.strokeStyle = lGrad;
                    ctx.lineWidth = 1.5 + (zDist + 150) / 100;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#00f2ff';
                    
                    ctx.beginPath();
                    ctx.moveTo(pA.screenX, pA.screenY);
                    ctx.lineTo(pB.screenX, pB.screenY);
                    ctx.stroke();
                    ctx.restore();
                }
            } else if (item.type === 'node') {
                const { data, color } = item;
                const zAlpha = (data.z + 200) / 400;
                const finalAlpha = data.alpha * zAlpha;

                if (finalAlpha > 0.05) {
                    const size = (3 + (data.z + 150) / 40) * (data.morphed ? 0.5 : 1);
                    
                    ctx.save();
                    ctx.globalAlpha = finalAlpha;
                    ctx.fillStyle = color;
                    ctx.shadowBlur = data.morphed ? 5 : 15;
                    ctx.shadowColor = color;
                    
                    ctx.beginPath();
                    ctx.arc(data.screenX, data.screenY, Math.max(0.1, size), 0, Math.PI * 2);
                    ctx.fill();

                    if (!data.morphed) {
                        ctx.globalAlpha = finalAlpha * 0.8;
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(data.screenX, data.screenY, Math.max(0.1, size * 0.4), 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                }
            }
        });

        ctx.font = '13px "Courier New", monospace';
        ctx.textAlign = 'left';
        
        for (let i = this.floatingCode.length - 1; i >= 0; i--) {
            const frag = this.floatingCode[i];
            
            ctx.save();
            ctx.globalAlpha = frag.alpha * 0.8;
            ctx.fillStyle = `hsl(180, 100%, ${60 + Math.sin(time*5)*20}%)`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00f2ff';
            
            ctx.fillText(frag.text, frag.x, frag.y);
            ctx.restore();

            frag.x += frag.vx;
            frag.y += frag.vy;
            frag.alpha -= 0.005;
            
            if (frag.alpha <= 0) this.floatingCode.splice(i, 1);
        }
    }

    private drawHUD(t: number) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
        ctx.font = '12px "Courier New", monospace';
        
        ctx.fillText(`BIOMETRIC MORPH SEQUENCE: RUNNING`, 20, 30);
        ctx.fillText(`HELIX STRANDS: ${this.NUM_PAIRS * 2}`, 20, 50);
        ctx.fillText(`TRANSCODING EFFICIENCY: ${(98 + Math.sin(t)*2).toFixed(2)}%`, 20, 70);
        
        ctx.textAlign = 'right';
        ctx.fillText(`TARGET: SOURCE CODE`, this.width - 20, 30);
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(178, 0, 255, 0.5)';
        for(let i=0; i<30; i++) {
            ctx.lineTo(this.width - 150 + i*4, 70 - Math.random() * 20 - Math.sin(t*2 + i)*10);
        }
        ctx.stroke();

        ctx.restore();
    }
}

export function startDNAAnimation(canvasId: string) {
    new DnaRenderer(canvasId).start();
}
