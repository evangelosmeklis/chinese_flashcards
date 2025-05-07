'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shell } from '@/app/shell';
import { getDeck, getDeckStudySessions } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Deck {
  id: string;
  name: string;
  description: string | null;
}

interface StudySession {
  id: string;
  deckId: string;
  startedAt: string;
  endedAt: string | null;
  correct: number;
  incorrect: number;
  studyMode: string;
}

export default function DeckHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeckAndSessions();
  }, [deckId]);

  const loadDeckAndSessions = async () => {
    setIsLoading(true);
    try {
      // Load deck info
      const deckData = await getDeck(deckId);
      setDeck(deckData);
      
      // Load study sessions
      const sessionsData = await getDeckStudySessions(deckId);
      setSessions(sessionsData);
      
      setError(null);
    } catch (err) {
      console.error('Error loading deck history:', err);
      setError('Failed to load deck history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatStudyMode = (mode: string) => {
    switch (mode) {
      case 'normal':
        return 'Normal (Character → Meaning)';
      case 'reverse':
        return 'Reverse (Meaning → Character)';
      case 'meaningOnly':
        return 'Meaning Only';
      default:
        return mode;
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="container mx-auto px-4 py-8 text-center">
          Loading deck history...
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Study History: {deck.name}</h1>
          <div className="flex gap-2">
            <Link href={`/decks/${deckId}`}>
              <Button variant="outline">Manage Deck</Button>
            </Link>
            <Link href={`/study/${deckId}`}>
              <Button>Study Now</Button>
            </Link>
          </div>
        </div>
        
        {deck.description && (
          <p className="text-gray-600 mb-6">{deck.description}</p>
        )}
        
        {sessions.length === 0 ? (
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p>No study sessions found for this deck yet.</p>
            <Link href={`/study/${deckId}`}>
              <Button className="mt-4">Start Studying</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{sessions.length}</div>
                    <div className="text-sm text-gray-500">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {sessions.reduce((sum, s) => sum + s.correct, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Total Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600">
                      {sessions.reduce((sum, s) => sum + s.incorrect, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Total Incorrect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {Math.round(
                        (sessions.reduce((sum, s) => sum + s.correct, 0) /
                        (sessions.reduce((sum, s) => sum + s.correct + s.incorrect, 0) || 1)) * 100
                      )}%
                    </div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Individual Sessions</h2>
            
            {sessions.map(session => (
              <Card key={session.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="font-medium">
                        {formatDate(session.startedAt)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Mode: {formatStudyMode(session.studyMode)}
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{session.correct}</div>
                        <div className="text-xs text-gray-500">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-600">{session.incorrect}</div>
                        <div className="text-xs text-gray-500">Incorrect</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">
                          {Math.round((session.correct / (session.correct + session.incorrect || 1)) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Rate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
} 