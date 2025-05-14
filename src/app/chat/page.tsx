'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Shell } from '@/app/shell';
import { getFlashcards, sendChatMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Flashcard {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
}

interface ChatState {
  mode: 'chinese' | 'english';
  messages: Message[];
  waitingForResponse: boolean;
}

type ApiProvider = 'openai' | 'anthropic' | 'gemini' | 'none';

export default function ChatPage() {
  const [learningData, setLearningData] = useState<Flashcard[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatState, setChatState] = useState<ChatState>({
    mode: 'chinese',
    messages: [],
    waitingForResponse: false,
  });
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'characters'>('chat');
  
  // API Provider state
  const [apiProvider, setApiProvider] = useState<ApiProvider>('none');
  const [apiKey, setApiKey] = useState('');
  const [showApiDialog, setShowApiDialog] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load all flashcards the user has learned
    loadUserLearningData();
    
    // Load API settings from localStorage
    const savedProvider = localStorage.getItem('aiChatProvider') as ApiProvider | null;
    const savedKey = localStorage.getItem('aiChatApiKey');
    
    if (savedProvider && savedKey) {
      setApiProvider(savedProvider);
      setApiKey(savedKey);
    } else {
      // If no API key is set, show the dialog
      setShowApiDialog(true);
    }
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [chatState.messages]);
  
  const loadUserLearningData = async () => {
    setIsLoadingData(true);
    try {
      const data = await getFlashcards();
      setLearningData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading learning data:', err);
      setError('Failed to load learning data. Please try again later.');
    } finally {
      setIsLoadingData(false);
    }
  };
  
  const saveApiSettings = () => {
    if (apiProvider && apiKey) {
      localStorage.setItem('aiChatProvider', apiProvider);
      localStorage.setItem('aiChatApiKey', apiKey);
      setShowApiDialog(false);
      toast.success(`${getProviderName(apiProvider)} API key saved!`);
    } else {
      toast.error('Please select a provider and enter an API key');
    }
  };
  
  const getProviderName = (provider: ApiProvider): string => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Anthropic (Claude)';
      case 'gemini': return 'Google Gemini';
      default: return 'None';
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || chatState.waitingForResponse) return;
    
    if (apiProvider === 'none' || !apiKey) {
      toast.error('Please set up your AI provider API key first');
      setShowApiDialog(true);
      return;
    }
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      waitingForResponse: true,
    }));
    setInputValue('');
    
    try {
      // Send message to API using the new function
      const data = await sendChatMessage({
        message: userMessage.content,
        mode: chatState.mode,
        learningData: learningData,
        history: chatState.messages,
        provider: apiProvider,
        apiKey: apiKey,
      });
      
      // Add assistant response to chat
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: data.response }],
        waitingForResponse: false,
      }));
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to get response. Please check your API key and try again.');
      
      setChatState(prev => ({
        ...prev,
        waitingForResponse: false,
      }));
    }
  };
  
  const switchMode = (mode: 'chinese' | 'english') => {
    if (chatState.mode !== mode) {
      setChatState(prev => ({
        ...prev,
        mode,
        messages: [], // Clear messages when switching modes
      }));
    }
  };
  
  const resetChat = () => {
    setChatState(prev => ({
      ...prev,
      messages: [],
    }));
  };

  const handleCopyCharacters = () => {
    const characters = learningData.map(card => card.character).join('');
    navigator.clipboard.writeText(characters)
      .then(() => {
        toast.success('Characters copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy characters:', err);
        toast.error('Failed to copy characters to clipboard');
      });
  };
  
  const handleCopyWithMeanings = () => {
    const formatted = learningData.map(card => `${card.character} (${card.meaning})`).join(', ');
    navigator.clipboard.writeText(formatted)
      .then(() => {
        toast.success('Characters with meanings copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy characters with meanings:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleCopyStructured = () => {
    const formatted = learningData.map(card => 
      `Character: ${card.character}\nPinyin: ${card.pinyin}\nMeaning: ${card.meaning}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(formatted)
      .then(() => {
        toast.success('Structured data copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy structured data:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-bold">Chat with Your Chinese Assistant</h1>
            <p className="text-gray-500 mt-2">
              Practice your Chinese with an AI assistant using the characters you've learned.
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Learning Assistant</CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full mr-2 ${apiProvider !== 'none' && apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {apiProvider !== 'none' && apiKey 
                      ? `Using ${getProviderName(apiProvider)}`
                      : 'API Key Not Set'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowApiDialog(true)}
                  >
                    Configure API
                  </Button>
                </div>
              </div>
              <CardDescription>
                {error ? (
                  <span className="text-red-500">{error}</span>
                ) : isLoadingData ? (
                  'Loading your learning data...'
                ) : (
                  `Loaded ${learningData.length} characters you've learned`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="chat" 
                className="w-full"
                onValueChange={(value) => setActiveTab(value as 'chat' | 'characters')}
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="chat">Practice Chat</TabsTrigger>
                  <TabsTrigger value="characters">Learned Characters</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="space-y-4">
                  <Tabs defaultValue="chinese" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger 
                        value="chinese" 
                        onClick={() => switchMode('chinese')}
                      >
                        Chinese → English
                      </TabsTrigger>
                      <TabsTrigger 
                        value="english" 
                        onClick={() => switchMode('english')}
                      >
                        English → Chinese
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="chinese" className="space-y-4">
                      <p>
                        The assistant will give you Chinese sentences using only characters you've learned.
                        Try to translate them into English.
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="english" className="space-y-4">
                      <p>
                        The assistant will give you English sentences based on words you've learned.
                        Try to translate them into Chinese characters.
                      </p>
                    </TabsContent>
                    
                    <div className="border rounded-md p-4 mt-4 h-96 overflow-y-auto">
                      <div className="flex flex-col gap-4">
                        {chatState.messages.length === 0 ? (
                          <div className="text-center text-gray-400 my-auto">
                            {apiProvider !== 'none' && apiKey 
                              ? 'Start chatting to practice your Chinese!'
                              : 'Please set up your AI provider API key to start chatting'}
                          </div>
                        ) : (
                          chatState.messages.map((message, index) => (
                            <div 
                              key={index} 
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                  message.role === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 dark:bg-gray-800'
                                }`}
                              >
                                {message.content}
                              </div>
                            </div>
                          ))
                        )}
                        {chatState.waitingForResponse && (
                          <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800">
                              <div className="flex gap-2">
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                      <input
                        type="text"
                        placeholder={`Type your ${chatState.mode === 'chinese' ? 'English translation' : 'Chinese translation'}...`}
                        className="flex-1 p-2 border rounded-md"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={apiProvider === 'none' || !apiKey || chatState.waitingForResponse}
                      />
                      <Button 
                        type="submit" 
                        disabled={apiProvider === 'none' || !apiKey || !inputValue.trim() || chatState.waitingForResponse}
                      >
                        Send
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetChat}
                        disabled={chatState.messages.length === 0 || chatState.waitingForResponse}
                      >
                        Reset
                      </Button>
                    </form>
                  </Tabs>
                </TabsContent>
                
                <TabsContent value="characters" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Your Learned Characters</h3>
                      <p className="text-sm text-gray-500">
                        Here you can view and copy all the Chinese characters you've learned for use in external applications.
                      </p>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button onClick={handleCopyCharacters}>
                        Copy Characters Only
                      </Button>
                      <Button onClick={handleCopyWithMeanings} variant="outline">
                        Copy with Meanings
                      </Button>
                      <Button onClick={handleCopyStructured} variant="outline">
                        Copy Structured Data
                      </Button>
                    </div>
                    
                    <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800/50 min-h-[300px]">
                      {isLoadingData ? (
                        <div className="flex justify-center items-center h-full">
                          <p>Loading your learned characters...</p>
                        </div>
                      ) : learningData.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                          <p>You haven't learned any characters yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Characters Only</h4>
                            <div className="p-3 bg-white dark:bg-gray-900 border rounded-md text-lg break-all">
                              {learningData.map(card => card.character).join('')}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Characters with Meanings</h4>
                            <div className="p-3 bg-white dark:bg-gray-900 border rounded-md break-all">
                              {learningData.map((card, idx) => (
                                <span key={card.id} className="inline-block mb-2 mr-2">
                                  <span className="font-medium">{card.character}</span>
                                  <span className="text-gray-500 text-sm"> ({card.meaning})</span>
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Table View</h4>
                            <div className="border rounded-md overflow-auto max-h-[300px]">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Character</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pinyin</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Meaning</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                  {learningData.map(card => (
                                    <tr key={card.id}>
                                      <td className="px-4 py-3 text-lg">{card.character}</td>
                                      <td className="px-4 py-3">{card.pinyin}</td>
                                      <td className="px-4 py-3">{card.meaning}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Key Configuration Dialog */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure AI Provider</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select AI Provider</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
              >
                <option value="none">Select a provider</option>
                <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="gemini">Google Gemini</option>
              </select>
              <p className="text-xs text-gray-500">
                Select which AI provider you want to use for chat
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <input 
                type="password"
                className="w-full p-2 border rounded-md"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
              <p className="text-xs text-gray-500">
                Your API key is stored locally in your browser and never sent to our servers
              </p>
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowApiDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveApiSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
} 