import React, { useState } from 'react';
import { RotateCw, Check, X } from 'lucide-react';
import { VocabularyWord } from '../types';

const SAMPLE_VOCAB: VocabularyWord[] = [
  { id: '1', word: 'Serendipity', meaning: 'The occurrence of events by chance in a happy or beneficial way.', example: 'Finding my lost keys in the fridge was pure serendipity.', interval: 1, nextReview: 0 },
  { id: '2', word: 'Ephemeral', meaning: 'Lasting for a very short time.', example: 'Fashions are ephemeral, changing with every season.', interval: 0, nextReview: 0 },
  { id: '3', word: 'Resilient', meaning: 'Able to withstand or recover quickly from difficult conditions.', example: 'She is remarkably resilient and bounced back quickly from her illness.', interval: 2, nextReview: 0 },
];

const Vocabulary: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const currentCard = SAMPLE_VOCAB[currentIndex];
  const isFinished = currentIndex >= SAMPLE_VOCAB.length;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 200);
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <Check size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">All Caught Up!</h2>
        <p className="text-slate-500">You've reviewed all your words for today.</p>
        <button 
          onClick={() => setCurrentIndex(0)}
          className="mt-8 text-indigo-600 font-medium hover:underline"
        >
          Review Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Vocabulary Review</h2>
        <p className="text-slate-500 text-sm">Card {currentIndex + 1} of {SAMPLE_VOCAB.length}</p>
      </div>

      <div 
        className="relative w-full max-w-md h-80 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-lg border border-slate-200 flex flex-col items-center justify-center p-8">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">{currentCard.word}</h3>
            <p className="text-slate-400 text-sm">Tap to reveal meaning</p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-indigo-600 text-white rounded-3xl shadow-lg rotate-y-180 flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">{currentCard.word}</h3>
            <p className="text-lg mb-4 leading-relaxed">{currentCard.meaning}</p>
            <div className="bg-white/10 p-3 rounded-xl w-full">
              <p className="text-sm italic opacity-90">"{currentCard.example}"</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex gap-6">
        <button 
          onClick={handleNext}
          className="flex flex-col items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors group"
        >
          <div className="w-14 h-14 rounded-full border-2 border-amber-200 bg-amber-50 flex items-center justify-center group-hover:border-amber-300 group-hover:scale-110 transition-all">
            <X size={24} />
          </div>
          <span className="text-xs font-medium">Hard</span>
        </button>

        <button 
          onClick={handleNext}
          className="flex flex-col items-center gap-2 text-green-600 hover:text-green-700 transition-colors group"
        >
          <div className="w-14 h-14 rounded-full border-2 border-green-200 bg-green-50 flex items-center justify-center group-hover:border-green-300 group-hover:scale-110 transition-all">
            <Check size={24} />
          </div>
          <span className="text-xs font-medium">Easy</span>
        </button>
      </div>
    </div>
  );
};

export default Vocabulary;
