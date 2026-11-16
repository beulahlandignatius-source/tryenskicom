import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { removeWhere, restoreAll, restoreAt, sameId } from "@/lib/shared/listUndo";
import { undoToast } from "@/lib/shared/undo";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Globe, ShoppingBag, Plus, Pencil, Trash2, Users, Copy, Download, UserPlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { naira } from "@/lib/affiliate/products";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { PageHeader, Panel, EmptyState, FilterSelect, StatCard } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { isEmail, type LandingPage } from "@/lib/creator/rules";
import { CreatorNotFound, ItemStatus, copyText, downloadCsv, shortDate } from "./shared";
import { LandingBuilder } from "./landing/Builder";
import { ClassicEditor } from "./landing/ClassicEditor";
import { PagePreview } from "./landing/PagePreview";
import { conversionRate, pageUrl, templateName } from "@/lib/creator/landing";
function PageThumb({ page, className }: { page: LandingPage; className?: string | undefined }) {
  if (page.mode === "import") return <div data-surface="dark" className={cn("bg-brand-panel grid place-items-center rounded-[14px] font-mono text-xs text-lime", className)} aria-hidden="true">&lt;AI design /&gt;</div>;
  if (["spotlight", "split", "minimal"].includes(page.template)) return <TemplateThumb id={page.template} cover={page.cover} className={className} />;
  return <div className={cn("pointer-events-none overflow-hidden rounded-[14px] bg-card ring-1 ring-line", className)} aria-hidden="true"><div className="w-[1000px] origin-top-left scale-[0.32]"><PagePreview page={page} device="desktop" store="" /></div></div>;
}
function TemplateThumb({ id, cover, className }: { id: LandingPage["template"]; cover?: string; className?: string | undefined }) {
  const img = cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <div data-surface="dark" className="bg-brand-panel h-full w-full" />;
  return (
    <div className={cn("landing-thumb relative overflow-hidden rounded-[14px] bg-card ring-1 ring-line", className)} aria-hidden="true">
      {id === "spotlight" && (
        <div className="flex h-full flex-col">
          <div className="relative h-[58%] overflow-hidden">{img}<div className="absolute inset-0 grid place-content-center justify-items-center gap-1"><span className="h-1.5 w-16 rounded-full bg-on-dark/90" /><span className="h-1 w-10 rounded-full bg-on-dark/60" /><span className="mt-1 h-2.5 w-9 rounded-full bg-lime" /></div></div>
          <div className="grid flex-1 grid-cols-3 gap-1.5 p-2">{[0, 1, 2].map((i) => <span key={i} className="rounded-md bg-soft" />)}</div>
        </div>
      )}
      {id === "split" && (
        <div className="grid h-full grid-cols-2 gap-2 p-2.5">
          <div className="flex flex-col justify-center gap-1.5"><span className="h-1.5 w-full rounded-full bg-midnight/80" /><span className="h-1.5 w-3/4 rounded-full bg-midnight/80" /><span className="h-1 w-full rounded-full bg-line" /><span className="h-1 w-2/3 rounded-full bg-line" /><span className="mt-1 h-2.5 w-10 rounded-full bg-cobalt" /></div>
          <div className="overflow-hidden rounded-[10px]">{img}</div>
        </div>
      )}
      {id === "minimal" && (
        <div className="flex h-full flex-col items-start justify-center gap-1.5 p-3">
          <span className="h-1 w-8 rounded-full bg-lime" /><span className="h-2 w-4/5 rounded-full bg-midnight/80" /><span className="h-1 w-full rounded-full bg-line" /><span className="h-1 w-3/4 rounded-full bg-line" />
          <div className="mt-1 h-8 w-full overflow-hidden rounded-[8px]">{img}</div>
          <span className="h-2.5 w-10 rounded-full bg-cobalt" />
        </div>
      )}
    </div>
  );
}

export function LandingPagesList() {
  const { state, update } = useCreator();
  const [del, setDel] = useState<LandingPage | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const delLeads = del ? state.leads.filter((l) => l.pageId === del.id).length : 0;
  const deletePage = (p: LandingPage) => {
    const { removed } = removeWhere(state.landingPages, (x) => x.id === p.id);
    const leadsRemoved = state.leads.map((item, index) => ({ item, index })).filter((r) => r.item.pageId === p.id);
    update((s) => ({ landingPages: s.landingPages.filter((x) => x.id !== p.id), leads: s.leads.filter((l) => l.pageId !== p.id) }));
    setDel(null);
    if (removed) undoToast(`"${p.title}" deleted`, () => update((s) => ({ landingPages: restoreAt(s.landingPages, removed, sameId), leads: restoreAll(s.leads, leadsRemoved, sameId) })));
  };
  const create = (
    <Button asChild>
      <Link to="/creator/landing-pages/create">
        <Plus />
        Create new page
      </Link>
    </Button>
  );
  const published = state.landingPages.filter((p) => p.status === "published").length;
  const needle = q.trim().toLowerCase();
  const shown = state.landingPages.filter((p) => (status === "all" || p.status === status) && (!needle || [p.title, p.slug, templateName(p.template), p.mode === "import" ? "ai import" : ""].some((t) => t.toLowerCase().includes(needle))));
  const totalViews = state.landingPages.reduce((n, p) => n + (p.views ?? 0), 0);
  const overall = conversionRate(state.leads.filter((l) => state.landingPages.some((p) => p.id === l.pageId && p.views)).length, totalViews);
  return (
    <div>
      <PageHeader eyebrow="Marketing" title="Landing pages" description="Focused pages that collect leads or sell a single product." actions={create} />
      {state.landingPages.length > 0 && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard icon={ShoppingBag} label="Pages" value={String(state.landingPages.length)} />
            <StatCard icon={Globe} label="Published" value={String(published)} tone="sky" />
            <StatCard icon={Users} label="Leads" value={String(state.leads.length)} tone="lime" />
            <StatCard icon={Eye} label="Conversion" value={overall === null ? "—" : `${overall}%`} />
          </div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input type="search" aria-label="Search landing pages" placeholder="Search landing pages" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" /></div>
            <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All pages"], ["published", "Published"], ["draft", "Drafts"]]} />
          </div>
        </>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((p) => {
          const leads = state.leads.filter((l) => l.pageId === p.id).length;
          const buyers = p.itemId ? new Set(state.orders.filter((o) => o.itemId === p.itemId && o.status === "paid").map((o) => o.customerId)).size : null;
          const rate = conversionRate(leads, p.views);
          const url = pageUrl(state.storefront.handle, p.slug);
          return (
            <article key={p.id} className="product-card surface group flex flex-col overflow-hidden hover:-translate-y-0.5 hover:border-cobalt-100 hover:shadow-lift">
              <Link to="/creator/landing-pages/$pageId/edit" params={{ pageId: p.id }} className="relative block bg-soft p-3" aria-label={`Edit ${p.title}`}>
                <PageThumb page={p} className="aspect-[16/10] w-full" />
                <span className={cn("absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-sm", p.status === "published" ? "bg-success-soft text-success" : "bg-card text-muted-foreground")}><span className={cn("h-1.5 w-1.5 rounded-full", p.status === "published" ? "bg-success" : "bg-muted-foreground")} />{p.status === "published" ? "Live" : "Draft"}</span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 truncate text-base">{p.title}</h2>
                  <ItemStatus status={p.status} />
                </div>
                <button type="button" onClick={() => copyText(url)} className="mt-1 truncate text-left text-xs text-sky-text hover:underline" aria-label={`Copy link ${url}`}>{url}</button>
                <dl className="mt-3 grid grid-cols-4 gap-1.5 text-center">
                  {[["Views", p.views === undefined ? "—" : String(p.views)], ["Leads", String(leads)], ["Conv.", rate === null ? "—" : `${rate}%`], ["Buyers", buyers === null ? "—" : String(buyers)]].map(([k, v]) => (
                    <div key={k} className="rounded-[12px] bg-soft px-1 py-2"><dd className="text-sm font-extrabold">{v}</dd><dt className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{k}</dt></div>
                  ))}
                </dl>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">{p.mode === "import" ? "AI-designed import" : `${templateName(p.template)}${["spotlight", "split", "minimal"].includes(p.template) ? "" : ` · ${p.variation.toUpperCase()}`}`} · Updated {shortDate(p.date)}</p>
                <div className="mt-auto flex flex-wrap gap-2 border-t pt-3.5">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/creator/landing-pages/$pageId/edit" params={{ pageId: p.id }}><Pencil />Edit</Link>
                  </Button>
                  <Button asChild size="sm" variant="soft">
                    <Link to="/creator/landing-pages/$pageId/leads" params={{ pageId: p.id }}><Users />Leads</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const next = p.status === "published" ? "draft" : "published";
                    update((s) => ({ landingPages: s.landingPages.map((x) => (x.id === p.id ? { ...x, status: next } : x)) }));
                    toast.success(next === "published" ? "Page published" : "Page unpublished");
                  }}>{p.status === "published" ? "Unpublish" : "Publish"}</Button>
                  <Button size="sm" variant="ghost" className="ml-auto h-9 w-9 px-0 text-muted-foreground hover:text-destructive" aria-label={`Delete ${p.title}`} onClick={() => setDel(p)}><Trash2 /></Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {state.landingPages.length > 0 && !shown.length && <EmptyState icon={Search} title="No pages match" description="Try another word or show all pages." compact />}
      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        art={brandArtwork.bin}
        eyebrow="Landing pages"
        title={`Delete “${del?.title ?? ""}”?`}
        description={del?.status === "published" ? "The page goes offline straight away." : "The page and its design will be removed."}
        confirmLabel="Delete page"
        confirmIcon={<Trash2 />}
        onConfirm={() => { if (del) deletePage(del); }}
      >
        <ConfirmNote>{delLeads ? `Its ${delLeads} lead${delLeads === 1 ? "" : "s"} will be deleted too, so export them first if you need them.` : "It has no leads yet."}</ConfirmNote>
      </ConfirmDialog>
      {!state.landingPages.length && (
        <section className="surface overflow-hidden">
          <EmptyState icon={ShoppingBag} title="No landing pages yet" description="Build from a template or import an AI-designed page, then publish in minutes." action={create} />
        </section>
      )}
    </div>
  );
}

function LandingPreview({ page, product, store, device }: { page: LandingPage; product?: { title: string; price: number } | undefined; store: string; device: "desktop" | "mobile" }) {
  const mobile = device === "mobile";
  const cover = page.cover ? <img src={page.cover} alt="Cover" className="h-full w-full object-cover" /> : null;
  const headline = page.headline || "Your headline goes here";
  const body = page.body || "Describe what people get and why it matters to them.";
  const cta = <span className="inline-flex h-11 items-center rounded-full bg-lime px-6 text-sm font-extrabold text-midnight">{page.cta || "Get access"}</span>;
  const ctaLight = <span className="inline-flex h-11 items-center rounded-full bg-cobalt px-6 text-sm font-extrabold text-primary-foreground">{page.cta || "Get access"}</span>;
  const offer = product ? (
    <div className="mt-5 inline-flex items-center gap-3 rounded-[16px] bg-card px-4 py-3 text-left text-foreground shadow-lift ring-1 ring-line">
      <span className="min-w-0"><span className="block truncate text-sm font-extrabold">{product.title}</span><span className="block text-xs text-muted-foreground">{product.price ? naira(product.price) : "Free"}</span></span>
    </div>
  ) : null;
  return (
    <div className="landing-preview bg-card text-foreground">
      {page.template === "spotlight" && (
        <div data-surface="dark" className={cn("bg-brand-panel relative overflow-hidden text-center text-on-dark", mobile ? "px-5 py-12" : "px-10 py-20")}>
          {cover && <div className="absolute inset-0 opacity-35">{cover}</div>}
          <div className="relative mx-auto max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime">{store}</p>
            <h1 className={cn("mt-3 leading-tight", mobile ? "text-2xl" : "text-4xl")}>{headline}</h1>
            <p className="mt-3 whitespace-pre-wrap text-sm text-on-dark-muted">{body}</p>
            <div className="mt-6">{cta}</div>
            {offer}
          </div>
        </div>
      )}
      {page.template === "split" && (
        <div className={cn("grid items-center gap-6", mobile ? "px-5 py-8" : "grid-cols-2 px-10 py-14")}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt">{store}</p>
            <h1 className={cn("mt-2 leading-tight", mobile ? "text-2xl" : "text-[34px]")}>{headline}</h1>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{body}</p>
            <div className="mt-5">{ctaLight}</div>
            {offer}
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-soft">{cover ?? <div data-surface="dark" className="bg-brand-panel h-full w-full" />}</div>
        </div>
      )}
      {page.template === "minimal" && (
        <div className={cn("mx-auto max-w-2xl", mobile ? "px-5 py-10" : "px-10 py-16")}>
          <span className="block h-1.5 w-12 rounded-full bg-lime" />
          <h1 className={cn("mt-4 leading-tight", mobile ? "text-2xl" : "text-4xl")}>{headline}</h1>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">{body}</p>
          {cover && <div className="mt-6 aspect-[16/9] overflow-hidden rounded-[18px]">{cover}</div>}
          <div className="mt-6">{ctaLight}</div>
          {offer}
        </div>
      )}
      {page.sections.length > 0 && (
        <div className={cn("space-y-8 border-t", mobile ? "px-5 py-8" : "px-10 py-12")}>
          {page.sections.map((sec, i) => (
            <section key={sec.id} className={cn("grid items-center gap-5", !mobile && sec.image && "grid-cols-2")}>
              {sec.image && <div className={cn("aspect-[4/3] overflow-hidden rounded-[18px] bg-soft", !mobile && i % 2 === 1 && "order-2")}><img src={sec.image} alt={sec.title} className="h-full w-full object-cover" /></div>}
              <div><h2 className="text-xl">{sec.title || "Section title"}</h2>{sec.text && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{sec.text}</p>}</div>
            </section>
          ))}
        </div>
      )}
      {!product && (
        <div className={cn("border-t bg-soft/60", mobile ? "px-5 py-8" : "px-10 py-10")}>
          <div className="mx-auto max-w-md text-center">
            <p className="text-sm font-extrabold">Join the list</p>
            <div className={cn("mt-3 flex gap-2", mobile && "flex-col")}><span className={cn("h-11 rounded-[14px] border-[1.5px] bg-card", mobile ? "w-full" : "flex-1")} /><span className="inline-flex h-11 items-center justify-center rounded-full bg-cobalt px-5 text-sm font-extrabold text-primary-foreground">{page.cta || "Get access"}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LandingPageEditor({ id }: { id?: string }) {
  const { state } = useCreator();
  const products = state.items.filter((i) => i.status !== "archived");
  const preview = (page: LandingPage, device: "desktop" | "mobile") => <LandingPreview page={page} product={products.find((i) => i.id === page.itemId)} store={state.storefront.name || "Your store"} device={device} />;
  return <LandingBuilder id={id} legacyPreview={preview} classic={(pid) => <ClassicEditor id={pid} preview={preview} thumb={(t, cover) => <TemplateThumb id={t} cover={cover} className="h-full w-full" />} />} />;
}
export function LandingLeads({ id }: { id: string }) {
  const { state, update } = useCreator();
  const page = state.landingPages.find((p) => p.id === id);
  const [add, setAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [range, setRange] = useState("all");
  if (!page) return <CreatorNotFound what="landingPage" />;
  const leads = state.leads.filter((l) => l.pageId === id).slice().reverse();
  const needle = q.trim().toLowerCase();
  const cutoff = range === "all" ? 0 : Date.now() - Number(range) * 864e5;
  const shown = leads.filter((l) => new Date(l.date).getTime() >= cutoff && (!needle || [l.name, l.email, l.phone ?? "", l.whatsapp ?? "", ...(l.answers ?? []).map((a) => a.answer)].some((t) => t.toLowerCase().includes(needle))));
  const questions = [...new Set(leads.flatMap((l) => (l.answers ?? []).map((a) => a.question)))];
  const url = pageUrl(state.storefront.handle, page.slug);
  return (
    <div>
      <PageHeader
        eyebrow="Leads"
        title={page.title}
        description={url}
        actions={
          <>
            <Button variant="outline" onClick={() => copyText(url)} disabled={page.status !== "published" || !state.storefront.handle}>
              <Copy />
              Copy link
            </Button>
            <Button
              variant="outline"
              disabled={!leads.length}
              onClick={() => downloadCsv(`${page.slug}-leads.csv`, [["Name", "Email", "Phone", "WhatsApp", ...questions, "Source", "Date"], ...leads.map((l) => [l.name, l.email, l.phone ?? "", l.whatsapp ?? "", ...questions.map((qq) => l.answers?.find((a) => a.question === qq)?.answer ?? ""), l.source ?? page.title, shortDate(l.date)])])}
            >
              <Download />
              Export CSV
            </Button>
          </>
        }
      />
      {page.status !== "published" && (
        <p className="mb-5 rounded-lg border bg-warning-soft p-3 text-sm text-warning-foreground">This page is a draft. Publish it to start collecting leads.</p>
      )}
      <Panel
        title="Leads"
        actions={
          page.status === "published" && (
            <Button
              size="sm"
              variant="soft"
              onClick={() => {
                setError("");
                setAdd(true);
              }}
            >
              <UserPlus />
              Add a sign-up
            </Button>
          )
        }
      >
        <p className="mb-3 text-[13px] text-muted-foreground">Leads are sign-ups, not purchases. Sales show in your orders.</p>
        {leads.length > 0 && (
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input type="search" aria-label="Search leads" placeholder="Search name, email, phone or answer" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" /></div>
            <FilterSelect label="Submitted" value={range} onChange={setRange} options={[["all", "Any time"], ["7", "Last 7 days"], ["30", "Last 30 days"]]} />
          </div>
        )}
        <div className="divide-y">
          {shown.map((l) => (
            <div key={l.id} className="py-4 text-sm">
              <div className="flex flex-wrap justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{l.name}</p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">{l.email}</p>
                  {(l.phone || l.whatsapp) && <p className="mt-1 text-xs text-muted-foreground">{l.phone && <>Phone {l.phone}</>}{l.phone && l.whatsapp && " · "}{l.whatsapp && <>WhatsApp {l.whatsapp}</>}</p>}
                  <p className="mt-1 text-[11px] font-bold text-sky-text">From {l.source || page.title}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {shortDate(l.date)}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove lead ${l.name}`}
                    onClick={() => {
                      const { removed } = removeWhere(state.leads, (x) => x.id === l.id);
                      update((s) => ({ leads: s.leads.filter((x) => x.id !== l.id) }));
                      if (removed) undoToast(`${l.name} removed from leads`, () => update((s) => ({ leads: restoreAt(s.leads, removed, sameId) })));
                    }}
                  >
                    <Trash2 />
                  </Button>
                </span>
              </div>
              {!!l.answers?.length && (
                <details className="mt-2 rounded-[12px] bg-soft px-3 py-2"><summary className="cursor-pointer text-xs font-extrabold text-cobalt">{l.answers.length} answer{l.answers.length === 1 ? "" : "s"}</summary>
                  <dl className="mt-2 space-y-1.5 text-xs">{l.answers.map((a) => <div key={a.question}><dt className="font-bold">{a.question}</dt><dd className="text-muted-foreground">{a.answer || "—"}</dd></div>)}</dl>
                </details>
              )}
            </div>
          ))}
        </div>
        {leads.length > 0 && !shown.length && <EmptyState icon={Search} title="No leads match" description="Try another word or time range." compact />}
        {!leads.length && <EmptyState icon={Users} title="No leads yet" description="People who sign up on this page will appear here." compact />}
      </Panel>
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a sign-up</DialogTitle>
            <DialogDescription>Add someone who signed up with you directly. They appear in your leads.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !isEmail(email)) return setError("Enter a name and a valid email.");
              if (leads.some((l) => l.email.toLowerCase() === email.trim().toLowerCase())) return setError("This email already signed up.");
              update((s) => ({
                leads: [...s.leads, { id: crypto.randomUUID(), pageId: id, name: name.trim(), email: email.trim(), date: new Date().toISOString(), ...(phone.trim() ? { phone: phone.trim() } : {}), ...(whatsapp.trim() ? { whatsapp: whatsapp.trim() } : {}), source: "Added by you" }],
                activity: [...s.activity, activityEntry(`New lead on ${page.title}`)],
              }));
              setAdd(false);
              setName("");
              setEmail("");
              setPhone("");
              setWhatsapp("");
              toast.success("Lead added");
            }}
          >
            <Field id="lead-name" label="Name">
              <Input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id="lead-email" label="Email">
              <Input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            {page.form.phone && <Field id="lead-phone" label="Phone (optional)"><Input id="lead-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>}
            {page.form.whatsapp && <Field id="lead-wa" label="WhatsApp (optional)"><Input id="lead-wa" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></Field>}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogActions><Button type="submit">Add lead</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
