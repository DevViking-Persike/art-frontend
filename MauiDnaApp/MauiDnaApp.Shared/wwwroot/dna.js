export function startDNAAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 800;

    let particles = [];
    let codeLines = [];
    let frame = 0;

    const codeSnippets = [
        "void main() {",
        "  float dna = sin(y * 0.1);",
        "  vec3 color = neon();",
        "  decode(dna);",
        "  return result;",
        "}",
        "struct Helix {",
        "  int basePairs;",
        "  string sequence;",
        "};",
        "DNA.Translate(code);",
        "if (sequence == 'ATCG') {",
        "  GENERATE_UI();",
        "}"
    ];

    class Particle {
        constructor(x, y, z, color, isRight) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.color = color;
            this.isRight = isRight;
            this.morphed = false;
        }

        update() {
            this.y -= 2; // Scroll upward
            this.angle = (this.y * 0.01) + (this.isRight ? Math.PI : 0);
            this.x = Math.cos(this.angle) * 100 + 400;
            this.z = Math.sin(this.angle) * 100;

            if (this.y < 300 && !this.morphed) {
                this.morphed = true;
                if (Math.random() > 0.7) {
                    codeLines.push({
                        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
                        x: 550,
                        y: this.y,
                        alpha: 1.0
                    });
                }
            }

            if (this.y < -50) {
                this.y = height + 50;
                this.morphed = false;
            }
        }

        draw() {
            const scale = (this.z + 150) / 300;
            const size = 6 * scale;
            ctx.globalAlpha = scale;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
    }

    // Initialize DNA
    for (let y = 0; y < height + 100; y += 20) {
        particles.push(new Particle(0, y, 0, '#00f2ff', false));
        particles.push(new Particle(0, y, 0, '#7000ff', true));
    }

    function animate() {
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, width, height);

        // Draw connections (rungs)
        for (let i = 0; i < particles.length; i += 2) {
            const p1 = particles[i];
            const p2 = particles[i+1];
            
            const scale = (p1.z + p2.z + 300) / 600;
            ctx.strokeStyle = '#ffffff';
            ctx.globalAlpha = scale * 0.3;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw code lines
        ctx.font = '14px "Courier New"';
        for (let i = codeLines.length - 1; i >= 0; i--) {
            const line = codeLines[i];
            ctx.fillStyle = `rgba(0, 255, 180, ${line.alpha})`;
            ctx.fillText(line.text, line.x, line.y);
            line.alpha -= 0.005;
            line.y -= 0.5;
            if (line.alpha <= 0) codeLines.splice(i, 1);
        }

        requestAnimationFrame(animate);
    }

    animate();
}
