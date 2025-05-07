'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shell } from '@/app/shell';
import { getDeck, createStudySession } from '@/lib/api';
import { StudySession } from '@/components/study-session';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Flashcard {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  tags: string[];
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  flashcards: Flashcard[];
}

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeck();
  }, [deckId]);

  const loadDeck = async () => {
    setIsLoading(true);
    try {
      const data = await getDeck(deckId);
      setDeck(data);
      
      if (data.flashcards.length === 0) {
        setError('This deck has no flashcards. Add some cards to the deck before studying.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error loading deck:', err);
      setError('Failed to load deck. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSession = async (correct: number, incorrect: number) => {
    try {
      const studyMode = localStorage.getItem('studyMode') || 'normal';
      await createStudySession({
        deckId,
        correct,
        incorrect,
        studyMode,
      });
      toast.success('Study session saved successfully');
      router.push(`/decks/${deckId}/history`);
      return Promise.resolve();
    } catch (err) {
      console.error('Error saving study session:', err);
      toast.error('Failed to save study session');
      return Promise.reject(err);
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="container mx-auto px-4 py-8 text-center">
          Loading deck information...
        </div>
      </Shell>
    );
  }

  if (error || !deck) {
    return (
      <Shell>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500 mb-4">
            {error || 'Deck not found'}
          </div>
          <div className="text-center">
            <Link href="/decks">
              <Button>Go back to decks</Button>
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <StudySession 
          deck={deck} 
          flashcards={deck.flashcards} 
          onComplete={handleCompleteSession} 
        />
      </div>
    </Shell>
  );
} 