
import React from 'react';
import { GameStats } from '../types';
import { SHIPS } from '../constants';
import { Trophy, Target, Zap, Clock, RefreshCw } from 'lucide-react';

interface ResultsScreenProps {
  stats: GameStats;
  onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ stats, onRestart }) => {
  const durationInSeconds = (stats.endTime - stats.startTime) / 1000;
  const wpm = Math.round((stats.correctStrokes / 5) / (durationInSeconds / 60) || 0);
  const accuracy = Math.round((stats.correctStrokes / (stats.totalStrokes || 1)) * 100);
  const ship = SHIPS.find(s => s.id === stats.shipId)!;

  const getRank = () => {
    if (wpm > 80 && accuracy > 95) return { title: 'ELITE', color: 'text-yellow-400', msg: 'The stars tremble at your precision.' };
    if (wpm > 60 && accuracy > 90) return { title: 'ACE', color: 'text-red-500', msg: 'One strike away from Elite. Push harder.' };
    if (wpm > 40) return { title: 'PILOT', color: 'text-blue-500', msg: 'Accuracy mastered. Speed is next.' };
    return { title: 'CADET', color: 'text-gray-400', msg: 'Keep training, Pilot. The galaxy needs you.' };
  };

  const rank = getRank();

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-700 overflow-y-auto">
      <div className="max-w-4xl w-full py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter mb-2 neon-glow">MISSION TERMINATED</h2>
          <p className="text-red-500 tracking-[0.3em] sm:tracking-[0.5em] font-bold uppercase text-xs sm:text-sm">Hull Integrity Depleted</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
          {/* Left Side: Main Stats */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg text-blue-400">
                  <Zap size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-[8px] sm:text-[10px] text-blue-400 font-bold tracking-widest uppercase">Words Per Minute</div>
                  <div className="text-2xl sm:text-4xl font-black mono italic">{wpm}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-right">
                <div>
                  <div className="text-[8px] sm:text-[10px] text-blue-400 font-bold tracking-widest uppercase">Accuracy</div>
                  <div className="text-2xl sm:text-4xl font-black mono italic">{accuracy}%</div>
                </div>
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg text-blue-400">
                  <Target size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-8 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-lg text-yellow-400">
                  <Trophy size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-[8px] sm:text-[10px] text-yellow-400 font-bold tracking-widest uppercase">Total Score</div>
                  <div className="text-2xl sm:text-4xl font-black mono italic">{stats.score.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-right">
                <div>
                  <div className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-widest uppercase">Combat Time</div>
                  <div className="text-lg sm:text-xl font-black mono italic">{Math.floor(durationInSeconds)}s</div>
                </div>
                <div className="p-2 sm:p-3 bg-gray-500/20 rounded-lg text-gray-400">
                  <Clock size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Rank & Vessel */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <div className="text-[8px] sm:text-[10px] text-blue-400 font-bold tracking-widest uppercase mb-2">Final Combat Grade</div>
              <div className={`text-5xl sm:text-7xl font-black italic tracking-tighter mb-4 ${rank.color} drop-shadow-[0_0_15px_currentColor]`}>
                {rank.title}
              </div>
              <p className="text-gray-400 text-sm max-w-xs">{rank.msg}</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
              <div className="p-3 sm:p-4 bg-blue-500/20 rounded-xl" style={{ color: ship.color }}>
                 <RefreshCw size={24} className="sm:w-8 sm:h-8 rotate-12" />
              </div>
              <div>
                <div className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-widest uppercase">Vessel Deployed</div>
                <div className="text-xl sm:text-2xl font-black italic tracking-tight" style={{ color: ship.color }}>{ship.name}</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 sm:py-6 bg-white hover:bg-gray-200 text-black font-black text-xl sm:text-2xl tracking-widest rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-8"
        >
          RETURN TO HANGAR
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
