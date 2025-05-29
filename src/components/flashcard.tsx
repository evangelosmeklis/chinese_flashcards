import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { addIncorrectCardsToReviseDeck, updateReviseCardStreak } from '@/lib/api';
import toast from 'react-hot-toast';

interface FlashcardProps {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  mode: 'normal' | 'reverse' | 'meaningOnly';
  onResult: (correct: boolean) => void;
  deckId?: string;
}

export function Flashcard({ 
  id, 
  character, 
  pinyin, 
  meaning, 
  mode, 
  onResult,
  deckId
}: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  
  // Reset flipped state when the id changes (new card)
  useEffect(() => {
    setFlipped(false);
  }, [id]);
  
  // Determine what to show on front and back based on mode
  let frontContent: React.ReactNode;
  let backContent: React.ReactNode;

  switch (mode) {
    case 'normal':
      frontContent = <div className="text-6xl">{character}</div>;
      backContent = (
        <div className="flex flex-col gap-4 items-center">
          <div className="text-xl">{pinyin}</div>
          <div className="text-2xl">{meaning}</div>
        </div>
      );
      break;
    case 'reverse':
      frontContent = (
        <div className="flex flex-col gap-4 items-center">
          <div className="text-xl">{pinyin}</div>
          <div className="text-2xl">{meaning}</div>
        </div>
      );
      backContent = <div className="text-6xl">{character}</div>;
      break;
    case 'meaningOnly':
      frontContent = <div className="text-2xl">{meaning}</div>;
      backContent = (
        <div className="flex flex-col gap-4 items-center">
          <div className="text-6xl">{character}</div>
          <div className="text-xl">{pinyin}</div>
        </div>
      );
      break;
  }

  const handleResult = async (correct: boolean) => {
    // If this is the "total words" deck and the guess was incorrect, add to revise deck
    if (!correct && deckId && deckId === 'cmae55a8v000250u6eyek9mwo') {
      try {
        await addIncorrectCardsToReviseDeck(id);
      } catch (error) {
        console.error('Error adding card to revise deck:', error);
      }
    }
    
    // If this is the revise deck, update streak
    if (deckId) {
      const reviseDeck = await fetch(`/api/decks?name=revise`).then(res => res.json()).then(decks => decks[0]);
      if (reviseDeck && deckId === reviseDeck.id) {
        try {
          const result = await updateReviseCardStreak(id, correct);
          if (result.cardRemoved) {
            toast.success("Card mastered and removed from revise deck!");
          }
        } catch (error) {
          console.error('Error updating revise card streak:', error);
        }
      }
    }
    
    // Call the original onResult handler
    onResult(correct);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="w-full perspective-1000">
        <div 
          className={`relative w-full h-80 cursor-pointer transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front side */}
          <Card className="absolute w-full h-full backface-hidden">
            <CardContent className="flex items-center justify-center h-full">
              {frontContent}
            </CardContent>
          </Card>
          
          {/* Back side */}
          <Card className="absolute w-full h-full backface-hidden rotate-y-180">
            <CardContent className="flex items-center justify-center h-full">
              {backContent}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {flipped && (
        <div className="flex gap-4">
          <Button 
            variant="destructive" 
            onClick={() => handleResult(false)}
          >
            Incorrect
          </Button>
          <Button 
            variant="default" 
            onClick={() => handleResult(true)}
          >
            Correct
          </Button>
        </div>
      )}
    </div>
  );
} 