import React from 'react';
import { motion } from 'framer-motion';
import { Repeat, VolumeX, Trash2, HelpCircle } from 'lucide-react';
import { useConversationStore } from '../store/useConversationStore';
import { stopSpeaking } from '../utils/speechSynthesis';

interface ControlButtonsProps {
  onRepeatLast: () => void;
  onClearConversation: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({ onRepeatLast, onClearConversation }) => {
  const { speakingState, setSpeakingState, messages } = useConversationStore();
  
  const handleStopSpeaking = () => {
    stopSpeaking();
    setSpeakingState('idle');
  };
  
  const isLastMessageFromAssistant = messages.length > 0 && messages[messages.length - 1].role === 'assistant';
  
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <motion.button
        className={`flex items-center px-3 py-2 rounded-full text-sm font-medium
          ${isLastMessageFromAssistant 
            ? 'bg-primary-50 text-primary-700 hover:bg-primary-100' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        disabled={!isLastMessageFromAssistant}
        whileHover={isLastMessageFromAssistant ? { scale: 1.05 } : undefined}
        whileTap={isLastMessageFromAssistant ? { scale: 0.95 } : undefined}
        onClick={isLastMessageFromAssistant ? onRepeatLast : undefined}
      >
        <Repeat size={16} className="mr-1" />
        <span>Repeat</span>
      </motion.button>
      
      <motion.button
        className={`flex items-center px-3 py-2 rounded-full text-sm font-medium
          ${speakingState === 'speaking' 
            ? 'bg-error-50 text-error-700 hover:bg-error-100' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        disabled={speakingState !== 'speaking'}
        whileHover={speakingState === 'speaking' ? { scale: 1.05 } : undefined}
        whileTap={speakingState === 'speaking' ? { scale: 0.95 } : undefined}
        onClick={speakingState === 'speaking' ? handleStopSpeaking : undefined}
      >
        <VolumeX size={16} className="mr-1" />
        <span>Stop</span>
      </motion.button>
      
      <motion.button
        className="flex items-center px-3 py-2 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClearConversation}
      >
        <Trash2 size={16} className="mr-1" />
        <span>Clear</span>
      </motion.button>
      
      <motion.button
        className="flex items-center px-3 py-2 rounded-full bg-secondary-50 text-secondary-700 hover:bg-secondary-100 text-sm font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <HelpCircle size={16} className="mr-1" />
        <span>Help</span>
      </motion.button>
    </div>
  );
};

export default ControlButtons;