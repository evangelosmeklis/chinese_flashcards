import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/decks/export - Export all decks as JSON
export async function GET(request: NextRequest) {
  try {
    // Get all decks with their flashcards
    const decks = await db.deck.findMany({
      include: {
        flashcards: {
          include: {
            tags: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to include all deck details and their flashcards
    const formattedDecks = decks.map((deck: any) => ({
      name: deck.name,
      description: deck.description,
      createdAt: deck.createdAt,
      flashcards: deck.flashcards.map((card: any) => ({
        character: card.character,
        pinyin: card.pinyin,
        meaning: card.meaning,
        tags: card.tags.map((tag: any) => tag.name),
      })),
    }));

    // Generate export filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `hanzifive-decks-${date}.json`;

    // Set headers for file download
    return new NextResponse(JSON.stringify(formattedDecks, null, 2), {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error exporting decks:', error);
    return NextResponse.json(
      { message: 'Failed to export decks' },
      { status: 500 }
    );
  }
} 