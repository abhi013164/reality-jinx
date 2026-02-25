import { useState, useCallback } from 'react';
import GameCanvas from '@/components/GameCanvas';
import SanityMeter from '@/components/SanityMeter';
import type { GameState } from '@/game/engine';

const Index = () => {
  const [level, setLevel] = useState(1);
  const [timePlayed, setTimePlayed] = useState(0);

  const handleStateUpdate = useCallback((gs: GameState) => {
    setLevel(gs.currentLevel);
    setTimePlayed(gs.timePlayed);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary text-shadow-cyan tracking-widest flicker">
          REALITY SHIFT
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-1 tracking-wider">
          Do not trust the game.
        </p>
      </header>

      {/* Canvas */}
      <GameCanvas onStateUpdate={handleStateUpdate} />

      {/* Bottom HUD */}
      <div className="mt-4">
        <SanityMeter level={level} timePlayed={timePlayed} />
      </div>

      {/* Decorative corners */}
      <div className="fixed top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary opacity-30" />
      <div className="fixed top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary opacity-30" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary opacity-30" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary opacity-30" />
    </div>
  );
};

export default Index;
