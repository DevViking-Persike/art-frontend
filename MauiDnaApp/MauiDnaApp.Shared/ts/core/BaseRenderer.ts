import { MouseState } from './types';

export abstract class BaseRenderer {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected width: number = 0;
    protected height: number = 0;
    protected cx: number = 0;
    protected cy: number = 0;
    protected time: number = 0;
    protected mouse: MouseState = { x: -1000, y: -1000, nx: 0.5, ny: 0.5, active: false };
    protected animationFrameId: number | null = null;
    private lastTimestamp: number = 0;

    constructor(canvasId: string) {
        const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
        if (!el) throw new Error(`Canvas with id ${canvasId} not found`);
        this.canvas = el;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2d context for canvas");
        this.ctx = ctx;

        this.resize = this.resize.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.animate = this.animate.bind(this);

        this.bindEvents();
    }

    private bindEvents() {
        window.addEventListener('resize', this.resize);
        this.resize();

        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('mouseleave', this.onMouseLeave);
    }

    protected resize() {
        if (!this.canvas.parentElement) return;
        const container = this.canvas.parentElement;
        this.width = container.clientWidth || window.innerWidth;
        this.height = container.clientHeight || window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.cy = this.height / 2;
        this.cx = this.width / 2;
        this.onResize(this.width, this.height);
    }

    protected onMouseMove(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.nx = this.mouse.x / rect.width;
        this.mouse.ny = this.mouse.y / rect.height;
        this.mouse.active = true;
    }

    protected onMouseLeave() {
        this.mouse.active = false;
    }

    public start() {
        this.init();
        this.lastTimestamp = performance.now();
        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    private animate(timestamp: number) {
        if (!document.getElementById(this.canvas.id)) {
            this.destroy();
            return;
        }

        if (this.width !== this.canvas.width || this.height !== this.canvas.height) {
             this.width = this.canvas.width;
             this.height = this.canvas.height;
             this.cx = this.width / 2;
             this.cy = this.height / 2;
             this.onResize(this.width, this.height);
        }

        const rawDt = timestamp - this.lastTimestamp;
        const dt = Math.min(rawDt, 50); 
        this.lastTimestamp = timestamp;

        this.time += dt / 1000; // time in seconds

        this.render(dt, this.time);

        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    public destroy() {
        window.removeEventListener('resize', this.resize);
        if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    }

    // Methods to be implemented by children
    protected abstract init(): void;
    protected abstract render(dt: number, time: number): void;
    protected onResize(width: number, height: number): void { }
}
