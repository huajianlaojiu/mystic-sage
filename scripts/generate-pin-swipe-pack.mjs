import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "images", "pins10");
const W = 1000;
const H = 1500;

const themes = {
  midnight: {
    bg: "#0d1514",
    panel: "#14231f",
    panelAlt: "#183029",
    line: "#46675a",
    ink: "#f6f1e7",
    muted: "#b7c7bd",
    accent: "#d9b56e",
    accentSoft: "#8d7045",
  },
  parchment: {
    bg: "#eee3d0",
    panel: "#f8f1e5",
    panelAlt: "#eadac0",
    line: "#b79b70",
    ink: "#26352f",
    muted: "#66786e",
    accent: "#9b6c34",
    accentSoft: "#d6b483",
  },
  plum: {
    bg: "#17111d",
    panel: "#24192d",
    panelAlt: "#2e2039",
    line: "#5f4b70",
    ink: "#f7f0e7",
    muted: "#c1b4cb",
    accent: "#d9b56e",
    accentSoft: "#8d7045",
  },
  sage: {
    bg: "#17231f",
    panel: "#20342c",
    panelAlt: "#29443a",
    line: "#5e7a6c",
    ink: "#f4efe6",
    muted: "#b7c8bd",
    accent: "#d3ae68",
    accentSoft: "#8a6d43",
  },
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(text, maxChars) {
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textSvg(
  text,
  {
    x,
    y,
    size,
    fill,
    family = "Arial, Helvetica, sans-serif",
    weight = 400,
    anchor = "start",
    lineHeight = 1.2,
    letterSpacing = 0,
    maxChars = 30,
    italic = false,
  }
) {
  const lines = wrapText(text, maxChars);
  const attrs = [
    `x="${x}"`,
    `font-family="${family}"`,
    `font-size="${size}"`,
    `font-weight="${weight}"`,
    `fill="${fill}"`,
    `text-anchor="${anchor}"`,
    `letter-spacing="${letterSpacing}"`,
  ];
  if (italic) attrs.push('font-style="italic"');

  return lines
    .map(
      (line, index) =>
        `<text ${attrs.join(" ")} y="${y + index * size * lineHeight}">${escapeXml(line)}</text>`
    )
    .join("");
}

function frameSvg(t) {
  return `
    <rect x="42" y="42" width="916" height="1416" fill="none" stroke="${t.accent}" stroke-width="2" opacity="0.72"/>
    <rect x="60" y="60" width="880" height="1380" fill="none" stroke="${t.line}" stroke-width="1" opacity="0.75"/>
    <path d="M60 102 H180 M820 102 H940 M60 1398 H180 M820 1398 H940" stroke="${t.accent}" stroke-width="3" opacity="0.75"/>
  `;
}

function footerSvg(t, note) {
  const noteSvg = note
    ? textSvg(note, {
        x: W / 2,
        y: 1288,
        size: 15,
        fill: t.muted,
        anchor: "middle",
        lineHeight: 1.2,
        maxChars: 62,
      })
    : "";

  return `
    ${noteSvg}
    <line x1="350" y1="1325" x2="650" y2="1325" stroke="${t.line}" stroke-width="1" opacity="0.8"/>
    <text x="500" y="1362" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="3" fill="${t.ink}">MYSTICSAGE</text>
    <text x="500" y="1392" text-anchor="middle" font-family="Georgia, serif" font-size="17" fill="${t.accent}">mysticsages.com</text>
  `;
}

function cardSvg({
  x,
  y,
  w,
  h,
  t,
  index,
  title,
  desc,
  compact = false,
  centered = false,
}) {
  const pad = compact ? 12 : 17;
  const badge = index === undefined ? "" : `<text x="${x + pad}" y="${y + 29}" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="${t.accent}">${String(index).padStart(2, "0")}</text>`;
  const titleSize = compact ? 17 : 23;
  const titleMax = compact ? Math.max(10, Math.floor(w / 10)) : Math.max(14, Math.floor(w / 13));
  const titleY = y + (index === undefined ? pad + titleSize : 42);
  const descY = titleY + titleSize * 1.45;
  const titleSvg = textSvg(title, {
    x: centered ? x + w / 2 : x + pad,
    y: titleY,
    size: titleSize,
    fill: t.ink,
    weight: 700,
    anchor: centered ? "middle" : "start",
    lineHeight: 1.15,
    maxChars: titleMax,
  });
  const descSvg = desc
    ? textSvg(desc, {
        x: centered ? x + w / 2 : x + pad,
        y: descY,
        size: compact ? 13 : 16,
        fill: t.muted,
        anchor: centered ? "middle" : "start",
        lineHeight: 1.2,
        maxChars: compact ? Math.max(12, Math.floor(w / 8)) : Math.max(18, Math.floor(w / 9)),
      })
    : "";

  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${t.panel}" stroke="${t.line}" stroke-width="1.1"/>
    ${badge}
    ${titleSvg}
    ${descSvg}
  `;
}

function sectionHeadingSvg(title, x, y, t) {
  return `
    <text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" letter-spacing="2" fill="${t.accent}">${escapeXml(title.toUpperCase())}</text>
    <line x1="${x}" y1="${y + 11}" x2="${x + 106}" y2="${y + 11}" stroke="${t.accentSoft}" stroke-width="2" opacity="0.8"/>
  `;
}

function renderCards(section, x, y, w, h, t) {
  const columns = section.columns || 2;
  const gap = section.gap || 14;
  const rows = Math.ceil(section.items.length / columns);
  const cardW = (w - gap * (columns - 1)) / columns;
  const cardH = (h - gap * (rows - 1)) / rows;
  const compact = section.compact || rows > 3;

  return section.items
    .map((item, index) => {
      const itemTitle = typeof item === "string" ? item : item.title;
      const itemDesc = typeof item === "string" ? "" : item.desc;
      const col = index % columns;
      const row = Math.floor(index / columns);
      return cardSvg({
        x: x + col * (cardW + gap),
        y: y + row * (cardH + gap),
        w: cardW,
        h: cardH,
        t,
        index: section.numbered === false ? undefined : index + 1,
        title: itemTitle,
        desc: itemDesc,
        compact,
        centered: section.centered || false,
      });
    })
    .join("");
}

function renderChips(section, x, y, w, h, t) {
  const columns = section.columns || 2;
  const gap = 10;
  const rows = Math.ceil(section.items.length / columns);
  const chipW = (w - gap * (columns - 1)) / columns;
  const chipH = (h - gap * (rows - 1)) / rows;
  return section.items
    .map((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      return cardSvg({
        x: x + col * (chipW + gap),
        y: y + row * (chipH + gap),
        w: chipW,
        h: chipH,
        t,
        index: undefined,
        title: item,
        desc: "",
        compact: true,
        centered: true,
      });
    })
    .join("");
}

function renderSteps(section, x, y, w, h, t) {
  const gap = 10;
  const rowH = (h - gap * (section.items.length - 1)) / section.items.length;
  return section.items
    .map((item, index) => {
      const rowY = y + index * (rowH + gap);
      const itemTitle = typeof item === "string" ? item : item.title;
      const itemDesc = typeof item === "string" ? "" : item.desc;
      return `
        <rect x="${x}" y="${rowY}" width="${w}" height="${rowH}" rx="8" fill="${t.panel}" stroke="${t.line}" stroke-width="1.1"/>
        <circle cx="${x + 34}" cy="${rowY + rowH / 2}" r="17" fill="${t.accent}" opacity="0.18" stroke="${t.accent}" stroke-width="1.4"/>
        <text x="${x + 34}" y="${rowY + rowH / 2 + 5}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="${t.accent}">${index + 1}</text>
        ${textSvg(itemTitle, {
          x: x + 65,
          y: rowY + Math.max(26, rowH / 2 - (itemDesc ? 12 : 0)),
          size: 21,
          fill: t.ink,
          weight: 700,
          maxChars: 52,
        })}
        ${itemDesc ? textSvg(itemDesc, {
          x: x + 65,
          y: rowY + rowH / 2 + 18,
          size: 15,
          fill: t.muted,
          maxChars: 72,
        }) : ""}
      `;
    })
    .join("");
}

function renderSplit(section, x, y, w, h, t) {
  const gap = 15;
  const columnW = (w - gap) / 2;
  return section.groups
    .map((group, groupIndex) => {
      const gx = x + groupIndex * (columnW + gap);
      const items = group.items || [];
      const rowH = (h - 68) / Math.max(items.length, 1);
      return `
        <rect x="${gx}" y="${y}" width="${columnW}" height="${h}" rx="8" fill="${t.panel}" stroke="${t.line}" stroke-width="1.1"/>
        <text x="${gx + 18}" y="${y + 32}" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="1.2" fill="${t.accent}">${escapeXml(group.title.toUpperCase())}</text>
        <line x1="${gx + 18}" y1="${y + 43}" x2="${gx + columnW - 18}" y2="${y + 43}" stroke="${t.line}" stroke-width="1"/>
        ${items
          .map(
            (item, index) =>
              `<circle cx="${gx + 27}" cy="${y + 69 + index * rowH}" r="4" fill="${t.accent}"/>` +
              textSvg(item, {
                x: gx + 42,
                y: y + 73 + index * rowH,
                size: 16,
                fill: t.ink,
                maxChars: 24,
                lineHeight: 1.15,
              })
          )
          .join("")}
      `;
    })
    .join("");
}

function renderSections(sections, bodyY, bodyH, t) {
  const gap = 22;
  const totalWeight = sections.reduce((sum, section) => sum + (section.weight || 1), 0);
  let y = bodyY;
  let output = "";

  sections.forEach((section, index) => {
    const sectionH = (bodyH - gap * (sections.length - 1)) * ((section.weight || 1) / totalWeight);
    const headingH = section.title ? 46 : 0;
    output += section.title ? sectionHeadingSvg(section.title, 76, y + 15, t) : "";
    const contentY = y + headingH;
    const contentH = sectionH - headingH;

    if (section.style === "chips") output += renderChips(section, 76, contentY, 848, contentH, t);
    else if (section.style === "steps") output += renderSteps(section, 76, contentY, 848, contentH, t);
    else if (section.style === "split") output += renderSplit(section, 76, contentY, 848, contentH, t);
    else output += renderCards(section, 76, contentY, 848, contentH, t);

    y += sectionH + gap;
    if (index === sections.length - 1) y -= gap;
  });
  return output;
}

function renderDeckMap(t) {
  const centerX = 500;
  const centerY = 690;
  const suits = [
    { title: "WANDS", element: "Fire", theme: "Action", x: 190, y: 470 },
    { title: "CUPS", element: "Water", theme: "Emotion", x: 810, y: 470 },
    { title: "SWORDS", element: "Air", theme: "Thought", x: 190, y: 850 },
    { title: "PENTACLES", element: "Earth", theme: "Material", x: 810, y: 850 },
  ];

  const suitCards = suits
    .map(
      (suit) => `
        <rect x="${suit.x - 125}" y="${suit.y}" width="250" height="132" rx="8" fill="${t.panel}" stroke="${t.line}" stroke-width="1.1"/>
        <text x="${suit.x}" y="${suit.y + 30}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="${t.ink}">${suit.title}</text>
        <text x="${suit.x}" y="${suit.y + 61}" text-anchor="middle" font-family="Georgia, serif" font-size="17" fill="${t.accent}">${suit.element} / ${suit.theme}</text>
        <text x="${suit.x}" y="${suit.y + 94}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="${t.muted}">14 cards each</text>
      `
    )
    .join("");

  return `
    <circle cx="${centerX}" cy="${centerY}" r="148" fill="${t.panelAlt}" stroke="${t.accent}" stroke-width="1.5"/>
    <circle cx="${centerX}" cy="${centerY}" r="118" fill="none" stroke="${t.line}" stroke-width="1"/>
    <text x="${centerX}" y="${centerY - 25}" text-anchor="middle" font-family="Georgia, serif" font-size="66" font-weight="700" fill="${t.ink}">78</text>
    <text x="${centerX}" y="${centerY + 17}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="2" fill="${t.accent}">TOTAL CARDS</text>
    <text x="${centerX}" y="${centerY + 52}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="${t.muted}">22 Major + 56 Minor</text>
    <path d="M250 635 H330 M670 635 H750 M250 745 H330 M670 745 H750" stroke="${t.accentSoft}" stroke-width="2"/>
    ${suitCards}
  `;
}

function renderCelticCross(t) {
  const cards = [
    ["1", "Present", 500, 565],
    ["2", "Challenge", 500, 675],
    ["3", "Foundation", 500, 785],
    ["4", "Recent Past", 350, 620],
    ["5", "Goal", 650, 620],
    ["6", "Near Future", 650, 760],
  ];
  const column = [
    ["7", "Self", 835, 1020],
    ["8", "Environment", 835, 1100],
    ["9", "Hopes & Fears", 835, 1180],
    ["10", "Outcome", 835, 1260],
  ];
  return `
    <rect x="105" y="480" width="770" height="400" rx="10" fill="none" stroke="${t.line}" stroke-width="1"/>
    ${cards
      .map(
        ([number, label, cx, cy]) => `
          <rect x="${cx - 52}" y="${cy - 42}" width="104" height="84" rx="7" fill="${t.panelAlt}" stroke="${t.accent}" stroke-width="1.2"/>
          <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="700" fill="${t.ink}">${number}</text>
          <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="${t.muted}">${label}</text>
        `
      )
      .join("")}
    ${column
      .map(
        ([number, label, cx, cy]) => `
          <rect x="${cx - 80}" y="${cy - 25}" width="160" height="50" rx="7" fill="${t.panel}" stroke="${t.line}" stroke-width="1.1"/>
          <text x="${cx - 58}" y="${cy + 6}" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="700" fill="${t.accent}">${number}</text>
          <text x="${cx + 12}" y="${cy + 6}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="${t.ink}">${escapeXml(label)}</text>
        `
      )
      .join("")}
  `;
}

function renderPin(pin) {
  const t = themes[pin.theme] || themes.midnight;
  const titleLines = wrapText(pin.title, 23);
  const titleY = 206;
  const bodyY = titleY + titleLines.length * 70 + 50;
  const bodyBottom = 1235;
  const custom = pin.custom === "deckmap" ? renderDeckMap(t) : pin.custom === "celtic" ? renderCelticCross(t) : "";
  const content = custom || renderSections(pin.sections, bodyY, bodyBottom - bodyY, t);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <radialGradient id="glow" cx="50%" cy="18%" r="72%">
          <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${t.bg}" stop-opacity="0"/>
        </radialGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.055"/></feComponentTransfer>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="${t.bg}"/>
      <rect width="${W}" height="${H}" fill="url(#glow)"/>
      <rect width="${W}" height="${H}" fill="#ffffff" filter="url(#grain)" opacity="0.34"/>
      ${frameSvg(t)}
      <text x="500" y="101" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="3" fill="${t.accent}">${escapeXml(pin.label)}</text>
      ${textSvg(pin.title, {
        x: 500,
        y: titleY,
        size: 59,
        fill: t.ink,
        family: "Georgia, serif",
        weight: 700,
        anchor: "middle",
        lineHeight: 1.05,
        maxChars: 23,
      })}
      ${pin.intro ? textSvg(pin.intro, {
        x: 500,
        y: titleY + titleLines.length * 70 + 7,
        size: 16,
        fill: t.muted,
        anchor: "middle",
        lineHeight: 1.2,
        maxChars: 70,
      }) : ""}
      ${content}
      ${footerSvg(t, pin.note)}
    </svg>
  `;
}

const pins = [
  {
    file: "p01-yes-no-maybe.png",
    theme: "midnight",
    label: "TAROT QUICK GUIDE",
    title: "Yes, No, or Maybe?",
    intro: "A quick starting point. Your full spread and your question always matter more.",
    sections: [
      {
        title: "Read The Energy First",
        style: "split",
        weight: 1.45,
        groups: [
          {
            title: "Yes-leaning",
            items: ["The Sun", "The Star", "The World", "The Lovers", "The Empress", "Two of Cups"],
          },
          {
            title: "No or pause",
            items: ["The Tower", "Three of Swords", "Ten of Swords", "Five of Pentacles", "The Moon", "Seven of Cups"],
          },
        ],
      },
      {
        title: "When It Feels Unclear",
        style: "chips",
        columns: 2,
        weight: 0.72,
        items: ["What am I not seeing?", "What is the next best step?", "What would self-trust look like?", "What needs more time?"],
      },
    ],
    note: "Context, position, and the whole spread come before a one-card answer.",
    board: "Tarot Readings",
    description: "A saveable tarot quick guide for yes-or-no readings. Use the card energy as a starting point, then read the full spread in context.",
    alt: "Tarot yes, no, or maybe quick-reference card with upright card examples.",
  },
  {
    file: "p02-78-card-map.png",
    theme: "sage",
    label: "TAROT BASICS",
    title: "The 78-Card Deck",
    intro: "Exactly what is inside a tarot deck - and how the four suits divide.",
    custom: "deckmap",
    note: "22 Major Arcana + 56 Minor Arcana = one complete tarot deck.",
    board: "Tarot Readings",
    description: "Understand the 78-card tarot deck at a glance: Major Arcana, four suits, elements, themes, and court cards.",
    alt: "Tarot deck map showing 22 Major Arcana and four suits of fourteen Minor Arcana cards.",
  },
  {
    file: "p03-major-arcana-0-10.png",
    theme: "parchment",
    label: "TAROT CHEAT SHEET",
    title: "Major Arcana 0-10",
    intro: "One clear keyword for the first twelve archetypes.",
    sections: [
      {
        title: "Keywords At A Glance",
        columns: 2,
        items: [
          { title: "0 The Fool", desc: "New beginning" },
          { title: "1 The Magician", desc: "Manifestation" },
          { title: "2 High Priestess", desc: "Intuition" },
          { title: "3 The Empress", desc: "Nurture" },
          { title: "4 The Emperor", desc: "Structure" },
          { title: "5 The Hierophant", desc: "Tradition" },
          { title: "6 The Lovers", desc: "Choice" },
          { title: "7 The Chariot", desc: "Willpower" },
          { title: "8 Strength", desc: "Courage" },
          { title: "9 The Hermit", desc: "Reflection" },
          { title: "10 Wheel of Fortune", desc: "Cycles" },
        ],
      },
    ],
    note: "Learn one keyword first. Add nuance after the card has a position and a question.",
    board: "Tarot Readings",
    description: "Major Arcana keywords from The Fool through Wheel of Fortune. A clean beginner reference for tarot journaling and study.",
    alt: "Tarot Major Arcana keyword chart for cards zero through ten.",
  },
  {
    file: "p04-major-arcana-11-21.png",
    theme: "plum",
    label: "TAROT CHEAT SHEET",
    title: "Major Arcana 11-21",
    intro: "One clear keyword for the second half of the Major Arcana.",
    sections: [
      {
        title: "Keywords At A Glance",
        columns: 2,
        items: [
          { title: "11 Justice", desc: "Balance" },
          { title: "12 The Hanged Man", desc: "Pause" },
          { title: "13 Death", desc: "Transformation" },
          { title: "14 Temperance", desc: "Moderation" },
          { title: "15 The Devil", desc: "Attachment" },
          { title: "16 The Tower", desc: "Disruption" },
          { title: "17 The Star", desc: "Hope" },
          { title: "18 The Moon", desc: "Uncertainty" },
          { title: "19 The Sun", desc: "Joy" },
          { title: "20 Judgement", desc: "Awakening" },
          { title: "21 The World", desc: "Completion" },
        ],
      },
    ],
    note: "A keyword is a doorway, not the whole reading. Notice what the image makes you feel.",
    board: "Tarot Readings",
    description: "Major Arcana keywords from Justice through The World. Save this beginner tarot chart for study and daily draws.",
    alt: "Tarot Major Arcana keyword chart for cards eleven through twenty-one.",
  },
  {
    file: "p05-court-card-map.png",
    theme: "sage",
    label: "TAROT BASICS",
    title: "Court Cards, Clearly",
    intro: "Pages learn. Knights move. Queens hold. Kings direct.",
    sections: [
      {
        title: "The Four Court Levels",
        columns: 2,
        items: [
          { title: "Page", desc: "Curiosity, messages, beginner energy" },
          { title: "Knight", desc: "Pursuit, movement, momentum" },
          { title: "Queen", desc: "Inner mastery, care, magnetism" },
          { title: "King", desc: "Outer mastery, authority, responsibility" },
        ],
      },
      {
        title: "Then Read The Suit",
        style: "chips",
        columns: 4,
        weight: 0.7,
        items: ["Wands: action", "Cups: emotion", "Swords: thought", "Pentacles: resources"],
      },
    ],
    note: "A court card can describe a person, a role, or a part of you.",
    board: "Tarot Readings",
    description: "Learn the tarot court cards without memorizing a wall of text. Pages, Knights, Queens, Kings, and the four suit themes in one chart.",
    alt: "Tarot court card guide with Page, Knight, Queen, King, and suit meanings.",
  },
  {
    file: "p06-three-card-spreads.png",
    theme: "midnight",
    label: "TAROT SPREADS",
    title: "4 Three-Card Spreads",
    intro: "Simple positions that give a small reading more direction.",
    sections: [
      {
        title: "Choose The Question Shape",
        columns: 2,
        items: [
          { title: "Timeline", desc: "Past / Present / Future" },
          { title: "Choice", desc: "Situation / Action / Outcome" },
          { title: "Connection", desc: "You / Them / Relationship" },
          { title: "Whole Self", desc: "Mind / Body / Spirit" },
        ],
      },
      {
        title: "Before You Pull",
        style: "chips",
        columns: 3,
        weight: 0.72,
        items: ["Ask one honest question", "Write the positions down", "Notice the first sentence that lands"],
      },
    ],
    note: "The best spread is the one that matches the real question.",
    board: "Tarot Readings",
    description: "Four easy three-card tarot spreads for timing, decisions, relationships, and self-reflection. Save for your next reading.",
    alt: "Four simple three-card tarot spread layouts with position meanings.",
  },
  {
    file: "p07-celtic-cross.png",
    theme: "parchment",
    label: "TAROT SPREADS",
    title: "Celtic Cross",
    intro: "The classic ten-card spread, decoded from start to finish.",
    custom: "celtic",
    note: "Read the story in order, then return to the center and look for repeated themes.",
    board: "Tarot Readings",
    description: "A clear Celtic Cross tarot spread diagram with all ten card positions. Save this for deeper readings and study notes.",
    alt: "Celtic Cross tarot spread diagram with ten numbered positions and labels.",
  },
  {
    file: "p08-reversed-card-themes.png",
    theme: "plum",
    label: "TAROT CHEAT SHEET",
    title: "Reversed Cards",
    intro: "Reversed does not automatically mean bad. Read for the theme.",
    sections: [
      {
        title: "Common Reversal Themes",
        columns: 2,
        items: [
          { title: "Blocked", desc: "The energy cannot move freely yet" },
          { title: "Delayed", desc: "Timing or readiness needs attention" },
          { title: "Internalized", desc: "The lesson is happening inside you" },
          { title: "Resisted", desc: "You may be avoiding the next step" },
          { title: "Shadowed", desc: "An unhelpful pattern is asking for light" },
          { title: "Boundary", desc: "A limit needs to be named or protected" },
          { title: "Released", desc: "You are ready to let the energy move" },
          { title: "Extra Layer", desc: "The card is asking for more nuance" },
        ],
      },
    ],
    note: "Check the deck's guidebook, the position, and the story around the card.",
    board: "Tarot Readings",
    description: "Eight practical ways to read reversed tarot cards without treating them as automatic bad news. A saveable beginner reference.",
    alt: "Reversed tarot card meanings chart with eight common interpretation themes.",
  },
  {
    file: "p09-tarot-journal-prompts.png",
    theme: "parchment",
    label: "TAROT JOURNAL",
    title: "12 Questions To Ask",
    intro: "Use a pull as a starting point, then write one honest paragraph.",
    sections: [
      {
        title: "Prompts For Your Practice",
        columns: 2,
        items: [
          "What am I avoiding?",
          "Where am I overgiving?",
          "What needs a boundary?",
          "What am I ready to release?",
          "What is the lesson in this pattern?",
          "What would brave look like?",
          "What am I pretending not to know?",
          "Where is support available?",
          "What can wait?",
          "What am I grateful for?",
          "What truth feels steady?",
          "What small action can I take?",
        ],
      },
    ],
    note: "Keep the answer specific. A useful journal entry usually names one next step.",
    board: "Spirituality & Manifestation",
    description: "Twelve tarot journal prompts for clarity, boundaries, self-trust, and meaningful daily reflection.",
    alt: "Twelve tarot journal prompts arranged in a simple two-column chart.",
  },
  {
    file: "p10-30-day-tarot-challenge.png",
    theme: "sage",
    label: "TAROT PRACTICE",
    title: "30-Day Tarot Challenge",
    intro: "One small practice a day. No pressure, no perfect answers.",
    sections: [
      {
        title: "A Month With The Cards",
        columns: 5,
        compact: true,
        items: [
          "Card of the day", "Notice the art", "One keyword", "Ask a yes/no", "Pull two cards",
          "Journal a line", "Find the suit", "Look for a number", "Read a court card", "Try a three-card spread",
          "Ask about love", "Ask about work", "Ask about rest", "Notice a pattern", "Write a question",
          "Do a no-card day", "Shuffle slowly", "Name an emotion", "Try reversed", "Find an action",
          "Read for a friend", "Make a tiny ritual", "Return to a card", "Compare two decks", "Write a thank-you",
          "Pull for the week", "Read the image first", "Make a boundary", "Choose one next step", "Close the month",
        ],
      },
    ],
    note: "Save the chart. Tick off one square at a time and return to what repeats.",
    board: "Tarot Readings",
    description: "A 30-day tarot challenge for beginners: daily prompts for card meanings, spreads, journaling, and intuition practice.",
    alt: "Thirty-day tarot practice challenge chart with five columns and six rows.",
  },
  {
    file: "p11-big-three-cheatsheet.png",
    theme: "midnight",
    label: "ASTROLOGY BASICS",
    title: "Your Big Three",
    intro: "Sun, Moon, and Rising describe three different layers of you.",
    sections: [
      {
        title: "Read The Layers",
        columns: 3,
        items: [
          { title: "Sun", desc: "Core self, vitality, identity" },
          { title: "Moon", desc: "Inner world, emotions, needs" },
          { title: "Rising", desc: "First impression, style, instinct" },
        ],
      },
      {
        title: "Try This Sentence",
        style: "chips",
        columns: 1,
        weight: 0.75,
        items: ["I am [Sun] / I feel [Moon] / I meet the world as [Rising]"],
      },
    ],
    note: "You need your exact birth time and place for the Rising sign.",
    board: "Astrology & Zodiac",
    description: "A saveable Big Three astrology cheat sheet explaining Sun, Moon, and Rising signs and how to read them together.",
    alt: "Big Three astrology chart explaining Sun, Moon, and Rising sign meanings.",
  },
  {
    file: "p12-zodiac-dates-elements.png",
    theme: "parchment",
    label: "ASTROLOGY CHEAT SHEET",
    title: "Zodiac Dates & Elements",
    intro: "A quick reference for all twelve signs, their dates, element, and mode.",
    sections: [
      {
        title: "The Twelve Signs",
        columns: 2,
        compact: true,
        items: [
          { title: "Aries", desc: "Mar 21-Apr 19 / Fire / Cardinal" },
          { title: "Taurus", desc: "Apr 20-May 20 / Earth / Fixed" },
          { title: "Gemini", desc: "May 21-Jun 20 / Air / Mutable" },
          { title: "Cancer", desc: "Jun 21-Jul 22 / Water / Cardinal" },
          { title: "Leo", desc: "Jul 23-Aug 22 / Fire / Fixed" },
          { title: "Virgo", desc: "Aug 23-Sep 22 / Earth / Mutable" },
          { title: "Libra", desc: "Sep 23-Oct 22 / Air / Cardinal" },
          { title: "Scorpio", desc: "Oct 23-Nov 21 / Water / Fixed" },
          { title: "Sagittarius", desc: "Nov 22-Dec 21 / Fire / Mutable" },
          { title: "Capricorn", desc: "Dec 22-Jan 19 / Earth / Cardinal" },
          { title: "Aquarius", desc: "Jan 20-Feb 18 / Air / Fixed" },
          { title: "Pisces", desc: "Feb 19-Mar 20 / Water / Mutable" },
        ],
      },
    ],
    note: "Dates can shift by a day depending on the year and your time zone.",
    board: "Astrology & Zodiac",
    description: "Zodiac dates, elements, and modalities for all twelve signs. A clean astrology reference pin for beginners.",
    alt: "Zodiac chart with twelve signs, date ranges, elements, and modalities.",
  },
  {
    file: "p13-birth-chart-houses-1-6.png",
    theme: "plum",
    label: "ASTROLOGY CHEAT SHEET",
    title: "Birth Chart Houses 1-6",
    intro: "The first six houses describe your inner life and daily world.",
    sections: [
      {
        title: "House Keywords",
        columns: 2,
        items: [
          { title: "1st House", desc: "Self, body, first impression" },
          { title: "2nd House", desc: "Money, values, resources" },
          { title: "3rd House", desc: "Communication, learning, siblings" },
          { title: "4th House", desc: "Home, roots, family" },
          { title: "5th House", desc: "Creativity, romance, play" },
          { title: "6th House", desc: "Routine, health, work" },
        ],
      },
    ],
    note: "A placement becomes personal when you read the sign, house, and aspect together.",
    board: "Astrology & Zodiac",
    description: "A beginner astrology chart showing the meanings of houses one through six in a birth chart.",
    alt: "Birth chart houses one through six reference chart with keywords.",
  },
  {
    file: "p14-birth-chart-houses-7-12.png",
    theme: "sage",
    label: "ASTROLOGY CHEAT SHEET",
    title: "Birth Chart Houses 7-12",
    intro: "The second six houses describe relationship, growth, and the unseen.",
    sections: [
      {
        title: "House Keywords",
        columns: 2,
        items: [
          { title: "7th House", desc: "Partnership, contracts, mirroring" },
          { title: "8th House", desc: "Shared resources, intimacy, transformation" },
          { title: "9th House", desc: "Beliefs, travel, higher study" },
          { title: "10th House", desc: "Career, reputation, public role" },
          { title: "11th House", desc: "Community, hopes, networks" },
          { title: "12th House", desc: "Solitude, subconscious, release" },
        ],
      },
    ],
    note: "Empty houses are not missing. Their ruling planets still have a story to tell.",
    board: "Astrology & Zodiac",
    description: "A beginner astrology chart showing the meanings of houses seven through twelve in a birth chart.",
    alt: "Birth chart houses seven through twelve reference chart with keywords.",
  },
  {
    file: "p15-angel-numbers-111-999.png",
    theme: "midnight",
    label: "SPIRITUAL REFERENCE",
    title: "Angel Numbers 111-999",
    intro: "A reflective guide to repeating numbers. Use it as a prompt, not a command.",
    sections: [
      {
        title: "Repeating Numbers At A Glance",
        columns: 3,
        compact: true,
        items: [
          { title: "111", desc: "New beginnings / alignment" },
          { title: "222", desc: "Trust / balance / patience" },
          { title: "333", desc: "Support / expression / growth" },
          { title: "444", desc: "Protection / foundation / home" },
          { title: "555", desc: "Change / freedom / movement" },
          { title: "666", desc: "Rebalance / awareness / care" },
          { title: "777", desc: "Spiritual growth / lucky timing" },
          { title: "888", desc: "Abundance / cycles / exchange" },
          { title: "999", desc: "Completion / release / closure" },
        ],
      },
    ],
    note: "Notice the thought you were having when the number appeared. That context matters.",
    board: "Spirituality & Manifestation",
    description: "Angel number meanings for 111 through 999. A saveable spiritual reference for journaling and reflection.",
    alt: "Angel numbers 111 through 999 chart with short reflective meanings.",
  },
  {
    file: "p16-moon-phase-meanings.png",
    theme: "plum",
    label: "MOON RITUAL",
    title: "Moon Phases",
    intro: "A simple rhythm for beginning, building, releasing, and resting.",
    sections: [
      {
        title: "Eight Phase Meanings",
        columns: 2,
        items: [
          { title: "New Moon", desc: "Begin / set an intention" },
          { title: "Waxing Crescent", desc: "Commit / take the first step" },
          { title: "First Quarter", desc: "Act / make the decision" },
          { title: "Waxing Gibbous", desc: "Refine / adjust the plan" },
          { title: "Full Moon", desc: "Reveal / celebrate what is here" },
          { title: "Waning Gibbous", desc: "Share / integrate the lesson" },
          { title: "Last Quarter", desc: "Release / forgive and clear" },
          { title: "Waning Crescent", desc: "Rest / surrender and restore" },
        ],
      },
    ],
    note: "Use the phase as a journaling prompt. You do not need a perfect ritual.",
    board: "Spirituality & Manifestation",
    description: "A moon phase cheat sheet with meanings and simple ritual prompts for each part of the lunar cycle.",
    alt: "Moon phase meanings chart with eight phases and reflective prompts.",
  },
  {
    file: "p17-crystal-intentions.png",
    theme: "sage",
    label: "SPIRITUAL REFERENCE",
    title: "Crystals By Intention",
    intro: "Choose a stone by the quality you want to practice, not by a promise.",
    sections: [
      {
        title: "Twelve Common Stones",
        columns: 2,
        items: [
          { title: "Amethyst", desc: "Intuition / calm" },
          { title: "Clear Quartz", desc: "Clarity / amplification" },
          { title: "Rose Quartz", desc: "Love / self-compassion" },
          { title: "Citrine", desc: "Confidence / abundance" },
          { title: "Black Tourmaline", desc: "Protection / boundaries" },
          { title: "Selenite", desc: "Cleansing / clear space" },
          { title: "Lapis Lazuli", desc: "Truth / wisdom" },
          { title: "Green Aventurine", desc: "Opportunity / growth" },
          { title: "Carnelian", desc: "Courage / creativity" },
          { title: "Moonstone", desc: "Cycles / intuition" },
          { title: "Labradorite", desc: "Transformation / shadow" },
          { title: "Tiger's Eye", desc: "Focus / grounding" },
        ],
      },
    ],
    note: "Crystal traditions vary. Use this as a personal reflection tool, not medical advice.",
    board: "Spirituality & Manifestation",
    description: "A crystal intention chart for twelve common stones, organized for journaling, altar building, and spiritual reflection.",
    alt: "Crystal intention chart with twelve common stones and their reflective qualities.",
  },
  {
    file: "p18-intuition-vs-anxiety.png",
    theme: "parchment",
    label: "SPIRITUAL PRACTICE",
    title: "Intuition or Anxiety?",
    intro: "Both can be loud. A grounded choice usually arrives after the nervous system settles.",
    sections: [
      {
        title: "Notice The Difference",
        style: "split",
        groups: [
          {
            title: "Intuition often feels",
            items: ["Quiet and steady", "Present in the body", "Clear after rest", "Simple, not dramatic", "Connected to a next step"],
          },
          {
            title: "Anxiety often feels",
            items: ["Urgent and loud", "Future-focused", "Repeating in loops", "Escalating under pressure", "Hard to act on calmly"],
          },
        ],
      },
      {
        title: "Try This First",
        style: "chips",
        columns: 3,
        weight: 0.65,
        items: ["Breathe for 90 seconds", "Drink water", "Ask again tomorrow"],
      },
    ],
    note: "This is not a diagnosis. If anxiety is affecting daily life, reach out to a qualified professional.",
    board: "Spirituality & Manifestation",
    description: "A gentle intuition versus anxiety comparison chart for tarot readers, journaling, and grounded decision-making.",
    alt: "Intuition versus anxiety comparison chart with common signs and grounding steps.",
  },
  {
    file: "p19-new-moon-ritual.png",
    theme: "midnight",
    label: "MOON RITUAL",
    title: "New Moon Ritual",
    intro: "A simple seven-step reset for beginning again.",
    sections: [
      {
        title: "Keep It Small And Real",
        style: "steps",
        items: [
          { title: "Set aside ten minutes", desc: "Put the phone down and make a little space." },
          { title: "Name one intention", desc: "Choose a feeling or direction, not a perfect plan." },
          { title: "Choose one action", desc: "Make it small enough to do in the next 48 hours." },
          { title: "Draw one card", desc: "Ask what support or resistance is worth noticing." },
          { title: "Write a tiny promise", desc: "One sentence you can actually keep." },
          { title: "Close the ritual", desc: "Say thank you and leave the list somewhere visible." },
          { title: "Return at the full moon", desc: "Look for what grew, shifted, or needs release." },
        ],
      },
    ],
    note: "A ritual is a container for attention. Adapt it to your own beliefs.",
    board: "Spirituality & Manifestation",
    description: "A seven-step new moon ritual for setting intentions, drawing a tarot card, and taking one grounded action.",
    alt: "Seven-step new moon intention ritual chart with journaling prompts.",
  },
  {
    file: "p20-full-moon-release.png",
    theme: "plum",
    label: "MOON RITUAL",
    title: "Full Moon Release",
    intro: "A seven-step practice for seeing clearly and putting something down.",
    sections: [
      {
        title: "Make Room For What Is Next",
        style: "steps",
        items: [
          { title: "Pause and notice", desc: "What feels heavier than it did one month ago?" },
          { title: "Make a list", desc: "Write down what is taking up space in your mind." },
          { title: "Name the lesson", desc: "What did this season teach you about your needs?" },
          { title: "Offer yourself grace", desc: "You can learn without punishing yourself." },
          { title: "Choose one release", desc: "Pick one thought, habit, or expectation to put down." },
          { title: "Draw a card", desc: "Ask what wants to replace the weight you are releasing." },
          { title: "Create space", desc: "Do one small thing that makes the next chapter possible." },
        ],
      },
    ],
    note: "Release is not failure. It is making room for a more honest next step.",
    board: "Spirituality & Manifestation",
    description: "A seven-step full moon release ritual with reflection prompts and a tarot card pull for closure.",
    alt: "Seven-step full moon release ritual chart with reflection prompts.",
  },
];

async function generate() {
  await fs.mkdir(outDir, { recursive: true });

  const manifest = [];
  for (const pin of pins) {
    const svg = renderPin(pin);
    const filePath = path.join(outDir, pin.file);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(filePath);
    manifest.push({ ...pin, filePath });
    console.log(`generated ${pin.file}`);
  }

  const tileW = 200;
  const tileH = 300;
  const gapX = 45;
  const gapY = 30;
  const contactWidth = 4 * tileW + 3 * gapX + 80;
  const contactHeight = 5 * tileH + 4 * gapY + 80;
  const composites = [];
  for (let index = 0; index < manifest.length; index += 1) {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const input = await sharp(manifest[index].filePath).resize(tileW, tileH).toBuffer();
    composites.push({ input, left: 40 + col * (tileW + gapX), top: 40 + row * (tileH + gapY) });
  }
  await sharp({
    create: { width: contactWidth, height: contactHeight, channels: 3, background: "#09100f" },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, "contact-sheet.png"));

  const lines = [
    "# Pinterest Batch 11 - Saveable Reference Pins",
    "",
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "Focus: list, map, spread, and cheat-sheet formats that give people a reason to save and return.",
    "",
    "Files: `public/images/pins10/`",
    "",
    "| # | File | Board | Pinterest Title | Description | Alt Text |",
    "|---:|---|---|---|---|---|",
    ...manifest.map((pin, index) => {
      const title = pin.title;
      const desc = pin.description.replaceAll("|", "/");
      const alt = pin.alt.replaceAll("|", "/");
      return `| ${index + 1} | \`${pin.file}\` | ${pin.board} | ${title} | ${desc} | ${alt} |`;
    }),
    "",
    "## Posting Notes",
    "",
    "- Publish 3-5 pins per day, spaced across the day.",
    "- Use the file title as the Pinterest title when possible.",
    "- Keep the destination URL as `https://mysticsages.com/reading` unless a more specific article is available.",
    "- Do not change the text in the image; the exact wording is part of the design.",
    "",
    "## Design Rules Used",
    "",
    "- 1000 x 1500 px, 2:3 ratio.",
    "- One idea per pin, readable at thumbnail size.",
    "- Short English copy with no promises or invented social proof.",
    "- Brand footer on every pin.",
  ];
  await fs.writeFile(path.join(outDir, "发布清单-Batch11.md"), `${lines.join("\n")}\n`, "utf8");
  console.log(`generated contact sheet and manifest in ${outDir}`);
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
