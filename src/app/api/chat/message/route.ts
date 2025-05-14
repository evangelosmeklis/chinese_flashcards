import { NextRequest, NextResponse } from 'next/server';

interface Flashcard {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  mode: 'chinese' | 'english';
  learningData: Flashcard[];
  history: Message[];
  provider: 'openai' | 'anthropic' | 'gemini' | 'none';
  apiKey: string;
}

// Helper function to generate the system prompt based on mode and learning data
function generateSystemPrompt(
  mode: 'chinese' | 'english',
  characters: string[],
  meanings: string[],
  pinyins: string[],
  chatHistoryText: string
): string {
  if (mode === 'chinese') {
    return `You are a Chinese language tutor helping a student practice Chinese.
The student is learning the following Chinese characters: ${characters.join(', ')}
Their meanings are: ${meanings.join(', ')}
Their pinyins are: ${pinyins.join(', ')}

IMPORTANT RULES:
1. When generating sentences, ONLY use the Chinese characters the student has learned (listed above).
2. Generate short, simple sentences using only these characters.
3. When the user responds with a translation, carefully verify their answer:
   - First, provide the correct translation of the Chinese sentence you gave
   - Then, compare their answer to the correct translation
   - If they are substantially correct (even if not word-for-word), praise them
   - If they are partially correct, acknowledge what they got right and correct what they missed
   - If they are incorrect, politely explain the correct translation
4. After each response, provide a new sentence for them to translate.
5. Be encouraging and supportive.
6. Do NOT use any Chinese characters that are not in the list above.
7. Keep your responses concise and focused on the language practice.
8. Be accurate in your evaluation - do not say a translation is correct when it isn't.

Chat history:
${chatHistoryText}

Now, respond to the user's latest message. If this is the start of the conversation, begin by introducing yourself briefly and give the student a simple Chinese sentence to translate to English using only the characters they know.`;
  } else {
    return `You are a Chinese language tutor helping a student practice Chinese.
The student is learning the following Chinese characters: ${characters.join(', ')}
Their meanings are: ${meanings.join(', ')}
Their pinyins are: ${pinyins.join(', ')}

IMPORTANT RULES:
1. When generating sentences in English, only use concepts and words that can be translated using the Chinese characters the student has learned.
2. Generate short, simple English sentences that the student should try to write using Chinese characters.
3. When the user responds with Chinese characters, carefully verify their answer:
   - First, determine what the correct Chinese characters would be for the English prompt
   - Then, compare their answer to the correct characters
   - If they used the correct characters (even if the order might be slightly different but still grammatical), praise them
   - If they used some correct characters but missed others, acknowledge what they got right and provide the correct full answer
   - If their answer is incorrect, politely explain the correct characters to use
4. After each response, provide a new English sentence for them to translate to Chinese.
5. Be encouraging and supportive.
6. Make sure any corrections you provide only use characters from the list above.
7. Keep your responses concise and focused on the language practice.
8. Be accurate in your evaluation - do not say a translation is correct when it isn't.

Chat history:
${chatHistoryText}

Now, respond to the user's latest message. If this is the start of the conversation, begin by introducing yourself briefly and give the student a simple English sentence to translate to Chinese using only the characters they know.`;
  }
}

async function callOpenAI(message: string, systemPrompt: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(message: string, systemPrompt: string, apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      system: systemPrompt,
      messages: [
        { role: 'user', content: message }
      ],
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGemini(message: string, systemPrompt: string, apiKey: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n${message}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, mode, learningData, history, provider, apiKey } = body;
    
    if (!message || !mode || !learningData || !provider || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Extract characters and meanings from the learning data
    const characters = learningData.map(card => card.character);
    const meanings = learningData.map(card => card.meaning);
    const pinyins = learningData.map(card => card.pinyin);
    
    // Convert chat history to a format suitable for the system prompt
    const chatHistoryText = history
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    // Generate the system prompt
    const systemPrompt = generateSystemPrompt(
      mode,
      characters,
      meanings,
      pinyins,
      chatHistoryText
    );
    
    try {
      let response: string;
      
      // Call the appropriate API based on provider
      switch (provider) {
        case 'openai':
          response = await callOpenAI(message, systemPrompt, apiKey);
          break;
        case 'anthropic':
          response = await callAnthropic(message, systemPrompt, apiKey);
          break;
        case 'gemini':
          response = await callGemini(message, systemPrompt, apiKey);
          break;
        default:
          throw new Error('Invalid provider selected');
      }
      
      return NextResponse.json({ response }, { status: 200 });
    } catch (error) {
      console.error('API provider error:', error);
      return NextResponse.json(
        { error: `Error from AI provider: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 