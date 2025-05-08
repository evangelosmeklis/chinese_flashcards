/**
 * Helper function to handle API responses
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || response.statusText || 'Something went wrong';
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

/**
 * Get all flashcards
 */
export async function getFlashcards() {
  const response = await fetch('/api/flashcards');
  return handleResponse<any[]>(response);
}

/**
 * Get a single flashcard by ID
 */
export async function getFlashcard(id: string) {
  const response = await fetch(`/api/flashcards/${id}`);
  return handleResponse<any>(response);
}

/**
 * Create a new flashcard
 */
export async function createFlashcard(data: {
  character: string;
  pinyin: string;
  meaning: string;
  tags?: string;
}) {
  const response = await fetch('/api/flashcards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<any>(response);
}

/**
 * Update a flashcard
 */
export async function updateFlashcard(
  id: string,
  data: {
    character?: string;
    pinyin?: string;
    meaning?: string;
    tags?: string;
  }
) {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<any>(response);
}

/**
 * Delete a flashcard
 */
export async function deleteFlashcard(id: string) {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<any>(response);
}

/**
 * Get all tags
 */
export async function getTags() {
  const response = await fetch('/api/tags');
  return handleResponse<any[]>(response);
}

/**
 * Get all decks
 */
export async function getDecks() {
  const response = await fetch('/api/decks');
  return handleResponse<any[]>(response);
}

/**
 * Get a single deck with its flashcards
 */
export async function getDeck(id: string) {
  const response = await fetch(`/api/decks/${id}`);
  return handleResponse<any>(response);
}

/**
 * Create a new deck
 */
export async function createDeck(data: {
  name: string;
  description?: string;
}) {
  const response = await fetch('/api/decks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<any>(response);
}

/**
 * Update a deck
 */
export async function updateDeck(
  id: string,
  data: {
    name?: string;
    description?: string;
  }
) {
  const response = await fetch(`/api/decks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<any>(response);
}

/**
 * Add a flashcard to a deck
 */
export async function addCardToDeck(deckId: string, flashcardId: string) {
  const response = await fetch(`/api/decks/${deckId}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ flashcardId }),
  });
  return handleResponse<any>(response);
}

/**
 * Remove a flashcard from a deck
 */
export async function removeCardFromDeck(deckId: string, flashcardId: string) {
  const response = await fetch(`/api/decks/${deckId}/cards/${flashcardId}`, {
    method: 'DELETE',
  });
  return handleResponse<any>(response);
}

/**
 * Add cards to a deck by tag
 */
export async function addCardsToDeckByTag(deckId: string, tag: string) {
  const response = await fetch(`/api/decks/${deckId}/cards/byTag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tag }),
  });
  return handleResponse<any>(response);
}

/**
 * Create a study session
 */
export async function createStudySession(data: {
  deckId: string;
  correct: number;
  incorrect: number;
  studyMode: string;
}) {
  const response = await fetch('/api/study-sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<any>(response);
}

/**
 * Get study sessions
 */
export async function getStudySessions() {
  const response = await fetch('/api/study-sessions');
  return handleResponse<any[]>(response);
}

/**
 * Get study sessions for a specific deck
 */
export async function getDeckStudySessions(deckId: string) {
  const response = await fetch(`/api/decks/${deckId}/study-sessions`);
  return handleResponse<any[]>(response);
} 