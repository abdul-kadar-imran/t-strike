
import React, { useState, useEffect } from 'react';

interface CinematicIntroProps {
  onComplete: () => void;
}

const lines = [
  "You are the last jet pilot.",
  "Trapped deep in enemy territory.",
  "Gunship waves are closing in.",
  "Break through the deadly layers.",
  "The final boss awaits.",
  "Type… or be destroyed."
];

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const line = lines[currentLineIndex];
      if (currentCharIndex < line.length) {
        const timeout = setTimeout(() => {
          const updatedLines = [...visibleLines];
          if (!updatedLines[currentLineIndex]) {
            updatedLines[currentLineIndex] = "";
          }
          updatedLines[currentLineIndex] += line[currentCharIndex];
          setVisibleLines(updatedLines);
          setCurrentCharIndex(currentCharIndex + 1);
        }, 40);
        return () => clearTimeout(timeout);
      } else {
        const nextLineTimeout = setTimeout(() => {
          setCurrentLineIndex(currentLineIndex + 1);
          setCurrentCharIndex(0);
        }, 600);
        return () => clearTimeout(nextLineTimeout);
      }
    } else {
      const finishTimeout = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(finishTimeout);
    }
  }, [currentLineIndex, currentCharIndex, visibleLines, onComplete]);

  return (
    <div className="relative z-50 flex flex-col items-center justify-center min-h-screen bg-slate-950 px-6 text-center select-none cursor-none">
      <div className="space-y-4 max-w-2xl">
        {visibleLines.map((line, idx) => (
          <div 
            key={idx} 
            className={`text-xl sm:text-3xl font-bold tracking-widest mono transition-opacity duration-1000 ${
              idx === lines.length - 1 ? 'text-red-500 neon-glow' : 'text-blue-400'
            }`}
          >
            {line}
            {idx === currentLineIndex && <span className="animate-pulse">|</span>}
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/20 text-xs tracking-[0.5em] uppercase font-bold animate-pulse">
        Initializing Neural Link...
      </div>
    </div>
  );
};

export default CinematicIntro;
