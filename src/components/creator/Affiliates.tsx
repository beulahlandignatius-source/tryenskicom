import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { removeWhere, restoreAt, sameId } from "@/lib/shared/listUndo";
import { undoToast } from "@/lib/shared/undo";
import { Link, useNavigate } from "@tanstack/react-router";
import { SectionNavDropdown } from "@/components/shared/SectionDropdown";
import { PageTopRight } from "@/components/shared/BackBar";
import { useState } from "react";
import { Check, Users, UserPlus, Megaphone, ListChecks, Plus, Pencil, Trash2, Receipt, Copy } from "lucide-react";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { GlassStat } from "./products/ProductChrome";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Switch } from "@/components/dashboard-ui/switch";
import { Label } from "@/components/dashboard-ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { PageHeader, Panel, EmptyState, SearchInput, FilterSelect } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { isEmail, saveRule, validateRule, type CommissionRule } from "@/lib/creator/rules";
import { CreatorNotFound, ItemLink, ItemStatus, copyText, shortDate } from "./shared";
export function AffiliateTabs() {
  const { state } = useCreator();
  const active = state.affiliates.filter((a) => a.status === "active").length;
  const invited = state.affiliates.length - active;
  const live = state.programs.filter((p) => p.status === "active").length;
  const def = state.rules.find((r) => r.isDefault);
  const steps = [
    { done: state.rules.length > 0, title: "Set a commission rule", text: "Decide what affiliates earn per sale.", to: "/creator/commission-rules" as const },
    { done: state.programs.length > 0, title: "Add a product to promote", text: "Choose published products for your programme.", to: "/creator/affiliations" as const },
    { done: state.affiliates.length > 0, title: "Invite affiliates", text: "People who'll share your products.", to: "/creator/affiliates" as const },
  ];
  const tabs = [
    { to: "/creator/affiliates" as const, label: "Affiliates", icon: Users, n: state.affiliates.length, exact: true },
    { to: "/creator/affiliations" as const, label: "Ongoing Promotions", icon: Megaphone, n: state.programs.length, exact: true },
    { to: "/creator/affiliations/sales" as const, label: "Affiliate Sales", icon: Receipt, n: undefined, exact: false },
    { to: "/creator/commission-rules" as const, label: "Commission Rules", icon: ListChecks, n: state.rules.length, exact: false },
  ];
  return (
    <>
      <section data-surface="dark" className="bg-brand-panel relative mb-5 overflow-hidden rounded-[24px] p-5 text-on-dark sm:p-6" aria-label="Affiliate programme">
        <span className="hero-dots" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-center gap-4 lg:w-72">
            <BrandIcon src={brandArtwork.affiliations} className="product-hero-art h-16 w-16 shrink-0" />
            <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.14em] text-lime">Affiliate programme</p><p className="mt-1 text-lg font-extrabold leading-tight">{live ? `${live} product${live === 1 ? "" : "s"} being promoted` : "Grow with affiliates"}</p></div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
            <GlassStat label="Active affiliates" value={active} hint={invited ? `${invited} invited` : undefined} />
            <GlassStat label="Live promotions" value={live} hint={state.programs.length - live ? `${state.programs.length - live} paused` : undefined} />
            <GlassStat label="Affiliate sales" value={0} />
            <GlassStat label="Default commission" value={def ? `${def.rate}%` : "—"} hint={def ? def.name : "Not set"} />
          </div>
        </div>
      </section>
      {!steps.every((x) => x.done) && (
        <ol className="mb-5 grid gap-3 sm:grid-cols-3" aria-label="Set up your programme">
          {steps.map((x, i) => (
            <li key={x.title}>
              <Link to={x.to} className={cn("surface group flex h-full items-start gap-3 p-4 transition-colors hover:border-cobalt-100", x.done && "border-success/30 bg-success-soft/40")}>
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold", x.done ? "bg-success text-primary-foreground" : "bg-ice text-cobalt")}>{x.done ? <Check className="h-4 w-4" /> : i + 1}</span>
                <span className="min-w-0"><span className="block text-sm font-extrabold group-hover:text-cobalt">{x.title}</span><span className="block text-[13px] text-muted-foreground">{x.text}</span></span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      <PageTopRight><SectionNavDropdown compact heading="Affiliate section" links={tabs.map((t) => ({ to: t.to, label: t.label, icon: t.icon, count: t.n, exact: t.exact }))} className="min-w-0 max-w-full" /></PageTopRight>
      <nav aria-label="Affiliate sections" className="mb-6 hidden md:block">
        <ul className="inline-flex max-w-full flex-wrap gap-1 rounded-[22px] border bg-card p-1">
          {tabs.map((t) => (
            <li key={t.to}>
              <Link to={t.to} activeOptions={{ exact: t.exact }} className="lime-pip group flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-bold text-muted-foreground transition-colors hover:bg-ice hover:text-cobalt data-[status=active]:bg-cobalt data-[status=active]:text-primary-foreground">
                <t.icon className="h-4 w-4" />{t.label}
                {t.n !== undefined && <span className="chip-count rounded-full bg-soft px-1.5 text-[11px] font-extrabold text-muted-foreground group-data-[status=active]:bg-on-dark/20 group-data-[status=active]:text-primary-foreground">{t.n}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
export function OngoingPromotions() {
  const { state, update } = useCreator();
  const [add, setAdd] = useState(false);
  const eligible = state.items.filter((i) => i.status === "published" && !state.programs.some((p) => p.itemId === i.id));
  const [itemId, setItemId] = useState("");
  const [ruleId, setRuleId] = useState("");
  const open = () => {
    setItemId(eligible[0]?.id ?? "");
    setRuleId(state.rules.find((r) => r.isDefault)?.id ?? state.rules[0]?.id ?? "");
    setAdd(true);
  };
  const button = (
    <Button onClick={open}>
      <Plus />
      Add product
    </Button>
  );
  return (
    <div>
      <PageHeader eyebrow="Affiliates" title="Ongoing promotions" description="Products affiliates can promote, and the commission each one earns." actions={button} />
      <AffiliateTabs />
      <Panel title="Products in your affiliate programme">
        <div className="divide-y">
          {state.programs.map((p) => {
            const item = state.items.find((i) => i.id === p.itemId);
            const rule = state.rules.find((r) => r.id === p.ruleId);
            return (
              <Link
                key={p.id}
                to="/creator/affiliations/$programId"
                params={{ programId: p.id }}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm hover:bg-soft"
              >
                <div className="min-w-0">
                  <p className="font-bold">{item?.title ?? "Unavailable product"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{rule ? `${rule.name} · ${rule.rate}% commission` : "No commission rule"}</p>
                </div>
                <ItemStatus status={p.status} />
              </Link>
            );
          })}
        </div>
        {!state.programs.length && (
          <EmptyState icon={Megaphone} title="No ongoing promotions" description="Add a published product so affiliates can start promoting it." action={button} compact />
        )}
      </Panel>
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add product to affiliate programme</DialogTitle>
            <DialogDescription>Choose a published product and the commission rule affiliates earn.</DialogDescription>
          </DialogHeader>
          {!eligible.length ? (
            <p className="text-sm text-muted-foreground">
              Publish a product first. Products already in the programme aren't listed.
            </p>
          ) : !state.rules.length ? (
            <div>
              <p className="text-sm text-muted-foreground">Create a commission rule first.</p>
              <Button asChild className="mt-4" onClick={() => setAdd(false)}>
                <Link to="/creator/commission-rules">Create commission rule</Link>
              </Button>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const item = eligible.find((i) => i.id === itemId);
                if (!item || !state.rules.some((r) => r.id === ruleId)) return void toast.error("Choose a product and rule.");
                update((s) => ({
                  programs: [...s.programs, { id: crypto.randomUUID(), itemId, ruleId, status: "active", date: new Date().toISOString() }],
                  activity: [...s.activity, activityEntry(`Added to affiliate programme: ${item.title}`)],
                }));
                setAdd(false);
                toast.success("Product added to Ongoing Promotions");
              }}
            >
              <Label>Product</Label>
              <FilterSelect label="Product" value={itemId} onChange={setItemId} className="w-full sm:w-full" options={eligible.map((i) => [i.id, i.title] as [string, string])} />
              <Label>Commission rule</Label>
              <FilterSelect label="Commission rule" value={ruleId} onChange={setRuleId} className="w-full sm:w-full" options={state.rules.map((r) => [r.id, `${r.name} · ${r.rate}%`] as [string, string])} />
              <DialogActions><Button type="submit">Add product</Button></DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function ProgramDetails({ id }: { id: string }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const p = state.programs.find((x) => x.id === id);
  if (!p) return <CreatorNotFound what="programme" />;
  const item = state.items.find((i) => i.id === p.itemId);
  const rule = state.rules.find((r) => r.id === p.ruleId);
  const link = item && state.storefront.handle ? `https://tryenski.com/${state.storefront.handle}/${item.id}` : "";
  return (
    <div>
      <PageHeader
        eyebrow="Ongoing promotion"
        title={item?.title ?? "Unavailable product"}
        actions={
          <Button
            onClick={() => {
              const status = p.status === "active" ? "paused" : "active";
              update((s) => ({ programs: s.programs.map((x) => (x.id === id ? { ...x, status } : x)) }));
              toast.success(status === "active" ? "Promotion resumed" : "Promotion paused");
            }}
          >
            {p.status === "active" ? "Pause" : "Resume"}
          </Button>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Details">
          <ItemStatus status={p.status} />
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Commission</dt>
              <dd className="font-bold">{rule ? `${rule.rate}% · ${rule.name}` : "No rule"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Since</dt>
              <dd className="font-bold">{shortDate(p.date)}</dd>
            </div>
          </dl>
          {rule && state.rules.length > 1 && (
            <div className="mt-5 space-y-2 border-t pt-5">
              <Label>Change rule</Label>
              <FilterSelect label="Change rule"
                value={p.ruleId}
                onChange={(v) => {
                  update((s) => ({ programs: s.programs.map((x) => (x.id === id ? { ...x, ruleId: v } : x)) }));
                  toast.success("Commission rule updated");
                }}
                className="w-full sm:w-full"
                options={state.rules.map((r) => [r.id, `${r.name} · ${r.rate}%`] as [string, string])}
              />
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">
            {item && (
              <Button asChild variant="outline">
                <ItemLink item={item}>View product</ItemLink>
              </Button>
            )}
            {link ? (
              <Button variant="outline" onClick={() => copyText(link)}>
                <Copy />
                Copy product link
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link to="/creator/storefront">Set a store handle to share links</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 />
              Remove
            </Button>
          </div>
        </Panel>
        <Panel title="Affiliate sales">
          <EmptyState icon={Receipt} title="No affiliate sales yet" description="Sales affiliates refer for this product will appear here." compact />
        </Panel>
      </div>
      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        art={brandArtwork.affiliations}
        eyebrow="Affiliate programme"
        title="Remove this product from your programme?"
        description={`Affiliates will stop earning on new sales of ${item?.title ?? "this product"}.`}
        confirmLabel="Remove product"
        confirmIcon={<Trash2 />}
        onConfirm={() => {
          const { removed } = removeWhere(state.programs, (x) => x.id === id);
          update((s) => ({ programs: s.programs.filter((x) => x.id !== id) }));
          navigate({ to: "/creator/affiliations" });
          if (removed) undoToast("Removed from affiliate programme", () => update((s) => ({ programs: restoreAt(s.programs, removed, sameId) })));
        }}
      >
        <ConfirmNote>Commissions already earned stay in their history.</ConfirmNote>
      </ConfirmDialog>
    </div>
  );
}
export function AffiliateSales() {
  return (
    <div>
      <PageHeader eyebrow="Affiliates" title="Affiliate sales" description="Sales your affiliates have referred." />
      <AffiliateTabs />
      <Panel>
        <EmptyState icon={Receipt} title="No affiliate sales yet" description="When an affiliate refers a sale, it will appear here with their commission." />
      </Panel>
    </div>
  );
}
export { AffiliatesPage, AffiliateDetails, CommissionRules } from "./AffiliateViews";
