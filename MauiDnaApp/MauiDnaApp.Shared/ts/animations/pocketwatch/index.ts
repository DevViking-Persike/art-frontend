import { PocketWatchRenderer } from './Renderer';

export function startPocketWatchAnimation(canvasId: string) {
    try {
        const renderer = new PocketWatchRenderer(canvasId);
        renderer.start();
    } catch (err) {
        console.error("Failed to start Pocket Watch Animation:", err);
    }
}
