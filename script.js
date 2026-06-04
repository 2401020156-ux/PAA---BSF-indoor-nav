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
let grid      = [];
let sourcePos = null;
let destPos   = null;
let isRunning = false;
let animFrameId = null;
let cellSize  = 20; // computed dynamically

// ─── Canvas ───────────────────────────────────────────────────────────────────
const canvas  = document.getElementById('mapCanvas');
const ctx     = canvas.getContext('2d');
const wrapper = canvas.closest('.map-wrapper');

/**
 * Mengatur ukuran canvas agar pas dengan area map
 * dan tetap terlihat jelas di semua perangkat.
 */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const wRect = wrapper.getBoundingClientRect();

  // Available inner space (account for padding: 10px each side)
  const maxW = wRect.width  - 20;
  const maxH = wRect.height - 20;

  // Compute cell size that fits both dimensions
  const cellByW = Math.floor(maxW / COLS);
  const cellByH = Math.floor(maxH / ROWS);
  cellSize = Math.max(4, Math.min(cellByW, cellByH));

  const logW = cellSize * COLS;
  const logH = cellSize * ROWS;

  // Physical pixels
  canvas.width  = logW * dpr;
  canvas.height = logH * dpr;

  // CSS display size
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

      if (cell === CELL.SOURCE)      drawMarker(c, r, '#F5B700', 'S');
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
  const steps = [];
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
  ['btnStart','btnAcakMap','btnAcakSD','btnRestart'].forEach(id => {
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

// Refit canvas on resize
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
  const queue = [start];
  const visited = new Set();
  const parent = {};

  const explored = [];

  visited.add(start.join(','));

  const directions = [
    [-1, 0], // atas
    [1, 0],  // bawah
    [0, -1], // kiri
    [0, 1]   // kanan
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

      return {
        explored,
        path
      };
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 &&
        nr < ROWS &&
        nc >= 0 &&
        nc < COLS &&
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

  return {
    explored,
    path: null
  };
}

// ─── Event Handlers ─────────────────────────────────────────────────────────────
document
  .getElementById('btnStart')
  .addEventListener('click', () => { // Button Start Event
    
    stopAnimation();
    clearOverlay();

    const result = bfs(sourcePos, destPos);

    isRunning = true;
    setButtonsState(true);

    animate(result.explored, result.path);
  })

document
  .getElementById('btnRestart')
  .addEventListener('click', () => { // Button Restart Event
    
    fullReset();
  })

document
  .getElementById('btnAcakMap')
  .addEventListener('click', () => { // Button Randomize Map Event

    stopAnimation();
  })

document
  .getElementById('btnAcakSD')
  .addEventListener('click', () => { // Button Randomize Source Destination Event
    
    stopAnimation();

    clearOverlay();
  })

// Kick off
init();
drawGrid(grid);
