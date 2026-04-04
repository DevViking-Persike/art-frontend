export interface WhaleData {
    x: number;
    y: number;
    size: number;
    speed: number;
    depth: number;       // 0=far, 1=near — affects alpha and parallax
    phase: number;       // swim cycle offset
    swimSpeed: number;
    flipX: boolean;
    glowHue: number;
    bodyAlpha: number;
    trailParticles: TrailParticle[];
}

export interface TrailParticle {
    x: number;
    y: number;
    alpha: number;
    size: number;
    vx: number;
    vy: number;
}

export interface Mesa {
    x: number;           // normalized 0-1
    width: number;
    height: number;
    topWidth: number;    // flat top width ratio
    color: string;
    depth: number;
}

export interface Cactus {
    x: number;
    height: number;
    armLeft: number;     // height ratio for left arm
    armRight: number;
    depth: number;
}

export interface DustMote {
    x: number;
    y: number;
    size: number;
    alpha: number;
    vx: number;
    vy: number;
    twinkle: number;
}

export interface SpiritOrb {
    x: number;
    y: number;
    radius: number;
    alpha: number;
    speed: number;
    phase: number;
    hue: number;
}
