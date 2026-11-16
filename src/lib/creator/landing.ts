import { landingSchema, LANDING_BLOCKS, type LandingBlock, type LandingColors, type LandingPage } from "./rules";

export const pageUrl = (handle: string, slug: string) => `https://tryenski.com/${handle || "your-store"}/p/${slug}`;

export type LandingTemplateId = LandingPage["template"];
export const LANDING_TEMPLATE_INFO: { id: LandingTemplateId; name: string; text: string; legacy?: boolean }[] = [
  { id: "enski-event", name: "Enski Event", text: "Cobalt event hero with lime highlights and a bold programme." },
  { id: "ethereal-luxury", name: "Ethereal Luxury", text: "Soft gradients, serif accents and generous space." },
  { id: "cyber-grid", name: "Cyber Grid", text: "Dark grid lines, mono labels and glowing edges." },
  { id: "neo-brutalism", name: "Neo Brutalism", text: "Thick borders, hard shadows and loud blocks." },
  { id: "swiss-minimalist", name: "Swiss Minimalist", text: "Strict grid, big type, no decoration." },
  { id: "earthy-organic", name: "Earthy Organic", text: "Rounded shapes, warm tones and calm rhythm." },
  { id: "spatial-3d", name: "Spatial 3D", text: "Layered cards with depth and floating shapes." },
  { id: "glass-material", name: "Glass/Material", text: "Frosted panels over a soft colour field." },
  { id: "spotlight", name: "Spotlight", text: "Bold centred hero", legacy: true },
  { id: "split", name: "Split", text: "Text beside image", legacy: true },
  { id: "minimal", name: "Minimal", text: "Clean and text-led", legacy: true },
];
export const VARIATIONS = [
  { id: "t1", name: "T1", text: "Centred hero" },
  { id: "t2", name: "T2", text: "Split hero" },
  { id: "t3", name: "T3", text: "Full-bleed image" },
] as const;
export const templateName = (id: LandingTemplateId) => LANDING_TEMPLATE_INFO.find((t) => t.id === id)?.name ?? id;

export const BLOCK_LABELS: Record<LandingBlock, string> = {
  stats: "Key statistics", about: "About the event", speakers: "Speakers", features: "Features / experience",
  countdown: "Countdown timer", programme: "Programme / schedule", testimonials: "Testimonials", cta: "Bottom CTA banner",
};

const c = (primary: string, secondary: string, accent: string, background: string, heading: string, body: string, buttonBg: string, buttonText: string): LandingColors =>
  ({ primary, secondary, accent, background, heading, body, buttonBg, buttonText });
export const PALETTES: { id: string; name: string; colors: LandingColors }[] = [
  { id: "enski-signature", name: "Enski Signature", colors: c("#1A42A6", "#3D8EF0", "#C2F24A", "#FFFFFF", "#0A1F55", "#3A4A6B", "#C2F24A", "#0A1F55") },
  { id: "ocean-blue", name: "Ocean Blue", colors: c("#0B2545", "#1F6FB2", "#3FD0D4", "#FFFFFF", "#0B2545", "#3B4F66", "#1F6FB2", "#FFFFFF") },
  { id: "lavender-dream", name: "Lavender Dream", colors: c("#5B2A86", "#9B7BD4", "#D9C8F5", "#FFFFFF", "#3A1A5A", "#5A4A6E", "#5B2A86", "#FFFFFF") },
  { id: "emerald-luxe", name: "Emerald Luxe", colors: c("#1F4D3A", "#2E8B57", "#B5C9A8", "#FBF7EE", "#173B2C", "#4A5A4F", "#1F4D3A", "#FBF7EE") },
  { id: "sunset-glow", name: "Sunset Glow", colors: c("#B4532A", "#F07B5A", "#FBC9A5", "#FFF6EC", "#5A2A16", "#6B4A3C", "#B4532A", "#FFFFFF") },
  { id: "rose-elegance", name: "Rose Elegance", colors: c("#6E1E36", "#E58FA8", "#F6D5DD", "#FFFCF5", "#4A1424", "#6A4A52", "#6E1E36", "#FFFCF5") },
  { id: "golden-hour", name: "Golden Hour", colors: c("#5A3A1E", "#D4A12A", "#E8D7B0", "#FFF9EC", "#3E2814", "#5E4C38", "#5A3A1E", "#FFF9EC") },
  { id: "midnight-luxury", name: "Midnight Luxury", colors: c("#2A2D34", "#1B2A4A", "#C0C6D0", "#FFFFFF", "#15171C", "#4A4F5A", "#1B2A4A", "#FFFFFF") },
  { id: "earthy-organic", name: "Earthy Organic", colors: c("#5B6B2F", "#C0643A", "#E6D9C2", "#FFFCF6", "#3A4420", "#5A5246", "#5B6B2F", "#FFFCF6") },
  { id: "minimal-monochrome", name: "Minimal Monochrome", colors: c("#111111", "#6B6B6B", "#C9C9C9", "#FFFFFF", "#111111", "#4A4A4A", "#111111", "#FFFFFF") },
];

function lum(hex: string) {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0]! + 0.7152 * v[1]! + 0.0722 * v[2]!;
}
/** WCAG contrast ratio between two #RRGGBB colours. */
export function contrast(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m) as [number, number];
  return (x + 0.05) / (y + 0.05);
}
export const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
/** Pairs that must stay readable; returns plain-language warnings. */
export function contrastWarnings(col: LandingColors) {
  const out: string[] = [];
  if (contrast(col.heading, col.background) < 3) out.push("Headings are hard to read on the background.");
  if (contrast(col.body, col.background) < 4.5) out.push("Body text is hard to read on the background.");
  if (contrast(col.buttonText, col.buttonBg) < 4.5) out.push("Button text is hard to read on the button colour.");
  return out;
}

export const blankLanding = (mode: LandingPage["mode"] = "template"): LandingPage =>
  landingSchema.parse({ id: "", title: "", slug: "", itemId: "", headline: "", body: "", cta: "Register now", status: "draft", date: "", template: mode === "import" ? "spotlight" : "enski-event", mode });

export const enabledBlocks = (p: LandingPage) => p.blocks.filter((b) => b.on);
export const allBlocksIn = (p: LandingPage) => {
  const have = new Set(p.blocks.map((b) => b.id));
  return [...p.blocks, ...LANDING_BLOCKS.filter((id) => !have.has(id)).map((id) => ({ id, on: false }))];
};
/** Conversion only when real views exist. */
export const conversionRate = (leads: number, views?: number) => (views && views > 0 ? Math.round((leads / views) * 1000) / 10 : null);
