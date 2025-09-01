
import React, { useState, useEffect, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import VoiceSelector from './components/VoiceSelector';
import PersonaSelector from './components/PersonaSelector';
import SpeechRateSlider from './components/SpeechRateSlider';
import { BotIcon, SettingsIcon } from './components/icons';
import type { Message, Persona } from './types';
import { createChatSession, getChatResponse } from './services/geminiService';
import type { Chat } from '@google/genai';

const personaConfig = {
  pidgin: { 
    name: 'Baba', 
    greeting: "Ah, welcome. I be Baba, your wise OG from Lagos. Wetin dey your mind today? Ask anything, I dey for you." 
  },
  yoruba: { 
    name: 'Adebayo', 
    greeting: "E kaabo, omo daadaa. Oruko mi ni Adebayo, agba yin lati ilu Ibadan. Kini o fe so? Mo nreti re." 
  }
};

const findBestVoiceForPersona = (persona: Persona, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
  if (voices.length === 0) return undefined;

  if (persona === 'pidgin') {
    // Explicitly prioritize Nigerian English voice first for authenticity.
    return voices.find(v => v.lang === 'en-NG') ||
           voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('male')) ||
           voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('male'));
  }

  if (persona === 'yoruba') {
    return voices.find(v => v.lang === 'yo-NG');
  }

  return undefined;
};


const App: React.FC = () => {
  const [persona, setPersona] = useState<Persona>('pidgin');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const speak = useCallback((text: string) => {
    if (!selectedVoice || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported or no voice selected.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.pitch = 0.9;
    utterance.rate = speechRate;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, speechRate]);

  // Effect to handle chat session initialization and greetings when persona changes
  useEffect(() => {
    const newChat = createChatSession(persona);
    setChat(newChat);
    const greeting = personaConfig[persona].greeting;
    setMessages([{
      id: 'init',
      text: greeting,
      sender: 'ai'
    }]);
    setIsSettingsOpen(false); // Close settings on persona change
  }, [persona]);

  // Effect to load available system voices
  const loadVoices = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setAvailableVoices(voices);
    }
  }, []);

  useEffect(() => {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
        window.speechSynthesis.onvoiceschanged = null;
    }
  }, [loadVoices]);

  // Effect to automatically select the best voice based on persona
  useEffect(() => {
    if (availableVoices.length === 0) return;

    const bestVoice = findBestVoiceForPersona(persona, availableVoices);
    if (bestVoice) {
      setSelectedVoice(bestVoice);
      return;
    }

    // If no ideal voice, check if the current voice is still suitable, or find a fallback.
    setSelectedVoice(currentVoice => {
      if (persona === 'pidgin') {
        // For Pidgin, must be English. If current is not English, find a new fallback.
        if (currentVoice && currentVoice.lang.startsWith('en')) {
          return currentVoice;
        }
        return availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0] || null;
      }

      if (persona === 'yoruba') {
        // For Yoruba, any voice is a fallback. Keep current if it exists, otherwise find a default.
        if (currentVoice) {
          return currentVoice;
        }
        return availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0] || null;
      }
      
      // Should not be reached, but as a safe default, keep the current voice.
      return currentVoice;
    });
    
  }, [persona, availableVoices]);


  // Effect to automatically speak the latest AI message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'ai') {
      // Add a small delay for the initial greeting to allow the voice to be set.
      const delay = messages.length === 1 ? 150 : 0;
      setTimeout(() => speak(lastMessage.text), delay);
    }
  }, [messages, speak]);


  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !chat) return;

    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    window.speechSynthesis.cancel();

    try {
      const aiResponseText = await getChatResponse(chat, text);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorText = "Omo, something don cast. My brain no fit process that one now. Try again later.";
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 flex flex-col h-screen font-sans antialiased">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-green-400/20 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <BotIcon className="w-8 h-8 text-green-400" />
          <h1 className="text-xl font-bold tracking-wider">{`${personaConfig[persona].name} AI`}</h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Open voice settings"
          >
            <SettingsIcon className="w-6 h-6 text-gray-300" />
          </button>
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 z-10 space-y-4">
               <PersonaSelector
                currentPersona={persona}
                onSelectPersona={setPersona}
              />
              <SpeechRateSlider 
                rate={speechRate}
                onRateChange={setSpeechRate}
              />
              <VoiceSelector
                voices={availableVoices}
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
                persona={persona}
              />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onSpeak={speak}
          placeholder={`Ask ${personaConfig[persona].name} anything...`}
          persona={persona}
        />
      </main>
    </div>
  );
};

export default App;
