'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/app/shell';
import { getFlashcards, getDecks, getDeck, getFlashcardsByDeckId } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

interface Flashcard {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
}

interface Deck {
  id: string;
  name: string;
  flashcards: Flashcard[];
}

export default function CopyPage() {
  const [learningData, setLearningData] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  
  useEffect(() => {
    // Load all flashcards the user has learned
    loadUserLearningData();
    // Load all decks
    loadDecks();
  }, []);
  
  const loadUserLearningData = async () => {
    setIsLoadingData(true);
    try {
      const data = await getFlashcards();
      setLearningData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading learning data:', err);
      setError('Failed to load learning data. Please try again later.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadDecks = async () => {
    setIsLoadingDecks(true);
    try {
      const data = await getDecks();
      // For each deck, get the flashcards
      const decksWithFlashcards = await Promise.all(
        data.map(async (deck: any) => {
          const deckDetails = await getFlashcardsByDeckId(deck.id);
          console.log(`Loaded ${deckDetails.length} cards for deck: ${deck.name} (${deck.id})`);
          return {
            ...deck,
            flashcards: deckDetails || []
          };
        })
      );
      setDecks(decksWithFlashcards);
      console.log('All decks with flashcards:', decksWithFlashcards);
    } catch (err) {
      console.error('Error loading decks:', err);
      setError('Failed to load decks. Please try again later.');
    } finally {
      setIsLoadingDecks(false);
    }
  };

  const getActiveFlashcards = () => {
    if (selectedDeck === 'all') {
      return learningData;
    } else {
      const deck = decks.find(d => d.id === selectedDeck);
      console.log('Selected deck:', deck);
      return deck ? deck.flashcards : [];
    }
  };

  const handleCopyCharacters = () => {
    const characters = getActiveFlashcards().map(card => card.character).join('');
    navigator.clipboard.writeText(characters)
      .then(() => {
        toast.success('Characters copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy characters:', err);
        toast.error('Failed to copy characters to clipboard');
      });
  };
  
  const handleCopyWithMeanings = () => {
    const formatted = getActiveFlashcards().map(card => `${card.character} (${card.meaning})`).join(', ');
    navigator.clipboard.writeText(formatted)
      .then(() => {
        toast.success('Characters with meanings copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy characters with meanings:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleCopyStructured = () => {
    const formatted = getActiveFlashcards().map(card => 
      `Character: ${card.character}\nPinyin: ${card.pinyin}\nMeaning: ${card.meaning}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(formatted)
      .then(() => {
        toast.success('Structured data copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy structured data:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-bold">Copy Characters</h1>
            <p className="text-gray-500 mt-2">
              Copy your learned Chinese characters for use in external applications.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Copy Characters</CardTitle>
              <CardDescription>
                {error ? (
                  <span className="text-red-500">{error}</span>
                ) : isLoadingData ? (
                  'Loading your learning data...'
                ) : (
                  `Loaded ${learningData.length} characters you've learned`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select Deck</label>
                <select 
                  value={selectedDeck}
                  onChange={(e) => setSelectedDeck(e.target.value)}
                  className="w-full p-2 border rounded-md mb-4"
                  disabled={isLoadingDecks}
                >
                  <option value="all">All Learned Characters</option>
                  {decks.map(deck => (
                    <option key={deck.id} value={deck.id}>{deck.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Your Characters</h3>
                    <p className="text-sm text-gray-500">
                      Here you can view and copy Chinese characters for use in external applications.
                    </p>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleCopyCharacters}>
                      Copy Characters Only
                    </Button>
                    <Button onClick={handleCopyWithMeanings} variant="outline">
                      Copy with Meanings
                    </Button>
                    <Button onClick={handleCopyStructured} variant="outline">
                      Copy Structured Data
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800/50 min-h-[300px]">
                    {isLoadingData || isLoadingDecks ? (
                      <div className="flex justify-center items-center h-full">
                        <p>Loading characters...</p>
                      </div>
                    ) : getActiveFlashcards().length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <p>No characters available in the selected deck.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Characters Only</h4>
                          <div className="p-3 bg-white dark:bg-gray-900 border rounded-md text-lg break-all">
                            {getActiveFlashcards().map(card => card.character).join('')}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Characters with Meanings</h4>
                          <div className="p-3 bg-white dark:bg-gray-900 border rounded-md break-all">
                            {getActiveFlashcards().map((card, idx) => (
                              <span key={card.id} className="inline-block mb-2 mr-2">
                                <span className="font-medium">{card.character}</span>
                                <span className="text-gray-500 text-sm"> ({card.meaning})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Table View</h4>
                          <div className="border rounded-md overflow-auto max-h-[300px]">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Character</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pinyin</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Meaning</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {getActiveFlashcards().map(card => (
                                  <tr key={card.id}>
                                    <td className="px-4 py-3 text-lg">{card.character}</td>
                                    <td className="px-4 py-3">{card.pinyin}</td>
                                    <td className="px-4 py-3">{card.meaning}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
} 