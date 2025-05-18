import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import RecordButton from './components/RecordButton';
import ConversationDisplay from './components/ConversationDisplay';
import FeedbackDisplay from './components/FeedbackDisplay';
import PracticeTips from './components/PracticeTips';
import ListeningIndicator from './components/ListeningIndicator';
import ControlButtons from './components/ControlButtons';
import { useConversationStore } from './store/useConversationStore';
import { getAIFeedback, processVoiceCommand, generateAIResponse } from './services/ai';
import { speak, stopSpeaking } from './utils/speechSynthesis';

function App() {
  const { 
    messages, 
    addMessage, 
    setFeedback, 
    feedback, 
    setSpeakingState,
    clearConversation 
  } = useConversationStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle final transcript from the speech recognition
  const handleFinalTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    
    // Add user message to conversation
    addMessage('user', transcript);
    setIsProcessing(true);
    
    try {
      // Check if this is a voice command
      if (transcript.toLowerCase().startsWith("hey") || 
          transcript.toLowerCase().includes("repeat") ||
          transcript.toLowerCase().includes("explain") ||
          transcript.toLowerCase().includes("what is")) {
        
        const commandResponse = await processVoiceCommand(transcript);
        
        // Special command handling
        if (commandResponse === "COMMAND_REPEAT_LAST") {
          handleRepeatLast();
          setIsProcessing(false);
          return;
        }
        
        // Other commands result in an assistant response
        addMessage('assistant', commandResponse);
        setSpeakingState('speaking');
        speak(
          commandResponse, 
          () => {}, 
          () => setSpeakingState('idle')
        );
      } else {
        // Get AI feedback on user's English
        const feedbackData = await getAIFeedback(transcript);
        setFeedback(feedbackData);
        
        // Generate AI response
        const response = await generateAIResponse(transcript);
        addMessage('assistant', response);
        
        // Speak the response
        setSpeakingState('speaking');
        speak(
          response, 
          () => {}, 
          () => setSpeakingState('idle')
        );
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage, setFeedback, setSpeakingState]);
  
  // Handle repeating the last assistant message
  const handleRepeatLast = useCallback(() => {
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(message => message.role === 'assistant');
    
    if (lastAssistantMessage) {
      setSpeakingState('speaking');
      speak(
        lastAssistantMessage.content,
        () => {},
        () => setSpeakingState('idle')
      );
    }
  }, [messages, setSpeakingState]);
  
  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);
  
  // Handle clearing the conversation
  const handleClearConversation = () => {
    clearConversation();
    stopSpeaking();
    setSpeakingState('idle');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">English Conversation Practice</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Speak naturally and receive instant feedback on your grammar, vocabulary, pronunciation, and fluency.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-7 gap-6">
          <div className="md:col-span-4 space-y-4">
            <ConversationDisplay />
            
            <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center">
              <div className="mb-4 relative">
                <RecordButton onFinalTranscript={handleFinalTranscript} />
                <div className="absolute -top-2 -right-2">
                  <ListeningIndicator />
                </div>
              </div>
              
              <ControlButtons 
                onRepeatLast={handleRepeatLast}
                onClearConversation={handleClearConversation}
              />
              
              {isProcessing && (
                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <div className="animate-pulse h-2 w-2 bg-primary-500 rounded-full mr-1"></div>
                  <div className="animate-pulse h-2 w-2 bg-primary-500 rounded-full mx-1" style={{ animationDelay: '0.2s' }}></div>
                  <div className="animate-pulse h-2 w-2 bg-primary-500 rounded-full mx-1" style={{ animationDelay: '0.4s' }}></div>
                  <span className="ml-2">Processing your speech...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-3">
            <FeedbackDisplay />
            <PracticeTips />
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>SpeakFluent - Your AI English Learning Assistant</p>
        </div>
      </footer>
    </div>
  );
}

export default App;