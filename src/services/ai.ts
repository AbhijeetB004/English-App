import { GoogleGenerativeAI } from '@google/generative-ai';
import { Feedback, Message } from '../types';

const genAI = new GoogleGenerativeAI('AIzaSyDsCocYfuUvKQk2FM-RkC-rx7PSIAU9uRE');
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

// Store conversation context
let conversationContext: {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  lastFeedback: Feedback | null;
  conversationHistory: Message[];
  scoreHistory: {
    grammar: number[];
    vocabulary: number[];
    pronunciation: number[];
    fluency: number[];
  };
  averageScores: {
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    fluency: number;
  };
  commonErrors: {
    grammar: string[];
    vocabulary: string[];
    pronunciation: string[];
    fluency: string[];
  };
} = {
  userLevel: 'beginner',
  topics: [],
  lastFeedback: null,
  conversationHistory: [],
  scoreHistory: {
    grammar: [],
    vocabulary: [],
    pronunciation: [],
    fluency: []
  },
  averageScores: {
    grammar: 0,
    vocabulary: 0,
    pronunciation: 0,
    fluency: 0
  },
  commonErrors: {
    grammar: [],
    vocabulary: [],
    pronunciation: [],
    fluency: []
  }
};

// Function to calculate average scores
const calculateAverageScores = (): void => {
  const { scoreHistory } = conversationContext;
  
  conversationContext.averageScores = {
    grammar: scoreHistory.grammar.length > 0 
      ? scoreHistory.grammar.reduce((a, b) => a + b, 0) / scoreHistory.grammar.length 
      : 0,
    vocabulary: scoreHistory.vocabulary.length > 0 
      ? scoreHistory.vocabulary.reduce((a, b) => a + b, 0) / scoreHistory.vocabulary.length 
      : 0,
    pronunciation: scoreHistory.pronunciation.length > 0 
      ? scoreHistory.pronunciation.reduce((a, b) => a + b, 0) / scoreHistory.pronunciation.length 
      : 0,
    fluency: scoreHistory.fluency.length > 0 
      ? scoreHistory.fluency.reduce((a, b) => a + b, 0) / scoreHistory.fluency.length 
      : 0
  };
};

// Function to determine user level based on average scores and progress
const determineUserLevel = (): 'beginner' | 'intermediate' | 'advanced' => {
  const { averageScores, scoreHistory } = conversationContext;
  const overallAverage = (
    averageScores.grammar + 
    averageScores.vocabulary + 
    averageScores.pronunciation + 
    averageScores.fluency
  ) / 4;

  // Check for consistent improvement over last 5 interactions
  const hasImprovement = (category: keyof typeof scoreHistory): boolean => {
    const scores = scoreHistory[category].slice(-5);
    if (scores.length < 5) return false;
    
    let improving = true;
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] < scores[i - 1] - 1) { // Allow small fluctuations
        improving = false;
        break;
      }
    }
    return improving;
  };

  const consistentImprovement = ['grammar', 'vocabulary', 'pronunciation', 'fluency']
    .some(category => hasImprovement(category as keyof typeof scoreHistory));

  if (overallAverage >= 8 || (overallAverage >= 7 && consistentImprovement)) return 'advanced';
  if (overallAverage >= 6 || (overallAverage >= 5 && consistentImprovement)) return 'intermediate';
  return 'beginner';
};

// Function to analyze common errors and patterns
const analyzeErrors = (userInput: string, correctedText: string): void => {
  const errors = {
    grammar: [] as string[],
    vocabulary: [] as string[],
    pronunciation: [] as string[],
    fluency: [] as string[]
  };

  // Keep only the last 5 errors for each category
  const maxErrors = 5;
  
  // Update common errors in context
  conversationContext.commonErrors = {
    grammar: [...new Set([...errors.grammar, ...conversationContext.commonErrors.grammar])].slice(0, maxErrors),
    vocabulary: [...new Set([...errors.vocabulary, ...conversationContext.commonErrors.vocabulary])].slice(0, maxErrors),
    pronunciation: [...new Set([...errors.pronunciation, ...conversationContext.commonErrors.pronunciation])].slice(0, maxErrors),
    fluency: [...new Set([...errors.fluency, ...conversationContext.commonErrors.fluency])].slice(0, maxErrors)
  };
};

// Function to get AI correction and feedback
export const getAIFeedback = async (userInput: string): Promise<Feedback> => {
  try {
    // Update conversation history
    conversationContext.conversationHistory.push({
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    const prompt = `
      As an expert English teacher using Gemini Flash 1.0, analyze this voice transcript and provide feedback focused on spoken English communication:
      "${userInput}"
      
      Detailed Context:
      1. User Profile:
         - Current level: ${conversationContext.userLevel}
         - Learning history: ${conversationContext.conversationHistory.length} interactions
         - Common errors: ${JSON.stringify(conversationContext.commonErrors)}
      
      2. Recent Conversation:
         ${conversationContext.conversationHistory.slice(-3).map(msg => 
           `${msg.role}: ${msg.content}`
         ).join('\n')}
      
      3. Performance Metrics:
         - Grammar: ${conversationContext.averageScores.grammar.toFixed(1)}/10
         - Vocabulary: ${conversationContext.averageScores.vocabulary.toFixed(1)}/10
         - Pronunciation: ${conversationContext.averageScores.pronunciation.toFixed(1)}/10
         - Fluency: ${conversationContext.averageScores.fluency.toFixed(1)}/10

      4. Focus Areas (based on lowest scores):
         ${Object.entries(conversationContext.averageScores)
           .sort(([,a], [,b]) => a - b)
           .map(([area, score]) => `- ${area}: ${score.toFixed(1)}`)
           .join('\n')}

      Evaluation Guidelines:
      1. Grammar (0-10):
         - Spoken sentence structure
         - Natural speech patterns
         - Common spoken expressions
         - Informal speech patterns
         ${conversationContext.userLevel === 'advanced' ? 
           '- Complex spoken structures\n- Natural speech flow' : 
           '- Basic spoken patterns\n- Simple expressions'}

      2. Vocabulary (0-10):
         - Natural word choice in speech
         - Everyday expressions
         - Colloquial language
         ${conversationContext.userLevel === 'advanced' ? 
           '- Idiomatic expressions\n- Natural speech patterns' : 
           '- Common spoken words\n- Basic phrases'}

      3. Pronunciation (0-10):
         - Sound accuracy
         - Word stress
         - Intonation patterns
         - Connected speech
         ${conversationContext.userLevel === 'advanced' ? 
           '- Natural speech flow\n- Advanced intonation' : 
           '- Clear pronunciation\n- Basic rhythm'}

      4. Fluency (0-10):
         - Natural speech flow
         - Speaking rhythm
         - Pause patterns
         - Self-correction in speech
         ${conversationContext.userLevel === 'advanced' ? 
           '- Natural conversation flow\n- Smooth transitions' : 
           '- Basic flow\n- Clear delivery'}

      Generate personalized feedback in this JSON format:
      {
        "correctedText": "<natural spoken version>",
        "grammar": <score>,
        "vocabulary": <score>,
        "pronunciation": <score>,
        "fluency": <score>,
        "suggestions": [
          "<specific improvement for spoken English>",
          "<suggestion for natural speech>",
          "<progressive challenge based on level>"
        ],
        "practiceTips": [
          {
            "title": "<focused practice area for speaking>",
            "description": "<level-appropriate explanation>",
            "example": "<spoken example from conversation>",
            "focusArea": "<grammar|vocabulary|pronunciation|fluency>"
          }
        ]
      }

      Important:
      - Focus on spoken English, not written English
      - Ignore punctuation and written grammar rules
      - Emphasize natural speech patterns
      - Consider common spoken expressions
      - Focus on pronunciation and fluency
      - Provide speaking practice tips
      - Match feedback to ${conversationContext.userLevel} level
      - Address recurring speech patterns
      - Focus on progressive improvement
      - Provide level-appropriate challenges
      - Use examples from conversation context
      - Be encouraging while maintaining high standards
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("AI feedback:", text);
    try {
      // Clean up the response text by removing markdown code block formatting
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const feedback = JSON.parse(cleanedText);
      
      // Validate feedback structure
      if (!feedback.correctedText || 
          typeof feedback.grammar !== 'number' ||
          typeof feedback.vocabulary !== 'number' ||
          typeof feedback.pronunciation !== 'number' ||
          typeof feedback.fluency !== 'number' ||
          !Array.isArray(feedback.suggestions) ||
          !Array.isArray(feedback.practiceTips)) {
        throw new Error('Invalid feedback structure');
      }

      // Normalize scores
      const normalizeScore = (score: number) => Math.max(0, Math.min(10, Math.round(score)));
      feedback.grammar = normalizeScore(feedback.grammar);
      feedback.vocabulary = normalizeScore(feedback.vocabulary);
      feedback.pronunciation = normalizeScore(feedback.pronunciation);
      feedback.fluency = normalizeScore(feedback.fluency);
      
      // Analyze errors
      analyzeErrors(userInput, feedback.correctedText);
      
      // Update score history
      conversationContext.scoreHistory.grammar.push(feedback.grammar);
      conversationContext.scoreHistory.vocabulary.push(feedback.vocabulary);
      conversationContext.scoreHistory.pronunciation.push(feedback.pronunciation);
      conversationContext.scoreHistory.fluency.push(feedback.fluency);
      
      // Update metrics and user level
      calculateAverageScores();
      conversationContext.userLevel = determineUserLevel();
      conversationContext.lastFeedback = feedback;
      
      return feedback;
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('Error getting AI feedback:', error);
    return getFallbackFeedback(userInput);
  }
};

// Generate a response to user input
export const generateAIResponse = async (userInput: string): Promise<string> => {
  try {
    // Update conversation history
    conversationContext.conversationHistory.push({
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    const prompt = `
      As an English tutor, respond to: "${userInput}"
      
      Context:
      - User level: ${conversationContext.userLevel}
      - Common errors: ${JSON.stringify(conversationContext.commonErrors)}
      - Recent messages: ${conversationContext.conversationHistory.slice(-3).map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n')}
      - Focus areas: ${Object.entries(conversationContext.averageScores)
        .sort(([,a], [,b]) => a - b)
        .map(([area, score]) => `${area}: ${score.toFixed(1)}`)
        .join(', ')}
      
      Requirements:
      1. Match ${conversationContext.userLevel} level
      2. Address common errors naturally
      3. Encourage improvement in weak areas
      4. Keep responses concise (under 50 words)
      5. Use natural conversation style
      6. Include subtle corrections
      7. Ask relevant follow-up questions
      8. Start fresh if user mentions "new conversation"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    console.log("AI response:", text);
    // Update conversation context
    conversationContext.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: text,
      timestamp: new Date()
    });

    if (userInput.toLowerCase().includes('new conversation')) {
      resetConversationContext();
    }

    return text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'd love to hear more about that. Could you tell me more?";
  }
};

// Process voice commands
export const processVoiceCommand = async (command: string): Promise<string> => {
  try {
    const prompt = `
      Process this English learning voice command: "${command}"
      
      Context:
      - User level: ${conversationContext.userLevel}
      - Common errors: ${JSON.stringify(conversationContext.commonErrors)}
      - Recent interaction: ${conversationContext.conversationHistory.slice(-1)[0]?.content || 'None'}
      - Learning focus: ${Object.entries(conversationContext.averageScores)
        .sort(([,a], [,b]) => a - b)
        .map(([area, score]) => `${area}: ${score.toFixed(1)}`)
        .join(', ')}
      
      Command Types:
      - Repeat request: Return "COMMAND_REPEAT_LAST"
      - Slower speech: Return "COMMAND_SPEAK_SLOWER"
      - Explanations: Provide level-appropriate explanation
      - Help requests: Give specific guidance
      - Definitions: Explain with relevant examples
      - New conversation: Reset context
      
      Requirements:
      - Match ${conversationContext.userLevel} level
      - Address learning patterns
      - Keep explanations concise
      - Use natural language
      - Be specific and practical
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    console.log("text", text);
    if (command.toLowerCase().includes('new conversation')) {
      resetConversationContext();
    }

    return text;
  } catch (error) {
    console.error('Error processing voice command:', error);
    return "I didn't catch that. Could you try again or ask for help?";
  }
};

// Get dynamic fallback feedback based on user's history
const getFallbackFeedback = (userInput: string): Feedback => {
  const getRecentAverage = (scores: number[]) => {
    const recent = scores.slice(-3);
    return recent.length > 0 
      ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length)
      : 5;
  };

  // Generate level-appropriate practice tips
  const generatePracticeTips = () => {
    const weakestAreas = Object.entries(conversationContext.averageScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2)
      .map(([area]) => area);

    return weakestAreas.map(area => {
      const isAdvanced = conversationContext.userLevel === 'advanced';
      const isIntermediate = conversationContext.userLevel === 'intermediate';

      switch(area) {
        case 'grammar':
          return {
            title: isAdvanced ? "Complex Grammar Structures" : "Basic Sentence Patterns",
            description: isAdvanced ? "Practice advanced grammatical constructions" : "Focus on simple, clear sentences",
            example: isAdvanced ? "Use perfect continuous tenses in conversation" : "Practice subject-verb-object order",
            focusArea: "grammar" as const
          };
        case 'vocabulary':
          return {
            title: isAdvanced ? "Advanced Word Choice" : "Essential Vocabulary",
            description: isIntermediate ? "Expand your active vocabulary" : "Master common everyday words",
            example: isAdvanced ? "Use precise terminology in discussions" : "Practice basic descriptive words",
            focusArea: "vocabulary" as const
          };
        case 'pronunciation':
          return {
            title: isAdvanced ? "Natural Speech Patterns" : "Clear Pronunciation",
            description: isIntermediate ? "Work on stress and intonation" : "Practice individual sounds",
            example: isAdvanced ? "Focus on connected speech" : "Repeat basic word patterns",
            focusArea: "pronunciation" as const
          };
        default:
          return {
            title: isAdvanced ? "Advanced Fluency" : "Basic Flow",
            description: isIntermediate ? "Practice smooth transitions" : "Focus on clear delivery",
            example: isAdvanced ? "Use varied discourse markers" : "Practice simple linking words",
            focusArea: "fluency" as const
          };
      }
    });
  };

  const feedback: Feedback = {
    correctedText: userInput,
    grammar: getRecentAverage(conversationContext.scoreHistory.grammar),
    vocabulary: getRecentAverage(conversationContext.scoreHistory.vocabulary),
    pronunciation: getRecentAverage(conversationContext.scoreHistory.pronunciation),
    fluency: getRecentAverage(conversationContext.scoreHistory.fluency),
    suggestions: [
      `Focus on ${conversationContext.userLevel === 'advanced' ? 'advanced' : 'basic'} sentence structures`,
      `Practice ${conversationContext.userLevel === 'beginner' ? 'common' : 'varied'} vocabulary`,
      `Work on ${conversationContext.userLevel === 'advanced' ? 'natural flow' : 'clear speech'}`
    ],
    practiceTips: generatePracticeTips()
  };

  // Update history and recalculate
  conversationContext.scoreHistory.grammar.push(feedback.grammar);
  conversationContext.scoreHistory.vocabulary.push(feedback.vocabulary);
  conversationContext.scoreHistory.pronunciation.push(feedback.pronunciation);
  conversationContext.scoreHistory.fluency.push(feedback.fluency);
  
  calculateAverageScores();
  
  return feedback;
};

// Reset conversation context
export const resetConversationContext = (): void => {
  conversationContext = {
    userLevel: 'beginner',
    topics: [],
    lastFeedback: null,
    conversationHistory: [],
    scoreHistory: {
      grammar: [],
      vocabulary: [],
      pronunciation: [],
      fluency: []
    },
    averageScores: {
      grammar: 0,
      vocabulary: 0,
      pronunciation: 0,
      fluency: 0
    },
    commonErrors: {
      grammar: [],
      vocabulary: [],
      pronunciation: [],
      fluency: []
    }
  };
};