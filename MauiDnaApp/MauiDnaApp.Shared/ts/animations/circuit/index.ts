import { CircuitRenderer } from './Renderer';

export function startCircuitAnimation(canvasId: string) {
    try {
        const renderer = new CircuitRenderer(canvasId);
        renderer.start();
    } catch (err) {
        console.error("Failed to start Circuit Animation:", err);
    }
}
