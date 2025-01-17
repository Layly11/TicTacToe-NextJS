'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Move {
  id: number;
  gameId: number;
  player: string;
  row: number;
  col: number;
  moveNumber: number;
}

const Replay = () => {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [moves, setMoves] = useState<Move[]>([]);
  const [board, setBoard] = useState<Array<Array<string | null>>>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState(0); // Board size

  useEffect(() => {
    if (gameId) {
      fetchReplay(gameId);
    }
  }, [gameId]);

  const fetchReplay = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/replay?gameId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch replay data');
      }
      const data = await response.json();

      const maxRow = Math.max(...data.moves.map((move: Move) => move.row));
      const maxCol = Math.max(...data.moves.map((move: Move) => move.col));
      const boardSize = Math.max(maxRow, maxCol) + 1;

      setSize(boardSize);
      setBoard(Array.from({ length: boardSize }, () => Array(boardSize).fill(null)));
      setMoves(data.moves);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load replay data');
    } finally {
      setLoading(false);
    }
  };

  const handleNextMove = () => {
    if (currentMoveIndex < moves.length) {
      const move = moves[currentMoveIndex];
      const newBoard = board.map((row) => [...row]);
      newBoard[move.row][move.col] = move.player;
      setBoard(newBoard);
      setCurrentMoveIndex((prev) => prev + 1);
    }
  };

  const handleResetReplay = () => {
    setBoard(Array.from({ length: size }, () => Array(size).fill(null)));
    setCurrentMoveIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-6 text-blue-700">Game Replay</h1>

          {loading ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-lg text-gray-600">Loading replay...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-lg shadow-md text-center">
              <p className="text-red-500 text-2xl mb-2">⚠️ Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div>
              {/* Game Board */}
              <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <div
                  className="grid gap-1 justify-center"
                  style={{ gridTemplateColumns: `repeat(${size}, 40px)` }}
                >
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          w-10 h-10 flex items-center justify-center 
                          border border-gray-300 rounded-md text-lg font-bold
                          ${cell === 'X' ? 'text-blue-500' : cell === 'O' ? 'text-red-500' : ''}
                        `}
                      >
                        {cell}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Replay Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleNextMove}
                  disabled={currentMoveIndex >= moves.length}
                  className={`
                    px-6 py-3 rounded-lg font-semibold shadow-md
                    transform active:scale-95 transition-all duration-150
                    ${currentMoveIndex < moves.length
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'}
                  `}
                >
                  {currentMoveIndex >= moves.length ? 'Replay Complete' : 'Next Move'}
                </button>
                <button
                  onClick={handleResetReplay}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold
                           hover:bg-red-600 shadow-md transform active:scale-95 transition-all duration-150"
                >
                  Reset Replay
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-6">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentMoveIndex / moves.length) * 100}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Move {currentMoveIndex} of {moves.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Replay;
