import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/flashcards/[id] - Get a single flashcard
export async function GET(request: NextRequest, { params }: Params) {
  const id = params.id;

  try {
    const flashcard = await db.flashcard.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!flashcard) {
      return NextResponse.json(
        { message: 'Flashcard not found' },
        { status: 404 }
      );
    }

    const formattedFlashcard = {
      ...flashcard,
      tags: flashcard.tags.map((tag: any) => tag.name),
    };

    return NextResponse.json(formattedFlashcard);
  } catch (error) {
    console.error(`Error fetching flashcard ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch flashcard' },
      { status: 500 }
    );
  }
}

// PUT /api/flashcards/[id] - Update a flashcard
export async function PUT(request: NextRequest, { params }: Params) {
  const id = params.id;

  try {
    const body = await request.json();
    const { character, pinyin, meaning, tags } = body;

    // Check if flashcard exists
    const existingFlashcard = await db.flashcard.findUnique({
      where: { id },
    });

    if (!existingFlashcard) {
      return NextResponse.json(
        { message: 'Flashcard not found' },
        { status: 404 }
      );
    }

    // Prepare the update data
    const updateData: any = {};
    if (character !== undefined) updateData.character = character;
    if (pinyin !== undefined) updateData.pinyin = pinyin;
    if (meaning !== undefined) updateData.meaning = meaning;

    // Process tags if provided
    let tagOperations;
    if (tags !== undefined) {
      // First, disconnect all existing tags
      await db.flashcard.update({
        where: { id },
        data: {
          tags: {
            set: [],
          },
        },
      });

      // Then connect or create new tags
      const tagNames = tags ? tags.split(',').map((tag: string) => tag.trim()) : [];
      tagOperations = {
        connectOrCreate: tagNames.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      };
    }

    // Update the flashcard
    const flashcard = await db.flashcard.update({
      where: { id },
      data: {
        ...updateData,
        ...(tagOperations && { tags: tagOperations }),
      },
      include: {
        tags: true,
      },
    });

    const formattedFlashcard = {
      ...flashcard,
      tags: flashcard.tags.map((tag: any) => tag.name),
    };

    return NextResponse.json(formattedFlashcard);
  } catch (error) {
    console.error(`Error updating flashcard ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update flashcard' },
      { status: 500 }
    );
  }
}

// DELETE /api/flashcards/[id] - Delete a flashcard
export async function DELETE(request: NextRequest, { params }: Params) {
  const id = params.id;

  try {
    // Check if flashcard exists
    const existingFlashcard = await db.flashcard.findUnique({
      where: { id },
    });

    if (!existingFlashcard) {
      return NextResponse.json(
        { message: 'Flashcard not found' },
        { status: 404 }
      );
    }

    // Delete the flashcard
    await db.flashcard.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error(`Error deleting flashcard ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete flashcard' },
      { status: 500 }
    );
  }
} 