import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

const flashcardSchema = z.object({
  character: z.string().min(1, 'Chinese character is required'),
  pinyin: z.string().min(1, 'Pinyin is required'),
  meaning: z.string().min(1, 'Meaning is required'),
  tags: z.string().optional(),
});

type FlashcardFormValues = z.infer<typeof flashcardSchema>;

interface FlashcardFormProps {
  onSubmit: (values: FlashcardFormValues) => Promise<void>;
  existingTags?: string[];
  flashcard?: {
    id: string;
    character: string;
    pinyin: string;
    meaning: string;
    tags: string[];
  };
  isEditing?: boolean;
  onCancel?: () => void;
}

const PinyinInput = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  const [inputValue, setInputValue] = useState(value);
  
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };
  
  const addCharacter = (char: string) => {
    const newValue = inputValue + char;
    setInputValue(newValue);
    onChange(newValue);
  };
  
  const toneButtons = [
    { vowel: 'a', chars: ['ā', 'á', 'ǎ', 'à'] },
    { vowel: 'e', chars: ['ē', 'é', 'ě', 'è'] },
    { vowel: 'i', chars: ['ī', 'í', 'ǐ', 'ì'] },
    { vowel: 'o', chars: ['ō', 'ó', 'ǒ', 'ò'] },
    { vowel: 'u', chars: ['ū', 'ú', 'ǔ', 'ù'] },
    { vowel: 'ü', chars: ['ǖ', 'ǘ', 'ǚ', 'ǜ'] },
  ];
  
  const helperChars = [
    { symbol: 'ü', label: 'ü' },
    { symbol: ' ', label: 'space' },
    { symbol: '-', label: 'hyphen' },
    { symbol: 'er', label: 'er' }
  ];
  
  return (
    <div className="space-y-2">
      <label htmlFor="pinyin-input" className="text-sm font-medium">
        Pinyin
      </label>
      <input
        id="pinyin-input"
        value={inputValue}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        placeholder="e.g. nǐ hǎo"
      />
      
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium">Pinyin Tone Marks</p>
          <span className="text-xs text-gray-500 dark:text-gray-400 italic">Click to add character</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {toneButtons.map(({ vowel, chars }) => (
            <div key={vowel} className="flex flex-col items-center border rounded-md p-1 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">{vowel}</span>
              <div className="flex gap-1">
                {chars.map((char, index) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => addCharacter(char)}
                    className="w-6 h-6 text-sm bg-white dark:bg-gray-700 border dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center justify-center"
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex flex-col items-center border rounded-md p-1 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">Other</span>
            <div className="flex gap-1">
              {helperChars.map(char => (
                <button
                  key={char.symbol}
                  type="button"
                  onClick={() => addCharacter(char.symbol)}
                  className="px-2 h-6 text-sm bg-white dark:bg-gray-700 border dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center justify-center whitespace-nowrap"
                >
                  {char.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function FlashcardForm({ 
  onSubmit, 
  existingTags = [], 
  flashcard, 
  isEditing = false,
  onCancel
}: FlashcardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [pinyinValue, setPinyinValue] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FlashcardFormValues>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      character: '',
      pinyin: '',
      meaning: '',
      tags: '',
    },
  });

  // Initialize form with existing flashcard data when editing
  useEffect(() => {
    if (flashcard) {
      console.log('Initializing form with flashcard:', flashcard);
      setValue('character', flashcard.character);
      setValue('pinyin', flashcard.pinyin);
      setPinyinValue(flashcard.pinyin);
      setValue('meaning', flashcard.meaning);
      
      // Ensure tags are properly initialized
      // Since the interface defines tags as string[], we assume it's always an array
      const validTags = flashcard.tags.filter(tag => tag && typeof tag === 'string' && tag.trim() !== '');
      setSelectedTags(validTags);
    }
  }, [flashcard, setValue]);

  // Update the form when pinyin changes in our custom component
  useEffect(() => {
    setValue('pinyin', pinyinValue, { shouldValidate: true });
  }, [pinyinValue, setValue]);

  const handleFormSubmit = async (values: FlashcardFormValues) => {
    setIsSubmitting(true);
    try {
      // Add selected tags to the form data - make sure we handle empty tags properly
      values.tags = selectedTags.length > 0 ? selectedTags.join(',') : '';
      console.log('Submitting form with values:', values);
      
      await onSubmit(values);
      
      if (!isEditing) {
        reset();
        setPinyinValue('');
        setSelectedTags([]);
      }
    } catch (error) {
      console.error('Error submitting flashcard:', error);
      if (error instanceof Error) {
        toast.error(`Failed to save flashcard: ${error.message}`);
      } else {
        toast.error('Failed to save flashcard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const selectExistingTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Flashcard' : 'Add New Flashcard'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="character" className="text-sm font-medium">
              Chinese Character
            </label>
            <input
              id="character"
              {...register('character')}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="e.g. 你好"
            />
            {errors.character && (
              <p className="text-sm text-red-500">{errors.character.message}</p>
            )}
          </div>

          {/* Custom Pinyin Input Component */}
          <PinyinInput 
            value={pinyinValue} 
            onChange={setPinyinValue} 
          />
          {errors.pinyin && (
            <p className="text-sm text-red-500">{errors.pinyin.message}</p>
          )}

          <div className="space-y-2">
            <label htmlFor="meaning" className="text-sm font-medium">
              Meaning
            </label>
            <input
              id="meaning"
              {...register('meaning')}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="e.g. Hello"
            />
            {errors.meaning && (
              <p className="text-sm text-red-500">{errors.meaning.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 p-2 border rounded-l-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Add a tag"
              />
              <Button type="button" onClick={addTag} disabled={!newTag}>
                Add
              </Button>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            {existingTags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Existing Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {existingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => selectExistingTag(tag)}
                      className={`px-2 py-1 rounded-full text-xs ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing && onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting 
                ? (isEditing ? 'Saving...' : 'Adding...') 
                : (isEditing ? 'Save Changes' : 'Add Flashcard')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 