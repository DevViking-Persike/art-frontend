import { MouseState } from './types';
import { project3D } from './mathUtils';
import { CircuitNode } from './entities/CircuitNode';
import { DataSignal } from './entities/DataSignal';

export class CircuitRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number = 0;
    private height: number = 0;
    private cx: number = 0;
    private cy: number = 0;
    private time: number = 0;
    private mouse: MouseState = { x: 0.5, y: 0.5, active: false };
    
    // Constants
    private readonly SPEED = 400;
    private readonly FOV = 400;
    private readonly GRID_SIZE = 200;
    private readonly PLANE_Y_OFFSET = 250;
    private readonly GRID_Z_DEPTH = 4000;
    private readonly GRID_X_WIDTH = 2000;

    private nodes: CircuitNode[] = [];
    private signals: DataSignal[] = [];
    private verticalGrad: CanvasGradient | null = null;
    private animationFrameId: number | null = null;

    constructor(canvasId: string) {
        const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
        if (!el) throw new Error(`Canvas with id ${canvasId} not found`);
        this.canvas = el;
        this.ctx = this.canvas.getContext('2d')!;

        this.bindEvents();
        this.generateBoard();
        this.signals = Array.from({ length: 15 }, () => new DataSignal(this.GRID_Z_DEPTH, this.GRID_X_WIDTH, this.GRID_SIZE, this.PLANE_Y_OFFSET));
        
        this.animate = this.animate.bind(this);
    }

    private bindEvents() {
        window.addEventListener('resize', this.resize.bind(this));
        this.resize();

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) / rect.width;
            this.mouse.y = (e.clientY - rect.top) / rect.height;
            this.mouse.active = true;
        });
        this.canvas.addEventListener('mouseleave', () => this.mouse.active = false);
    }

    private resize() {
        const container = this.canvas.parentElement;
        if (!container) return;
        this.canvas.width = container.clientWidth || window.innerWidth;
        this.canvas.height = container.clientHeight || window.innerHeight;
    }

    private generateBoard() {
        this.nodes = [];
        for (let z = 0; z < this.GRID_Z_DEPTH; z += this.GRID_SIZE) {
            for (let x = -this.GRID_X_WIDTH; x <= this.GRID_X_WIDTH; x += this.GRID_SIZE) {
                if (Math.random() > 0.4) {
                    let hMod = 0;
                    if (Math.random() > 0.9) hMod = 50 + Math.random() * 150;
                    this.nodes.push(new CircuitNode(x, z, this.PLANE_Y_OFFSET, hMod));
                }
            }
        }
    }

    private drawHUD(w: number, h: number, t: number) {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.3)';
        ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.font = '12px "Courier New", monospace';

        ctx.fillText(`SYS.RENDER_LOOP: OPTIMAL`, 20, 30);
        ctx.fillText(`Z-BUFFER DEPTH: ${this.GRID_Z_DEPTH}u`, 20, 50);
        ctx.fillText(`THROUGHPUT: ${(1240 + Math.sin(t*5)*30).toFixed(0)} GB/s`, 20, 70);

        ctx.beginPath();
        const chSize = 10;
        ctx.moveTo(w/2 - chSize, h/2); ctx.lineTo(w/2 - 3, h/2);
        ctx.moveTo(w/2 + chSize, h/2); ctx.lineTo(w/2 + 3, h/2);
        ctx.moveTo(w/2, h/2 - chSize); ctx.lineTo(w/2, h/2 - 3);
        ctx.moveTo(w/2, h/2 + chSize); ctx.lineTo(w/2, h/2 + 3);
        ctx.stroke();

        ctx.restore();
    }

    public start() {
        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    private animate(timestamp: number) {
        if (!document.getElementById(this.canvas.id)) {
            window.removeEventListener('resize', this.resize);
            if(this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
            return;
        }

        const ctx = this.ctx;

        if (!this.verticalGrad || this.canvas.width !== this.width || this.canvas.height !== this.height) {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.cx = this.width / 2;
            this.cy = this.height / 2;
            this.verticalGrad = ctx.createLinearGradient(this.cx, this.cy, this.cx, this.height);
            this.verticalGrad.addColorStop(0, 'rgba(0, 150, 255, 0.0)');
            this.verticalGrad.addColorStop(0.5, 'rgba(0, 150, 255, 0.3)');
            this.verticalGrad.addColorStop(1, 'rgba(0, 150, 255, 0.8)');
        }

        const dt = 16 / 1000;
        this.time += dt;

        ctx.fillStyle = '#010308';
        ctx.fillRect(0, 0, this.width, this.height);

        let camTilt = 0;
        let camPan = 0;
        if (this.mouse.active) {
            camTilt = (this.mouse.y - 0.5) * 200;
            camPan = (this.mouse.x - 0.5) * -500;
        } else {
            camTilt = Math.sin(this.time * 0.5) * 50;
            camPan = Math.sin(this.time * 0.3) * 100;
        }

        const zShift = this.SPEED * dt;
        ctx.globalCompositeOperation = 'screen';

        // Draw Base Grid
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.15)';
        ctx.lineWidth = 1;

        for (let z = 0; z < this.GRID_Z_DEPTH; z += this.GRID_SIZE) {
            let actualZ = ((z - (this.time * this.SPEED)) % this.GRID_Z_DEPTH);
            if (actualZ < 0) actualZ += this.GRID_Z_DEPTH;
            
            const pLeft = project3D(-this.GRID_X_WIDTH + camPan, this.PLANE_Y_OFFSET + camTilt, actualZ, this.FOV, this.cx, this.cy);
            const pRight = project3D(this.GRID_X_WIDTH + camPan, this.PLANE_Y_OFFSET + camTilt, actualZ, this.FOV, this.cx, this.cy);
            
            if (pLeft && pRight) {
                const alpha = Math.min(1, actualZ / 200) * Math.max(0, 1 - actualZ / this.GRID_Z_DEPTH);
                ctx.strokeStyle = `rgba(0, 150, 255, ${alpha * 0.4})`;
                ctx.beginPath();
                ctx.moveTo(pLeft.sx, pLeft.sy);
                ctx.lineTo(pRight.sx, pRight.sy);
                ctx.stroke();
            }
        }

        for (let x = -this.GRID_X_WIDTH; x <= this.GRID_X_WIDTH; x += this.GRID_SIZE) {
            ctx.beginPath();
            let started = false;
            
            for (let z = 0; z < this.GRID_Z_DEPTH; z += this.GRID_SIZE * 2) {
                const proj = project3D(x + camPan, this.PLANE_Y_OFFSET + camTilt, z, this.FOV, this.cx, this.cy);
                if (proj) {
                    if (!started) {
                        ctx.moveTo(proj.sx, proj.sy);
                        started = true;
                    } else {
                        ctx.lineTo(proj.sx, proj.sy);
                    }
                }
            }
            if (started && this.verticalGrad) {
                ctx.strokeStyle = this.verticalGrad;
                ctx.stroke();
            }
        }

        // Draw Data Signals
        this.signals.forEach(sig => {
            sig.update(dt, zShift);
            
            let p1, p2;
            if (sig.direction === 'z') {
                p1 = project3D(sig.x + camPan, sig.y + camTilt, sig.z, this.FOV, this.cx, this.cy);
                p2 = project3D(sig.x + camPan, sig.y + camTilt, sig.z + sig.length, this.FOV, this.cx, this.cy);
            } else {
                p1 = project3D(sig.x + camPan, sig.y + camTilt, sig.z, this.FOV, this.cx, this.cy);
                p2 = project3D(sig.x + (sig.speed > 0 ? -sig.length : sig.length) + camPan, sig.y + camTilt, sig.z, this.FOV, this.cx, this.cy);
            }

            if (p1 && p2) {
                ctx.save();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2 * p1.scale;
                
                ctx.beginPath();
                ctx.moveTo(p1.sx, p1.sy);
                ctx.lineTo(p2.sx, p2.sy);
                ctx.stroke();
                
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); 
                ctx.arc(p1.sx, p1.sy, 3 * p1.scale, 0, Math.PI*2); 
                ctx.fill();
                ctx.restore();
            }
        });

        // Draw Nodes
        const sortedNodes: CircuitNode[] = [];
        this.nodes.forEach(node => {
            node.actualZ = ((node.z - (this.time * this.SPEED)) % this.GRID_Z_DEPTH);
            if (node.actualZ < 0) node.actualZ += this.GRID_Z_DEPTH;
            
            if (node.actualZ > 10) {
                sortedNodes.push(node);
            }
        });
        
        sortedNodes.sort((a,b) => b.actualZ - a.actualZ);

        sortedNodes.forEach(node => {
            node.pulse += dt * node.pulseSpeed;
            const pBase = project3D(node.x + camPan, node.baseY + camTilt, node.actualZ, this.FOV, this.cx, this.cy);
            
            if (!pBase) return;

            const depthAlpha = Math.min(1, node.actualZ / 100) * Math.max(0, 1 - node.actualZ / this.GRID_Z_DEPTH);
            if (depthAlpha <= 0) return;

            ctx.save();
            ctx.globalAlpha = depthAlpha;

            if (node.isTower) {
                const pTop = project3D(node.x + camPan, node.baseY - node.heightModifier + camTilt, node.actualZ, this.FOV, this.cx, this.cy);
                if (pTop) {
                    ctx.strokeStyle = node.color;
                    ctx.lineWidth = (2 * pBase.scale);
                    
                    ctx.beginPath();
                    ctx.moveTo(pBase.sx, pBase.sy);
                    ctx.lineTo(pTop.sx, pTop.sy);
                    ctx.stroke();

                    const p = (Math.sin(node.pulse)+1)/2;
                    ctx.fillStyle = '#ffffff';
                    ctx.globalAlpha = depthAlpha * (0.5 + p*0.5);
                    ctx.beginPath();
                    ctx.arc(pTop.sx, pTop.sy, 4 * pTop.scale, 0, Math.PI*2);
                    ctx.fill();
                }
            } else {
                ctx.fillStyle = node.color;
                ctx.beginPath();
                ctx.arc(pBase.sx, pBase.sy, 4 * pBase.scale, 0, Math.PI*2);
                ctx.fill();
                
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = depthAlpha * 0.8;
                ctx.beginPath();
                ctx.arc(pBase.sx, pBase.sy, 1.5 * pBase.scale, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.restore();
        });

        ctx.globalCompositeOperation = 'source-over';
        
        const vGrad = ctx.createLinearGradient(0, 0, 0, this.height*0.3);
        vGrad.addColorStop(0, 'rgba(1, 3, 8, 1)');
        vGrad.addColorStop(1, 'rgba(1, 3, 8, 0)');
        ctx.fillStyle = vGrad;
        ctx.fillRect(0,0,this.width,this.height);

        this.drawHUD(this.width, this.height, this.time);

        this.animationFrameId = requestAnimationFrame(this.animate);
    }
}
