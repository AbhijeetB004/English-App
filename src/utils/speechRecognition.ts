// This is a utility to handle Web Speech API for speech recognition

let recognition: SpeechRecognition | null = null;
let isListening = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1500; // 1.5 seconds
const BACKOFF_MULTIPLIER = 1.5; // Increase delay with each retry

// Check if the browser supports the Web Speech API
export const isSpeechRecognitionSupported = (): boolean => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

// Initialize speech recognition
export const initSpeechRecognition = (): SpeechRecognition | null => {
  if (!isSpeechRecognitionSupported()) {
    console.error('Speech recognition is not supported in this browser');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  // Configure recognition settings
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;
  
  return recognition;
};

const retryRecognition = (
  onInterimResult: (transcript: string) => void,
  onFinalResult: (transcript: string) => void,
  onError: (error: string) => void
) => {
  if (retryCount < MAX_RETRIES) {
    const delay = RETRY_DELAY * Math.pow(BACKOFF_MULTIPLIER, retryCount);
    retryCount++;
    
    onError(`Reconnecting to speech service (attempt ${retryCount}/${MAX_RETRIES})...`);
    
    setTimeout(() => {
      if (recognition) {
        recognition.abort(); // Clean up existing instance
      }
      recognition = null; // Force new instance creation
      startRecognition(onInterimResult, onFinalResult, onError);
    }, delay);
  } else {
    onError('Speech recognition service unavailable. Please try again in a few moments.');
    retryCount = 0;
  }
};

// Start speech recognition
export const startRecognition = (
  onInterimResult: (transcript: string) => void,
  onFinalResult: (transcript: string) => void,
  onError: (error: string) => void
): void => {
  try {
    if (!recognition) {
      recognition = initSpeechRecognition();
      if (!recognition) {
        onError('Speech recognition could not be initialized');
        return;
      }
    }

    // Reset any existing recognition
    if (isListening) {
      stopRecognition();
    }

    // Set up recognition handlers
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
        .trim();
      
      const isFinal = event.results[event.results.length - 1].isFinal;
      
      if (isFinal) {
        retryCount = 0; // Reset retry count on successful recognition
        onFinalResult(transcript);
        stopRecognition();
      } else {
        onInterimResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error';
      let shouldRetry = false;
      
      switch (event.error) {
        case 'network':
          errorMessage = 'Network connectivity issue detected';
          shouldRetry = true;
          break;
        case 'service-not-allowed':
        case 'service-not-available':
          errorMessage = 'Speech service temporarily unavailable';
          shouldRetry = true;
          break;
        case 'not-allowed':
        case 'permission-denied':
          errorMessage = 'Microphone access denied. Please check your browser settings';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone detected or microphone is busy';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was interrupted';
          shouldRetry = true;
          break;
        default:
          errorMessage = 'Speech recognition encountered an issue';
          shouldRetry = true;
      }
      
      if (shouldRetry && isListening) {
        retryRecognition(onInterimResult, onFinalResult, onError);
      } else {
        retryCount = 0;
        onError(errorMessage);
      }
      
      stopRecognition();
    };

    recognition.onend = () => {
      isListening = false;
    };

    // Start recognition
    recognition.start();
    isListening = true;
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    onError('Failed to start speech recognition. Please refresh the page and try again.');
  }
};

// Stop speech recognition
export const stopRecognition = (): void => {
  if (recognition && isListening) {
    try {
      recognition.stop();
      isListening = false;
      retryCount = 0;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
};