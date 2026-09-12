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

const fallbackApiKey = process.env.FALLBACK_API_KEY;
const fallbackBaseURL = process.env.FALLBACK_BASE_URL;
let fallbackClient: OpenAI | null = null;

/**
 * Optional secondary provider, used when the primary one fails or is
 * congested. Enable by setting FALLBACK_API_KEY + FALLBACK_BASE_URL.
 */
export function getFallbackClient(): OpenAI | null {
  if (!fallbackApiKey || !fallbackBaseURL) return null;
  if (!fallbackClient) {
    fallbackClient = new OpenAI({ apiKey: fallbackApiKey, baseURL: fallbackBaseURL });
  }
  return fallbackClient;
}

/**
 * Model per tier, driven by env so the provider or model can be swapped
 * without a code change.
 *
 *   MODEL_FREE     (default: gpt-4o-mini)
 *   MODEL_PREMIUM  (default: gpt-4o-mini - set to a stronger model later to
 *                   deepen the paid report)
 */
export function getModel(tier: "free" | "premium"): string {
  const configured = tier === "premium" ? process.env.MODEL_PREMIUM : process.env.MODEL_FREE;
  return configured || "gpt-4o-mini";
}

export function getFallbackModel(): string {
  return process.env.FALLBACK_MODEL || "gpt-4o-mini";
}

/** Reasoning models reject sampling params such as temperature. */
export function isReasoningModel(model: string): boolean {
  return /reasoner|reasoning|^o[13]/i.test(model);
}
