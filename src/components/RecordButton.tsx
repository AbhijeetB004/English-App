import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, StopCircle, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { useConversationStore } from '../store/useConversationStore';
import { startRecognition, stopRecognition, isSpeechRecognitionSupported } from '../utils/speechRecognition';

interface RecordButtonProps {
  onFinalTranscript: (transcript: string) => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onFinalTranscript }) => {
  const { 
    recordingState, 
    setRecordingState, 
    setCurrentTranscript 
  } = useConversationStore();
  
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);
    if (!supported) {
      setError('Speech recognition is not supported in your browser');
    }
  }, []);
  
  const handleStartRecording = () => {
    setError(null);
    setIsRetrying(false);
    setRecordingState('recording');
    
    startRecognition(
      (transcript) => {
        setCurrentTranscript(transcript);
      },
      (transcript) => {
        if (transcript.trim()) {
          onFinalTranscript(transcript);
        }
        setRecordingState('idle');
        setCurrentTranscript('');
        setIsRetrying(false);
      },
      (error) => {
        console.error(error);
        setError(error);
        setIsRetrying(error.includes('Reconnecting') || error.includes('attempt'));
        
        if (!error.includes('Reconnecting') && !error.includes('attempt')) {
          setRecordingState('idle');
          setCurrentTranscript('');
        }
      }
    );
  };
  
  const handleStopRecording = () => {
    stopRecognition();
    setRecordingState('idle');
    setCurrentTranscript('');
    setIsRetrying(false);
  };
  
  const isRecording = recordingState === 'recording';
  const isServiceError = error?.toLowerCase().includes('service');
  const isNetworkError = error?.toLowerCase().includes('network');
  const isPermissionError = error?.toLowerCase().includes('microphone') || 
                          error?.toLowerCase().includes('permission');
  
  if (!isSupported) {
    return (
      <div className="text-center">
        <div className="text-error-500 mb-2">
          <StopCircle size={28} />
        </div>
        <span className="text-sm text-error-500">
          Speech recognition not supported
        </span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      <motion.button
        className={`rounded-full p-4 flex items-center justify-center ${
          isRecording 
            ? 'bg-error-500 text-white' 
            : 'bg-primary-500 text-white'
        }`}
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        initial={{ scale: 1 }}
        animate={isRecording ? {
          scale: [1, 1.1, 1],
          transition: { repeat: Infinity, duration: 1.5 }
        } : {}}
        disabled={!isSupported}
      >
        {isRecording ? (
          <StopCircle size={28} />
        ) : (
          <Mic size={28} />
        )}
      </motion.button>
      
      <span className="mt-2 text-sm text-gray-600">
        {isRecording ? 'Stop Recording' : 'Start Speaking'}
      </span>
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-error-500">
          {isNetworkError && <WifiOff size={16} />}
          {isServiceError && <AlertCircle size={16} />}
          {isPermissionError && <StopCircle size={16} />}
          {isRetrying && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw size={16} />
            </motion.div>
          )}
          <span className="text-sm">
            {error}
          </span>
        </div>
      )}
    </div>
  );
};

export default RecordButton;