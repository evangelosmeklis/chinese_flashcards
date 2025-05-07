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

  // Shuffle cards on initial load or when study mode changes
  useEffect(() => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsComplete(false);
    
    // Save study mode to localStorage for the API
    localStorage.setItem('studyMode', studyMode);
  }, [flashcards, studyMode]);

  const handleCardResult = (correct: boolean) => {
    if (correct) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    // Move to next card
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
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
  };

  const changeMode = (mode: StudyMode) => {
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
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant={studyMode === 'normal' ? 'default' : 'outline'}
              onClick={() => changeMode('normal')}
              disabled={isSubmitting}
            >
              Normal Mode (Character → Meaning)
            </Button>
            <Button 
              variant={studyMode === 'reverse' ? 'default' : 'outline'}
              onClick={() => changeMode('reverse')}
              disabled={isSubmitting}
            >
              Reverse Mode (Meaning → Character)
            </Button>
            <Button 
              variant={studyMode === 'meaningOnly' ? 'default' : 'outline'}
              onClick={() => changeMode('meaningOnly')}
              disabled={isSubmitting}
            >
              Meaning Only (Meaning → Character+Pinyin)
            </Button>
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
        <div className="flex justify-center">
          <Flashcard
            id={shuffledCards[currentIndex].id}
            character={shuffledCards[currentIndex].character}
            pinyin={shuffledCards[currentIndex].pinyin}
            meaning={shuffledCards[currentIndex].meaning}
            mode={studyMode}
            onResult={handleCardResult}
          />
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