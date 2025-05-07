import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/flashcards - Get all flashcards
export async function GET() {
  try {
    const flashcards = await db.flashcard.findMany({
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedFlashcards = flashcards.map((card: any) => ({
      ...card,
      tags: card.tags.map((tag: any) => tag.name),
    }));

    return NextResponse.json(formattedFlashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { message: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}

// POST /api/flashcards - Create a new flashcard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character, pinyin, meaning, tags } = body;

    if (!character || !pinyin || !meaning) {
      return NextResponse.json(
        { message: 'Character, pinyin, and meaning are required' },
        { status: 400 }
      );
    }

    // Process tags
    const tagNames = tags ? tags.split(',').map((tag: string) => tag.trim()) : [];
    
    // Create the flashcard with tags
    const flashcard = await db.flashcard.create({
      data: {
        character,
        pinyin,
        meaning,
        tags: {
          connectOrCreate: tagNames.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: {
        tags: true,
      },
    });

    const formattedFlashcard = {
      ...flashcard,
      tags: flashcard.tags.map((tag: any) => tag.name),
    };

    return NextResponse.json(formattedFlashcard, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json(
      { message: 'Failed to create flashcard' },
      { status: 500 }
    );
  }
} 