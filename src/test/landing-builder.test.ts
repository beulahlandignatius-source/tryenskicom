import { describe, expect, it } from "vitest";
import { PALETTES, contrast, contrastWarnings, blankLanding, conversionRate } from "@/lib/creator/landing";
import { stateSchema, validateLanding, LANDING_MAX_QUESTIONS } from "@/lib/creator/rules";
import { initialCreatorState } from "@/lib/creator/data";

describe("Landing page builder rules", () => {
  it("offers the ten colour presets", () => {
    expect(PALETTES.map((p) => p.name)).toEqual(["Enski Signature", "Ocean Blue", "Lavender Dream", "Emerald Luxe", "Sunset Glow", "Rose Elegance", "Golden Hour", "Midnight Luxury", "Earthy Organic", "Minimal Monochrome"]);
  });
  it("Enski Signature uses the official palette", () => {
    const e = PALETTES[0]!.colors;
    expect([e.primary, e.secondary, e.accent, e.heading]).toEqual(["#1A42A6", "#3D8EF0", "#C2F24A", "#0A1F55"]);
  });
  it("flags unreadable colour pairs", () => {
    expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    expect(contrastWarnings({ ...PALETTES[0]!.colors, buttonText: "#C2F24A" })).toContain("Button text is hard to read on the button colour.");
  });
  it("older saved pages still load with defaults", () => {
    const old = { id: "a", title: "A", slug: "a", itemId: "", headline: "H", body: "", cta: "Go", status: "draft", date: "", template: "split", cover: "", sections: [] };
    const s = stateSchema.parse({ ...initialCreatorState, landingPages: [old] });
    expect(s.landingPages[0]!.template).toBe("split");
    expect(s.landingPages[0]!.palette).toBe("enski-signature");
  });
  it("caps custom questions at eight", () => {
    expect(LANDING_MAX_QUESTIONS).toBe(8);
  });
  it("imported pages need pasted HTML, not a headline", () => {
    const p = { ...blankLanding("import"), title: "Launch", slug: "launch" };
    expect(validateLanding(p, [])).toMatch(/Paste/);
    expect(validateLanding({ ...p, importHtml: "<h1>Hi</h1>" }, [])).toBe("");
  });
  it("custom redirect needs a full web address", () => {
    const p = { ...blankLanding(), title: "T", slug: "t", headline: "H" };
    expect(validateLanding({ ...p, form: { ...p.form, after: "url", redirectUrl: "example" } }, [])).toMatch(/https/);
  });
  it("shows no conversion rate without real views", () => {
    expect(conversionRate(5)).toBeNull();
    expect(conversionRate(5, 200)).toBe(2.5);
  });
});
