import { create } from 'zustand';
import { Message, Feedback, RecordingState, SpeakingState } from '../types';

interface ConversationState {
  messages: Message[];
  recordingState: RecordingState;
  speakingState: SpeakingState;
  currentTranscript: string;
  feedback: Feedback | null;
  
  addMessage: (role: Message['role'], content: string) => void;
  setRecordingState: (state: RecordingState) => void;
  setSpeakingState: (state: SpeakingState) => void;
  setCurrentTranscript: (transcript: string) => void;
  setFeedback: (feedback: Feedback | null) => void;
  clearConversation: () => void;
}

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],
  recordingState: 'idle',
  speakingState: 'idle',
  currentTranscript: '',
  feedback: null,
  
  addMessage: (role, content) => set((state) => ({
    messages: [
      ...state.messages,
      {
        id: generateId(),
        role,
        content,
        timestamp: new Date(),
      },
    ],
    // Clear transcript after adding a user message
    currentTranscript: role === 'user' ? '' : state.currentTranscript,
  })),
  
  setRecordingState: (recordingState) => set({ recordingState }),
  
  setSpeakingState: (speakingState) => set({ speakingState }),
  
  setCurrentTranscript: (currentTranscript) => set({ currentTranscript }),
  
  setFeedback: (feedback) => set({ feedback }),
  
  clearConversation: () => set({ 
    messages: [],
    feedback: null,
    currentTranscript: '',
  }),
}));