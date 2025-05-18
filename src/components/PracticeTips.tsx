import React from 'react';
import { motion } from 'framer-motion';
import { useConversationStore } from '../store/useConversationStore';
import { PracticeTip } from '../types';

const getTipColor = (focusArea: PracticeTip['focusArea']): string => {
  switch (focusArea) {
    case 'grammar':
      return 'bg-primary-50 text-primary-800';
    case 'vocabulary':
      return 'bg-secondary-50 text-secondary-800';
    case 'pronunciation':
      return 'bg-accent-50 text-accent-800';
    case 'fluency':
      return 'bg-success-50 text-success-800';
    default:
      return 'bg-gray-50 text-gray-800';
  }
};

const PracticeTips: React.FC = () => {
  const { feedback } = useConversationStore();

  if (!feedback?.practiceTips?.length) {
    return null;
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Personalized Practice Tips</h3>
      
      <div className="space-y-3">
        {feedback.practiceTips.map((tip, index) => (
          <motion.div
            key={index}
            className={`p-3 rounded-md ${getTipColor(tip.focusArea)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * index }}
          >
            <h4 className="font-medium mb-1">{tip.title}</h4>
            <p className="text-sm mb-2">{tip.description}</p>
            <div className="text-sm italic">
              <span className="font-medium">Example: </span>
              {tip.example}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PracticeTips; 