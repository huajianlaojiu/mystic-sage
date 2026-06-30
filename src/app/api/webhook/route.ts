import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ensureLemonSetup } from "@/lib/lemon";

export async function POST(req: NextRequest) {
  try {
    ensureLemonSetup();
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (secret) {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      if (signature !== expected) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name || "unknown";

    console.log(`Lemon webhook: ${eventName}`);

    switch (eventName) {
      case "order_created":
        const order = event.data;
        console.log("Order received:", order.attributes?.identifier);
        break;
      case "subscription_created":
        const sub = event.data;
        console.log("Subscription created:", sub.attributes?.user_email);
        break;
      case "subscription_updated":
      case "subscription_cancelled":
        break;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
