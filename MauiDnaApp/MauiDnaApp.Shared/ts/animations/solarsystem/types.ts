export interface PlanetData {
    name: string;
    orbitRadius: number;
    radius: number;
    period: number;
    color: string;
    glowColor: string;
    hasRing?: boolean;
    ringColor?: string;
    moons?: MoonData[];
    tilt: number;
    detail?: string;
}

export interface MoonData {
    radius: number;
    orbitRadius: number;
    period: number;
    color: string;
}

export interface Star {
    x: number;
    y: number;
    r: number;
    brightness: number;
    twinkleSpeed: number;
}
