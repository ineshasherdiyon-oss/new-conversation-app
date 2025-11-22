import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Mic, Volume2, VolumeX, AlertCircle, BookOpen, Square, Loader2, RotateCcw, CheckCircle, Save } from 'lucide-react';
import { generateChatResponse, transcribeAudio } from '../services/geminiService';
import { ChatMessage, Correction, Lesson, VocabularyWord } from '../types';
import { blobToBase64, getMimeType } from '../services/audioUtils';

const Roleplay: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State derived from navigation (if coming from Lessons page)
  const currentLesson = location.state?.lesson as Lesson | undefined;
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [sessionVocab, setSessionVocab] = useState<VocabularyWord[]>([]);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const initializedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Context based on Lesson
  useEffect(() => {
    if (initializedRef.current) return;
    
    if (currentLesson) {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: `Hello! Let's practice your lesson on "${currentLesson.title}". ${currentLesson.description} I'll start the conversation.`,
            timestamp: Date.now()
        }]);
    } else {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: "Hello! I'm your English practice partner. Shall we practice checking into a hotel today?",
            timestamp: Date.now()
        }]);
    }
    initializedRef.current = true;
  }, [currentLesson]);

  // --- TTS Helper ---
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any currently playing audio
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for learners
      
      // Optional: Try to select a better sounding English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang === 'en-US' && !v.name.includes('Microsoft')) || voices.find(v => v.lang === 'en-US');
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Voice Logic ---
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Audio recording is not supported in this browser.");
      return;
    }

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

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
        
        setIsTranscribing(true);
        try {
          const base64 = await blobToBase64(blob);
          const text = await transcribeAudio(base64, mimeType);
          
          if (text && typeof text === 'string') {
            const cleanedText = text.trim();
            if (cleanedText) {
              setInput(prev => {
                const newText = prev && prev.trim() ? `${prev.trim()} ${cleanedText}` : cleanedText;
                return newText;
              });
              // Auto-focus the textarea so user can send immediately
              setTimeout(() => textareaRef.current?.focus(), 100);
            }
          }
        } catch (error) {
          console.error("Transcription failed", error);
          alert("Failed to transcribe audio. Please try again.");
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Error", err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        alert("Microphone access denied. Please allow microphone permissions in your browser settings to use voice input.");
      } else {
        alert("Could not access microphone. Please check your device settings.");
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Tracks are stopped in onstop handler
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // --- Chat Logic ---

  const handleReset = () => {
    const hasUserMessages = messages.some(m => m.role === 'user');
    if (!hasUserMessages || window.confirm("Start a new conversation? Current history will be lost.")) {
      window.speechSynthesis.cancel();
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: currentLesson 
            ? `Let's start over with "${currentLesson.title}". Ready?`
            : "Hello! I'm your English practice partner. Shall we practice checking into a hotel today?",
          timestamp: Date.now()
        }
      ]);
      setInput('');
      setCorrections([]);
      setSessionVocab([]);
      setIsLessonComplete(false);
    }
  };

  const handleFinishLesson = () => {
      setIsLessonComplete(true);
  };

  const handleSaveAndExit = () => {
      // In a real app, save vocab to DB here
      alert(`Lesson Completed! Saved ${sessionVocab.length} new words to your vocabulary list.`);
      navigate('/lessons');
  };

  const handleSend = async () => {
    if (!input || typeof input !== 'string' || !input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setCorrections([]);

    try {
      const response = await generateChatResponse(messages, input, currentLesson);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.reply,
        timestamp: Date.now(),
        corrections: response.corrections,
        suggestedVocab: response.vocab
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (response.corrections.length > 0) {
        setCorrections(response.corrections);
      }

      if (response.vocab.length > 0) {
          // Deduplicate and add to session vocab
          setSessionVocab(prev => {
              const newIds = new Set(prev.map(v => v.word.toLowerCase()));
              const uniqueNew = response.vocab.filter(v => !newIds.has(v.word.toLowerCase()));
              return [...prev, ...uniqueNew];
          });
      }
      
      // Play the AI response if TTS is enabled
      if (isTtsEnabled) {
        speak(response.reply);
      }

    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] relative">
      {/* Completion Modal */}
      {isLessonComplete && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800">Lesson Completed!</h2>
                      <p className="text-slate-500">Great job practicing today.</p>
                  </div>

                  {sessionVocab.length > 0 && (
                      <div className="mb-6">
                          <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                              <BookOpen size={18} />
                              New Vocabulary
                          </h3>
                          <div className="bg-slate-50 rounded-xl p-3 max-h-40 overflow-y-auto border border-slate-100">
                              {sessionVocab.map((v, i) => (
                                  <div key={i} className="py-2 border-b border-slate-200 last:border-0">
                                      <span className="font-medium text-indigo-700 block">{v.word}</span>
                                      <span className="text-xs text-slate-500">{v.meaning}</span>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle size={14} />
                              <span>Added to SRS Review</span>
                          </div>
                      </div>
                  )}

                  <div className="flex gap-3">
                      <button 
                        onClick={() => setIsLessonComplete(false)}
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50"
                      >
                          Keep Talking
                      </button>
                      <button 
                        onClick={handleSaveAndExit}
                        className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                      >
                          <Save size={18} />
                          Save & Exit
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Chat Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 truncate max-w-[140px] sm:max-w-md">
              {currentLesson ? currentLesson.title : 'Hotel Check-in'}
          </h2>
          <div className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-md border w-fit mt-1">
              {currentLesson ? currentLesson.level : 'B1 Intermediate'}
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                className={`p-2 border rounded-lg transition-colors shadow-sm ${
                    isTtsEnabled 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' 
                    : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
                title={isTtsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
            >
                {isTtsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 text-sm transition-colors shadow-sm"
            title="Start New Conversation"
            >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">New Chat</span>
            </button>
            <button 
            onClick={handleFinishLesson}
            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-green-700 text-sm transition-colors shadow-sm"
            >
            <CheckCircle size={16} />
            <span className="hidden sm:inline">Finish</span>
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>
              {msg.role === 'model' && (
                <button 
                  onClick={() => speak(msg.text)}
                  className="mt-2 text-slate-400 hover:text-indigo-500 transition-colors"
                  title="Listen again"
                >
                  <Volume2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Live Feedback Area (if corrections exist) */}
      {corrections.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-2 text-amber-700 font-semibold text-sm">
            <AlertCircle size={16} />
            <span>Corrections</span>
          </div>
          <div className="space-y-2">
            {corrections.map((c, i) => (
              <div key={i} className="text-sm">
                <span className="text-red-500 line-through mr-2">{c.original}</span>
                <span className="text-green-600 font-medium">{c.correction}</span>
                <p className="text-xs text-slate-500 mt-1">{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-end gap-2 relative">
        {isTranscribing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 text-indigo-600 font-medium">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Transcribing...</span>
                </div>
            </div>
        )}

        <button 
          onClick={handleMicClick}
          className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 flex items-center gap-2 ${
            isRecording 
              ? 'bg-red-50 text-red-500 ring-2 ring-red-200' 
              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
          }`}
          title={isRecording ? "Stop recording" : "Start voice input"}
        >
          {isRecording ? (
              <>
                <Square size={24} fill="currentColor" />
                <span className="text-xs font-bold animate-pulse hidden md:block">REC</span>
              </>
          ) : (
              <Mic size={24} />
          )}
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Listening..." : "Type your message..."}
          className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 text-slate-800 placeholder:text-slate-400"
          rows={1}
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading || isRecording}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Roleplay;