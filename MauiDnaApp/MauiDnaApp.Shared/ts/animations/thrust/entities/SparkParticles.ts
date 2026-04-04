export class SparkParticles {
    private particles: { x: number, y: number, vx: number, vy: number, life: number, type: 'spark' | 'data' }[] = [];

    spawn(x: number, y: number, thrustRatio: number, intensity: number) {
        // High thrust = more chaotic sparks
        const count = Math.floor(intensity * 10);
        for(let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 80,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 15 * thrustRatio,
                vy: (Math.random() * 20 + 5) * thrustRatio, // shoot down
                life: 1.0,
                type: 'spark'
            });
        }
        
        // Floating data binary (Matrix style rising up)
        if (Math.random() < 0.2) {
             this.particles.push({
                x: x + (Math.random() > 0.5 ? 200 : -200) + (Math.random() - 0.5) * 100,
                y: y + 200,
                vx: 0,
                vy: -Math.random() * 3 - 1, // rise up
                life: 1.0,
                type: 'data'
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D, dt: number) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx * (60 * dt / 1000);
            p.y += p.vy * (60 * dt / 1000);
            p.life -= 0.02 * (60 * dt / 1000);
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            if (p.type === 'spark') {
                // Bright intense line
                ctx.strokeStyle = `rgba(255, ${Math.floor(p.life * 255)}, 0, ${p.life})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx, p.y - p.vy * 2); // stretch based on velocity
                ctx.stroke();
            } else if (p.type === 'data') {
                // Rising binary numbers
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = `rgba(0, 255, 255, ${p.life * 0.8})`;
                ctx.font = '14px Courier New';
                const char = Math.random() > 0.5 ? '1' : '0';
                ctx.fillText(char, p.x, p.y);
                ctx.globalCompositeOperation = 'lighter';
            }
        }
        
        ctx.restore();
    }
}
