
export enum GameState {
  MENU = 'MENU',
  CINEMATIC = 'CINEMATIC',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface ShipConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  laserColor: string;
  fireRate: number;
  speed: number;
  power: number;
}

export interface Enemy {
  id: string;
  word: string;
  typed: string;
  x: number;
  y: number;
  speed: number;
  color: string;
  size: number;
  targetX: number;
  isBoss?: boolean;
  maxHealth?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface Laser {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  progress: number;
}

export interface GameStats {
  score: number;
  correctStrokes: number;
  totalStrokes: number;
  level: number;
  startTime: number;
  endTime: number;
  shipId: string;
}
