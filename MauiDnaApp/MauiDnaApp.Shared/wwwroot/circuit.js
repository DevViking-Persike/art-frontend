export function startCircuitAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 800;

    const traces = [];
    const pulses = [];
    const vias = [];
    let core;

    const COLORS = {
        bg: '#000000',
        grid: 'rgba(0, 100, 255, 0.1)',
        trace: '#00ffff',      // Cyan Neon
        pulse: '#ffffff',     // Pure White
        core: '#00ffff',
        glow: 'rgba(0, 255, 255, 0.5)'
    };

    class Trace {
        constructor(startX, startY, dirX, dirY, lengthRemaining, isOriginal = false) {
            this.segments = [{x: startX, y: startY, tx: startX, ty: startY}];
            this.currentX = startX;
            this.currentY = startY;
            this.dirX = dirX;
            this.dirY = dirY;
            this.lengthRemaining = lengthRemaining;
            this.isDone = false;
            this.speed = 4;
            this.isOriginal = isOriginal;
            
            vias.push({x: startX, y: startY});
        }

        update() {
            if (this.isDone) return;

            const nextX = this.currentX + this.dirX * this.speed;
            const nextY = this.currentY + this.dirY * this.speed;

            // CORE COLLISION (Don't re-enter core)
            const distToCore = Math.sqrt(Math.pow(nextX - 400, 2) + Math.pow(nextY - 400, 2));
            if (distToCore < 85 && (!this.isOriginal || this.lengthRemaining < 100)) {
                this.isDone = true;
                return;
            }

            // BOUNDARY CHECK
            if (nextX < 0 || nextX > 800 || nextY < 0 || nextY > 800) {
                this.isDone = true;
                return;
            }

            const last = this.segments[this.segments.length - 1];
            last.tx = nextX;
            last.ty = nextY;
            this.currentX = nextX;
            this.currentY = nextY;
            this.lengthRemaining -= this.speed;

            if (this.lengthRemaining <= 0) {
                this.isDone = true;
                vias.push({x: this.currentX, y: this.currentY});
                return;
            }

            // Tron-style 45/90 degree turns
            if (Math.random() < 0.03 && this.lengthRemaining > 50) {
                const turnChance = Math.random();
                let nextDirX = this.dirX;
                let nextDirY = this.dirY;

                if (turnChance < 0.5) {
                    // 90 degree turn
                    const side = Math.random() > 0.5 ? 1 : -1;
                    nextDirX = this.dirY * side;
                    nextDirY = this.dirX * -side;
                } else {
                    // 45 degree turn (more Tron-like)
                    const side = Math.random() > 0.5 ? 1 : -1;
                    nextDirX = (this.dirX + this.dirY * side) / 1.414;
                    nextDirY = (this.dirY - this.dirX * side) / 1.414;
                }
                
                vias.push({x: this.currentX, y: this.currentY});
                this.segments.push({x: this.currentX, y: this.currentY, tx: this.currentX, ty: this.currentY});
                this.dirX = nextDirX;
                this.dirY = nextDirY;
                this.isOriginal = false;
            }

            // Branching
            if (Math.random() < 0.02 && traces.length < 200) {
                const side = Math.random() > 0.5 ? 1 : -1;
                traces.push(new Trace(
                    this.currentX, this.currentY, 
                    this.dirY * side, this.dirX * -side, 
                    Math.random() * 300 + 100, false
                ));
            }
        }

        draw() {
            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = COLORS.trace;
            ctx.beginPath();
            ctx.strokeStyle = COLORS.trace;
            ctx.lineWidth = 2;
            this.segments.forEach(seg => {
                ctx.moveTo(seg.x, seg.y);
                ctx.lineTo(seg.tx, seg.ty);
            });
            ctx.stroke();
            
            // Core line highlight
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.restore();
        }
    }

    class Pulse {
        constructor(trace) {
            this.trace = trace;
            this.segmentIndex = 0;
            this.progress = 0;
            this.speed = 8;
        }
        update() {
            this.progress += this.speed;
            const seg = this.trace.segments[this.segmentIndex];
            const dist = Math.sqrt(Math.pow(seg.tx - seg.x, 2) + Math.pow(seg.ty - seg.y, 2));
            if (this.progress >= dist) {
                this.segmentIndex++;
                this.progress = 0;
                if (this.segmentIndex >= this.trace.segments.length) return false;
            }
            return true;
        }
        draw() {
            const seg = this.trace.segments[this.segmentIndex];
            const angle = Math.atan2(seg.ty - seg.y, seg.tx - seg.x);
            const x = seg.x + Math.cos(angle) * this.progress;
            const y = seg.y + Math.sin(angle) * this.progress;
            
            ctx.save();
            ctx.fillStyle = COLORS.pulse;
            ctx.shadowBlur = 20;
            ctx.shadowColor = COLORS.trace;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Trail
            const trailLen = 40;
            const tx = x - Math.cos(angle) * trailLen;
            const ty = y - Math.sin(angle) * trailLen;
            const grad = ctx.createLinearGradient(x, y, tx, ty);
            grad.addColorStop(0, COLORS.trace);
            grad.addColorStop(1, 'transparent');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
            ctx.restore();
        }
    }

    function drawGrid() {
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, width, height);
        
        ctx.save();
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;
        for(let i=0; i<=width; i+=40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
        }
        ctx.restore();
    }

    function drawCore() {
        ctx.save();
        ctx.translate(400, 400);
        
        // Glow
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
        grad.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2); ctx.fill();

        // Identity Disk Style
        ctx.strokeStyle = COLORS.trace;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.trace;
        ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.stroke();
        
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.stroke();
        
        // Internal rotating segments
        ctx.rotate(Date.now() * 0.001);
        for(let i=0; i<4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(40, 0); ctx.lineTo(55, 0);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    function init() {
        // Initial bursts from the core
        for(let i=0; i<12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const startX = 400 + Math.cos(angle) * 80;
            const startY = 400 + Math.sin(angle) * 80;
            traces.push(new Trace(startX, startY, Math.cos(angle), Math.sin(angle), Math.random() * 400 + 200, true));
        }
        requestAnimationFrame(animate);
    }

    function animate() {
        drawGrid();
        drawCore();
        
        let allDone = true;
        traces.forEach(t => {
            t.update();
            t.draw();
            if (!t.isDone) allDone = false;
        });

        if (allDone && Math.random() < 0.1) {
            const rt = traces[Math.floor(Math.random() * traces.length)];
            pulses.push(new Pulse(rt));
        }

        for (let i = pulses.length - 1; i >= 0; i--) {
            if (!pulses[i].update()) { pulses.splice(i, 1); } else { pulses[i].draw(); }
        }
        requestAnimationFrame(animate);
    }

    init();
}
