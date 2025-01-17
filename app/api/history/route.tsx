import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch game history
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        moves: {
          orderBy: {
            moveNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date
      },
    });
    // console.log(games);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Failed to fetch game history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game history' },
      { status: 500 }
    );
  }
}

// Clear game history
export async function DELETE() {
  try {
    // Delete all moves first due to foreign key constraints
    await prisma.move.deleteMany({});
    // Delete all games
    await prisma.game.deleteMany({});
    return NextResponse.json({ message: 'Game history cleared successfully' });
  } catch (error) {
    console.error('Failed to clear game history:', error);
    return NextResponse.json(
      { error: 'Failed to clear game history' },
      { status: 500 }
    );
  }
}
