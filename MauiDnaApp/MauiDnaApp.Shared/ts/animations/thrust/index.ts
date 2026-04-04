import { ThrustRenderer } from './Renderer';

export function startThrustAnimation(canvasId: string) {
    new ThrustRenderer(canvasId).start();
}
