'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/app/shell';
import { getStudySessions, getDecks } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface StudySession {
  id: string;
  deckId: string;
  startedAt: string;
  endedAt: string | null;
  correct: number;
  incorrect: number;
  studyMode: string;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
}

export default function StudySessionsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [decks, setDecks] = useState<Record<string, Deck>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionsAndDecks();
  }, []);

  const loadSessionsAndDecks = async () => {
    setIsLoading(true);
    try {
      // Load study sessions
      const sessionsData = await getStudySessions();
      setSessions(sessionsData);
      
      // Load decks to map deck IDs to names
      const decksData = await getDecks();
      const decksMap: Record<string, Deck> = {};
      decksData.forEach((deck: Deck) => {
        decksMap[deck.id] = deck;
      });
      setDecks(decksMap);
      
      setError(null);
    } catch (err) {
      console.error('Error loading study sessions:', err);
      setError('Failed to load study sessions. Please try again later.');
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
          Loading study sessions...
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500 mb-4">
            {error}
          </div>
        </div>
      </Shell>
    );
  }

  // Group sessions by date
  const sessionsByDate: Record<string, StudySession[]> = {};
  sessions.forEach(session => {
    const date = new Date(session.startedAt).toLocaleDateString();
    if (!sessionsByDate[date]) {
      sessionsByDate[date] = [];
    }
    sessionsByDate[date].push(session);
  });

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Study History</h1>
          <Link href="/decks">
            <Button variant="outline">Back to Decks</Button>
          </Link>
        </div>
        
        {sessions.length === 0 ? (
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p>No study sessions found yet. Start studying to see your progress!</p>
            <Link href="/decks">
              <Button className="mt-4">Go to Decks</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
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
            
            {Object.entries(sessionsByDate)
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([date, dateSessions]) => (
                <div key={date}>
                  <h2 className="text-xl font-bold mt-6 mb-4">{date}</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {dateSessions.map(session => (
                      <Card key={session.id}>
                        <CardContent className="py-4">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <div className="font-medium">
                                {formatDate(session.startedAt)}
                              </div>
                              <div className="text-blue-600 font-medium">
                                {decks[session.deckId]?.name || 'Unknown Deck'}
                              </div>
                              <div className="text-sm text-gray-500">
                                Mode: {formatStudyMode(session.studyMode)}
                              </div>
                            </div>
                            <div className="flex gap-6 items-center">
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
                              <Link href={`/decks/${session.deckId}/history`}>
                                <Button variant="outline" size="sm">View Deck</Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </Shell>
  );
} 