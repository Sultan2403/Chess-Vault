import { GoogleGenAI } from "@google/genai";
import env from "./env";

const MODEL = "gemini-3.5-flash-lite";
const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export default gemini;
