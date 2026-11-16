import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarClock, CalendarDays, CheckCircle2, Clock, MapPin, MonitorPlay, UserRound, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { FilterSelect, PageHeader, Panel, StatusBadge } from "@/components/affiliate/ui";
import { useLearner } from "@/lib/learner/store";
import { creatorCoachingSlots, creatorSessionOffers, learnerSessionBooking, reserveCreatorSession, updateCreatorSessionBooking } from "@/lib/creator/publicStore";
import { saveCreatorSessionToLearner, updateLearnerCreatorSession } from "@/lib/learner/coaching";
import { useViewerTimeZone, dayIn, timeIn, zoneLabel } from "@/lib/learner/timezone";
import { LearnerNotFound } from "../shared";

export function SessionDetails({ handle, itemId, kind }: { handle: string; itemId: string; kind: "coaching" | "live" }) {
  const navigate = useNavigate();
  const { state, update } = useLearner();
  const timeZone = useViewerTimeZone();
  const [offer, setOffer] = useState<ReturnType<typeof creatorSessionOffers>[number] | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [learnerName, setLearnerName] = useState(state.profile.fullName);
  const [learnerEmail, setLearnerEmail] = useState(state.profile.email);
  const [error, setError] = useState("");
  useEffect(() => {
    setOffer(creatorSessionOffers().find((entry) => entry.handle === handle && entry.item.id === itemId && entry.item.kind === kind) ?? null);
  }, [handle, itemId, kind]);
  const existing = state.creatorSessionBookings.find((booking) => booking.creatorHandle === handle && booking.itemId === itemId && booking.status !== "cancelled");
  const slots = offer?.item.kind === "coaching" ? creatorCoachingSlots(handle, itemId) : [];
  const liveAt = offer?.item.kind === "live" ? offer.item.date : "";
  const currentStatus = existing ? learnerSessionBooking(handle, existing.id)?.status ?? existing.status : null;

  if (!offer) return <LearnerNotFound what="session" />;
  const location = offer.venue === "in_person" ? "In person" : offer.venue === "phone" ? "Phone" : "Online";
  const scheduledAt = kind === "live" ? liveAt : selectedTime;
  const statusTone = currentStatus === "confirmed" ? "success" : currentStatus === "requested" ? "pending" : currentStatus === "cancelled" ? "neutral" : "info";
  const statusLabel = currentStatus === "requested" ? "Awaiting creator" : currentStatus === "confirmed" ? "Confirmed" : currentStatus === "cancelled" ? "Cancelled" : currentStatus ? "Session complete" : "Available";

  const book = () => {
    setError("");
    if (!learnerName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(learnerEmail.trim())) {
      setError("Add your name and a valid email address to continue.");
      return;
    }
    if (!scheduledAt) {
      setError(kind === "coaching" ? "Choose an available time." : "This session has no upcoming date yet.");
      return;
    }
    const booking = reserveCreatorSession(handle, itemId, { name: learnerName, email: learnerEmail }, scheduledAt);
    if (!booking) {
      setError("That time is no longer available. Choose another time.");
      return;
    }
    const savedToLearner = saveCreatorSessionToLearner(booking, { name: learnerName, email: learnerEmail });
    if (!savedToLearner) {
      updateCreatorSessionBooking(handle, booking.id, { status: "cancelled" });
      setError("Your booking couldn't be saved. Please try again.");
      return;
    }
    update((s) => ({ creatorSessionBookings: [booking, ...s.creatorSessionBookings.filter((saved) => saved.id !== booking.id)] }));
    toast.success(kind === "coaching" ? "Coaching request sent" : "Session registration saved", { description: "No payment or live broadcast was started." });
    void navigate({ to: "/learner/bookings" });
  };

  const cancel = () => {
    if (!existing) return;
    const changedCreator = updateCreatorSessionBooking(handle, existing.id, { status: "cancelled" });
    const changedLearner = updateLearnerCreatorSession(existing.id, { status: "cancelled" });
    if (!changedCreator || !changedLearner) {
      setError("Your cancellation couldn't be saved. Please try again.");
      return;
    }
    update((s) => ({ creatorSessionBookings: s.creatorSessionBookings.map((booking) => booking.id === existing.id ? { ...booking, status: "cancelled" } : booking) }));
    toast.success("Booking cancelled");
  };

  return (
    <div className="min-w-0">
      <PageHeader eyebrow={kind === "coaching" ? "Creator coaching" : "Creator live session"} title={offer.item.title} description={`${offer.owner} · ${offer.storeName}`} actions={<Button asChild variant="outline"><Link to="/learner/bookings">My bookings</Link></Button>} />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          {offer.item.image && <img src={offer.item.image} alt="" className="aspect-[16/8] w-full rounded-xl object-cover" />}
          <Panel title="About this session"><p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{offer.item.description}</p></Panel>
          <Panel title="Session details">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Fact icon={UserRound} title="Creator" value={offer.owner} />
              <Fact icon={Clock} title="Duration" value={`${offer.durationMinutes} minutes`} />
              <Fact icon={kind === "live" ? MonitorPlay : CalendarClock} title="Format" value={kind === "live" ? "Live session" : offer.format === "group" ? "Group coaching" : "1:1 coaching"} />
              <Fact icon={offer.venue === "in_person" ? MapPin : Video} title="Where" value={location} />
              {kind === "live" && liveAt && <Fact icon={CalendarDays} title="Starts" value={`${dayIn(liveAt, timeZone)} · ${timeIn(liveAt, timeZone)} ${zoneLabel(liveAt, timeZone)}`} />}
            </dl>
          </Panel>
        </div>
        <aside className="surface space-y-4 p-5 lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-muted-foreground">Listed price</p><p className="text-2xl font-extrabold">{offer.price ? `₦${offer.price.toLocaleString("en-NG")}` : "Free"}</p></div><StatusBadge tone={statusTone}>{statusLabel}</StatusBadge></div>
          <p className="rounded-lg bg-ice p-3 text-xs leading-5 text-cobalt">This is a simulated reservation. It does not charge you or start a live broadcast.</p>
          {existing && currentStatus !== "cancelled" ? (
            <div className="space-y-3">
              <p className="text-sm font-bold">{currentStatus === "requested" ? "Your request is with the creator." : "Your place is confirmed."}</p>
              {existing.scheduledAt && <p className="text-sm text-muted-foreground">{dayIn(existing.scheduledAt, timeZone)} · {timeIn(existing.scheduledAt, timeZone)} {zoneLabel(existing.scheduledAt, timeZone)}</p>}
              {existing.status === "confirmed" && offer.meetingLink && Date.parse(existing.scheduledAt) <= Date.now() + 24 * 60 * 60 * 1000 && <Button asChild className="w-full"><a href={offer.meetingLink} target="_blank" rel="noreferrer"><Video />Open meeting link</a></Button>}
              {(existing.status === "requested" || existing.status === "confirmed") && Date.parse(existing.scheduledAt) > Date.now() && <Button className="w-full" variant="outline" onClick={cancel}>Cancel reservation</Button>}
            </div>
          ) : kind === "coaching" ? (
            <div className="space-y-4">
              <label htmlFor="coaching-slot" className="block text-sm font-bold">Choose a time</label>
              {slots.length ? <FilterSelect label="Available session time" value={selectedTime || "none"} onChange={(value) => setSelectedTime(value === "none" ? "" : value)} className="w-full sm:w-full" options={[["none", "Select a time"], ...slots.map((slot) => [slot, `${dayIn(slot, timeZone)} · ${timeIn(slot, timeZone)}`] as [string, string])]} /> : <p className="text-sm text-muted-foreground">No times are open right now. Check back later.</p>}
              <ProfileFields learnerName={learnerName} learnerEmail={learnerEmail} setName={setLearnerName} setEmail={setLearnerEmail} />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" disabled={!selectedTime || !slots.length} onClick={book}><CalendarClock />Request coaching time</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {liveAt ? <p className="text-sm font-semibold">{Date.parse(liveAt) < Date.now() ? "This session has ended." : `${dayIn(liveAt, timeZone)} · ${timeIn(liveAt, timeZone)} ${zoneLabel(liveAt, timeZone)}`}</p> : <p className="text-sm text-muted-foreground">The creator hasn't scheduled this session yet.</p>}
              <ProfileFields learnerName={learnerName} learnerEmail={learnerEmail} setName={setLearnerName} setEmail={setLearnerEmail} />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" disabled={!liveAt || Date.parse(liveAt) < Date.now()} onClick={book}><CheckCircle2 />Save my place</Button>
            </div>
          )}
          {error && existing && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </aside>
      </div>
    </div>
  );
}

function ProfileFields({ learnerName, learnerEmail, setName, setEmail }: { learnerName: string; learnerEmail: string; setName: (value: string) => void; setEmail: (value: string) => void }) {
  return <div className="space-y-3"><label className="block text-xs font-bold">Your name<Input className="mt-1" value={learnerName} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label className="block text-xs font-bold">Email address<Input className="mt-1" type="email" value={learnerEmail} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label></div>;
}

function Fact({ icon: Icon, title, value }: { icon: typeof Clock; title: string; value: string }) {
  return <div className="flex min-w-0 gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ice text-cobalt"><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-xs font-bold text-muted-foreground">{title}</span><span className="block break-words text-sm font-semibold">{value}</span></span></div>;
}