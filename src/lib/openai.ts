import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY in .env.local");
    client = new OpenAI({ apiKey, baseURL });
  }
  return client;
}
