import { getOpenAIClient } from "@/lib/openai";
import { pickRandomCards, buildTarotPrompt, MAJOR_ARCANA } from "@/lib/tarot";

export type GenCard = {
  name: string;
  keywords: string;
  position: string;
  emoji: string;
};

const EMOJIS: Record<number, string> = {
  0: "😊", 1: "🪄", 2: "🌙", 3: "🌿", 4: "👑", 5: "📿", 6: "💞", 7: "🏆", 8: "🦁", 9: "🏮",
  10: "🎡", 11: "⚖️", 12: "🪢", 13: "🦋", 14: "⚗️", 15: "😈", 16: "⚡", 17: "⭐", 18: "🌘",
  19: "☀️", 20: "📯", 21: "🌍",
};

function formatCards(cards: typeof MAJOR_ARCANA, positions: string[]): GenCard[] {
  return cards.map((c, i) => ({
    name: c.name,
    keywords: c.keywords,
    position: positions[i] || `Card ${i + 1}`,
    emoji: EMOJIS[c.id] || "🃏",
  }));
}

/**
 * Generate a tarot reading. Shared by the on-site /api/reading endpoint and the
 * PayPal webhook (scheme B: email a purchased Detailed Report to the buyer).
 *
 * - premium=true  -> 5 cards (Past/Present/Challenge/Guidance/Future), ~1200 tokens
 * - premium=false -> 3 cards (Past/Present/Future), ~800 tokens
 * - cardNames     -> optional explicit card list (must match the card count)
 */
export async function generateReading(
  question: string,
  opts: { premium: boolean; cardNames?: string[] }
): Promise<{ reading: string; cards: GenCard[]; premium: boolean }> {
  const cardCount = opts.premium ? 5 : 3;
  const positions = opts.premium
    ? ["Past", "Present", "Challenge", "Guidance", "Future"]
    : ["Past", "Present", "Future"];
  const maxTokens = opts.premium ? 1200 : 800;

  let cards: typeof MAJOR_ARCANA;
  if (opts.cardNames && opts.cardNames.length === cardCount) {
    cards = opts.cardNames
      .map((name) => MAJOR_ARCANA.find((c) => c.name === name))
      .filter(Boolean) as typeof MAJOR_ARCANA;
    if (cards.length !== cardCount) cards = pickRandomCards(cardCount);
  } else {
    cards = pickRandomCards(cardCount);
  }

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a compassionate, insightful tarot reader. Write readings in natural, warm English. Never claim to predict the future with certainty. Frame everything as guidance and reflection.",
      },
      { role: "user", content: buildTarotPrompt(cards, question, positions) },
    ],
    temperature: 0.95,
    max_tokens: maxTokens,
  });

  const reading =
    completion.choices[0]?.message?.content || "The energies are unclear. Please try again.";

  return { reading, cards: formatCards(cards, positions), premium: opts.premium };
}
