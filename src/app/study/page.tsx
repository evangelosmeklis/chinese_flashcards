'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/app/shell';
import { getDecks } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Deck {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  cardCount: number;
}

export default function StudyPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setIsLoading(true);
    try {
      const data = await getDecks();
      setDecks(data.filter(deck => deck.cardCount > 0));
      setError(null);
    } catch (err) {
      console.error('Error loading decks:', err);
      setError('Failed to load decks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Study Decks</h1>
        
        {isLoading ? (
          <div className="py-12 text-center">Loading decks...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">{error}</div>
        ) : decks.length === 0 ? (
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p>No decks with cards available for study. Add cards to your decks first.</p>
            <Link href="/decks">
              <Button className="mt-4">Go to Decks</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {decks.map(deck => (
              <Card key={deck.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{deck.name}</CardTitle>
                  <CardDescription>
                    {deck.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-gray-500 mb-2">
                    {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                  </div>
                </CardContent>
                <div className="p-4 pt-0 border-t mt-auto">
                  <Link href={`/study/${deck.id}`}>
                    <Button className="w-full">
                      Start Studying
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
} 