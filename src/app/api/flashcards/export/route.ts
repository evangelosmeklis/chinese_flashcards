import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/flashcards/export - Export all flashcards as JSON
export async function GET(request: NextRequest) {
  try {
    // Get all flashcards with their tags
    const flashcards = await db.flashcard.findMany({
      include: {
        tags: true,
        decks: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response
    const formattedFlashcards = flashcards.map((card: any) => ({
      character: card.character,
      pinyin: card.pinyin,
      meaning: card.meaning,
      createdAt: card.createdAt,
      tags: card.tags.map((tag: any) => tag.name),
      decks: card.decks.map((deck: any) => deck.name),
    }));

    // Generate export filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `hanzifive-flashcards-${date}.json`;

    // Set headers for file download
    return new NextResponse(JSON.stringify(formattedFlashcards, null, 2), {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error exporting flashcards:', error);
    return NextResponse.json(
      { message: 'Failed to export flashcards' },
      { status: 500 }
    );
  }
} 