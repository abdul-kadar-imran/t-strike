
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Enemy, Particle, Laser, GameStats, ShipConfig, GameState } from '../types';
import { INITIAL_WORDS, HARD_WORDS, BOSS_PHRASES, GAME_SPEED, SPAWN_RATE, LEVEL_THRESHOLD } from '../constants';
import { soundService } from '../services/soundService';

interface GameCanvasProps {
  ship: ShipConfig;
  onGameOver: (stats: GameStats) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ ship, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const stateRef = useRef({
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    lasers: [] as Laser[],
    activeEnemyId: null as string | null,
    score: 0,
    totalStrokes: 0,
    correctStrokes: 0,
    level: 1,
    lastSpawn: 0,
    startTime: Date.now(),
    isGameOver: false,
    playerX: window.innerWidth / 2,
    bossSpawned: false,
    bossPhase: 0, // Boss has 3 phrases (0, 1, 2)
    isTransitioning: false,
    transitionTimer: 0,
    transitionType: '' as 'LEVEL' | 'BOSS' | '',
  });

  const [uiState, setUiState] = useState({ 
    score: 0, 
    level: 1, 
    isBossLevel: false, 
    showTransition: false,
    transitionText: ''
  });

  useEffect(() => {
    soundService.startBackgroundMusic();
    return () => soundService.stopBackgroundMusic();
  }, []);

  const spawnBoss = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    stateRef.current.bossPhase = 0;
    const phrase = BOSS_PHRASES[0];
    const id = 'BOSS_DREADNOUGHT';
    
    const newBoss: Enemy = {
      id,
      word: phrase,
      typed: '',
      x: canvas.width / 2,
      y: 120,
      targetX: canvas.width / 2,
      speed: 0,
      color: '#ef4444',
      size: 100, 
      isBoss: true,
    };

    stateRef.current.enemies.push(newBoss);
    stateRef.current.bossSpawned = true;
    setUiState(prev => ({ ...prev, isBossLevel: true }));
  }, []);

  const spawnEnemy = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (stateRef.current.isTransitioning) return;
    
    const state = stateRef.current;
    const isLevel3 = state.level === 3;
    const boss = state.enemies.find(e => e.isBoss);

    // MAINTAIN ONE WORD: Only spawn if no regular enemy (non-boss) exists
    if (state.enemies.some(e => !e.isBoss)) return;

    // For Level 3, boss is always present. We spawn 1 gunship at a time.
    if (isLevel3 && !boss) return;

    const pool = (isLevel3 || (state.level >= 2 && Math.random() > 0.6)) ? HARD_WORDS : INITIAL_WORDS;
    const word = pool[Math.floor(Math.random() * pool.length)];
    const id = Math.random().toString(36).substr(2, 9);
    
    const x = isLevel3 && boss ? boss.x : Math.random() * (canvas.width - 200) + 100;
    const y = isLevel3 && boss ? boss.y : -50;
    
    const speedMultiplier = state.level === 1 ? 0.05 : 0.15;
    const newEnemy: Enemy = {
      id,
      word,
      typed: '',
      x,
      y,
      targetX: x,
      speed: (GAME_SPEED + state.level * speedMultiplier) * (0.8 + Math.random() * 0.4),
      color: '#ffffff',
      size: 15 + Math.random() * 5,
    };

    state.enemies.push(newEnemy);
  }, []);

  const createExplosion = (x: number, y: number, color: string, amount: number = 20) => {
    for (let i = 0; i < amount; i++) {
      stateRef.current.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 1.5,
        color,
        size: Math.random() * 6 + 2,
      });
    }
    soundService.playExplosion();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (stateRef.current.isGameOver || stateRef.current.isTransitioning) return;
    
    const key = e.key.toUpperCase();
    if (key.length !== 1 || !/[A-Z_]/.test(key)) return;

    stateRef.current.totalStrokes++;
    const state = stateRef.current;
    
    if (state.activeEnemyId) {
      const enemy = state.enemies.find(e => e.id === state.activeEnemyId);
      if (enemy) {
        const nextChar = enemy.word[enemy.typed.length];
        if (key === nextChar) {
          enemy.typed += key;
          state.correctStrokes++;
          soundService.playLaser(ship.laserColor);
          state.playerX = enemy.x;
          state.lasers.push({
            x: state.playerX,
            y: window.innerHeight - 80,
            targetX: enemy.x + (Math.random() - 0.5) * (enemy.isBoss ? 40 : 10),
            targetY: enemy.y,
            color: ship.laserColor,
            progress: 0,
          });

          if (enemy.typed === enemy.word) {
            createExplosion(enemy.x, enemy.y, enemy.isBoss ? '#ef4444' : ship.laserColor, enemy.isBoss ? 80 : 20);
            state.score += enemy.word.length * (enemy.isBoss ? 50 : 10);
            
            if (enemy.isBoss) {
              state.bossPhase++;
              if (state.bossPhase >= 3) {
                state.enemies = state.enemies.filter(e => e.id !== enemy.id);
                state.activeEnemyId = null;
                state.isGameOver = true;
                soundService.stopBackgroundMusic();
                soundService.playLevelUp();
                onGameOver({ score: state.score, totalStrokes: state.totalStrokes, correctStrokes: state.correctStrokes, level: state.level, startTime: state.startTime, endTime: Date.now(), shipId: ship.id });
              } else {
                enemy.word = BOSS_PHRASES[state.bossPhase];
                enemy.typed = '';
                state.activeEnemyId = null;
              }
            } else {
              state.enemies = state.enemies.filter(e => e.id !== enemy.id);
              state.activeEnemyId = null;
              
              if (state.level < 3 && state.score >= state.level * LEVEL_THRESHOLD) {
                state.isTransitioning = true;
                state.transitionTimer = 120;
                state.transitionType = state.level === 2 ? 'BOSS' : 'LEVEL';
                setUiState(prev => ({ 
                  ...prev, 
                  showTransition: true, 
                  transitionText: state.level === 2 ? 'DREADNOUGHT DETECTED' : `LEVEL ${state.level} COMPLETE` 
                }));
                soundService.playLevelUp();
              }
            }
          }
        } else soundService.playError();
      }
    } else {
      const missiles = state.enemies.filter(e => !e.isBoss);
      const boss = state.enemies.find(e => e.isBoss);
      
      // PRIORITY: Gunship words (missiles) must be typed before boss
      const target = missiles.find(e => e.word[0] === key) || (boss && boss.word[0] === key ? boss : null);
      
      if (target) {
        state.activeEnemyId = target.id;
        target.typed = key;
        state.correctStrokes++;
        soundService.playLaser(ship.laserColor);
        state.playerX = target.x;
        state.lasers.push({
          x: state.playerX,
          y: window.innerHeight - 80,
          targetX: target.x,
          targetY: target.y,
          color: ship.laserColor,
          progress: 0,
        });
      } else soundService.playError();
    }
  }, [ship, onGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const drawFighter = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, scale: number = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(-6, -10);
    ctx.lineTo(-20, 10);
    ctx.lineTo(-6, 5);
    ctx.lineTo(-4, 20);
    ctx.lineTo(4, 20);
    ctx.lineTo(6, 5);
    ctx.lineTo(20, 10);
    ctx.lineTo(6, -10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(-3, -15, 6, 15);
    ctx.fillStyle = '#00eaff';
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(0, -8, 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawEnemyShip = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isBoss: boolean = false) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI);
    if (isBoss) {
      ctx.fillStyle = color;
      ctx.shadowBlur = 50;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(0, 80);
      ctx.lineTo(-100, 20);
      ctx.lineTo(-80, -40);
      ctx.lineTo(-40, -80);
      ctx.lineTo(40, -80);
      ctx.lineTo(80, -40);
      ctx.lineTo(100, 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.globalAlpha = 0.4;
      ctx.fillRect(-60, -60, 120, 20);
      ctx.fillRect(-30, 0, 60, 40);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200) * 0.4;
      ctx.fillRect(-70, -30, 10, 20);
      ctx.fillRect(60, -30, 10, 20);
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 25);
      ctx.lineTo(-20, -5);
      ctx.lineTo(-12, -2);
      ctx.lineTo(-12, -15);
      ctx.lineTo(-4, -8);
      ctx.lineTo(0, -20);
      ctx.lineTo(4, -8);
      ctx.lineTo(12, -15);
      ctx.lineTo(12, -2);
      ctx.lineTo(20, -5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#00eaff';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(-10, -18, 4, 4);
      ctx.fillRect(6, -18, 4, 4);
    }
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animationFrame: number;

    const render = (time: number) => {
      const state = stateRef.current;
      if (state.isGameOver) return;

      if (state.isTransitioning) {
        state.transitionTimer--;
        if (state.transitionTimer <= 0) {
          state.isTransitioning = false;
          setUiState(prev => ({ ...prev, showTransition: false }));
          if (state.transitionType === 'BOSS') { state.level = 3; spawnBoss(); } 
          else { state.level++; }
        }
      }

      if (!state.isTransitioning) {
        const spawnDelay = state.level === 3 ? 2500 : Math.max(700, SPAWN_RATE - state.level * 200);
        if (time - state.lastSpawn > spawnDelay) {
          spawnEnemy();
          state.lastSpawn = time;
        }

        state.enemies.forEach(enemy => {
          if (!enemy.isBoss) {
            enemy.y += enemy.speed;
          }
          if (enemy.y > canvas.height - 100) {
            state.isGameOver = true;
            soundService.stopBackgroundMusic();
            soundService.playGameOver();
            onGameOver({ score: state.score, totalStrokes: state.totalStrokes, correctStrokes: state.correctStrokes, level: state.level, startTime: state.startTime, endTime: Date.now(), shipId: ship.id });
          }
        });
      }

      state.particles = state.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; return p.life > 0; });
      state.lasers = state.lasers.filter(l => { l.progress += 0.25; return l.progress < 1; });

      if (Math.random() > 0.95) setUiState(prev => ({ ...prev, score: state.score, level: state.level }));

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      state.lasers.forEach(l => {
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.targetX, l.targetY); ctx.stroke();
      });

      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      state.enemies.forEach(enemy => {
        const isLocked = enemy.id === state.activeEnemyId;
        drawEnemyShip(ctx, enemy.x, enemy.y, isLocked ? (enemy.isBoss ? '#ef4444' : ship.laserColor) : '#ffffff44', enemy.isBoss);

        const textY = enemy.y + (enemy.isBoss ? 120 : 45);
        // Smaller Font Size: Boss 16px, Enemy 11px
        ctx.font = enemy.isBoss ? 'bold 16px "JetBrains Mono", monospace' : 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        const textWidth = ctx.measureText(enemy.word).width;
        
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(enemy.x - textWidth/2 - 5, textY - (enemy.isBoss ? 16 : 12), textWidth + 10, enemy.isBoss ? 24 : 18);
        
        ctx.fillStyle = enemy.isBoss ? '#ef4444' : ship.laserColor;
        const typedWidth = ctx.measureText(enemy.typed).width;
        ctx.fillText(enemy.typed, enemy.x - textWidth / 2 + typedWidth / 2, textY);
        
        ctx.fillStyle = '#ffffff';
        const remaining = enemy.word.slice(enemy.typed.length);
        ctx.fillText(remaining, enemy.x + textWidth / 2 - ctx.measureText(remaining).width / 2, textY);
      });

      drawFighter(ctx, state.playerX, canvas.height - 80, ship.color, 1);

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, [spawnEnemy, spawnBoss, onGameOver, ship]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden cursor-none">
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-20 flex flex-col items-start gap-1">
        <div className="text-blue-400 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] font-bold">TACTICAL_SCORE</div>
        <div className="text-2xl sm:text-4xl font-black italic tracking-tighter mono neon-glow">{uiState.score.toString().padStart(6, '0')}</div>
      </div>
      
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-20 text-right">
        <div className="text-blue-400 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] font-bold">SYSTEM_LEVEL</div>
        <div className="text-2xl sm:text-4xl font-black italic tracking-tighter mono text-white">{uiState.level.toString().padStart(2, '0')}</div>
      </div>

      {uiState.showTransition && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
           <div className="text-center p-12 border-y-2 border-white/20 w-full bg-gradient-to-r from-transparent via-blue-900/40 to-transparent">
              <h2 className={`text-4xl sm:text-6xl font-black italic tracking-tighter uppercase ${uiState.transitionText.includes('BOSS') || uiState.transitionText.includes('DREADNOUGHT') ? 'text-red-500 neon-glow' : 'text-blue-400 neon-glow'}`}>
                {uiState.transitionText}
              </h2>
              <p className="text-white/50 tracking-[0.5em] mt-4 text-xs font-bold uppercase animate-pulse">Synchronizing Neural Strike...</p>
           </div>
        </div>
      )}

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 w-48 sm:w-64">
         <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(100, (uiState.score % (uiState.level * LEVEL_THRESHOLD)) / (LEVEL_THRESHOLD / 100))}%` }}></div>
         </div>
         <div className="mt-2 text-[8px] sm:text-[10px] text-center text-blue-400/50 tracking-widest uppercase font-bold">Combat Efficiency</div>
      </div>

      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

export default GameCanvas;
