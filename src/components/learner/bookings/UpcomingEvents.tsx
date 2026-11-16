import { Link } from "@tanstack/react-router";
import { Briefcase, CalendarDays, MonitorPlay, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, PageHeader, Panel } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { naira } from "@/lib/affiliate/products";
import { upcomingListings, type EventCategory } from "@/lib/learner/bookings";
import { creatorSessionOffers, type PublicSessionOffer } from "@/lib/creator/publicStore";
import { EventCard } from "../shared";

const CATS: { id: EventCategory; label: string }[] = [
  { id: "all", label: "All" }, { id: "live", label: "Live" }, { id: "coaching", label: "Coaching" }, { id: "gigs", label: "Gigs" },
];
const EMPTY = {
  all: { icon: CalendarDays, title: "No upcoming events", text: "New live sessions and coaching will appear here." },
  live: { icon: MonitorPlay, title: "No live sessions yet", text: "Check back soon, or browse coaching while you wait." },
  coaching: { icon: UsersRound, title: "No coaching available", text: "Coaches will list one-to-one sessions here." },
  gigs: { icon: Briefcase, title: "No gigs yet", text: "Paid gigs from creators will show here once they open." },
} as const;

export function UpcomingEventsPage() {
  const [cat, setCat] = useState<EventCategory>("all");
  const [offers, setOffers] = useState<PublicSessionOffer[]>([]);
  useEffect(() => { setOffers(creatorSessionOffers()); }, []);
  const list = useMemo(() => upcomingListings(cat, Date.now(), offers), [cat, offers]);
  const empty = EMPTY[cat];
  return (
    <div className="min-w-0">
      <PageHeader eyebrow="Events" title="Upcoming events" description="Your live sessions, coaching, and upcoming gigs." actions={<Button asChild variant="outline"><Link to="/learner/bookings">My bookings</Link></Button>} />
      <Tabs value={cat} onValueChange={(v) => setCat(v as EventCategory)}>
        <TabsList className="mb-5 w-full justify-start overflow-x-auto sm:w-auto">
          {CATS.map((c) => <TabsTrigger key={c.id} value={c.id}>{c.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      {list.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {list.map((l) => l.kind === "live" ? <EventCard key={l.id} e={l.event} /> : l.kind === "creator-session" ? (
            <article key={l.id} className="surface group relative flex min-w-0 flex-col overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden bg-ice">{l.offer.item.image ? <img src={l.offer.item.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-cobalt"><UsersRound className="h-10 w-10" /></div>}</div>
              <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-sky-text">{l.offer.item.kind === "coaching" ? l.offer.format === "group" ? "Group coaching" : "1:1 coaching" : "Live session"} · {l.offer.item.category}</p>
                <h3 className="line-clamp-2 text-sm font-bold leading-snug sm:text-[15px]">
                  <Link to="/learner/session" search={{ handle: l.offer.handle, itemId: l.offer.item.id, kind: l.offer.item.kind }} className="after:absolute after:inset-0 focus-visible:outline-none">{l.offer.item.title}</Link>
                </h3>
                <p className="truncate text-xs text-muted-foreground">{l.offer.owner} · {l.offer.durationMinutes} minutes</p>
                {l.offer.item.kind === "live" && l.offer.item.date && <p className="text-xs font-semibold text-muted-foreground">{new Date(l.offer.item.date).toLocaleString()}</p>}
                <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-line pt-2.5">
                  <span className="text-base font-extrabold tabular-nums text-brand">{l.offer.price ? naira(l.offer.price) : "Free"}</span>
                  <span className="text-xs font-bold text-cobalt">{l.offer.item.kind === "coaching" ? "Choose a time" : "View session"}</span>
                </div>
              </div>
            </article>
          ) : (
            <article key={l.id} className="surface group relative flex min-w-0 flex-col overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden bg-ice"><img src={l.resource.image} alt={l.resource.imageAlt} loading="lazy" className="h-full w-full object-cover" /></div>
              <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-sky-text">Coaching · {l.resource.category}</p>
                <h3 className="line-clamp-2 text-sm font-bold leading-snug sm:text-[15px]">
                  <Link to="/learner/resources/$resourceId" params={{ resourceId: l.id }} className="after:absolute after:inset-0 focus-visible:outline-none">{l.resource.title}</Link>
                </h3>
                <p className="truncate text-xs text-muted-foreground">{l.resource.creator}</p>
                <p className="line-clamp-2 hidden text-xs text-muted-foreground sm:block">{l.resource.description}</p>
                <p className="text-xs font-semibold text-muted-foreground">Time agreed with your coach after booking</p>
                <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-line pt-2.5">
                  <span className="text-base font-extrabold tabular-nums text-brand">{l.resource.price ? naira(l.resource.price) : "Free"}</span>
                  <span className="text-xs font-bold text-cobalt">Book</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Panel>
          <EmptyState icon={empty.icon} title={empty.title} description={empty.text} action={cat !== "all" ? <Button variant="outline" onClick={() => setCat("all")}>See all events</Button> : <Button asChild variant="outline"><Link to="/learner/events">Browse events</Link></Button>} />
        </Panel>
      )}
    </div>
  );
}
