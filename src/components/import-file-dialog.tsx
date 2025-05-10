'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, FileJson, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';

interface ImportFileDialogProps {
  title: string;
  onImport: (data: any) => Promise<void>;
  buttonText?: string;
  acceptedFormats?: string;
}

export function ImportFileDialog({
  title,
  onImport,
  buttonText = 'Import',
  acceptedFormats = '.json',
}: ImportFileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file type
    if (!selectedFile.name.endsWith('.json')) {
      setError('Only JSON files are supported');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fileData = await file.text();
      let jsonData;
      
      try {
        jsonData = JSON.parse(fileData);
      } catch (e) {
        setError('Invalid JSON file. Please check the file format.');
        setIsLoading(false);
        return;
      }
      
      await onImport(jsonData);
      toast.success('Import successful');
      setIsOpen(false);
      setFile(null);
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import file');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileJson className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Select file</Label>
            <Input
              id="file"
              type="file"
              accept={acceptedFormats}
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">
              Only JSON files exported from HanziFive are supported
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isLoading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isLoading ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 