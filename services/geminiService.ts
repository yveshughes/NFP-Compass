import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { INITIAL_SYSTEM_PROMPT } from "../constants";

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  chatSession = ai.chats.create({
    model: 'gemini-3.0-flash',
    config: {
      systemInstruction: INITIAL_SYSTEM_PROMPT,
      temperature: 0.7,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session");
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "I'm having trouble connecting to the service right now. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error processing your request. Please try again.";
  }
};
