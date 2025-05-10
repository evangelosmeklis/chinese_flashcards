import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/flashcards/import - Import flashcards from JSON
export async function POST(request: NextRequest) {
  try {
    const flashcardsData = await request.json();
    
    if (!Array.isArray(flashcardsData)) {
      return NextResponse.json(
        { message: 'Invalid import data: Expected an array of flashcards' },
        { status: 400 }
      );
    }

    const results = {
      total: flashcardsData.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process each flashcard in the imported data
    for (const card of flashcardsData) {
      try {
        // Validate required fields
        if (!card.character || !card.pinyin || !card.meaning) {
          results.skipped++;
          results.errors.push(`Skipping card: Missing required fields (character, pinyin, or meaning)`);
          continue;
        }

        // Process tags
        const tagNames = card.tags || [];
        
        // Process decks
        const deckNames = card.decks || [];
        
        // Create the flashcard with tags
        await db.flashcard.create({
          data: {
            character: card.character,
            pinyin: card.pinyin,
            meaning: card.meaning,
            tags: {
              connectOrCreate: tagNames.map((name: string) => ({
                where: { name },
                create: { name },
              })),
            },
            decks: {
              connect: await getExistingDeckIds(deckNames),
            },
          },
        });

        results.imported++;
      } catch (err) {
        results.skipped++;
        results.errors.push(`Error importing card "${card.character}": ${(err as Error).message}`);
      }
    }

    return NextResponse.json({
      message: `Import complete: ${results.imported} imported, ${results.skipped} skipped`,
      results,
    });
  } catch (error) {
    console.error('Error importing flashcards:', error);
    return NextResponse.json(
      { message: 'Failed to import flashcards' },
      { status: 500 }
    );
  }
}

// Helper function to get existing deck IDs by name
async function getExistingDeckIds(deckNames: string[]) {
  if (!deckNames.length) return [];
  
  const existingDecks = await db.deck.findMany({
    where: {
      name: {
        in: deckNames,
      },
    },
    select: {
      id: true,
    },
  });

  return existingDecks;
} 