import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const deckSchema = z.object({
  name: z.string().min(1, 'Deck name is required'),
  description: z.string().optional(),
});

type DeckFormValues = z.infer<typeof deckSchema>;

interface DeckFormProps {
  onSubmit: (values: DeckFormValues) => Promise<void>;
}

export function DeckForm({ onSubmit }: DeckFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeckFormValues>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleFormSubmit = async (values: DeckFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      reset();
    } catch (error) {
      console.error('Error creating deck:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create New Deck</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Deck Name
            </label>
            <input
              id="name"
              {...register('name')}
              className="w-full p-2 border rounded-md"
              placeholder="e.g. HSK Level 1"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Enter a description for this deck"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Deck'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 