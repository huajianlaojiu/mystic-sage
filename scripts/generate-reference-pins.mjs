/**
 * Generates "reference" style pins: cheat sheets and quick-reference cards,
 * rather than the quote cards the daily batches use.
 *
 * Why a separate batch: Pinterest ranks on saves, and people save things they
 * expect to look at again — card lists, spreads, dates. A pretty affirmation
 * gets seen and forgotten, so the account accumulates impressions with almost
 * no saves, which is what keeps it out of search.
 *
 * Output: public/images/pins-reference/<slug>.png at 1000x1500 (Pinterest 2:3),
 * styled warm parchment for readability at feed size.
 *
 * Usage: node scripts/generate-reference-pins.mjs
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "public", "images", "pins-reference");

const W = 1000;
const H = 1500;
const BG = "#E9DCC4";
const BG_EDGE = "#DDCDAE";
const INK = "#2B2118";
const MUTED = "#6B5B4A";
const GOLD = "#A8823C";
// Headings carry the structure of a cheat sheet, so they get a darker gold
// than the decorative rules and footer. At #A8823C they sit at 2.6:1 against
// the parchment, which is hard to read once the pin is scaled down in a feed.
const GOLD_INK = "#8A6520";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function rows(list, { startY, lineH, size, gap }) {
  let y = startY;
  const out = [];
  for (const item of list) {
    if (item.divider) {
      out.push(`<line x1="120" y1="${y - size * 0.9}" x2="880" y2="${y - size * 0.9}" stroke="${GOLD}" stroke-width="1" opacity="0.45"/>`);
      y += lineH * 0.5;
      continue;
    }
    if (item.heading) {
      out.push(`<text x="120" y="${y}" font-family="Georgia, serif" font-size="${size + 4}" font-weight="700" fill="${GOLD_INK}">${esc(item.heading)}</text>`);
      y += lineH;
      continue;
    }
    if (item.left) {
      out.push(`<text x="120" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="700" fill="${INK}">${esc(item.left)}</text>`);
      out.push(`<text x="${item.x2 ?? 360}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" fill="${MUTED}">${esc(item.right)}</text>`);
    } else {
      out.push(`<text x="120" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" fill="${MUTED}">${esc(item.text)}</text>`);
    }
    y += lineH + (gap ?? 0);
  }
  return { svg: out.join("\n  "), endY: y };
}

function shell({ label, headline, sub, body, footer }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="vign" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="${BG_EDGE}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#vign)"/>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.55"/>
  <rect x="46" y="46" width="${W - 92}" height="${H - 92}" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.35"/>

  <text x="500" y="128" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600" letter-spacing="6" fill="${GOLD}">${esc(label)}</text>
  <text x="500" y="228" text-anchor="middle" font-family="Georgia, serif" font-size="${headline.length > 22 ? 46 : 56}" font-weight="700" fill="${INK}">${esc(headline)}</text>
  ${sub ? `<text x="500" y="278" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" fill="${MUTED}">${esc(sub)}</text>` : ""}
  <line x1="300" y1="318" x2="700" y2="318" stroke="${GOLD}" stroke-width="1.5" opacity="0.6"/>

  ${body}

  <line x1="300" y1="${H - 168}" x2="700" y2="${H - 168}" stroke="${GOLD}" stroke-width="1.5" opacity="0.6"/>
  <text x="500" y="${H - 112}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="5" fill="${GOLD}">MYSTICSAGE</text>
  <text x="500" y="${H - 74}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" fill="${MUTED}">${esc(footer)}</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// The pins
// ---------------------------------------------------------------------------

const PINS = [
  {
    slug: "planets-and-what-they-rule",
    label: "ASTROLOGY",
    headline: "Planets and What They Rule",
    sub: "Ten placements, in plain words",
    rows: [
      { left: "SUN", right: "identity, vitality, purpose" },
      { left: "MOON", right: "emotion, needs, memory" },
      { left: "MERCURY", right: "mind, speech, learning" },
      { left: "VENUS", right: "love, taste, values" },
      { left: "MARS", right: "drive, anger, desire" },
      { left: "JUPITER", right: "growth, belief, luck" },
      { left: "SATURN", right: "structure, limits, time" },
      { left: "URANUS", right: "disruption, freedom" },
      { left: "NEPTUNE", right: "dreams, illusion" },
      { left: "PLUTO", right: "power, transformation" },
    ],
    opts: { startY: 400, lineH: 82, size: 24 },
  },
  {
    slug: "cardinal-fixed-mutable",
    label: "ASTROLOGY",
    headline: "Cardinal, Fixed, Mutable",
    sub: "The three modes, and how each one acts",
    rows: [
      { heading: "Cardinal — starts" },
      { text: "Aries, Cancer, Libra, Capricorn" },
      { text: "Begins things. Initiates action." },
      { divider: true },
      { heading: "Fixed — sustains" },
      { text: "Taurus, Leo, Scorpio, Aquarius" },
      { text: "Holds the line. Resists being moved." },
      { divider: true },
      { heading: "Mutable — adapts" },
      { text: "Gemini, Virgo, Sagittarius, Pisces" },
      { text: "Adjusts, blends, moves on." },
    ],
    opts: { startY: 400, lineH: 66, size: 23 },
  },
  {
    slug: "zodiac-compatibility-elements",
    label: "ASTROLOGY",
    headline: "Zodiac Compatibility, Simplified",
    sub: "Start with the elements, not the signs",
    rows: [
      { heading: "Same element — easy" },
      { text: "Fire with fire, earth with earth, and so on." },
      { text: "Shared rhythm. Comfortable, sometimes stagnant." },
      { divider: true },
      { heading: "Fire + air — energising" },
      { text: "Air feeds fire. Ideas meet action." },
      { divider: true },
      { heading: "Earth + water — nourishing" },
      { text: "Water softens earth. Feeling meets form." },
      { divider: true },
      { heading: "Fire + water — steam" },
      { text: "Intense, reactive, rarely neutral." },
      { text: "Earth and air is the hardest pairing to balance." },
    ],
    opts: { startY: 392, lineH: 66, size: 23 },
  },
  {
    slug: "mercury-retrograde-guide",
    label: "ASTROLOGY",
    headline: "Surviving Mercury Retrograde",
    sub: "What to do, and what to skip",
    rows: [
      { heading: "Do" },
      { text: "Back up your files before it starts." },
      { text: "Reread, revise, renegotiate." },
      { text: "Double-check dates, times, and addresses." },
      { divider: true },
      { heading: "Skip" },
      { text: "Signing anything you have not read." },
      { text: "Launching something brand new." },
      { text: "Assuming a reply means what you think it means." },
      { divider: true },
      { heading: "The point" },
      { text: "A good season for revisiting. Not a curse." },
    ],
    opts: { startY: 392, lineH: 64, size: 23 },
  },
  {
    slug: "four-suits-cheat-sheet",
    label: "TAROT CHEAT SHEET",
    headline: "The Four Suits",
    sub: "What each one is actually about",
    rows: [
      { left: "WANDS", right: "Fire — action, ambition, drive" },
      { text: "When Wands dominate: something needs doing." },
      { divider: true },
      { left: "CUPS", right: "Water — emotion, love, memory" },
      { text: "When Cups dominate: feelings are the subject." },
      { divider: true },
      { left: "SWORDS", right: "Air — thought, words, conflict" },
      { text: "When Swords dominate: it is happening in your head." },
      { divider: true },
      { left: "PENTACLES", right: "Earth — money, work, the body" },
      { text: "When Pentacles dominate: resources are the question." },
    ],
    opts: { startY: 420, lineH: 74, size: 24 },
  },
  {
    slug: "shadow-work-prompts",
    label: "SPIRITUAL PRACTICE",
    headline: "8 Shadow Work Prompts",
    sub: "For the parts you would rather not look at",
    rows: [
      { left: "1", right: "What do I judge in others?" },
      { left: "2", right: "When did I last feel truly seen?" },
      { left: "3", right: "What am I pretending not to know?" },
      { left: "4", right: "Whose approval am I still waiting for?" },
      { left: "5", right: "Where do I say yes but mean no?" },
      { left: "6", right: "What am I afraid people will find out?" },
      { left: "7", right: "Who did I have to become to feel safe?" },
      { left: "8", right: "What would I do if no one were watching?" },
    ],
    opts: { startY: 430, lineH: 96, size: 23 },
  },
  {
    slug: "how-to-cleanse-a-tarot-deck",
    label: "TAROT PRACTICE",
    headline: "5 Ways to Cleanse a Deck",
    sub: "Pick one. You do not need all five.",
    rows: [
      { heading: "1. Knock and shuffle" },
      { text: "Knock twice on the deck, then shuffle it until" },
      { text: "it feels like yours again." },
      { divider: true },
      { heading: "2. Moonlight" },
      { text: "Leave it on a windowsill overnight, ideally at a full moon." },
      { divider: true },
      { heading: "3. Salt or crystal" },
      { text: "Rest clear quartz or selenite on top for a few hours." },
      { divider: true },
      { heading: "4. Smoke" },
      { text: "Pass the deck through rosemary, cedar, or palo santo." },
      { divider: true },
      { heading: "5. Put it back in order" },
      { text: "Ace to King, every suit. A reset, not a ritual." },
    ],
    opts: { startY: 380, lineH: 60, size: 22 },
  },
  {
    slug: "moon-sign-needs",
    label: "ASTROLOGY",
    headline: "What Your Moon Sign Needs",
    sub: "The placement that explains the most",
    rows: [
      { left: "ARIES", right: "movement and directness" },
      { left: "TAURUS", right: "routine and physical comfort" },
      { left: "GEMINI", right: "conversation and variety" },
      { left: "CANCER", right: "emotional safety first" },
      { left: "LEO", right: "appreciation, said out loud" },
      { left: "VIRGO", right: "order and reassurance" },
      { left: "LIBRA", right: "harmony, being met halfway" },
      { left: "SCORPIO", right: "depth and loyalty" },
      { left: "SAGITTARIUS", right: "space and meaning" },
      { left: "CAPRICORN", right: "structure and time alone" },
      { left: "AQUARIUS", right: "autonomy and clear logic" },
      { left: "PISCES", right: "quiet, beauty, no justification" },
    ],
    opts: { startY: 398, lineH: 72, size: 22 },
  },
  {
    slug: "life-path-numbers-cheat-sheet",
    label: "NUMEROLOGY",
    headline: "Life Path Numbers",
    sub: "1 through 9, and the master numbers",
    rows: [
      { left: "1", right: "The Initiator — independence" },
      { left: "2", right: "The Diplomat — partnership" },
      { left: "3", right: "The Communicator — expression" },
      { left: "4", right: "The Builder — structure" },
      { left: "5", right: "The Explorer — freedom" },
      { left: "6", right: "The Caretaker — service" },
      { left: "7", right: "The Seeker — analysis" },
      { left: "8", right: "The Achiever — authority" },
      { left: "9", right: "The Humanitarian — release" },
      { divider: true },
      { left: "11", right: "The Intuitive — master number" },
      { left: "22", right: "The Master Builder — master number" },
      { left: "33", right: "The Master Teacher — master number" },
    ],
    opts: { startY: 392, lineH: 68, size: 23 },
  },
  {
    slug: "questions-to-ask-your-deck",
    label: "TAROT PRACTICE",
    headline: "Questions That Open a Reading",
    sub: "Closed questions give closed answers",
    rows: [
      { text: "Instead of: Will he come back?" },
      { text: "Ask: What do I need to understand about this?" },
      { divider: true },
      { text: "Instead of: Will I get the job?" },
      { text: "Ask: What should I focus on before the interview?" },
      { divider: true },
      { text: "Instead of: Is this the right choice?" },
      { text: "Ask: What am I not seeing about this decision?" },
      { divider: true },
      { text: "Instead of: When will things get better?" },
      { text: "Ask: What can I do this week to change the pattern?" },
      { divider: true },
      { heading: "The rule" },
      { text: "Ask about yourself, not about what" },
      { text: "someone else is going to do." },
    ],
    opts: { startY: 380, lineH: 58, size: 22 },
  },
  {
    slug: "tarot-number-meanings",
    label: "TAROT CHEAT SHEET",
    headline: "What the Numbers Mean",
    sub: "Ace through Ten, in any of the four suits",
    rows: [
      { left: "Ace", right: "a beginning, pure potential" },
      { left: "2", right: "balance, choice, pairing" },
      { left: "3", right: "growth, collaboration" },
      { left: "4", right: "stability, structure" },
      { left: "5", right: "friction, change, loss" },
      { left: "6", right: "harmony, giving, memory" },
      { left: "7", right: "assessment, patience, strategy" },
      { left: "8", right: "momentum, mastery, movement" },
      { left: "9", right: "fruition, almost there" },
      { left: "10", right: "the end of a cycle" },
    ],
    opts: { startY: 420, lineH: 84, size: 23 },
  },
];

await mkdir(outDir, { recursive: true });

let made = 0;
for (const pin of PINS) {
  const body = rows(pin.rows, pin.opts);
  if (body.endY > H - 200) {
    console.warn(`  ! ${pin.slug} runs to y=${Math.round(body.endY)}, footer starts at ${H - 200}`);
  }
  const svg = shell({ label: pin.label, headline: pin.headline, sub: pin.sub, body: body.svg, footer: "Free daily tarot reading at mysticsages.com" });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(outDir, pin.slug + ".png"));
  console.log(`  ${pin.slug}.png  (body ends y=${Math.round(body.endY)})`);
  made++;
}

console.log(`\n${made} reference pins written to public/images/pins-reference/`);
