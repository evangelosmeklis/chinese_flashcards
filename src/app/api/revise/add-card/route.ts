import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/revise/add-card - Add a flashcard to the revise deck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flashcardId } = body;

    if (!flashcardId) {
      return NextResponse.json(
        { message: 'Flashcard ID is required' },
        { status: 400 }
      );
    }

    // Check if the flashcard exists
    const existingFlashcard = await db.flashcard.findUnique({
      where: { id: flashcardId },
    });

    if (!existingFlashcard) {
      return NextResponse.json(
        { message: 'Flashcard not found' },
        { status: 404 }
      );
    }

    // Check if revise deck exists, create it if it doesn't
    let reviseDeck = await db.deck.findFirst({
      where: { name: 'revise' },
    });

    if (!reviseDeck) {
      // Create the revise deck if it doesn't exist
      reviseDeck = await db.deck.create({
        data: {
          name: 'revise',
          description: 'Cards that were incorrectly guessed from the total words deck',
        },
      });
    }

    // Check if the card is already in the revise deck
    const existingConnection = await db.deck.findFirst({
      where: {
        id: reviseDeck.id,
        flashcards: {
          some: {
            id: flashcardId,
          },
        },
      },
    });

    if (existingConnection) {
      return NextResponse.json({
        message: 'Flashcard is already in the revise deck',
        deck: reviseDeck,
      });
    }

    // Add the flashcard to the revise deck
    const updatedDeck = await db.deck.update({
      where: { id: reviseDeck.id },
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
      message: 'Flashcard added to revise deck successfully',
      deck: updatedDeck,
    });
  } catch (error) {
    console.error('Error adding flashcard to revise deck:', error);
    return NextResponse.json(
      { message: 'Failed to add flashcard to revise deck' },
      { status: 500 }
    );
  }
} 