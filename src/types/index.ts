export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface PracticeTip {
  title: string;
  description: string;
  example: string;
  focusArea: 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency';
}

export interface Feedback {
  correctedText: string;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  fluency: number;
  suggestions: string[];
  practiceTips: PracticeTip[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type RecordingState = 'idle' | 'recording' | 'processing';

export type SpeakingState = 'idle' | 'speaking';