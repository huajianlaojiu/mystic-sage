import crypto from "crypto";
import type { NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

const DAILY_ANONYMOUS_LIMIT = 1;

function getClientIdentifier(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `${ip}|${userAgent}`;
}

function createFingerprint(req: NextRequest) {
  const secret = process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Rate limiting is not configured");
  return crypto.createHmac("sha256", secret).update(`anonymous-reading:v1:${getClientIdentifier(req)}`).digest("hex");
}

export async function consumeAnonymousReadingQuota(req: NextRequest) {
  const db = getServerClient();
  const { data, error } = await db.rpc("consume_anonymous_reading_quota", {
    p_fingerprint_hash: createFingerprint(req),
    p_limit: DAILY_ANONYMOUS_LIMIT,
  });
  if (error) throw new Error(`Rate limit database error: ${error.message}`);
  return data === true;
}
