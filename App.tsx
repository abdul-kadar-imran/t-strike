
import React, { useState, useCallback } from 'react';
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import ResultsScreen from './components/ResultsScreen';
import Background from './components/Background';
import CinematicIntro from './components/CinematicIntro';
import { GameState, ShipConfig, GameStats } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [selectedShip, setSelectedShip] = useState<ShipConfig | null>(null);
  const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);

  const startGame = useCallback((ship: ShipConfig) => {
    setSelectedShip(ship);
    setGameState(GameState.CINEMATIC);
  }, []);

  const finishCinematic = useCallback(() => {
    setGameState(GameState.PLAYING);
  }, []);

  const handleGameOver = useCallback((stats: GameStats) => {
    setLastGameStats(stats);
    setGameState(GameState.GAME_OVER);
  }, []);

  const returnToMenu = useCallback(() => {
    setGameState(GameState.MENU);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      <Background />
      
      {gameState === GameState.MENU && (
        <MainMenu onStart={startGame} />
      )}

      {gameState === GameState.CINEMATIC && (
        <CinematicIntro onComplete={finishCinematic} />
      )}

      {gameState === GameState.PLAYING && selectedShip && (
        <GameCanvas 
          ship={selectedShip} 
          onGameOver={handleGameOver} 
        />
      )}

      {gameState === GameState.GAME_OVER && lastGameStats && (
        <ResultsScreen 
          stats={lastGameStats} 
          onRestart={returnToMenu} 
        />
      )}
      
      {/* Decorative scanline effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-50"></div>
    </div>
  );
};

export default App;
