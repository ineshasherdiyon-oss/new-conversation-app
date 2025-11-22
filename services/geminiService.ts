import { GoogleGenAI, Schema, Type } from "@google/genai";
import { ChatMessage, Correction, PronunciationResult, VocabularyWord, Lesson } from "../types";

// Initialize the Gemini API client
// WARNING: In a production app, API calls should be proxied through a backend to hide the API KEY.
// For this MVP/Demo, we access process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// --- Types for Response Schemas ---

// 1. Chat Response Schema
const chatResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    replyText: { type: Type.STRING, description: "The natural conversational response." },
    corrections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          correction: { type: Type.STRING },
          explanation: { type: Type.STRING },
        }
      },
      description: "List of grammar or phrasing corrections for the user's last message.",
    },
    suggestedVocab: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          meaning: { type: Type.STRING },
          example: { type: Type.STRING },
        }
      },
      description: "1-2 useful vocabulary words related to the context.",
    }
  },
  required: ["replyText"]
};

// 2. Pronunciation Response Schema
const pronunciationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "Overall pronunciation score from 0-100." },
    transcription: { type: Type.STRING, description: "What the model heard." },
    feedback: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "3 specific tips to improve pronunciation or clarity."
    },
    mistakes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          suggestion: { type: Type.STRING, description: "Phonetic or descriptive suggestion." }
        }
      }
    }
  },
  required: ["score", "transcription", "feedback"]
};

// --- API Functions ---

export const generateChatResponse = async (
  history: ChatMessage[], 
  userMessage: string,
  lesson?: Lesson
): Promise<{ reply: string; corrections: Correction[]; vocab: VocabularyWord[] }> => {
  
  try {
    // Construct a prompt that includes history context
    // Safe mapping to ensure no undefined text properties break the template
    const historyText = history
      .slice(-5)
      .map(h => `${h.role}: ${h.text || ''}`)
      .join('\n');

    const contextPrompt = `
      You are a friendly and helpful English tutor for an intermediate learner (Level B1). 
      ${lesson ? `Current Lesson Context: Title "${lesson.title}". Scenario: ${lesson.description}. Level: ${lesson.level}.` : ''}
      Your goal is to have a natural roleplay conversation.
      Keep your responses concise (1-2 sentences) to encourage back-and-forth.
      Occasionally correct the user's mistakes politely.
      If relevant, suggest 1 vocabulary word that fits the current topic.
      
      Recent Conversation History:
      ${historyText}
      
      User's new message: "${userMessage}"
      
      Respond in JSON format with the following structure:
      {
        "replyText": "Your response",
        "corrections": [{"original": "error", "correction": "fix", "explanation": "why"}],
        "suggestedVocab": [{"word": "term", "meaning": "def", "example": "usage"}]
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user", 
          parts: [{ text: contextPrompt }] 
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: chatResponseSchema,
        temperature: 0.7,
        maxOutputTokens: 1000, // Prevent infinite loops/massive responses
      }
    });

    if (response.text) {
      try {
        const data = JSON.parse(response.text);
        return {
          reply: data.replyText || "I'm not sure how to respond to that.",
          corrections: data.corrections || [],
          vocab: (data.suggestedVocab || []).map((v: any) => ({
              id: Date.now().toString() + Math.random(),
              word: v.word,
              meaning: v.meaning,
              example: v.example,
              interval: 0,
              nextReview: 0
          }))
        };
      } catch (parseError) {
        console.warn("JSON Parse failed, likely due to malformed/truncated response:", parseError);
        return {
          reply: "I understood you, but I'm having trouble formatting my response properly. Let's continue our conversation!",
          corrections: [],
          vocab: []
        };
      }
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return {
      reply: "I'm having a little trouble connecting right now. Can you say that again?",
      corrections: [],
      vocab: []
    };
  }
};

export const evaluatePronunciation = async (
  audioBase64: string, 
  mimeType: string
): Promise<PronunciationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Please listen to this audio carefully. 
              1. Transcribe what was said.
              2. Evaluate the pronunciation, clarity, and intonation for an English learner.
              3. Give a score from 0 to 100.
              4. Provide 3 specific tips for improvement.
              5. Identify specific words that were unclear.`
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: pronunciationSchema,
        maxOutputTokens: 1000,
      }
    });

    if (response.text) {
      try {
        return JSON.parse(response.text) as PronunciationResult;
      } catch (e) {
        console.error("Pronunciation JSON parse error", e);
         return {
          score: 0,
          transcription: "Error analyzing audio.",
          feedback: ["Could not process audio results. Please try again."],
          mistakes: []
        };
      }
    }
    throw new Error("No analysis returned");

  } catch (error) {
    console.error("Gemini Audio Error:", error);
    return {
      score: 0,
      transcription: "Error analyzing audio.",
      feedback: ["Could not process audio. Please try again."],
      mistakes: []
    };
  }
};

export const generateVocabExample = async (word: string): Promise<VocabularyWord> => {
  // Helper to generate a full card if we only have a word
  const prompt = `Create a vocabulary flashcard for the word: "${word}". JSON format with word, meaning, example.`;
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { 
        responseMimeType: "application/json",
        maxOutputTokens: 500
    }
  });
  const data = JSON.parse(response.text || "{}");
  return {
    id: Date.now().toString(),
    word: data.word || word,
    meaning: data.meaning || "Definition not found",
    example: data.example || "Example not available",
    interval: 0,
    nextReview: Date.now()
  };
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            { text: "Transcribe this audio into English text. Output ONLY the transcription. Do not add descriptions or preambles." },
            { inlineData: { mimeType, data: audioBase64 } }
          ]
        }
      ]
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Transcription error", error);
    return "";
  }
};
