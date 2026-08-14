import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { pickRandomCards, buildTarotPrompt, MAJOR_ARCANA } from "@/lib/tarot";
import { getMembership } from "@/lib/membership";
import { getSessionUser } from "@/lib/supabase/server";

const EMOJIS: Record<number, string> = {
  0: "😊", 1: "🪄", 2: "🌙", 3: "🌿", 4: "👑", 5: "📿", 6: "💞", 7: "🏆", 8: "🦁", 9: "🏮",
  10: "🎡", 11: "⚖️", 12: "🪢", 13: "🦋", 14: "⚗️", 15: "😈", 16: "⚡", 17: "⭐", 18: "🌘",
  19: "☀️", 20: "📯", 21: "🌍",
};

const POSITIONS_FREE = ["Past", "Present", "Future"];
const POSITIONS_PREMIUM = ["Past", "Present", "Challenge", "Guidance", "Future"];

function formatCards(cards: typeof MAJOR_ARCANA, positions: string[]) {
  return cards.map((c, i) => ({
    name: c.name,
    keywords: c.keywords,
    position: positions[i] || `Card ${i + 1}`,
    emoji: EMOJIS[c.id] || "🃏",
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question || "";

    // Membership is derived ONLY from the authenticated session. We never trust
    // an email supplied in the request body — that would let anyone forge a
    // member's email and grab the premium spread. Anonymous callers always get
    // the free 3-card reading; a logged-in user whose verified email matches an
    // active subscription gets the premium 5-card spread.
    let premium = false;
    let cardCount = 3;
    let positions = POSITIONS_FREE;
    let maxTokens = 800;

    const sessionUser = await getSessionUser();
    if (sessionUser?.email) {
      const status = await getMembership(sessionUser.email);
      if (status?.member) {
        premium = true;
        cardCount = 5;
        positions = POSITIONS_PREMIUM;
        maxTokens = 1200;
      }
    }

    let cards: typeof MAJOR_ARCANA;
    if (body.cardNames?.length === cardCount) {
      cards = body.cardNames
        .map((name: string) => MAJOR_ARCANA.find((c) => c.name === name))
        .filter(Boolean) as typeof MAJOR_ARCANA;
      if (cards.length !== cardCount) cards = pickRandomCards(cardCount);
    } else {
      cards = pickRandomCards(cardCount);
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a compassionate, insightful tarot reader. Write readings in natural, warm English. Never claim to predict the future with certainty. Frame everything as guidance and reflection." },
        { role: "user", content: buildTarotPrompt(cards, question, positions) },
      ],
      temperature: 0.95,
      max_tokens: maxTokens,
    });

    const reading = completion.choices[0]?.message?.content || "The energies are unclear. Please try again.";
    const response: { reading: string; cards: ReturnType<typeof formatCards>; premium?: boolean } = {
      reading,
      cards: formatCards(cards, positions),
    };
    if (premium) response.premium = true;
    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Reading API error:", err);
    const msg = err.message || "";
    if (msg.includes("quota") || msg.includes("insufficient_quota"))
      return NextResponse.json({ error: "API quota exceeded — please recharge." }, { status: 402 });
    if (msg.includes("rate"))
      return NextResponse.json({ error: "Too many requests — please wait." }, { status: 429 });
    return NextResponse.json({ error: "The cosmic energies are shifting — try again." }, { status: 500 });
  }
}
