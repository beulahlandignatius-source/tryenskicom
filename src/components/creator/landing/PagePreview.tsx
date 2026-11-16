import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { naira } from "@/lib/affiliate/products";
import type { LandingPage, LandingRow } from "@/lib/creator/rules";
import { enabledBlocks } from "@/lib/creator/landing";

export type Device = "desktop" | "tablet" | "mobile";
type Look = { hero: string; card: string; h: string; radius: string; btn: string; deco?: ReactNode; section?: string };

/** Each template's own composition. Creator colours arrive as --lp-* variables and only apply inside this page. */
const LOOKS: Record<string, Look> = {
  "enski-event": { hero: "bg-[var(--lp-primary)] text-[var(--lp-bg)]", card: "rounded-[20px] bg-[color-mix(in_oklab,var(--lp-secondary)_10%,var(--lp-bg))]", h: "font-extrabold tracking-tight", radius: "rounded-full", btn: "rounded-full" },
  "ethereal-luxury": { hero: "bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--lp-accent)_45%,var(--lp-bg)),var(--lp-bg)_70%)] text-[var(--lp-heading)]", card: "rounded-[28px] bg-[color-mix(in_oklab,var(--lp-accent)_14%,var(--lp-bg))]", h: "font-serif font-normal italic-accent tracking-tight", radius: "rounded-full", btn: "rounded-full", section: "py-16" },
  "cyber-grid": { hero: "bg-[var(--lp-heading)] text-[var(--lp-bg)] bg-[linear-gradient(color-mix(in_oklab,var(--lp-secondary)_25%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--lp-secondary)_25%,transparent)_1px,transparent_1px)] bg-[size:28px_28px]", card: "rounded-none border border-[var(--lp-secondary)] shadow-[0_0_18px_color-mix(in_oklab,var(--lp-secondary)_35%,transparent)]", h: "font-mono uppercase tracking-wider", radius: "rounded-none", btn: "rounded-none font-mono uppercase" },
  "neo-brutalism": { hero: "bg-[var(--lp-accent)] text-[var(--lp-heading)] border-b-4 border-[var(--lp-heading)]", card: "rounded-none border-[3px] border-[var(--lp-heading)] bg-[var(--lp-bg)] shadow-[6px_6px_0_var(--lp-heading)]", h: "font-black uppercase", radius: "rounded-none", btn: "rounded-none border-[3px] border-[var(--lp-heading)] shadow-[4px_4px_0_var(--lp-heading)]" },
  "swiss-minimalist": { hero: "bg-[var(--lp-bg)] text-[var(--lp-heading)] border-b border-[var(--lp-heading)]", card: "rounded-none border-t-2 border-[var(--lp-heading)] pt-4", h: "font-extrabold tracking-tighter", radius: "rounded-none", btn: "rounded-none" },
  "earthy-organic": { hero: "bg-[color-mix(in_oklab,var(--lp-accent)_45%,var(--lp-bg))] text-[var(--lp-heading)]", card: "rounded-[32px] bg-[color-mix(in_oklab,var(--lp-accent)_30%,var(--lp-bg))]", h: "font-serif font-semibold", radius: "rounded-[40px]", btn: "rounded-full" },
  "spatial-3d": { hero: "bg-[linear-gradient(135deg,var(--lp-primary),var(--lp-secondary))] text-[var(--lp-bg)] [perspective:900px]", card: "rounded-[22px] bg-[var(--lp-bg)] shadow-[0_24px_40px_-18px_color-mix(in_oklab,var(--lp-primary)_55%,transparent)] [transform:translateZ(0)_rotateX(4deg)]", h: "font-extrabold", radius: "rounded-[28px]", btn: "rounded-[14px] shadow-[0_10px_20px_-8px_rgba(0,0,0,.45)]",
    deco: <><span className="absolute -right-6 top-6 h-24 w-24 rounded-[22px] bg-[var(--lp-accent)] opacity-90 shadow-2xl [transform:rotate(18deg)]" /><span className="absolute bottom-6 left-4 h-14 w-14 rounded-full bg-[var(--lp-bg)]/30 shadow-xl" /></> },
  "glass-material": { hero: "bg-[radial-gradient(circle_at_20%_20%,var(--lp-secondary),transparent_55%),radial-gradient(circle_at_80%_60%,var(--lp-accent),transparent_50%),var(--lp-primary)] text-[var(--lp-bg)]", card: "rounded-[22px] border border-[color-mix(in_oklab,var(--lp-bg)_60%,transparent)] bg-[color-mix(in_oklab,var(--lp-secondary)_10%,var(--lp-bg))] backdrop-blur", h: "font-bold", radius: "rounded-[24px]", btn: "rounded-[14px]" },
};

export function PagePreview({ page, device, product, store, interactive = false }: { page: LandingPage; device: Device; product?: { title: string; price: number } | undefined; store: string; interactive?: boolean }) {
  const col = page.colors;
  const look = LOOKS[page.template] ?? LOOKS["enski-event"]!;
  const small = device === "mobile";
  const pad = small ? "px-5" : device === "tablet" ? "px-8" : "px-12";
  const style = { "--lp-primary": col.primary, "--lp-secondary": col.secondary, "--lp-accent": col.accent, "--lp-bg": col.background, "--lp-heading": col.heading, "--lp-body": col.body, "--lp-btn": col.buttonBg, "--lp-btn-text": col.buttonText, background: col.background, color: col.body } as CSSProperties;
  const bg = page.cover || page.hero.imageUrl;
  const btn = (label: string, ghost = false) => (
    <span className={cn("inline-flex h-11 items-center px-6 text-sm font-extrabold", look.btn, ghost ? "border-2 border-current bg-transparent" : "bg-[var(--lp-btn)] text-[var(--lp-btn-text)]")}>{label}</span>
  );
  const H = ({ children, className }: { children: ReactNode; className?: string }) => <h2 className={cn(look.h, "text-[var(--lp-heading)]", small ? "text-2xl" : "text-3xl", className)}>{children}</h2>;
  const grid = small ? "grid-cols-1" : device === "tablet" ? "grid-cols-2" : "grid-cols-3";
  const v = page.variation;
  const heroText = (
    <div className={cn(v === "t1" && "mx-auto max-w-2xl text-center")}>
      {page.logo && <img src={page.logo} alt="Logo" className={cn("mb-4 h-10 w-auto object-contain", v === "t1" && "mx-auto")} />}
      <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-80">{page.hero.brand || store}{page.hero.dateLine && <> · {page.hero.dateLine}</>}</p>
      <h1 className={cn(look.h, "mt-3 leading-[1.05]", small ? "text-3xl" : "text-5xl")}>
        {page.headline || "Your headline"}
        {page.hero.line2 && <span className="block italic text-[var(--lp-accent)]">{page.hero.line2}</span>}
        {page.hero.line3 && <span className="block">{page.hero.line3}</span>}
      </h1>
      <p className="mt-4 whitespace-pre-wrap text-[15px] opacity-85">{page.body || "Describe who it's for and what they'll get."}</p>
      <div className={cn("mt-6 flex flex-wrap gap-3", v === "t1" && "justify-center")}>{btn(page.cta || "Register now")}{page.hero.cta2 && btn(page.hero.cta2, true)}</div>
      {product && <p className="mt-4 text-sm font-bold opacity-90">{product.title} · {product.price ? naira(product.price) : "Free"}</p>}
    </div>
  );
  const rows = (list: LandingRow[], render: (r: LandingRow) => ReactNode) => <div className={cn("mt-6 grid gap-4", grid)}>{list.map((r) => <div key={r.id} className={cn(look.card, "p-5")}>{render(r)}</div>)}</div>;
  const img = (src: string, cls: string) => (src ? <img src={src} alt="" className={cn("object-cover", cls)} /> : null);
  const block = (id: string) => {
    const k = page.content;
    switch (id) {
      case "stats": return k.stats.length ? rows(k.stats, (r) => <><p className={cn(look.h, "text-4xl text-[var(--lp-primary)]")}>{r.title}</p><p className="mt-1 font-bold text-[var(--lp-heading)]">{r.subtitle}</p><p className="mt-1 text-sm">{r.text}</p></>) : null;
      case "about": return (k.about.heading || k.about.text) ? <div className={cn("grid items-center gap-8", !small && k.about.image && "grid-cols-2")}><div><H>{k.about.heading}</H><p className="mt-3 whitespace-pre-wrap leading-7">{k.about.text}</p></div>{img(k.about.image, cn("aspect-[4/3] w-full", look.radius))}</div> : null;
      case "speakers": return k.speakers.length ? <><H>Speakers</H>{rows(k.speakers, (r) => <>{img(r.image, "mb-3 aspect-square w-20 rounded-full")}<p className="font-extrabold text-[var(--lp-heading)]">{r.title}</p><p className="text-sm font-bold text-[var(--lp-primary)]">{r.subtitle}</p><p className="mt-2 text-sm">{r.text}</p></>)}</> : null;
      case "features": return k.features.length ? <><H>The experience</H>{rows(k.features, (r) => <>{img(r.image, "mb-3 h-12 w-12 rounded-[12px]")}<p className="font-extrabold text-[var(--lp-heading)]">{r.title}</p><p className="mt-1 text-sm">{r.text}</p></>)}</> : null;
      case "countdown": return k.countdown.date ? <Countdown date={k.countdown.date} time={k.countdown.time} zone={k.countdown.zone} look={look} live={interactive} /> : null;
      case "programme": return k.programme.length ? <><H>Programme</H><ol className="mt-6 space-y-3">{k.programme.map((r) => <li key={r.id} className={cn(look.card, "flex gap-4 p-4")}><span className="w-20 shrink-0 font-extrabold text-[var(--lp-primary)]">{r.subtitle}</span><span><span className="block font-bold text-[var(--lp-heading)]">{r.title}</span><span className="block text-sm">{r.text}</span></span></li>)}</ol></> : null;
      case "testimonials": return k.testimonials.length ? <><H>What people say</H>{rows(k.testimonials, (r) => <><p className="italic leading-7">“{r.text}”</p><div className="mt-4 flex items-center gap-3">{img(r.image, "h-10 w-10 rounded-full")}<span><span className="block text-sm font-extrabold text-[var(--lp-heading)]">{r.title}</span><span className="block text-xs">{r.subtitle}</span></span></div></>)}</> : null;
      case "cta": return (k.cta.heading || k.cta.button) ? <div className={cn("bg-[var(--lp-primary)] p-8 text-center text-[var(--lp-bg)]", look.radius)}><h2 className={cn(look.h, small ? "text-2xl" : "text-3xl")}>{k.cta.heading}</h2><p className="mt-2 opacity-85">{k.cta.text}</p><div className="mt-5">{btn(k.cta.button || page.cta || "Register now")}</div></div> : null;
    }
    return null;
  };
  const f = page.form;
  const field = (label: string, req?: boolean) => <label className="block"><span className="text-xs font-bold text-[var(--lp-heading)]">{label}{req && " *"}</span><span className={cn("mt-1 block h-10 border border-[color-mix(in_oklab,var(--lp-body)_35%,transparent)] bg-[var(--lp-bg)]", look.btn.includes("rounded-none") ? "" : "rounded-[12px]")} /></label>;
  return (
    <div style={style} className="landing-preview text-[15px]">
      <header className={cn("relative overflow-hidden", look.hero, small ? "py-12" : "py-20", pad)}>
        {look.deco}
        {bg && v === "t3" && <><img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute inset-0 bg-[var(--lp-heading)]/60" /></>}
        <div className={cn("relative", v === "t2" && !small && "grid grid-cols-2 items-center gap-10", v === "t3" && "text-[var(--lp-bg)]")}>
          {heroText}
          {v === "t2" && (bg ? img(bg, cn("aspect-[4/3] w-full", look.radius, small && "mt-6")) : <span className={cn("block aspect-[4/3] w-full bg-[var(--lp-accent)]/60", look.radius, small && "mt-6")} />)}
        </div>
      </header>
      {page.sections.map((s) => <section key={s.id} className={cn(pad, "py-10")}><H>{s.title}</H><p className="mt-2 whitespace-pre-wrap">{s.text}</p>{img(s.image, cn("mt-4 aspect-[16/9] w-full", look.radius))}</section>)}
      {enabledBlocks(page).map((b) => { const node = block(b.id); return node ? <section key={b.id} className={cn(pad, look.section ?? "py-12")}>{node}</section> : null; })}
      {!product && (
        <section id="register" className={cn(pad, "py-12")}>
          <div className={cn(look.card, "mx-auto max-w-lg p-6")}>
            <H className="text-2xl">Register</H>
            <div className="mt-4 space-y-3">
              {field("Full name", true)}{field("Email address", true)}{f.phone && field("Phone number")}{f.whatsapp && field("WhatsApp number")}
              {f.questions.map((q) => q.type === "single" || q.type === "multiple" ? (
                <fieldset key={q.id}><legend className="text-xs font-bold text-[var(--lp-heading)]">{q.label || "Question"}{q.required && " *"}</legend>{q.options.filter(Boolean).map((o) => <span key={o} className="mt-1 flex items-center gap-2 text-sm"><span className={cn("h-4 w-4 border border-current", q.type === "single" ? "rounded-full" : "rounded-[4px]")} />{o}</span>)}</fieldset>
              ) : <div key={q.id}>{field(q.label || "Question", q.required)}</div>)}
              <div className="pt-2">{btn(page.cta || "Register now")}</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Countdown({ date, time, zone, look, live }: { date: string; time: string; zone: string; look: Look; live: boolean }) {
  void live;
  const target = new Date(`${date}T${time || "00:00"}:00`);
  const ms = Math.max(0, target.getTime() - Date.now());
  const parts = [["Days", Math.floor(ms / 864e5)], ["Hours", Math.floor(ms / 36e5) % 24], ["Minutes", Math.floor(ms / 6e4) % 60]] as const;
  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--lp-primary)]">Starts {date} · {time} ({zone})</p>
      <div className="mt-4 flex justify-center gap-3">{parts.map(([l, n]) => <div key={l} className={cn(look.card, "min-w-20 p-4")}><p className={cn(look.h, "text-3xl text-[var(--lp-heading)]")}>{n}</p><p className="text-xs">{l}</p></div>)}</div>
    </div>
  );
}
