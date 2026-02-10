
import { ShipConfig } from './types';

export const SHIPS: ShipConfig[] = [
  {
    id: 'stinger',
    name: 'STINGER',
    description: 'High-speed interceptor designed for rapid fire maneuvers.',
    color: '#0ea5e9', // Sky 500
    laserColor: '#38bdf8',
    fireRate: 1.2,
    speed: 0.9,
    power: 0.7,
  },
  {
    id: 'juggernaut',
    name: 'JUGGERNAUT',
    description: 'Heavily armored gunship with devastating plasma bursts.',
    color: '#ef4444', // Red 500
    laserColor: '#f87171',
    fireRate: 0.8,
    speed: 0.6,
    power: 1.0,
  },
  {
    id: 'wraith',
    name: 'WRAITH',
    description: 'Advanced stealth craft using precision laser tech.',
    color: '#a855f7', // Purple 500
    laserColor: '#c084fc',
    fireRate: 1.0,
    speed: 1.0,
    power: 0.8,
  }
];

export const INITIAL_WORDS = [
  'VOID', 'STAR', 'FIRE', 'CORE', 'DATA', 'BEAM', 'NOVA', 'BOLT', 'GRID', 'RAIL',
  'PLASMA', 'ENERGY', 'HYPER', 'LASER', 'PULSE', 'SHOCK', 'WAVE', 'STATIC', 'CYBER',
  'SYSTEM', 'MODULE', 'VECTOR', 'MATRIX', 'PROTON', 'QUARK', 'PHOTON', 'SIGNAL'
];

export const HARD_WORDS = [
  'ATMOSPHERIC_REENTRY', 'BLACK_HOLE_SINGULARITY', 'CRITICAL_CORE_FAILURE', 
  'GRAVITATIONAL_ANOMALY', 'QUANTUM_DECOHERENCE', 'NEURAL_LINK_ESTABLISHED',
  'INTERSTELLAR_VOYAGER', 'THERMODYNAMIC_EQUILIBRIUM', 'ELECTROMAGNETIC_PULSE',
  'CHRONOSPHERE_DISPLACEMENT', 'SYNCHRONIZED_STRIKE_FORCE', 'HYPERSPACE_JUMP_DRIVE'
];

export const BOSS_PHRASES = [
  'SUPERCOMPUTER_OVERLORD_THREAT',
  'GALACTIC_TERMINATION_PROTOCOL',
  'SYSTEM_FAILURE_IMMINENT_DANGER'
];

export const GAME_SPEED = 0.4;
export const SPAWN_RATE = 2200;
export const LEVEL_THRESHOLD = 700;
