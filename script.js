/**
 * Simulasi Navigasi Indoor — BFS Pathfinding
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const CELL = {
  WALL:     0,
  CORRIDOR: 1,
  SOURCE:   2,
  DEST:     3,
  PATH:     4,
  USER:     5,
  EXPLORED: 6,
};

const COLORS = {
  [CELL.WALL]:     '#374151',
  [CELL.CORRIDOR]: '#FFFFFF',
  [CELL.SOURCE]:   '#F5B700',
  [CELL.DEST]:     '#DC2626',
  [CELL.PATH]:     '#16A34A',
  [CELL.USER]:     '#2563EB',
  [CELL.EXPLORED]: '#BFDBFE',
};

const ROWS = 20;
const COLS = 30;

// ─── State ────────────────────────────────────────────────────────────────────
let grid         = [];
let sourcePos    = null;
let destPos      = null;
let isRunning    = false;
let animFrameId  = null;
let cellSize     = 20;
let currentMapIndex = 0;
let sourceRoom   = null;
let destRoom     = null;

// ─── Room Sets ────────────────────────────────────────────────────────────────
const ROOMS_MAP1 = [
  { name: 'A1', pos: [4,  5] },
  { name: 'A2', pos: [4,  11] },
  { name: 'A3', pos: [4,  18] },
  { name: 'A4', pos: [4,  25] },

  { name: 'B1', pos: [10, 3] },
  { name: 'B2', pos: [10, 9] },
  { name: 'B3', pos: [10, 15] },
  { name: 'B4', pos: [10, 19] },
  { name: 'B5', pos: [10, 23] },
  { name: 'B6', pos: [10, 27] },

  { name: 'C1', pos: [15, 5] },
  { name: 'C2', pos: [15, 14] },
  { name: 'C3', pos: [15, 24] },
];

const ROOMS_MAP2 = [
  { name: 'D1', pos: [4,  5] },
  { name: 'D2', pos: [4,  12] },
  { name: 'D3', pos: [4,  20] },
  { name: 'D4', pos: [4,  26] },

  { name: 'E1', pos: [14, 5] },
  { name: 'E2', pos: [14, 10] },
  { name: 'E3', pos: [14, 15] },
  { name: 'E4', pos: [14, 20] },
  { name: 'E5', pos: [14, 24] },
];

const ROOMS_MAP3 = [
  { name: 'F1', pos: [4,  5] },
  { name: 'F2', pos: [4,  12] },
  { name: 'F3', pos: [4,  20] },
  { name: 'F4', pos: [4,  26] },

  { name: 'G1', pos: [9,  3] },
  { name: 'G2', pos: [9,  7] },
  { name: 'G3', pos: [9,  11] },
  { name: 'G4', pos: [9,  15] },
  { name: 'G5', pos: [9,  19] },
  { name: 'G6', pos: [9,  23] },
  { name: 'G7', pos: [9,  27] },

  { name: 'H1', pos: [15, 5] },
  { name: 'H2', pos: [15, 10] },
  { name: 'H3', pos: [15, 15] },
  { name: 'H4', pos: [15, 19] },
  { name: 'H5', pos: [15, 24] },
];

// ─── Room Sets Array ──────────────────────────────────────────────────────────
const ROOM_SETS = [ROOMS_MAP1, ROOMS_MAP2, ROOMS_MAP3];

// ─── Maps ─────────────────────────────────────────────────────────────────────

// MAP 1
const BASE_MAP = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0],
  [0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1,0],
  [0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1,0],
  [0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,0,1,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0],
  [0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0],
  [0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0],
  [0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0],
  [0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// MAP 2
const MAP2 = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,0],
  [0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0],
  [0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0],
  [0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0],
  [0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,0,0,0,1,0],
  [0,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// MAP 3
const MAP3 = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0],
  [0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0],
  [0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0],
  [0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,1,0,0,0,1,1,0],
  [0,1,0,1,1,1,0,1,1,1,0,1,0,0,0,0,0,1,0,1,1,1,0,1,1,1,0,1,1,0],
  [0,1,0,1,1,1,0,1,1,1,0,1,0,0,0,0,0,1,0,1,1,1,0,1,1,1,0,1,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,1,0,0,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0],
  [0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0],
  [0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0],
  [0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0],
  [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const MAPS = [BASE_MAP, MAP2, MAP3];

// ─── Canvas ───────────────────────────────────────────────────────────────────
const canvas  = document.getElementById('mapCanvas');
const ctx     = canvas.getContext('2d');
const wrapper = canvas.closest('.map-wrapper');

function resizeCanvas() {
  const dpr   = window.devicePixelRatio || 1;
  const wRect = wrapper.getBoundingClientRect();

  const maxW = wRect.width  - 20;
  const maxH = wRect.height - 20;

  const cellByW = Math.floor(maxW / COLS);
  const cellByH = Math.floor(maxH / ROWS);
  cellSize = Math.max(4, Math.min(cellByW, cellByH));

  const logW = cellSize * COLS;
  const logH = cellSize * ROWS;

  canvas.width  = logW * dpr;
  canvas.height = logH * dpr;

  canvas.style.width  = logW + 'px';
  canvas.style.height = logH + 'px';

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ─── Rendering ────────────────────────────────────────────────────────────────
function drawGrid(displayGrid) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = displayGrid[r][c];
      ctx.fillStyle = COLORS[cell] || '#F3F4F8';
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);

      ctx.strokeStyle = cell === CELL.WALL ? '#1F2937' : 'rgba(209,213,219,0.5)';
      ctx.lineWidth   = 0.5;
      ctx.strokeRect(c * cellSize + 0.25, r * cellSize + 0.25, cellSize - 0.5, cellSize - 0.5);

      if      (cell === CELL.SOURCE) drawMarker(c, r, '#F5B700', 'S');
      else if (cell === CELL.DEST)   drawMarker(c, r, '#DC2626', 'D');
      else if (cell === CELL.USER)   drawUserDot(c, r);
    }
  }
}

function drawMarker(col, row, color, letter) {
  const x = col * cellSize + cellSize / 2;
  const y = row * cellSize + cellSize / 2;
  const r = cellSize * 0.36;

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  if (cellSize >= 14) {
    ctx.fillStyle    = '#fff';
    ctx.font         = `bold ${Math.round(cellSize * 0.38)}px Manrope, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, x, y + 1);
  }
}

function drawUserDot(col, row) {
  const x = col * cellSize + cellSize / 2;
  const y = row * cellSize + cellSize / 2;
  const r = cellSize * 0.34;

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#2563EB';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

// ─── Animation ────────────────────────────────────────────────────────────────
function cloneGrid() { return grid.map(row => [...row]); }

function animate(explored, path) {
  const steps    = [];
  const baseGrid = cloneGrid();
  baseGrid[sourcePos[0]][sourcePos[1]] = CELL.SOURCE;
  baseGrid[destPos[0]][destPos[1]]     = CELL.DEST;

  // Phase 1: exploration
  const expGrid = baseGrid.map(r => [...r]);
  for (const [r, c] of explored) {
    if (expGrid[r][c] === CELL.CORRIDOR) expGrid[r][c] = CELL.EXPLORED;
    steps.push(expGrid.map(r => [...r]));
  }

  // Phase 2: path
  if (path) {
    const pathGrid = steps[steps.length - 1].map(r => [...r]);
    for (const [r, c] of path)
      if (pathGrid[r][c] !== CELL.SOURCE && pathGrid[r][c] !== CELL.DEST)
        pathGrid[r][c] = CELL.PATH;
    steps.push(pathGrid.map(r => [...r]));

    // Phase 3: user movement
    const moveGrid = pathGrid.map(r => [...r]);
    let prev = null;
    for (const [r, c] of path) {
      if (prev) {
        const [pr, pc] = prev;
        if (moveGrid[pr][pc] !== CELL.SOURCE && moveGrid[pr][pc] !== CELL.DEST)
          moveGrid[pr][pc] = CELL.PATH;
      }
      const saved = moveGrid[r][c];
      moveGrid[r][c] = CELL.USER;
      steps.push(moveGrid.map(r => [...r]));
      moveGrid[r][c] = saved;
      prev = [r, c];
    }
    const finalGrid = steps[steps.length - 1].map(r => [...r]);
    finalGrid[destPos[0]][destPos[1]] = CELL.USER;
    steps.push(finalGrid);
  }

  let idx = 0;
  function nextStep() {
    if (!isRunning) return;
    if (idx >= steps.length) { isRunning = false; setButtonsState(false); return; }
    drawGrid(steps[idx]);
    const delay = idx < explored.length ? 16 : idx < explored.length + 1 ? 30 : 80;
    idx++;
    animFrameId = setTimeout(nextStep, delay);
  }
  nextStep();
}

// ─── Controls ─────────────────────────────────────────────────────────────────
function setButtonsState(running) {
  ['btnStart', 'btnAcakMap', 'btnAcakSD', 'btnRestart'].forEach(id => {
    document.getElementById(id).disabled = running;
  });
}

function stopAnimation() {
  if (animFrameId) clearTimeout(animFrameId);
  animFrameId = null;
  isRunning   = false;
}

function clearOverlay() {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if ([CELL.PATH, CELL.EXPLORED, CELL.USER].includes(grid[r][c]))
        grid[r][c] = CELL.CORRIDOR;
  if (sourcePos) grid[sourcePos[0]][sourcePos[1]] = CELL.SOURCE;
  if (destPos)   grid[destPos[0]][destPos[1]]     = CELL.DEST;
}

function fullReset() {
  stopAnimation();
  clearOverlay();
  drawGrid(grid);
  setButtonsState(false);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  resizeCanvas();
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeCanvas();
    drawGrid(grid);
  }, 80);
});

// ─── BFS ─────────────────────────────────────────────────────────────────────
function bfs(start, goal) {
  const queue    = [start];
  const visited  = new Set();
  const parent   = {};
  const explored = [];

  visited.add(start.join(','));

  const directions = [
    [-1, 0],
    [ 1, 0],
    [ 0,-1],
    [ 0, 1],
  ];

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    explored.push([r, c]);

    if (r === goal[0] && c === goal[1]) {
      const path = [];
      let current = goal.join(',');
      while (current) {
        const [cr, cc] = current.split(',').map(Number);
        path.unshift([cr, cc]);
        current = parent[current];
      }
      return { explored, path };
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 && nr < ROWS &&
        nc >= 0 && nc < COLS &&
        grid[nr][nc] !== CELL.WALL
      ) {
        const key = `${nr},${nc}`;
        if (!visited.has(key)) {
          visited.add(key);
          parent[key] = `${r},${c}`;
          queue.push([nr, nc]);
        }
      }
    }
  }

  return { explored, path: null };
}

// ─── Generate Map ─────────────────────────────────────────────────────────────
function generateRandomMap() {
  currentMapIndex = Math.floor(Math.random() * MAPS.length);
  grid = MAPS[currentMapIndex].map(row => [...row]);
}

// ─── Randomize Source & Destination ──────────────────────────────────────────
function randomizeSourceDest() {
  if (sourcePos) {
    grid[sourcePos[0]][sourcePos[1]] = CELL.CORRIDOR;
  }
  if (destPos) {
    grid[destPos[0]][destPos[1]] = CELL.CORRIDOR;
  }

  const rooms = ROOM_SETS[currentMapIndex];

  sourceRoom = rooms[Math.floor(Math.random() * rooms.length)];
  destRoom   = rooms[Math.floor(Math.random() * rooms.length)];

  while (sourceRoom.name === destRoom.name) {
    destRoom = rooms[Math.floor(Math.random() * rooms.length)];
  }

  sourcePos = [...sourceRoom.pos];
  destPos   = [...destRoom.pos];

  grid[sourcePos[0]][sourcePos[1]] = CELL.SOURCE;
  grid[destPos[0]][destPos[1]]     = CELL.DEST;

  document.getElementById('sourceLabel').textContent = sourceRoom.name;
  document.getElementById('destLabel').textContent   = destRoom.name;
}

// ─── Event Handlers ───────────────────────────────────────────────────────────
document.getElementById('btnStart').addEventListener('click', () => {
  stopAnimation();
  clearOverlay();

  const result = bfs(sourcePos, destPos);

  isRunning = true;
  setButtonsState(true);
  animate(result.explored, result.path);
});

document.getElementById('btnRestart').addEventListener('click', () => {
  fullReset();
});

document.getElementById('btnAcakMap').addEventListener('click', () => {
  stopAnimation();
  generateRandomMap();
  randomizeSourceDest();
  drawGrid(grid);
});

document.getElementById('btnAcakSD').addEventListener('click', () => {
  stopAnimation();
  clearOverlay();
  randomizeSourceDest();
  drawGrid(grid);
});

// ─── Kick Off ─────────────────────────────────────────────────────────────────
init();
generateRandomMap();
randomizeSourceDest();
drawGrid(grid);
