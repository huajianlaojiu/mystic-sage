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
  {
    day: 29, card: "The Emperor", kw: "structure, authority", kwTitle: "Structure and Authority",
    insight: "A decision made once beats a decision remade daily.",
    element: "Air", elementAction: "put it into words",
    zwSigns: ["Gemini", "Libra", "Aquarius"], zwNudges: ["say it plainly", "follow through", "take the risk"],
    sdSigns: ["Libra", "Aquarius", "Gemini"], sdLines: ["clarity pays", "say yes", "trust the timing"],
    luckyColor: "deep red", luckyNumber: 4,
    picks: ["The Emperor", "The Hermit", "The Star"],
  },
  {
    day: 30, card: "The Hierophant", kw: "tradition, guidance", kwTitle: "Tradition and Guidance",
    insight: "Some answers were worked out long before you arrived.",
    element: "Water", elementAction: "listen before you decide",
    zwSigns: ["Cancer", "Scorpio", "Pisces"], zwNudges: ["ask for advice", "follow through", "take the risk"],
    sdSigns: ["Pisces", "Cancer", "Scorpio"], sdLines: ["patience pays", "say yes", "trust the timing"],
    luckyColor: "ivory", luckyNumber: 5,
    picks: ["The Hierophant", "The Empress", "The Tower"],
  },
  {
    day: 31, card: "The Hanged Man", kw: "surrender, perspective", kwTitle: "Surrender and Perspective",
    insight: "Waiting is not losing. Sometimes it is the whole move.",
    element: "Fire", elementAction: "pause before you push",
    zwSigns: ["Aries", "Leo", "Sagittarius"], zwNudges: ["slow down first", "follow through", "take the risk"],
    sdSigns: ["Sagittarius", "Aries", "Leo"], sdLines: ["momentum builds", "say yes", "trust the timing"],
    luckyColor: "sea blue", luckyNumber: 12,
    picks: ["The Hanged Man", "The Chariot", "Judgement"],
  },
  {
    day: 32, card: "The Devil", kw: "attachment, shadow", kwTitle: "Attachment and Shadow",
    insight: "The chain is usually looser than it looks.",
    element: "Earth", elementAction: "change one habit",
    zwSigns: ["Taurus", "Virgo", "Capricorn"], zwNudges: ["break the loop", "follow through", "take the risk"],
    sdSigns: ["Capricorn", "Taurus", "Virgo"], sdLines: ["patience pays", "say yes", "trust the timing"],
    luckyColor: "bronze", luckyNumber: 15,
    picks: ["The Devil", "The Star", "Strength"],
  },
  {
    day: 33, card: "The Moon", kw: "intuition, uncertainty", kwTitle: "Intuition and Uncertainty",
    insight: "Not everything unclear is a warning.",
    element: "Air", elementAction: "name what you actually know",
    zwSigns: ["Gemini", "Libra", "Aquarius"], zwNudges: ["trust the doubt", "follow through", "take the risk"],
    sdSigns: ["Aquarius", "Libra", "Gemini"], sdLines: ["clarity arrives", "say yes", "trust the timing"],
    luckyColor: "silver", luckyNumber: 18,
    picks: ["The Moon", "The Sun", "The High Priestess"],
  },
  {
    day: 34, card: "Justice", kw: "fairness, truth", kwTitle: "Fairness and Truth",
    insight: "You already know what is fair. You are deciding whether to say it.",
    element: "Water", elementAction: "tell the whole truth",
    zwSigns: ["Pisces", "Cancer", "Scorpio"], zwNudges: ["be honest first", "follow through", "take the risk"],
    sdSigns: ["Scorpio", "Pisces", "Cancer"], sdLines: ["depth pays", "say yes", "trust the timing"],
    luckyColor: "pale gold", luckyNumber: 11,
    picks: ["Justice", "The Emperor", "The World"],
  },
  {
    day: 35, card: "Wheel of Fortune", kw: "cycles, change", kwTitle: "Cycles and Change",
    insight: "The turn was already happening. You are just noticing it.",
    element: "Fire", elementAction: "move with it, not against it",
    zwSigns: ["Sagittarius", "Aries", "Leo"], zwNudges: ["say yes quicker", "follow through", "take the risk"],
    sdSigns: ["Leo", "Sagittarius", "Aries"], sdLines: ["boldness pays", "say yes", "trust the timing"],
    luckyColor: "copper", luckyNumber: 10,
    picks: ["Wheel of Fortune", "The Fool", "The Magician"],
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
  { t: "Tip: shuffle until your hands settle, not until you feel ready. Readiness is not the signal.", h: "Shuffle Until It Settles", s: "Readiness is not the signal" },
  { t: "A card you dislike is usually answering a question you have been avoiding.", h: "The Card You Dislike", s: "It is answering what you avoided" },
  { t: "Reading tip: if every card fits, you are probably reading your hopes rather than the spread.", h: "If Every Card Fits", s: "You may be reading your hopes" },
  { t: "Keep the same deck for a month. Familiarity beats novelty when you are still learning.", h: "Same Deck, One Month", s: "Familiarity beats novelty" },
  { t: "Write the date on every entry. You will want to know how long this season lasted.", h: "Date Every Entry", s: "You will want to know how long it lasted" },
  { t: "Two cards are enough when the question is simple. Not every pull needs a full spread.", h: "Two Cards Can Be Enough", s: "Not every pull needs a spread" },
  { t: "Notice which card you hoped for. That wish is part of the reading too.", h: "Notice What You Hoped For", s: "The wish is part of the reading" },
  { t: "Read for the week ahead, not for tomorrow. Short horizons create anxiety, not clarity.", h: "Read For The Week", s: "Short horizons create anxiety" },
  { t: "If the same card follows you for days, stop interpreting it and start acting on it.", h: "When A Card Follows You", s: "Stop interpreting, start acting" },
  { t: "You can put the deck down. A reading that leaves you spiralling was read too many times.", h: "You Can Put It Down", s: "Spiralling means you read too often" },
  { t: "Start with the suit, then the number, then the picture. That order keeps you from guessing.", h: "Suit, Number, Picture", s: "That order keeps you from guessing" },
  { t: "Ace cards are beginnings, not guarantees. The work still has to happen.", h: "Aces Are Beginnings", s: "The work still has to happen" },
  { t: "Court cards are people, attitudes, or both. Ask which one fits better before you decide.", h: "Court Cards Are People", s: "Or an attitude - ask which fits" },
  { t: "Reversed does not mean bad. It usually means the energy turned inward.", h: "Reversed Is Not Bad", s: "The energy turned inward" },
  { t: "Do not read when you are furious. Wait until you can hear an answer you dislike.", h: "Do Not Read While Furious", s: "Wait until you can hear a hard answer" },
  { t: "Pull for the situation, not for the person. Cards about other people's choices stay murky.", h: "Pull For The Situation", s: "Cards about others stay murky" },
  { t: "Keep a separate list of cards that keep showing up. That list becomes your own dictionary.", h: "Your Own Dictionary", s: "Track the cards that keep returning" },
  { t: "Reading tip: name the feeling before you name the card. It changes what you notice.", h: "Name The Feeling First", s: "It changes what you notice" },
  { t: "The spread is not a verdict. It is a description of the weather, not the forecast.", h: "Not A Verdict", s: "A description, not a forecast" },
  { t: "One honest question beats five clever ones. Depth comes from the question, not the spread.", h: "One Honest Question", s: "Depth comes from the question" },
  { t: "Close the session deliberately. Shuffle once, put the deck away, and go do something ordinary.", h: "Close The Session", s: "Then go do something ordinary" },
];

const LOVE_NOTES = [
  "Timing is not a punishment.",
  "Do not shrink to be chosen.",
  "The right person will not need convincing.",
  "Your standards are not unrealistic.",
  "Closure is not a conversation, it is a decision.",
  "You can love someone and still outgrow them.",
  "Peace is not boring. It is new.",
  "Being understood is not a reward you have to earn.",
  "A slow answer is still an answer.",
  "You are allowed to want something easy.",
  "Missing someone is not a reason to return.",
  "The relationship you are negotiating for is already telling you something.",
  "You do not owe anyone the softer version of your truth.",
];

const LOVE_QUESTIONS = [
  "do I feel chosen, or do I feel tolerated?",
  "am I staying for love, or for familiarity?",
  "what am I hoping they will become?",
  "would I accept this from a friend?",
  "am I being loved, or being managed?",
  "what would I choose if I were not afraid?",
  "am I waiting for a version of them that does not exist?",
  "have I been honest, or just agreeable?",
  "what am I protecting by staying quiet?",
  "do I want them, or do I want to be wanted?",
  "what did I stop asking for, and why?",
  "am I in love, or in debt to the history?",
  "what would I tell my closest friend to do?",
];

const HEALING_LINES = [
  "Healing is not linear. Some days you grow, some days you rest. Both count.",
  "You are allowed to grieve something you chose to leave.",
  "Rest is not a reward. It is a requirement.",
  "The version of you that survived is not the version you have to stay.",
  "You do not have to explain your peace to anyone.",
  "Progress can look like going to bed early.",
  "You are not behind. You are rebuilding.",
  "Doing less on purpose is still a decision, and a good one.",
  "You can be proud of how far you came and still be tired.",
  "Some weeks the only win is that you kept going. That counts.",
  "You are allowed to want a quieter life than the one you built.",
  "Being kind to yourself is not the same as letting yourself off the hook.",
  "The people who matter will not need you to perform.",
];

const FORTUNES = [
  "a message you were waiting for is closer than you think.",
  "an old door is closing so a better one can open.",
  "someone is quietly rooting for you.",
  "the answer arrives when you stop forcing it.",
  "a small win is coming before the week ends.",
  "the thing you almost gave up on is still alive.",
  "you are one honest conversation away from relief.",
  "the decision you keep postponing gets easier once it is made.",
  "a conversation this week changes how you see an old problem.",
  "the help you need is already nearby - you have not asked yet.",
  "something you lost track of is about to resurface.",
  "the effort you think nobody noticed has been noticed.",
  "a quieter week is coming, and you will need it.",
];

const UNIVERSE = [
  "you are closer than it feels.",
  "the delay is protecting you.",
  "you already know. You are just waiting for permission.",
  "nothing you survived was wasted.",
  "the next yes will make sense of this no.",
  "your patience is being noticed.",
  "you are allowed to want what you want.",
  "the version of you that worried about this would be proud.",
  "you are not late. You are on a different schedule.",
  "the thing you are afraid to start is smaller than it looks from here.",
  "rest is not falling behind.",
  "you are allowed to change your mind.",
  "someone is about to show you what consistency looks like.",
];

const NUDGES = [
  "let it be simpler",
  "send the message",
  "say the honest thing",
  "rest without guilt",
  "start before you feel ready",
  "finish the small thing",
  "ask for what you need",
  "close the tab you keep reopening",
  "say no once, clearly",
  "do the boring version today",
  "write it down instead of replaying it",
  "make the call you have been drafting",
  "stop explaining and start deciding",
];

const TONIGHT_SIGNS = [
  "a chapter is closing. Let it.",
  "the answer is quieter than you expected.",
  "someone is thinking of you tonight.",
  "the next step is smaller than you think.",
  "you are being guided, not punished.",
  "rest is part of the plan.",
  "the timing is finally moving.",
  "the thing you are waiting for is also waiting for you.",
  "you will sleep better once you write it down.",
  "an old worry is losing its grip.",
  "the right question is more useful than the answer.",
  "you are closer to settled than you feel.",
  "tomorrow asks for one small yes.",
];

// Lines that used to be identical every single day. Each pool holds two weeks of
// variants so a follower never reads the same filler twice in a fortnight.
const ZW_EVENINGS = [
  "Tonight: slow down. Even the loudest sign needs a quiet hour.",
  "Tonight: put the phone down first. The answer usually arrives right after.",
  "Tonight: one honest sentence beats an hour of rehearsing.",
  "Tonight: let the day finish before you judge it.",
  "Tonight: rest is not a reward for finishing. It is part of finishing.",
  "Tonight: the thing you keep re-reading will still be there tomorrow.",
  "Tonight: be as kind to yourself as you are to strangers.",
  "Tonight: say the smaller true thing instead of the bigger impressive one.",
  "Tonight: you do not have to solve it before you sleep.",
  "Tonight: notice what felt easy today. That is information.",
  "Tonight: close the loop on one small thing. Just one.",
  "Tonight: the worry is louder at night than it will be at breakfast.",
  "Tonight: someone is glad you exist. You may not hear it today.",
  "Tonight: choose rest over one more scroll.",
];

const SD_MIDDAYS = [
  "Which sign are you: sun, moon or rising? Comment and find your people.",
  "Tell us your moon sign. It explains more than your sun sign does.",
  "What is your rising sign? That one is the first impression you give.",
  "Drop your big three in the comments - sun, moon, rising.",
  "Which placement do you feel most? Sun, moon or rising?",
  "What is your sign, and does it actually fit you? Be honest.",
  "Comment your sign and one thing that is very true about you.",
  "Sun sign, moon sign, rising sign - which one are you reading about first?",
  "What is the most accurate thing anyone has said about your sign?",
  "Tell us your sign and the stereotype you are tired of hearing.",
  "Which sign do you always attract? Comment and compare.",
  "What is your sign, and what do people get wrong about it?",
  "Big three check: tell us yours below and see who matches.",
  "Which sign has been on your mind lately? Comment it.",
];

const LT_MIDDAYS = [
  "The Lovers card is about alignment, not just romance. Do your choices match your values?",
  "The Lovers is not only about a person. It is about a decision you keep circling.",
  "Two of Cups asks a simple question: is this mutual, or are you doing the work for two?",
  "The Empress is a reminder that being cared for is not the same as being managed.",
  "The Moon in a love reading is not a warning. It is a request to look closer.",
  "Ace of Cups is a beginning, not a promise. The rest is built by showing up.",
  "Ten of Cups is the quiet version of success. Not fireworks - consistency.",
  "Three of Swords is honesty arriving late. It heals faster than denial.",
  "The Star after heartbreak is not naive. It is the decision to hope on purpose.",
  "Eight of Cups asks whether you are leaving, or just tired of asking.",
  "The Hierophant in love is tradition. Ask whether it is yours or inherited.",
  "Knight of Cups is charm in motion. Check whether it lasts past the third week.",
  "Queen of Wands in love is confidence, not pursuit. She chooses from strength.",
  "The Hermit in a love reading asks what you need before what you want.",
];

const HT_MIDDAYS = [
  "Repeat after me: I am allowed to outgrow people and still love them.",
  "Repeat after me: rest is something I am allowed to take, not earn.",
  "Repeat after me: my needs are not too much. They are just unmet.",
  "Repeat after me: I can be a work in progress and still be enough.",
  "Repeat after me: saying no to one thing is saying yes to another.",
  "Repeat after me: I do not have to explain my peace to anyone.",
  "Repeat after me: healing slowly is still healing.",
  "Repeat after me: I am not behind. I am rebuilding.",
  "Repeat after me: the version of me that survived is not the version I have to stay.",
  "Repeat after me: I am allowed to want a quieter life than the one I built.",
  "Repeat after me: it is not selfish to protect my energy.",
  "Repeat after me: I can be proud of how far I came and still be tired.",
  "Repeat after me: I choose consistency over intensity.",
  "Repeat after me: being kind to myself is not letting myself off the hook.",
];

const HT_EVENINGS = [
  "Evening check-in: what is one kind thing you did for yourself today?",
  "Evening check-in: what did you say no to today, and did it feel right?",
  "Evening check-in: what drained you today, and is it avoidable next week?",
  "Evening check-in: what is one thing you can leave unfinished tonight?",
  "Evening check-in: what would have made today 10% lighter?",
  "Evening check-in: who made today easier? Tell them tomorrow.",
  "Evening check-in: what are you carrying that is not yours to carry?",
  "Evening check-in: where did you push past a limit you should have respected?",
  "Evening check-in: what small win are you not counting?",
  "Evening check-in: what did you need today that you did not ask for?",
  "Evening check-in: what can wait until Monday, honestly?",
  "Evening check-in: what did your body tell you today that you ignored?",
  "Evening check-in: what is one thing you are proud of, even if it was small?",
  "Evening check-in: what will you do differently tomorrow morning?",
];

const DF_EVENINGS = [
  "Evening fortune: what you release now makes room for what arrives this week.",
  "Evening fortune: the answer you did not like is probably the accurate one.",
  "Evening fortune: something you stopped expecting is still on its way.",
  "Evening fortune: the delay has been doing work you cannot see yet.",
  "Evening fortune: a quiet week is coming, and you will need it.",
  "Evening fortune: the effort you think nobody noticed has been noticed.",
  "Evening fortune: you are one honest conversation away from relief.",
  "Evening fortune: an old door is closing so a better one can open.",
  "Evening fortune: the decision you keep postponing gets easier once it is made.",
  "Evening fortune: something you lost track of is about to resurface.",
  "Evening fortune: the help you need is already nearby - you have not asked yet.",
  "Evening fortune: you will sleep better once you write it down.",
  "Evening fortune: the thing you almost gave up on is still alive.",
  "Evening fortune: a small win is coming before the week ends.",
];

// ---------------------------------------------------------------------------
// Copy builder
// ---------------------------------------------------------------------------

function buildTweets(d, i) {
  // TIPS needs three per day, so index with a multiplier and wrap with modulo —
  // without the wrap the eighth day reads past the end and throws.
  const tipAt = (n) => TIPS[n % TIPS.length];
  const love = LOVE_NOTES[i % LOVE_NOTES.length];
  const lq = LOVE_QUESTIONS[i % LOVE_QUESTIONS.length];
  const heal = HEALING_LINES[i % HEALING_LINES.length];
  const fort = FORTUNES[i % FORTUNES.length];
  const uni = UNIVERSE[i % UNIVERSE.length];
  const nudge = NUDGES[i % NUDGES.length];
  const tonight = TONIGHT_SIGNS[i % TONIGHT_SIGNS.length];
  const zwEve = ZW_EVENINGS[i % ZW_EVENINGS.length];
  const sdMid = SD_MIDDAYS[i % SD_MIDDAYS.length];
  const ltMid = LT_MIDDAYS[i % LT_MIDDAYS.length];
  const htMid = HT_MIDDAYS[i % HT_MIDDAYS.length];
  const htEve = HT_EVENINGS[i % HT_EVENINGS.length];
  const dfEve = DF_EVENINGS[i % DF_EVENINGS.length];
  const after = (text, prefix) => text.startsWith(prefix) ? text.slice(prefix.length) : text;
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
      ["MORNING", tipAt(i * 3).t, [tipAt(i * 3).h, tipAt(i * 3).s]],
      ["MIDDAY",  tipAt(i * 3 + 1).t, [tipAt(i * 3 + 1).h, tipAt(i * 3 + 1).s]],
      ["EVENING", tipAt(i * 3 + 2).t, [tipAt(i * 3 + 2).h, tipAt(i * 3 + 2).s]],
    ]],
    ["@TheCardSpeaks", "cs", [
      ["MORNING", `${d.card} means ${d.kw}. Let it sit with you today.`, [d.card, "What it means today"]],
      ["MIDDAY",  `Reversed ${d.card}: the energy is blocked, delayed, or asking you to look inward.`, [`Reversed ${d.card}`, "Blocked, delayed, or inward"]],
      ["EVENING", `Night card: ${d.card}. ${d.insight}`, [`Night Card: ${d.card}`, d.insight]],
    ]],
    ["@ZodiacWisdom", "zw", [
      ["MORNING", `${s1}: ${n1}. ${s2}: ${n2}. ${s3}: ${n3}.`, [`${d.element} Signs`, `${s1}: ${n1}`]],
      ["MIDDAY",  `Fire, earth, air or water - ${d.element} signs are being asked to ${d.elementAction} this week.`, [`${d.element} Signs This Week`, `Asked to ${d.elementAction}`]],
      ["EVENING", zwEve, ["Tonight", after(zwEve, "Tonight: ")]],
    ]],
    ["@StarSignDaily", "sd", [
      ["MORNING", `${d1}: ${l1}. ${d2}: ${l2}. ${d3}: ${l3}.`, [`${d1} Season`, `${d2} and ${d3} too`]],
      ["MIDDAY",  sdMid, ["Your Sign", sdMid]],
      ["EVENING", `Tomorrow's energy: ${d1} leads with instinct. ${d2} leads with courage.`, ["Tomorrow's Energy", `${d1} and ${d2} lead the way`]],
    ]],
    ["@LoveTarotRead", "lt", [
      ["MORNING", `Love note: ${love}`, ["Love Note", love]],
      ["MIDDAY",  ltMid, ["Love & Tarot", ltMid]],
      ["EVENING", `Tonight ask yourself honestly: ${lq}`, ["Tonight, Ask Yourself", lq.charAt(0).toUpperCase() + lq.slice(1)]],
    ]],
    ["@HeartTarot", "ht", [
      ["MORNING", heal, ["Healing Is Not Linear", "Some days you grow, some days you rest"]],
      ["MIDDAY",  htMid, ["Repeat After Me", after(htMid, "Repeat after me: ")]],
      ["EVENING", htEve, ["Evening Check-In", after(htEve, "Evening check-in: ")]],
    ]],
    ["@DailyFortuneTell", "df", [
      ["MORNING", `Lucky today: ${d.luckyColor}, number ${d.luckyNumber}. Watch where they show up.`, ["Lucky Today", `${d.luckyColor}, number ${d.luckyNumber}`]],
      ["MIDDAY",  `Fortune: ${fort}`, ["Your Fortune", fort]],
      ["EVENING", dfEve, ["Evening Fortune", after(dfEve, "Evening fortune: ")]],
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
