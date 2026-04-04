import { SolarSystemRenderer } from './Renderer';

export function startSolarSystemAnimation(canvasId: string) {
    try {
        const renderer = new SolarSystemRenderer(canvasId);
        renderer.start();
    } catch (err) {
        console.error("Failed to start Solar System Animation:", err);
    }
}
