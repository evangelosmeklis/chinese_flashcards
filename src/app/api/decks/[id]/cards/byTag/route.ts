import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/decks/[id]/cards/byTag - Add flashcards to a deck by tag
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params since it's a Promise in Next.js 15
  const { id } = await params;
  const deckId = id;

  try {
    const body = await request.json();
    const { tag } = body;

    if (!tag) {
      return NextResponse.json(
        { message: 'Tag is required' },
        { status: 400 }
      );
    }

    // Check if deck exists
    const existingDeck = await db.deck.findUnique({
      where: { id: deckId },
      include: {
        flashcards: {
          select: { id: true },
        },
      },
    });

    if (!existingDeck) {
      return NextResponse.json(
        { message: 'Deck not found' },
        { status: 404 }
      );
    }

    // Find all flashcards with the given tag
    const flashcardsWithTag = await db.flashcard.findMany({
      where: {
        tags: {
          some: {
            name: tag,
          },
        },
      },
    });

    if (flashcardsWithTag.length === 0) {
      return NextResponse.json(
        { message: 'No flashcards found with the given tag' },
        { status: 404 }
      );
    }

    // Filter out flashcards that are already in the deck
    const existingCardIds = existingDeck.flashcards.map((card: any) => card.id);
    const newFlashcards = flashcardsWithTag.filter((card: any) => !existingCardIds.includes(card.id));

    if (newFlashcards.length === 0) {
      return NextResponse.json(
        { message: 'All flashcards with this tag are already in the deck' },
        { status: 400 }
      );
    }

    // Add the flashcards to the deck
    const updatedDeck = await db.deck.update({
      where: { id: deckId },
      data: {
        flashcards: {
          connect: newFlashcards.map((card: any) => ({ id: card.id })),
        },
      },
      include: {
        flashcards: {
          include: {
            tags: true,
          },
        },
      },
    });

    // Format the response
    const formattedDeck = {
      ...updatedDeck,
      flashcards: updatedDeck.flashcards.map((card: any) => ({
        ...card,
        tags: card.tags.map((tag: any) => tag.name),
      })),
    };

    return NextResponse.json({
      message: `Added ${newFlashcards.length} flashcards to deck`,
      deck: formattedDeck,
    });
  } catch (error) {
    console.error(`Error adding flashcards by tag to deck ${deckId}:`, error);
    return NextResponse.json(
      { message: 'Failed to add flashcards to deck' },
      { status: 500 }
    );
  }
} 