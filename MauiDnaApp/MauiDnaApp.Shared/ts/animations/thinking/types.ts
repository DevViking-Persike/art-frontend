export interface CoreParticle {
    theta: number;
    phi: number;
    baseRadius: number;
    pulse: number;
    speed: number;
    hue: number;
    size: number;
    orbitSpeed: number;
}

export interface RingParticle {
    angle: number;
    radius: number;
    pulse: number;
    size: number;
}

export interface Ring {
    particles: RingParticle[];
    tiltX: number;
    tiltY: number;
    rotSpeed: number;
    hue: number;
    rotation: number;
}

export interface Synapse {
    startTheta: number;
    startPhi: number;
    endTheta: number;
    endPhi: number;
    life: number;
    maxLife: number;
    active: boolean;
    hue: number;
}

export interface Beam {
    xOffset: number;
    zOffset: number;
    speed: number;
    width: number;
    hue: number;
    yPos: number;
    height: number;
    alphaFade: number;
}

export interface Fragment {
    x: number;
    y: number;
    vx: number;
    vy: number;
    text: string;
    alpha: number;
    fadeSpeed: number;
    size: number;
}

export interface Wave {
    radius: number;
    maxRadius: number;
    alpha: number;
    hue: number;
    speed: number;
    width: number;
}

export interface RingTask {
    text: string;
    icon: string;
}
