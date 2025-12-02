import { GoogleGenAI, Chat, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are DesignGenius Assistant, an expert AI graphic designer.
You have access to tools that can manipulate the design canvas directly.
- ALWAYS use tools when the user asks to create shapes, text, images, or change the background.
- If the user asks for a design (e.g., "Create a poster for a coffee shop"), break it down and use the \`addElement\` tool multiple times to create the layout.
- For text elements, suggest creative copy if the user doesn't provide it.
- Use 'Inter' as the default font family.
- Coordinates: The canvas is typically 800x600. Center is 400,300.
- Keep text responses concise and helpful.
`;

// --- Tool Definitions ---

const addElementTool: FunctionDeclaration = {
  name: 'addElement',
  description: 'Adds a new element (text, rectangle, circle, image) to the canvas with specific properties.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ['text', 'rectangle', 'circle', 'image'],
        description: 'The type of element to add.',
      },
      content: {
        type: Type.STRING,
        description: 'The text content (for type=text) or image URL (for type=image).',
      },
      x: { type: Type.NUMBER, description: 'X coordinate (0-800).' },
      y: { type: Type.NUMBER, description: 'Y coordinate (0-600).' },
      width: { type: Type.NUMBER, description: 'Width of the element.' },
      height: { type: Type.NUMBER, description: 'Height of the element.' },
      color: { type: Type.STRING, description: 'Text color (hex code).' },
      backgroundColor: { type: Type.STRING, description: 'Fill color for shapes (hex code).' },
      fontSize: { type: Type.NUMBER, description: 'Font size for text.' },
      fontWeight: { type: Type.STRING, description: 'Font weight (normal, bold).' },
    },
    required: ['type', 'x', 'y', 'width', 'height'],
  },
};

const changeBackgroundTool: FunctionDeclaration = {
  name: 'changeBackground',
  description: 'Changes the background color of the canvas.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      color: { type: Type.STRING, description: 'Hex color code for the background.' },
    },
    required: ['color'],
  },
};

export const designTools = [addElementTool, changeBackgroundTool];

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: designTools }],
      },
    });
  }
  return chatSession;
};

export const resetChatSession = () => {
    chatSession = null;
};
