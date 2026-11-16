import { useMemo, useState } from "react";
import { CalendarClock, Check, CircleX, Clock3, MonitorPlay, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { FilterSelect, Panel, StatusBadge } from "@/components/affiliate/ui";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { coachingOf, coachingSlots } from "@/lib/creator/products";
import { updateLearnerCreatorSession } from "@/lib/learner/coaching";
import type { SessionBooking } from "@/lib/creator/rules";

export function SessionRequests() {
  const { state, update } = useCreator();
  const [moving, setMoving] = useState<SessionBooking | null>(null);
  const [slot, setSlot] = useState("");
  const rows = useMemo(() => [...state.sessionBookings].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)), [state.sessionBookings]);
  const patch = (booking: SessionBooking, next: Partial<SessionBooking>, label: string) => {
    update((current) => ({
      sessionBookings: current.sessionBookings.map((row) => row.id === booking.id ? { ...row, ...next } : row),
      activity: [...current.activity, activityEntry(`${label}: ${booking.itemTitle ?? "Session"} · ${booking.learnerName}`)],
    }));
    updateLearnerCreatorSession(booking.id, next);
    toast.success(label);
  };
  const slots = moving?.kind === "coaching" ? (() => {
    const item = state.items.find((entry) => entry.id === moving.itemId);
    if (!item) return [];
    const config = coachingOf(item);
    const booked = state.sessionBookings.filter((entry) => entry.itemId === item.id && entry.id !== moving.id && entry.status === "confirmed").map((entry) => entry.scheduledAt);
    return coachingSlots(state.availability.days, state.availability.buffer, item.duration, config, booked, new Date(), 12, config.format === "group" ? config.groupSize : 1);
  })() : [];

  return (
    <Panel title="Creator session bookings" description="Requests and registrations submitted by learners. No real calls or payments are started." bodyClassName="p-0">
      {rows.length ? <ul className="divide-y">
        {rows.map((booking) => {
          const item = state.items.find((entry) => entry.id === booking.itemId);
          const scheduled = Date.parse(booking.scheduledAt);
          const past = scheduled < Date.now();
          const tone = booking.status === "requested" ? "pending" : booking.status === "confirmed" || booking.status === "live" || booking.status === "attended" ? "success" : booking.status === "completed" ? "info" : "neutral";
          const status = booking.status === "requested" ? "Awaiting your response" : booking.status === "live" ? "Live now" : booking.status === "no_show" ? "No-show" : booking.status === "attended" ? "Attended" : booking.status === "completed" ? "Completed" : booking.status === "cancelled" ? "Cancelled" : past ? "Needs outcome" : "Confirmed";
          return <li key={booking.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            {booking.image ? <img src={booking.image} alt="" className="h-14 w-20 rounded-lg object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-lg bg-ice text-cobalt">{booking.kind === "live" ? <MonitorPlay /> : <CalendarClock />}</span>}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{booking.itemTitle ?? item?.title ?? "Session"}</p>
              <p className="truncate text-xs text-muted-foreground">{booking.learnerName} · {booking.learnerEmail} · {new Date(booking.scheduledAt).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{booking.kind === "live" ? "Live session" : "Coaching"}</p>
            </div>
            <StatusBadge tone={tone}>{status}</StatusBadge>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {booking.status === "requested" && <Button size="sm" onClick={() => patch(booking, { status: "confirmed" }, "Booking confirmed")}><Check />Confirm</Button>}
              {booking.status === "confirmed" && !past && booking.kind === "coaching" && <Button size="sm" variant="outline" onClick={() => { setMoving(booking); setSlot(""); }}><Clock3 />Reschedule</Button>}
              {booking.status === "confirmed" && !past && booking.kind === "live" && <Button size="sm" variant="outline" onClick={() => patch(booking, { status: "live" }, "Session marked live")}><Video />Go live</Button>}
              {booking.status === "live" && <Button size="sm" onClick={() => patch(booking, { status: "attended" }, "Attendance recorded")}><Check />End session</Button>}
              {booking.status === "confirmed" && past && booking.kind === "coaching" && <><Button size="sm" onClick={() => patch(booking, { status: "attended" }, "Attendance recorded")}><Check />Attended</Button><Button size="sm" variant="outline" onClick={() => patch(booking, { status: "no_show" }, "No-show recorded")}>No-show</Button></>}
              {(booking.status === "confirmed" || booking.status === "requested") && booking.meetingLink && <Button asChild size="sm" variant="outline"><a href={booking.meetingLink} target="_blank" rel="noreferrer"><Video />Meeting link</a></Button>}
              {(booking.status === "confirmed" || booking.status === "requested") && !past && <Button size="sm" variant="ghost" onClick={() => patch(booking, { status: "cancelled" }, "Booking cancelled")}><CircleX />Cancel</Button>}
            </div>
          </li>;
        })}
      </ul> : <div className="p-5 text-sm text-muted-foreground">Learner bookings will appear here after someone requests a coaching time or saves a place in a live session.</div>}
      {moving && <div className="border-t p-4">
        <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1"><p className="mb-2 text-sm font-bold">Move {moving.learnerName}'s coaching session</p>{slots.length ? <FilterSelect label="Available session time" value={slot || "none"} onChange={(value) => setSlot(value === "none" ? "" : value)} className="w-full sm:w-full" options={[["none", "Choose a time"], ...slots.map((value) => [value, new Date(value).toLocaleString()] as [string, string])]} /> : <p className="text-sm text-muted-foreground">No times are open. Add more availability first.</p>}</div>
          <Button disabled={!slot} onClick={() => { patch(moving, { scheduledAt: slot }, "Session rescheduled"); setMoving(null); }}>Save new time</Button>
          <Button variant="outline" onClick={() => setMoving(null)}>Close</Button>
        </div>
      </div>}
    </Panel>
  );
}