import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/decks/[id]/cards - Add a flashcard to a deck
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params since it's a Promise in Next.js 15
  const { id } = await params;
  const deckId = id;

  try {
    const body = await request.json();
    const { flashcardId } = body;

    if (!flashcardId) {
      return NextResponse.json(
        { message: 'Flashcard ID is required' },
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

    // Check if flashcard exists
    const existingFlashcard = await db.flashcard.findUnique({
      where: { id: flashcardId },
    });

    if (!existingFlashcard) {
      return NextResponse.json(
        { message: 'Flashcard not found' },
        { status: 404 }
      );
    }

    // Check if the card is already in the deck
    const existingConnection = await db.deck.findFirst({
      where: {
        id: deckId,
        flashcards: {
          some: {
            id: flashcardId,
          },
        },
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        { message: 'Flashcard is already in the deck' },
        { status: 400 }
      );
    }

    // Add the flashcard to the deck
    const updatedDeck = await db.deck.update({
      where: { id: deckId },
      data: {
        flashcards: {
          connect: {
            id: flashcardId,
          },
        },
      },
      include: {
        flashcards: true,
      },
    });

    return NextResponse.json({
      message: 'Flashcard added to deck successfully',
      deck: updatedDeck,
    });
  } catch (error) {
    console.error(`Error adding flashcard to deck ${deckId}:`, error);
    return NextResponse.json(
      { message: 'Failed to add flashcard to deck' },
      { status: 500 }
    );
  }
} 