
import React, { useMemo } from 'react';
import type { Persona } from '../types';

interface VoiceSelectorProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onSelectVoice: (voice: SpeechSynthesisVoice) => void;
  persona: Persona;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedVoice, onSelectVoice, persona }) => {
  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoiceName = event.target.value;
    const voice = voices.find(v => v.name === selectedVoiceName);
    if (voice) {
      onSelectVoice(voice);
    }
  };

  const filteredVoices = useMemo(() => {
    if (persona === 'pidgin') {
      return voices.filter(v => v.lang.startsWith('en'));
    }
    if (persona === 'yoruba') {
      // Show Yoruba and English voices, prioritizing Yoruba
      const yorubaVoices = voices.filter(v => v.lang.startsWith('yo'));
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      return [...yorubaVoices, ...englishVoices];
    }
    return voices;
  }, [voices, persona]);

  const showYorubaWarning = persona === 'yoruba' && selectedVoice && !selectedVoice.lang.startsWith('yo');

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="voice-select" className="text-sm font-medium text-gray-300">
        Select AI Voice:
      </label>
      <select
        id="voice-select"
        value={selectedVoice ? selectedVoice.name : ''}
        onChange={handleVoiceChange}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        {filteredVoices.map(voice => (
          <option key={voice.name} value={voice.name}>
            {`${voice.name} (${voice.lang})`}
          </option>
        ))}
      </select>
      {filteredVoices.length === 0 && <p className="text-xs text-gray-400">No suitable voices found for this persona.</p>}
      <p className="text-xs text-yellow-400 mt-1">
        {showYorubaWarning 
          ? "Warning: A Yoruba (yo-NG) voice is not available. The selected voice will likely mispronounce Yoruba text."
          : null
        }
      </p>
    </div>
  );
};

export default VoiceSelector;
