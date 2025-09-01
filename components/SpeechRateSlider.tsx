
import React from 'react';

interface SpeechRateSliderProps {
  rate: number;
  onRateChange: (rate: number) => void;
}

const SpeechRateSlider: React.FC<SpeechRateSliderProps> = ({ rate, onRateChange }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="rate-slider" className="text-sm font-medium text-gray-300 flex justify-between items-center">
        <span>Speech Rate:</span>
        <span className="font-mono bg-gray-700 px-2 py-0.5 rounded text-xs">{rate.toFixed(1)}x</span>
      </label>
      <input
        id="rate-slider"
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={rate}
        onChange={(e) => onRateChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
        aria-label="Speech rate"
      />
    </div>
  );
};

export default SpeechRateSlider;
