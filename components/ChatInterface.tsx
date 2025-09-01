import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { SendIcon, MicrophoneIcon } from './icons';
import type { Message, Persona } from '../types';

// Fix: Add definitions for Web Speech API to fix TypeScript error "Cannot find name 'SpeechRecognition'".
interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResult {
  [key: number]: { transcript: string };
}

interface SpeechRecognitionResultList {
  [key: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onSpeak: (text: string) => void;
  placeholder: string;
  persona: Persona;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, onSpeak, placeholder, persona }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fix: Cast window to any to access non-standard SpeechRecognition property to fix "Property 'SpeechRecognition' does not exist on type 'Window'".
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      const recognition: SpeechRecognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = persona === 'yoruba' ? 'yo-NG' : 'en-NG';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };
      
      recognitionRef.current = recognition;
    }
  }, [persona]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(inputText);
    setInputText('');
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInputText(''); // Clear text before starting new recording
      recognitionRef.current.start();
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onSpeak={onSpeak} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-700 p-3 rounded-lg flex items-center space-x-2">
                <span className="text-gray-400">Thinking...</span>
                <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 border-t border-green-400/20 pt-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholder}
            className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-200 placeholder-gray-500 transition-all"
            disabled={isLoading}
          />
          {isSpeechRecognitionSupported && (
             <button
                type="button"
                onClick={handleMicClick}
                disabled={isLoading}
                className={`p-3 rounded-full transition-colors transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'} disabled:bg-gray-600 disabled:cursor-not-allowed`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                <MicrophoneIcon className="w-6 h-6" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-green-500 text-gray-900 p-3 rounded-full hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;