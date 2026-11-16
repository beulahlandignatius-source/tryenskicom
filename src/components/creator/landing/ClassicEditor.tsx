import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, Eye, LayoutTemplate, Monitor, Rows3, Save, Send, SlidersHorizontal, Smartphone, Plus, Trash2, Type } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { FilterSelect } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { LANDING_MAX_SECTIONS, slugify, validateLanding, type LandingPage, type LandingSection } from "@/lib/creator/rules";
import { blankLanding, pageUrl } from "@/lib/creator/landing";
import { restoreAt, sameId } from "@/lib/shared/listUndo";
import { undoToast } from "@/lib/shared/undo";
import { ImageUpload } from "../ImageUpload";
import { ItemStatus } from "../shared";

type Thumb = (id: LandingPage["template"], cover: string) => ReactNode;
type Preview = (page: LandingPage, device: "desktop" | "mobile") => ReactNode;
const templates: { id: LandingPage["template"]; name: string; text: string }[] = [
  { id: "spotlight", name: "Spotlight", text: "Bold centred hero" },
  { id: "split", name: "Split", text: "Text beside image" },
  { id: "minimal", name: "Minimal", text: "Clean and text-led" },
];
/** Every ready-made section a creator can drop in from the dropdown, plus a blank one. */
const sectionPresets = [
  { title: "What you'll get", text: "List the outcomes, lessons or files people receive." },
  { title: "About me", text: "Introduce yourself and why you're the right person to learn from." },
  { title: "What people say", text: "Share a short quote from a happy customer." },
  { title: "Who this is for", text: "Describe the people who will get the most from this." },
  { title: "How it works", text: "Walk people through the steps from joining to results." },
  { title: "Bonuses", text: "Extra templates, sessions or files people get when they join." },
  { title: "Schedule", text: "Dates, times and what happens in each session." },
  { title: "Pricing", text: "What it costs and what's included." },
  { title: "Frequently asked questions", text: "Answer the questions people ask before they join." },
  { title: "Guarantee", text: "Your promise if it isn't right for them." },
];
const TABS = [
  { id: "design", label: "Design", icon: LayoutTemplate },
  { id: "content", label: "Content", icon: Type },
  { id: "sections", label: "Sections", icon: Rows3 },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
] as const;

/** The original tabbed Enski builder (Design · Content · Sections · Settings) with the classic templates. */
export function ClassicEditor({ id, thumb, preview }: { id?: string | undefined; thumb: Thumb; preview: Preview }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const found = state.landingPages.find((p) => p.id === id);
  const [presetPick, setPresetPick] = useState("");
  const [form, setForm] = useState<LandingPage>(
    found ?? { ...blankLanding(), template: "spotlight" },
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(found));
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(found ? "content" : "design");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
    const products = state.items.filter((i) => i.status !== "archived");
  const product = products.find((i) => i.id === form.itemId);
  const setSection = (sid: string, patch: Partial<LandingSection>) => setForm((f) => ({ ...f, sections: f.sections.map((x) => (x.id === sid ? { ...x, ...patch } : x)) }));
  const move = (i: number, d: -1 | 1) => setForm((f) => { const next = [...f.sections]; const [x] = next.splice(i, 1); if (x) next.splice(i + d, 0, x); return { ...f, sections: next }; });
  const save = (status: LandingPage["status"]) => {
    const page = { ...form, status, id: found?.id ?? crypto.randomUUID(), title: form.title.trim(), headline: form.headline.trim(), cta: form.cta.trim(), sections: form.sections.map((x) => ({ ...x, title: x.title.trim(), text: x.text.trim() })), date: new Date().toISOString() };
    const err = validateLanding(page, state.landingPages);
    if (err) {
      setError(err);
      if (!page.title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug)) setTab("settings"); else if (page.sections.some((x) => !x.title)) setTab("sections"); else setTab("content");
      return;
    }
    try {
      update((s) => ({
        landingPages: found ? s.landingPages.map((p) => (p.id === page.id ? page : p)) : [...s.landingPages, page],
        activity: [...s.activity, activityEntry(`${found ? "Updated" : "Created"} landing page: ${page.title}`)],
      }));
    } catch {
      setError("Your images are too large to save. Remove or replace one and try again.");
      return;
    }
    toast.success(status === "published" ? "Landing page published" : "Landing page saved");
    navigate({ to: "/creator/landing-pages" });
  };
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime-text"><span className="neon-dot" aria-hidden="true" />Enski special</p>
          <h1 className="truncate text-2xl sm:text-[28px]">{form.title || (found ? found.title : "New landing page")}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ItemStatus status={form.status} />
          <Button variant="outline" onClick={() => save("draft")}><Save />Save draft</Button>
          <Button onClick={() => save("published")}><Send />{form.status === "published" ? "Update page" : "Publish"}</Button>
        </div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-[14px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</p>}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <section className="surface overflow-hidden lg:sticky lg:top-24">
          <div className="grid grid-cols-4 border-b p-1.5" role="tablist" aria-label="Builder panels">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("flex flex-col items-center gap-1 rounded-[14px] py-2 text-xs font-extrabold transition-colors", tab === t.id ? "bg-ice text-cobalt" : "text-muted-foreground hover:text-cobalt")}>
                <t.icon className="h-4 w-4" />{t.label}
              </button>
            ))}
          </div>
          <div className="max-h-none space-y-5 overflow-x-hidden p-5 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto" role="tabpanel">
            {tab === "design" && (
              <>
                <div>
                  <p className="text-sm font-extrabold">Choose a template</p>
                  <p className="text-[13px] text-muted-foreground">You can switch any time; your content stays.</p>
                </div>
                <div className="grid gap-3" role="radiogroup" aria-label="Template">
                  {templates.map((t) => (
                    <button key={t.id} type="button" role="radio" aria-checked={form.template === t.id} onClick={() => setForm({ ...form, template: t.id })} className={cn("flex items-center gap-3 rounded-[18px] border-[1.5px] p-2.5 text-left transition-all", form.template === t.id ? "border-cobalt bg-ice/60 ring-1 ring-cobalt" : "border-line hover:border-cobalt-100")}>
                      <span className="aspect-[4/3] w-28 shrink-0">{thumb(t.id, form.cover)}</span>
                      <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold">{t.name}</span><span className="block text-xs text-muted-foreground">{t.text}</span></span>
                      {form.template === t.id && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cobalt text-primary-foreground"><Check className="h-3.5 w-3.5" /></span>}
                    </button>
                  ))}
                </div>
                <ImageUpload id="lp-cover" label="Cover image" value={form.cover} onChange={(v) => setForm({ ...form, cover: v })} hint="Shown in the hero · JPG, PNG or WebP up to 5 MB" />
              </>
            )}
            {tab === "content" && (
              <>
                <Field id="lp-headline" label="Headline" hint={`${form.headline.length}/140`}>
                  <Input id="lp-headline" value={form.headline} maxLength={140} placeholder="e.g. Learn product design in 30 days" onChange={(e) => setForm({ ...form, headline: e.target.value })} />
                </Field>
                <Field id="lp-body" label="Description">
                  <Textarea id="lp-body" rows={5} value={form.body} maxLength={2000} placeholder="Who it's for and what they'll get." onChange={(e) => setForm({ ...form, body: e.target.value })} />
                </Field>
                <Field id="lp-cta" label="Button label">
                  <Input id="lp-cta" value={form.cta} maxLength={40} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
                </Field>
                <ImageUpload id="lp-cover-2" label="Cover image" value={form.cover} onChange={(v) => setForm({ ...form, cover: v })} />
              </>
            )}
            {tab === "sections" && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-sm font-extrabold">Page sections</p><p className="text-[13px] text-muted-foreground">{form.sections.length}/{LANDING_MAX_SECTIONS} · each can have its own image</p></div>
                </div>
                {form.sections.map((sec, i) => (
                  <div key={sec.id} className="rounded-[18px] border-[1.5px] border-line p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-ice text-xs font-extrabold text-cobalt">{i + 1}</span>
                      <p className="min-w-0 flex-1 truncate text-sm font-extrabold">{sec.title || "Untitled section"}</p>
                      <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice hover:text-cobalt disabled:opacity-30" aria-label={`Move section ${i + 1} up`}><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" disabled={i === form.sections.length - 1} onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice hover:text-cobalt disabled:opacity-30" aria-label={`Move section ${i + 1} down`}><ArrowDown className="h-4 w-4" /></button>
                      <button type="button" onClick={() => { const removed = { item: sec, index: i }; setForm((f) => ({ ...f, sections: f.sections.filter((x) => x.id !== sec.id) })); undoToast(`Section "${sec.title || i + 1}" removed`, () => setForm((f) => ({ ...f, sections: restoreAt(f.sections, removed, sameId) }))); }} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove section ${i + 1}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-3">
                      <Field id={`sec-title-${sec.id}`} label="Title"><Input id={`sec-title-${sec.id}`} value={sec.title} maxLength={80} onChange={(e) => setSection(sec.id, { title: e.target.value })} /></Field>
                      <Field id={`sec-text-${sec.id}`} label="Text"><Textarea id={`sec-text-${sec.id}`} rows={3} value={sec.text} placeholder={sectionPresets.find((p) => p.title === sec.title)?.text ?? "A few sentences for this section."} maxLength={800} onChange={(e) => setSection(sec.id, { text: e.target.value })} /></Field>
                      <ImageUpload id={`sec-img-${sec.id}`} label="Section image" value={sec.image} onChange={(v) => setSection(sec.id, { image: v })} aspect="aspect-[4/3]" maxSide={900} hint="Optional · JPG, PNG or WebP up to 5 MB" />
                    </div>
                  </div>
                ))}
                {form.sections.length < LANDING_MAX_SECTIONS ? (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Add a section</p>
                    <div className="flex gap-2">
                      <select aria-label="Choose a section to add" value={presetPick} onChange={(e) => setPresetPick(e.target.value)} className="h-11 min-w-0 flex-1 rounded-[14px] border-[1.5px] border-cobalt-100 bg-card px-3 text-sm font-bold text-ink focus:border-cobalt focus:outline-none">
                        <option value="">Choose a section…</option>
                        {sectionPresets.map((pr) => <option key={pr.title} value={pr.title}>{pr.title}</option>)}
                        <option value="__blank">Blank section (write your own)</option>
                      </select>
                      <Button type="button" disabled={!presetPick} onClick={() => { const t = presetPick === "__blank" ? "" : presetPick; setForm((f) => ({ ...f, sections: [...f.sections, { id: crypto.randomUUID(), title: t, text: "", image: "" }] })); setPresetPick(""); }}><Plus />Add</Button>
                    </div>
                    {presetPick && presetPick !== "__blank" && <p className="mt-2 text-xs text-muted-foreground">{sectionPresets.find((p) => p.title === presetPick)?.text}</p>}
                  </div>
                ) : <p className="text-xs font-semibold text-muted-foreground">You've reached {LANDING_MAX_SECTIONS} sections.</p>}
              </>
            )}
            {tab === "settings" && (
              <>
                <Field id="lp-title" label="Page title" hint="For you and browser tabs">
                  <Input id="lp-title" value={form.title} maxLength={100} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugTouched ? form.slug : slugify(e.target.value) })} />
                </Field>
                <Field id="lp-slug" label="Page address" hint={pageUrl(state.storefront.handle, form.slug || "page")}>
                  <Input id="lp-slug" value={form.slug} maxLength={60} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value.toLowerCase() }); }} />
                </Field>
                <Field id="lp-item" label="Linked product (optional)" hint={product ? "Visitors can buy this product" : "Visitors join your list"}>
                  <FilterSelect label="Product" value={form.itemId || "none"} onChange={(v) => setForm({ ...form, itemId: v === "none" ? "" : v })} className="w-full sm:w-full" options={[["none", "Collect leads only"], ...products.map((i) => [i.id, i.title] as [string, string])]} />
                </Field>
              </>
            )}
          </div>
        </section>

        <section className="min-w-0" aria-label="Live preview">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-extrabold"><Eye className="h-4 w-4 text-cobalt" />Live preview</p>
            <div className="inline-flex rounded-full border bg-card p-1" role="group" aria-label="Preview device">
              {([["desktop", Monitor, "Desktop"], ["mobile", Smartphone, "Mobile"]] as const).map(([d, I, l]) => (
                <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold transition-colors", device === d ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}><I className="h-3.5 w-3.5" />{l}</button>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] bg-soft p-3 ring-1 ring-line sm:p-5">
            <div className={cn("mx-auto overflow-hidden rounded-[18px] bg-card shadow-lift ring-1 ring-line transition-[max-width] duration-300", device === "mobile" ? "max-w-[380px]" : "max-w-none")}>
              <div className="flex items-center gap-2 border-b bg-soft/60 px-3 py-2">
                <span className="flex gap-1" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-line" /><span className="h-2 w-2 rounded-full bg-line" /><span className="h-2 w-2 rounded-full bg-line" /></span>
                <span className="min-w-0 flex-1 truncate rounded-full bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-line">{pageUrl(state.storefront.handle, form.slug || "page")}</span>
              </div>
              <LandingPreview page={form} product={product} store={state.storefront.name || "Your store"} device={device} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
