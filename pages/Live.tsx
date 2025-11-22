import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, PhoneOff, Zap, Radio, Loader2, AlertCircle } from 'lucide-react';
import { base64ToUint8Array, arrayBufferToBase64, float32ToInt16PCM, downsampleBuffer } from '../services/audioUtils';

const Live: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [volume, setVolume] = useState(0); // For visualizer

  // Audio Contexts and Nodes
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Playback State
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session
  const sessionRef = useRef<any>(null);

  const stopAudio = () => {
    if (inputContextRef.current) {
      try { inputContextRef.current.close(); } catch (e) {}
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      try { outputContextRef.current.close(); } catch (e) {}
      outputContextRef.current = null;
    }
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch (e) {}
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      try { inputSourceRef.current.disconnect(); } catch (e) {}
      inputSourceRef.current = null;
    }
    if (sessionRef.current) {
        // Try to close session if method exists
        try { sessionRef.current.close(); } catch (e) {}
        sessionRef.current = null;
    }
    
    // Stop all playing sources
    audioSourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
    });
    audioSourcesRef.current.clear();
    
    setIsConnected(false);
    setStatus('idle');
    setVolume(0);
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      setErrorMessage('');

      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputContextRef.current = new AudioContextClass({ sampleRate: 24000 });

      // 2. Setup Audio Input Stream (Request Mic Permission)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error("Microphone permission error:", err);
        setErrorMessage("Microphone access denied. Please allow permissions in your browser settings.");
        setStatus('error');
        return;
      }
      
      if (!inputContextRef.current) throw new Error("Input context not initialized");
      
      inputSourceRef.current = inputContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current = inputContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;
      inputSourceRef.current.connect(analyserRef.current);
      
      // Create ScriptProcessor
      processorRef.current = inputContextRef.current.createScriptProcessor(4096, 1, 1);
      
      inputSourceRef.current.connect(processorRef.current);
      processorRef.current.connect(inputContextRef.current.destination);

      // 3. Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 4. Connect to Live API
      const config = {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
        systemInstruction: { 
          parts: [{ text: "You are a friendly, encouraging English tutor. Speak clearly and simply." }] 
        },
      };

      let resolveSession: (session: any) => void;
      const sessionPromise = new Promise<any>(resolve => {
        resolveSession = resolve;
      });

      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config,
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setIsConnected(true);
            setStatus('connected');
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && outputContextRef.current) {
              try {
                const pcmData = base64ToUint8Array(base64Audio);
                
                const dataInt16 = new Int16Array(pcmData.buffer);
                const audioBuffer = outputContextRef.current.createBuffer(1, dataInt16.length, 24000);
                const channelData = audioBuffer.getChannelData(0);
                for (let i = 0; i < dataInt16.length; i++) {
                   channelData[i] = dataInt16[i] / 32768.0;
                }
                
                const source = outputContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputContextRef.current.destination);
                
                const currentTime = outputContextRef.current.currentTime;
                if (nextStartTimeRef.current < currentTime) {
                    nextStartTimeRef.current = currentTime;
                }
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                
                source.onended = () => audioSourcesRef.current.delete(source);
                audioSourcesRef.current.add(source);

              } catch (e) {
                console.error("Error processing audio chunk", e);
              }
            }

            if (message.serverContent?.interrupted) {
                console.log("Model interrupted");
                audioSourcesRef.current.forEach(s => s.stop());
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Session Closed");
            stopAudio();
          },
          onerror: (err) => {
            console.error("Session Error", err);
            setErrorMessage("Connection to AI failed. Please try again.");
            setStatus('error');
            stopAudio();
          }
        }
      });
      
      sessionRef.current = session;
      resolveSession(session);

      // 5. Start Streaming Input
      // Guard against null processorRef (if stopAudio was called immediately by onError)
      if (processorRef.current) {
        processorRef.current.onaudioprocess = (e) => {
          if (isMuted) return;
          
          let inputData = e.inputBuffer.getChannelData(0);
          
          // Calculate volume for visualizer
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
          }
          setVolume(Math.sqrt(sum / inputData.length));

          // Handle sample rate mismatch (browsers use 44.1k or 48k usually, we need 16k)
          const currentSampleRate = inputContextRef.current?.sampleRate || 16000;
          if (currentSampleRate !== 16000) {
              inputData = downsampleBuffer(inputData, currentSampleRate, 16000);
          }

          const pcm16 = float32ToInt16PCM(inputData);
          const uint8 = new Uint8Array(pcm16.buffer);
          const base64 = arrayBufferToBase64(uint8.buffer);
          
          sessionPromise.then(sess => {
              if (sessionRef.current) { // Check if session still active
                 sess.sendRealtimeInput({
                    media: {
                        mimeType: "audio/pcm;rate=16000",
                        data: base64
                    }
                 });
              }
          });
        };
      }

    } catch (err) {
      console.error("Failed to start session", err);
      setErrorMessage("Failed to initialize audio. Check your microphone.");
      setStatus('error');
      stopAudio();
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] items-center justify-center bg-slate-50 relative overflow-hidden">
      
      <div className="absolute w-full h-full overflow-hidden z-0">
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob transition-transform duration-100 ${isConnected ? 'scale-150' : 'scale-100'}`}></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="z-10 text-center space-y-8">
        
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">
                {status === 'connected' ? 'Live Conversation' : 'Start Speaking'}
            </h2>
            <div className="text-slate-500 min-h-[24px]">
                {status === 'idle' && "Tap the microphone to start a call."}
                {status === 'connecting' && "Connecting to AI..."}
                {status === 'connected' && "Listening..."}
                {status === 'error' && (
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <AlertCircle size={16} />
                    <span>{errorMessage || "Connection failed."}</span>
                  </div>
                )}
            </div>
        </div>

        <div className="relative">
            {isConnected && (
                <>
                 <div 
                    className="absolute inset-0 bg-indigo-400 rounded-full opacity-20"
                    style={{ transform: `scale(${1 + volume * 5})` }}
                 />
                 <div 
                    className="absolute inset-0 bg-indigo-400 rounded-full opacity-10 delay-75"
                    style={{ transform: `scale(${1 + volume * 8})` }}
                 />
                </>
            )}

            <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                status === 'connected' ? 'bg-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
            }`}>
                {status === 'connected' ? (
                    <div className="flex gap-1 h-8 items-center">
                        <div className="w-1 bg-indigo-500 h-4 animate-[bounce_1s_infinite]"></div>
                        <div className="w-1 bg-indigo-500 h-8 animate-[bounce_1s_infinite_0.2s]"></div>
                        <div className="w-1 bg-indigo-500 h-6 animate-[bounce_1s_infinite_0.4s]"></div>
                        <div className="w-1 bg-indigo-500 h-8 animate-[bounce_1s_infinite_0.1s]"></div>
                        <div className="w-1 bg-indigo-500 h-4 animate-[bounce_1s_infinite_0.3s]"></div>
                    </div>
                ) : status === 'connecting' ? (
                    <Loader2 size={48} className="text-white animate-spin" />
                ) : (
                    <Radio size={48} className="text-white" />
                )}
            </div>
        </div>

        <div className="flex items-center gap-6">
            {!isConnected ? (
                <button 
                    onClick={startSession}
                    disabled={status === 'connecting'}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                    <Zap size={20} />
                    {status === 'error' ? 'Try Again' : 'Start Call'}
                </button>
            ) : (
                <>
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-800 shadow-md hover:bg-slate-50'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    
                    <button 
                        onClick={stopAudio}
                        className="bg-red-500 text-white p-6 rounded-full shadow-lg shadow-red-200 hover:bg-red-600 transition-transform hover:scale-105"
                    >
                        <PhoneOff size={32} />
                    </button>
                </>
            )}
        </div>
      </div>

      {status === 'idle' && (
        <div className="absolute bottom-8 text-slate-400 text-sm flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
             <Zap size={14} className="text-amber-500" />
             <span>Powered by Gemini 2.5 Flash Live API</span>
        </div>
      )}
    </div>
  );
};

export default Live;