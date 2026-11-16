import { findEvent, findResource, isPast, publishedEvents, resources, type LearnerEvent, type LearnerResource } from "./catalog";
import type { LearnerState } from "./rules";
import { creatorSessionOffers, learnerSessionBooking } from "@/lib/creator/publicStore";

/** Upcoming-events categories. Gigs have no listings yet, so that tab shows its empty state. */
export type EventCategory = "all" | "live" | "coaching" | "gigs";
export type Listing =
  | { kind: "live"; id: string; event: LearnerEvent }
  | { kind: "coaching"; id: string; resource: LearnerResource }
  | { kind: "creator-session"; id: string; offer: import("@/lib/creator/publicStore").PublicSessionOffer };

export function upcomingListings(cat: EventCategory, now = Date.now()): Listing[] {
  const live: Listing[] = publishedEvents.filter((e) => !isPast(e, now)).sort((a, b) => a.start.localeCompare(b.start)).map((e) => ({ kind: "live", id: e.id, event: e }));
  const coaching: Listing[] = resources.filter((r) => r.type === "Coaching").map((r) => ({ kind: "coaching", id: r.id, resource: r }));
  const creatorSessions: Listing[] = typeof window === "undefined" ? [] : creatorSessionOffers().filter((offer) => offer.item.kind === "coaching" || (offer.item.date && Date.parse(offer.item.date) >= now)).map((offer) => ({ kind: "creator-session", id: `${offer.handle}:${offer.item.id}`, offer }));
  if (cat === "live") return [...live, ...creatorSessions.filter((entry) => entry.kind === "creator-session" && entry.offer.item.kind === "live")].sort((a, b) => listingDate(a).localeCompare(listingDate(b)));
  if (cat === "coaching") return [...coaching, ...creatorSessions.filter((entry) => entry.kind === "creator-session" && entry.offer.item.kind === "coaching")];
  if (cat === "gigs") return [];
  return [...live, ...coaching, ...creatorSessions].sort((a, b) => listingDate(a).localeCompare(listingDate(b)));
}

function listingDate(listing: Listing) {
  if (listing.kind === "live") return listing.event.start;
  if (listing.kind === "creator-session") return listing.offer.item.date || "9999";
  return "9999";
}

export type BookingStatus = "confirmed" | "awaiting" | "attended" | "ended" | "cancelled" | "requested";
export type Booking = {
  id: string;
  kind: "coaching" | "live";
  title: string;
  host: string;
  image: string;
  /** ISO start; coaching sessions are scheduled with the coach after booking, so may have none. */
  when: string | null;
  status: BookingStatus;
  when_past: boolean;
  href: { to: "/learner/events/$eventId"; params: { eventId: string } } | { to: "/learner/resources/$resourceId"; params: { resourceId: string } };
  reference?: string | undefined;
  /** Only free registrations not yet attended can be cancelled. */
  cancellable: boolean;
  online: boolean;
  meetingLink?: string;
  creatorHandle?: string;
};

/** Bookings come only from the learner's own paid coaching purchases and event registrations. */
export function learnerBookings(s: Pick<LearnerState, "purchases" | "registrations" | "coachingAppointments" | "creatorSessionBookings">, now = Date.now()): Booking[] {
  const out: Booking[] = [];
  const seen = new Set<string>();
  for (const p of s.purchases) {
    if (p.status !== "paid") continue;
    for (const i of p.items) {
      if (i.kind !== "resource" || seen.has(i.id)) continue;
      const r = findResource(i.id);
      if (!r || r.type !== "Coaching") continue;
      seen.add(i.id);
      out.push({ id: `c-${i.id}`, kind: "coaching", title: r.title, host: r.creator, image: r.image, when: null, status: "awaiting", when_past: false, href: { to: "/learner/resources/$resourceId", params: { resourceId: r.id } }, reference: p.orderNumber, cancellable: false, online: true });
    }
  }
  for (const appointment of s.coachingAppointments) {
    const resource = findResource(appointment.resourceId);
    if (!resource || resource.type !== "Coaching") continue;
    const past = Date.parse(appointment.scheduledAt) < now;
    out.push({ id: appointment.id, kind: "coaching", title: resource.title, host: resource.creator, image: resource.image, when: appointment.scheduledAt, status: appointment.status === "cancelled" ? "cancelled" : appointment.status === "completed" || past ? "ended" : "confirmed", when_past: past, href: { to: "/learner/resources/$resourceId", params: { resourceId: resource.id } }, cancellable: appointment.status === "confirmed" && !past, online: true });
  }
  for (const ownedSession of s.creatorSessionBookings) {
    const current = learnerSessionBooking(ownedSession.creatorHandle, ownedSession.id) ?? ownedSession;
    const past = Date.parse(current.scheduledAt) < now;
    out.push({ id: ownedSession.id, kind: ownedSession.kind, title: ownedSession.itemTitle, host: ownedSession.creatorName, image: ownedSession.image, when: current.scheduledAt, status: current.status === "cancelled" ? "cancelled" : current.status === "attended" ? "attended" : current.status === "completed" || current.status === "no_show" || past ? "ended" : current.status === "requested" ? "requested" : "confirmed", when_past: past, href: { to: "/learner/sessions/$handle/$itemId", params: { handle: ownedSession.creatorHandle, itemId: ownedSession.itemId } } as Booking["href"], reference: ownedSession.id.slice(0, 8).toUpperCase(), cancellable: (current.status === "requested" || current.status === "confirmed") && !past, online: ownedSession.online, meetingLink: ownedSession.meetingLink, creatorHandle: ownedSession.creatorHandle });
  }
  for (const reg of s.registrations) {
    const e = findEvent(reg.eventId);
    if (!e) continue;
    const past = isPast(e, now);
    out.push({ id: `e-${e.id}`, kind: "live", title: e.title, host: e.host, image: e.image, when: e.start, status: reg.cancelledAt ? "cancelled" : reg.attendedAt ? "attended" : past ? "ended" : "confirmed", when_past: past || !!reg.attendedAt || !!reg.cancelledAt, href: { to: "/learner/events/$eventId", params: { eventId: e.id } }, reference: reg.reference, cancellable: !reg.cancelledAt && e.price === 0 && !reg.attendedAt && !past, online: e.mode === "Online" });
  }
  return out.sort((a, b) => (a.when ?? "9").localeCompare(b.when ?? "9"));
}
