import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useConversationStore } from '../store/useConversationStore';

const ListeningIndicator: React.FC = () => {
  const { speakingState } = useConversationStore();
  
  if (speakingState !== 'speaking') {
    return null;
  }
  
  const waveVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.6, 1, 0.6],
      transition: {
        repeat: Infinity,
        duration: 1.5,
      },
    },
  };
  
  return (
    <motion.div
      className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-secondary-100 text-secondary-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Volume2 size={16} />
      <span className="text-sm font-medium">Speaking</span>
      <div className="flex space-x-1 ml-1">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-3 bg-secondary-500 rounded-full"
            variants={waveVariants}
            animate="animate"
            custom={i}
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ListeningIndicator;