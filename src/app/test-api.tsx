'use client';

import { useState, useEffect } from 'react';
import { getDecks } from '@/lib/api';

export default function TestApi() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Testing API call to /api/decks');
      const data = await getDecks();
      console.log('API response:', data);
      setResult(data);
    } catch (err) {
      console.error('API call failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">API Test</h1>
      
      <div className="mb-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={testAPI}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Test API'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Response:</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 