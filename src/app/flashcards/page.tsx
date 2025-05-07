'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/app/shell';
import { getFlashcards, getTags, createFlashcard, deleteFlashcard, updateFlashcard } from '@/lib/api';
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
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(10);

  useEffect(() => {
    loadFlashcards();
    loadTags();
  }, []);

  // Reset to first page when filtering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTag]);

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

  const handleEditFlashcard = async (values: any) => {
    if (!editingFlashcard) return;
    
    try {
      await updateFlashcard(editingFlashcard.id, values);
      toast.success('Flashcard updated successfully');
      loadFlashcards();
      loadTags();
      setEditingFlashcard(null);
      return Promise.resolve();
    } catch (err) {
      console.error('Error updating flashcard:', err);
      toast.error('Failed to update flashcard');
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

  // Filter cards by tag
  const filteredFlashcards = filterTag
    ? flashcards.filter(card => card.tags.includes(filterTag))
    : flashcards;
    
  // Calculate pagination values
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredFlashcards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredFlashcards.length / cardsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Form Section */}
          <div className="md:w-1/3">
            <h1 className="text-2xl font-bold mb-6">
              {editingFlashcard ? 'Edit Flashcard' : 'Flashcards'}
            </h1>
            {editingFlashcard ? (
              <FlashcardForm 
                onSubmit={handleEditFlashcard} 
                existingTags={tags}
                flashcard={editingFlashcard}
                isEditing={true}
                onCancel={() => setEditingFlashcard(null)}
              />
            ) : (
              <FlashcardForm 
                onSubmit={handleAddFlashcard} 
                existingTags={tags}
              />
            )}
          </div>

          {/* Flashcards List Section */}
          <div className="md:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Your Flashcards <span className="text-blue-600 text-lg font-normal">({filteredFlashcards.length} of {flashcards.length})</span></h2>
              
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
                {currentCards.map(card => (
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
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs cursor-pointer"
                              onClick={() => setFilterTag(tag)}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingFlashcard(card)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFlashcard(card.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="mt-6 flex flex-col items-center space-y-2">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstCard + 1}-{Math.min(indexOfLastCard, filteredFlashcards.length)} of {filteredFlashcards.length} flashcards
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    &larr;
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show the current page and surrounding pages
                      let pageNum;
                      if (totalPages <= 5) {
                        // If 5 or fewer pages, show all
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        // If current page is near the start
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        // If current page is near the end
                        pageNum = totalPages - 4 + i;
                      } else {
                        // If current page is in the middle
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => paginate(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    &rarr;
                  </Button>
                </div>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-sm text-gray-600">Cards per page:</span>
                  <select
                    value={cardsPerPage}
                    onChange={(e) => {
                      setCardsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing cards per page
                    }}
                    className="p-1 border rounded-md text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
} 