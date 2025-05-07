import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/decks/[id] - Get a single deck with its flashcards
export async function GET(request: NextRequest, { params }: Params) {
  const id = params.id;

  try {
    const deck = await db.deck.findUnique({
      where: { id },
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

    // Format the response to include the tags as strings
    const formattedDeck = {
      ...deck,
      flashcards: deck.flashcards.map((card: any) => ({
        ...card,
        tags: card.tags.map((tag: any) => tag.name),
      })),
    };

    return NextResponse.json(formattedDeck);
  } catch (error) {
    console.error(`Error fetching deck ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch deck' },
      { status: 500 }
    );
  }
}

// PUT /api/decks/[id] - Update a deck
export async function PUT(request: NextRequest, { params }: Params) {
  const id = params.id;

  try {
    const body = await request.json();
    const { name, description } = body;

    // Check if deck exists
    const existingDeck = await db.deck.findUnique({
      where: { id },
    });

    if (!existingDeck) {
      return NextResponse.json(
        { message: 'Deck not found' },
        { status: 404 }
      );
    }

    // Prepare the update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    // Update the deck
    const deck = await db.deck.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(deck);
  } catch (error) {
    console.error(`Error updating deck ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update deck' },
      { status: 500 }
    );
  }
}

// DELETE /api/decks/[id] - Delete a deck
export async function DELETE(request: NextRequest, { params }: Params) {
  const id = params.id;

  try {
    // Check if deck exists
    const existingDeck = await db.deck.findUnique({
      where: { id },
    });

    if (!existingDeck) {
      return NextResponse.json(
        { message: 'Deck not found' },
        { status: 404 }
      );
    }

    // Delete the deck
    await db.deck.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error(`Error deleting deck ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete deck' },
      { status: 500 }
    );
  }
} 