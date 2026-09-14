/**
 * Generates one day pack of X marketing material: 30 tweets (10 accounts x
 * morning / midday / evening) plus the 30 matching 1600x900 images.
 *
 * Usage:
 *   node scripts/generate-x-pack.mjs 22 28
 *
 * Output:
 *   public/images/x/Day <n>/<account>-<slot>.png   (the 30 images)
 *   public/images/x/docs/X-10accounts-day<n>-tweets.txt
 *
 * The copy is deliberately varied per day rather than reusing one template, so
 * the ten accounts do not look like the same bot posting ten times. Every card
 * reveal post is checked to make sure its three options are distinct.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const xRoot = path.join(repoRoot, "public", "images", "x");
const docsRoot = path.join(xRoot, "docs");

// ---------------------------------------------------------------------------
// Per-day data
// ---------------------------------------------------------------------------

const DAYS = [
  {
    day: 22, card: "Strength", kw: "courage, patience", kwTitle: "Courage and Patience",
    insight: "Quiet power beats loud force.",
    element: "Water", elementAction: "feel it through",
    zwSigns: ["Cancer", "Scorpio", "Pisces"], zwNudges: ["feel it fully", "follow through", "take the risk"],
    sdSigns: ["Pisces", "Cancer", "Scorpio"], sdLines: ["patience pays", "say yes", "trust the timing"],
    luckyColor: "deep teal", luckyNumber: 6,
    picks: ["Strength", "The Moon", "The Star"],
  },
  {
    day: 23, card: "The High Priestess", kw: "intuition, stillness", kwTitle: "Intuition and Stillness",
    insight: "The answer arrived before the question did.",
    element: "Fire", elementAction: "act on the idea",
    zwSigns: ["Aries", "Leo", "Sagittarius"], zwNudges: ["move first", "follow through", "take the risk"],
    sdSigns: ["Leo", "Sagittarius", "Aries"], sdLines: ["momentum builds", "say yes", "trust the timing"],
    luckyColor: "amber", luckyNumber: 3,
    picks: ["The High Priestess", "The Emperor", "The Fool"],
  },
  {
    day: 24, card: "Death", kw: "endings, transformation", kwTitle: "Endings and Transformation",
    insight: "What ends was already finished.",
    element: "Earth", elementAction: "build it slowly",
    zwSigns: ["Taurus", "Virgo", "Capricorn"], zwNudges: ["start the habit", "follow through", "take the risk"],
    sdSigns: ["Capricorn", "Taurus", "Virgo"], sdLines: ["patience pays", "say yes", "trust the timing"],
    luckyColor: "forest green", luckyNumber: 4,
    picks: ["Death", "The Tower", "Judgement"],
  },
  {
    day: 25, card: "The Empress", kw: "abundance, nurture", kwTitle: "Abundance and Nurture",
    insight: "What you tend grows faster than what you chase.",
    element: "Air", elementAction: "say the true thing",
    zwSigns: ["Gemini", "Libra", "Aquarius"], zwNudges: ["speak up", "follow through", "take the risk"],
    sdSigns: ["Aquarius", "Gemini", "Libra"], sdLines: ["clarity arrives", "say yes", "trust the timing"],
    luckyColor: "rose gold", luckyNumber: 8,
    picks: ["The Empress", "The Star", "The Sun"],
  },
  {
    day: 26, card: "The Magician", kw: "will, focus", kwTitle: "Will and Focus",
    insight: "You already have the tools. Use one.",
    element: "Water", elementAction: "trust what you sense",
    zwSigns: ["Pisces", "Cancer", "Scorpio"], zwNudges: ["trust the pull", "follow through", "take the risk"],
    sdSigns: ["Scorpio", "Pisces", "Cancer"], sdLines: ["depth pays", "say yes", "trust the timing"],
    luckyColor: "indigo", luckyNumber: 1,
    picks: ["The Magician", "The Hermit", "The Chariot"],
  },
  {
    day: 27, card: "Temperance", kw: "balance, patience", kwTitle: "Balance and Patience",
    insight: "Slow is not late. Slow is steady.",
    element: "Fire", elementAction: "start before you feel ready",
    zwSigns: ["Sagittarius", "Aries", "Leo"], zwNudges: ["begin now", "follow through", "take the risk"],
    sdSigns: ["Aries", "Leo", "Sagittarius"], sdLines: ["boldness pays", "say yes", "trust the timing"],
    luckyColor: "copper", luckyNumber: 9,
    picks: ["Temperance", "The World", "Strength"],
  },
  {
    day: 28, card: "The Chariot", kw: "willpower, direction", kwTitle: "Willpower and Direction",
    insight: "Direction matters more than speed.",
    element: "Earth", elementAction: "finish what you started",
    zwSigns: ["Capricorn", "Taurus", "Virgo"], zwNudges: ["hold the line", "follow through", "take the risk"],
    sdSigns: ["Virgo", "Capricorn", "Taurus"], sdLines: ["detail pays", "say yes", "trust the timing"],
    luckyColor: "charcoal", luckyNumber: 2,
    picks: ["The Chariot", "The Moon", "The World"],
  },
];

// ---------------------------------------------------------------------------
// Rotating pools (indexed by day so the ten accounts never repeat in a week)
// ---------------------------------------------------------------------------

// Each entry carries both the tweet sentence and the shorter headline/subline
// the image uses, so the post reads naturally and the graphic stays punchy.
const TIPS = [
  { t: "Tip: pull your card before you open your phone. Your first thought matters.", h: "Pull Before You Scroll", s: "Your first thought matters" },
  { t: "One card is enough. You do not need a ten-card answer to a one-line question.", h: "One Card Is Enough", s: "A ten-card spread is not a better answer" },
  { t: "Reading tip: write the question before you shuffle. Vagueness gets vague answers.", h: "Ask Before You Shuffle", s: "Vagueness gets vague answers" },
  { t: "Keep a journal, even a messy one. The pattern shows up about twenty entries in.", h: "Write It Down", s: "The pattern shows up in the entries" },
  { t: "Sit with the card before you reach for the book. The first reading is rarely the whole story.", h: "Sit With It", s: "The first reading is rarely the whole story" },
  { t: "There are no wrong cards. There are only cards you did not want to see.", h: "No Wrong Cards", s: "Only cards you did not want to see" },
  { t: "Read the picture, not just the keyword. The image carries half the meaning.", h: "Read The Picture", s: "The image is half the meaning" },
  { t: "Pull once. Pulling again until you like the answer is negotiating, not reading.", h: "One Question, One Pull", s: "Pulling again is negotiating" },
  { t: "Look at what repeats. Three cups cards in one spread is an emotional reading.", h: "Notice The Repeats", s: "Three cups is an emotional reading" },
  { t: "End every reading with one action. A reading that changes nothing is entertainment.", h: "End With An Action", s: "A reading that changes nothing is entertainment" },
  { t: "Start with the Major Arcana. Twenty-two cards tell one complete story.", h: "Start With The Major Arcana", s: "Twenty-two cards tell one story" },
  { t: "Reversals are optional. Pick one system and stay consistent with it.", h: "Reversals Are Optional", s: "Pick one system and stay consistent" },
  { t: "Trust your first impression. Say it out loud before you check the book.", h: "Your First Impression Counts", s: "Say it before you check the book" },
  { t: "Track your pulls for a month. Twenty entries and your own patterns appear.", h: "Track For A Month", s: "Twenty entries and your patterns appear" },
  { t: "Ask about yourself, not about what someone else is going to do.", h: "Ask About Yourself", s: "Not about what someone else will do" },
  { t: "Three cards cover most questions. A bigger spread is not a better answer.", h: "Small Spread, Real Answer", s: "Three cards cover most questions" },
  { t: "Let the cards argue. The tension between two cards is the most useful part.", h: "Let The Cards Argue", s: "The tension is the most useful part" },
  { t: "One card a day beats a ten-card binge. Morning pulls compound.", h: "Morning Pulls Compound", s: "One card a day beats a binge" },
  { t: "Pause before you shuffle. Give the question a moment to land.", h: "Silence Before The Deck", s: "Give the question a moment to land" },
  { t: "Read for clarity, not for permission. The cards are not a referee.", h: "Read For Clarity", s: "The cards are not a referee" },
  { t: "Write down what actually happened. Without that, the reading teaches you nothing.", h: "Close The Loop", s: "Write down what actually happened" },
];

const LOVE_NOTES = [
  "Timing is not a punishment.",
  "Do not shrink to be chosen.",
  "The right person will not need convincing.",
  "Your standards are not unrealistic.",
  "Closure is not a conversation, it is a decision.",
  "You can love someone and still outgrow them.",
  "Peace is not boring. It is new.",
];

const LOVE_QUESTIONS = [
  "do I feel chosen, or do I feel tolerated?",
  "am I staying for love, or for familiarity?",
  "what am I hoping they will become?",
  "would I accept this from a friend?",
  "am I being loved, or being managed?",
  "what would I choose if I were not afraid?",
  "am I waiting for a version of them that does not exist?",
];

const HEALING_LINES = [
  "Healing is not linear. Some days you grow, some days you rest. Both count.",
  "You are allowed to grieve something you chose to leave.",
  "Rest is not a reward. It is a requirement.",
  "The version of you that survived is not the version you have to stay.",
  "You do not have to explain your peace to anyone.",
  "Progress can look like going to bed early.",
  "You are not behind. You are rebuilding.",
];

const FORTUNES = [
  "a message you were waiting for is closer than you think.",
  "an old door is closing so a better one can open.",
  "someone is quietly rooting for you.",
  "the answer arrives when you stop forcing it.",
  "a small win is coming before the week ends.",
  "the thing you almost gave up on is still alive.",
  "you are one honest conversation away from relief.",
];

const UNIVERSE = [
  "you are closer than it feels.",
  "the delay is protecting you.",
  "you already know. You are just waiting for permission.",
  "nothing you survived was wasted.",
  "the next yes will make sense of this no.",
  "your patience is being noticed.",
  "you are allowed to want what you want.",
];

const NUDGES = [
  "let it be simpler",
  "send the message",
  "say the honest thing",
  "rest without guilt",
  "start before you feel ready",
  "finish the small thing",
  "ask for what you need",
];

const TONIGHT_SIGNS = [
  "a chapter is closing. Let it.",
  "the answer is quieter than you expected.",
  "someone is thinking of you tonight.",
  "the next step is smaller than you think.",
  "you are being guided, not punished.",
  "rest is part of the plan.",
  "the timing is finally moving.",
];

// ---------------------------------------------------------------------------
// Copy builder
// ---------------------------------------------------------------------------

function buildTweets(d, i) {
  const tip = TIPS[i % TIPS.length];
  const love = LOVE_NOTES[i % LOVE_NOTES.length];
  const lq = LOVE_QUESTIONS[i % LOVE_QUESTIONS.length];
  const heal = HEALING_LINES[i % HEALING_LINES.length];
  const fort = FORTUNES[i % FORTUNES.length];
  const uni = UNIVERSE[i % UNIVERSE.length];
  const nudge = NUDGES[i % NUDGES.length];
  const tonight = TONIGHT_SIGNS[i % TONIGHT_SIGNS.length];
  const [s1, s2, s3] = d.zwSigns;
  const [n1, n2, n3] = d.zwNudges;
  const [d1, d2, d3] = d.sdSigns;
  const [l1, l2, l3] = d.sdLines;
  const [p1, p2, p3] = d.picks;

  const rows = [
    ["@MysticSage", "br", [
      ["MORNING", `New day, new pull. Ask one honest question. Free at mysticsages.com`, ["New Day, New Pull", "Ask one honest question"]],
      ["MIDDAY",  `${d.card}: ${d.kw}. ${d.insight}`, [d.card, d.kwTitle]],
      ["EVENING", `Night reset: release one thing. Tomorrow is a clean page.`, ["Release One Thing", "Tomorrow is a clean page"]],
    ]],
    ["@DailyTarotDraw", "da", [
      ["MORNING", `Card of the Day: ${d.card}. ${d.kwTitle}.`, [d.card, d.kwTitle]],
      ["MIDDAY",  `Pick a card: 1) ${p1} 2) ${p2} 3) ${p3}. Reply with a number.`, ["Pick A Card", "Reply 1, 2 or 3"]],
      ["EVENING", `Tonight's pull: ${d.card}. What is it asking you to see?`, ["Tonight's Pull", `${d.card} - what is it asking you to see?`]],
    ]],
    ["@TarotGuidance", "tg", [
      ["MORNING", TIPS[i * 3].t, [TIPS[i * 3].h, TIPS[i * 3].s]],
      ["MIDDAY",  TIPS[i * 3 + 1].t, [TIPS[i * 3 + 1].h, TIPS[i * 3 + 1].s]],
      ["EVENING", TIPS[i * 3 + 2].t, [TIPS[i * 3 + 2].h, TIPS[i * 3 + 2].s]],
    ]],
    ["@TheCardSpeaks", "cs", [
      ["MORNING", `${d.card} means ${d.kw}. Let it sit with you today.`, [d.card, "What it means today"]],
      ["MIDDAY",  `Reversed ${d.card}: the energy is blocked, delayed, or asking you to look inward.`, [`Reversed ${d.card}`, "Blocked, delayed, or inward"]],
      ["EVENING", `Night card: ${d.card}. ${d.insight}`, [`Night Card: ${d.card}`, d.insight]],
    ]],
    ["@ZodiacWisdom", "zw", [
      ["MORNING", `${s1}: ${n1}. ${s2}: ${n2}. ${s3}: ${n3}.`, [`${d.element} Signs`, `${s1}: ${n1}`]],
      ["MIDDAY",  `Fire, earth, air or water - ${d.element} signs are being asked to ${d.elementAction} this week.`, [`${d.element} Signs This Week`, `Asked to ${d.elementAction}`]],
      ["EVENING", `Tonight: slow down. Even the loudest sign needs a quiet hour.`, ["Slow Down Tonight", "Even the loudest sign needs a quiet hour"]],
    ]],
    ["@StarSignDaily", "sd", [
      ["MORNING", `${d1}: ${l1}. ${d2}: ${l2}. ${d3}: ${l3}.`, [`${d1} Season`, `${d2} and ${d3} too`]],
      ["MIDDAY",  `Which sign are you: sun, moon or rising? Comment and find your people.`, ["Sun, Moon or Rising?", "Comment and find your people"]],
      ["EVENING", `Tomorrow's energy: ${d1} leads with instinct. ${d2} leads with courage.`, ["Tomorrow's Energy", `${d1} and ${d2} lead the way`]],
    ]],
    ["@LoveTarotRead", "lt", [
      ["MORNING", `Love note: ${love}`, ["Love Note", love]],
      ["MIDDAY",  `The Lovers card is about alignment, not just romance. Do your choices match your values?`, ["The Lovers", "Alignment, not just romance"]],
      ["EVENING", `Tonight ask yourself honestly: ${lq}`, ["Tonight, Ask Yourself", lq.charAt(0).toUpperCase() + lq.slice(1)]],
    ]],
    ["@HeartTarot", "ht", [
      ["MORNING", heal, ["Healing Is Not Linear", "Some days you grow, some days you rest"]],
      ["MIDDAY",  `Repeat after me: I am allowed to outgrow people and still love them.`, ["Repeat After Me", "I can outgrow people and still love them"]],
      ["EVENING", `Evening check-in: what is one kind thing you did for yourself today?`, ["Evening Check-In", "One kind thing for yourself"]],
    ]],
    ["@DailyFortuneTell", "df", [
      ["MORNING", `Lucky today: ${d.luckyColor}, number ${d.luckyNumber}. Watch where they show up.`, ["Lucky Today", `${d.luckyColor}, number ${d.luckyNumber}`]],
      ["MIDDAY",  `Fortune: ${fort}`, ["Your Fortune", fort]],
      ["EVENING", `Evening fortune: what you release now makes room for what arrives this week.`, ["Evening Fortune", "Make room for what arrives"]],
    ]],
    ["@FortuneTold", "ft", [
      ["MORNING", `The universe wants you to know: ${uni}`, ["The Universe Says", uni]],
      ["MIDDAY",  `Today's nudge: ${nudge}. Courage is doing the small thing first.`, ["Today's Nudge", nudge]],
      ["EVENING", `Tonight's sign: ${tonight}`, ["Tonight's Sign", tonight]],
    ]],
  ];
  return { rows, picks: [p1, p2, p3] };
}

// ---------------------------------------------------------------------------
// Image rendering
// ---------------------------------------------------------------------------

const BG = "#0A0A0F";
const ACCENT = "#B466FF";
const HEAD = "#F0EDE8";
const MUTED = "#A8A6A0";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if (!line.length) line = w;
    else if ((line + " " + w).length <= max) line += " " + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

function imageSvg(headline, subline) {
  const hl = wrap(headline, 26);
  // The subline is often reused from a tweet where it sits mid-sentence, so it
  // may start lowercase. On the graphic it stands alone, so capitalise it.
  const sub = String(subline).charAt(0).toUpperCase() + String(subline).slice(1);
  const sl = wrap(sub, 58);
  const hlSize = hl.length > 1 ? 46 : 56;
  const hlTop = 362 - (hl.length - 1) * (hlSize * 0.62);

  const hlSvg = hl.map((l, i) =>
    `<text x="800" y="${Math.round(hlTop + i * hlSize * 1.18)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${hlSize}" font-weight="700" fill="${HEAD}">${esc(l)}</text>`
  ).join("\n  ");

  const slSvg = sl.slice(0, 2).map((l, i) =>
    `<text x="800" y="${469 + i * 32}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="${MUTED}">${esc(l)}</text>`
  ).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="${BG}"/>
  <text x="800" y="116" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="10" fill="${ACCENT}">M Y S T I C S A G E</text>
  ${hlSvg}
  ${slSvg}
  <text x="800" y="516" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="21" fill="${MUTED}">Free reading at mysticsages.com</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const from = Number(process.argv[2] ?? DAYS[0].day);
const to = Number(process.argv[3] ?? DAYS[DAYS.length - 1].day);
const selected = DAYS.filter((d) => d.day >= from && d.day <= to);

if (!selected.length) {
  console.error(`No day data for the range ${from}-${to}.`);
  process.exit(1);
}

await mkdir(docsRoot, { recursive: true });

let imageCount = 0;
const problems = [];

for (const d of selected) {
  const idx = DAYS.findIndex((x) => x.day === d.day);
  const { rows, picks } = buildTweets(d, idx);

  if (new Set(picks).size !== 3) {
    problems.push(`Day ${d.day}: the card reveal options are not three distinct cards`);
  }

  const dayDir = path.join(xRoot, `Day ${d.day}`);
  await mkdir(dayDir, { recursive: true });

  const out = [
    `MysticSage - Day ${d.day} Tweets (30)`,
    `Images: mysticsage/public/images/x/Day ${d.day}/`,
    "",
  ];

  for (const [account, prefix, slots] of rows) {
    out.push(`=== ${account} ===`);
    for (const [slot, text, img] of slots) {
      const file = `${prefix}-${slot.toLowerCase()}.png`;
      out.push(`[${slot}] ${file} :: ${text}`);
      if (/undefined|null|NaN/.test(text) || img.some((v) => /undefined|null|NaN/.test(v))) {
        problems.push(`Day ${d.day} ${prefix}-${slot}: placeholder text left in the copy`);
      }
      await sharp(Buffer.from(imageSvg(img[0], img[1]))).png({ compressionLevel: 9 }).toFile(path.join(dayDir, file));
      imageCount++;
    }
    out.push("");
  }

  const docPath = path.join(docsRoot, `X-10accounts-day${d.day}-tweets.txt`);
  await writeFile(docPath, out.join("\n"), "utf8");
  console.log(`Day ${d.day}: 30 tweets + 30 images -> ${path.relative(repoRoot, docPath)}`);
}

console.log(`\nImages written: ${imageCount}`);
if (problems.length) {
  console.error("\nProblems found:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log("Quality check: no placeholders, every reveal post has three distinct cards.");
