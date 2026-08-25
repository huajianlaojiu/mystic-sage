import { NextRequest, NextResponse } from "next/server";
import { generateReading, type GenCard } from "@/lib/reading";
import { getMembership } from "@/lib/membership";
import { consumeAnonymousReadingQuota } from "@/lib/rateLimit";
import { getSessionUser, getServerClient } from "@/lib/supabase/server";

export const maxDuration = 60;
const MAX_QUESTION_CHARS = 500;
const MAX_CARD_NAMES = 10;
const MAX_CARD_NAME_CHARS = 80;

function parseRequestBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid request body");
  const payload = body as Record<string, unknown>;
  const rawQuestion = payload.question ?? "";
  if (typeof rawQuestion !== "string") throw new Error("Question must be text");
  const question = rawQuestion.trim();
  if (question.length > MAX_QUESTION_CHARS) throw new Error(`Question must be ${MAX_QUESTION_CHARS} characters or fewer`);

  let cardNames: string[] | undefined;
  if (payload.cardNames !== undefined) {
    if (!Array.isArray(payload.cardNames) || payload.cardNames.length > MAX_CARD_NAMES || payload.cardNames.some(card => typeof card !== "string" || card.length > MAX_CARD_NAME_CHARS)) {
      throw new Error("Invalid card selection");
    }
    cardNames = payload.cardNames;
  }
  return { question, cardNames };
}

export async function POST(req: NextRequest) {
  try {
    const { question, cardNames } = parseRequestBody(await req.json());
    const sessionUser = await getSessionUser();
    const email = sessionUser?.email?.trim().toLowerCase() || null;
    const membership = email ? await getMembership(email) : null;
    const premium = Boolean(membership?.member);

    if (!premium && email) {
      const db = getServerClient();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count, error } = await db.from("readings").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", startOfDay.toISOString());
      if (error) throw new Error(`Daily limit database error: ${error.message}`);
      if ((count || 0) >= 1) return NextResponse.json({ error: "You've used your free reading for today. Come back tomorrow, or upgrade to Mystic Plus." }, { status: 429 });
    }

    if (!premium && !email) {
      const allowed = await consumeAnonymousReadingQuota(req);
      if (!allowed) return NextResponse.json({ error: "You've used your free reading for today. Sign in to track your reading history, or come back tomorrow." }, { status: 429 });
    }

    const result = await generateReading(question || "What do I need to know right now?", { premium, cardNames });

    if (email) {
      const db = getServerClient();
      const { error } = await db.from("readings").insert({ email, premium, cards: result.cards, question: question || null, reading: result.reading });
      if (error) console.warn("[reading] Save history failed:", error.message);
    }

    const response: { reading: string; cards: GenCard[]; premium?: boolean } = { reading: result.reading, cards: result.cards };
    if (premium) response.premium = true;
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reading error";
    console.error("Reading API error:", message);
    if (/Question must|Invalid request body|Invalid card selection/.test(message)) return NextResponse.json({ error: message }, { status: 400 });
    if (/Rate limit database error|Server database credentials/.test(message)) return NextResponse.json({ error: "Reading protection is temporarily unavailable. Please try again later." }, { status: 503 });
    if (message.includes("quota") || message.includes("insufficient_quota")) return NextResponse.json({ error: "AI capacity is temporarily unavailable. Please try again later." }, { status: 503 });
    if (message.includes("rate")) return NextResponse.json({ error: "Too many requests — please wait." }, { status: 429 });
    return NextResponse.json({ error: "The reading could not be completed. Please try again." }, { status: 500 });
  }
}
