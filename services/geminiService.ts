import { GoogleGenAI, Type } from "@google/genai";
import { GeminiVocabResponse } from "../types";

const getSchema = () => {
    return {
        type: Type.OBJECT,
        properties: {
            translation: { type: Type.STRING, description: "Indonesian translation of the word" },
            synonyms: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3-5 English synonyms" 
            },
            example: { type: Type.STRING, description: "One academic or neutral tone example sentence using the word" },
            phonetic: { type: Type.STRING, description: "IPA phonetic transcription of the word" }
        },
        required: ["translation", "synonyms", "example", "phonetic"],
    }
}

export const generateVocabData = async (word: string): Promise<GeminiVocabResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate vocabulary details for the English word: "${word}". Translate to Indonesian.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: getSchema(),
        systemInstruction: "You are a helpful language tutor. Provide accurate translations and academic/neutral examples.",
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster simple responses
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as GeminiVocabResponse;
    }
    
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
