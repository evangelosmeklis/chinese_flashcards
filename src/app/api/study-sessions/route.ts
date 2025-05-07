import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/study-sessions - Get all study sessions
export async function GET() {
  try {
    const studySessions = await db.studySession.findMany({
      orderBy: {
        startedAt: 'desc',
      },
    });

    return NextResponse.json(studySessions);
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch study sessions' },
      { status: 500 }
    );
  }
}

// POST /api/study-sessions - Create a new study session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deckId, correct, incorrect, studyMode } = body;

    if (!deckId) {
      return NextResponse.json(
        { message: 'Deck ID is required' },
        { status: 400 }
      );
    }

    // Check if deck exists
    const existingDeck = await db.deck.findUnique({
      where: { id: deckId },
    });

    if (!existingDeck) {
      return NextResponse.json(
        { message: 'Deck not found' },
        { status: 404 }
      );
    }

    // Create study session
    const studySession = await db.studySession.create({
      data: {
        deckId,
        correct: correct || 0,
        incorrect: incorrect || 0,
        studyMode: studyMode || 'normal',
        endedAt: new Date(),
      },
    });

    return NextResponse.json(studySession, { status: 201 });
  } catch (error) {
    console.error('Error creating study session:', error);
    return NextResponse.json(
      { message: 'Failed to create study session' },
      { status: 500 }
    );
  }
} 