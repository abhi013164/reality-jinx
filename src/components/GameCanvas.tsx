import { useRef, useEffect, useCallback, useState } from 'react';
import {
  CANVAS_W, CANVAS_H,
  createGameState, update, draw,
  initLevel, checkPlayAgainClick,
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

  // Start game
  const startGame = useCallback(() => {
    const gs = createGameState();
    gsRef.current = gs;
    initLevel(gs, 1);
    setStarted(true);
  }, []);

  // Input
  useEffect(() => {
    const gs = gsRef.current;

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      gs.keys[e.key] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      gs.keys[e.key] = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      gs.mouseX = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
      gs.mouseY = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    };
    const onClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
      const cy = ((e.clientY - rect.top) / rect.height) * CANVAS_H;

      if (checkPlayAgainClick(gs, cx, cy)) {
        const newGs = createGameState();
        gsRef.current = newGs;
        initLevel(newGs, 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    canvasRef.current?.addEventListener('click', onClick);

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

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [started, onStateUpdate]);

  // Draw start screen when not started
  useEffect(() => {
    if (started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.textAlign = 'center';
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00E5FF';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 30;
    ctx.fillText('REALITY SHIFT', CANVAS_W / 2, 200);
    ctx.shadowBlur = 0;

    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FFEA00';
    ctx.fillText('— TROLL EDITION —', CANVAS_W / 2, 240);

    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Do not trust the game.', CANVAS_W / 2, 310);

    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    const bw = 240, bh = 50;
    const bx = CANVAS_W / 2 - bw / 2, by = 380;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00E5FF';
    ctx.fillText('[ BEGIN ]', CANVAS_W / 2, by + bh / 2 + 6);
  }, [started]);

  // Click to start
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const cy = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    const bw = 240, bh = 50;
    const bx = CANVAS_W / 2 - bw / 2, by = 380;
    if (cx >= bx && cx <= bx + bw && cy >= by && cy <= by + bh) {
      startGame();
    }
  }, [started, startGame]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      onClick={handleCanvasClick}
      className="w-full max-w-[800px] border border-border box-glow-cyan cursor-crosshair"
      style={{ imageRendering: 'pixelated', aspectRatio: '800/600' }}
    />
  );
}
