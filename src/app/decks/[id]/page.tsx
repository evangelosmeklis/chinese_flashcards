'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shell } from '@/app/shell';
import { getDeck, getFlashcards, getTags, addCardToDeck, removeCardFromDeck, addCardsToDeckByTag, updateDeck } from '@/lib/api';
import { DeckManagement } from '@/components/deck-management';
import { Button } from '@/components/ui/button';
import { RenameDeckModal } from '@/components/rename-deck-modal';
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

export default function DeckPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [deckId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deckData, flashcardsData, tagsData] = await Promise.all([
        getDeck(deckId),
        getFlashcards(),
        getTags()
      ]);
      
      setDeck(deckData);
      setAllFlashcards(flashcardsData);
      setAllTags(tagsData.map((tag: any) => tag.name));
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (flashcardId: string) => {
    try {
      await addCardToDeck(deckId, flashcardId);
      toast.success('Card added to deck');
      await loadData();
      return Promise.resolve();
    } catch (err) {
      console.error('Error adding card to deck:', err);
      toast.error('Failed to add card to deck');
      return Promise.reject(err);
    }
  };

  const handleRemoveCard = async (flashcardId: string) => {
    try {
      await removeCardFromDeck(deckId, flashcardId);
      toast.success('Card removed from deck');
      await loadData();
      return Promise.resolve();
    } catch (err) {
      console.error('Error removing card from deck:', err);
      toast.error('Failed to remove card from deck');
      return Promise.reject(err);
    }
  };

  const handleAddCardsByTag = async (tag: string) => {
    try {
      const result = await addCardsToDeckByTag(deckId, tag);
      toast.success(result.message);
      await loadData();
      return Promise.resolve();
    } catch (err) {
      console.error('Error adding cards by tag:', err);
      toast.error('Failed to add cards by tag');
      return Promise.reject(err);
    }
  };

  const handleRenameDeck = async (deckId: string, newName: string) => {
    setIsSubmitting(true);
    try {
      console.log(`Attempting to rename deck ${deckId} to "${newName}"`);
      const updatedDeck = await updateDeck(deckId, { name: newName });
      console.log('Rename success:', updatedDeck);
      toast.success('Deck renamed successfully');
      await loadData();
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Deck: {deck.name}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRenameModalOpen(true)}>
              Rename
            </Button>
            <Link href="/decks">
              <Button variant="outline">Back to Decks</Button>
            </Link>
            <Link href={`/decks/${deckId}/history`}>
              <Button variant="outline">Study History</Button>
            </Link>
            <Link href={`/study/${deckId}`}>
              <Button>Study Deck</Button>
            </Link>
          </div>
        </div>

        <DeckManagement 
          deck={deck}
          availableFlashcards={allFlashcards}
          availableTags={allTags}
          onAddCard={handleAddCard}
          onRemoveCard={handleRemoveCard}
          onAddCardsByTag={handleAddCardsByTag}
        />

        {deck && (
          <RenameDeckModal 
            deckId={deckId}
            currentName={deck.name}
            isOpen={renameModalOpen}
            onClose={() => setRenameModalOpen(false)}
            onRename={handleRenameDeck}
          />
        )}
      </div>
    </Shell>
  );
} 