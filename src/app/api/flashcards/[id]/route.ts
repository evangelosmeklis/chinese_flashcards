import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/flashcards/[id] - Get a single flashcard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params since it's a Promise in Next.js 15
  const { id } = await params;

  try {
    const flashcard = await db.flashcard.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!flashcard) {
      return NextResponse.json(
        { message: 'Flashcard not found' },
        { status: 404 }
      );
    }

    // Format the response to include the tags as strings
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

// A helper function to retry database operations
async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 200));
      }
    }
  }
  throw lastError;
}

// PUT /api/flashcards/[id] - Update a flashcard
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params since it's a Promise in Next.js 15
  const { id } = await params;

  try {
    const body = await request.json();
    const { character, pinyin, meaning, tags } = body;
    
    console.log(`PUT /api/flashcards/${id} - Request body:`, JSON.stringify(body, null, 2));

    // Check if flashcard exists
    const existingFlashcard = await retryOperation(() => 
      db.flashcard.findUnique({
        where: { id },
        include: { tags: true }
      })
    );

    if (!existingFlashcard) {
      return NextResponse.json(
        { message: 'Flashcard not found' },
        { status: 404 }
      );
    }

    console.log('Existing flashcard tags:', existingFlashcard.tags.map(t => t.name));
    console.log('Input tags value (type):', typeof tags, Array.isArray(tags) ? 'array' : 'not array');
    console.log('Input tags value:', tags);

    // Prepare the update data for the flashcard fields
    const updateData: any = {};
    if (character !== undefined) updateData.character = character;
    if (pinyin !== undefined) updateData.pinyin = pinyin;
    if (meaning !== undefined) updateData.meaning = meaning;

    try {
      let result;
      
      // Update the flashcard fields first
      if (Object.keys(updateData).length > 0) {
        console.log('Updating flashcard fields:', updateData);
        result = await retryOperation(() => 
          db.flashcard.update({
            where: { id },
            data: updateData,
            include: { tags: true }
          })
        );
        console.log('Updated flashcard fields successfully');
      } else {
        result = existingFlashcard;
      }
      
      // If we need to update tags, handle them separately
      if (tags !== undefined) {
        // Parse tag names - handle both string and array formats
        let tagNames: string[] = [];
        
        if (typeof tags === 'string') {
          // Handle empty string case properly
          tagNames = tags.trim() === '' ? [] : tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        } else if (Array.isArray(tags)) {
          tagNames = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
        
        console.log('Processed tag names for update:', tagNames);
        
        try {
          // Step 1: First disconnect all existing tags
          console.log('Disconnecting existing tags');
          await retryOperation(() => 
            db.flashcard.update({
              where: { id },
              data: {
                tags: {
                  set: []
                }
              }
            })
          );
          console.log('Successfully disconnected existing tags');
          
          // Step 2: If we have new tags, connect them
          if (tagNames.length > 0) {
            console.log('Connecting new tags:', tagNames);
            
            // For each tag, find or create it
            for (const tagName of tagNames) {
              try {
                // Find or create tag
                let tag = await retryOperation(() => 
                  db.tag.findUnique({
                    where: { name: tagName }
                  })
                );
                
                if (!tag) {
                  console.log(`Creating new tag: ${tagName}`);
                  tag = await retryOperation(() => 
                    db.tag.create({
                      data: { name: tagName }
                    })
                  );
                }
                
                // Connect tag to flashcard
                console.log(`Connecting tag: ${tagName} (ID: ${tag.id})`);
                await retryOperation(() => 
                  db.flashcard.update({
                    where: { id },
                    data: {
                      tags: {
                        connect: { id: tag.id }
                      }
                    }
                  })
                );
              } catch (tagError) {
                console.error(`Error processing tag "${tagName}":`, tagError);
              }
            }
            
            // Get the final result with all tags
            result = await retryOperation(() => 
              db.flashcard.findUnique({
                where: { id },
                include: { tags: true }
              })
            );
          }
        } catch (tagUpdateError) {
          console.error('Error during tag update operations:', tagUpdateError);
          return NextResponse.json(
            { message: `Error during tag operations: ${tagUpdateError instanceof Error ? tagUpdateError.message : 'Unknown error'}` },
            { status: 500 }
          );
        }
      }
      
      // Format the final result
      const formattedFlashcard = result ? {
        ...result,
        tags: result.tags.map((tag: any) => tag.name)
      } : { id, tags: [] };
      
      console.log('Returning updated flashcard with tags:', formattedFlashcard.tags);
      return NextResponse.json(formattedFlashcard);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { message: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error updating flashcard ${id}:`, error);
    let errorMessage = 'Failed to update flashcard';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/flashcards/[id] - Delete a flashcard
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params since it's a Promise in Next.js 15
  const { id } = await params;

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