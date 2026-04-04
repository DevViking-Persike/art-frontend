export class DataSignal {
    direction!: 'z' | 'x';
    x!: number;
    y!: number;
    z!: number;
    speed!: number;
    length!: number;

    constructor(private gridZDepth: number, private gridXWidth: number, private gridSize: number, private planeYOffset: number) {
        this.reset();
        this.z = Math.random() * gridZDepth;
    }

    reset() {
        this.direction = Math.random() > 0.5 ? 'z' : 'x';
        if (this.direction === 'z') {
            this.x = (Math.floor(Math.random() * (this.gridXWidth * 2 / this.gridSize)) * this.gridSize) - this.gridXWidth;
            this.z = this.gridZDepth; // Start far away
            this.y = this.planeYOffset;
            this.speed = -800 - Math.random() * 1000; // Moving towards camera
        } else {
            this.z = Math.floor(Math.random() * (this.gridZDepth / this.gridSize)) * this.gridSize;
            this.x = Math.random() > 0.5 ? this.gridXWidth : -this.gridXWidth;
            this.y = this.planeYOffset;
            this.speed = (this.x < 0 ? 1 : -1) * (1500 + Math.random() * 1000);
        }
        this.length = 100 + Math.random() * 300;
    }

    update(dt: number, zShift: number) {
        if (this.direction === 'z') {
            this.z += this.speed * dt;
            this.z -= zShift;
        } else {
            this.x += this.speed * dt;
            this.z -= zShift;
        }

        if (this.z < 0 || this.x < -this.gridXWidth || this.x > this.gridXWidth) {
            this.reset();
        }
    }
}
