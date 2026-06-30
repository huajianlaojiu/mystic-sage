import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { pickRandomCards, buildTarotPrompt, MAJOR_ARCANA } from "@/lib/tarot";

const EMOJIS: Record<number, string> = {
  0:"😊",1:"🪄",2:"🌙",3:"🌿",4:"👑",5:"📿",6:"💞",7:"🏆",8:"🦁",9:"🏮",
  10:"🎡",11:"⚖️",12:"🪢",13:"🦋",14:"⚗️",15:"😈",16:"⚡",17:"⭐",18:"🌘",
  19:"☀️",20:"📯",21:"🌍",
};

function formatCards(cards: typeof MAJOR_ARCANA) {
  return cards.map((c, i) => ({
    name: c.name,
    keywords: c.keywords,
    position: i === 0 ? "Past" : i === 1 ? "Present" : "Future",
    emoji: EMOJIS[c.id] || "🃏",
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question || "";
    let cards: typeof MAJOR_ARCANA;

    if (body.cardNames?.length === 3) {
      cards = body.cardNames
        .map((name: string) => MAJOR_ARCANA.find((c) => c.name === name))
        .filter(Boolean) as typeof MAJOR_ARCANA;
      if (cards.length !== 3) cards = pickRandomCards(3);
    } else {
      cards = pickRandomCards(3);
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a compassionate, insightful tarot reader. Write readings in natural, warm English. Never claim to predict the future with certainty. Frame everything as guidance and reflection." },
        { role: "user", content: buildTarotPrompt(cards, question) },
      ],
      temperature: 0.95,
      max_tokens: 800,
    });

    const reading = completion.choices[0]?.message?.content || "The energies are unclear. Please try again.";
    return NextResponse.json({ reading, cards: formatCards(cards) });
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
