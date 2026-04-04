export function darkenColor(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}

export function projectOrbit(
    angle: number, orbitRadius: number, scale: number,
    viewRotX: number, viewRotY: number, cx: number, cy: number
): { x: number; y: number; z: number } {
    const r = orbitRadius * scale;
    const px = r * Math.cos(angle);
    const pz = r * Math.sin(angle);

    const cosY = Math.cos(viewRotY);
    const sinY = Math.sin(viewRotY);
    const x1 = px * cosY - pz * sinY;
    const z1 = pz * cosY + px * sinY;

    const cosX = Math.cos(viewRotX);
    const sinX = Math.sin(viewRotX);
    const y1 = z1 * sinX;
    const z2 = z1 * cosX;

    return { x: cx + x1, y: cy + y1, z: z2 };
}
