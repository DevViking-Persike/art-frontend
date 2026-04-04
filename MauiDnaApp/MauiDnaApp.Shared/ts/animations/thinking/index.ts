import { ThinkingRenderer } from './Renderer';

export function startThinkingAnimation(canvasId: string) {
    try {
        const renderer = new ThinkingRenderer(canvasId);
        renderer.start();
    } catch (err) {
        console.error("Failed to start Thinking Animation:", err);
    }
}
