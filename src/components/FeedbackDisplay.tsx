import React from 'react';
import { motion } from 'framer-motion';
import { useConversationStore } from '../store/useConversationStore';
import { Check, AlertCircle } from 'lucide-react';

const FeedbackDisplay: React.FC = () => {
  const { feedback } = useConversationStore();
  
  if (!feedback) {
    return null;
  }
  
  // Calculate overall score
  const overallScore = Math.round(
    (feedback.grammar + feedback.vocabulary + feedback.pronunciation + feedback.fluency) / 4
  );
  
  // Determine color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 9) return 'text-success-500';
    if (score >= 7) return 'text-primary-500';
    if (score >= 5) return 'text-warning-500';
    return 'text-error-500';
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-4 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Speaking Feedback</h3>
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Correction:</span>
        </div>
        <div className="bg-gray-50 rounded p-2 text-gray-800">
          {feedback.correctedText}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Grammar</span>
            <span className={`font-semibold ${getScoreColor(feedback.grammar)}`}>
              {feedback.grammar}/10
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full ${
                feedback.grammar >= 7 ? 'bg-primary-500' : 
                feedback.grammar >= 5 ? 'bg-warning-500' : 'bg-error-500'
              }`} 
              style={{ width: `${feedback.grammar * 10}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Vocabulary</span>
            <span className={`font-semibold ${getScoreColor(feedback.vocabulary)}`}>
              {feedback.vocabulary}/10
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full ${
                feedback.vocabulary >= 7 ? 'bg-primary-500' : 
                feedback.vocabulary >= 5 ? 'bg-warning-500' : 'bg-error-500'
              }`} 
              style={{ width: `${feedback.vocabulary * 10}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pronunciation</span>
            <span className={`font-semibold ${getScoreColor(feedback.pronunciation)}`}>
              {feedback.pronunciation}/10
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full ${
                feedback.pronunciation >= 7 ? 'bg-primary-500' : 
                feedback.pronunciation >= 5 ? 'bg-warning-500' : 'bg-error-500'
              }`} 
              style={{ width: `${feedback.pronunciation * 10}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Fluency</span>
            <span className={`font-semibold ${getScoreColor(feedback.fluency)}`}>
              {feedback.fluency}/10
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full ${
                feedback.fluency >= 7 ? 'bg-primary-500' : 
                feedback.fluency >= 5 ? 'bg-warning-500' : 'bg-error-500'
              }`} 
              style={{ width: `${feedback.fluency * 10}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Overall</h4>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
            <div 
              className={`h-3 rounded-full ${
                overallScore >= 8 ? 'bg-success-500' : 
                overallScore >= 6 ? 'bg-primary-500' : 
                overallScore >= 4 ? 'bg-warning-500' : 'bg-error-500'
              }`} 
              style={{ width: `${overallScore * 10}%` }}
            ></div>
          </div>
          <span className={`font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}/10
          </span>
        </div>
      </div>
      
      {feedback.suggestions.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Suggestions</h4>
          <ul className="text-sm">
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start mb-1">
                <span className="text-primary-500 mr-1 flex-shrink-0 mt-0.5">
                  <Check size={14} />
                </span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default FeedbackDisplay;