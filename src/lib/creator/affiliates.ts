import type { Affiliate, CommissionRule, CreatorState, ItemKind, Program } from "./rules";

/** Category labels shown on commission screens, in the order creators see them. */
export const COMMISSION_CATEGORIES: { kind: ItemKind; label: string }[] = [
  { kind: "course", label: "Course" },
  { kind: "ebook", label: "Ebook" },
  { kind: "live", label: "Live Training" },
  { kind: "coaching", label: "Coaching" },
  { kind: "service", label: "Gig/Services" },
];
export const categoryLabel = (k: ItemKind) => COMMISSION_CATEGORIES.find((c) => c.kind === k)?.label ?? k;

export type RateSource = "personal" | "product" | "category" | "none";
export const SOURCE_LABEL: Record<RateSource, string> = {
  personal: "Personal rate",
  product: "Product rate",
  category: "Category default",
  none: "Not set",
};

/** Which saved rate applies, in order: personal affiliate rate, product rule, category default. Display only. */
export function resolveRate(
  s: Pick<CreatorState, "rules" | "categoryRates" | "items">,
  program: Pick<Program, "itemId" | "ruleId"> | null,
  affiliate?: Pick<Affiliate, "rate"> | null,
): { rate: number | null; source: RateSource } {
  if (affiliate?.rate != null) return { rate: affiliate.rate, source: "personal" };
  const rule: CommissionRule | undefined = program ? s.rules.find((r) => r.id === program.ruleId) : undefined;
  if (rule) return { rate: rule.rate, source: "product" };
  const kind = program ? s.items.find((i) => i.id === program.itemId)?.kind : undefined;
  const cat = kind ? s.categoryRates[kind] : undefined;
  if (cat != null) return { rate: cat, source: "category" };
  return { rate: null, source: "none" };
}

/** Returns an error message for a category rate input, or "" when it's fine. Blank means "not set". */
export function categoryRateError(v: string) {
  if (!v.trim()) return "";
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1 || n > 90) return "Enter a rate between 1% and 90%.";
  return "";
}

export function paginate<T>(rows: T[], page: number, size = 10) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(Math.max(1, page), pages);
  return { rows: rows.slice((p - 1) * size, p * size), page: p, pages };
}

/** Referral code shown for an affiliate, stable per record. */
export const referralCode = (a: Pick<Affiliate, "id" | "name">) =>
  `${(a.name.replace(/[^a-z]/gi, "").slice(0, 4) || "ENSK").toUpperCase()}-${a.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
