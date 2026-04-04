import { BaseRenderer } from '../../core/BaseRenderer';
import { Sky } from './entities/Sky';
import { Desert } from './entities/Desert';
import { CosmicCreature } from './entities/Whale';

export class DesertWhalesRenderer extends BaseRenderer {
    private sky = new Sky();
    private desert = new Desert();
    private creatures: CosmicCreature[] = [];
    private stars: { x: number; y: number; r: number; b: number; s: number }[] = [];

    protected init(): void {
        this.generateStars();
        this.spawnCosmicEntities();
    }

    private generateStars() {
        this.stars = [];
        for (let i = 0; i < 600; i++) { // Massive dense starfield
            this.stars.push({
                x: Math.random(),
                y: Math.random(),
                r: Math.random() < 0.95 ? (0.2 + Math.random() * 0.8) : (1.5 + Math.random() * 1.5), // mostly small, some huge
                b: 0.1 + Math.random() * 0.9,
                s: 0.2 + Math.random() * 3
            });
        }
    }

    private spawnCosmicEntities() {
        this.creatures = [];
        const neonColors = ['#ff0055', '#ff00aa', '#00e5ff', '#ffea00', '#ff5500', '#ffffff'];

        // 1. Massive Majestic Whales (Far and Mid)
        for(let i=0; i<6; i++) {
            this.creatures.push(new CosmicCreature({
                id: i,
                type: 'majestic_whale',
                x: this.width * Math.random() * 1.5,
                y: this.height * (0.1 + Math.random() * 0.6),
                size: 80 + Math.random() * 100,
                speedX: 0.5 + Math.random() * 0.5,
                speedY: 0.3,
                depth: 0.2 + Math.random() * 0.6,
                phase: Math.random() * Math.PI * 2,
                swimSpeed: 0.8,
                color: neonColors[Math.floor(Math.random() * neonColors.length)]
            }));
        }

        // 2. Schools of Neon Fish scattered around
        for(let i=0; i<40; i++) {
            this.creatures.push(new CosmicCreature({
                id: 100+i,
                type: 'neon_fish',
                x: this.width * Math.random() * 2,
                y: this.height * (0.1 + Math.random() * 0.8),
                size: 15 + Math.random() * 15,
                speedX: 1.0 + Math.random() * 1.5,
                speedY: 0.5,
                depth: 0.3 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                swimSpeed: 2.0,
                color: neonColors[Math.floor(Math.random() * (neonColors.length - 1))] // avoid pure white here
            }));
        }

        // 3. The "River of Light" - A dense school of pure white/cyan fish emitting beams
        const riverStartY = this.height * 0.8;
        for(let i=0; i<80; i++) {
            this.creatures.push(new CosmicCreature({
                id: 500+i,
                type: 'light_beam_fish',
                x: this.width * 1.5 + (Math.random() * this.width), // Start offscreen right
                y: riverStartY + (Math.random() - 0.5) * 100,
                size: 10 + Math.random() * 12,
                speedX: 2.5 + Math.random() * 1.0, // Fast
                speedY: 0.2,
                depth: 0.8 + Math.random() * 0.2, // Foreground
                phase: i * 0.2,
                swimSpeed: 3.5 + Math.random() * 1.0,
                color: Math.random() > 0.3 ? '#ffffff' : '#ccffff',
                targetY: riverStartY + (Math.random() - 0.5) * 60
            }));
        }
    }

    protected onResize(w: number, h: number): void {
        this.generateStars();
    }

    protected render(dt: number, time: number): void {
        const ctx = this.ctx;
        const scale = Math.min(this.width, this.height) / 900;

        const mouseNX = this.mouse.active ? this.mouse.nx : 0.5;
        const mouseNY = this.mouse.active ? this.mouse.ny : 0.5;

        // 1. Deep Cosmic Sky
        this.sky.drawBackground(ctx, this.width, this.height, time);
        this.sky.drawStars(ctx, this.width, this.height, time, this.stars);
        this.sky.drawBokeh(ctx, this.width, this.height, time);

        // 2. Cosmic Entities (Whales and Fish)
        // Sort by depth so things draw in proper Z order
        const sortedCreatures = [...this.creatures].sort((a, b) => a.z - b.z);

        // Draw entities behind the mountain layers (depth < 0.6)
        sortedCreatures.filter(c => c.z < 0.6).forEach(c => {
            c.update(dt, time, this.width, this.height, mouseNY);
            c.draw(ctx, time, scale);
        });

        // 3. Desert Silhouettes
        // This anchors the intense floating magic to an Arizona landscape
        this.desert.drawMesas(ctx, this.width, this.height, mouseNX);

        // 4. Foreground Entities (The river of light, foreground whales)
        sortedCreatures.filter(c => c.z >= 0.6).forEach(c => {
            c.update(dt, time, this.width, this.height, mouseNY);
            c.draw(ctx, time, scale);
        });

        // Foreground cacti silhouettes
        this.desert.drawCacti(ctx, this.width, this.height, mouseNX);
    }
}
