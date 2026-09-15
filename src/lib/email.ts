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
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

type ReportCard = { name: string; position: string; emoji: string; keywords: string };

/** Escape user- and model-supplied text before it goes into the email HTML. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function detailedReportEmailHtml(
  question: string,
  reading: string,
  cards: ReportCard[]
): string {
  const q = question && question.trim() ? question.trim() : "What do I need to know right now?";
  const cardHtml = cards
    .map(
      (c) => `
        <tr>
          <td align="center" style="font-size:26px;padding:12px 8px 4px;">${c.emoji}</td>
          <td style="padding:12px 8px 4px;">
            <div style="font-size:11px;font-weight:600;color:#b466ff;text-transform:uppercase;letter-spacing:0.5px;">${c.position}</div>
            <div style="font-size:15px;font-weight:700;color:#f0ede8;">${c.name}</div>
            <div style="font-size:12px;color:#8a8a96;">${c.keywords}</div>
          </td>
        </tr>`
    )
    .join("");

  // Preserve paragraph breaks from the AI text.
  const bodyHtml = reading
    .split(/\n+/)
    .map((p: string) => p.trim())
    .filter(Boolean)
    .map((p: string) => {
      // Models sometimes wrap headings in markdown; strip it so the email
      // shows clean text instead of literal ** or # characters.
      const clean = escapeHtml(p)
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/^#{1,6}\s*/, "")
        .trim();
      const isHeading = /^[A-Z][A-Z0-9 &'\-]{2,40}$/.test(clean);
      return isHeading
        ? `<p style="color:#b466ff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:18px 0 8px;">${clean}</p>`
        : `<p style="color:#c9c7c2;font-size:15px;line-height:1.75;margin:0 0 14px;">${clean}</p>`;
    })
    .join("");

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#12121c;border:1px solid #2a2a3a;border-radius:16px;padding:32px;">
            <tr>
              <td align="center" style="font-size:30px;padding-bottom:6px;">✦</td>
            </tr>
            <tr>
              <td align="center" style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#f0ede8;padding-bottom:6px;">Your Detailed Tarot Report</td>
            </tr>
            <tr>
              <td align="center" style="color:#8a8a96;font-size:13px;padding-bottom:20px;">A ${cards.length}-card ${
                cards.length >= 10 ? "Celtic Cross " : ""
              }reading, prepared for you by MysticSage</td>
            </tr>
            <tr>
              <td style="background:rgba(180,102,255,0.07);border:1px solid rgba(180,102,255,0.22);border-radius:12px;padding:16px 18px;margin-bottom:20px;">
                <div style="font-size:11px;font-weight:600;color:#b466ff;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Your question</div>
                <div style="font-size:15px;color:#f0ede8;font-style:italic;">&ldquo;${escapeHtml(q)}&rdquo;</div>
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e16;border:1px solid #23232f;border-radius:12px;overflow:hidden;margin-bottom:22px;">
                  ${cardHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 4px 24px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:18px;">
                <a href="https://mysticsages.com/reading" style="display:inline-block;background:linear-gradient(135deg,#b466ff,#8a4fcf);color:#ffffff;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none;">Pull Another Reading</a>
              </td>
            </tr>
            <tr>
              <td style="color:#777;font-size:12px;line-height:1.6;padding-top:10px;border-top:1px solid #2a2a3a;">
                This reading is for entertainment and spiritual wellness purposes only.
                You received this email because you purchased a Detailed Report at mysticsages.com.
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

/**
 * Confirmation and recovery emails are sent by this app rather than by
 * Supabase Auth. Supabase's own mailer was configured but never actually used
 * its SMTP settings, so its messages never reached users; sending through the
 * same Resend path as the welcome email is the one that is proven to deliver.
 */
function authEmailShell(heading: string, body: string, ctaLabel: string, link: string, footer: string): string {
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
              <td align="center" style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#f0ede8;padding-bottom:16px;">${heading}</td>
            </tr>
            <tr>
              <td style="color:#a8a6a0;font-size:15px;line-height:1.7;padding-bottom:16px;">${body}</td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:16px;">
                <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#b466ff,#8a4fcf);color:#ffffff;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none;">${ctaLabel}</a>
              </td>
            </tr>
            <tr>
              <td style="color:#777;font-size:12px;line-height:1.6;padding-top:8px;border-top:1px solid #2a2a3a;">
                ${footer}<br/>
                If the button does not work, copy this address into your browser:<br/>
                <span style="color:#8a8a99;word-break:break-all;">${link}</span>
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

export function confirmationEmailHtml(link: string): string {
  return authEmailShell(
    "Confirm your email address",
    "You are one click away from finishing your MysticSage account. Once confirmed, you can pull a free reading every day and keep your reading history.",
    "Confirm email address",
    link,
    "You received this email because someone signed up at mysticsages.com with this address. If that was not you, you can ignore it and nothing will happen."
  );
}

export function recoveryEmailHtml(link: string): string {
  return authEmailShell(
    "Reset your password",
    "We received a request to reset the password on your MysticSage account. The link below lets you choose a new one. It expires in an hour.",
    "Choose a new password",
    link,
    "If you did not request a password reset, you can safely ignore this email. Your password will not change."
  );
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
