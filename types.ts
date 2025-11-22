export interface User {
  id: string;
  name: string;
  level: string;
  streak: number;
  xp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  corrections?: Correction[];
  suggestedVocab?: VocabularyWord[]; // New field to track vocab per message
  audioUrl?: string; // For playback
}

export interface Correction {
  original: string;
  correction: string;
  explanation: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  interval: number; // For SRS (0 = new, 1 = learned, etc.)
  nextReview: number; // Timestamp
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  content: string;
  imageUrl: string;
}

export interface PronunciationResult {
  score: number;
  transcription: string;
  feedback: string[];
  mistakes: { word: string; suggestion: string }[];
}

// Navigation types
export enum PageRoute {
  HOME = '/',
  ROLEPLAY = '/roleplay',
  PRONUNCIATION = '/pronunciation',
  VOCABULARY = '/vocabulary',
  LESSONS = '/lessons',
  PROFILE = '/profile'
}