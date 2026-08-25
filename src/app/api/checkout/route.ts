import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { ensureLemonSetup, isLemonConfigured } from "@/lib/lemon";

export async function POST(req: NextRequest) {
  try {
    if (!isLemonConfigured()) {
      return NextResponse.json({
        error: "Lemon Squeezy is not configured yet.",
        fallback: "paypal",
        message: "Checkout is available via PayPal on the pricing page."
      }, { status: 503 });
    }

    const storeId = ensureLemonSetup();
    const { variantId, email } = await req.json();

    if (!variantId) {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
    }

    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: { email: email || "" },
      checkoutOptions: { embed: false, media: false },
      productOptions: {
        enabledVariants: [Number(variantId)],
      },
    });

    if (error || !data) {
      throw new Error(error?.message || "Checkout creation failed");
    }

    return NextResponse.json({ url: data.data.attributes.url });
  } catch (err) {
    console.error("Checkout error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg || "Checkout failed" }, { status: 500 });
  }
}
