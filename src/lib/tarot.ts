export const MAJOR_ARCANA: Array<{id: number; name: string; keywords: string}> = [
  { id: 0, name: "The Fool", keywords: "beginnings, innocence, spontaneity, free spirit" },
  { id: 1, name: "The Magician", keywords: "willpower, desire, resourcefulness, skill" },
  { id: 2, name: "The High Priestess", keywords: "intuition, mystery, inner knowledge" },
  { id: 3, name: "The Empress", keywords: "abundance, nurturing, fertility, nature" },
  { id: 4, name: "The Emperor", keywords: "authority, structure, control, stability" },
  { id: 5, name: "The Hierophant", keywords: "tradition, conformity, spiritual wisdom" },
  { id: 6, name: "The Lovers", keywords: "love, harmony, relationships, choices" },
  { id: 7, name: "The Chariot", keywords: "willpower, determination, victory" },
  { id: 8, name: "Strength", keywords: "courage, inner strength, compassion" },
  { id: 9, name: "The Hermit", keywords: "solitude, introspection, soul-searching" },
  { id: 10, name: "Wheel of Fortune", keywords: "change, cycles, destiny, luck" },
  { id: 11, name: "Justice", keywords: "fairness, truth, balance, law" },
  { id: 12, name: "The Hanged Man", keywords: "pause, surrender, new perspective" },
  { id: 13, name: "Death", keywords: "transformation, endings, new beginnings" },
  { id: 14, name: "Temperance", keywords: "balance, moderation, patience" },
  { id: 15, name: "The Devil", keywords: "bondage, materialism, shadow self" },
  { id: 16, name: "The Tower", keywords: "sudden change, upheaval, revelation" },
  { id: 17, name: "The Star", keywords: "hope, inspiration, serenity, healing" },
  { id: 18, name: "The Moon", keywords: "illusion, fear, anxiety, intuition" },
  { id: 19, name: "The Sun", keywords: "joy, success, vitality, positivity" },
  { id: 20, name: "Judgement", keywords: "reflection, reckoning, inner calling" },
  { id: 21, name: "The World", keywords: "completion, fulfillment, wholeness" },
];

const STYLES = [
  { p: ["Past", "Present", "Future"], t: "Use a gentle, mystical tone with nature and celestial metaphors." },
  { p: ["Challenge", "Hidden Strength", "Outcome"], t: "Be direct and practical. Focus on actionable insights. Use modern, conversational language." },
  { p: ["What to Release", "What to Embrace", "What to Watch For"], t: "Be compassionate and reflective. Help the user understand their emotional landscape." },
  { p: ["Your Foundation", "Your Growth Edge", "Your Potential"], t: "Be empowering and bold. Focus on personal development and inner strength." },
  { p: ["The Situation", "The Lesson", "The Guidance"], t: "Be warm and nurturing. Write as if comforting a friend. Use everyday language." },
];

const PARAS = ["2-3 paragraphs", "3-4 paragraphs", "3 paragraphs", "2-4 paragraphs"];

function shuffle(arr: any[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function pickRandomCards(count: number) {
  return shuffle(MAJOR_ARCANA).slice(0, count);
}

export function buildTarotPrompt(cards: any[], question: string) {
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];
  const paraCount = PARAS[Math.floor(Math.random() * PARAS.length)];
  const cardText = cards.map((c: any, i: number) => "Card " + (i + 1) + " (" + style.p[i] + "): " + c.name + " \u2014 " + c.keywords).join("\n");
  return "You are a tarot reader. The user asks: \u0022" + (question || "What do I need to know?") + "\u0022\n\nThese cards:\n" + cardText + "\n\nWrite " + paraCount + ". " + style.t + " End with actionable takeaway. Never predict doom. Focus on guidance and growth. Sign off as \u201c\u2014 MysticSage\u201d.";
}
