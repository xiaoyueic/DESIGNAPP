import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Initialize the API client
// CRITICAL: process.env.API_KEY is guaranteed to be available in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are DesignGenius Assistant, an AI expert in graphic design, color theory, typography, and marketing copy.
Your goal is to help users create beautiful designs in this Canva-like web application.
- Keep responses concise and helpful.
- If asked for design ideas, suggest layouts, color palettes (with hex codes), and font pairings.
- If asked for copy, generate creative and engaging text.
- Be encouraging and professional.
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chat = getChatSession();
  try {
    const result = await chat.sendMessageStream({ message });
    return result as unknown as AsyncIterable<GenerateContentResponse>;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};