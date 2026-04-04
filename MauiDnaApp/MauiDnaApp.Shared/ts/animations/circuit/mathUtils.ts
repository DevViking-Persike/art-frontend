import { Point3D } from './types';

export function project3D(x: number, y: number, z: number, fov: number, cx: number, cy: number): Point3D | null {
    if (z < 10) return null; // Behind or too close to camera
    const scale = fov / z;
    return {
        sx: cx + x * scale,
        sy: cy + y * scale,
        scale: scale
    };
}
