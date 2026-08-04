import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    
    const txnType = params.get("txn_type") || "unknown";
    const itemName = params.get("item_name") || "";
    const payerEmail = params.get("payer_email") || "";
    const txnId = params.get("txn_id") || "";
    const mcGross = params.get("mc_gross") || "";
    const mcCurrency = params.get("mc_currency") || "";
    const paymentStatus = params.get("payment_status") || "";
    const subscrId = params.get("subscr_id") || "";
    const receiverEmail = params.get("receiver_email") || "";

    // Verify the receiver email matches ours (prevent fraud)
    const expectedEmail = "mountain0342@gmail.com";
    if (receiverEmail && receiverEmail !== expectedEmail) {
      console.warn("[paypal-ipn] Receiver email mismatch:", receiverEmail);
      return NextResponse.json({ error: "Invalid receiver" }, { status: 400 });
    }

    // Log the transaction
    console.log("[paypal-ipn] Transaction received:", {
      type: txnType,
      item: itemName,
      from: payerEmail,
      amount: mcGross,
      currency: mcCurrency,
      status: paymentStatus,
      txnId,
      subscrId,
    });

    // Handle subscription events
    switch (txnType) {
      case "subscr_signup":
        console.log("[paypal-ipn] New subscription signup:", subscrId, payerEmail);
        break;
      case "subscr_payment":
        if (paymentStatus === "Completed") {
          console.log("[paypal-ipn] Subscription payment completed:", subscrId, mcGross);
        }
        break;
      case "subscr_cancel":
        console.log("[paypal-ipn] Subscription cancelled:", subscrId, payerEmail);
        break;
      case "subscr_eot":
        console.log("[paypal-ipn] Subscription expired:", subscrId);
        break;
      case "web_accept":
        if (paymentStatus === "Completed") {
          console.log("[paypal-ipn] One-time payment completed:", txnId, itemName, mcGross);
        }
        break;
      default:
        console.log("[paypal-ipn] Unhandled txn_type:", txnType);
    }

    // TODO: Store order in database
    // TODO: Send confirmation email to customer
    // TODO: Grant membership access based on subscription

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[paypal-ipn] Error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

// Handle GET for PayPal IPN verification (PayPal may send GET)
export async function GET() {
  return NextResponse.json({ message: "PayPal IPN endpoint active" });
}
