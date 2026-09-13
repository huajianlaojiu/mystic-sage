import { NextResponse } from "next/server";
import { getSessionUser, getSessionClient } from "@/lib/supabase/server";

type StoredCard = { name?: unknown };

/**
 * The signed-in user's own reading history. Row Level Security on the
 * `readings` table restricts this to rows matching the caller's auth email,
 * so the query itself carries no email filter.
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.email) {
      return NextResponse.json({ readings: [], error: "Sign in to see your readings." }, { status: 401 });
    }

    const supabase = await getSessionClient();
    const { data, error } = await supabase
      .from("readings")
      .select("id, created_at, question, cards, premium, reading")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[readings] Query error:", error.message);
      return NextResponse.json({ readings: [], error: "Could not load your readings." }, { status: 500 });
    }

    const readings = (data || []).map((row) => {
      const cards = Array.isArray(row.cards)
        ? (row.cards as StoredCard[]).map((c) => (typeof c?.name === "string" ? c.name : "")).filter(Boolean)
        : [];
      const text = typeof row.reading === "string" ? row.reading.trim() : "";
      return {
        id: row.id,
        createdAt: row.created_at,
        question: row.question || null,
        premium: Boolean(row.premium),
        cards,
        excerpt: text.length > 260 ? text.slice(0, 260).trimEnd() + "..." : text,
      };
    });

    return NextResponse.json({ readings });
  } catch (err) {
    console.error("[readings] Error:", err);
    return NextResponse.json({ readings: [], error: "Could not load your readings." }, { status: 500 });
  }
}
