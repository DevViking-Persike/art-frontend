import { Ring } from '../types';

export class OrbitalRings {
    private rings: Ring[] = [];

    init() {
        this.rings = [];
        for (let r = 0; r < 4; r++) {
            const particles = [];
            const count = 100 + r * 35;
            const ringRadius = 220 + r * 55;
            for (let i = 0; i < count; i++) {
                particles.push({
                    angle: (i / count) * Math.PI * 2,
                    radius: ringRadius,
                    pulse: Math.random() * Math.PI * 2,
                    size: 0.5 + Math.random() * 2
                });
            }
            this.rings.push({
                particles,
                tiltX: (r * 0.9) + 0.2,
                tiltY: r * 1.4,
                rotSpeed: 0.002 + r * 0.0015 + (r % 2 === 0 ? 0.001 : -0.002),
                hue: r % 2 === 0 ? 190 : 280,
                rotation: 0
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, rotX: number) {
        this.rings.forEach(ring => {
            ring.rotation += ring.rotSpeed;
            ctx.save();
            ring.particles.forEach(p => {
                const a = p.angle + ring.rotation;
                let rx = p.radius * scale * Math.cos(a);
                let ry = p.radius * scale * Math.sin(a);

                let z = ry * Math.sin(ring.tiltX);
                ry = ry * Math.cos(ring.tiltX);

                let tempX = rx * Math.cos(ring.tiltY + rotX * 0.5) + z * Math.sin(ring.tiltY + rotX * 0.5);
                let tempZ = z * Math.cos(ring.tiltY + rotX * 0.5) - rx * Math.sin(ring.tiltY + rotX * 0.5);

                p.pulse += 0.04;
                const pulseVal = (Math.sin(p.pulse) + 1) / 2;
                const depthAlpha = (tempZ + p.radius * scale) / (2 * p.radius * scale);
                const alpha = 0.1 + depthAlpha * 0.6 + pulseVal * 0.3;

                ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.6));
                ctx.fillStyle = `hsl(${ring.hue + pulseVal * 20}, 90%, ${60 + pulseVal * 40}%)`;
                ctx.beginPath();
                ctx.arc(cx + tempX, cy + ry, p.size * scale * (0.8 + pulseVal * 0.6), 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        });
    }
}
