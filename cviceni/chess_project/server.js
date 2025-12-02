const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const { Chess } = require('chess.js');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

// Global State
let board = new Chess();
let engineProcess = null;

// --- MEMORY (BRAIN V2) ---
// Now stores Evaluation and PV!
const BRAIN_FILE = path.join(__dirname, 'brain.json');
let brain = {};

if (fs.existsSync(BRAIN_FILE)) {
  try {
    brain = JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf8'));
    console.log(`[MEMORY] Brain loaded with ${Object.keys(brain).length} positions.`);
  } catch (e) { brain = {}; }
}

function saveBrain() {
  fs.writeFile(BRAIN_FILE, JSON.stringify(brain, null, 2), (err) => {
    if (err) console.error("[MEMORY] Save failed:", err);
  });
}

// --- ENGINE SETUP ---
let STOCKFISH_PATH = 'stockfish';
if (fs.existsSync(path.join(__dirname, 'stockfish'))) {
  STOCKFISH_PATH = path.join(__dirname, 'stockfish');
}

function initEngine() {
  if (engineProcess) { try { engineProcess.kill(); } catch (e) { } }
  engineProcess = spawn(STOCKFISH_PATH);
  engineProcess.on('error', (err) => console.error(`[CRITICAL] Stockfish failed: ${err.message}`));
  engineProcess.stdin.write('uci\n');
  engineProcess.stdin.write('setoption name Hash value 128\n');
  engineProcess.stdin.write('isready\n');
}

function getBestMove(fen, difficulty, turnColor, callback) {
  // Determine Target Depth
  let targetDepth = 15;
  let skill = difficulty;

  if (difficulty <= 5) { targetDepth = 5; }
  else if (difficulty <= 10) { targetDepth = 10; }
  else if (difficulty <= 15) { targetDepth = 15; skill = 20; }
  else if (difficulty <= 20) { targetDepth = 18; skill = 20; }
  else if (difficulty <= 25) { targetDepth = 22; skill = 20; }
  else { targetDepth = 30; skill = 20; } // God Mode

  // --- MEMORY CHECK ---
  // If we have a cached move with EQUAL or HIGHER depth, use it.
  if (brain[fen] && brain[fen].depth >= targetDepth) {
    console.log(`[MEMORY] Instant Recall (Depth ${brain[fen].depth})`);
    return callback(brain[fen].move, brain[fen].eval, brain[fen].pv);
  }

  if (!engineProcess) initEngine();

  // Variables to hold the latest analysis
  let bestMove = "";
  let lastEval = { type: 'cp', value: 0 }; // Default even
  let lastPV = "";

  engineProcess.stdout.removeAllListeners('data');
  const engineSkill = Math.min(20, skill);

  engineProcess.stdin.write(`setoption name Skill Level value ${engineSkill}\n`);
  engineProcess.stdin.write(`position fen ${fen}\n`);
  engineProcess.stdin.write(`go depth ${targetDepth}\n`);

  engineProcess.stdout.on('data', (data) => {
    const output = data.toString();
    const lines = output.split('\n');

    for (let line of lines) {
      // 1. Parse Evaluation and PV from "info" lines
      if (line.startsWith('info') && line.includes('score')) {
        // Parse Score
        let scoreMatch = line.match(/score cp (-?\d+)/);
        let mateMatch = line.match(/score mate (-?\d+)/);

        if (mateMatch) {
          lastEval = { type: 'mate', value: parseInt(mateMatch[1]) };
        } else if (scoreMatch) {
          lastEval = { type: 'cp', value: parseInt(scoreMatch[1]) };
        }

        // Parse PV (Principal Variation - The line of best moves)
        let pvMatch = line.match(/ pv (.+)/);
        if (pvMatch) {
          lastPV = pvMatch[1];
        }
      }

      // 2. Parse Final Move
      if (line.startsWith('bestmove')) {
        let match = line.match(/bestmove\s+(\S+)/);
        if (match) {
          bestMove = match[1];
          engineProcess.stdout.removeAllListeners('data');

          // SAVE TO BRAIN
          if (bestMove !== '(none)') {
            brain[fen] = {
              move: bestMove,
              depth: targetDepth,
              eval: lastEval,
              pv: lastPV,
              timestamp: Date.now()
            };
            saveBrain();
          }

          callback(bestMove, lastEval, lastPV);
        }
      }
    }
  });
}

// --- ROUTES ---

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'templates', 'index.html')));

app.post('/new_game', (req, res) => {
  const style = req.body.style || 'standard';
  const playerColor = req.body.color || 'white';
  const difficulty = parseInt(req.body.difficulty) || 10;

  board = new Chess();
  // Simplified Map for brevity
  const fenMap = { 'standard': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' };
  // Add other openings back if needed...

  const startFen = fenMap[style] || fenMap['standard'];
  board.load(startFen);
  initEngine();

  const turn = board.turn();
  const userIsBlack = (playerColor === 'black');
  const aiMustMove = (userIsBlack && turn === 'w') || (!userIsBlack && turn === 'b');

  if (aiMustMove) {
    getBestMove(board.fen(), difficulty, turn, (aiMove, evalScore, pv) => {
      if (aiMove && aiMove !== '(none)') {
        board.move(uciToMove(aiMove));
      }
      res.json({ status: "ok", fen: board.fen(), ai_moved: true, eval: evalScore, pv: pv });
    });
  } else {
    res.json({ status: "ok", fen: startFen, ai_moved: false });
  }
});

app.post('/move', (req, res) => {
  const { source, target, promotion, difficulty } = req.body;
  try {
    let move;
    try { move = board.move({ from: source, to: target, promotion: promotion || 'q' }); } catch (e) { }
    if (!move) return res.json({ valid: false });

    if (board.isGameOver()) return res.json({ valid: true, fen: board.fen(), game_over: true });

    // AI TURN
    getBestMove(board.fen(), parseInt(difficulty) || 10, board.turn(), (aiMove, evalScore, pv) => {
      if (aiMove && aiMove !== '(none)') {
        board.move(uciToMove(aiMove));
      }
      res.json({
        valid: true,
        fen: board.fen(),
        ai_move: aiMove,
        eval: evalScore,
        pv: pv,
        game_over: board.isGameOver()
      });
    });
  } catch (e) { res.status(500).json({ valid: false }); }
});

app.post('/spectator_move', (req, res) => {
  const difficulty = parseInt(req.body.difficulty) || 10;
  try {
    if (board.isGameOver()) return res.json({ game_over: true });

    getBestMove(board.fen(), difficulty, board.turn(), (aiMove, evalScore, pv) => {
      if (aiMove && aiMove !== '(none)') {
        board.move(uciToMove(aiMove));
      }
      res.json({
        valid: true,
        fen: board.fen(),
        ai_move: aiMove,
        eval: evalScore,
        pv: pv,
        game_over: board.isGameOver()
      });
    });
  } catch (e) { res.status(500).json({ valid: false }); }
});

// Helper: UCI String to Object
function uciToMove(uci) {
  if (!uci) return null;
  const from = uci.substring(0, 2);
  const to = uci.substring(2, 4);
  const prom = uci.length > 4 ? uci.substring(4, 5) : undefined;
  return { from, to, promotion: prom };
}

initEngine();
// --- MANUAL ANALYSIS ENDPOINT ---
app.post('/analyze', (req, res) => {
  const fen = req.body.fen;
  const difficulty = parseInt(req.body.difficulty) || 10;

  // We don't touch the global 'board' here. We analyze the specific FEN sent by client.
  getBestMove(fen, difficulty, 'w', (aiMove, evalScore, pv) => {
    res.json({
      valid: true,
      best_move: aiMove,
      eval: evalScore,
      pv: pv
    });
  });
});
app.listen(PORT, () => console.log(`>>> CHESS SERVER V7 (ANALYSIS ENABLED) ON http://localhost:${PORT}`));
