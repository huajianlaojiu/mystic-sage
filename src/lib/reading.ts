import type OpenAI from "openai";
import {
  getOpenAIClient,
  getFallbackClient,
  getModel,
  getFallbackModel,
  isReasoningModel,
} from "@/lib/openai";
import {
  pickRandomCards,
  buildTarotPrompt,
  buildPremiumReportPrompt,
  ALL_CARDS,
  POSITIONS_FREE,
  POSITIONS_PREMIUM,
  type DrawnCard,
} from "@/lib/tarot";

export type GenCard = {
  name: string;
  keywords: string;
  position: string;
  emoji: string;
  reversed: boolean;
  suit: string;
};

function formatCards(cards: DrawnCard[], positions: string[]): GenCard[] {
  return cards.map((c, i) => ({
    name: c.reversed ? c.name + " (Reversed)" : c.name,
    keywords: c.reversed ? c.reversedKeywords : c.keywords,
    position: positions[i] || `Card ${i + 1}`,
    emoji: c.emoji,
    reversed: c.reversed,
    suit: c.suit,
  }));
}

/**
 * Generate a tarot reading.
 *
 * - premium=false -> short 3-card reading (Past / Present / Future)
 * - premium=true  -> long structured written report (up to a 10-card spread)
 * - drawnCards    -> an exact spread to reuse (keeps the seeker's own cards
 *                    and their reversed/upright orientation)
 * - cardNames     -> legacy explicit list, matched by name
 */
export async function generateReading(
  question: string,
  opts: { premium: boolean; cardNames?: string[]; drawnCards?: DrawnCard[] }
): Promise<{ reading: string; cards: GenCard[]; premium: boolean }> {
  const fallbackCount = opts.premium ? 10 : 3;

  let cards: DrawnCard[];
  if (opts.drawnCards && opts.drawnCards.length > 0) {
    // Reuse the seeker's actual spread so a paid report matches what they saw.
    cards = opts.drawnCards;
  } else if (opts.cardNames && opts.cardNames.length > 0) {
    cards = opts.cardNames
      .map((name) => ALL_CARDS.find((c) => c.name === name))
      .filter(Boolean)
      .map((c) => ({ ...c!, reversed: Math.random() < 0.3 }));
    if (cards.length !== opts.cardNames.length) cards = pickRandomCards(fallbackCount);
  } else {
    cards = pickRandomCards(fallbackCount);
  }

  const positions = cards.length >= 10 ? POSITIONS_PREMIUM : POSITIONS_FREE;
  const maxTokens = opts.premium ? 2500 : 600;

  const messages: Array<{ role: "system" | "user"; content: string }> = [
    {
      role: "system",
      content: opts.premium
        ? "You are an experienced, compassionate tarot reader writing a long-form paid report in warm, natural English. Never claim to predict the future with certainty. Frame everything as guidance and reflection."
        : "You are a deeply intuitive, compassionate tarot reader. Write readings in natural, warm English. Never claim to predict the future with certainty. Frame everything as guidance and reflection.",
    },
    {
      role: "user",
      content: opts.premium
        ? buildPremiumReportPrompt(cards, question, positions)
        : buildTarotPrompt(cards, question),
    },
  ];

  const reading = await generateText(messages, {
    tier: opts.premium ? "premium" : "free",
    maxTokens,
  });

  return { reading, cards: formatCards(cards, positions), premium: opts.premium };
}

function extractText(completion: unknown): string {
  const c = completion as { choices?: Array<{ message?: { content?: string | null } }> };
  return c.choices?.[0]?.message?.content?.trim() || "";
}

async function callModel(
  client: OpenAI,
  model: string,
  messages: Array<{ role: "system" | "user"; content: string }>,
  maxTokens: number
): Promise<string> {
  const params: Record<string, unknown> = { model, messages, max_tokens: maxTokens };
  // Reasoning models reject sampling params, so only set temperature for the rest.
  if (!isReasoningModel(model)) params.temperature = 0.9;

  const completion = await client.chat.completions.create(params as never);
  return extractText(completion);
}

/**
 * One retry on the primary provider, then a single attempt on the optional
 * fallback provider. Keeps the site usable when the upstream is slow or
 * rate-limited instead of surfacing a 500.
 */
async function generateText(
  messages: Array<{ role: "system" | "user"; content: string }>,
  opts: { tier: "free" | "premium"; maxTokens: number }
): Promise<string> {
  const primaryModel = getModel(opts.tier);
  const errors: string[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await callModel(getOpenAIClient(), primaryModel, messages, opts.maxTokens);
      if (text) return text;
      errors.push(`attempt ${attempt + 1}: empty response`);
    } catch (err) {
      errors.push(`attempt ${attempt + 1}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const fallback = getFallbackClient();
  if (fallback) {
    try {
      const text = await callModel(fallback, getFallbackModel(), messages, opts.maxTokens);
      if (text) {
        console.warn(`[reading] served by fallback model after: ${errors.join(" | ")}`);
        return text;
      }
      errors.push("fallback: empty response");
    } catch (err) {
      errors.push(`fallback: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new Error(`All model attempts failed: ${errors.join(" | ")}`);
}
