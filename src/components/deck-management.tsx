import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  description?: string | null;
  flashcards: Flashcard[];
}

interface DeckManagementProps {
  deck: Deck;
  availableFlashcards: Flashcard[];
  availableTags: string[];
  onAddCard: (cardId: string) => Promise<void>;
  onRemoveCard: (cardId: string) => Promise<void>;
  onAddCardsByTag: (tag: string) => Promise<void>;
}

export function DeckManagement({
  deck,
  availableFlashcards,
  availableTags,
  onAddCard,
  onRemoveCard,
  onAddCardsByTag,
}: DeckManagementProps) {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleAddCard = async (cardId: string) => {
    setIsAdding(true);
    try {
      await onAddCard(cardId);
    } catch (error) {
      console.error('Error adding card to deck:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    setIsRemoving(true);
    try {
      await onRemoveCard(cardId);
    } catch (error) {
      console.error('Error removing card from deck:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddCardsByTag = async () => {
    if (!selectedTag) return;
    
    setIsAdding(true);
    try {
      await onAddCardsByTag(selectedTag);
      setSelectedTag('');
    } catch (error) {
      console.error('Error adding cards by tag:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Filter out cards that are already in the deck
  const cardsToAdd = availableFlashcards.filter(
    card => !deck.flashcards.some(deckCard => deckCard.id === card.id)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deck: {deck.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            {deck.description || 'No description provided.'}
          </p>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Cards by Tag</h3>
            <div className="flex gap-2">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="flex-1 p-2 border rounded-md"
              >
                <option value="">Select a tag</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <Button 
                onClick={handleAddCardsByTag} 
                disabled={!selectedTag || isAdding}
              >
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Cards in Deck ({deck.flashcards.length})</h3>
            {deck.flashcards.length === 0 ? (
              <p className="text-sm text-gray-500">No cards in this deck yet.</p>
            ) : (
              <div className="grid gap-2">
                {deck.flashcards.map(card => (
                  <div key={card.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-bold">{card.character}</div>
                      <div className="text-sm">{card.pinyin} - {card.meaning}</div>
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {card.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemoveCard(card.id)}
                      disabled={isRemoving}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cardsToAdd.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Available Cards to Add</h3>
              <div className="grid gap-2">
                {cardsToAdd.map(card => (
                  <div key={card.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-bold">{card.character}</div>
                      <div className="text-sm">{card.pinyin} - {card.meaning}</div>
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {card.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddCard(card.id)}
                      disabled={isAdding}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 