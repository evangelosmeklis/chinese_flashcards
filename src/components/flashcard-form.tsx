import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

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
}

export function FlashcardForm({ onSubmit, existingTags = [] }: FlashcardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    reset,
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

  const handleFormSubmit = async (values: FlashcardFormValues) => {
    setIsSubmitting(true);
    try {
      // Add selected tags to the form data
      values.tags = selectedTags.join(',');
      await onSubmit(values);
      reset();
      setSelectedTags([]);
    } catch (error) {
      console.error('Error submitting flashcard:', error);
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
        <CardTitle>Add New Flashcard</CardTitle>
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
              className="w-full p-2 border rounded-md"
              placeholder="e.g. 你好"
            />
            {errors.character && (
              <p className="text-sm text-red-500">{errors.character.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="pinyin" className="text-sm font-medium">
              Pinyin
            </label>
            <input
              id="pinyin"
              {...register('pinyin')}
              className="w-full p-2 border rounded-md"
              placeholder="e.g. nǐ hǎo"
            />
            {errors.pinyin && (
              <p className="text-sm text-red-500">{errors.pinyin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="meaning" className="text-sm font-medium">
              Meaning
            </label>
            <input
              id="meaning"
              {...register('meaning')}
              className="w-full p-2 border rounded-md"
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
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 p-2 border rounded-md"
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
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
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
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Flashcard'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 