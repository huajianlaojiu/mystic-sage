import { NextRequest, NextResponse } from "next/server";
import { generateReading, type GenCard } from "@/lib/reading";
import { getMembership } from "@/lib/membership";
import { getSessionUser, getServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question || "";

    // Membership is derived ONLY from the authenticated session. We never trust
    // an email supplied in the request body — that would let anyone forge a
    // member's email and grab the premium spread. Anonymous callers always get
    // the free 3-card reading; a logged-in user whose verified email matches an
    // active subscription gets the premium 5-card spread.

    const sessionUser = await getSessionUser();
    let premium = false;
    let email: string | null = null;

    if (sessionUser?.email) {
      email = sessionUser.email;
      const status = await getMembership(email);
      if (status?.member) premium = true;
    }

    // Free daily limit: logged-in non-premium users get 1 free reading per day.
    // Anonymous users are not server-limited yet (front-end counts via localStorage).
    if (!premium && email) {
      try {
        const db = getServerClient();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const { count } = await db
          .from("readings")
          .select("id", { count: "exact", head: true })
          .eq("email", email)
          .gte("created_at", startOfDay.toISOString());
        if ((count || 0) >= 1) {
          return NextResponse.json(
            { error: "You've used your free reading for today. Come back tomorrow, or upgrade for unlimited readings." },
            { status: 429 }
          );
        }
      } catch (err: any) {
        console.warn("[reading] Daily limit check failed:", err?.message);
      }
    }

    const result = await generateReading(question || "What do I need to know right now?", {
      premium,
      cardNames: body.cardNames,
    });


    if (email) {
      try {
        const db = getServerClient();
        await db.from("readings").insert({
          email,
          premium,
          cards: result.cards,
          question: question || null,
          reading: result.reading,
        });
      } catch (err: any) {
        console.warn("[reading] Save history failed:", err?.message);
      }
    }

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
