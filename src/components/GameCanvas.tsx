import { useRef, useEffect, useCallback, useState } from 'react';
import {
  CANVAS_W, CANVAS_H,
  createGameState, update, draw,
  initLevel,
  type GameState,
} from '@/game/engine';

interface GameCanvasProps {
  onStateUpdate?: (gs: GameState) => void;
}

export default function GameCanvas({ onStateUpdate }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GameState>(createGameState());
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [started, setStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    timePlayed: number;
    deathCount: number;
    playerChoice: 'red' | 'blue' | null;
  } | null>(null);

  const startGame = useCallback(() => {
    const gs = createGameState();
    gsRef.current = gs;
    initLevel(gs, 1);
    lastTimeRef.current = 0;
    setStarted(true);
    setShowResults(false);
    setResults(null);
  }, []);

  const playAgain = useCallback(() => {
    startGame();
  }, [startGame]);

  // Input handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      gsRef.current.keys[e.key] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      gsRef.current.keys[e.key] = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      gsRef.current.mouseX = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
      gsRef.current.mouseY = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = (time: number) => {
      const dt = lastTimeRef.current ? time - lastTimeRef.current : 16;
      lastTimeRef.current = time;

      const gs = gsRef.current;
      update(gs, dt);
      draw(ctx, gs);
      onStateUpdate?.(gs);

      // Check if results should show
      if (gs.showResults && !showResults) {
        setShowResults(true);
        setResults({
          timePlayed: gs.timePlayed,
          deathCount: gs.deathCount,
          playerChoice: gs.playerChoice,
        });
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [started, onStateUpdate, showResults]);

  return (
    <div className="relative w-full max-w-[800px]" style={{ aspectRatio: '800/600' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full h-full border border-border box-glow-cyan cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
        tabIndex={0}
      />

      {/* Start Screen Overlay */}
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-darker/95 z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary text-shadow-cyan tracking-widest mb-2">
            REALITY SHIFT
          </h2>
          <p className="font-mono text-sm text-cyber-yellow mb-6">— TROLL EDITION —</p>
          <p className="font-mono text-base text-foreground mb-10">Do not trust the game.</p>
          <button
            onClick={startGame}
            className="font-mono text-lg font-bold text-primary border-2 border-primary px-12 py-3 hover:bg-primary/10 transition-colors tracking-wider cursor-pointer"
          >
            [ BEGIN ]
          </button>
        </div>
      )}

      {/* Results Screen Overlay */}
      {showResults && results && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-darker/98 z-10 p-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary text-shadow-cyan tracking-widest mb-1">
            REALITY SHIFT
          </h2>
          <p className="font-mono text-sm text-cyber-yellow mb-8">— FINAL REPORT —</p>

          <p className="font-mono text-base text-foreground mb-3">
            You played for <span className="text-primary font-bold">{results.timePlayed}</span> seconds.
          </p>
          <p className="font-mono text-base text-foreground mb-8">
            Deaths/failures: <span className="text-primary font-bold">{results.deathCount}</span>
          </p>

          <div className="font-mono text-sm text-cyber-yellow text-center mb-8 max-w-md">
            {results.playerChoice === 'red' ? (
              <>
                <p>You chose the Red Door to be rebellious.</p>
                <p>It led to the exact same code as the Blue Door.</p>
              </>
            ) : results.playerChoice === 'blue' ? (
              <>
                <p>You chose the Blue Door to be safe.</p>
                <p>It led to the exact same code as the Red Door.</p>
              </>
            ) : (
              <p>You somehow avoided both doors. Impressive.</p>
            )}
          </div>

          <p className="font-mono text-lg text-secondary text-shadow-green mb-2">Agency is an illusion.</p>
          <p className="font-mono text-lg text-secondary text-shadow-green mb-10">Thanks for playing!</p>

          <button
            onClick={playAgain}
            className="font-mono text-base font-bold text-primary border-2 border-primary px-10 py-3 hover:bg-primary/10 transition-colors tracking-wider cursor-pointer"
          >
            [ PLAY AGAIN ]
          </button>
        </div>
      )}
    </div>
  );
}
