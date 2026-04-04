import { BaseRenderer } from '../../core/BaseRenderer';
import { CyberGrid } from './entities/CyberGrid';
import { PlasmaGauge } from './entities/PlasmaGauge';
import { SparkParticles } from './entities/SparkParticles';

export class ThrustRenderer extends BaseRenderer {
    private thrust: number = 0; // 0 to 1
    private state: 'idle' | 'charging' | 'max' | 'cooldown' = 'idle';
    private maxTimer: number = 0;
    
    // Interactions
    private isMouseDown: boolean = false;

    // Entities
    private grid!: CyberGrid;
    private gauge!: PlasmaGauge;
    private particles!: SparkParticles;

    protected init(): void {
        this.thrust = 0;
        this.state = 'idle';
        this.maxTimer = 0;
        this.isMouseDown = false;

        this.grid = new CyberGrid();
        this.gauge = new PlasmaGauge();
        this.particles = new SparkParticles();

        // Bind events
        this.canvas.addEventListener('mousedown', () => this.handleDown());
        this.canvas.addEventListener('touchstart', () => this.handleDown(), { passive: false });

        this.canvas.addEventListener('mouseup', () => this.handleUp());
        this.canvas.addEventListener('mouseleave', () => this.handleUp());
        this.canvas.addEventListener('touchend', () => this.handleUp(), { passive: false });
    }
    
    private handleDown() {
        if (this.state === 'idle' || this.state === 'cooldown' && this.thrust < 0.2) {
            this.isMouseDown = true;
        }
    }
    
    private handleUp() {
        this.isMouseDown = false;
    }

    protected render(dt: number, time: number): void {
        // Logic Update
        if (this.state === 'max') {
            this.maxTimer -= dt;
            this.particles.spawn(this.width / 2, this.height * 0.8, 1.0, 5); // Huge explosion of sparks
            if (this.maxTimer <= 0) {
                this.state = 'cooldown';
                this.isMouseDown = false; // force release
            }
        } else if (this.isMouseDown && this.state !== 'cooldown') {
            this.state = 'charging';
            this.thrust += (dt / 1000) * 0.4; // 2.5 seconds to fill
            this.particles.spawn(this.width / 2, this.height * 0.8, this.thrust, this.thrust * 2);
            
            if (this.thrust >= 1.0) {
                this.thrust = 1.0;
                this.state = 'max';
                this.maxTimer = 2000; // 2 seconds of pure chaos
            }
        } else {
            // venting
            if (this.thrust > 0) {
                if (this.state !== 'cooldown') this.state = 'idle'; // passive vent
                this.thrust -= (dt / 1000) * 0.8; // vent fast
                if (this.thrust <= 0) {
                    this.thrust = 0;
                    this.state = 'idle';
                }
            }
        }

        // Render phase
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 1. Perspective Cyber Grid
        this.grid.draw(this.ctx, this.width, this.height, time, this.thrust);
        
        // 2. Plasma Gauge HUD
        this.gauge.draw(this.ctx, this.width, this.height, time, this.thrust, this.state);
        
        // 3. Spark Particles
        this.particles.draw(this.ctx, dt);
    }
}
