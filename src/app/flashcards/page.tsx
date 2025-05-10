'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/app/shell';
import { getFlashcards, getTags, createFlashcard, deleteFlashcard, updateFlashcard, exportFlashcards, importFlashcards } from '@/lib/api';
import { FlashcardForm } from '@/components/flashcard-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { ImportFileDialog } from '@/components/import-file-dialog';

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
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(10);

  // Helper function to normalize pinyin by removing tones
  const normalizePinyin = (pinyin: string): string => {
    return pinyin
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (tones)
      .replace(/[üǖǘǚǜ]/g, 'u') // Replace ü with u
      .replace(/[v]/g, 'u'); // Replace v with u (common in some pinyin systems)
  };

  // Helper function to check for duplicates
  const checkForDuplicates = (values: { character: string; pinyin: string; meaning: string }) => {
    const duplicates = {
      character: false,
      pinyin: false,
      meaning: false
    };

    const normalizedNewPinyin = normalizePinyin(values.pinyin);

    flashcards.forEach(card => {
      if (card.character === values.character) {
        duplicates.character = true;
      }
      if (normalizePinyin(card.pinyin) === normalizedNewPinyin) {
        duplicates.pinyin = true;
      }
      if (card.meaning.toLowerCase() === values.meaning.toLowerCase()) {
        duplicates.meaning = true;
      }
    });

    return duplicates;
  };

  // Helper function to format duplicate warning message
  const formatDuplicateWarning = (duplicates: { character: boolean; pinyin: boolean; meaning: boolean }) => {
    const duplicateFields = [];
    if (duplicates.character) duplicateFields.push('character');
    if (duplicates.pinyin) duplicateFields.push('pinyin');
    if (duplicates.meaning) duplicateFields.push('meaning');

    if (duplicateFields.length === 0) return null;

    return `This flashcard has duplicate ${duplicateFields.join(', ')} with existing flashcards. Do you want to proceed anyway?`;
  };

  useEffect(() => {
    loadFlashcards();
    loadTags();
  }, []);

  // Reset to first page when filtering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTag, searchTerm]);

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
      // Check for duplicates
      const duplicates = checkForDuplicates(values);
      const warningMessage = formatDuplicateWarning(duplicates);

      if (warningMessage) {
        const shouldProceed = window.confirm(warningMessage);
        if (!shouldProceed) {
          return Promise.reject(new Error('Flashcard creation cancelled by user'));
        }
      }

      await createFlashcard(values);
      toast.success('Flashcard added successfully');
      loadFlashcards();
      loadTags();
      return Promise.resolve();
    } catch (err) {
      console.error('Error adding flashcard:', err);
      if (err instanceof Error && err.message === 'Flashcard creation cancelled by user') {
        return Promise.reject(err);
      }
      toast.error('Failed to add flashcard');
      return Promise.reject(err);
    }
  };

  const handleEditFlashcard = async (values: any) => {
    if (!editingFlashcard) return;
    
    try {
      // Check for duplicates, excluding the current card being edited
      const duplicates = checkForDuplicates({
        ...values,
        // Filter out the current card from the duplicate check
        flashcards: flashcards.filter(card => card.id !== editingFlashcard.id)
      });
      const warningMessage = formatDuplicateWarning(duplicates);

      if (warningMessage) {
        const shouldProceed = window.confirm(warningMessage);
        if (!shouldProceed) {
          return Promise.reject(new Error('Flashcard update cancelled by user'));
        }
      }

      console.log('Attempting to update flashcard:', editingFlashcard.id);
      
      // Make sure we have valid data in our request
      const updateData = {
        character: values.character.trim(),
        pinyin: values.pinyin.trim(),
        meaning: values.meaning.trim(),
        tags: values.tags
      };
      
      console.log('Update values:', updateData);
      const updatedFlashcard = await updateFlashcard(editingFlashcard.id, updateData);
      console.log('Update successful:', updatedFlashcard);
      toast.success('Flashcard updated successfully');
      loadFlashcards();
      loadTags();
      setEditingFlashcard(null);
      return Promise.resolve();
    } catch (err) {
      console.error('Error updating flashcard:', err);
      if (err instanceof Error && err.message === 'Flashcard update cancelled by user') {
        return Promise.reject(err);
      }
      // Show more detailed error message
      if (err instanceof Error) {
        toast.error(`Failed to update flashcard: ${err.message}`);
      } else {
        toast.error('Failed to update flashcard');
      }
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

  const handleExportFlashcards = async () => {
    try {
      const response = await exportFlashcards();
      
      // Create a download link and click it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1].replace(/"/g, '') || 'flashcards.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Flashcards exported successfully');
    } catch (err) {
      console.error('Error exporting flashcards:', err);
      toast.error('Failed to export flashcards');
    }
  };

  const handleImportFlashcards = async (data: any) => {
    try {
      const result = await importFlashcards(data);
      toast.success(`Import complete: ${result.results.imported} imported, ${result.results.skipped} skipped`);
      loadFlashcards();
      loadTags();
      return Promise.resolve();
    } catch (err) {
      console.error('Error importing flashcards:', err);
      toast.error('Failed to import flashcards');
      return Promise.reject(err);
    }
  };

  // Filter cards by tag and search term
  const filteredFlashcards = flashcards
    .filter(card => {
      // First filter by tag if one is selected
      if (filterTag && !card.tags.includes(filterTag)) {
        return false;
      }
      
      // Then filter by search term if one is provided
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        const normalizedTerm = normalizePinyin(term);
        const normalizedCardPinyin = normalizePinyin(card.pinyin);
        
        return (
          card.character.toLowerCase().includes(term) ||
          normalizedCardPinyin.includes(normalizedTerm) ||
          card.meaning.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
    
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {editingFlashcard ? 'Edit Flashcard' : 'Flashcards'}
              </h1>
              <div className="flex gap-2">
                <ImportFileDialog 
                  title="Import Flashcards" 
                  onImport={handleImportFlashcards} 
                  buttonText="Import"
                />
                <Button variant="outline" size="sm" onClick={handleExportFlashcards}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
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
                  value={filterTag || ''}
                  onChange={(e) => setFilterTag(e.target.value || null)}
                  className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                    onClick={() => setFilterTag(null)}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by character, pinyin, or meaning..."
                  className="flex-1 p-2 border rounded-l-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                {searchTerm && (
                  <Button 
                    variant="ghost"
                    onClick={() => setSearchTerm('')}
                    className="rounded-l-none border border-l-0 px-3"
                  >
                    ✕
                  </Button>
                )}
              </div>
              {searchTerm && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Searching for "{searchTerm}" - {filteredFlashcards.length} results found
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="py-12 text-center">Loading flashcards...</div>
            ) : error ? (
              <div className="py-12 text-center text-red-500">{error}</div>
            ) : filteredFlashcards.length === 0 ? (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg text-center">
                {searchTerm ? (
                  <p>No flashcards found matching "{searchTerm}"</p>
                ) : filterTag ? (
                  <p>No flashcards found with the tag "{filterTag}"</p>
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
                        <div className="text-gray-600 dark:text-gray-300">{card.meaning}</div>
                      </div>
                      
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {card.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs cursor-pointer"
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
                <div className="text-sm text-gray-600 dark:text-gray-400">
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
                    className="p-1 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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