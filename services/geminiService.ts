
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const polishResumeText = async (text: string, context: string) => {
  if (!process.env.API_KEY) return text;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve the following resume text to sound more professional and impactful. Keep it concise.
      Context: ${context}
      Text to improve: "${text}"`,
    });
    
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini polish error:", error);
    return text;
  }
};
