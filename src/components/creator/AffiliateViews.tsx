import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowDownUp, BadgePercent, Ban, ChevronLeft, ChevronRight, Copy, Layers, ListChecks, Megaphone, Pencil, Plus, Receipt, RotateCcw, Trash2, TrendingUp, Trophy, UserCheck, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Switch } from "@/components/dashboard-ui/switch";
import { Label } from "@/components/dashboard-ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { EmptyState, FilterSelect, PageHeader, Panel, SearchInput } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { removeWhere, restoreAt, sameId } from "@/lib/shared/listUndo";
import { undoToast } from "@/lib/shared/undo";
import { activityEntry, useCreator } from "@/lib/creator/store";
import { isEmail, saveRule, validateRule, type Affiliate, type CommissionRule, type ItemKind } from "@/lib/creator/rules";
import { COMMISSION_CATEGORIES, SOURCE_LABEL, categoryLabel, categoryRateError, paginate, referralCode, resolveRate, type RateSource } from "@/lib/creator/affiliates";
import { formatMoney } from "@/lib/shared/finance/currencies";
import { CreatorNotFound, copyText, shortDate } from "./shared";
import { AffiliateTabs } from "./Affiliates";

const naira = (n: number) => formatMoney(n, "NGN");
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const DAY = 86400000;

/* ---------- Badges ---------- */
const ACCOUNT_TONE = { active: "bg-success-soft text-success ring-success/25", invited: "bg-ice text-cobalt ring-cobalt-100", suspended: "bg-destructive/10 text-destructive ring-destructive/25" } as const;
export function AccountBadge({ status }: { status: Affiliate["status"] }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1", ACCOUNT_TONE[status])}><UserCheck className="h-3.5 w-3.5" aria-hidden="true" />Account: {status === "active" ? "Active" : status === "invited" ? "Invited" : "Suspended"}</span>;
}
export function PromotionBadge({ status }: { status: "active" | "paused" }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-bold", status === "active" ? "border-success/30 text-success" : "border-line text-muted-foreground")}><Megaphone className="h-3.5 w-3.5" aria-hidden="true" />{status === "active" ? "Promoting" : "Paused"}</span>;
}
const SOURCE_TONE: Record<RateSource, string> = { personal: "bg-lime text-midnight", product: "bg-cobalt text-primary-foreground", category: "bg-ice text-cobalt", none: "bg-soft text-muted-foreground" };
export function SourceBadge({ source }: { source: RateSource }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-extrabold", SOURCE_TONE[source])}>{SOURCE_LABEL[source]}</span>;
}

const STAT_ART = new Map<typeof Users, string>([[Users, brandArtwork.people], [UserCheck, brandArtwork.success], [TrendingUp, brandArtwork.analytics], [Megaphone, brandArtwork.megaphone], [Receipt, brandArtwork.receipt], [BadgePercent, brandArtwork.cash], [Layers, brandArtwork.package]]);
function Stat({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: string | undefined; icon: typeof Users }) {
  return (
    <div className="surface flex flex-col gap-2 p-4">
      <span className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground"><BrandIcon src={STAT_ART.get(Icon) ?? brandArtwork.analytics} className="stat-art h-10 w-10" />{label}</span>
      <span className="text-xl font-extrabold tabular-nums sm:text-2xl">{value}</span>
      {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
    </div>
  );
}
function StatGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section aria-label={title} className="mb-5"><h2 className="mb-2.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</h2><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div></section>;
}
function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-sm">
      <span className="text-muted-foreground">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft /></Button>
        <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight /></Button>
      </div>
    </div>
  );
}
const RANGES: [string, string][] = [["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"], ["all", "All time"]];
const inRange = (date: string, range: string) => range === "all" || Date.parse(date) >= Date.now() - Number(range) * DAY;

/* ---------- Dashboard ---------- */
export function AffiliatesPage() {
  const { state, update } = useCreator();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [product, setProduct] = useState("all");
  const [range, setRange] = useState("all");
  const [chartRange, setChartRange] = useState("30");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [invite, setInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const active = state.affiliates.filter((a) => a.status === "active").length;
  // No sale is linked to an affiliate in saved records yet, so these stay at their real value: zero.
  const affiliateSales = 0, revenue = 0, paid = 0, pending = 0;

  const list = useMemo(() => {
    const rows = state.affiliates.filter((a) =>
      (a.name + a.email + referralCode(a)).toLowerCase().includes(q.trim().toLowerCase()) && (status === "all" || a.status === status) && inRange(a.date, range));
    return [...rows].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  }, [state.affiliates, q, status, range, sort]);
  const pg = paginate(list, page);

  const promos = state.programs.filter((p) => {
    const item = state.items.find((i) => i.id === p.itemId);
    return (kind === "all" || item?.kind === kind) && (product === "all" || p.itemId === product) && inRange(p.date, range)
      && (!q.trim() || (item?.title ?? "").toLowerCase().includes(q.trim().toLowerCase()) || state.affiliates.some((a) => (a.name + a.email).toLowerCase().includes(q.trim().toLowerCase())));
  });
  const ppg = paginate(promos, page);
  const reset = (fn: (v: string) => void) => (v: string) => { fn(v); setPage(1); };

  const button = <Button onClick={() => { setError(""); setInvite(true); }}><UserPlus />Invite affiliate</Button>;
  return (
    <div>
      <PageHeader eyebrow="Affiliates" title="Affiliates" description="People who promote your products, and what they bring in." actions={button} />
      <AffiliateTabs />
      <StatGroup title="People">
        <Stat icon={Users} label="Total affiliates" value={state.affiliates.length} />
        <Stat icon={UserCheck} label="Active affiliates" value={active} hint={state.affiliates.length - active ? `${state.affiliates.length - active} invited or suspended` : undefined} />
        <Stat icon={TrendingUp} label="Total clicks" value="—" hint="Click tracking needs backend support" />
        <Stat icon={Megaphone} label="Products promoted" value={state.programs.filter((p) => p.status === "active").length} />
      </StatGroup>
      <StatGroup title="Sales and commission">
        <Stat icon={Receipt} label="Affiliate sales" value={affiliateSales} hint="Referred orders" />
        <Stat icon={TrendingUp} label="Total affiliate revenue" value={naira(revenue)} hint="What buyers paid" />
        <Stat icon={BadgePercent} label="Paid commission" value={naira(paid)} />
        <Stat icon={BadgePercent} label="Pending commission" value={naira(pending)} />
      </StatGroup>

      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Affiliate revenue" className="lg:col-span-2" actions={<FilterSelect label="Chart period" value={chartRange} onChange={setChartRange} options={RANGES} />}>
          <div className="relative h-44" aria-hidden="true">
            <div className="absolute inset-x-0 bottom-0 grid h-full grid-rows-4">{[0, 1, 2, 3].map((i) => <div key={i} className="border-t border-dashed border-line" />)}</div>
            <div className="absolute inset-x-0 bottom-0 border-t-2 border-cobalt" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">No referred sales in this period. Revenue appears here once a buyer pays through an affiliate's link.</p>
        </Panel>
        <Panel title="Top affiliates">
          <EmptyState icon={Trophy} title="No rankings yet" description="Affiliates are ranked by referred sales once they make one." compact />
        </Panel>
      </div>

      <Panel title="Product ranking" className="mb-5" description="Products in your programme, by referred sales.">
        {state.programs.length ? (
          <ol className="divide-y">
            {state.programs.map((p, i) => {
              const item = state.items.find((x) => x.id === p.itemId);
              const r = resolveRate(state, p);
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ice text-xs font-extrabold text-cobalt">{i + 1}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-bold">{item?.title ?? "Unavailable product"}</span><span className="text-xs text-muted-foreground">{item ? categoryLabel(item.kind) : ""} · 0 sales · {naira(0)}</span></span>
                  <span className="font-extrabold tabular-nums">{r.rate != null ? `${r.rate}%` : "—"}</span><SourceBadge source={r.source} />
                </li>
              );
            })}
          </ol>
        ) : <EmptyState icon={Layers} title="No products in your programme" description="Add a published product in Ongoing Promotions." compact />}
      </Panel>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap">
        <div className="flex w-full lg:w-80 [&>div]:max-w-none"><SearchInput value={q} onChange={reset(setQ)} placeholder="Search affiliate, email, code or product" /></div>
        <FilterSelect label="Account status" value={status} onChange={reset(setStatus)} options={[["all", "All statuses"], ["active", "Active"], ["invited", "Invited"], ["suspended", "Suspended"]]} />
        <FilterSelect label="Product type" value={kind} onChange={reset(setKind)} options={[["all", "All types"], ...COMMISSION_CATEGORIES.map((c) => [c.kind, c.label] as [string, string])]} />
        <FilterSelect label="Product" value={product} onChange={reset(setProduct)} options={[["all", "All products"], ...state.programs.map((p) => [p.itemId, state.items.find((i) => i.id === p.itemId)?.title ?? "Unavailable"] as [string, string])]} />
        <FilterSelect label="Date range" value={range} onChange={reset(setRange)} options={RANGES} />
        <FilterSelect label="Sort affiliates" value={sort} onChange={setSort} options={[["newest", "Newest first"], ["oldest", "Oldest first"], ["name", "Name A–Z"]]} />
      </div>

      <Panel title="Your affiliates" description={`${list.length} shown`} className="mb-5" bodyClassName="p-0">
        {pg.rows.length ? (
          <ul className="divide-y">
            {pg.rows.map((a) => (
              <li key={a.id}>
                <Link to="/creator/affiliates/$affiliateId" params={{ affiliateId: a.id }} className="flex flex-col gap-3 px-5 py-4 text-sm transition-colors hover:bg-soft/70 sm:flex-row sm:items-center">
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold", a.status === "suspended" ? "bg-soft text-muted-foreground" : "bg-ice text-cobalt")} aria-hidden="true">{initials(a.name)}</span>
                    <span className="min-w-0"><span className="block truncate font-bold">{a.name}</span><span className="block truncate text-xs text-muted-foreground">{a.email} · Since {shortDate(a.date)}</span></span>
                  </span>
                  <span className="flex flex-wrap items-center gap-2 pl-[52px] sm:pl-0">
                    <code className="rounded bg-soft px-1.5 py-0.5 text-[11px] font-bold">{referralCode(a)}</code>
                    {a.rate != null && <SourceBadge source="personal" />}
                    <AccountBadge status={a.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <EmptyState icon={Users} title={state.affiliates.length ? "No matching affiliates" : "No affiliates yet"} description={state.affiliates.length ? "Try another search or filter." : "Invite affiliates, or add products to Ongoing Promotions so affiliates can find them."} action={state.affiliates.length ? undefined : button} compact />}
        <Pager page={pg.page} pages={pg.pages} onPage={setPage} />
      </Panel>

      <Panel title="Affiliate promotions" description="Each product in your programme and the rate it pays." bodyClassName="p-0">
        {ppg.rows.length ? (
          <>
            <table className="hidden w-full text-sm md:table">
              <thead className="bg-soft/60 text-left text-xs text-muted-foreground"><tr><th className="px-5 py-2.5 font-bold">Product</th><th className="px-3 font-bold">Type</th><th className="px-3 font-bold">Commission</th><th className="px-3 font-bold">Sales</th><th className="px-3 font-bold">Revenue</th><th className="px-3 font-bold">Status</th><th className="px-5 font-bold">Since</th></tr></thead>
              <tbody className="divide-y">
                {ppg.rows.map((p) => { const item = state.items.find((i) => i.id === p.itemId); const r = resolveRate(state, p); return (
                  <tr key={p.id} className="hover:bg-soft/50">
                    <td className="px-5 py-3 font-bold"><Link to="/creator/affiliations/$programId" params={{ programId: p.id }} className="hover:text-cobalt">{item?.title ?? "Unavailable product"}</Link></td>
                    <td className="px-3">{item ? categoryLabel(item.kind) : "—"}</td>
                    <td className="px-3"><span className="mr-2 font-extrabold">{r.rate != null ? `${r.rate}%` : "—"}</span><SourceBadge source={r.source} /></td>
                    <td className="px-3 tabular-nums">0</td><td className="px-3 tabular-nums">{naira(0)}</td>
                    <td className="px-3"><PromotionBadge status={p.status} /></td><td className="px-5 text-muted-foreground">{shortDate(p.date)}</td>
                  </tr>); })}
              </tbody>
            </table>
            <ul className="divide-y md:hidden">
              {ppg.rows.map((p) => { const item = state.items.find((i) => i.id === p.itemId); const r = resolveRate(state, p); return (
                <li key={p.id}><Link to="/creator/affiliations/$programId" params={{ programId: p.id }} className="block space-y-2 px-5 py-4 text-sm">
                  <span className="flex items-start justify-between gap-2"><span className="font-bold">{item?.title ?? "Unavailable product"}</span><PromotionBadge status={p.status} /></span>
                  <span className="grid grid-cols-3 gap-2 text-xs"><span><span className="block text-muted-foreground">Type</span>{item ? categoryLabel(item.kind) : "—"}</span><span><span className="block text-muted-foreground">Commission</span><b>{r.rate != null ? `${r.rate}%` : "—"}</b></span><span><span className="block text-muted-foreground">Sales</span>0</span></span>
                  <SourceBadge source={r.source} />
                </Link></li>); })}
            </ul>
          </>
        ) : <EmptyState icon={Megaphone} title={state.programs.length ? "No matching promotions" : "No promotions yet"} description={state.programs.length ? "Try another filter." : "Add a published product in Ongoing Promotions."} compact />}
        <Pager page={ppg.page} pages={ppg.pages} onPage={setPage} />
      </Panel>

      <Dialog open={invite} onOpenChange={setInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite affiliate</DialogTitle><DialogDescription>Add someone you'd like to promote your products.</DialogDescription></DialogHeader>
          <form className="space-y-4" noValidate onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return setError("Enter their name.");
            if (!isEmail(email)) return setError("Enter a valid email address.");
            if (state.affiliates.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) return setError("This person has already been invited.");
            update((s) => ({ affiliates: [...s.affiliates, { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), status: "invited", date: new Date().toISOString() }], activity: [...s.activity, activityEntry(`Affiliate invited: ${name.trim()}`)] }));
            setInvite(false); setName(""); setEmail("");
            toast.success("Affiliate added as invited", { description: "Sending invitation emails needs backend support." });
          }}>
            <Field id="aff-name" label="Name"><Input id="aff-name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field id="aff-email" label="Email"><Input id="aff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogActions><Button type="submit">Add affiliate</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Details ---------- */
export function AffiliateDetails({ id }: { id: string }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const [remove, setRemove] = useState(false);
  const [suspend, setSuspend] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [rate, setRate] = useState("");
  const [rateErr, setRateErr] = useState("");
  const a = state.affiliates.find((x) => x.id === id);
  if (!a) return <CreatorNotFound what="affiliate" />;
  const setAff = (patch: Partial<Affiliate>, log: string) => update((s) => ({ affiliates: s.affiliates.map((x) => (x.id === id ? { ...x, ...patch } : x)), activity: [...s.activity, activityEntry(log)] }));
  const code = referralCode(a);
  const activePromos = a.status === "active" ? state.programs.filter((p) => p.status === "active").length : 0;
  return (
    <div>
      <PageHeader eyebrow="Affiliate" title={a.name} description={a.email} actions={
        <div className="flex flex-wrap gap-2">
          {a.status === "invited" && <Button variant="soft" onClick={() => { setAff({ status: "active" }, `Affiliate joined: ${a.name}`); toast.success(`${a.name} marked as active`); }}>Mark as accepted</Button>}
          {a.status === "suspended"
            ? <Button variant="soft" onClick={() => { setAff({ status: "active" }, `Affiliate reactivated: ${a.name}`); toast.success(`${a.name} reactivated`); }}><RotateCcw />Reactivate</Button>
            : <Button variant="outline" onClick={() => setSuspend(true)}><Ban />Suspend</Button>}
          <Button variant="ghost" className="text-destructive" onClick={() => setRemove(true)}><Trash2 />Remove</Button>
        </div>} />
      <section className="surface mb-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ice text-lg font-extrabold text-cobalt" aria-hidden="true">{initials(a.name)}</span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2"><AccountBadge status={a.status} /><span className="text-xs text-muted-foreground">Member since {shortDate(a.date)}</span></div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Referral code</span><code className="rounded bg-soft px-2 py-0.5 font-bold">{code}</code>
            <Button size="sm" variant="ghost" onClick={() => copyText(code)} aria-label="Copy referral code"><Copy /></Button>
          </div>
        </div>
        <div className="rounded-xl border p-3 text-sm sm:w-56">
          <p className="text-xs font-bold text-muted-foreground">Personal rate</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-extrabold">{a.rate != null ? `${a.rate}%` : "Not set"}{a.rate != null && <SourceBadge source="personal" />}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => { setRate(a.rate != null ? String(a.rate) : ""); setRateErr(""); setRateOpen(true); }}><Pencil />{a.rate != null ? "Change" : "Set rate"}</Button>
        </div>
      </section>
      <StatGroup title="Promotion">
        <Stat icon={Layers} label="Total affiliations" value={state.programs.length} hint="Products they can promote" />
        <Stat icon={Megaphone} label="Active promotions" value={activePromos} />
        <Stat icon={TrendingUp} label="Clicks" value="—" hint="Needs backend tracking" />
        <Stat icon={Receipt} label="Sales" value={0} />
      </StatGroup>
      <StatGroup title="Earnings">
        <Stat icon={TrendingUp} label="Revenue generated" value={naira(0)} />
        <Stat icon={BadgePercent} label="Commission earned" value={naira(0)} />
        <Stat icon={BadgePercent} label="Paid commission" value={naira(0)} />
        <Stat icon={BadgePercent} label="Pending commission" value={naira(0)} />
      </StatGroup>
      <Panel title="Product affiliations" description="The rate shown is the one that applies to this affiliate." bodyClassName="p-0">
        {state.programs.length ? (
          <ul className="divide-y">
            {state.programs.map((p) => {
              const item = state.items.find((i) => i.id === p.itemId); const r = resolveRate(state, p, a);
              return (
                <li key={p.id} className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[2fr_1.4fr_repeat(4,0.8fr)_1fr_auto] lg:items-center">
                  <span className="min-w-0"><span className="block truncate font-bold">{item?.title ?? "Unavailable product"}</span><span className="text-xs text-muted-foreground">{item ? categoryLabel(item.kind) : "—"} · Since {shortDate(p.date)}</span></span>
                  <span className="flex items-center gap-2"><b>{r.rate != null ? `${r.rate}%` : "—"}</b><SourceBadge source={r.source} /></span>
                  <dl className="col-span-full grid grid-cols-4 gap-2 text-xs lg:contents">
                    {[["Clicks", "—"], ["Sales", "0"], ["Revenue", naira(0)], ["Earned", naira(0)]].map(([k, v]) => <div key={k}><dt className="text-muted-foreground lg:sr-only">{k}</dt><dd className="font-bold tabular-nums">{v}</dd></div>)}
                  </dl>
                  <span>{a.status === "suspended" ? <span className="text-xs font-bold text-destructive">Blocked by account</span> : <PromotionBadge status={p.status} />}</span>
                  <Button asChild size="sm" variant="outline"><Link to="/creator/affiliations/$programId" params={{ programId: p.id }}>Manage</Link></Button>
                </li>
              );
            })}
          </ul>
        ) : <EmptyState icon={Megaphone} title="No product affiliations" description="Add products to Ongoing Promotions so this affiliate can promote them." compact />}
      </Panel>

      <Dialog open={rateOpen} onOpenChange={setRateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Personal commission rate</DialogTitle><DialogDescription>Overrides product and category rates for {a.name}. Leave blank to remove it.</DialogDescription></DialogHeader>
          <form className="space-y-4" noValidate onSubmit={(e) => {
            e.preventDefault();
            const err = categoryRateError(rate); if (err) return setRateErr(err);
            setAff({ rate: rate.trim() ? Number(rate) : undefined }, `Personal rate ${rate.trim() ? `set to ${rate}%` : "removed"}: ${a.name}`);
            setRateOpen(false); toast.success(rate.trim() ? `Personal rate saved: ${rate}%` : "Personal rate removed");
          }}>
            <Field id="aff-rate" label="Commission (%)"><div className="relative"><Input id="aff-rate" inputMode="decimal" value={rate} onChange={(e) => { setRate(e.target.value); setRateErr(""); }} placeholder="e.g. 25" className="pr-9" aria-invalid={!!rateErr} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span></div></Field>
            {rateErr && <p role="alert" className="text-sm text-destructive">{rateErr}</p>}
            <DialogActions><Button type="submit">Save rate</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={suspend} onOpenChange={setSuspend} art={brandArtwork.people} eyebrow="Affiliates" title={`Suspend ${a.name}?`} description="Their whole account is paused: none of their product promotions can earn until you reactivate them." confirmLabel="Suspend account" confirmIcon={<Ban />}
        onConfirm={() => { setAff({ status: "suspended" }, `Affiliate suspended: ${a.name}`); toast.success(`${a.name} suspended`); }}>
        <ConfirmNote>Each product's own promotion status stays as it is.</ConfirmNote>
      </ConfirmDialog>
      <ConfirmDialog open={remove} onOpenChange={setRemove} art={brandArtwork.people} eyebrow="Affiliates" title={`Remove ${a.name}?`} description="They will no longer be able to promote your products." confirmLabel="Remove affiliate" confirmIcon={<Trash2 />}
        onConfirm={() => { const { removed } = removeWhere(state.affiliates, (x) => x.id === id); update((s) => ({ affiliates: s.affiliates.filter((x) => x.id !== id) })); navigate({ to: "/creator/affiliates" }); if (removed) undoToast("Affiliate removed", () => update((s) => ({ affiliates: restoreAt(s.affiliates, removed, sameId) }))); }} />
    </div>
  );
}

/* ---------- Commission rules ---------- */
export function CommissionRules() {
  const { state, update } = useCreator();
  const [editing, setEditing] = useState<CommissionRule | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<CommissionRule | null>(null);
  const saved = (k: ItemKind) => (state.categoryRates[k] != null ? String(state.categoryRates[k]) : "");
  const [cats, setCats] = useState<Record<string, string>>(() => Object.fromEntries(COMMISSION_CATEGORIES.map((c) => [c.kind, saved(c.kind)])));
  const [clearOpen, setClearOpen] = useState(false);
  const errors = Object.fromEntries(COMMISSION_CATEGORIES.map((c) => [c.kind, categoryRateError(cats[c.kind] ?? "")]));
  const dirty = COMMISSION_CATEGORIES.some((c) => (cats[c.kind] ?? "") !== saved(c.kind));
  const blank = (): CommissionRule => ({ id: "", name: "", rate: 10, isDefault: !state.rules.length });
  const button = <Button onClick={() => { setError(""); setEditing(blank()); }}><Plus />Create rule</Button>;
  const overrides = state.affiliates.filter((a) => a.rate != null);
  return (
    <div>
      <PageHeader eyebrow="Affiliates" title="Commission rules" description="Decide what percentage of each sale affiliates earn." actions={button} />
      <AffiliateTabs />
      <section className="surface mb-5 p-5" aria-label="Which rate applies">
        <h2 className="mb-3 text-[15px] font-bold">Which rate applies</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {([["personal", "Personal affiliate rate", "Set on one affiliate. Always wins."], ["product", "Product-specific rate", "The rule attached to a product in your programme."], ["category", "Category default", "Your fallback for each product type."]] as const).map(([src, t, d], i) => (
            <li key={src} className="flex gap-3 rounded-xl border p-3.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cobalt text-sm font-extrabold text-primary-foreground">{i + 1}</span>
              <span className="min-w-0 space-y-1"><span className="block text-sm font-extrabold">{t}</span><span className="block text-[13px] text-muted-foreground">{d}</span><SourceBadge source={src} /></span>
            </li>
          ))}
        </ol>
      </section>

      <Panel title="Default rate per category" className="mb-5" description="Used when no personal or product rate applies. Leave blank for none.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COMMISSION_CATEGORIES.map((c) => (
            <div key={c.kind}>
              <Label htmlFor={`cat-${c.kind}`}>{c.label}</Label>
              <div className="relative mt-1.5"><Input id={`cat-${c.kind}`} inputMode="decimal" placeholder="—" value={cats[c.kind] ?? ""} onChange={(e) => setCats({ ...cats, [c.kind]: e.target.value })} className="pr-9" aria-invalid={!!errors[c.kind]} aria-describedby={errors[c.kind] ? `cat-${c.kind}-err` : undefined} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span></div>
              {errors[c.kind] && <p id={`cat-${c.kind}-err`} role="alert" className="mt-1 text-xs text-destructive">{errors[c.kind]}</p>}
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button variant="outline" disabled={!COMMISSION_CATEGORIES.some((c) => cats[c.kind])} onClick={() => setClearOpen(true)}>Clear all</Button>
          <Button disabled={!dirty || Object.values(errors).some(Boolean)} onClick={() => {
            const next = Object.fromEntries(COMMISSION_CATEGORIES.filter((c) => cats[c.kind]?.trim()).map((c) => [c.kind, Number(cats[c.kind])]));
            update((s) => ({ categoryRates: next, activity: [...s.activity, activityEntry("Category commission defaults saved")] }));
            toast.success("Category defaults saved");
          }}>Save defaults</Button>
        </div>
      </Panel>

      <Panel title="Product rates" className="mb-5" description="Rules you attach to products in your programme." bodyClassName="p-0">
        {state.rules.length ? (
          <ul className="divide-y">
            {state.rules.map((r) => {
              const used = state.programs.filter((p) => p.ruleId === r.id);
              return (
                <li key={r.id} className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center">
                  <span className="grid h-12 w-14 shrink-0 place-items-center rounded-xl bg-ice text-base font-extrabold text-cobalt">{r.rate}%</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-bold">{r.name}{r.isDefault && <span className="rounded bg-lime px-1.5 py-0.5 text-[11px] font-extrabold text-midnight">Default rule</span>}</span>
                    <span className="block truncate text-xs text-muted-foreground">{used.length ? used.map((p) => state.items.find((i) => i.id === p.itemId)?.title ?? "Unavailable").join(", ") : "Not attached to any product"}</span>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setError(""); setEditing(r); }}><Pencil />Edit</Button>
                    <Button size="sm" variant="ghost" aria-label={`Delete ${r.name}`} onClick={() => used.length ? toast.error(`${r.name} is used by ${used.length} product${used.length === 1 ? "" : "s"}. Move them to another rule first.`) : setDeleting(r)}><Trash2 /></Button>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <EmptyState icon={ListChecks} title="No commission rules yet" description="Create a rule to set how much affiliates earn when they refer a sale." action={button} compact />}
      </Panel>

      <Panel title="Affiliate promotion rates" description="The rate each affiliate earns, and where it comes from." bodyClassName="p-0">
        {overrides.length || state.programs.length ? (
          <ul className="divide-y">
            {state.affiliates.flatMap((a) => state.programs.map((p) => ({ a, p }))).filter(({ a }) => a.rate != null).concat(state.programs.map((p) => ({ a: null as unknown as Affiliate, p }))).map(({ a, p }) => {
              const item = state.items.find((i) => i.id === p.itemId); const r = resolveRate(state, p, a);
              return (
                <li key={`${a?.id ?? "all"}-${p.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                  <span className="min-w-0 flex-1"><span className="block truncate font-bold">{a ? a.name : "All affiliates"}</span><span className="block truncate text-xs text-muted-foreground">{item?.title ?? "Unavailable product"}</span></span>
                  <b className="tabular-nums">{r.rate != null ? `${r.rate}%` : "—"}</b><SourceBadge source={r.source} />
                </li>
              );
            })}
          </ul>
        ) : <EmptyState icon={BadgePercent} title="Nothing to show yet" description="Rates appear once you add products to your programme." compact />}
      </Panel>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit rule" : "Create rule"}</DialogTitle><DialogDescription>You choose the rate. Enski doesn't set it for you.</DialogDescription></DialogHeader>
          {editing && (
            <form className="space-y-4" noValidate onSubmit={(e) => {
              e.preventDefault();
              const rule = { ...editing, id: editing.id || crypto.randomUUID(), name: editing.name.trim() };
              const err = validateRule(rule, state.rules); if (err) return setError(err);
              update((s) => ({ rules: saveRule(s.rules, rule), activity: [...s.activity, activityEntry(`Commission rule saved: ${rule.name}`)] }));
              setEditing(null); toast.success(`Rule saved: ${rule.name} · ${rule.rate}%`);
            }}>
              <Field id="rule-name" label="Rule name"><Input id="rule-name" value={editing.name} maxLength={80} placeholder="e.g. Standard" onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field id="rule-rate" label="Commission (%)"><div className="relative"><Input id="rule-rate" type="number" min="1" max="90" step="0.5" value={Number.isNaN(editing.rate) ? "" : editing.rate} onChange={(e) => setEditing({ ...editing, rate: Number(e.target.value) })} className="pr-9" /><span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span></div></Field>
              <p className="text-xs text-muted-foreground">Between 1% and 90%.</p>
              <div className="flex items-center justify-between gap-4"><Label htmlFor="rule-default">Use as default rule</Label><Switch id="rule-default" checked={editing.isDefault} onCheckedChange={(v) => setEditing({ ...editing, isDefault: v })} /></div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <DialogActions><Button type="submit">Save rule</Button></DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)} art={brandArtwork.affiliations} eyebrow="Commission rules" title={`Delete ${deleting?.name ?? "rule"}?`} description="It isn't attached to any product." confirmLabel="Delete rule" confirmIcon={<Trash2 />}
        onConfirm={() => { const r = deleting; if (!r) return; const { removed } = removeWhere(state.rules, (x) => x.id === r.id); update((s) => ({ rules: s.rules.filter((x) => x.id !== r.id) })); if (removed) undoToast(`Rule "${r.name}" deleted`, () => update((s) => ({ rules: restoreAt(s.rules, removed, sameId) }))); }} />
      <ConfirmDialog open={clearOpen} onOpenChange={setClearOpen} art={brandArtwork.affiliations} eyebrow="Commission rules" title="Clear every category default?" description="Products without a personal or product rate will have no commission set." confirmLabel="Clear defaults" confirmIcon={<ArrowDownUp />}
        onConfirm={() => { setCats(Object.fromEntries(COMMISSION_CATEGORIES.map((c) => [c.kind, ""]))); update((s) => ({ categoryRates: {}, activity: [...s.activity, activityEntry("Category commission defaults cleared")] })); toast.success("Category defaults cleared"); }} />
    </div>
  );
}
