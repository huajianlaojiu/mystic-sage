import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { ensureLemonSetup } from "@/lib/lemon";

export async function POST(req: NextRequest) {
  try {
    const storeId = ensureLemonSetup();
    const { variantId, email } = await req.json();

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
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message || "Checkout failed" }, { status: 500 });
  }
}
