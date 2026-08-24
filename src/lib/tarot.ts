export type TarotCard = {
  id: number;
  name: string;
  keywords: string;
  reversedKeywords: string;
  suit: "Major" | "Wands" | "Cups" | "Swords" | "Pentacles";
  emoji: string;
};

export type DrawnCard = TarotCard & { reversed: boolean };

export const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: "The Fool", keywords: "new beginnings, spontaneity, faith", reversedKeywords: "hesitation, recklessness, fear of risk", suit: "Major", emoji: "🃏" },
  { id: 1, name: "The Magician", keywords: "willpower, skill, manifestation", reversedKeywords: "manipulation, scattered energy, self-doubt", suit: "Major", emoji: "🪄" },
  { id: 2, name: "The High Priestess", keywords: "intuition, mystery, inner voice", reversedKeywords: "ignoring intuition, secrets, disconnection", suit: "Major", emoji: "🌙" },
  { id: 3, name: "The Empress", keywords: "abundance, nurturing, creativity", reversedKeywords: "overgiving, creative block, neglect of self", suit: "Major", emoji: "🌿" },
  { id: 4, name: "The Emperor", keywords: "authority, structure, stability", reversedKeywords: "rigidity, control, burnout", suit: "Major", emoji: "👑" },
  { id: 5, name: "The Hierophant", keywords: "tradition, guidance, learning", reversedKeywords: "rebellion, outdated beliefs, dogma", suit: "Major", emoji: "📿" },
  { id: 6, name: "The Lovers", keywords: "love, harmony, alignment", reversedKeywords: "imbalance, values conflict, disconnection", suit: "Major", emoji: "💞" },
  { id: 7, name: "The Chariot", keywords: "determination, victory, drive", reversedKeywords: "lack of direction, stalled, aggressive push", suit: "Major", emoji: "🏆" },
  { id: 8, name: "Strength", keywords: "courage, compassion, inner power", reversedKeywords: "self-doubt, overwhelm, insecurity", suit: "Major", emoji: "🦁" },
  { id: 9, name: "The Hermit", keywords: "introspection, solitude, wisdom", reversedKeywords: "isolation, withdrawal, loneliness", suit: "Major", emoji: "🏮" },
  { id: 10, name: "Wheel of Fortune", keywords: "change, cycles, luck", reversedKeywords: "resistance to change, bad timing, downturn", suit: "Major", emoji: "🎡" },
  { id: 11, name: "Justice", keywords: "fairness, truth, balance", reversedKeywords: "unfairness, bias, avoiding accountability", suit: "Major", emoji: "⚖️" },
  { id: 12, name: "The Hanged Man", keywords: "pause, surrender, new perspective", reversedKeywords: "stalling, martyrdom, delay", suit: "Major", emoji: "🪢" },
  { id: 13, name: "Death", keywords: "transformation, endings, rebirth", reversedKeywords: "resistance to change, stagnation, holding on", suit: "Major", emoji: "🦋" },
  { id: 14, name: "Temperance", keywords: "balance, patience, moderation", reversedKeywords: "excess, imbalance, impatience", suit: "Major", emoji: "⚗️" },
  { id: 15, name: "The Devil", keywords: "bondage, shadow, temptation", reversedKeywords: "freedom, breaking chains, reclaiming power", suit: "Major", emoji: "😈" },
  { id: 16, name: "The Tower", keywords: "sudden change, upheaval, revelation", reversedKeywords: "fear of change, delaying the inevitable, inner upheaval", suit: "Major", emoji: "⚡" },
  { id: 17, name: "The Star", keywords: "hope, healing, inspiration", reversedKeywords: "discouragement, loss of faith, self-doubt", suit: "Major", emoji: "⭐" },
  { id: 18, name: "The Moon", keywords: "illusion, intuition, uncertainty", reversedKeywords: "clarity, release of fear, seeing the truth", suit: "Major", emoji: "🌘" },
  { id: 19, name: "The Sun", keywords: "joy, success, vitality", reversedKeywords: "delayed joy, dimmed confidence, overexposure", suit: "Major", emoji: "☀️" },
  { id: 20, name: "Judgement", keywords: "reflection, calling, reckoning", reversedKeywords: "self-doubt, avoiding evaluation, harsh self-criticism", suit: "Major", emoji: "📯" },
  { id: 21, name: "The World", keywords: "completion, fulfillment, wholeness", reversedKeywords: "unfinished business, loose ends, delay", suit: "Major", emoji: "🌍" },
];

const MINOR = [
  // Wands — fire, action & passion
  { n: "Ace of Wands", k: "inspiration, new spark, potential", r: "delay, lack of motivation, blocked start", s: "Wands", e: "🔥" },
  { n: "Two of Wands", k: "planning, future vision, bold choice", r: "fear of the unknown, stalled plans", s: "Wands", e: "🗺️" },
  { n: "Three of Wands", k: "expansion, foresight, progress", r: "delayed expansion, obstacles ahead", s: "Wands", e: "🚢" },
  { n: "Four of Wands", k: "celebration, homecoming, stability", r: "unstable foundation, postponed joy", s: "Wands", e: "🎉" },
  { n: "Five of Wands", k: "competition, friction, challenge", r: "avoiding conflict, internal friction", s: "Wands", e: "🥊" },
  { n: "Six of Wands", k: "victory, recognition, public praise", r: "hollow win, ego, lack of recognition", s: "Wands", e: "🏅" },
  { n: "Seven of Wands", k: "defending ground, persistence, courage", r: "overwhelm, giving up ground", s: "Wands", e: "🛡️" },
  { n: "Eight of Wands", k: "speed, momentum, quick news", r: "delays, rushed decisions, chaos", s: "Wands", e: "💨" },
  { n: "Nine of Wands", k: "resilience, last stand, boundaries", r: "exhaustion, defensiveness, paranoia", s: "Wands", e: "🕯️" },
  { n: "Ten of Wands", k: "burden, responsibility, completion", r: "burnout, carrying too much", s: "Wands", e: "🎒" },
  { n: "Page of Wands", k: "curiosity, enthusiasm, discovery", r: "impulsiveness, scattered energy", s: "Wands", e: "🧭" },
  { n: "Knight of Wands", k: "adventure, passion, bold action", r: "recklessness, impulsivity, hot temper", s: "Wands", e: "🐎" },
  { n: "Queen of Wands", k: "confidence, warmth, magnetism", r: "jealousy, insecurity, demanding", s: "Wands", e: "🌻" },
  { n: "King of Wands", k: "vision, leadership, charisma", r: "arrogance, impulsive power, ego", s: "Wands", e: "👑" },

  // Cups — water, emotions & relationships
  { n: "Ace of Cups", k: "new love, emotional opening, intuition", r: "emotional block, closed heart", s: "Cups", e: "💧" },
  { n: "Two of Cups", k: "connection, partnership, mutual attraction", r: "imbalance, broken bond, misalignment", s: "Cups", e: "🥂" },
  { n: "Three of Cups", k: "friendship, celebration, community", r: "isolation, gossip, excess", s: "Cups", e: "🎶" },
  { n: "Four of Cups", k: "apathy, introspection, missed offer", r: "reawakening, new perspective, acceptance", s: "Cups", e: "🌫️" },
  { n: "Five of Cups", k: "loss, regret, focusing on what spilled", r: "healing, forgiveness, moving on", s: "Cups", e: "🌧️" },
  { n: "Six of Cups", k: "nostalgia, innocence, childhood", r: "living in the past, stuck memories", s: "Cups", e: "🏡" },
  { n: "Seven of Cups", k: "choices, fantasy, illusion", r: "clarity, decisive step, reality check", s: "Cups", e: "🌈" },
  { n: "Eight of Cups", k: "walking away, seeking more, transition", r: "staying stuck, fear of leaving", s: "Cups", e: "🚶" },
  { n: "Nine of Cups", k: "wish fulfilled, satisfaction, contentment", r: "greed, superficial joy, dissatisfaction", s: "Cups", e: "😌" },
  { n: "Ten of Cups", k: "family joy, emotional fulfillment, harmony", r: "broken dreams, family tension", s: "Cups", e: "💖" },
  { n: "Page of Cups", k: "creative spark, gentle message, imagination", r: "emotional immaturity, fantasy over reality", s: "Cups", e: "🫧" },
  { n: "Knight of Cups", k: "romance, charm, invitation", r: "moodiness, unrealistic expectations", s: "Cups", e: "🌹" },
  { n: "Queen of Cups", k: "empathy, intuition, compassion", r: "overwhelmed emotions, codependency", s: "Cups", e: "🪞" },
  { n: "King of Cups", k: "emotional maturity, calm wisdom", r: "emotional suppression, manipulation", s: "Cups", e: "⚓" },

  // Swords — air, mind & conflict
  { n: "Ace of Swords", k: "truth, clarity, breakthrough", r: "confusion, miscommunication, harsh words", s: "Swords", e: "🗡️" },
  { n: "Two of Swords", k: "stalemate, hard choice, guarded heart", r: "indecision, avoiding the truth", s: "Swords", e: "🤔" },
  { n: "Three of Swords", k: "heartbreak, grief, painful truth", r: "healing, forgiveness, release", s: "Swords", e: "💔" },
  { n: "Four of Swords", k: "rest, recovery, retreat", r: "restlessness, burnout, exhaustion", s: "Swords", e: "😴" },
  { n: "Five of Swords", k: "conflict, defeat, hollow victory", r: "reconciliation, releasing grudges", s: "Swords", e: "⚔️" },
  { n: "Six of Swords", k: "transition, moving on, calmer waters", r: "stuck in the past, resisting change", s: "Swords", e: "🚤" },
  { n: "Seven of Swords", k: "strategy, secrecy, caution", r: "deception exposed, coming clean", s: "Swords", e: "🥷" },
  { n: "Eight of Swords", k: "self-imposed limits, feeling trapped", r: "freedom, new perspective, release", s: "Swords", e: "🕸️" },
  { n: "Nine of Swords", k: "anxiety, worry, sleepless nights", r: "hope, healing, facing fears", s: "Swords", e: "😰" },
  { n: "Ten of Swords", k: "rock bottom, painful ending, betrayal", r: "recovery, new dawn, moving forward", s: "Swords", e: "🌅" },
  { n: "Page of Swords", k: "curiosity, vigilance, new ideas", r: "gossip, carelessness, hasty words", s: "Swords", e: "📡" },
  { n: "Knight of Swords", k: "bold action, fast thinking, ambition", r: "impulsiveness, aggression, reckless", s: "Swords", e: "🌪️" },
  { n: "Queen of Swords", k: "clear boundaries, honesty, independence", r: "coldness, bitterness, harsh judgment", s: "Swords", e: "🧊" },
  { n: "King of Swords", k: "intellectual authority, truth, logic", r: "manipulation, tyranny, cold reason", s: "Swords", e: "🏛️" },

  // Pentacles — earth, money & reality
  { n: "Ace of Pentacles", k: "new opportunity, prosperity, potential", r: "missed chance, financial delay", s: "Pentacles", e: "💰" },
  { n: "Two of Pentacles", k: "balance, juggling, adaptability", r: "overwhelm, financial instability", s: "Pentacles", e: "⚖️" },
  { n: "Three of Pentacles", k: "teamwork, craftsmanship, recognition", r: "mediocrity, lack of collaboration", s: "Pentacles", e: "🔨" },
  { n: "Four of Pentacles", k: "security, control, saving", r: "greed, holding too tight, fear of loss", s: "Pentacles", e: "🔒" },
  { n: "Five of Pentacles", k: "hardship, scarcity, exclusion", r: "recovery, support, finding help", s: "Pentacles", e: "❄️" },
  { n: "Six of Pentacles", k: "generosity, giving and receiving, balance", r: "strings attached, debt, imbalance", s: "Pentacles", e: "🤝" },
  { n: "Seven of Pentacles", k: "patience, investment, long-term view", r: "impatience, wasted effort, low yield", s: "Pentacles", e: "🌱" },
  { n: "Eight of Pentacles", k: "skill, craftsmanship, diligence", r: "perfectionism, distraction, low quality", s: "Pentacles", e: "🛠️" },
  { n: "Nine of Pentacles", k: "independence, luxury, self-sufficiency", r: "isolation, overwork, burnout", s: "Pentacles", e: "🕊️" },
  { n: "Ten of Pentacles", k: "legacy, family wealth, long-term success", r: "family conflict, financial loss, instability", s: "Pentacles", e: "🏰" },
  { n: "Page of Pentacles", k: "learning, new skill, opportunity", r: "procrastination, lack of discipline", s: "Pentacles", e: "📚" },
  { n: "Knight of Pentacles", k: "reliability, hard work, patience", r: "stubbornness, monotony, inertia", s: "Pentacles", e: "🐢" },
  { n: "Queen of Pentacles", k: "nurturing abundance, practical care", r: "overwork, neglect of self, instability", s: "Pentacles", e: "🌾" },
  { n: "King of Pentacles", k: "wealth, leadership, stability", r: "materialism, stubbornness, greed", s: "Pentacles", e: "👔" },
];

export const MINOR_ARCANA: TarotCard[] = MINOR.map((m, i) => ({
  id: 22 + i,
  name: m.n,
  keywords: m.k,
  reversedKeywords: m.r,
  suit: m.s as TarotCard["suit"],
  emoji: m.e,
}));

export const ALL_CARDS: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Draw N unique cards from the full 78-card deck. ~30% land reversed. */
export function pickRandomCards(count: number): DrawnCard[] {
  return shuffle(ALL_CARDS)
    .slice(0, count)
    .map((c) => ({ ...c, reversed: Math.random() < 0.3 }));
}

export const POSITIONS_FREE = ["Past", "Present", "Future"];
export const POSITIONS_PREMIUM = [
  "Present",
  "Crossing You",
  "Root Cause",
  "Recent Past",
  "Near Future",
  "Your Hopes",
  "Advice",
  "External Influence",
  "Outcome",
];

/**
 * Build a "sandwich" reading prompt: empathy → insight → concrete action.
 * Reversed cards are explained instead of hidden. Ends with a reflective question.
 */
export function buildTarotPrompt(cards: DrawnCard[], question: string): string {
  const cardText = cards
    .map(
      (c, i) =>
        `Card ${i + 1} (${c.reversed ? "Reversed" : "Upright"}): ${c.name} — ${
          c.reversed ? c.reversedKeywords : c.keywords
        }`
    )
    .join("\n");

  return [
    "You are a deeply intuitive tarot reader for a modern, English-speaking seeker.",
    "",
    `The user asks: "${question || "What do I need to know right now?"}"`,
    "",
    "These cards came up:",
    cardText,
    "",
    "Write a reading in 3-4 paragraphs with this exact structure:",
    "1) EMPATHY: Acknowledge what they are likely feeling about this question in one or two specific sentences. Sound like a wise friend, not a fortune teller.",
    "2) INSIGHT: Name one specific pattern or blind spot the cards reveal, tied to the card names above. Quote the user's own question words back at them where natural.",
    "3) ACTION: Give ONE small, concrete, doable step they can take within 24 hours. No vague 'trust your intuition' — make it specific.",
    "",
    "If a card is Reversed, address it directly and reassure them (e.g. 'The reversed Moon isn't bad news — it means the fog is lifting').",
    "Never predict doom, never make medical/legal/financial claims. End with one short reflective question for the user (max one sentence).",
    "Sign off as \"— MysticSage\".",
  ].join("\n");
}
