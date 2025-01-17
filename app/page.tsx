'use client';
'use client';
import dynamic from 'next/dynamic';
const TicTacToe = dynamic(() => import('./component/tictac').then(mod => mod.TicTacToe), {
  loading: () => <div>Loading...</div>,
  ssr: false
});

// ... โค้ดส่วนที่เหลือคงเดิม
import { useState, useEffect } from "react";
// import { TicTacToe } from "./component/tictac";
import Image from "next/image";
import "./globals.css";


export default function Home() {
  const [size, setSize] = useState(3);
  const [useAI, setUseAI] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSize(parseInt(event.target.value));
  };

  const handleAIChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseAI(event.target.checked);
  };

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-xl text-gray-600">Loading Game...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center items-center flex-col mt-10">
        <h1 className="text-4xl font-bold mt-5">Tic Tac Toe Game</h1>
        
        <div className="mt-4">
          <label htmlFor="size" className="mr-2 text-xl">Select Board Size:</label>
          <select
            id="size"
            value={size}
            onChange={handleSizeChange}
            className="border-2 p-2 rounded-lg"
          >
            <option value={3}>3x3</option>
            <option value={4}>4x4</option>
            <option value={5}>5x5</option>
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="useAI" className="mr-2 text-xl">Play Against AI:</label>
          <input
            id="useAI"
            type="checkbox"
            checked={useAI}
            onChange={handleAIChange}
            className="w-5 h-5"
          />
        </div>

        <TicTacToe size={size} isAI={useAI} />
      </div>
    </>
  );
}
