import type { DrawnCard } from "@/lib/tarot";

/**
 * Voice/structure variants for the free reading.
 *
 * A daily product needs to feel different each time: if every reading follows
 * one template with the same opening, returning users notice within days.
 * Each style differs in angle and structure, not just in adjectives.
 */
type ReadingStyle = {
  key: string;
  voice: string;
  structure: string[];
  closing: string;
};

export const READING_STYLES: ReadingStyle[] = [
  {
    key: "wise-friend",
    voice:
      "Warm and grounded, like a wise friend who knows them well. A light metaphor is welcome, but stay concrete.",
    structure: [
      "WHAT YOU ARE CARRYING: name what they are most likely feeling about this question, in two specific sentences. No generic sympathy.",
      "WHAT THE CARDS SEE: point out one pattern or blind spot the cards reveal that they have probably not said out loud, tied to the card names.",
      "ONE SMALL STEP: give one concrete thing they can do within 24 hours, specific enough that they know exactly where to start.",
    ],
    closing: "End with one short reflective question (one sentence at most).",
  },
  {
    key: "direct-practical",
    voice:
      "Direct, modern and practical. Plain language, no mystical filler, no long metaphors. You are not their therapist, so do not tell them to journal or meditate - point at what needs to change.",
    structure: [
      "STRAIGHT READ: say plainly what the cards suggest about the situation.",
      "THE TENSION: name the specific tension or trade-off they are caught between.",
      "THE MOVE: give one outward action to take this week - a conversation, a boundary, a decision or a message. Not journaling, not meditating.",
    ],
    closing: "End with one sharp question that asks them to be honest with themselves.",
  },
  {
    key: "release-reframe",
    voice:
      "Compassionate and reflective. Focus on their inner landscape and help them reframe. Never pitying or patronising.",
    structure: [
      "WHAT TO RELEASE: name a belief or habit the cards suggest is weighing them down.",
      "WHAT TO LET IN: name what they could invite instead, and why the cards support it.",
      "WHAT TO WATCH: name one thing to stay aware of while they make this shift, and one small way to practise it this week.",
    ],
    closing: "End with one gentle reflective question.",
  },
  {
    key: "empowering-forward",
    voice:
      "Bold, encouraging and forward-looking. Second person, present tense. Focus on agency and momentum.",
    structure: [
      "WHERE YOUR POWER IS: name the strength the cards show they already have for this situation.",
      "YOUR GROWTH EDGE: name the one edge they are being asked to grow into.",
      "YOUR NEXT MOVE: give one specific outward step that turns insight into momentum this week - something they do, not something they think about.",
    ],
    closing: "End with one short question that points forward.",
  },
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Free reading prompt: ~3 short paragraphs, one of several voices, and an
 * explicit rule for yes/no questions (which otherwise produce vague answers).
 */
export function buildFreeReadingPrompt(cards: DrawnCard[], question: string): string {
  const style = pick(READING_STYLES);
  const paragraphs = 3 + Math.floor(Math.random() * 2); // 3 or 4

  const cardText = cards
    .map(
      (c, i) =>
        `Card ${i + 1} (${c.reversed ? "Reversed" : "Upright"}): ${c.name} \u2014 ${
          c.reversed ? c.reversedKeywords : c.keywords
        }`
    )
    .join("\n");

  const structure = style.structure
    .map((step, i) => `${i + 1}) ${step}`)
    .join("\n");

  return [
    "You are a tarot reader for a modern, English-speaking seeker.",
    `Voice for this reading: ${style.voice}`,
    "",
    `The seeker asks: "${question || "What do I need to know right now?"}"`,
    "",
    "These cards came up:",
    cardText,
    "",
    `Write ${paragraphs} paragraphs using this structure:`,
    structure,
    "",
    "Rules:",
    "- Vary your opening. Never start with 'I can sense' or 'It sounds like', and do not reuse the same opening sentence across readings.",
    "- Speak to the specific situation in their question. No advice that would fit anyone.",
    "- If their question is a yes/no question (for example 'Will he come back?'), do not answer yes or no. Name what they are really trying to understand underneath it, and guide them on that instead.",
    "- Address Reversed cards directly and reframe them without doom.",
    "- Never claim certainty about the future, and never give medical, legal or financial advice.",
    `- ${style.closing}`,
    "- Sign off with a single line: \u2014 MysticSage",
  ].join("\n");
}
