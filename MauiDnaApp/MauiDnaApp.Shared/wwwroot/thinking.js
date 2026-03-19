export function startThinkingAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 800;

    let particles = [];
    const numParticles = 400;
    const radius = 200;
    
    const tasks = [
        "Analyzing context...",
        "Searching vector space...",
        "Optimizing response...",
        "Synthesizing knowledge...",
        "Encoding semantics...",
        "Refining weights...",
        "Finalizing output..."
    ];
    let currentTaskIndex = 0;
    let taskTimer = 0;

    // Initialize particles on a sphere
    for (let i = 0; i < numParticles; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        particles.push({
            theta: theta,
            phi: phi,
            pulse: Math.random() * Math.PI * 2
        });
    }

    let rotationX = 0;
    let rotationY = 0;

    function animate() {
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, width, height);

        rotationX += 0.005;
        rotationY += 0.008;
        
        taskTimer += 0.016;
        if (taskTimer > 2) {
            taskTimer = 0;
            currentTaskIndex = (currentTaskIndex + 1) % tasks.length;
        }

        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Sort particles by Z depth for basic 3D look
        const projected = particles.map(p => {
            // Original 3D coordinates
            let x = radius * Math.sin(p.phi) * Math.cos(p.theta);
            let y = radius * Math.sin(p.phi) * Math.sin(p.theta);
            let z = radius * Math.cos(p.phi);

            // Rotate Y
            let x1 = x * Math.cos(rotationY) + z * Math.sin(rotationY);
            let z1 = z * Math.cos(rotationY) - x * Math.sin(rotationY);
            
            // Rotate X
            let y2 = y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
            let z2 = z1 * Math.cos(rotationX) + y * Math.sin(rotationX);

            p.pulse += 0.05;
            const pulseVal = (Math.sin(p.pulse) + 1) / 2;

            return { x: x1, y: y2, z: z2, pulse: pulseVal };
        });

        projected.sort((a, b) => a.z - b.z);

        projected.forEach(p => {
            const scale = (p.z + radius) / (2 * radius);
            const size = (scale * 3) + (p.pulse * 2);
            const alpha = 0.2 + (scale * 0.8);
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.pulse > 0.8 ? '#ffffff' : '#00aaff';
            if (p.pulse > 0.8) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffffff';
            }
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        ctx.restore();

        // Status Text
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#888';
        ctx.font = '18px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(tasks[currentTaskIndex], width / 2, height - 100);
        
        // Progress bar (fake)
        ctx.strokeStyle = '#222';
        ctx.strokeRect(width/2 - 100, height - 80, 200, 4);
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(width/2 - 100, height - 80, (taskTimer / 2) * 200, 4);

        requestAnimationFrame(animate);
    }

    animate();
}
