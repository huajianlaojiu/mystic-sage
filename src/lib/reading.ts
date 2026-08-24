import { getOpenAIClient } from "@/lib/openai";
import { pickRandomCards, buildTarotPrompt, ALL_CARDS, POSITIONS_FREE, POSITIONS_PREMIUM, type DrawnCard } from "@/lib/tarot";

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
 * - premium=true  -> Celtic Cross (10 cards), ~1400 tokens, unlimited
 * - premium=false -> 3 cards (Past/Present/Future), ~800 tokens
 * - cardNames     -> optional explicit card list (must match the card count)
 */
export async function generateReading(
  question: string,
  opts: { premium: boolean; cardNames?: string[] }
): Promise<{ reading: string; cards: GenCard[]; premium: boolean }> {
  const cardCount = opts.premium ? 10 : 3;
  const positions = opts.premium ? POSITIONS_PREMIUM : POSITIONS_FREE;
  const maxTokens = opts.premium ? 1400 : 800;

  let cards: DrawnCard[];
  if (opts.cardNames && opts.cardNames.length === cardCount) {
    cards = opts.cardNames
      .map((name) => ALL_CARDS.find((c) => c.name === name))
      .filter(Boolean)
      .map((c) => ({ ...c!, reversed: Math.random() < 0.3 }));
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
          "You are a deeply intuitive, compassionate tarot reader. Write readings in natural, warm English. Never claim to predict the future with certainty. Frame everything as guidance and reflection.",
      },
      { role: "user", content: buildTarotPrompt(cards, question) },
    ],
    temperature: 0.9,
    max_tokens: maxTokens,
  });

  const reading =
    completion.choices[0]?.message?.content || "The energies are unclear. Please try again.";

  return { reading, cards: formatCards(cards, positions), premium: opts.premium };
}
