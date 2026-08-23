import { NextRequest, NextResponse } from "next/server";
import { generateReading, type GenCard } from "@/lib/reading";
import { getMembership } from "@/lib/membership";
import { getSessionUser } from "@/lib/supabase/server";

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

    const sessionUser = await getSessionUser();
    if (sessionUser?.email) {
      const status = await getMembership(sessionUser.email);
      if (status?.member) {
        premium = true;
      }
    }

    const result = await generateReading(question || "What do I need to know right now?", {
      premium,
      cardNames: body.cardNames,
    });

    const response: { reading: string; cards: GenCard[]; premium?: boolean } = {
      reading: result.reading,
      cards: result.cards,
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
