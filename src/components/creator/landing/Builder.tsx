import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Code2, Eye, LayoutTemplate, Monitor, Plus, Save, Send, Smartphone, Tablet, Trash2, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { Field } from "@/components/affiliate/Field";
import { FilterSelect } from "@/components/affiliate/ui";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { LANDING_MAX_QUESTIONS, slugify, validateLanding, type LandingColors, type LandingPage, type LandingQuestion, type LandingRow } from "@/lib/creator/rules";
import { BLOCK_LABELS, LANDING_TEMPLATE_INFO, PALETTES, VARIATIONS, allBlocksIn, blankLanding, contrastWarnings, enabledBlocks, isHex, pageUrl, templateName } from "@/lib/creator/landing";
import { CreatorNotFound, ItemStatus } from "../shared";
import { ImageUpload } from "../ImageUpload";
import { PagePreview, type Device } from "./PagePreview";

type LegacyPreview = (page: LandingPage, device: "desktop" | "mobile") => ReactNode;
const STEPS = ["Template", "Brand", "Sections", "Content", "Registration", "Review"] as const;
const LEGACY = new Set(["spotlight", "split", "minimal"]);
const uid = () => crypto.randomUUID();

/** Saves the page for real into the creator's saved data; reports failure instead of pretending. */
function useSave(found: LandingPage | undefined) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  return (form: LandingPage, status: LandingPage["status"], setError: (e: string) => void) => {
    const page: LandingPage = { ...form, status, id: found?.id ?? uid(), title: form.title.trim(), headline: form.headline.trim(), cta: form.cta.trim(), sections: form.sections.map((x) => ({ ...x, title: x.title.trim(), text: x.text.trim() })), date: new Date().toISOString() };
    const err = validateLanding(page, state.landingPages);
    if (err) { setError(err); return false; }
    try {
      update((s) => ({
        landingPages: found ? s.landingPages.map((p) => (p.id === page.id ? page : p)) : [...s.landingPages, page],
        activity: [...s.activity, activityEntry(`${found ? "Updated" : "Created"} landing page: ${page.title}`)],
      }));
    } catch {
      setError("Your browser is out of space, so the page wasn't saved. Remove or replace a large image and try again.");
      return false;
    }
    toast.success(status === "published" ? "Landing page published" : "Landing page saved as draft");
    navigate({ to: "/creator/landing-pages" });
    return true;
  };
}

export function LandingBuilder({ id, legacyPreview, classic }: { id?: string | undefined; legacyPreview: LegacyPreview; classic?: ((id: string | undefined) => ReactNode) | undefined }) {
  const { state } = useCreator();
  const found = state.landingPages.find((p) => p.id === id);
  const [mode, setMode] = useState<LandingPage["mode"] | "classic" | null>(found ? (found.mode === "template" && LEGACY.has(found.template) && classic ? "classic" : found.mode) : null);
  if (id && !found) return <CreatorNotFound what="landingPage" />;
  if (!mode) return <BuildChoice onPick={setMode} classic={Boolean(classic)} />;
  if (mode === "classic" && classic) return <>{classic(found?.id)}</>;
  return mode === "import" ? <ImportEditor found={found} /> : <TemplateBuilder found={found} legacyPreview={legacyPreview} />;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime-text"><span className="neon-dot" aria-hidden="true" />{children}</p>;
}

function BuildChoice({ onPick, classic }: { onPick: (m: LandingPage["mode"] | "classic") => void; classic: boolean }) {
  return (
    <div>
      <Eyebrow>Landing page builder</Eyebrow>
      <h1 className="text-2xl sm:text-[28px]">How do you want to build it?</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every option gives you a page you can save as a draft and publish.</p>
      {classic && (
        <button type="button" onClick={() => onPick("classic")} className="surface mt-6 flex w-full flex-col overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:border-cobalt hover:shadow-lift focus-visible:ring-2 focus-visible:ring-cobalt sm:flex-row">
          <div data-surface="dark" className="bg-brand-panel grid shrink-0 grid-cols-3 gap-2 p-4 sm:w-72">
            {["Spotlight", "Split", "Minimal"].map((n, i) => (
              <div key={n} className="flex aspect-[3/4] flex-col gap-1 rounded-[10px] bg-card p-1.5">
                {i === 0 && <><span className="h-1/2 rounded-md bg-cobalt" /><span className="mx-auto h-1.5 w-2/3 rounded-full bg-lime" /></>}
                {i === 1 && <div className="grid h-full grid-cols-2 gap-1"><div className="flex flex-col justify-center gap-1"><span className="h-1 rounded-full bg-midnight/70" /><span className="h-1 w-2/3 rounded-full bg-line" /><span className="h-1.5 w-full rounded-full bg-cobalt" /></div><span className="rounded-md bg-cobalt" /></div>}
                {i === 2 && <><span className="h-1 w-1/3 rounded-full bg-lime" /><span className="h-1.5 rounded-full bg-midnight/70" /><span className="h-1 rounded-full bg-line" /><span className="mt-auto h-1.5 w-1/2 rounded-full bg-cobalt" /></>}
              </div>
            ))}
          </div>
          <div className="p-5"><p className="flex items-center gap-2 text-lg font-extrabold"><Sparkles className="h-5 w-5 text-cobalt" />Enski special</p><p className="mt-1 text-sm text-muted-foreground">The original Enski builder: pick Spotlight, Split or Minimal, then edit design, content, sections and settings in four simple tabs.</p></div>
        </button>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <button type="button" onClick={() => onPick("template")} className="surface group overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:border-cobalt hover:shadow-lift focus-visible:ring-2 focus-visible:ring-cobalt">
          <div className="grid grid-cols-4 gap-2 bg-soft p-4">
            {LANDING_TEMPLATE_INFO.filter((t) => !t.legacy).map((t) => (
              <div key={t.id} className="pointer-events-none aspect-[3/4] overflow-hidden rounded-[10px] ring-1 ring-line"><div className="origin-top-left scale-[0.18] w-[555%]"><PagePreview page={{ ...blankLanding(), template: t.id, headline: t.name }} device="desktop" store="Enski" /></div></div>
            ))}
          </div>
          <div className="p-5"><p className="flex items-center gap-2 text-lg font-extrabold"><LayoutTemplate className="h-5 w-5 text-cobalt" />Build from a template</p><p className="mt-1 text-sm text-muted-foreground">Pick one of eight designs and customise it in six guided steps: template, brand, sections, content, registration and review.</p></div>
        </button>
        <button type="button" onClick={() => onPick("import")} className="surface group overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:border-cobalt hover:shadow-lift focus-visible:ring-2 focus-visible:ring-cobalt">
          <div data-surface="dark" className="bg-brand-panel grid h-[214px] place-items-center p-4 text-on-dark">
            <div className="w-full max-w-xs rounded-[14px] bg-midnight/60 p-4 font-mono text-[11px] leading-5 text-on-dark-muted ring-1 ring-on-dark/20"><span className="text-lime">&lt;section&gt;</span><br />&nbsp;&nbsp;&lt;h1&gt;Your AI design&lt;/h1&gt;<br />&nbsp;&nbsp;&lt;button&gt;Join&lt;/button&gt;<br /><span className="text-lime">&lt;/section&gt;</span></div>
          </div>
          <div className="p-5"><p className="flex items-center gap-2 text-lg font-extrabold"><Sparkles className="h-5 w-5 text-cobalt" />Import an AI-designed page</p><p className="mt-1 text-sm text-muted-foreground">Paste a page made with an AI tool and publish it exactly as designed. It doesn't go through the template steps.</p></div>
        </button>
      </div>
    </div>
  );
}

function DeviceSwitch({ device, setDevice }: { device: Device; setDevice: (d: Device) => void }) {
  return (
    <div className="inline-flex rounded-full border bg-card p-1" role="group" aria-label="Preview device">
      {([["desktop", Monitor, "Desktop"], ["tablet", Tablet, "Tablet"], ["mobile", Smartphone, "Mobile"]] as const).map(([d, I, l]) => (
        <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold transition-colors", device === d ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}><I className="h-3.5 w-3.5" /><span className="hidden sm:inline">{l}</span></button>
      ))}
    </div>
  );
}
const deviceWidth: Record<Device, string> = { desktop: "max-w-none", tablet: "max-w-[768px]", mobile: "max-w-[380px]" };
function BrowserFrame({ url, device, children }: { url: string; device: Device; children: ReactNode }) {
  return (
    <div className="rounded-[24px] bg-soft p-3 ring-1 ring-line sm:p-5">
      <div className={cn("mx-auto overflow-hidden rounded-[18px] bg-card shadow-lift ring-1 ring-line transition-[max-width] duration-300", deviceWidth[device])}>
        <div className="flex items-center gap-2 border-b bg-soft/60 px-3 py-2">
          <span className="flex gap-1" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-line" /><span className="h-2 w-2 rounded-full bg-line" /><span className="h-2 w-2 rounded-full bg-line" /></span>
          <span className="min-w-0 flex-1 truncate rounded-full bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-line">{url}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function ImportEditor({ found }: { found: LandingPage | undefined }) {
  const { state } = useCreator();
  const save = useSave(found);
  const [form, setForm] = useState<LandingPage>(found ?? blankLanding("import"));
  const [slugTouched, setSlugTouched] = useState(Boolean(found));
  const [error, setError] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const url = pageUrl(state.storefront.handle, form.slug || "page");
  const onFile = (file?: File) => { if (file) void file.text().then((t) => setForm((f) => ({ ...f, importHtml: t.slice(0, 300_000) }))).catch(() => setError("We couldn't read that file. Try pasting the code instead.")); };
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1"><Eyebrow>Imported AI design</Eyebrow><h1 className="truncate text-2xl sm:text-[28px]">{form.title || "New imported page"}</h1></div>
        <div className="flex flex-wrap items-center gap-2"><ItemStatus status={form.status} /><Button variant="outline" onClick={() => save(form, "draft", setError)}><Save />Save draft</Button><Button onClick={() => save(form, "published", setError)}><Send />{form.status === "published" ? "Update page" : "Publish"}</Button></div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-[14px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</p>}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <section className="surface space-y-4 p-5">
          <Field id="ai-title" label="Page title"><Input id="ai-title" value={form.title} maxLength={100} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugTouched ? form.slug : slugify(e.target.value) })} /></Field>
          <Field id="ai-slug" label="Page address" hint={url}><Input id="ai-slug" value={form.slug} maxLength={60} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value.toLowerCase() }); }} /></Field>
          <Field id="ai-html" label="Page code (HTML)" hint="Paste the full page your AI tool gave you, or upload the .html file. Scripts don't run in the preview.">
            <Textarea id="ai-html" rows={12} className="font-mono text-xs" value={form.importHtml} placeholder="<!doctype html>…" onChange={(e) => setForm({ ...form, importHtml: e.target.value.slice(0, 300_000) })} />
          </Field>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-cobalt"><Code2 className="h-4 w-4" />Upload .html file<input type="file" accept=".html,.htm,text/html" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} /></label>
          <Field id="ai-meta-t" label="Meta title"><Input id="ai-meta-t" value={form.metaTitle} maxLength={70} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></Field>
          <Field id="ai-meta-d" label="Meta description"><Textarea id="ai-meta-d" rows={2} value={form.metaDescription} maxLength={160} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} /></Field>
        </section>
        <section className="min-w-0" aria-label="Live preview">
          <div className="mb-3 flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-extrabold"><Eye className="h-4 w-4 text-cobalt" />Preview</p><DeviceSwitch device={device} setDevice={setDevice} /></div>
          <BrowserFrame url={url} device={device}>
            {form.importHtml.trim() ? <iframe title="Imported page preview" sandbox="" srcDoc={form.importHtml} className="h-[720px] w-full bg-card" /> : <div className="grid h-[420px] place-items-center p-8 text-center text-sm text-muted-foreground">Paste your page code to see it here.</div>}
          </BrowserFrame>
        </section>
      </div>
    </div>
  );
}

function TemplateBuilder({ found, legacyPreview }: { found: LandingPage | undefined; legacyPreview: LegacyPreview }) {
  const { state } = useCreator();
  const save = useSave(found);
  const [form, setFormRaw] = useState<LandingPage>(() => { const f = found ?? blankLanding(); return { ...f, blocks: allBlocksIn(f) }; });
  const setForm = (p: Partial<LandingPage> | ((f: LandingPage) => LandingPage)) => setFormRaw((f) => (typeof p === "function" ? p(f) : { ...f, ...p }));
  const [step, setStep] = useState(found ? 3 : 0);
  const [slugTouched, setSlugTouched] = useState(Boolean(found));
  const [error, setError] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [full, setFull] = useState(false);
  useEffect(() => { window.scrollTo?.({ top: 0 }); }, [step]);
  const products = state.items.filter((i) => i.status !== "archived");
  const published = state.items.filter((i) => i.status === "published");
  const product = products.find((i) => i.id === form.itemId);
  const store = state.storefront.name || "Your store";
  const url = pageUrl(state.storefront.handle, form.slug || "page");
  const preview = (d: Device) => LEGACY.has(form.template) ? legacyPreview(form, d === "mobile" ? "mobile" : "desktop") : <PagePreview page={form} device={d} product={product} store={store} interactive />;
  const doSave = (status: LandingPage["status"]) => { if (!save(form, status, setError)) setStep(5); };
  const steps: ReactNode[] = [
    <StepTemplate key="t" form={form} setForm={setForm} />,
    <StepBrand key="b" form={form} setForm={setForm} />,
    <StepSections key="s" form={form} setForm={setForm} />,
    <StepContent key="c" form={form} setForm={setForm} />,
    <StepForm key="f" form={form} setForm={setForm} products={published} />,
    <StepReview key="r" form={form} setForm={setForm} url={url} products={products} slugTouched={slugTouched} setSlugTouched={setSlugTouched} error={error} />,
  ];
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1"><Eyebrow>Landing page builder</Eyebrow><h1 className="truncate text-2xl sm:text-[28px]">{form.title || (found ? found.title : "New landing page")}</h1></div>
        <div className="flex flex-wrap items-center gap-2">
          <ItemStatus status={form.status} />
          <Button variant="outline" onClick={() => setFull(true)}><Eye />Preview</Button>
          <Button variant="outline" onClick={() => doSave("draft")}><Save />Save draft</Button>
          <Button onClick={() => doSave("published")}><Send />{form.status === "published" ? "Update page" : "Publish"}</Button>
        </div>
      </div>
      <ol className="mb-5 grid grid-cols-6 gap-1.5" aria-label="Builder steps">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => setStep(i)} aria-current={step === i ? "step" : undefined} className={cn("flex w-full flex-col items-center gap-1.5 rounded-[14px] px-1 py-2 text-[11px] font-extrabold transition-colors sm:flex-row sm:px-3 sm:text-xs", step === i ? "bg-cobalt text-primary-foreground" : i < step ? "bg-ice text-cobalt" : "bg-card text-muted-foreground ring-1 ring-line hover:text-cobalt")}>
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px]", step === i ? "bg-lime text-midnight" : i < step ? "bg-cobalt text-primary-foreground" : "bg-soft")}>{i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
              <span className="truncate">{s}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="surface overflow-hidden lg:sticky lg:top-24">
          <div className="space-y-5 overflow-x-hidden p-5 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto">
            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-text">Step {step + 1} of 6</p><h2 className="text-lg">{["Choose a template", "Brand", "Toggle sections", "Section content", "Registration form", "Review and publish"][step]}</h2></div>
            {steps[step]}
          </div>
          <div className="flex items-center justify-between gap-2 border-t p-3">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft />Back</Button>
            {step < 5 ? <Button onClick={() => setStep(step + 1)}>Next<ArrowRight /></Button> : <Button onClick={() => doSave("published")}><Send />Publish</Button>}
          </div>
        </section>
        <section className="min-w-0" aria-label="Live preview">
          <div className="mb-3 flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-extrabold"><Eye className="h-4 w-4 text-cobalt" />Live preview</p><DeviceSwitch device={device} setDevice={setDevice} /></div>
          <BrowserFrame url={url} device={device}>{preview(device)}</BrowserFrame>
        </section>
      </div>
      <Dialog open={full} onOpenChange={setFull}>
        <DialogContent className="max-h-[92vh] max-w-[min(1200px,96vw)] overflow-y-auto">
          <DialogHeader><DialogTitle>Page preview</DialogTitle><DialogDescription>This is how visitors will see the page. Unsaved changes are included.</DialogDescription></DialogHeader>
          <div className="flex justify-end"><DeviceSwitch device={device} setDevice={setDevice} /></div>
          <BrowserFrame url={url} device={device}>{preview(device)}</BrowserFrame>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type StepProps = { form: LandingPage; setForm: (p: Partial<LandingPage> | ((f: LandingPage) => LandingPage)) => void };

function StepTemplate({ form, setForm }: StepProps) {
  const [peek, setPeek] = useState<Device>("desktop");
  return (
    <>
      <div className="flex items-center justify-between gap-2"><p className="text-[13px] text-muted-foreground">Switch any time; your content stays.</p>
        <div className="inline-flex rounded-full border p-0.5" role="group" aria-label="Thumbnail device">{(["desktop", "mobile"] as const).map((d) => <button key={d} type="button" aria-pressed={peek === d} onClick={() => setPeek(d)} className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold", peek === d ? "bg-ice text-cobalt" : "text-muted-foreground")}>{d === "desktop" ? "Desktop" : "Mobile"}</button>)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Template">
        {LANDING_TEMPLATE_INFO.map((t) => {
          const on = form.template === t.id;
          return (
            <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setForm({ template: t.id })} className={cn("relative rounded-[16px] border-[1.5px] p-2 text-left transition-all", on ? "border-cobalt bg-ice/60 ring-1 ring-cobalt" : "border-line hover:border-cobalt-100")}>
              <div className={cn("pointer-events-none mx-auto overflow-hidden rounded-[10px] bg-card ring-1 ring-line", peek === "mobile" ? "aspect-[9/14] w-2/3" : "aspect-[4/3] w-full")}>
                {t.legacy ? <div className="grid h-full place-items-center bg-soft text-[11px] font-bold text-muted-foreground">Classic layout</div> : (
                  <div className={cn("origin-top-left", peek === "mobile" ? "w-[380px] scale-[0.24]" : "w-[900px] scale-[0.19]")}><PagePreview page={{ ...form, template: t.id, headline: form.headline || t.name }} device={peek} store="Enski" /></div>
                )}
              </div>
              <span className="mt-2 block text-[13px] font-extrabold">{t.name}{t.legacy && <span className="ml-1 text-[11px] font-bold text-muted-foreground">· classic</span>}</span>
              <span className="block text-[11px] leading-4 text-muted-foreground">{t.text}</span>
              {on && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-cobalt text-primary-foreground"><Check className="h-3.5 w-3.5" /></span>}
            </button>
          );
        })}
      </div>
      {!LEGACY.has(form.template) && (
        <div><p className="mb-2 text-sm font-extrabold">Variation</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Variation">{VARIATIONS.map((v) => <button key={v.id} type="button" role="radio" aria-checked={form.variation === v.id} onClick={() => setForm({ variation: v.id })} className={cn("rounded-[12px] border-[1.5px] px-2 py-2 text-center", form.variation === v.id ? "border-cobalt bg-ice text-cobalt" : "border-line")}><span className="block text-sm font-extrabold">{v.name}</span><span className="block text-[11px] text-muted-foreground">{v.text}</span></button>)}</div>
        </div>
      )}
    </>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const id = `col-${label.replace(/\W/g, "")}`;
  return (
    <div className="flex items-center gap-2">
      <input type="color" aria-label={`${label} picker`} value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-10 w-10 shrink-0 cursor-pointer rounded-[10px] border-[1.5px] border-line bg-card p-0.5" />
      <label htmlFor={id} className="min-w-0 flex-1 text-[13px] font-bold">{label}</label>
      <Input id={id} value={text} maxLength={7} className={cn("h-9 w-24 font-mono text-xs uppercase", !isHex(text) && "border-destructive")} onChange={(e) => { const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`; setText(v); if (isHex(v)) onChange(v.toUpperCase()); }} />
    </div>
  );
}

function StepBrand({ form, setForm }: StepProps) {
  const set = (k: keyof LandingColors, v: string) => setForm((f) => ({ ...f, palette: "custom", colors: { ...f.colors, [k]: v } }));
  const warn = contrastWarnings(form.colors);
  const labels: [keyof LandingColors, string][] = [["primary", "Primary"], ["secondary", "Secondary"], ["accent", "Accent"], ["background", "Background"], ["heading", "Heading text"], ["body", "Body text"], ["buttonBg", "Button background"], ["buttonText", "Button text"]];
  return (
    <>
      <ImageUpload id="lp-logo" label="Logo" value={form.logo} onChange={(v) => setForm({ logo: v })} aspect="aspect-[3/1]" maxSide={600} hint="Optional · shown at the top of the page" />
      <div>
        <p className="mb-2 text-sm font-extrabold">Colour theme</p>
        <p className="mb-3 text-[13px] text-muted-foreground">Only this page uses these colours.</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Colour theme">
          {PALETTES.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={form.palette === p.id} onClick={() => setForm({ palette: p.id, colors: { ...p.colors } })} className={cn("rounded-[14px] border-[1.5px] p-2.5 text-left", form.palette === p.id ? "border-cobalt bg-ice/60 ring-1 ring-cobalt" : "border-line hover:border-cobalt-100")}>
              <span className="flex overflow-hidden rounded-[8px] ring-1 ring-line">{[p.colors.primary, p.colors.secondary, p.colors.accent, p.colors.background].map((c, i) => <span key={i} className="h-6 flex-1" style={{ background: c }} />)}</span>
              <span className="mt-1.5 block text-xs font-extrabold">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2.5 rounded-[16px] border-[1.5px] border-line p-3.5">
        <p className="text-sm font-extrabold">Custom colours{form.palette === "custom" && <span className="ml-2 rounded-full bg-ice px-2 py-0.5 text-[11px] text-cobalt">Custom</span>}</p>
        {labels.map(([k, l]) => <ColorRow key={k} label={l} value={form.colors[k]} onChange={(v) => set(k, v)} />)}
      </div>
      {warn.length > 0 ? <div role="status" className="space-y-1 rounded-[14px] bg-warning-soft p-3 text-[13px] font-semibold text-warning-foreground">{warn.map((w) => <p key={w} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{w}</p>)}</div> : <p className="flex items-center gap-2 text-[13px] font-semibold text-success"><Check className="h-4 w-4" />Text and buttons are easy to read.</p>}
      <div className="rounded-[14px] p-4" style={{ background: form.colors.background }}>
        <p className="text-lg font-extrabold" style={{ color: form.colors.heading }}>Plus Jakarta Sans heading</p>
        <p className="text-sm" style={{ color: form.colors.body }}>Body text looks like this on your page.</p>
        <span className="mt-2 inline-flex h-9 items-center rounded-full px-4 text-xs font-extrabold" style={{ background: form.colors.buttonBg, color: form.colors.buttonText }}>{form.cta || "Register now"}</span>
      </div>
    </>
  );
}

function StepSections({ form, setForm }: StepProps) {
  const move = (i: number, d: -1 | 1) => setForm((f) => { const b = [...f.blocks]; const [x] = b.splice(i, 1); if (x) b.splice(i + d, 0, x); return { ...f, blocks: b }; });
  const count = enabledBlocks(form).length + 1;
  return (
    <>
      <p className="text-[13px] font-semibold text-muted-foreground">{count} section{count === 1 ? "" : "s"} on · the hero is always shown first</p>
      <div className="flex items-center gap-3 rounded-[14px] bg-ice/60 px-3.5 py-3"><Check className="h-4 w-4 text-cobalt" /><span className="flex-1 text-sm font-extrabold">Hero section</span><span className="text-[11px] font-bold text-muted-foreground">Always on</span></div>
      <ul className="space-y-2">
        {form.blocks.map((b, i) => (
          <li key={b.id} className={cn("flex items-center gap-2 rounded-[14px] border-[1.5px] px-3 py-2", b.on ? "border-cobalt-100" : "border-line")}>
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
              <span className="relative inline-flex"><input type="checkbox" className="peer sr-only" checked={b.on} onChange={(e) => setForm((f) => ({ ...f, blocks: f.blocks.map((x) => (x.id === b.id ? { ...x, on: e.target.checked } : x)) }))} /><span className="h-6 w-10 rounded-full bg-line transition-colors peer-checked:bg-cobalt peer-focus-visible:ring-2 peer-focus-visible:ring-cobalt" /><span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform peer-checked:translate-x-4" /></span>
              <span className="truncate text-sm font-bold">{BLOCK_LABELS[b.id]}</span>
            </label>
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice hover:text-cobalt disabled:opacity-30" aria-label={`Move ${BLOCK_LABELS[b.id]} up`}><ArrowUp className="h-4 w-4" /></button>
            <button type="button" disabled={i === form.blocks.length - 1} onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice hover:text-cobalt disabled:opacity-30" aria-label={`Move ${BLOCK_LABELS[b.id]} down`}><ArrowDown className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </>
  );
}

type RowSpec = { title: string; subtitle?: string; text?: string; image?: string; long?: boolean };
function RowsEditor({ name, rows, spec, onChange, max = 12 }: { name: string; rows: LandingRow[]; spec: RowSpec; onChange: (r: LandingRow[]) => void; max?: number }) {
  const set = (id: string, p: Partial<LandingRow>) => onChange(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const move = (i: number, d: -1 | 1) => { const n = [...rows]; const [x] = n.splice(i, 1); if (x) n.splice(i + d, 0, x); onChange(n); };
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.id} className="rounded-[14px] border-[1.5px] border-line p-3">
          <div className="mb-2 flex items-center gap-1"><span className="flex-1 truncate text-[13px] font-extrabold">{r.title || `${name} ${i + 1}`}</span>
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice disabled:opacity-30" aria-label={`Move ${name} ${i + 1} up`}><ArrowUp className="h-4 w-4" /></button>
            <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice disabled:opacity-30" aria-label={`Move ${name} ${i + 1} down`}><ArrowDown className="h-4 w-4" /></button>
            <button type="button" onClick={() => onChange(rows.filter((x) => x.id !== r.id))} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${name} ${i + 1}`}><Trash2 className="h-4 w-4" /></button>
          </div>
          <div className="space-y-2">
            <Field id={`${r.id}-t`} label={spec.title}><Input id={`${r.id}-t`} value={r.title} maxLength={100} onChange={(e) => set(r.id, { title: e.target.value })} /></Field>
            {spec.subtitle && <Field id={`${r.id}-s`} label={spec.subtitle}><Input id={`${r.id}-s`} value={r.subtitle} maxLength={100} onChange={(e) => set(r.id, { subtitle: e.target.value })} /></Field>}
            {spec.text && <Field id={`${r.id}-x`} label={spec.text}><Textarea id={`${r.id}-x`} rows={spec.long ? 3 : 2} value={r.text} maxLength={600} onChange={(e) => set(r.id, { text: e.target.value })} /></Field>}
            {spec.image && <ImageUpload id={`${r.id}-i`} label={spec.image} value={r.image} onChange={(v) => set(r.id, { image: v })} aspect="aspect-[4/3]" maxSide={500} hint="Optional" />}
          </div>
        </div>
      ))}
      {rows.length < max && <button type="button" onClick={() => onChange([...rows, { id: uid(), title: "", subtitle: "", text: "", image: "" }])} className="flex w-full items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-cobalt-100 px-3.5 py-2.5 text-sm font-extrabold text-cobalt hover:border-cobalt hover:bg-ice/50"><Plus className="h-4 w-4" />Add {name.toLowerCase()}</button>}
    </div>
  );
}

function Group({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return <details open={open} className="group rounded-[16px] border-[1.5px] border-line"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-extrabold marker:hidden group-open:border-b">{title}</summary><div className="space-y-3 p-4">{children}</div></details>;
}

function StepContent({ form, setForm }: StepProps) {
  const h = form.hero, k = form.content;
  const setHero = (p: Partial<LandingPage["hero"]>) => setForm((f) => ({ ...f, hero: { ...f.hero, ...p } }));
  const setK = <K extends keyof LandingPage["content"]>(key: K, v: LandingPage["content"][K]) => setForm((f) => ({ ...f, content: { ...f.content, [key]: v } }));
  const on = new Set(enabledBlocks(form).map((b) => b.id));
  return (
    <>
      <Group title="Hero section" open>
        <Field id="h-brand" label="Event name / brand"><Input id="h-brand" value={h.brand} maxLength={80} onChange={(e) => setHero({ brand: e.target.value })} /></Field>
        <Field id="h-date" label="Location and date line"><Input id="h-date" value={h.dateLine} maxLength={100} placeholder="e.g. Lagos · 12 December 2026" onChange={(e) => setHero({ dateLine: e.target.value })} /></Field>
        <Field id="h-l1" label="Headline line 1" hint={`${form.headline.length}/140`}><Input id="h-l1" value={form.headline} maxLength={140} onChange={(e) => setForm({ headline: e.target.value })} /></Field>
        <Field id="h-l2" label="Headline line 2 (italic accent)"><Input id="h-l2" value={h.line2} maxLength={80} onChange={(e) => setHero({ line2: e.target.value })} /></Field>
        <Field id="h-l3" label="Headline line 3"><Input id="h-l3" value={h.line3} maxLength={80} onChange={(e) => setHero({ line3: e.target.value })} /></Field>
        <Field id="h-sub" label="Subheadline"><Textarea id="h-sub" rows={3} value={form.body} maxLength={2000} onChange={(e) => setForm({ body: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field id="h-c1" label="Primary CTA label"><Input id="h-c1" value={form.cta} maxLength={40} onChange={(e) => setForm({ cta: e.target.value })} /></Field>
          <Field id="h-c2" label="Secondary CTA label"><Input id="h-c2" value={h.cta2} maxLength={40} onChange={(e) => setHero({ cta2: e.target.value })} /></Field>
        </div>
        <ImageUpload id="h-bg" label="Hero background image" value={form.cover} onChange={(v) => setForm({ cover: v })} hint="Used by the T2 and T3 variations" />
        <Field id="h-url" label="Or image URL" hint="Used when no image is uploaded"><Input id="h-url" type="url" value={h.imageUrl} placeholder="https://…" onChange={(e) => setHero({ imageUrl: e.target.value })} /></Field>
      </Group>
      {on.has("stats") && <Group title="Key statistics"><RowsEditor name="Statistic" rows={k.stats} spec={{ title: "Number", subtitle: "Label", text: "Description" }} onChange={(r) => setK("stats", r)} max={6} /></Group>}
      {on.has("about") && <Group title="About the event">
        <Field id="ab-h" label="Heading"><Input id="ab-h" value={k.about.heading} maxLength={100} onChange={(e) => setK("about", { ...k.about, heading: e.target.value })} /></Field>
        <Field id="ab-t" label="Description"><Textarea id="ab-t" rows={4} value={k.about.text} maxLength={2000} onChange={(e) => setK("about", { ...k.about, text: e.target.value })} /></Field>
        <ImageUpload id="ab-i" label="Image" value={k.about.image} onChange={(v) => setK("about", { ...k.about, image: v })} aspect="aspect-[4/3]" maxSide={900} hint="Optional" />
      </Group>}
      {on.has("speakers") && <Group title="Speakers"><RowsEditor name="Speaker" rows={k.speakers} spec={{ title: "Name", subtitle: "Role", text: "Biography", image: "Photo", long: true }} onChange={(r) => setK("speakers", r)} /></Group>}
      {on.has("features") && <Group title="Features / experience"><RowsEditor name="Feature" rows={k.features} spec={{ title: "Title", text: "Description", image: "Image or icon" }} onChange={(r) => setK("features", r)} /></Group>}
      {on.has("countdown") && <Group title="Countdown timer">
        <div className="grid grid-cols-2 gap-2">
          <Field id="cd-d" label="Date"><Input id="cd-d" type="date" value={k.countdown.date} onChange={(e) => setK("countdown", { ...k.countdown, date: e.target.value })} /></Field>
          <Field id="cd-t" label="Time"><Input id="cd-t" type="time" value={k.countdown.time} onChange={(e) => setK("countdown", { ...k.countdown, time: e.target.value })} /></Field>
        </div>
        <Field id="cd-z" label="Time zone"><FilterSelect label="Time zone" value={k.countdown.zone} className="w-full sm:w-full" onChange={(v) => setK("countdown", { ...k.countdown, zone: v })} options={[["Africa/Lagos", "West Africa (WAT)"], ["Africa/Accra", "Ghana (GMT)"], ["Africa/Nairobi", "East Africa (EAT)"], ["Africa/Johannesburg", "South Africa (SAST)"], ["Europe/London", "London"], ["America/New_York", "New York"]]} /></Field>
      </Group>}
      {on.has("programme") && <Group title="Programme / schedule"><RowsEditor name="Session" rows={k.programme} spec={{ title: "Session title", subtitle: "Time", text: "Description" }} onChange={(r) => setK("programme", r)} max={20} /></Group>}
      {on.has("testimonials") && <Group title="Testimonials"><RowsEditor name="Testimonial" rows={k.testimonials} spec={{ title: "Name", subtitle: "Role", text: "Quote", image: "Photo", long: true }} onChange={(r) => setK("testimonials", r)} /></Group>}
      {on.has("cta") && <Group title="Bottom CTA banner">
        <Field id="cta-h" label="Headline"><Input id="cta-h" value={k.cta.heading} maxLength={100} onChange={(e) => setK("cta", { ...k.cta, heading: e.target.value })} /></Field>
        <Field id="cta-t" label="Description"><Textarea id="cta-t" rows={2} value={k.cta.text} maxLength={400} onChange={(e) => setK("cta", { ...k.cta, text: e.target.value })} /></Field>
        <Field id="cta-b" label="Button label"><Input id="cta-b" value={k.cta.button} maxLength={40} onChange={(e) => setK("cta", { ...k.cta, button: e.target.value })} /></Field>
      </Group>}
      {on.size === 0 && <p className="text-[13px] text-muted-foreground">Turn on more sections in step 3 to add their content here.</p>}
    </>
  );
}

const Q_TYPES: [LandingQuestion["type"], string][] = [["short", "Short text"], ["long", "Long text"], ["dropdown", "Dropdown"], ["single", "Single choice"], ["multiple", "Multiple choice"]];
function StepForm({ form, setForm, products }: StepProps & { products: { id: string; title: string }[] }) {
  const f = form.form;
  const setF = (p: Partial<LandingPage["form"]>) => setForm((x) => ({ ...x, form: { ...x.form, ...p } }));
  const setQ = (id: string, p: Partial<LandingQuestion>) => setF({ questions: f.questions.map((q) => (q.id === id ? { ...q, ...p } : q)) });
  const move = (i: number, d: -1 | 1) => { const n = [...f.questions]; const [x] = n.splice(i, 1); if (x) n.splice(i + d, 0, x); setF({ questions: n }); };
  const Toggle = ({ label, checked, onChange, locked }: { label: string; checked: boolean; onChange?: (v: boolean) => void; locked?: string }) => (
    <label className="flex items-center gap-3 rounded-[12px] border-[1.5px] border-line px-3 py-2.5 text-sm font-bold">
      <input type="checkbox" checked={checked} disabled={Boolean(locked)} onChange={(e) => onChange?.(e.target.checked)} className="h-4 w-4 accent-[var(--cobalt)]" />
      <span className="flex-1">{label}</span>{locked && <span className="text-[11px] text-muted-foreground">{locked}</span>}
    </label>
  );
  return (
    <>
      <div className="space-y-2">
        <Toggle label="Full name" checked locked="Required" />
        <Toggle label="Email address" checked locked="Required" />
        <Toggle label="Phone number (optional)" checked={f.phone} onChange={(v) => setF({ phone: v })} />
        <Toggle label="WhatsApp number (optional)" checked={f.whatsapp} onChange={(v) => setF({ whatsapp: v })} />
      </div>
      <div>
        <p className="mb-2 text-sm font-extrabold">Custom questions <span className="text-muted-foreground">({f.questions.length}/{LANDING_MAX_QUESTIONS})</span></p>
        <div className="space-y-3">
          {f.questions.map((q, i) => (
            <div key={q.id} className="space-y-2 rounded-[14px] border-[1.5px] border-line p-3">
              <div className="flex items-center gap-1"><span className="flex-1 text-[13px] font-extrabold">Question {i + 1}</span>
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice disabled:opacity-30" aria-label={`Move question ${i + 1} up`}><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={i === f.questions.length - 1} onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice disabled:opacity-30" aria-label={`Move question ${i + 1} down`}><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => setF({ questions: f.questions.filter((x) => x.id !== q.id) })} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete question ${i + 1}`}><Trash2 className="h-4 w-4" /></button>
              </div>
              <Field id={`q-${q.id}`} label="Question"><Input id={`q-${q.id}`} value={q.label} maxLength={150} onChange={(e) => setQ(q.id, { label: e.target.value })} /></Field>
              <div className="flex items-center gap-2"><FilterSelect label="Answer type" value={q.type} onChange={(v) => setQ(q.id, { type: v as LandingQuestion["type"] })} options={Q_TYPES} className="flex-1 sm:w-full" />
                <label className="flex items-center gap-2 text-[13px] font-bold"><input type="checkbox" checked={q.required} onChange={(e) => setQ(q.id, { required: e.target.checked })} className="h-4 w-4" />Required</label></div>
              {["dropdown", "single", "multiple"].includes(q.type) && <Field id={`qo-${q.id}`} label="Options" hint="One per line"><Textarea id={`qo-${q.id}`} rows={3} value={q.options.join("\n")} onChange={(e) => setQ(q.id, { options: e.target.value.split("\n") })} /></Field>}
            </div>
          ))}
          {f.questions.length < LANDING_MAX_QUESTIONS ? <button type="button" onClick={() => setF({ questions: [...f.questions, { id: uid(), label: "", type: "short", options: [], required: false }] })} className="flex w-full items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-cobalt-100 px-3.5 py-2.5 text-sm font-extrabold text-cobalt hover:border-cobalt hover:bg-ice/50"><Plus className="h-4 w-4" />Add question</button> : <p className="text-xs font-semibold text-muted-foreground">You've reached {LANDING_MAX_QUESTIONS} questions.</p>}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-extrabold">After someone registers</p>
        {([["thanks", "Stay on the page and show a thank-you message"], ["product", "Send them to one of your published products"], ["url", "Send them to a web address"]] as const).map(([v, l]) => (
          <label key={v} className={cn("flex items-center gap-3 rounded-[12px] border-[1.5px] px-3 py-2.5 text-sm font-bold", f.after === v ? "border-cobalt bg-ice/60" : "border-line")}><input type="radio" name="lp-after" checked={f.after === v} onChange={() => setF({ after: v })} className="h-4 w-4" />{l}</label>
        ))}
        {f.after === "thanks" && <Field id="lp-thanks" label="Thank-you message"><Textarea id="lp-thanks" rows={2} value={f.thanks} maxLength={300} onChange={(e) => setF({ thanks: e.target.value })} /></Field>}
        {f.after === "product" && (products.length ? <FilterSelect label="Product" value={f.redirectItemId || "none"} className="w-full sm:w-full" onChange={(v) => setF({ redirectItemId: v === "none" ? "" : v })} options={[["none", "Choose a product"], ...products.map((p) => [p.id, p.title] as [string, string])]} /> : <p className="text-[13px] text-muted-foreground">You have no published products yet.</p>)}
        {f.after === "url" && <Field id="lp-url" label="Web address"><Input id="lp-url" type="url" value={f.redirectUrl} placeholder="https://…" onChange={(e) => setF({ redirectUrl: e.target.value })} /></Field>}
      </div>
    </>
  );
}

function StepReview({ form, setForm, url, products, slugTouched, setSlugTouched, error }: StepProps & { url: string; products: { id: string; title: string }[]; slugTouched: boolean; setSlugTouched: (v: boolean) => void; error: string }) {
  const { state } = useCreator();
  const problem = validateLanding({ ...form, id: form.id || "__new" }, state.landingPages);
  const palette = PALETTES.find((p) => p.id === form.palette)?.name ?? "Custom";
  return (
    <>
      <Field id="lp-title" label="Page title" hint="For you and browser tabs"><Input id="lp-title" value={form.title} maxLength={100} onChange={(e) => setForm({ title: e.target.value, slug: slugTouched ? form.slug : slugify(e.target.value) })} /></Field>
      <Field id="lp-slug" label="Public URL slug"><Input id="lp-slug" value={form.slug} maxLength={60} onChange={(e) => { setSlugTouched(true); setForm({ slug: e.target.value.toLowerCase() }); }} /></Field>
      <Field id="lp-item" label="Linked product (optional)" hint="With a product, visitors can buy it instead of registering"><FilterSelect label="Product" value={form.itemId || "none"} onChange={(v) => setForm({ itemId: v === "none" ? "" : v })} className="w-full sm:w-full" options={[["none", "Collect registrations only"], ...products.map((i) => [i.id, i.title] as [string, string])]} /></Field>
      <Field id="lp-mt" label="Meta title" hint={`${form.metaTitle.length}/70 · shown in search results and shared links`}><Input id="lp-mt" value={form.metaTitle} maxLength={70} placeholder={form.title} onChange={(e) => setForm({ metaTitle: e.target.value })} /></Field>
      <Field id="lp-md" label="Meta description" hint={`${form.metaDescription.length}/160`}><Textarea id="lp-md" rows={2} value={form.metaDescription} maxLength={160} onChange={(e) => setForm({ metaDescription: e.target.value })} /></Field>
      <dl className="divide-y rounded-[16px] border-[1.5px] border-line text-sm">
        {[["Template", `${templateName(form.template)}${LEGACY.has(form.template) ? "" : ` · ${form.variation.toUpperCase()}`}`], ["Colour theme", palette], ["Sections on", String(enabledBlocks(form).length + 1)], ["Registration", `${2 + Number(form.form.phone) + Number(form.form.whatsapp) + form.form.questions.length} fields`]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="flex items-center gap-2 font-extrabold">{k === "Colour theme" && <span className="h-4 w-4 rounded-full ring-1 ring-line" style={{ background: form.colors.primary }} />}{v}</dd></div>
        ))}
      </dl>
      <div className="rounded-[16px] bg-ice/60 p-3.5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-text">Public URL</p><p className="mt-1 break-all text-sm font-extrabold text-cobalt">{url}</p></div>
      {(error || problem) ? <p role="alert" className="flex gap-2 rounded-[14px] border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm font-semibold text-destructive"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error || problem}</p> : <p className="flex items-center gap-2 text-sm font-semibold text-success"><Check className="h-4 w-4" />Ready to publish.</p>}
    </>
  );
}
