import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/decks/[id]/cards/[cardId] - Remove a flashcard from a deck
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  // Await params since it's a Promise in Next.js 15
  const { id, cardId } = await params;
  const deckId = id;
  const flashcardId = cardId;

  try {
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

    // Check if the flashcard is in the deck
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

    if (!existingConnection) {
      return NextResponse.json(
        { message: 'Flashcard is not in the deck' },
        { status: 400 }
      );
    }

    // Remove the flashcard from the deck
    const updatedDeck = await db.deck.update({
      where: { id: deckId },
      data: {
        flashcards: {
          disconnect: {
            id: flashcardId,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Flashcard removed from deck successfully',
      deck: updatedDeck,
    });
  } catch (error) {
    console.error(`Error removing flashcard ${flashcardId} from deck ${deckId}:`, error);
    return NextResponse.json(
      { message: 'Failed to remove flashcard from deck' },
      { status: 500 }
    );
  }
} 