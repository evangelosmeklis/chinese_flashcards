import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/decks/:id/study-sessions - Get all study sessions for a deck
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deckId = id;

    // Check if deck exists
    const deck = await db.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      return NextResponse.json(
        { message: 'Deck not found' },
        { status: 404 }
      );
    }

    // Get all study sessions for this deck
    const studySessions = await db.studySession.findMany({
      where: { deckId },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return NextResponse.json(studySessions);
  } catch (error) {
    console.error('Error fetching study sessions for deck:', error);
    return NextResponse.json(
      { message: 'Failed to fetch study sessions' },
      { status: 500 }
    );
  }
} 