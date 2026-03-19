export function startThrustAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 800;

    let thrust = 0;
    let state = 'charging'; // 'charging', 'max', 'cooldown'
    let countdown = 3;
    let lastTime = Date.now();
    let particles = [];
    let shake = 0;

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = Math.random() * 15 + 5;
            this.life = 1.0;
            this.color = color;
            this.size = Math.random() * 5 + 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= 0.02;
            return this.life > 0;
        }
        draw(ctx) {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    function animate() {
        const now = Date.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        if (shake > 0) {
            ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
            shake *= 0.9;
        }

        // Gauge background
        const gX = 350, gY = 150, gW = 100, gH = 500;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.strokeRect(gX, gY, gW, gH);

        // Logic
        if (state === 'charging') {
            thrust += dt * 25; // 4 seconds to max
            if (thrust >= 100) {
                thrust = 100;
                state = 'max';
                countdown = 3;
                shake = 15;
            }
        } else if (state === 'max') {
            countdown -= dt;
            shake = 10;
            // Generate particles at bottom
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(gX + gW / 2 + (Math.random() - 0.5) * 80, gY + gH, '#ff4400'));
            }
            if (countdown <= 0) state = 'cooldown';
        } else if (state === 'cooldown') {
            thrust -= dt * 50;
            if (thrust <= 0) {
                thrust = 0;
                state = 'charging';
            }
        }

        // Color selection
        let color = '#00ccff';
        if (thrust >= 70) color = '#ffcc00';
        if (thrust >= 95) color = '#ff0000';

        // Draw bar
        const fillH = (thrust / 100) * gH;
        ctx.fillStyle = color;
        if (thrust >= 95) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = color;
        }
        ctx.fillRect(gX + 5, gY + gH - fillH + 5, gW - 10, fillH - 10);
        ctx.shadowBlur = 0;

        // Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            if (!particles[i].update()) {
                particles.splice(i, 1);
            } else {
                particles[i].draw(ctx);
            }
        }

        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('THRUST GAUGE', width / 2, 100);
        ctx.font = 'bold 50px "Courier New"';
        ctx.fillStyle = color;
        ctx.fillText(Math.floor(thrust) + '%', width / 2, gY + gH + 80);

        if (state === 'max') {
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 40px "Courier New"';
            ctx.fillText('MAX POWER!', width / 2, 130);
            ctx.font = '20px "Courier New"';
            ctx.fillText('RESET IN: ' + Math.ceil(countdown), width / 2, 60);
        }

        ctx.restore();
        requestAnimationFrame(animate);
    }

    animate();
}
