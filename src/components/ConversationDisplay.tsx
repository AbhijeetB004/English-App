import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useConversationStore } from '../store/useConversationStore';
import { User, Bot } from 'lucide-react';

const ConversationDisplay: React.FC = () => {
  const { messages, currentTranscript, recordingState } = useConversationStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentTranscript]);
  
  if (messages.length === 0 && !currentTranscript) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Welcome to SpeakFluent</h3>
        <p className="text-gray-600 mb-4">
          Start speaking to practice your English. I'll provide feedback and help you improve your speaking skills.
        </p>
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md mx-auto max-w-md">
          <p className="mb-2 font-medium">Try saying:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>"Hello, how are you today?"</li>
            <li>"I want to improve my English speaking."</li>
            <li>"Can you help me practice conversation?"</li>
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 overflow-y-auto max-h-[60vh]">
      {messages.map((message) => (
        <motion.div
          key={message.id}
          className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className={`
              max-w-[80%] rounded-2xl px-4 py-3 flex items-start gap-2
              ${message.role === 'user' 
                ? 'bg-primary-50 text-gray-800' 
                : 'bg-white border border-gray-200 text-gray-800'
              }
            `}
          >
            {message.role === 'user' ? (
              <>
                <div>
                  <p>{message.content}</p>
                </div>
                <div className="min-w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ml-1">
                  <User size={16} className="text-primary-700" />
                </div>
              </>
            ) : (
              <>
                <div className="min-w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center mr-1">
                  <Bot size={16} className="text-accent-700" />
                </div>
                <div>
                  <p>{message.content}</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      ))}
      
      {/* Live transcription */}
      {currentTranscript && recordingState === 'recording' && (
        <motion.div 
          className="mb-4 flex justify-end"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-600 flex items-start gap-2">
            <div>
              <p>{currentTranscript}</p>
            </div>
            <div className="min-w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center ml-1">
              <User size={16} className="text-gray-600" />
            </div>
          </div>
        </motion.div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationDisplay;