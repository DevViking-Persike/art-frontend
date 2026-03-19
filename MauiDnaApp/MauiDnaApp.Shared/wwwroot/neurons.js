export function startNeuronsAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 800;

    let neurons = [];
    let pulses = [];
    let frame = 0;

    const COLORS = {
        bg: '#02040a',
        neuron: '#00d4ff',
        pulse: '#ffffff',
        synapse: '#7000ff'
    };

    class Neuron {
        constructor(isBackground = false) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = isBackground ? Math.random() * 0.5 : 0.5 + Math.random() * 0.5;
            this.radius = (isBackground ? 10 : 25) * this.z;
            this.opacity = this.z;
            this.pulseState = Math.random() * Math.PI * 2;
            this.connections = [];
            this.maxConnections = isBackground ? 1 : 3;
        }

        update() {
            this.pulseState += 0.02;
            // Subtle floating movement
            this.x += Math.sin(this.pulseState * 0.5) * 0.2;
            this.y += Math.cos(this.pulseState * 0.5) * 0.2;
        }

        draw(ctx) {
            const glow = (Math.sin(this.pulseState) + 1) * 0.5;
            ctx.save();
            ctx.globalAlpha = this.opacity;
            
            // Outer Aura
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
            grad.addColorStop(0, COLORS.neuron);
            grad.addColorStop(0.5, 'rgba(0, 212, 255, 0.2)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.globalAlpha = this.opacity * (0.3 + glow * 0.2);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = COLORS.neuron;
            ctx.shadowBlur = 15 * glow;
            ctx.shadowColor = COLORS.neuron;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Core Highlight
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.5 * glow;
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }

    class Connection {
        constructor(n1, n2) {
            this.n1 = n1;
            this.n2 = n2;
            this.opacity = Math.min(n1.opacity, n2.opacity) * 0.4;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.strokeStyle = COLORS.neuron;
            ctx.lineWidth = 2 * Math.min(this.n1.z, this.n2.z);
            
            // Organic curved connection
            const midX = (this.n1.x + this.n2.x) / 2 + (Math.random() - 0.5) * 50;
            const midY = (this.n1.y + this.n2.y) / 2 + (Math.random() - 0.5) * 50;
            
            ctx.beginPath();
            ctx.moveTo(this.n1.x, this.n1.y);
            ctx.bezierCurveTo(midX, midY, midX, midY, this.n2.x, this.n2.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    class ElectricPulse {
        constructor(n1, n2) {
            this.n1 = n1;
            this.n2 = n2;
            this.progress = 0;
            this.speed = 0.005 + Math.random() * 0.01;
            this.size = 6 * Math.min(n1.z, n2.z);
        }

        update() {
            this.progress += this.speed;
            return this.progress < 1;
        }

        draw(ctx) {
            const x = this.n1.x + (this.n2.x - this.n1.x) * this.progress;
            const y = this.n1.y + (this.n2.y - this.n1.y) * this.progress;
            
            ctx.save();
            ctx.fillStyle = COLORS.pulse;
            ctx.shadowBlur = 20;
            ctx.shadowColor = COLORS.neuron;
            ctx.beginPath();
            ctx.arc(x, y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Trail
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = this.size;
            ctx.beginPath();
            ctx.moveTo(this.n1.x, this.n1.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            ctx.restore();
        }
    }

    function init() {
        // Create impact neurons (fewer but larger)
        for (let i = 0; i < 15; i++) {
            neurons.push(new Neuron(false));
        }
        // Create background neurons for depth
        for (let i = 0; i < 20; i++) {
            neurons.push(new Neuron(true));
        }

        // Establish connections based on distance
        for (let i = 0; i < neurons.length; i++) {
            for (let j = i + 1; j < neurons.length; j++) {
                const n1 = neurons[i];
                const n2 = neurons[j];
                const dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
                
                if (dist < 300 && n1.connections.length < n1.maxConnections && n2.connections.length < n2.maxConnections) {
                    const conn = new Connection(n1, n2);
                    n1.connections.push(conn);
                    n2.connections.push(conn);
                }
            }
        }
    }

    function animate() {
        frame++;
        // Atmospheric Background
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, width, height);
        
        // Subtle nebula effect
        const grad = ctx.createRadialGradient(400, 400, 0, 400, 400, 600);
        grad.addColorStop(0, 'rgba(112, 0, 255, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw connections first (behind neurons)
        neurons.forEach(n => {
            n.connections.forEach(c => c.draw(ctx));
        });

        // Update and draw neurons
        neurons.forEach(n => {
            n.update();
            n.draw(ctx);
        });

        // Chance to trigger a pulse
        if (Math.random() < 0.05) {
            const n = neurons[Math.floor(Math.random() * neurons.length)];
            if (n.connections.length > 0) {
                const conn = n.connections[Math.floor(Math.random() * n.connections.length)];
                pulses.push(new ElectricPulse(conn.n1, conn.n2));
            }
        }

        // Update and draw pulses
        for (let i = pulses.length - 1; i >= 0; i--) {
            if (!pulses[i].update()) {
                pulses.splice(i, 1);
            } else {
                pulses[i].draw(ctx);
            }
        }

        requestAnimationFrame(animate);
    }

    init();
    animate();
}
