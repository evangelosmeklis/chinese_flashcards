import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/decks/import - Import decks from JSON
export async function POST(request: NextRequest) {
  try {
    const decksData = await request.json();
    
    if (!Array.isArray(decksData)) {
      return NextResponse.json(
        { message: 'Invalid import data: Expected an array of decks' },
        { status: 400 }
      );
    }

    const results = {
      total: decksData.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
      cardStats: {
        total: 0,
        imported: 0,
        skipped: 0,
      },
    };

    // Process each deck in the imported data
    for (const deckData of decksData) {
      try {
        // Validate required fields
        if (!deckData.name) {
          results.skipped++;
          results.errors.push(`Skipping deck: Missing required field (name)`);
          continue;
        }

        // Check if deck with same name already exists
        const existingDeck = await db.deck.findFirst({
          where: { name: deckData.name },
        });

        // Create or update the deck
        let deck;
        if (existingDeck) {
          // Update existing deck
          deck = await db.deck.update({
            where: { id: existingDeck.id },
            data: {
              description: deckData.description || existingDeck.description,
            },
          });
        } else {
          // Create new deck
          deck = await db.deck.create({
            data: {
              name: deckData.name,
              description: deckData.description || null,
            },
          });
        }

        // Process flashcards if they exist
        if (Array.isArray(deckData.flashcards) && deckData.flashcards.length > 0) {
          results.cardStats.total += deckData.flashcards.length;
          
          for (const cardData of deckData.flashcards) {
            try {
              // Validate required fields
              if (!cardData.character || !cardData.pinyin || !cardData.meaning) {
                results.cardStats.skipped++;
                continue;
              }

              // Process tags
              const tagNames = cardData.tags || [];
              
              // Check if the card already exists
              const existingCard = await db.flashcard.findFirst({
                where: {
                  character: cardData.character,
                  pinyin: cardData.pinyin,
                  meaning: cardData.meaning,
                },
              });

              let card;
              if (existingCard) {
                // Connect existing card to deck
                card = existingCard;
              } else {
                // Create new flashcard
                card = await db.flashcard.create({
                  data: {
                    character: cardData.character,
                    pinyin: cardData.pinyin,
                    meaning: cardData.meaning,
                    tags: {
                      connectOrCreate: tagNames.map((name: string) => ({
                        where: { name },
                        create: { name },
                      })),
                    },
                  },
                });
                results.cardStats.imported++;
              }

              // Add card to deck if it's not already there
              await db.deck.update({
                where: { id: deck.id },
                data: {
                  flashcards: {
                    connect: {
                      id: card.id,
                    },
                  },
                },
              });
            } catch (err) {
              results.cardStats.skipped++;
            }
          }
        }

        results.imported++;
      } catch (err) {
        results.skipped++;
        results.errors.push(`Error importing deck "${deckData.name}": ${(err as Error).message}`);
      }
    }

    return NextResponse.json({
      message: `Import complete: ${results.imported} decks imported, ${results.skipped} decks skipped`,
      results,
    });
  } catch (error) {
    console.error('Error importing decks:', error);
    return NextResponse.json(
      { message: 'Failed to import decks' },
      { status: 500 }
    );
  }
} 