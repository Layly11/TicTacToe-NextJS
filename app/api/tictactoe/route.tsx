import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GameState {
  board: Array<Array<string | null>>;
  isXNext: boolean;
  winner: string | null;
}

let gameState: GameState = {
  board: [],
  isXNext: true,
  winner: null,
};

const initializeBoard = (size: number) => {
  gameState.board = Array.from({ length: size }, () => Array(size).fill(null));
  gameState.isXNext = true;
  gameState.winner = null;
};

// Helper function to check for a draw
export const isBoardFull = (board: Array<Array<string | null>>): boolean => {
  return board.every(row => row.every(cell => cell !== null));
};

// Winner calculation logic
export const calculateWinner = (board: Array<Array<string | null>>, size: number) => {
  // Checking rows, columns, and diagonals
  for (let row = 0; row < size; row++) {
    if (board[row]?.every(cell => cell === 'X')) return 'X';
    if (board[row]?.every(cell => cell === 'O')) return 'O';
  }
  for (let col = 0; col < size; col++) {
    if (board?.every(row => row[col] === 'X')) return 'X';
    if (board?.every(row => row[col] === 'O')) return 'O';
  }
  if (board?.every((row, i) => row[i] === 'X')) return 'X';
  if (board?.every((row, i) => row[i] === 'O')) return 'O';
  if (board?.every((row, i) => row[size - i - 1] === 'X')) return 'X';
  if (board?.every((row, i) => row[size - i - 1] === 'O')) return 'O';

  return null;
};

const miniMax = (
  board: Array<Array<string | null>>,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  size: number,
  maxDepth: number // เพิ่ม Max Depth
): number => {
  const winner = calculateWinner(board, size);
  if (winner === 'X') return -10 + depth;
  if (winner === 'O') return 10 - depth;
  if (isBoardFull(board)) return 0;

  // จำกัดความลึกของ Minimax
  if (depth >= maxDepth) {
    return evaluateBoard(board, size); // ใช้ฟังก์ชัน heuristic
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === null) {
          board[row][col] = 'O';
          const evalScore = miniMax(board, depth + 1, false, alpha, beta, size, maxDepth);
          board[row][col] = null;
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === null) {
          board[row][col] = 'X';
          const evalScore = miniMax(board, depth + 1, true, alpha, beta, size, maxDepth);
          board[row][col] = null;
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
      }
    }
    return minEval;
  }
};

const evaluateBoard = (board: Array<Array<string | null>>, size: number): number => {
  // ตัวอย่าง: ประเมินคะแนนตามจำนวน "X" หรือ "O" ที่เรียงกันในแถว/คอลัมน์
  let score = 0;
  for (let row = 0; row < size; row++) {
    let xCount = 0;
    let oCount = 0;
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 'X') xCount++;
      if (board[row][col] === 'O') oCount++;
    }
    if (xCount === size - 1 && oCount === 0) score -= 5; // X เกือบชนะ
    if (oCount === size - 1 && xCount === 0) score += 5; // O เกือบชนะ
  }
  return score;
};

const findBestMove = (board: Array<Array<string | null>>, size: number): { row: number; col: number } => {
  let bestMove = { row: -1, col: -1 };
  let bestValue = -Infinity;
  const maxDepth = 3; // จำกัดความลึกของ Minimax

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === null) {
        board[row][col] = 'O';
        const moveValue = miniMax(board, 0, false, -Infinity, Infinity, size, maxDepth);
        board[row][col] = null;
        if (moveValue > bestValue) {
          bestMove = { row, col };
          bestValue = moveValue;
        }
      }
    }
  }
  return bestMove;
};


// API route to initialize or reset the game
export async function POST(request: Request) {
  const { size, gameId } = await request.json();
  
  if (gameId) {
    initializeBoard(size);
    return NextResponse.json({
      board: gameState.board,
      isXNext: gameState.isXNext,
      winner: gameState.winner,
      gameId,
    });
  } else {
    initializeBoard(size);
    return NextResponse.json({
      board: gameState.board,
      isXNext: gameState.isXNext,
      winner: gameState.winner,
    });
  }
}

// API route to make a move
export async function PUT(request: Request) {
  let { row, col, size, gameId, isAI, currentPlayer } = await request.json();

  if (!gameId) {
    const game = await prisma.game.create({
      data: { size },
    });
    gameId = game.id;
  }

  // Validate the move
  if (!gameState.board[row] || gameState.board[row][col] !== null || gameState.winner) {
    return NextResponse.json({ error: 'Invalid move' }, { status: 400 });
  }
  
  // Make the move
  gameState.board[row][col] = currentPlayer;
  
  // Toggle turn regardless of AI mode
  gameState.isXNext = !gameState.isXNext;

  // Record the move
  await prisma.move.create({
    data: {
      gameId,
      player: currentPlayer,
      row,
      col,
      moveNumber: await getMoveNumber(gameId),
    },
  });

  // Check for winner or draw after player move
  gameState.winner = calculateWinner(gameState.board, size);
  const isDraw = isBoardFull(gameState.board) && !gameState.winner;
  if (gameState.winner || isDraw) {
    await prisma.game.update({
      where: { id: gameId },
      data: { winner: gameState.winner || 'Draw' },
    });
    return NextResponse.json({
      board: gameState.board,
      isXNext: gameState.isXNext,
      winner: gameState.winner,
      gameId,
    });
  }

  // AI move only if AI mode is enabled
  if (isAI && currentPlayer === 'X') {
    await new Promise(resolve => setTimeout(resolve, 700));
    const aiMove = findBestMove(gameState.board, size);

    if (aiMove.row !== -1 && aiMove.col !== -1) {
      gameState.board[aiMove.row][aiMove.col] = 'O';
      gameState.isXNext = true;

      await prisma.move.create({
        data: {
          gameId,
          player: 'O',
          row: aiMove.row,
          col: aiMove.col,
          moveNumber: await getMoveNumber(gameId),
        },
      });

      gameState.winner = calculateWinner(gameState.board, size);
      if (gameState.winner || isBoardFull(gameState.board)) {
        await prisma.game.update({
          where: { id: gameId },
          data: { winner: gameState.winner || 'Draw' },
        });
      }
    }
  }

  return NextResponse.json({
    board: gameState.board,
    isXNext: gameState.isXNext,
    winner: gameState.winner,
    gameId,
  });
}




// Helper function to get the next move number for a game
const getMoveNumber = async (gameId: number) => {
  const moves = await prisma.move.findMany({
    where: { gameId },
  });
  return moves.length + 1; // Move number is the count of previous moves + 1
};

// API route to get game history and replay
export async function GET(request: Request) {
  const { gameId } = await request.json();

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      moves: {
        orderBy: {
          moveNumber: 'asc',
        },
      },
    },
  });

  if (!game) {
    return NextResponse.json({ error: 'Game not found' });
  }

  return NextResponse.json({
    gameId: game.id,
    size: game.size,
    winner: game.winner,
    moves: game.moves,
  });
}
