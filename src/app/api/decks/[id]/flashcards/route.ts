import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deckId = params.id;

    // Get the deck with its flashcards
    const deck = await db.deck.findUnique({
      where: { id: deckId },
      include: {
        flashcards: {
          include: {
            tags: true,
          },
        },
      },
    });

    if (!deck) {
      return NextResponse.json(
        { message: 'Deck not found' },
        { status: 404 }
      );
    }

    // Format the flashcards
    const formattedFlashcards = deck.flashcards.map((card: any) => ({
      id: card.id,
      character: card.character,
      pinyin: card.pinyin,
      meaning: card.meaning,
      tags: card.tags.map((tag: any) => tag.name),
    }));

    return NextResponse.json(formattedFlashcards);
  } catch (error) {
    console.error('Error fetching deck flashcards:', error);
    return NextResponse.json(
      { message: 'Failed to fetch deck flashcards' },
      { status: 500 }
    );
  }
} 