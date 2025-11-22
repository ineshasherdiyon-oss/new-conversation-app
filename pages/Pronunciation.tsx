import React, { useState, useRef } from 'react';
import { Mic, Square, RotateCcw, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { blobToBase64, getMimeType } from '../services/audioUtils';
import { evaluatePronunciation } from '../services/geminiService';
import { PronunciationResult } from '../types';

const Pronunciation: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        handleAnalysis(blob, mimeType);
      };

      recorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleAnalysis = async (blob: Blob, mimeType: string) => {
    setIsAnalyzing(true);
    try {
      const base64 = await blobToBase64(blob);
      const analysis = await evaluatePronunciation(base64, mimeType);
      setResult(analysis);
    } catch (error) {
      console.error("Analysis Failed", error);
      alert("Failed to analyze audio. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Pronunciation Drill</h1>
        <p className="text-slate-500">Read the sentence aloud clearly.</p>
      </header>

      {/* Challenge Card */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
        <p className="text-2xl md:text-3xl font-serif text-slate-700 leading-relaxed">
          "The quick brown fox jumps over the lazy dog."
        </p>
        <div className="mt-6 flex justify-center gap-4">
          {!isRecording && !audioUrl && (
            <button 
              onClick={startRecording}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <Mic size={24} />
              Record
            </button>
          )}

          {isRecording && (
            <button 
              onClick={stopRecording}
              className="flex items-center gap-2 bg-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-red-600 transition-all animate-pulse"
            >
              <Square size={24} fill="currentColor" />
              Stop
            </button>
          )}

          {audioUrl && !isRecording && (
            <div className="flex gap-2">
              <button 
                onClick={() => new Audio(audioUrl).play()}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-full font-medium hover:bg-slate-200"
              >
                <Play size={20} />
                Play
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-full font-medium hover:bg-slate-200"
              >
                <RotateCcw size={20} />
                Retry
              </button>
            </div>
          )}
        </div>
        
        {isAnalyzing && (
          <p className="mt-4 text-slate-500 animate-pulse">Analyzing your pronunciation...</p>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-8 space-y-6">
          {/* Score Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">Overall Score</h3>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                  {result.score}
                </span>
                <span className="text-slate-400">/100</span>
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              {result.score >= 80 ? <CheckCircle className="text-green-500" size={32} /> : <AlertCircle className="text-amber-500" size={32} />}
            </div>
          </div>

          {/* Transcription */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-2">What I heard:</h3>
            <p className="text-slate-600 italic">"{result.transcription}"</p>
          </div>

          {/* Feedback */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-indigo-500" />
                Improvements
              </h3>
              <ul className="space-y-3">
                {result.feedback.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600">
                    <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">Specific Mistakes</h3>
              {result.mistakes.length === 0 ? (
                <p className="text-slate-500 text-sm">No specific mistakes detected. Great job!</p>
              ) : (
                <div className="space-y-3">
                  {result.mistakes.map((mistake, i) => (
                    <div key={i} className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-red-700 font-medium">{mistake.word}</span>
                      </div>
                      <p className="text-xs text-red-600">Try: {mistake.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pronunciation;
