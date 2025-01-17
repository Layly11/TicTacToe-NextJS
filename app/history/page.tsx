'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Move {
  id: number;
  gameId: number;
  player: string;
  row: number;
  col: number;
  moveNumber: number;
}

interface Game {
  id: number;
  size: number;
  winner: string | null;
  moves: Move[];
  createdAt: string;
}

const GameHistory = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xWins, setXWins] = useState(0);
  const [oWins, setOWins] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  // const fetchHistory = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch('/api/history');
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch game history');
  //     }
  //     const data = await response.json();
  //     setGames(data);

  //     // Calculate the number of wins for X and O
  //     const xWinCount = data.filter((game: Game) => game.winner === 'X').length;
  //     const oWinCount = data.filter((game: Game) => game.winner === 'O').length;

  //     setXWins(xWinCount);
  //     setOWins(oWinCount);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to load game history');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history');
      if (!response.ok) {
        throw new Error('Failed to fetch game history');
      }
      const data = await response.json();
  
      // Only include completed games
      const completedGames = data.filter((game: Game) => game.winner !== null || game.winner === 'Draw');
      setGames(completedGames);
  
      // Calculate the number of wins for X and O
      const xWinCount = completedGames.filter((game: Game) => game.winner === 'X').length;
      const oWinCount = completedGames.filter((game: Game) => game.winner === 'O').length;
  
      setXWins(xWinCount);
      setOWins(oWinCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game history');
    } finally {
      setLoading(false);
    }
  };
  

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to clear history');
      }
      alert('Game history cleared successfully!');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Error clearing history');
    }
  };

  const handleReplay = (gameId: number) => {
    router.push(`/replay?gameId=${gameId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Game History</h1>
      <div className="text-right mb-4">
        <button
          onClick={clearHistory}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Clear History
        </button>
      </div>

      {/* Display total wins for X and O */}
      <div className="flex justify-around mb-4">
        <p className="text-lg font-bold text-blue-600">
          Total Wins for X: {xWins}
        </p>
        <p className="text-lg font-bold text-red-600">
          Total Wins for O: {oWins}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading game history...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No games played yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              {/* Display the round number (latest games have the highest round number) */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">
                  Round #{games.length - index}
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {game.size}x{game.size}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">
                  Played on: {new Date(game.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-600">Moves: {game.moves.length}</p>
                <p className="text-gray-600">
                  Status: {game.winner ? `Winner: ${game.winner}` : 'In Progress'}
                </p>
              </div>
              <div className="text-center">
                <button
                  onClick={() => handleReplay(game.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Replay
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameHistory;
