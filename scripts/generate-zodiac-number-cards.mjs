/**
 * Generates "all twelve signs" cards: one line per zodiac sign, each paired
 * with an angel number for the week.
 *
 * Why this format: a plain "comment your sign" post only asks for something.
 * A post that gives every sign its own line gives twelve different people a
 * reason to stop, and the number makes it feel specific to them rather than
 * mass-produced. It is the same amount of work to post and gets far more
 * replies.
 *
 * Usage:
 *   node scripts/generate-zodiac-number-cards.mjs
 *
 * Output:
 *   public/images/x/zodiac-number/<slug>.png
 *   public/images/x/zodiac-number/copy.md
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "public", "images", "x", "zodiac-number");

const W = 1600;
const H = 900;
const BG = "#0A0A0F";
const ACCENT = "#B466FF";
const HEAD = "#F0EDE8";
const MUTED = "#A8A6A0";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Two variants so the same card does not go out on two accounts in one week.
const VARIANTS = [
  {
    slug: "star-sign-daily",
    account: "@StarSignHQ",
    headline: "Your Sign and Your Number",
    sub: "The angel number showing up for you this week",
    copy: [
      "All 12 signs, each with the angel number that keeps showing up for you this week.",
      "",
      "Find your line and tell me if it lands.",
    ].join("\n"),
    rows: [
      ["ARIES", "111", "the thing you keep circling is ready to start"],
      ["TAURUS", "444", "the ground under you is steadier than it feels"],
      ["GEMINI", "555", "a conversation this week changes the shape of things"],
      ["CANCER", "222", "stop forcing it, the timing is still forming"],
      ["LEO", "888", "recognition is arriving, let yourself take it"],
      ["VIRGO", "333", "the help you need is closer than you think"],
      ["LIBRA", "999", "something is ending and you already know what"],
      ["SCORPIO", "717", "your first read on this was the correct one"],
      ["SAGITTARIUS", "777", "say yes before you feel completely ready"],
      ["CAPRICORN", "1234", "the slow work is finally starting to show"],
      ["AQUARIUS", "1212", "a decision you postponed is asking again"],
      ["PISCES", "000", "make space, something new is already moving"],
    ],
  },
  {
    slug: "zodiac-wisdom",
    account: "@ZodiacWisdomHQ",
    headline: "Twelve Signs, Twelve Numbers",
    sub: "What the cards are saying for each sign right now",
    copy: [
      "Twelve signs, twelve numbers. Yours is in here somewhere.",
      "",
      "Which line hit hardest? Comment your sign.",
    ].join("\n"),
    rows: [
      ["ARIES", "777", "the risk you talked yourself out of is still open"],
      ["TAURUS", "222", "you are being asked to wait three more days"],
      ["GEMINI", "111", "a message you send this week lands better than expected"],
      ["CANCER", "888", "money moves once you stop apologising for asking"],
      ["LEO", "333", "someone is talking about you in a good way"],
      ["VIRGO", "999", "the habit you are trying to keep is the wrong one"],
      ["LIBRA", "444", "a boundary you set is holding better than you think"],
      ["SCORPIO", "1212", "the answer is the option you keep skipping"],
      ["SAGITTARIUS", "555", "a plan changes and it changes for the better"],
      ["CAPRICORN", "717", "you already know who to trust on this"],
      ["AQUARIUS", "1234", "one small step this week unlocks the next three"],
      ["PISCES", "4444", "rest is the productive choice right now"],
    ],
  },
];

function cardSvg(v) {
  const left = v.rows.slice(0, 6);
  const right = v.rows.slice(6);

  const renderColumn = (rows, x) =>
    rows
      .map((row, i) => {
        const y = 300 + i * 88;
        const [sign, num, line] = row;
        return [
          `<text x="${x}" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="23" font-weight="700" letter-spacing="1" fill="${HEAD}">${esc(sign)}</text>`,
          `<text x="${x + 250}" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="23" font-weight="700" fill="${ACCENT}">${esc(num)}</text>`,
          `<text x="${x}" y="${y + 30}" font-family="Segoe UI, Arial, sans-serif" font-size="19" fill="${MUTED}">${esc(line)}</text>`,
        ].join("\n  ");
      })
      .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <text x="800" y="82" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="10" fill="${ACCENT}">M Y S T I C S A G E</text>
  <text x="800" y="162" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="700" fill="${HEAD}">${esc(v.headline)}</text>
  <text x="800" y="210" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="23" fill="${MUTED}">${esc(v.sub)}</text>
  <line x1="620" y1="243" x2="980" y2="243" stroke="${ACCENT}" stroke-width="1.5" opacity="0.5"/>
  <line x1="790" y1="285" x2="790" y2="812" stroke="${ACCENT}" stroke-width="0.8" opacity="0.18"/>
  ${renderColumn(left, 100)}
  ${renderColumn(right, 880)}
  <text x="800" y="862" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="${MUTED}">Free reading at mysticsages.com</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });

for (const v of VARIANTS) {
  if (v.rows.length !== 12) {
    throw new Error(`${v.slug}: expected 12 rows, got ${v.rows.length}`);
  }
  const dupes = v.rows.map((r) => r[1]).filter((n, i, a) => a.indexOf(n) !== i);
  if (dupes.length) {
    throw new Error(`${v.slug}: duplicate numbers ${dupes.join(", ")}`);
  }
  await sharp(Buffer.from(cardSvg(v)))
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, `${v.slug}.png`));
  console.log(`${v.slug}.png  ->  ${v.account}`);
}

const copyFile = VARIANTS.map((v) =>
  [
    `## ${v.account}`,
    "",
    `Image: \`${v.slug}.png\``,
    "",
    "```",
    v.copy,
    "```",
    "",
  ].join("\n"),
).join("\n");

await writeFile(path.join(outDir, "copy.md"), `# Zodiac number cards\n\n${copyFile}`, "utf8");
console.log(`\n${VARIANTS.length} cards written to public/images/x/zodiac-number/`);
