import { CACTI } from '../data';

export class Desert {
    private layers: { type: string, depth: number, color: string, shapes: any[] }[] = [];
    
    init(w: number, h: number) {
        this.layers = [];
        
        // Pitch black silhouettes for maximum contrast with the neon cosmic sky
        this.layers.push({
            type: 'mountains', depth: 0.1, color: '#110517',
            shapes: this.generateMountains(w, 0.6)
        });
        
        this.layers.push({
            type: 'mesas', depth: 0.3, color: '#09020d',
            shapes: [
                { x: 0.05, w: 0.2, h: 0.3, topBase: 0.3, type: 'plateau' },
                { x: 0.4, w: 0.08, h: 0.25, topBase: 0.5, type: 'mitten' },
                { x: 0.7, w: 0.18, h: 0.35, topBase: 0.4, type: 'plateau' },
            ]
        });
        
        this.layers.push({
            type: 'mesas', depth: 0.6, color: '#030005',
            shapes: [
                { x: 0.2, w: 0.08, h: 0.45, topBase: 0.6, type: 'spire' },
                { x: 0.55, w: 0.25, h: 0.38, topBase: 0.25, type: 'plateau' },
                { x: 0.85, w: 0.1, h: 0.35, topBase: 0.3, type: 'mitten' }
            ]
        });
        
        this.layers.push({
            type: 'hills', depth: 0.85, color: '#000000',
            shapes: this.generateHills(w, 0.85)
        });
    }
    
    private generateMountains(w: number, baseH: number) {
        const pts = [];
        for(let x=-0.5; x<=1.5; x+=0.01) {
            pts.push(baseH - Math.sin(x*12)*0.04 - Math.cos(x*5+2)*0.06);
        }
        return pts;
    }
    
    private generateHills(w: number, baseH: number) {
        const pts = [];
        for(let x=-0.5; x<=1.5; x+=0.01) {
            pts.push(baseH - Math.sin(x*3)*0.02 - Math.sin(x*7)*0.01);
        }
        return pts;
    }

    drawMesas(ctx: CanvasRenderingContext2D, w: number, h: number, mouseNX: number) {
        if (this.layers.length === 0) this.init(w, h);

        this.layers.forEach((layer) => {
            const parallax = (mouseNX - 0.5) * layer.depth * w * 0.2;
            
            ctx.fillStyle = layer.color;
            ctx.beginPath();
            
            if (layer.type === 'mountains' || layer.type === 'hills') {
                ctx.moveTo(0, h);
                layer.shapes.forEach((py, idx) => {
                    const px = (-0.5 + idx * 0.01) * w + parallax;
                    ctx.lineTo(px, py * h);
                });
                ctx.lineTo(w, h);
            } else if (layer.type === 'mesas') {
                ctx.moveTo(0, h);
                const baseY = h * 0.9;
                ctx.lineTo(-w*0.5 + parallax, baseY);
                
                layer.shapes.forEach(m => {
                    const mx = m.x * w + parallax;
                    const mw = m.w * w;
                    const mh = m.h * h;
                    const topW = mw * m.topBase;
                    const slope = (mw - topW) / 2;
                    
                    if (m.type === 'plateau') {
                        ctx.lineTo(mx, baseY);
                        ctx.lineTo(mx + slope*0.8, baseY - mh*0.6); 
                        ctx.lineTo(mx + slope, baseY - mh);
                        ctx.lineTo(mx + slope + topW, baseY - mh); 
                        ctx.lineTo(mx + slope + topW + slope*0.2, baseY - mh*0.6); 
                        ctx.lineTo(mx + mw, baseY);
                    } else if (m.type === 'mitten') {
                        ctx.lineTo(mx, baseY);
                        ctx.lineTo(mx + slope, baseY - mh);
                        ctx.lineTo(mx + slope + topW*0.4, baseY - mh); 
                        ctx.lineTo(mx + slope + topW*0.6, baseY - mh*0.6); 
                        ctx.lineTo(mx + slope + topW, baseY - mh*0.8); 
                        ctx.lineTo(mx + mw, baseY);
                    } else if (m.type === 'spire') {
                        ctx.lineTo(mx, baseY);
                        ctx.lineTo(mx + mw*0.3, baseY - mh*0.8);
                        ctx.lineTo(mx + mw*0.4, baseY - mh);
                        ctx.lineTo(mx + mw*0.6, baseY - mh);
                        ctx.lineTo(mx + mw*0.7, baseY - mh*0.8);
                        ctx.lineTo(mx + mw, baseY);
                    }
                });
                ctx.lineTo(w*1.5 + parallax, baseY);
                ctx.lineTo(w, h);
            }
            ctx.fill();
        });
    }

    drawGround(ctx: CanvasRenderingContext2D, w: number, h: number) { }

    drawCacti(ctx: CanvasRenderingContext2D, w: number, h: number, mouseNX: number) {
        const horizonY = h * 0.85;
        const scale = Math.min(w, h) / 900;

        CACTI.forEach(cactus => {
            const parallax = (mouseNX - 0.5) * cactus.depth * w * 0.3;
            const cx = cactus.x * w + parallax;
            if (cx < -100 || cx > w + 100) return;
            
            const baseY = horizonY + 30 * cactus.depth * scale;
            const ch = cactus.height * scale * 1.5;
            const cw = 7 * scale;

            ctx.fillStyle = '#000000'; // Pure black silhouette
            ctx.beginPath();
            
            ctx.roundRect(cx - cw / 2, baseY - ch, cw, ch + 20, 3);
            
            if (cactus.armLeft > 0) {
                const armY = baseY - ch * cactus.armLeft;
                const armLen = 16 * scale;
                ctx.roundRect(cx - cw / 2 - armLen, armY, armLen, cw * 0.9, 3);
                ctx.roundRect(cx - cw / 2 - armLen, armY - armLen * 0.7, cw * 0.9, armLen * 0.7 + cw, 3);
            }
            if (cactus.armRight > 0) {
                const armY = baseY - ch * cactus.armRight;
                const armLen = 12 * scale;
                ctx.roundRect(cx + cw / 2, armY, armLen, cw * 0.9, 3);
                ctx.roundRect(cx + cw / 2 + armLen - cw * 0.9, armY - armLen * 0.6, cw * 0.9, armLen * 0.6 + cw, 3);
            }
            ctx.fill();
        });
    }
}
