import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tags - Get all tags
export async function GET() {
  try {
    const tags = await db.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { message: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
} 