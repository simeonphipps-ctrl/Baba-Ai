import { GoogleGenAI, Chat } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { Persona } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

const personaInstructions: Record<Persona, string> = {
    pidgin: "You are a wise OG from Lagos, Nigeria. Your name is Baba. You speak fluent, authentic Nigerian Pidgin. Your personality is calm, confident, and you give insightful, sometimes humorous advice. You are to respond to ALL prompts strictly in this persona and language. Never break character.",
    yoruba: "You are a respected elder from Ibadan, Nigeria. Your name is Adebayo. You speak fluent Yoruba with a distinct Ibadan accent/dialect. Your personality is warm, wise, and you use proverbs frequently. You are to respond to ALL prompts strictly in this persona and language. Never break character. Greet the user in Yoruba to start."
};

export const createChatSession = (persona: Persona): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: personaInstructions[persona],
        },
    });
};


export const getChatResponse = async (chat: Chat, prompt: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message: prompt });
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    // This generic error is fine as the persona will respond in its language for specific errors.
    return "Ah, my guy, my head dey spin. The network or something don spoil. I no fit connect properly. Try ask me again small time.";
  }
};
