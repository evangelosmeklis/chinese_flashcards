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