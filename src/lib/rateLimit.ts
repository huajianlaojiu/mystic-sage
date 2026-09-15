import crypto from "crypto";
import type { NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

const DAILY_ANONYMOUS_LIMIT = 1;
// Enough for a person who mistypes their address twice, far too few to use the
// endpoint for list bombing or to burn through the Resend monthly quota.
const DAILY_SUBSCRIBE_LIMIT = 3;

function getClientIdentifier(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `${ip}|${userAgent}`;
}

function createFingerprint(req: NextRequest, namespace: string) {
  const secret = process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Rate limiting is not configured");
  return crypto.createHmac("sha256", secret).update(`${namespace}:${getClientIdentifier(req)}`).digest("hex");
}

/**
 * Shared counter. The row is keyed by (date, fingerprint hash) and the namespace
 * is folded into the hash, so the subscribe budget and the reading budget never
 * consume each other's allowance.
 */
async function consumeQuota(req: NextRequest, namespace: string, limit: number) {
  const db = getServerClient();
  const { data, error } = await db.rpc("consume_anonymous_reading_quota", {
    p_fingerprint_hash: createFingerprint(req, namespace),
    p_limit: limit,
  });
  if (error) throw new Error(`Rate limit database error: ${error.message}`);
  return data === true;
}

export async function consumeAnonymousReadingQuota(req: NextRequest) {
  return consumeQuota(req, "anonymous-reading:v1", DAILY_ANONYMOUS_LIMIT);
}

export async function consumeSubscribeQuota(req: NextRequest) {
  return consumeQuota(req, "subscribe:v1", DAILY_SUBSCRIBE_LIMIT);
}
