'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/app/shell';
import { getFlashcards, getTags, createFlashcard, deleteFlashcard } from '@/lib/api';
import { FlashcardForm } from '@/components/flashcard-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface Flashcard {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  tags: string[];
  createdAt: string;
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>('');

  useEffect(() => {
    loadFlashcards();
    loadTags();
  }, []);

  const loadFlashcards = async () => {
    setIsLoading(true);
    try {
      const data = await getFlashcards();
      setFlashcards(data);
      setError(null);
    } catch (err) {
      console.error('Error loading flashcards:', err);
      setError('Failed to load flashcards. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const data = await getTags();
      setTags(data.map((tag: any) => tag.name));
    } catch (err) {
      console.error('Error loading tags:', err);
      // Don't set error state here to avoid preventing the page from loading
    }
  };

  const handleAddFlashcard = async (values: any) => {
    try {
      await createFlashcard(values);
      toast.success('Flashcard added successfully');
      loadFlashcards();
      loadTags();
      return Promise.resolve();
    } catch (err) {
      console.error('Error adding flashcard:', err);
      toast.error('Failed to add flashcard');
      return Promise.reject(err);
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }

    try {
      await deleteFlashcard(id);
      toast.success('Flashcard deleted successfully');
      loadFlashcards();
    } catch (err) {
      console.error('Error deleting flashcard:', err);
      toast.error('Failed to delete flashcard');
    }
  };

  const filteredFlashcards = filterTag
    ? flashcards.filter(card => card.tags.includes(filterTag))
    : flashcards;

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Form Section */}
          <div className="md:w-1/3">
            <h1 className="text-2xl font-bold mb-6">Flashcards</h1>
            <FlashcardForm 
              onSubmit={handleAddFlashcard} 
              existingTags={tags}
            />
          </div>

          {/* Flashcards List Section */}
          <div className="md:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Your Flashcards</h2>
              
              {/* Tag Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  <option value="">All Tags</option>
                  {tags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                {filterTag && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFilterTag('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">Loading flashcards...</div>
            ) : error ? (
              <div className="py-12 text-center text-red-500">{error}</div>
            ) : filteredFlashcards.length === 0 ? (
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                {filterTag ? (
                  <p>No flashcards found with the tag "{filterTag}".</p>
                ) : (
                  <p>You haven't created any flashcards yet. Get started by adding your first flashcard!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredFlashcards.map(card => (
                  <Card key={card.id} className="relative overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl">{card.character}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-lg">{card.pinyin}</div>
                        <div className="text-gray-600">{card.meaning}</div>
                      </div>
                      
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {card.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                              onClick={() => setFilterTag(tag)}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-4 right-4"
                        onClick={() => handleDeleteFlashcard(card.id)}
                      >
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
} 