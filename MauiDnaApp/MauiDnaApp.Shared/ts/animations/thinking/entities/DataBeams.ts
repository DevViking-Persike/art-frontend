import { Beam } from '../types';

export class DataBeams {
    private beams: Beam[] = [];

    init() {
        this.beams = [];
        for (let i = 0; i < 20; i++) {
            this.beams.push({
                xOffset: (Math.random() - 0.5) * 400,
                zOffset: (Math.random() - 0.5) * 400,
                speed: 2 + Math.random() * 4,
                width: 1 + Math.random() * 3,
                hue: 190 + Math.random() * 40,
                yPos: Math.random() * 1000,
                height: 50 + Math.random() * 150,
                alphaFade: Math.random() * Math.PI * 2
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D, cx: number, height: number, scale: number, dt: number, rotY: number) {
        this.beams.forEach(beam => {
            beam.yPos -= beam.speed;
            if (beam.yPos < -200) beam.yPos = height + 200;

            const x = beam.xOffset;
            const z = beam.zOffset;
            const x1 = x * Math.cos(rotY * 0.5) + z * Math.sin(rotY * 0.5);
            const z1 = z * Math.cos(rotY * 0.5) - x * Math.sin(rotY * 0.5);

            beam.alphaFade += dt * 2;
            const beamAlpha = (Math.sin(beam.alphaFade) + 1) / 2 * 0.15 * Math.max(0, 1 - Math.abs(z1) / 500);

            if (z1 < 300) {
                const bGrad = ctx.createLinearGradient(0, beam.yPos, 0, beam.yPos + beam.height);
                bGrad.addColorStop(0, `hsla(${beam.hue}, 80%, 70%, 0)`);
                bGrad.addColorStop(0.5, `hsla(${beam.hue}, 80%, 70%, ${beamAlpha})`);
                bGrad.addColorStop(1, `hsla(${beam.hue}, 80%, 70%, 0)`);
                ctx.fillStyle = bGrad;
                ctx.fillRect(cx + x1, beam.yPos, beam.width * scale, beam.height);
            }
        });
    }
}
