import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TicTacToeProps {
  size: number;
  isAI: boolean;
}

export const TicTacToe = ({ size, isAI }: TicTacToeProps) => {
  const [board, setBoard] = useState<Array<Array<string | null>>>([]);
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  console.log(isXNext)

  useEffect(() => {
    const initializeEmptyBoard = () => {
      const emptyBoard = Array.from({ length: size }, () => Array(size).fill(null));
      setBoard(emptyBoard);
      setIsXNext(true);
      setWinner(null);
      setGameId(null);
      setShowPopup(false);
      setIsDraw(false);
      resetGame();
    };

    initializeEmptyBoard();
  }, [size]);

  useEffect(()=>{
    if(isAI){
      resetGame()
    }else{
      resetGame()
    }
  },[isAI])

  
  const handleClick = async (row: number, col: number) => {
    if (board[row][col] || showPopup || isProcessing) return;
    const currentPlayer = isXNext ? 'X' : 'O';
    // อัปเดตสถานะทันทีในฝั่งฟรอนต์เอนด์
    const newBoard = [...board];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setIsXNext(!isXNext); // แสดงผลว่าเป็นเทิร์นของ O
  
    try {
      setIsProcessing(true); // ปิดการใช้งานปุ่มชั่วคราว
      const response = await fetch('/api/tictactoe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, col, size, gameId, isAI, currentPlayer }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to make a move');
      }
  
      const data = await response.json();
  
      if (data.board && Array.isArray(data.board)) {
        setBoard(data.board); // อัปเดตสถานะด้วยข้อมูลล่าสุดจากเซิร์ฟเวอร์
        setIsXNext(data.isXNext);
        if (!gameId) setGameId(data.gameId);
  
        if (data.winner) {
          setWinner(data.winner);
          setShowPopup(true);
        } else if (isBoardFull(data.board)) {
          setIsDraw(true);
          setShowPopup(true);
        }
      } else {
        throw new Error('Invalid board data');
      }
    } catch (error) {
      console.error('Error making move:', error);
    } finally {
      setIsProcessing(false); // เปิดใช้งานปุ่มอีกครั้ง
    }
  };
  
  

  const handleClosePopup = () => {
    setShowPopup(false);
    resetGame();
  };

  const resetGame = async () => {
    try {
      const response = await fetch('/api/tictactoe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to reset game');
      }
  
      const data = await response.json();
      if (data.board) {
        setBoard(data.board);
        setIsXNext(data.isXNext);
        setWinner(null);
        setIsDraw(false);
        setGameId(data.gameId); // Update gameId with the new game
        setShowPopup(false);
      }
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  };
  

  const goToHistory = () => {
    router.push('/history');
  };

  const isBoardFull = (board: Array<Array<string | null>>): boolean => {
    return board.every(row => row.every(cell => cell !== null));
  };

  return (
    <div className="container text-center mt-10 relative">
      {/* Winner/Draw Popup */}
      {showPopup && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          {/* Popup */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-white rounded-lg p-8 shadow-xl z-50 
                        animate-[popIn_0.3s_ease-out]">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              {isDraw ? 'It\'s a Draw!' : 'Congratulations!'}
            </h2>
            {!isDraw && (
              <p className="text-xl mb-6">
                Player <span className="font-bold text-blue-600">{winner}</span> wins!
              </p>
            )}
            <button
              onClick={handleClosePopup}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg
                       hover:bg-blue-600 transition-colors
                       transform active:scale-95"
            >
              Play Again
            </button>
          </div>
        </>
      )}

      {/* Game Board */}
      <div className="board grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, 100px)` }}>
        {board && board.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`cell text-3xl font-bold h-[100px] w-[100px] bg-white border-2 
                       border-gray-200 rounded-lg hover:bg-gray-50 
                       transition-colors disabled:hover:bg-white
                       disabled:cursor-not-allowed
                       ${
                         value === "X" ? "text-blue-600" : value === "O" ? "text-red-600" : ""
                       }`}
              onClick={() => handleClick(rowIndex, colIndex)}
              disabled={showPopup}
            >
              {value}
            </button>
          ))
        )}
      </div>

      <div className="info mt-6">
        <p className="text-xl mb-4">Next Player: {isXNext ? 'X' : 'O'}</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={resetGame}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg 
                     hover:bg-blue-600 transition-colors"
          >
            Reset Game
          </button>
          <button
            className="bg-gray-500 text-white py-2 px-6 rounded-lg 
                     hover:bg-gray-600 transition-colors"
            onClick={goToHistory}
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};
