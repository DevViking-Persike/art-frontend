import { Mesa, Cactus } from './types';

// Monument Valley style mesa formations
export const MESAS: Mesa[] = [
    { x: 0.08, width: 0.10, height: 0.35, topWidth: 0.5, color: '#2a1510', depth: 0.3 },
    { x: 0.22, width: 0.06, height: 0.28, topWidth: 0.7, color: '#331a12', depth: 0.4 },
    { x: 0.40, width: 0.14, height: 0.42, topWidth: 0.4, color: '#1e0e08', depth: 0.2 },
    { x: 0.58, width: 0.05, height: 0.22, topWidth: 0.8, color: '#3a2015', depth: 0.5 },
    { x: 0.70, width: 0.12, height: 0.38, topWidth: 0.35, color: '#261210', depth: 0.25 },
    { x: 0.88, width: 0.08, height: 0.32, topWidth: 0.6, color: '#301815', depth: 0.35 },
];

export const CACTI: Cactus[] = [
    { x: 0.15, height: 45, armLeft: 0.5, armRight: 0.7, depth: 0.7 },
    { x: 0.32, height: 35, armLeft: 0.6, armRight: 0, depth: 0.8 },
    { x: 0.52, height: 50, armLeft: 0.4, armRight: 0.6, depth: 0.6 },
    { x: 0.75, height: 30, armLeft: 0, armRight: 0.5, depth: 0.75 },
    { x: 0.92, height: 40, armLeft: 0.55, armRight: 0.65, depth: 0.65 },
];

// Sky palette
export const SKY_COLORS = {
    topNight: '#0d0b1a',
    midPurple: '#2a1538',
    horizon: '#c44e20',
    sunGlow: '#ff8833',
    sunCore: '#ffe8a0',
};
