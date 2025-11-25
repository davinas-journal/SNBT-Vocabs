export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  synonyms: string[];
  example: string;
  phonetic?: string; // Optional phonetic spelling
  level: number; // 0-5
  nextReviewDate: number; // Timestamp
  createdAt: number;
}

export enum ReviewAction {
  EASY = 'EASY',
  GOOD = 'GOOD',
  HARD = 'HARD'
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  mastered: number;
  reviewed: number;
}

export interface AppSettings {
  userName: string;
  dailyTarget: number;
  theme: 'default' | 'dark'; // We will stick to default pastel for now
  intervals: number[]; // [1, 3, 7, 14, 30]
}

export interface ReviewSessionSummary {
  totalReviewed: number;
  masteredCount: number; // Words that moved to max level
  hardCount: number;
  message: string;
}

// Gemini API Response Schema
export interface GeminiVocabResponse {
  translation: string;
  synonyms: string[];
  example: string;
  phonetic: string;
}
