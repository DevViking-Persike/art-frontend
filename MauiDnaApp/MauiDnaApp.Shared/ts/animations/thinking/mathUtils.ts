export function project3D(theta: number, phi: number, r: number, rotX: number, rotY: number, cx: number, cy: number) {
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);

    let x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
    let z1 = z * Math.cos(rotY) - x * Math.sin(rotY);

    let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
    let z2 = z1 * Math.cos(rotX) + y * Math.sin(rotX);

    return { x: x1 + cx, y: y2 + cy, z: z2 };
}
