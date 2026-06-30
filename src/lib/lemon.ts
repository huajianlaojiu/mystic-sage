import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function ensureLemonSetup() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey || !storeId) {
    throw new Error("Missing LEMONSQUEEZY_API_KEY or LEMONSQUEEZY_STORE_ID in .env.local");
  }
  lemonSqueezySetup({ apiKey });
  return storeId;
}

export const VARIANTS = {
  PLUS_MONTHLY: process.env.LS_VARIANT_PLUS_MONTHLY || "",
  PLUS_ANNUAL: process.env.LS_VARIANT_PLUS_ANNUAL || "",
  PREMIUM_MONTHLY: process.env.LS_VARIANT_PREMIUM_MONTHLY || "",
  PREMIUM_ANNUAL: process.env.LS_VARIANT_PREMIUM_ANNUAL || "",
  BIRTH_CHART: process.env.LS_VARIANT_BIRTH_CHART || "",
  ANNUAL_FORECAST: process.env.LS_VARIANT_ANNUAL_FORECAST || "",
  COUPLES_COMPAT: process.env.LS_VARIANT_COUPLES_COMPAT || "",
};
