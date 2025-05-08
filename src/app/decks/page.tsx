'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/app/shell';
import { getDecks, createDeck, getDeck, updateDeck } from '@/lib/api';
import { DeckForm } from '@/components/deck-form';
import { RenameDeckModal } from '@/components/rename-deck-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Deck {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  cardCount: number;
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deckToRename, setDeckToRename] = useState<Deck | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setIsLoading(true);
    try {
      const data = await getDecks();
      setDecks(data);
      setError(null);
    } catch (err) {
      console.error('Error loading decks:', err);
      setError('Failed to load decks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async (values: any) => {
    try {
      await createDeck(values);
      toast.success('Deck created successfully');
      loadDecks();
      return Promise.resolve();
    } catch (err) {
      console.error('Error creating deck:', err);
      toast.error('Failed to create deck');
      return Promise.reject(err);
    }
  };

  const handleOpenRenameModal = (deck: Deck) => {
    setDeckToRename(deck);
    setRenameModalOpen(true);
  };

  const handleCloseRenameModal = () => {
    setRenameModalOpen(false);
    setDeckToRename(null);
  };

  const handleRenameDeck = async (deckId: string, newName: string) => {
    setIsSubmitting(true);
    try {
      console.log(`Attempting to rename deck ${deckId} to "${newName}"`);
      const updatedDeck = await updateDeck(deckId, { name: newName });
      console.log('Rename success:', updatedDeck);
      toast.success('Deck renamed successfully');
      loadDecks();
      return Promise.resolve();
    } catch (err) {
      console.error('Error renaming deck:', err);
      // Show more detailed error message
      if (err instanceof Error) {
        toast.error(`Failed to rename deck: ${err.message}`);
      } else {
        toast.error('Failed to rename deck');
      }
      return Promise.reject(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Form Section */}
          <div className="md:w-1/3">
            <h1 className="text-2xl font-bold mb-6">Decks</h1>
            <DeckForm onSubmit={handleCreateDeck} />
          </div>

          {/* Decks List Section */}
          <div className="md:w-2/3">
            <h2 className="text-xl font-bold mb-6">Your Decks</h2>
            
            {isLoading ? (
              <div className="py-12 text-center">Loading decks...</div>
            ) : error ? (
              <div className="py-12 text-center text-red-500">{error}</div>
            ) : decks.length === 0 ? (
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <p>You haven't created any decks yet. Get started by creating your first deck!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="flex gap-2 mb-2">
                        <Link href={`/decks/${deck.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            Manage
                          </Button>
                        </Link>
                        <Link href={`/study/${deck.id}`} className="flex-1">
                          <Button className="w-full">
                            Study
                          </Button>
                        </Link>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full text-sm"
                        onClick={() => handleOpenRenameModal(deck)}
                      >
                        Rename
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {deckToRename && (
          <RenameDeckModal 
            deckId={deckToRename.id}
            currentName={deckToRename.name}
            isOpen={renameModalOpen}
            onClose={handleCloseRenameModal}
            onRename={handleRenameDeck}
          />
        )}
      </div>
    </Shell>
  );
} 