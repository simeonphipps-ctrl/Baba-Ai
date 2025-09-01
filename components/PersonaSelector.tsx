import React from 'react';
import type { Persona } from '../types';

interface PersonaSelectorProps {
  currentPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ currentPersona, onSelectPersona }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-300">
        Select AI Persona:
      </label>
      <div className="flex space-x-2">
        <button
          onClick={() => onSelectPersona('pidgin')}
          className={`flex-1 p-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 ${
            currentPersona === 'pidgin'
              ? 'bg-green-500 text-gray-900 font-bold'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Pidgin (Baba)
        </button>
        <button
          onClick={() => onSelectPersona('yoruba')}
          className={`flex-1 p-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 ${
            currentPersona === 'yoruba'
              ? 'bg-green-500 text-gray-900 font-bold'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Yoruba (Adebayo)
        </button>
      </div>
    </div>
  );
};

export default PersonaSelector;
