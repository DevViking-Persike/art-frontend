export class CircuitNode {
    x: number;
    z: number;
    baseY: number;
    heightModifier: number;
    isTower: boolean;
    pulse: number;
    pulseSpeed: number;
    color: string;
    actualZ: number;

    constructor(x: number, z: number, planeYOffset: number, heightModifier = 0) {
        this.x = x;
        this.z = z;
        this.baseY = planeYOffset;
        this.heightModifier = heightModifier;
        this.isTower = heightModifier > 0;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 2 + Math.random() * 3;
        this.actualZ = 0;

        // Palette: mostly cyan, accents of magenta and intense blue
        const r = Math.random();
        if (r < 0.1) this.color = '#ff007f'; // Magenta
        else if (r < 0.3) this.color = '#0066ff'; // Deep Blue
        else this.color = '#00f2ff'; // Cyan
    }
}
