import { describe, expect, it } from "vitest";
import { learnerBookings, upcomingListings } from "./bookings";
import { events } from "./catalog";
import { cancelCoachingAppointment, coachingSlots, createCoachingAppointment } from "./coaching";
import { initialLearnerState } from "./rules";

describe("learner bookings", () => {
  it("starts empty with no purchases or registrations", () => {
    expect(learnerBookings({ purchases: [], registrations: [], coachingAppointments: [], creatorSessionBookings: [] })).toEqual([]);
  });
  it("puts a registration for a finished event in past", () => {
    const e = events[0]!;
    const [b] = learnerBookings({ purchases: [], registrations: [{ eventId: e.id, date: "", tickets: 1 }], coachingAppointments: [], creatorSessionBookings: [] }, Date.parse(e.start) + 864e5);
    expect(b?.when_past).toBe(true);
  });
  it("lists no gigs", () => {
    expect(upcomingListings("gigs")).toEqual([]);
  });
  it("creates and cancels simulated catalogue coaching appointments", () => {
    const coaching = (await import("./catalog")).resources.find((resource) => resource.type === "Coaching");
    expect(coaching).toBeDefined();
    if (!coaching) return;
    const slot = coachingSlots([], coaching.id, new Date("2026-11-16T09:00:00")).at(0)?.iso;
    expect(slot).toBeDefined();
    if (!slot) return;
    const created = createCoachingAppointment(initialLearnerState, coaching.id, slot, Date.parse("2026-11-16T09:00:00"));
    expect(created.coachingAppointments).toHaveLength(1);
    const saved = { ...initialLearnerState, ...created };
    const cancelled = cancelCoachingAppointment(saved, saved.coachingAppointments[0]?.id ?? "", Date.parse("2026-11-16T09:00:00"));
    expect(cancelled.coachingAppointments?.[0]?.status).toBe("cancelled");
  });
});
