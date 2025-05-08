import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/decks - Get all decks
export async function GET() {
  console.log('GET /api/decks - Handler called');
  try {
    console.log('GET /api/decks - Attempting to query database');
    const decks = await db.deck.findMany({
      include: {
        flashcards: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`GET /api/decks - Found ${decks.length} decks`);

    // Format the response to include the count of flashcards
    const formattedDecks = decks.map((deck: any) => ({
      id: deck.id,
      name: deck.name,
      description: deck.description,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
      cardCount: deck.flashcards.length,
    }));

    console.log('GET /api/decks - Sending response');
    return NextResponse.json(formattedDecks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { message: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}

// POST /api/decks - Create a new deck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Deck name is required' },
        { status: 400 }
      );
    }

    const deck = await db.deck.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { message: 'Failed to create deck' },
      { status: 500 }
    );
  }
} 