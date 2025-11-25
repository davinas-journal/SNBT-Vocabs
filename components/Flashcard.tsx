import React, { useState, useEffect } from 'react';
import { VocabWord } from '../types';
import { Volume2, RotateCw } from 'lucide-react';

interface FlashcardProps {
  wordData: VocabWord;
  onFlip?: (isFlipped: boolean) => void;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ wordData, onFlip, isFlipped, setIsFlipped }) => {

  const handleFlip = () => {
    const newState = !isFlipped;
    setIsFlipped(newState);
    if (onFlip) onFlip(newState);
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(wordData.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className="w-full h-96 cursor-pointer perspective-1000 group"
      onClick={handleFlip}
    >
      <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT */}
        <div className="absolute w-full h-full backface-hidden rounded-3xl bg-white shadow-lg border-2 border-pastel-orange/30 flex flex-col items-center justify-center p-8">
            <div className="absolute top-4 right-4 bg-pastel-blue px-3 py-1 rounded-full text-xs font-bold text-gray-600">
                Level {wordData.level}
            </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{wordData.word}</h2>
          {wordData.phonetic && <span className="text-gray-400 font-mono mb-8">{wordData.phonetic}</span>}
          <p className="text-gray-400 text-sm animate-pulse mt-8">Tap to reveal</p>
        </div>

        {/* BACK */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-white shadow-xl border-2 border-pastel-green/30 flex flex-col items-center justify-center p-6 overflow-y-auto">
          
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{wordData.word}</h2>
            <button 
                onClick={playAudio}
                className="p-2 rounded-full bg-pastel-yellow hover:scale-110 transition-transform"
            >
                <Volume2 size={20} className="text-gray-700" />
            </button>
          </div>

          <div className="bg-pastel-orange/20 px-4 py-2 rounded-lg mb-4">
            <p className="text-lg font-semibold text-gray-700">{wordData.translation}</p>
          </div>

          <div className="w-full text-left space-y-3">
             <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Synonyms</span>
                <div className="flex flex-wrap gap-2 mt-1">
                    {wordData.synonyms.map((syn, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{syn}</span>
                    ))}
                </div>
             </div>

             <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Example</span>
                <p className="text-sm text-gray-600 italic mt-1 leading-relaxed">"{wordData.example}"</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
