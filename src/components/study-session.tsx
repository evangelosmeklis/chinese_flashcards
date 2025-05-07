import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flashcard } from '@/components/flashcard';

interface FlashcardType {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
}

interface Deck {
  id: string;
  name: string;
  description?: string | null;
}

interface StudySessionProps {
  deck: Deck;
  flashcards: FlashcardType[];
  onComplete: (correct: number, incorrect: number) => Promise<void>;
}

type StudyMode = 'normal' | 'reverse' | 'meaningOnly';

export function StudySession({ deck, flashcards, onComplete }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);
  const [studyMode, setStudyMode] = useState<StudyMode>('normal');
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCard, setShowCard] = useState(true);

  // Initialize on component mount
  useEffect(() => {
    // Set mode to normal and shuffle cards on mount
    setStudyMode('normal');
    localStorage.setItem('studyMode', 'normal');
    
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [flashcards]);

  // When study mode changes, reset and reshuffle
  useEffect(() => {
    // Don't run this on first render
    if (shuffledCards.length === 0) return;
    
    // Save the mode to localStorage
    localStorage.setItem('studyMode', studyMode);
    
    // Reset and reshuffle
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsComplete(false);
  }, [studyMode]);

  const handleCardResult = (correct: boolean) => {
    if (correct) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    // If there are more cards, hide current card, wait, then show next card
    if (currentIndex < shuffledCards.length - 1) {
      setIsTransitioning(true);
      setShowCard(false);
      
      // Wait briefly before showing the next card
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        
        // Wait a bit more before showing the new card to ensure it's in the front state
        setTimeout(() => {
          setShowCard(true);
          setIsTransitioning(false);
        }, 50);
      }, 200);
    } else {
      // Session is complete
      setIsComplete(true);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(correctCount, incorrectCount);
    } catch (error) {
      console.error('Error saving study session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const restartSession = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsComplete(false);
    setShowCard(true);
  };

  // Helper function to set the study mode directly
  const setModeDirectly = (mode: StudyMode) => {
    console.log(`Setting mode to: ${mode}`);
    setStudyMode(mode);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Studying: {deck.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              {deck.description || 'No description provided.'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <Button 
              variant={studyMode === 'normal' ? 'default' : 'outline'}
              onClick={() => setModeDirectly('normal')}
              disabled={isSubmitting}
            >
              {studyMode === 'normal' ? '✓ ' : ''}Normal Mode
            </Button>
            <Button 
              variant={studyMode === 'reverse' ? 'default' : 'outline'}
              onClick={() => setModeDirectly('reverse')}
              disabled={isSubmitting}
            >
              {studyMode === 'reverse' ? '✓ ' : ''}Reverse Mode
            </Button>
            <Button 
              variant={studyMode === 'meaningOnly' ? 'default' : 'outline'}
              onClick={() => setModeDirectly('meaningOnly')}
              disabled={isSubmitting}
            >
              {studyMode === 'meaningOnly' ? '✓ ' : ''}Meaning Only
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            {studyMode === 'normal' && 'Shows Chinese character first, guess the meaning.'}
            {studyMode === 'reverse' && 'Shows meaning first, guess the Chinese character.'}
            {studyMode === 'meaningOnly' && 'Shows meaning only, guess both character and pronunciation.'}
          </div>
          
          <div className="flex justify-between mb-4">
            <div>
              <span className="font-medium">Progress:</span> {currentIndex + 1} / {shuffledCards.length}
            </div>
            <div className="flex gap-4">
              <div>
                <span className="font-medium text-green-600">Correct:</span> {correctCount}
              </div>
              <div>
                <span className="font-medium text-red-600">Incorrect:</span> {incorrectCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isComplete && shuffledCards.length > 0 ? (
        <div className="flex justify-center min-h-[400px]">
          {isTransitioning ? (
            <div className="flex items-center justify-center w-full max-w-lg">
              <div className="text-gray-500">Loading next card...</div>
            </div>
          ) : showCard ? (
            <Flashcard
              id={shuffledCards[currentIndex].id}
              character={shuffledCards[currentIndex].character}
              pinyin={shuffledCards[currentIndex].pinyin}
              meaning={shuffledCards[currentIndex].meaning}
              mode={studyMode}
              onResult={handleCardResult}
            />
          ) : null}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{correctCount}</div>
                  <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">{incorrectCount}</div>
                  <div className="text-sm text-gray-500">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {Math.round((correctCount / (correctCount + incorrectCount || 1)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={restartSession} disabled={isSubmitting}>
                  Restart Session
                </Button>
                <Button onClick={handleComplete} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Results'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 