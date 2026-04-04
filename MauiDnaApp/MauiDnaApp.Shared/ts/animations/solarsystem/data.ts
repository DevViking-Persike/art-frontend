import { PlanetData } from './types';

export const PLANETS: PlanetData[] = [
    {
        name: 'Mercury', orbitRadius: 70, radius: 4, period: 8,
        color: '#b5a7a7', glowColor: '#d4c5b9', tilt: 0.01,
        detail: '58.6 Earth days per rotation'
    },
    {
        name: 'Venus', orbitRadius: 105, radius: 7, period: 14,
        color: '#e8c87a', glowColor: '#f5d98a', tilt: 0.05,
        detail: 'Hottest planet: 465°C surface'
    },
    {
        name: 'Earth', orbitRadius: 145, radius: 8, period: 20,
        color: '#4a9eea', glowColor: '#6bb8ff', tilt: 0.41,
        moons: [{ radius: 2, orbitRadius: 16, period: 3, color: '#ccc' }],
        detail: 'Home — 7.9 billion humans'
    },
    {
        name: 'Mars', orbitRadius: 190, radius: 5.5, period: 28,
        color: '#d4644a', glowColor: '#ff7755', tilt: 0.44,
        moons: [
            { radius: 1.2, orbitRadius: 11, period: 2, color: '#aaa' },
            { radius: 0.8, orbitRadius: 15, period: 3.5, color: '#999' }
        ],
        detail: 'Olympus Mons: 21.9km tall'
    },
    {
        name: 'Jupiter', orbitRadius: 265, radius: 22, period: 50,
        color: '#d4a574', glowColor: '#e8b888', tilt: 0.05,
        moons: [
            { radius: 2.5, orbitRadius: 32, period: 4, color: '#e8d5a0' },
            { radius: 3, orbitRadius: 38, period: 5.5, color: '#c8b8a0' },
            { radius: 2, orbitRadius: 44, period: 7, color: '#bbb' },
            { radius: 1.8, orbitRadius: 50, period: 10, color: '#aaa' }
        ],
        detail: '79 known moons — 1,321× Earth\'s volume'
    },
    {
        name: 'Saturn', orbitRadius: 345, radius: 18, period: 72,
        color: '#e8d5a0', glowColor: '#f0e0b0', tilt: 0.47,
        hasRing: true, ringColor: '#d4c090',
        moons: [
            { radius: 3, orbitRadius: 36, period: 5, color: '#ddd' },
            { radius: 1.5, orbitRadius: 42, period: 7, color: '#bbb' }
        ],
        detail: 'Density lower than water — it would float!'
    },
    {
        name: 'Uranus', orbitRadius: 415, radius: 12, period: 100,
        color: '#7ecad4', glowColor: '#a0e8f0', tilt: 1.71,
        hasRing: true, ringColor: 'rgba(120,200,210,0.3)',
        detail: 'Rotates on its side — 98° axial tilt'
    },
    {
        name: 'Neptune', orbitRadius: 470, radius: 11, period: 130,
        color: '#4466ee', glowColor: '#6688ff', tilt: 0.49,
        moons: [{ radius: 2.5, orbitRadius: 22, period: 6, color: '#aab' }],
        detail: 'Winds reach 2,100 km/h'
    }
];
