/**
 * Client-side tarot share card generator.
 * Draws a 1200x630 (X card preview ratio) PNG card on a <canvas> with the
 * same mystical style as the site: dark nebula background, glowing cards,
 * reading summary, brand and URL. Zero dependencies.
 */

export type ShareCardItem = {
  name: string;
  keywords: string;
  position: string;
  emoji: string;
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawGlow(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1200, 630);
}

const POSITION_COLORS: Record<string, string> = {
  Past: "#c084ff",
  Present: "#ffd27a",
  Future: "#8affc1",
};

export function summarize(reading: string, max = 72): string {
  const flat = reading.replace(/\s+/g, " ").trim();
  const noQuote = flat.replace(/^["']|["']$/g, "");
  if (noQuote.length <= max) return noQuote;
  return noQuote.slice(0, max).replace(/\s+\S*$/, "") + "...";
}

export async function generateShareCard(cards: ShareCardItem[], reading: string): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 1200, 630);
  bg.addColorStop(0, "#07060f");
  bg.addColorStop(0.35, "#140b2e");
  bg.addColorStop(0.7, "#1a0f3a");
  bg.addColorStop(1, "#07060f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 630);

  // Glows
  drawGlow(ctx, 300, 220, 500, "rgba(124,77,255,0.28)");
  drawGlow(ctx, 1020, 440, 420, "rgba(255,150,255,0.14)");

  // Stars (deterministic-ish: fixed positions with small jitter)
  const stars: Array<[number, number, number, number]> = [
    [70,80,1.6,0.7],[180,150,1.2,0.5],[300,60,1.8,0.6],[430,120,1.1,0.45],[80,300,1.4,0.5],
    [160,420,1.2,0.4],[250,540,1.6,0.5],[350,470,1.1,0.4],[960,90,1.6,0.6],[1080,180,1.2,0.5],
    [1150,320,1.8,0.55],[1040,500,1.3,0.45],[900,580,1.5,0.5],[820,470,1.1,0.4],
  ];
  ctx.fillStyle = "#ffffff";
  for (const [x, y, r, o] of stars) {
    ctx.globalAlpha = o;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Brand
  ctx.fillStyle = "#c084ff";
  ctx.font = "24px Georgia, serif";
  ctx.fillText("MYSTICSAGE", 70, 90);

  // Title
  ctx.fillStyle = "#f5f2ff";
  ctx.font = "bold 52px Georgia, serif";
  ctx.fillText("YOUR CARDS", 70, 150);
  ctx.fillText("TODAY", 70, 205);

  // Divider
  ctx.strokeStyle = "#b466ff";
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 240);
  ctx.lineTo(330, 240);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Quote (from reading summary, split into two lines)
  ctx.fillStyle = "#e5d9ff";
  ctx.font = "italic 23px Georgia, serif";
  const summary = summarize(reading, 64);
  const mid = Math.min(summary.length, 32);
  const line1 = summary.slice(0, mid);
  const line2 = summary.slice(mid);
  ctx.fillText("\u201C" + line1, 70, 290);
  if (line2) ctx.fillText(line2, 70, 322);

  // Sub + CTA + URL
  ctx.fillStyle = "#9d8fb8";
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText("Get your own free tarot reading", 70, 420);

  roundRect(ctx, 70, 455, 230, 52, 26);
  ctx.fillStyle = "#b466ff";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 19px Arial, sans-serif";
  const prevTextAlign = ctx.textAlign;
  const prevTextBaseline = ctx.textBaseline;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("Pull Your Cards \u2726", 70 + 230 / 2, 455 + 52 / 2);
  ctx.textAlign = "left";
  ctx.textAlign = prevTextAlign;
  ctx.textBaseline = prevTextBaseline;

  ctx.fillStyle = "#7d6f9e";
  ctx.font = "16px Arial, sans-serif";
  ctx.fillText("mysticsages.com", 70, 560);

  // Cards (up to 3)
  const shown = cards.slice(0, 3);
  shown.forEach((c, i) => {
    const x = 520 + i * 215;
    const y = 90;
    const w = 190;
    const h = 460;
    const accent = POSITION_COLORS[c.position] || "#c084ff";

    // Card shadow/glow
    ctx.shadowColor = accent;
    ctx.shadowBlur = 18;
    roundRect(ctx, x, y, w, h, 16);
    ctx.fillStyle = "#1b1236";
    ctx.fill();
    ctx.shadowBlur = 0;

    // Card border + face
    roundRect(ctx, x, y, w, h, 16);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    roundRect(ctx, x + 18, y + 26, w - 36, 160, 10);
    ctx.fillStyle = accent + "2e";
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "88px serif";
    ctx.fillText(c.emoji || "\u{1F0CF}", x + w / 2, y + 172);

    ctx.fillStyle = "#f5f2ff";
    ctx.font = "bold 30px Georgia, serif";
    ctx.fillText(c.name, x + w / 2, y + 322);

    ctx.fillStyle = accent;
    ctx.font = "15px Arial, sans-serif";
    ctx.fillText(c.position.toUpperCase(), x + w / 2, y + 357);

    ctx.fillStyle = "#a89bc8";
    ctx.font = "16px Arial, sans-serif";
    ctx.fillText(c.keywords.split(",")[0] || "", x + w / 2, y + 428);
    ctx.textAlign = "left";
  });

  return canvas.toDataURL("image/png");
}
