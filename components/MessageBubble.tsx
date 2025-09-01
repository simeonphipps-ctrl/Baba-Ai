
import React from 'react';
import { BotIcon, UserIcon, SpeakIcon } from './icons';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onSpeak: (text: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeak }) => {
  const isAI = message.sender === 'ai';

  const bubbleClasses = isAI
    ? 'bg-gray-700/80 text-gray-200 rounded-r-lg rounded-bl-lg'
    : 'bg-green-600/90 text-white rounded-l-lg rounded-br-lg';
  
  const containerClasses = isAI ? 'justify-start' : 'justify-end';
  const icon = isAI ? <BotIcon className="w-8 h-8 text-green-400 flex-shrink-0" /> : <UserIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />;
  const orderClass = isAI ? 'order-2' : 'order-1';
  const iconOrderClass = isAI ? 'order-1 mr-3' : 'order-2 ml-3';

  return (
    <div className={`flex items-start ${containerClasses}`}>
       <div className={iconOrderClass}>{icon}</div>
      <div className={`max-w-md lg:max-w-2xl px-4 py-3 ${bubbleClasses} ${orderClass}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
        {isAI && (
          <button 
            onClick={() => onSpeak(message.text)}
            className="mt-2 text-green-400 hover:text-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full p-1"
            aria-label="Read message aloud"
          >
            <SpeakIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
