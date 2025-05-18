// This is a utility to handle Web Speech API for speech synthesis

// Check if the browser supports the Web Speech API for synthesis
export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

// Speak the given text
export const speak = (
  text: string, 
  onStart?: () => void, 
  onEnd?: () => void, 
  voice?: SpeechSynthesisVoice
): void => {
  if (!isSpeechSynthesisSupported()) {
    console.error('Speech synthesis is not supported in this browser');
    return;
  }

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set the voice if provided
  if (voice) {
    utterance.voice = voice;
  } else {
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.includes('en-'));
    
    if (englishVoices.length > 0) {
      // Prefer female voices for a tutor-like experience
      const femaleVoice = englishVoices.find(v => v.name.includes('Female') || v.name.includes('female'));
      utterance.voice = femaleVoice || englishVoices[0];
    }
  }
  
  // Set a slightly slower rate for better comprehension
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  
  // Set callbacks
  if (onStart) {
    utterance.onstart = onStart;
  }
  
  if (onEnd) {
    utterance.onend = onEnd;
  }
  
  // Speak the text
  window.speechSynthesis.speak(utterance);
};

// Stop any ongoing speech
export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

// Get available voices
export const getVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }
  
  return window.speechSynthesis.getVoices();
};