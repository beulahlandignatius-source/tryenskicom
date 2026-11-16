import { COVER_PHOTOS } from "@/components/dreamverse/coverPhotos";
import type { PaymentRecord } from "@/lib/shop/payments";
import type { ShopItem } from "@/lib/shop/types";
import { STORAGE_KEY } from "./data";
import { stateSchema, type CreatorItem, type CreatorState } from "./rules";
import { coachingOf, coachingSlots, liveOf } from "./products";
import { SAMPLE_CREATOR, SAMPLE_HANDLE, sampleItems, samplePage, withSamplePage } from "./sampleStore";

/**
 * Public storefronts for creators who signed up on this device: their published
 * products, bought through the sitewide checkout. A successful payment is recorded
 * as a sale in that creator's own saved dashboard. Browser-only.
 */
export type PublicStore = {
  key: string;
  handle: string;
  name: string;
  tagline: string;
  about: string;
  banner: string;
  photo: string;
  owner: string;
  items: CreatorItem[];
  page: CreatorState["storePage"];
  verified: boolean;
  bio: string;
  /** Optional credibility details (years of experience, location, expertise, languages, credentials). */
  details?: { experienceYears: number | null; location: string; expertise: string; languages: string; credentials: string };
  /** Sample page shown to everyone, or a creator's preview with sample products switched on. */
  sample?: boolean;
  /** True when the creator hasn't made the page visible yet (only reachable as a preview). */
  hidden?: boolean;
};

export type PublicSessionOffer = {
  handle: string;
  owner: string;
  storeName: string;
  item: CreatorItem;
  durationMinutes: number;
  venue: string;
  price: number;
  format: "one_to_one" | "group" | "live";
};

export type PublicSessionBooking = CreatorState["sessionBookings"][number];

const PAGE_DEFAULT = stateSchema.shape.storePage.parse(undefined);

/** Visible items in the creator's chosen order (unlisted ones keep their saved order at the end). */
export function orderedItems(items: CreatorItem[], page: Pick<CreatorState["storePage"], "order" | "hiddenIds">): CreatorItem[] {
  const rank = (id: string) => { const i = page.order.indexOf(id); return i === -1 ? Number.MAX_SAFE_INTEGER : i; };
  return items.filter((i) => !page.hiddenIds.includes(i.id)).map((it, n) => ({ it, n })).sort((a, b) => rank(a.it.id) - rank(b.it.id) || a.n - b.n).map((x) => x.it);
}

/** Same words as the Manage Products menu. */
export const TYPE_LABEL: Record<CreatorItem["kind"], string> = { course: "Course", ebook: "Digital Download", live: "Live Session", service: "Service", coaching: "Coaching" };
export const TYPE_PLURAL: Record<CreatorItem["kind"], string> = { course: "Courses", ebook: "Digital Downloads", live: "Live Sessions", service: "Services", coaching: "Coaching" };
const PREFIX = `${STORAGE_KEY}:`;

function readAll(includeHidden = false): PublicStore[] {
  if (typeof window === "undefined") return [];
  const out: PublicStore[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    try {
      const s = JSON.parse(localStorage.getItem(key) ?? "null") as Partial<CreatorState> | null;
      const f = s?.storefront;
      if (!f?.handle || (!f.published && !includeHidden)) continue;
      out.push({
        key,
        handle: f.handle.toLowerCase(),
        name: f.name,
        tagline: f.tagline,
        about: f.about,
        banner: f.banner ?? "",
        photo: s?.profile?.photo ?? "",
        owner: [s?.profile?.firstName, s?.profile?.lastName].filter(Boolean).join(" ") || f.name,
        items: (s?.items ?? []).filter((it) => it.status === "published" && !it.binnedAt),
        page: stateSchema.shape.storePage.safeParse(s?.storePage).data ?? PAGE_DEFAULT,
        verified: s?.verification === "submitted",
        bio: s?.profile?.bio ?? "",
        details: { experienceYears: typeof f.experienceYears === "number" ? f.experienceYears : null, location: f.location ?? "", expertise: f.expertise ?? "", languages: f.languages ?? "", credentials: f.credentials ?? "" },
        hidden: !f.published,
      });
    } catch {
      /* unreadable record: skip */
    }
  }
  return out;
}

function readCreatorRecord(handle: string) {
  if (typeof window === "undefined") return null;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    try {
      const parsed = stateSchema.safeParse(JSON.parse(localStorage.getItem(key) ?? "null"));
      if (parsed.success && parsed.data.storefront.handle.toLowerCase() === handle.toLowerCase()) return { key, state: parsed.data };
    } catch {
      /* Ignore an unreadable creator record. */
    }
  }
  return null;
}

const publishCreatorUpdate = (key: string) => window.dispatchEvent(new CustomEvent("enski:creator-store-updated", { detail: key }));

/** Published coaching and live offers from creator storefronts saved on this device. */
export function creatorSessionOffers(): PublicSessionOffer[] {
  return readAll().flatMap((store) => store.items
    .filter((item) => (item.kind === "coaching" || item.kind === "live") && item.status === "published")
    .map((item) => {
      const coaching = coachingOf(item);
      const live = liveOf(item);
      return {
        handle: store.handle,
        owner: store.owner,
        storeName: store.name,
        item,
        durationMinutes: item.kind === "coaching" ? item.duration : live.durationMins,
        venue: item.kind === "coaching" ? coaching.location : live.venue,
        price: item.price,
        format: item.kind === "coaching" ? coaching.format : "live",
      };
    }));
}

/** Available local demo appointments for one creator's coaching offer. */
export function creatorCoachingSlots(handle: string, itemId: string, now = new Date()) {
  const record = readCreatorRecord(handle);
  const item = record?.state.items.find((candidate) => candidate.id === itemId && candidate.kind === "coaching" && candidate.status === "published");
  if (!record || !item) return [];
  const coaching = coachingOf(item);
  const booked = record.state.sessionBookings.filter((booking) => booking.itemId === itemId && booking.kind === "coaching" && booking.status === "confirmed").map((booking) => booking.scheduledAt);
  const slots = coachingSlots(record.state.availability.days, record.state.availability.buffer, item.duration, coaching, booked, now, 30);
  if (coaching.format === "one_to_one") return slots;
  return slots.filter((slot) => record.state.sessionBookings.filter((booking) => booking.itemId === itemId && booking.scheduledAt === slot && booking.status !== "cancelled").length < coaching.groupSize);
}

/** Save a learner's simulated reservation to the matching creator account. */
export function reserveCreatorSession(handle: string, itemId: string, learner: { name: string; email: string }, scheduledAt: string, now = Date.now()): PublicSessionBooking | null {
  const record = readCreatorRecord(handle);
  const item = record?.state.items.find((candidate) => candidate.id === itemId);
  if (!record || !item || item.status !== "published" || (item.kind !== "coaching" && item.kind !== "live") || !learner.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(learner.email.trim())) return null;
  if (Date.parse(scheduledAt) <= now) return null;
  if (item.kind === "coaching" && !creatorCoachingSlots(handle, itemId, new Date(now)).includes(scheduledAt)) return null;
  if (item.kind === "live") {
    if (item.date && Date.parse(item.date) !== Date.parse(scheduledAt)) return null;
    const occupied = record.state.sessionBookings.filter((booking) => booking.itemId === itemId && booking.status !== "cancelled").length;
    const sold = record.state.orders.filter((order) => order.itemId === itemId && order.status === "paid").length;
    if (occupied + sold >= item.capacity) return null;
  }
  const booking: PublicSessionBooking = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `session-${now}`,
    itemId,
    kind: item.kind,
    learnerName: learner.name.trim(),
    learnerEmail: learner.email.trim().toLowerCase(),
    scheduledAt,
    createdAt: new Date(now).toISOString(),
    status: "requested",
    itemTitle: item.title,
    creatorName: record.state.storefront.name || record.state.profile.firstName || "Creator",
    image: item.image,
    online: item.kind === "live" ? liveOf(item).venue === "online" : coachingOf(item).location === "video",
    meetingLink: item.kind === "live" ? liveOf(item).link : coachingOf(item).meetingLink,
  };
  const customers = record.state.customers.some((customer) => customer.email.toLowerCase() === booking.learnerEmail)
    ? record.state.customers
    : [...record.state.customers, { id: `session-${booking.id}`, name: booking.learnerName, email: booking.learnerEmail, source: "manual" as const, date: booking.createdAt }];
  try {
    localStorage.setItem(record.key, JSON.stringify({ ...record.state, customers, sessionBookings: [booking, ...record.state.sessionBookings] }));
    publishCreatorUpdate(record.key);
    return booking;
  } catch {
    return null;
  }
}

/** Keep learner actions and creator management in sync without calling a service. */
export function updateCreatorSessionBooking(handle: string, id: string, patch: Partial<PublicSessionBooking>): boolean {
  const record = readCreatorRecord(handle);
  if (!record || !record.state.sessionBookings.some((booking) => booking.id === id)) return false;
  try {
    localStorage.setItem(record.key, JSON.stringify({
      ...record.state,
      sessionBookings: record.state.sessionBookings.map((booking) => booking.id === id ? { ...booking, ...patch } : booking),
    }));
    publishCreatorUpdate(record.key);
    return true;
  } catch {
    return false;
  }
}

export function creatorBookingStatus(handle: string, id: string) {
  return readCreatorRecord(handle)?.state.sessionBookings.find((booking) => booking.id === id) ?? null;
}

/** The sample creator page: opens in any browser so a storefront link can always be tried. */
export function sampleStore(): PublicStore {
  return { key: "sample", ...SAMPLE_CREATOR, items: sampleItems(), page: samplePage(), verified: true, bio: "", sample: true };
}

/** A creator's page as visitors see it; `preview` also opens it while hidden (for its owner's preview). */
export function findStore(handle: string, opts: { preview?: boolean } = {}): PublicStore | null {
  const h = handle.trim().toLowerCase();
  const own = readAll(opts.preview).find((s) => s.handle === h);
  if (own) return own;
  return h === SAMPLE_HANDLE ? sampleStore() : null;
}

/** Unsaved page changes shared with the preview window, so it updates as the creator edits. */
export const draftKey = (handle: string) => `enski:store-draft:${handle.trim().toLowerCase()}`;
export type StoreDraft = { page: CreatorState["storePage"]; sample: boolean };

/** Applies the creator's unsaved draft (and sample products, when switched on) to their page. */
export function applyDraft(store: PublicStore, draft: StoreDraft | null): PublicStore {
  if (!draft) return store;
  const page = stateSchema.shape.storePage.safeParse(draft.page).data ?? store.page;
  if (!draft.sample) return { ...store, page };
  return { ...store, page: withSamplePage(page), items: [...store.items, ...sampleItems()], sample: true, bio: store.bio, about: store.about || SAMPLE_CREATOR.about, tagline: store.tagline || SAMPLE_CREATOR.tagline, banner: store.banner || SAMPLE_CREATOR.banner };
}

export const storeItemKey = (handle: string, itemId: string) => `store:${handle}:${itemId}`;

export function storeShopItem(store: Pick<PublicStore, "handle" | "owner" | "photo">, item: CreatorItem): ShopItem {
  const fallback = COVER_PHOTOS.general[0]!;
  return {
    key: storeItemKey(store.handle, item.id),
    route: { kind: "store", slug: store.handle, item: item.id },
    title: item.title,
    summary: item.description,
    typeLabel: TYPE_LABEL[item.kind],
    creator: { name: store.owner, slug: null, avatar: store.photo || null },
    image: item.image ? { src: item.image, fit: "cover", fallback: fallback.small } : { src: fallback.small, fit: "cover" },
    price: item.price > 0 ? { currency: "NGN", sign: "₦", amount: item.price, current: item.price, onSale: false } : null,
    rating: null,
    reviewKey: `store:${store.handle}:${item.id}`,
    status: "published",
    canCart: item.price > 0,
    category: item.category || null,
    demo: false,
    popularity: 0,
    students: null,
    publishedAt: item.createdAt || null,
  };
}

/** Lesson titles a creator wrote for a course, so the buyer's learning space matches. */
export function storeLessons(key: string): string[] {
  const [, handle = "", id = ""] = key.split(":");
  return findStore(handle)?.items.find((i) => i.id === id)?.lessons ?? [];
}

/** The creator's own item behind a storefront key (its course set-up included). */
export function storeCourse(key: string): CreatorItem | null {
  const [, handle = "", id = ""] = key.split(":");
  return findStore(handle)?.items.find((i) => i.id === id) ?? null;
}

/**
 * Mirrors a buyer's learning on a storefront course into the creator's order for it,
 * so their Students view shows the same lessons done and best quiz score. Browser-only.
 */
export function syncStoreLearning(key: string, buyerEmail: string, patch: { completed?: string[]; quizScore?: number }): boolean {
  if (typeof window === "undefined" || !key.startsWith("store:")) return false;
  const [, handle = "", itemId = ""] = key.split(":");
  const store = readAll().find((s) => s.handle === handle);
  const email = buyerEmail.trim().toLowerCase();
  if (!store || !email) return false;
  try {
    const s = JSON.parse(localStorage.getItem(store.key) ?? "null") as CreatorState | null;
    if (!s) return false;
    const ids = new Set(s.customers.filter((c) => c.email.trim().toLowerCase() === email).map((c) => c.id));
    let changed = false;
    const orders = s.orders.map((o) => {
      if (o.itemId !== itemId || !ids.has(o.customerId) || o.status !== "paid") return o;
      const next = { ...o };
      if (patch.completed) next.completed = [...patch.completed];
      if (patch.quizScore !== undefined) next.quizScore = Math.max(o.quizScore ?? 0, patch.quizScore);
      changed = true;
      return next;
    });
    if (!changed) return false;
    localStorage.setItem(store.key, JSON.stringify({ ...s, orders }));
    return true;
  } catch {
    return false;
  }
}

/** Records each storefront item in a successful payment as a sale for its creator (once per payment). */
export function creditStoreSales(p: PaymentRecord): number {
  if (p.status !== "successful" || typeof window === "undefined") return 0;
  let credited = 0;
  const stores = readAll();
  for (const item of p.items) {
    if (!item.key.startsWith("store:")) continue;
    const [, handle = "", itemId = ""] = item.key.split(":");
    const store = stores.find((s) => s.handle === handle);
    if (!store) continue;
    try {
      const s = JSON.parse(localStorage.getItem(store.key) ?? "null") as CreatorState | null;
      if (!s) continue;
      const orderId = `${p.reference}-${itemId}`;
      if (s.orders.some((o) => o.id === orderId)) continue;
      const email = p.buyer?.email ?? "";
      const existing = s.customers.find((c) => c.email.toLowerCase() === email);
      const customer = existing ?? { id: `cust-${p.reference}`, name: p.buyer?.name || "Customer", email: email || "customer@enski.app", source: "purchase" as const, date: p.updatedAt };
      const product = s.items.find((i) => i.id === itemId);
      const next: CreatorState = {
        ...s,
        customers: existing ? s.customers : [...s.customers, customer],
        orders: [...s.orders, { id: orderId, itemId, itemTitle: product?.title ?? item.title, customerId: customer.id, amount: item.price?.current ?? 0, date: p.updatedAt, status: "paid", currency: "NGN", ...(product?.kind === "service" ? { stage: "requirements" as const } : {}) }],
        activity: [...s.activity, { id: `act-${orderId}`, text: `New sale: ${product?.title ?? item.title} to ${customer.name}`, date: p.updatedAt }],
      };
      localStorage.setItem(store.key, JSON.stringify(next));
      credited++;
    } catch {
      /* storage blocked: the buyer's receipt still stands */
    }
  }
  return credited;
}
