/**
 * Zero-dependency email sender.
 *
 * Currently supports Resend via its REST API (fetch-based, no SDK needed).
 * SMTP support can be added later via nodemailer if a dedicated SMTP relay
 * (SendGrid, Mailgun, Gmail App Password...) is preferred.
 *
 * Config via env:
 *   RESEND_API_KEY  - Resend API key (required to actually send)
 *   EMAIL_FROM      - sender address, e.g. "MysticSage <noreply@mysticsages.com>"
 *                     Falls back to Resend's onboarding address so local/dev
 *                     testing works before a domain is verified.
 *   EMAIL_REPLY_TO  - optional reply-to address
 */

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

function getFrom(): string {
  const configured = process.env.EMAIL_FROM;
  if (configured && configured.includes("@")) return configured;
  return "MysticSage <onboarding@resend.dev>";
}

export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY);
}

/**
 * Send an email via Resend. Returns { ok: true } on success, or
 * { ok: false, error } on failure. Never throws.
 */
export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFrom(),
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: "Resend " + res.status + ": " + body.slice(0, 200) };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export function welcomeEmailHtml(name?: string): string {
  const firstName = name && name.trim() ? name.trim().split(/\s+/)[0] : "Seeker";
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12121c;border:1px solid #2a2a3a;border-radius:16px;padding:32px;">
            <tr>
              <td align="center" style="font-size:32px;padding-bottom:8px;">✦</td>
            </tr>
            <tr>
              <td align="center" style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#f0ede8;padding-bottom:16px;">Welcome to MysticSage</td>
            </tr>
            <tr>
              <td style="color:#a8a6a0;font-size:15px;line-height:1.7;padding-bottom:16px;">
                Hello ${firstName},<br/><br/>
                You're in. Daily tarot pulls, horoscopes, and spiritual guidance are on their way to your inbox.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:16px;">
                <a href="https://mysticsages.com/reading" style="display:inline-block;background:linear-gradient(135deg,#b466ff,#8a4fcf);color:#ffffff;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none;">Pull Your First Free Reading</a>
              </td>
            </tr>
            <tr>
              <td style="color:#777;font-size:12px;line-height:1.6;padding-top:8px;border-top:1px solid #2a2a3a;">
                You received this email because you subscribed at mysticsages.com.
                Readings are for entertainment and spiritual wellness purposes only.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}
