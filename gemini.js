
import { GoogleGenAI } from "@google/genai";

// process.env.API_KEY is securely injected by our vite.config.js during build
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const polishResumeText = async (text, context) => {
  if (!process.env.API_KEY) {
      console.warn("No API key found. AI polish skipped.");
      return text;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve the following resume text to sound more professional and impactful. Keep it concise.\nContext: ${context}\nText to improve: "${text}"`,
    });
    
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini polish error:", error);
    return text;
  }
};
