
import React, { useState } from 'react';
import { SHIPS } from '../constants';
import { ShipConfig } from '../types';
import { Plane, Zap, Shield, Volume2, VolumeX } from 'lucide-react';
import { soundService } from '../services/soundService';

interface MainMenuProps {
  onStart: (ship: ShipConfig) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const [selectedShipId, setSelectedShipId] = useState(SHIPS[0].id);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundService.setMute(next);
  };

  const selectedShip = SHIPS.find(s => s.id === selectedShipId)!;

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-white bg-transparent">
      <div className="text-center mb-12">
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-4 italic text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-500 neon-glow">
          T-STRIKE
        </h1>
        <p className="text-blue-400 tracking-widest uppercase text-sm md:text-lg">Tactical Typing Combat System</p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Ship Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-blue-500/30 pb-2 mb-6">
            <h2 className="text-2xl font-bold tracking-tighter">SELECT GUNSHIP</h2>
            <button 
              onClick={toggleMute}
              className="p-3 border border-white/10 hover:bg-white/10 transition-all bg-white/5 rounded-2xl flex items-center justify-center aspect-square"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {SHIPS.map(ship => (
              <button
                key={ship.id}
                onClick={() => setSelectedShipId(ship.id)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${
                  selectedShipId === ship.id
                    ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105'
                    : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
              >
                <Plane 
                  size={32} 
                  style={{ color: ship.color }} 
                  className={`rotate-[-45deg] ${selectedShipId === ship.id ? 'animate-pulse' : ''}`} 
                />
                <span className="mt-2 text-[10px] font-bold tracking-[0.2em]">{ship.name}</span>
              </button>
            ))}
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold" style={{ color: selectedShip.color }}>{selectedShip.name}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{selectedShip.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-yellow-400" />
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${selectedShip.fireRate * 80}%` }}></div>
                </div>
                <span className="text-[10px] w-12 text-right">FIRE RATE</span>
              </div>
              <div className="flex items-center gap-3">
                <Plane size={16} className="text-blue-400" />
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${selectedShip.speed * 80}%` }}></div>
                </div>
                <span className="text-[10px] w-12 text-right">MANEUVER</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-red-400" />
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${selectedShip.power * 80}%` }}></div>
                </div>
                <span className="text-[10px] w-12 text-right">POWER</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button Area */}
        <div className="flex flex-col items-center gap-8">
          <button
            onClick={() => onStart(selectedShip)}
            className="group relative w-full h-24 bg-blue-600 hover:bg-blue-500 rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="text-3xl font-black tracking-widest">INITIALIZE STRIKE</span>
          </button>
          
          <div className="flex items-center gap-6 text-gray-400 text-sm tracking-widest uppercase">
            <span>High Fidelity Simulation</span>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <span>Type to Annihilate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
