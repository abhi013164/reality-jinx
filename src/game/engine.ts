// ============================================================
// REALITY SHIFT - Troll Edition: Game Engine
// "Do not trust the game."
// ============================================================

// --- Constants ---
export const CANVAS_W = 800;
export const CANVAS_H = 600;
export const PLAYER_SIZE = 24;
export const PLAYER_SPEED = 3.5;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;

// --- Colors ---
export const COLORS = {
  bg: '#121212',
  player: '#00E5FF',
  goal: '#39FF14',
  trap: '#FF003C',
  text: '#FFFFFF',
  alert: '#FFEA00',
  wall: '#333333',
  doorRed: '#FF003C',
  doorBlue: '#4488FF',
  coin: '#FFEA00',
};

// --- Types ---
export interface Rect {
  x: number; y: number; w: number; h: number;
}

export interface GameState {
  currentLevel: number;
  playerX: number;
  playerY: number;
  playerVX: number;
  playerVY: number;
  isPaused: boolean;
  keys: Record<string, boolean>;
  playerChoice: 'red' | 'blue' | null;
  deathCount: number;
  timePlayed: number;
  levelTime: number;

  // Level-specific
  coinX: number;
  coinY: number;
  coinChaseStart: number;
  coinCaught: boolean;
  level2Complete: boolean;

  // Level 3
  onGround: boolean;
  useGravity: boolean;

  // Level 4
  controlsInverted: boolean;
  lastSwapTime: number;
  showedAlert: boolean;
  mazeComplete: boolean;

  // Level 5
  fakeCrashStart: number;
  mouseX: number;
  mouseY: number;
  showResults: boolean;

  // Effects
  glitchActive: boolean;
  glitchEnd: number;
  overlayText: string;
  overlayEnd: number;
  overlayColor: string;
  fadeAlpha: number;
  fadeDir: 'in' | 'out' | null;
  fadeCallback: (() => void) | null;

  // Panic
  panicActive: boolean;
  panicAngle: number;

  // Game over
  gameOver: boolean;
  gameStartTime: number;
}

// --- Init ---
export function createGameState(): GameState {
  return {
    currentLevel: 1,
    playerX: 60,
    playerY: CANVAS_H / 2 - PLAYER_SIZE / 2,
    playerVX: 0,
    playerVY: 0,
    isPaused: false,
    keys: {},
    playerChoice: null,
    deathCount: 0,
    timePlayed: 0,
    levelTime: 0,
    coinX: CANVAS_W / 2 - 10,
    coinY: CANVAS_H / 2 - 10,
    coinChaseStart: 0,
    coinCaught: false,
    level2Complete: false,
    onGround: false,
    useGravity: false,
    controlsInverted: false,
    lastSwapTime: 0,
    showedAlert: false,
    mazeComplete: false,
    fakeCrashStart: 0,
    mouseX: 0,
    mouseY: 0,
    showResults: false,
    glitchActive: false,
    glitchEnd: 0,
    overlayText: '',
    overlayEnd: 0,
    overlayColor: COLORS.text,
    fadeAlpha: 0,
    fadeDir: null,
    fadeCallback: null,
    panicActive: false,
    panicAngle: 0,
    gameOver: false,
    gameStartTime: Date.now(),
  };
}

// --- AABB Collision ---
export function aabb(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// --- Maze for Level 4 ---
export interface MazeWall extends Rect {}

export function getMazeWalls(): MazeWall[] {
  const t = 20; // thickness
  return [
    // Outer walls
    { x: 0, y: 0, w: CANVAS_W, h: t },
    { x: 0, y: CANVAS_H - t, w: CANVAS_W, h: t },
    { x: 0, y: 0, w: t, h: CANVAS_H },
    { x: CANVAS_W - t, y: 0, w: t, h: CANVAS_H },
    // Internal maze walls
    { x: 120, y: t, w: t, h: 200 },
    { x: 120, y: 280, w: t, h: 200 },
    { x: 240, y: 100, w: t, h: 300 },
    { x: 240, y: 480, w: 200, h: t },
    { x: 360, y: t, w: t, h: 180 },
    { x: 360, y: 280, w: t, h: 150 },
    { x: 360, y: 280, w: 150, h: t },
    { x: 480, y: 150, w: t, h: 250 },
    { x: 480, y: 480, w: t, h: 120 },
    { x: 560, y: t, w: t, h: 350 },
    { x: 560, y: 440, w: 160, h: t },
    { x: 660, y: 200, w: t, h: 240 },
  ];
}

export const MAZE_GOAL: Rect = { x: CANVAS_W - 70, y: CANVAS_H / 2 - 20, w: 40, h: 40 };

// --- Level 3 platforms ---
export function getLevel3Platforms(): Rect[] {
  return [
    { x: 0, y: CANVAS_H - 30, w: CANVAS_W, h: 30 }, // floor
    { x: 200, y: 430, w: 120, h: 20 },
    { x: 400, y: 350, w: 120, h: 20 },
  ];
}

export const DOOR_RED: Rect = { x: 200, y: CANVAS_H - 30 - 100, w: 80, h: 100 };
export const DOOR_BLUE: Rect = { x: CANVAS_W - 280, y: CANVAS_H - 30 - 100, w: 80, h: 100 };

// --- Overlay Text Helper ---
export function showOverlay(gs: GameState, text: string, duration: number, color = COLORS.text) {
  gs.overlayText = text;
  gs.overlayEnd = Date.now() + duration;
  gs.overlayColor = color;
}

// --- Glitch effect ---
export function triggerGlitch(gs: GameState, duration = 400) {
  gs.glitchActive = true;
  gs.glitchEnd = Date.now() + duration;
}

// --- Start fade ---
export function startFade(gs: GameState, dir: 'in' | 'out', cb?: () => void) {
  gs.fadeDir = dir;
  gs.fadeAlpha = dir === 'out' ? 0 : 1;
  gs.fadeCallback = cb || null;
}

// --- Init level ---
export function initLevel(gs: GameState, level: number) {
  gs.currentLevel = level;
  gs.levelTime = 0;
  gs.panicActive = false;

  switch (level) {
    case 1:
      gs.playerX = 60;
      gs.playerY = CANVAS_H / 2 - PLAYER_SIZE / 2;
      gs.useGravity = false;
      break;
    case 2:
      gs.playerX = 60;
      gs.playerY = 60;
      gs.useGravity = false;
      gs.coinX = CANVAS_W / 2 - 10;
      gs.coinY = CANVAS_H / 2 - 10;
      gs.coinChaseStart = Date.now();
      gs.coinCaught = false;
      gs.level2Complete = false;
      break;
    case 3:
      gs.playerX = 60;
      gs.playerY = CANVAS_H - 30 - PLAYER_SIZE;
      gs.playerVY = 0;
      gs.useGravity = true;
      gs.onGround = true;
      break;
    case 4:
      gs.playerX = 40;
      gs.playerY = CANVAS_H / 2;
      gs.useGravity = false;
      gs.controlsInverted = false;
      gs.lastSwapTime = Date.now();
      gs.showedAlert = false;
      gs.mazeComplete = false;
      break;
    case 5:
      gs.fakeCrashStart = Date.now();
      gs.showResults = false;
      break;
  }
}

// --- Detect panic (all arrows pressed) ---
function detectPanic(keys: Record<string, boolean>): boolean {
  const u = keys['ArrowUp'] || keys['w'];
  const d = keys['ArrowDown'] || keys['s'];
  const l = keys['ArrowLeft'] || keys['a'];
  const r = keys['ArrowRight'] || keys['d'];
  return !!(u && d && l && r);
}

// --- Out of bounds check ---
function clampOrWrap(gs: GameState) {
  if (gs.currentLevel === 1) {
    // Level 1: wrap left edge
    if (gs.playerX < -PLAYER_SIZE) {
      gs.playerX = CANVAS_W;
    }
    // clamp top/bottom
    gs.playerY = Math.max(0, Math.min(CANVAS_H - PLAYER_SIZE, gs.playerY));
    // clamp right (but not too hard)
    if (gs.playerX > CANVAS_W + PLAYER_SIZE) {
      gs.playerX = CANVAS_W / 2;
      gs.playerY = CANVAS_H / 2;
      showOverlay(gs, 'Nice try, cheater.', 1500, COLORS.alert);
    }
  } else if (!gs.useGravity) {
    // Top-down: clamp all edges
    if (gs.playerX < 0 || gs.playerX > CANVAS_W - PLAYER_SIZE || gs.playerY < 0 || gs.playerY > CANVAS_H - PLAYER_SIZE) {
      if (gs.currentLevel !== 4) { // maze has walls, so clamp
        gs.playerX = Math.max(0, Math.min(CANVAS_W - PLAYER_SIZE, gs.playerX));
        gs.playerY = Math.max(0, Math.min(CANVAS_H - PLAYER_SIZE, gs.playerY));
      }
    }
  } else {
    // Platformer: clamp sides
    gs.playerX = Math.max(0, Math.min(CANVAS_W - PLAYER_SIZE, gs.playerX));
  }
}

// --- UPDATE ---
export function update(gs: GameState, dt: number) {
  if (gs.isPaused || gs.gameOver) return;
  if (gs.currentLevel === 5 && !gs.showResults) {
    // Level 5 doesn't need player movement
    const elapsed = Date.now() - gs.fakeCrashStart;
    if (elapsed > 10000) {
      gs.showResults = true;
      gs.timePlayed = Math.floor((Date.now() - gs.gameStartTime) / 1000);
    }
    return;
  }
  if (gs.showResults) return;

  gs.levelTime += dt;
  gs.timePlayed = Math.floor((Date.now() - gs.gameStartTime) / 1000);

  // Panic detection
  gs.panicActive = detectPanic(gs.keys);
  if (gs.panicActive) {
    gs.panicAngle += 0.3;
  }

  // Fade logic
  if (gs.fadeDir === 'out') {
    gs.fadeAlpha = Math.min(1, gs.fadeAlpha + 0.04);
    if (gs.fadeAlpha >= 1 && gs.fadeCallback) {
      gs.fadeCallback();
      gs.fadeCallback = null;
      gs.fadeDir = 'in';
    }
    return;
  }
  if (gs.fadeDir === 'in') {
    gs.fadeAlpha = Math.max(0, gs.fadeAlpha - 0.04);
    if (gs.fadeAlpha <= 0) gs.fadeDir = null;
  }

  // Glitch timeout
  if (gs.glitchActive && Date.now() > gs.glitchEnd) {
    gs.glitchActive = false;
  }

  // Overlay timeout
  if (gs.overlayText && Date.now() > gs.overlayEnd) {
    gs.overlayText = '';
  }

  // Movement input
  let dx = 0, dy = 0;
  const k = gs.keys;
  if (k['ArrowLeft'] || k['a']) dx -= 1;
  if (k['ArrowRight'] || k['d']) dx += 1;
  if (k['ArrowUp'] || k['w']) dy -= 1;
  if (k['ArrowDown'] || k['s']) dy += 1;

  // Level 4: invert controls
  if (gs.currentLevel === 4 && gs.controlsInverted) {
    dx = -dx;
    dy = -dy;
  }

  if (!gs.panicActive) {
    if (gs.useGravity) {
      // Platformer movement
      gs.playerX += dx * PLAYER_SPEED;
      // Jump
      if ((k['ArrowUp'] || k['w'] || k[' ']) && gs.onGround) {
        gs.playerVY = JUMP_FORCE;
        gs.onGround = false;
      }
      gs.playerVY += GRAVITY;
      gs.playerY += gs.playerVY;

      // Platform collision
      const plats = getLevel3Platforms();
      gs.onGround = false;
      for (const p of plats) {
        const playerRect: Rect = { x: gs.playerX, y: gs.playerY, w: PLAYER_SIZE, h: PLAYER_SIZE };
        if (aabb(playerRect, p) && gs.playerVY >= 0) {
          gs.playerY = p.y - PLAYER_SIZE;
          gs.playerVY = 0;
          gs.onGround = true;
        }
      }
    } else {
      // Top-down movement
      gs.playerX += dx * PLAYER_SPEED;
      gs.playerY += dy * PLAYER_SPEED;
    }
  }

  // Level-specific logic
  switch (gs.currentLevel) {
    case 1: updateLevel1(gs); break;
    case 2: updateLevel2(gs); break;
    case 3: updateLevel3(gs); break;
    case 4: updateLevel4(gs); break;
  }

  clampOrWrap(gs);
}

// --- Level 1: The Spatial Troll ---
function updateLevel1(gs: GameState) {
  const wall: Rect = { x: CANVAS_W / 2 - 15, y: 0, w: 30, h: CANVAS_H };
  const player: Rect = { x: gs.playerX, y: gs.playerY, w: PLAYER_SIZE, h: PLAYER_SIZE };
  const goal: Rect = { x: CANVAS_W - 70, y: CANVAS_H / 2 - 20, w: 40, h: 40 };

  // Wall collision (push back)
  if (aabb(player, wall)) {
    if (gs.playerX + PLAYER_SIZE / 2 < wall.x + wall.w / 2) {
      gs.playerX = wall.x - PLAYER_SIZE;
    } else {
      gs.playerX = wall.x + wall.w;
    }
  }

  // Goal check
  if (aabb(player, goal)) {
    showOverlay(gs, 'Thinking outside the box... literally.', 2000, COLORS.goal);
    triggerGlitch(gs, 600);
    startFade(gs, 'out', () => initLevel(gs, 2));
  }
}

// --- Level 2: Carrot on a Stick ---
function updateLevel2(gs: GameState) {
  if (gs.level2Complete) return;

  const elapsed = (Date.now() - gs.coinChaseStart) / 1000;

  const player: Rect = { x: gs.playerX, y: gs.playerY, w: PLAYER_SIZE, h: PLAYER_SIZE };
  const coinRect: Rect = { x: gs.coinX, y: gs.coinY, w: 20, h: 20 };

  const distX = gs.coinX - gs.playerX;
  const distY = gs.coinY - gs.playerY;
  const dist = Math.sqrt(distX * distX + distY * distY);

  // Coin runs away
  if (dist < 120) {
    const angle = Math.atan2(distY, distX);
    const escapeSpeed = PLAYER_SPEED * 1.1;
    gs.coinX += Math.cos(angle) * escapeSpeed;
    gs.coinY += Math.sin(angle) * escapeSpeed;

    // Corner trap: teleport to opposite side
    if (gs.coinX < 20 || gs.coinX > CANVAS_W - 40 || gs.coinY < 20 || gs.coinY > CANVAS_H - 40) {
      gs.coinX = CANVAS_W - gs.coinX;
      gs.coinY = CANVAS_H - gs.coinY;
      gs.coinX = Math.max(40, Math.min(CANVAS_W - 60, gs.coinX));
      gs.coinY = Math.max(40, Math.min(CANVAS_H - 60, gs.coinY));
    }
  }

  // After 15 seconds, auto-complete
  if (elapsed >= 15 && !gs.level2Complete) {
    gs.level2Complete = true;
    showOverlay(gs, 'ACHIEVEMENT: Sunk Cost Fallacy. We\'ll let you pass.', 3000, COLORS.alert);
    triggerGlitch(gs, 800);
    setTimeout(() => {
      startFade(gs, 'out', () => initLevel(gs, 3));
    }, 3000);
  }
}

// --- Level 3: Illusion of Choice ---
function updateLevel3(gs: GameState) {
  const player: Rect = { x: gs.playerX, y: gs.playerY, w: PLAYER_SIZE, h: PLAYER_SIZE };

  if (aabb(player, DOOR_RED)) {
    gs.playerChoice = 'red';
    showOverlay(gs, 'Choice recorded.', 2000, COLORS.alert);
    triggerGlitch(gs, 1200);
    startFade(gs, 'out', () => initLevel(gs, 4));
  }

  if (aabb(player, DOOR_BLUE)) {
    gs.playerChoice = 'blue';
    showOverlay(gs, 'Choice recorded.', 2000, COLORS.alert);
    triggerGlitch(gs, 1200);
    startFade(gs, 'out', () => initLevel(gs, 4));
  }
}

// --- Level 4: Gaslighting Controls ---
function updateLevel4(gs: GameState) {
  if (gs.mazeComplete) return;

  const secInLevel = gs.levelTime / 1000;

  // First inversion at 3 seconds
  if (secInLevel >= 3 && !gs.showedAlert) {
    gs.showedAlert = true;
    gs.controlsInverted = true;
    gs.lastSwapTime = Date.now();
    showOverlay(gs, '⚠ SYSTEM OPTIMIZATION ⚠', 2000, COLORS.alert);
    triggerGlitch(gs, 500);
  }

  // Random swap every 4 seconds after
  if (gs.showedAlert && (Date.now() - gs.lastSwapTime) > 4000) {
    gs.controlsInverted = Math.random() > 0.5;
    gs.lastSwapTime = Date.now();
  }

  // Maze wall collision
  const walls = getMazeWalls();
  const player: Rect = { x: gs.playerX, y: gs.playerY, w: PLAYER_SIZE, h: PLAYER_SIZE };

  for (const w of walls) {
    if (aabb(player, w)) {
      // Push out
      const overlapLeft = (gs.playerX + PLAYER_SIZE) - w.x;
      const overlapRight = (w.x + w.w) - gs.playerX;
      const overlapTop = (gs.playerY + PLAYER_SIZE) - w.y;
      const overlapBottom = (w.y + w.h) - gs.playerY;

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
      if (minOverlap === overlapLeft) gs.playerX = w.x - PLAYER_SIZE;
      else if (minOverlap === overlapRight) gs.playerX = w.x + w.w;
      else if (minOverlap === overlapTop) gs.playerY = w.y - PLAYER_SIZE;
      else gs.playerY = w.y + w.h;
    }
  }

  // Goal check
  if (aabb(player, MAZE_GOAL)) {
    gs.mazeComplete = true;
    showOverlay(gs, 'Maze complete... but at what cost?', 2500, COLORS.goal);
    triggerGlitch(gs, 1000);
    setTimeout(() => {
      startFade(gs, 'out', () => initLevel(gs, 5));
    }, 2500);
  }
}

// ============================================================
// DRAW
// ============================================================
export function draw(ctx: CanvasRenderingContext2D, gs: GameState) {
  ctx.save();

  // Glitch transform
  if (gs.glitchActive) {
    const ox = (Math.random() - 0.5) * 8;
    const oy = (Math.random() - 0.5) * 8;
    ctx.translate(ox, oy);
  }

  // Clear
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (gs.currentLevel === 5) {
    drawLevel5(ctx, gs);
  } else {
    // Draw level
    switch (gs.currentLevel) {
      case 1: drawLevel1(ctx, gs); break;
      case 2: drawLevel2(ctx, gs); break;
      case 3: drawLevel3(ctx, gs); break;
      case 4: drawLevel4(ctx, gs); break;
    }

    // Draw player
    if (gs.currentLevel <= 4) {
      drawPlayer(ctx, gs);
    }

    // Draw overlay text
    if (gs.overlayText) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, CANVAS_H / 2 - 40, CANVAS_W, 80);
      ctx.font = '20px "JetBrains Mono", monospace';
      ctx.fillStyle = gs.overlayColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gs.overlayText, CANVAS_W / 2, CANVAS_H / 2);
      ctx.restore();
    }

    // Panic text
    if (gs.panicActive) {
      ctx.save();
      ctx.font = 'bold 28px "JetBrains Mono", monospace';
      ctx.fillStyle = COLORS.trap;
      ctx.textAlign = 'center';
      ctx.fillText('⚠ PANIC DETECTED ⚠', CANVAS_W / 2, 50);
      ctx.restore();
    }
  }

  // Fade overlay
  if (gs.fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${gs.fadeAlpha})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // Glitch: random colored bars
  if (gs.glitchActive) {
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * CANVAS_H;
      const h = Math.random() * 6 + 2;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,229,255,0.15)' : 'rgba(255,0,60,0.15)';
      ctx.fillRect(0, y, CANVAS_W, h);
    }
  }

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, gs: GameState) {
  ctx.save();

  if (gs.panicActive) {
    ctx.translate(gs.playerX + PLAYER_SIZE / 2, gs.playerY + PLAYER_SIZE / 2);
    ctx.rotate(gs.panicAngle);
    ctx.translate(-(gs.playerX + PLAYER_SIZE / 2), -(gs.playerY + PLAYER_SIZE / 2));
    ctx.fillStyle = Math.random() > 0.5 ? COLORS.player : COLORS.trap;
  } else {
    ctx.fillStyle = COLORS.player;
  }

  // Glow
  ctx.shadowColor = COLORS.player;
  ctx.shadowBlur = 15;
  ctx.fillRect(gs.playerX, gs.playerY, PLAYER_SIZE, PLAYER_SIZE);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// --- Level 1 Draw ---
function drawLevel1(ctx: CanvasRenderingContext2D, gs: GameState) {
  // Wall
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(CANVAS_W / 2 - 15, 0, 30, CANVAS_H);

  // Goal
  ctx.fillStyle = COLORS.goal;
  ctx.shadowColor = COLORS.goal;
  ctx.shadowBlur = 20;
  ctx.fillRect(CANVAS_W - 70, CANVAS_H / 2 - 20, 40, 40);
  ctx.shadowBlur = 0;

  // Instruction
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';
  ctx.fillText('Use Arrow Keys / WASD. Reach the green zone.', CANVAS_W / 2, 30);
}

// --- Level 2 Draw ---
function drawLevel2(ctx: CanvasRenderingContext2D, gs: GameState) {
  // Instruction
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';
  ctx.fillText('Collect the coin to proceed.', CANVAS_W / 2, 30);

  if (!gs.level2Complete) {
    // Coin
    ctx.fillStyle = COLORS.coin;
    ctx.shadowColor = COLORS.coin;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(gs.coinX + 10, gs.coinY + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Timer
    const elapsed = Math.min(15, (Date.now() - gs.coinChaseStart) / 1000);
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.alert;
    ctx.textAlign = 'right';
    ctx.fillText(`${elapsed.toFixed(1)}s`, CANVAS_W - 20, 30);
  }
}

// --- Level 3 Draw ---
function drawLevel3(ctx: CanvasRenderingContext2D, gs: GameState) {
  // Platforms
  ctx.fillStyle = COLORS.wall;
  for (const p of getLevel3Platforms()) {
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  // Red door
  ctx.fillStyle = COLORS.doorRed;
  ctx.shadowColor = COLORS.doorRed;
  ctx.shadowBlur = 15;
  ctx.fillRect(DOOR_RED.x, DOOR_RED.y, DOOR_RED.w, DOOR_RED.h);
  ctx.shadowBlur = 0;
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';
  ctx.fillText('DANGER', DOOR_RED.x + DOOR_RED.w / 2, DOOR_RED.y + DOOR_RED.h / 2 + 5);

  // Blue door
  ctx.fillStyle = COLORS.doorBlue;
  ctx.shadowColor = COLORS.doorBlue;
  ctx.shadowBlur = 15;
  ctx.fillRect(DOOR_BLUE.x, DOOR_BLUE.y, DOOR_BLUE.w, DOOR_BLUE.h);
  ctx.shadowBlur = 0;
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';
  ctx.fillText('SAFE', DOOR_BLUE.x + DOOR_BLUE.w / 2, DOOR_BLUE.y + DOOR_BLUE.h / 2 + 5);

  // Instruction
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.alert;
  ctx.textAlign = 'center';
  ctx.fillText('Your choices matter. Choose wisely.', CANVAS_W / 2, 30);
}

// --- Level 4 Draw ---
function drawLevel4(ctx: CanvasRenderingContext2D, gs: GameState) {
  // Maze walls
  ctx.fillStyle = COLORS.wall;
  for (const w of getMazeWalls()) {
    ctx.fillRect(w.x, w.y, w.w, w.h);
  }

  // Goal
  ctx.fillStyle = COLORS.goal;
  ctx.shadowColor = COLORS.goal;
  ctx.shadowBlur = 20;
  ctx.fillRect(MAZE_GOAL.x, MAZE_GOAL.y, MAZE_GOAL.w, MAZE_GOAL.h);
  ctx.shadowBlur = 0;

  // Instruction
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'left';
  ctx.fillText('Navigate the maze.', 30, CANVAS_H - 35);

  if (gs.controlsInverted) {
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.trap;
    ctx.textAlign = 'right';
    ctx.fillText('[CONTROLS: ???]', CANVAS_W - 30, CANVAS_H - 35);
  }
}

// --- Level 5 Draw ---
function drawLevel5(ctx: CanvasRenderingContext2D, gs: GameState) {
  if (gs.showResults) {
    drawResults(ctx, gs);
    return;
  }

  // Fake crash screen
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';
  ctx.fillText('Aw, Snap!', CANVAS_W / 2, 160);

  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#AAAAAA';
  ctx.fillText('Something went wrong while displaying this game.', CANVAS_W / 2, 210);
  ctx.fillText('Error code: STATUS_MEMORY_OVERFLOW', CANVAS_W / 2, 240);
  ctx.fillText('ERR_REALITY_SHIFT_0x4E6F7065', CANVAS_W / 2, 270);

  // "Are you mad?" follows cursor
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.alert;
  ctx.textAlign = 'left';
  ctx.fillText('Are you mad?', gs.mouseX + 15, gs.mouseY + 5);

  // Countdown
  const remaining = Math.max(0, 10 - (Date.now() - gs.fakeCrashStart) / 1000);
  if (remaining < 5) {
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(`...${remaining.toFixed(1)}s`, CANVAS_W / 2, CANVAS_H - 20);
  }
}

// --- Results Screen ---
function drawResults(ctx: CanvasRenderingContext2D, gs: GameState) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  let y = 80;
  const centerX = CANVAS_W / 2;

  ctx.textAlign = 'center';

  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.player;
  ctx.fillText('REALITY SHIFT', centerX, y);
  y += 20;
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.alert;
  ctx.fillText('— FINAL REPORT —', centerX, y);
  y += 50;

  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(`You played for ${gs.timePlayed} seconds.`, centerX, y);
  y += 35;
  ctx.fillText(`Deaths/failures: ${gs.deathCount}`, centerX, y);
  y += 50;

  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.alert;
  if (gs.playerChoice === 'red') {
    ctx.fillText('You chose the Red Door to be rebellious.', centerX, y);
    y += 24;
    ctx.fillText('It led to the exact same code as the Blue Door.', centerX, y);
  } else if (gs.playerChoice === 'blue') {
    ctx.fillText('You chose the Blue Door to be safe.', centerX, y);
    y += 24;
    ctx.fillText('It led to the exact same code as the Red Door.', centerX, y);
  } else {
    ctx.fillText('You somehow avoided both doors. Impressive.', centerX, y);
  }
  y += 55;

  ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.goal;
  ctx.fillText('Agency is an illusion.', centerX, y);
  y += 30;
  ctx.fillText('Thanks for playing!', centerX, y);
  y += 60;

  // Play Again button
  ctx.fillStyle = COLORS.player;
  ctx.strokeStyle = COLORS.player;
  ctx.lineWidth = 2;
  const bw = 200, bh = 44;
  const bx = centerX - bw / 2, by = y - 5;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('[ PLAY AGAIN ]', centerX, by + bh / 2 + 6);
}

// Check if click is on Play Again button
export function checkPlayAgainClick(gs: GameState, cx: number, cy: number): boolean {
  if (!gs.showResults) return false;
  const centerX = CANVAS_W / 2;
  const bw = 200, bh = 44;
  const bx = centerX - bw / 2;
  // y position matches drawResults
  const by = 80 + 20 + 50 + 35 + 50 + 24 + 55 + 30 + 60 - 5;
  return cx >= bx && cx <= bx + bw && cy >= by && cy <= by + bh;
}
