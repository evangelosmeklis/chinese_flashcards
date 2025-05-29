import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { randomUUID } from 'crypto';

// POST /api/revise/update-streak - Update streak for a card in the revise deck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flashcardId, correct } = body;

    if (!flashcardId) {
      return NextResponse.json(
        { message: 'Flashcard ID is required' },
        { status: 400 }
      );
    }

    // Check if the flashcard exists
    const existingFlashcard = await db.flashcard.findUnique({
      where: { id: flashcardId },
    });

    if (!existingFlashcard) {
      return NextResponse.json(
        { message: 'Flashcard not found' },
        { status: 404 }
      );
    }

    // Check if revise deck exists
    const reviseDeck = await db.deck.findFirst({
      where: { name: 'revise' },
    });

    if (!reviseDeck) {
      return NextResponse.json(
        { message: 'Revise deck not found' },
        { status: 404 }
      );
    }

    // Check if this card is in the revise deck
    const cardInDeck = await db.deck.findFirst({
      where: {
        id: reviseDeck.id,
        flashcards: {
          some: {
            id: flashcardId,
          },
        },
      },
    });

    if (!cardInDeck) {
      return NextResponse.json(
        { message: 'Card is not in the revise deck' },
        { status: 400 }
      );
    }

    let streak = 0;
    let cardRemoved = false;

    // Open SQLite database connection
    const sqliteDb = await open({
      filename: path.resolve(process.cwd(), 'prisma/dev.db'),
      driver: sqlite3.Database
    });

    // Find existing streak record
    const streakRecord = await sqliteDb.get(
      'SELECT * FROM ReviseCardStreak WHERE flashcardId = ?',
      flashcardId
    );

    if (correct) {
      // If answered correctly, increment streak
      if (streakRecord) {
        streak = streakRecord.streak + 1;
        await sqliteDb.run(
          'UPDATE ReviseCardStreak SET streak = ?, updatedAt = CURRENT_TIMESTAMP WHERE flashcardId = ?',
          streak, flashcardId
        );
      } else {
        streak = 1;
        await sqliteDb.run(
          'INSERT INTO ReviseCardStreak (id, flashcardId, streak, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          randomUUID(), flashcardId, streak
        );
      }

      // If streak reaches 3, remove card from revise deck
      if (streak >= 3) {
        await db.deck.update({
          where: { id: reviseDeck.id },
          data: {
            flashcards: {
              disconnect: {
                id: flashcardId,
              },
            },
          },
        });

        // Reset streak after removing
        await sqliteDb.run(
          'DELETE FROM ReviseCardStreak WHERE flashcardId = ?',
          flashcardId
        );

        cardRemoved = true;
      }
    } else {
      // If answered incorrectly, reset streak to 0
      if (streakRecord) {
        await sqliteDb.run(
          'UPDATE ReviseCardStreak SET streak = 0, updatedAt = CURRENT_TIMESTAMP WHERE flashcardId = ?',
          flashcardId
        );
      } else {
        await sqliteDb.run(
          'INSERT INTO ReviseCardStreak (id, flashcardId, streak, updatedAt) VALUES (?, ?, 0, CURRENT_TIMESTAMP)',
          randomUUID(), flashcardId
        );
      }
      streak = 0;
    }

    // Close database connection
    await sqliteDb.close();

    return NextResponse.json({
      message: cardRemoved 
        ? 'Card removed from revise deck after 3 correct answers' 
        : 'Streak updated successfully',
      streak,
      cardRemoved,
    });
  } catch (error) {
    console.error('Error updating streak for flashcard:', error);
    return NextResponse.json(
      { message: 'Failed to update streak' },
      { status: 500 }
    );
  }
} 