import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const renameSchema = z.object({
  name: z.string().min(1, 'Deck name is required'),
});

type RenameFormValues = z.infer<typeof renameSchema>;

interface RenameDeckModalProps {
  deckId: string;
  currentName: string;
  isOpen: boolean;
  onClose: () => void;
  onRename: (deckId: string, name: string) => Promise<void>;
}

export function RenameDeckModal({
  deckId,
  currentName,
  isOpen,
  onClose,
  onRename,
}: RenameDeckModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      name: currentName,
    },
  });

  const handleFormSubmit = async (values: RenameFormValues) => {
    setIsSubmitting(true);
    try {
      await onRename(deckId, values.name);
      reset();
      onClose();
    } catch (error) {
      console.error('Error renaming deck:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Deck Name
              </label>
              <input
                id="name"
                {...register('name')}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Enter new deck name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 