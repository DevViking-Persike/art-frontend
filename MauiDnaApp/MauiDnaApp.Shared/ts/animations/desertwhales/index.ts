import { DesertWhalesRenderer } from './Renderer';

export function startDesertWhalesAnimation(canvasId: string) {
    try {
        const renderer = new DesertWhalesRenderer(canvasId);
        renderer.start();
    } catch (err) {
        console.error("Failed to start Desert Whales Animation:", err);
    }
}
