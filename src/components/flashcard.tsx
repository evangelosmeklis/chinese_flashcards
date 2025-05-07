import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FlashcardProps {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  mode: 'normal' | 'reverse' | 'meaningOnly';
  onResult: (correct: boolean) => void;
}

export function Flashcard({ 
  id, 
  character, 
  pinyin, 
  meaning, 
  mode, 
  onResult 
}: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  
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

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <Card 
        className={`w-full h-80 flex items-center justify-center cursor-pointer perspective-1000 transition-transform duration-500 ${flipped ? 'rotate-y-180' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        <CardContent className="w-full h-full flex items-center justify-center">
          <div className={`absolute backface-hidden transition-opacity duration-500 ${flipped ? 'opacity-0' : 'opacity-100'}`}>
            {frontContent}
          </div>
          <div className={`absolute backface-hidden rotate-y-180 transition-opacity duration-500 ${flipped ? 'opacity-100' : 'opacity-0'}`}>
            {backContent}
          </div>
        </CardContent>
      </Card>
      
      {flipped && (
        <div className="flex gap-4">
          <Button 
            variant="destructive" 
            onClick={() => {
              onResult(false);
              setFlipped(false);
            }}
          >
            Incorrect
          </Button>
          <Button 
            variant="default" 
            onClick={() => {
              onResult(true);
              setFlipped(false);
            }}
          >
            Correct
          </Button>
        </div>
      )}
    </div>
  );
} 