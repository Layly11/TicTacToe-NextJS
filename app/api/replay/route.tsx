import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
  }

  try {
    const moves = await prisma.move.findMany({
      where: { gameId: Number(gameId) },
      orderBy: { moveNumber: 'asc' },
    });

    return NextResponse.json({ moves });
  } catch (error) {
    console.error('Error fetching replay:', error);
    return NextResponse.json({ error: 'Failed to fetch replay' }, { status: 500 });
  }
}
