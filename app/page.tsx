'use client';
import dynamic from 'next/dynamic';
const TicTacToe = dynamic(() => import('./component/tictac').then(mod => mod.TicTacToe), {
  ssr: false
});

import { useState, useEffect } from "react";
// import { TicTacToe } from "./component/tictac";
import Image from "next/image";
import "./globals.css";

export default function Home() {
  const [size, setSize] = useState(3); // ขนาดเริ่มต้นของตารางเป็น 3x3
  const [useAI, setUseAI] = useState(false); // กำหนดสถานะ AI

  // ใช้ useEffect เพื่อหลีกเลี่ยงปัญหาของ hydration
  useEffect(() => {
    // การตั้งค่าขนาดหลังจากที่คอมโพเนนต์เริ่มทำงานในฝั่งไคลเอนต์
    setSize(3); // กำหนดขนาดเริ่มต้น 3x3 ถ้าต้องการเริ่มจากขนาดอื่นๆ
    setUseAI(false); // กำหนดค่าเริ่มต้นไม่ใช้ AI
  }, []); 

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSize(parseInt(event.target.value)); // เปลี่ยนขนาดตารางตามการเลือก
  };

  const handleAIChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseAI(event.target.checked); // อัปเดตสถานะ AI ตามการเลือก
  };

  return (
    <>
      <div className="flex justify-center items-center flex-col mt-10">
        <h1 className="text-4xl font-bold mt-5">Tic Tac Toe Game</h1>
        
        {/* Dropdown สำหรับการเลือกขนาดของตาราง */}
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

        {/* Checkbox สำหรับการเลือกว่าจะใช้ AI หรือไม่ */}
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

        {/* ส่งขนาดที่เลือกและสถานะ AI ไปยังคอมโพเนนต์ TicTacToe */}
        <TicTacToe size={size} isAI={useAI} />
      </div>
    </>
  );
}
