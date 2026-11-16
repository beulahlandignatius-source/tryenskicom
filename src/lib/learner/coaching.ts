import { findResource } from "./catalog";
import type { LearnerState } from "./rules";
import { accountStorageKey } from "@/lib/dashboard/account";
import { currentDemoProfile } from "@/lib/demo/profile";
import { initialLearnerState, stateSchema, STORAGE_KEY } from "./rules";

export type CoachingAppointment = LearnerState["coachingAppointments"][number];

/** Recurring demo appointment options; these never contact a creator or reserve a real calendar. */
export function coachingSlots(appointments: CoachingAppointment[], resourceId: string, now = new Date(), limit = 12) {
  const taken = new Set(appointments.filter((a) => a.resourceId === resourceId && a.status === "confirmed").map((a) => a.scheduledAt));
  const slots: string[] = [];
  for (let offset = 1; offset <= 21 && slots.length < limit; offset += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    if (day.getDay() === 0 || day.getDay() === 6) continue;
    for (const hour of [10, 13, 16]) {
      const slot = new Date(day);
      slot.setHours(hour, 0, 0, 0);
      const iso = slot.toISOString();
      if (!taken.has(iso)) slots.push(iso);
      if (slots.length >= limit) break;
    }
  }
  return slots.map((iso) => ({ resourceId, iso }));
}

export function createCoachingAppointment(s: LearnerState, resourceId: string, scheduledAt: string, now = Date.now()): Partial<LearnerState> {
  const resource = findResource(resourceId);
  if (!resource || resource.type !== "Coaching" || Date.parse(scheduledAt) <= now) return {};
  if (s.coachingAppointments.some((a) => a.resourceId === resourceId && a.status === "confirmed")) return {};
  if (!coachingSlots(s.coachingAppointments, resourceId, new Date(now), 100).some((slot) => slot.iso === scheduledAt)) return {};
  const appointment: CoachingAppointment = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `coach-${now}`,
    resourceId,
    scheduledAt,
    createdAt: new Date(now).toISOString(),
    status: "confirmed",
  };
  return { coachingAppointments: [appointment, ...s.coachingAppointments] };
}

export function rescheduleCoachingAppointment(s: LearnerState, id: string, scheduledAt: string, now = Date.now()): Partial<LearnerState> {
  const appointment = s.coachingAppointments.find((a) => a.id === id && a.status === "confirmed");
  if (!appointment || Date.parse(scheduledAt) <= now) return {};
  if (!coachingSlots(s.coachingAppointments.filter((a) => a.id !== id), appointment.resourceId, new Date(now), 100).some((slot) => slot.iso === scheduledAt)) return {};
  return { coachingAppointments: s.coachingAppointments.map((a) => a.id === id ? { ...a, scheduledAt } : a) };
}

export function cancelCoachingAppointment(s: LearnerState, id: string, now = Date.now()): Partial<LearnerState> {
  const appointment = s.coachingAppointments.find((a) => a.id === id && a.status === "confirmed");
  if (!appointment || Date.parse(appointment.scheduledAt) <= now) return {};
  return { coachingAppointments: s.coachingAppointments.map((a) => a.id === id ? { ...a, status: "cancelled", cancelledAt: new Date(now).toISOString() } : a) };
}

export function completeCoachingAppointment(s: LearnerState, id: string, now = Date.now()): Partial<LearnerState> {
  const appointment = s.coachingAppointments.find((a) => a.id === id && a.status === "confirmed");
  if (!appointment || Date.parse(appointment.scheduledAt) > now) return {};
  return { coachingAppointments: s.coachingAppointments.map((a) => a.id === id ? { ...a, status: "completed" } : a) };
}

/** Store a creator-offer booking in the learner's own profile, separate from the creator record. */
export function saveCreatorSessionToLearner(booking: {
  id: string; creatorHandle: string; itemId: string; kind: "coaching" | "live"; scheduledAt: string; createdAt: string;
  itemTitle: string; creatorName: string; image: string; online: boolean; meetingLink: string;
}, learner: { name: string; email: string }) {
  if (typeof window === "undefined") return false;
  const profile = currentDemoProfile();
  const key = accountStorageKey(STORAGE_KEY, profile);
  try {
    const current = stateSchema.safeParse(JSON.parse(localStorage.getItem(key) ?? "null"));
    const base = current.success ? current.data : {
      ...initialLearnerState,
      profile: { ...initialLearnerState.profile, fullName: learner.name, displayName: learner.name.split(/\s+/)[0] ?? learner.name, email: learner.email },
    };
    const next = stateSchema.parse({
      ...base,
      creatorSessionBookings: [{ ...booking, status: "requested" as const }, ...base.creatorSessionBookings.filter((saved) => saved.id !== booking.id)],
    });
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("enski:learner-session-updated", { detail: key }));
    return true;
  } catch {
    return false;
  }
}

export function updateLearnerCreatorSession(id: string, patch: Partial<LearnerState["creatorSessionBookings"][number]>, learnerEmail?: string) {
  if (typeof window === "undefined") return false;
  const email = learnerEmail?.trim().toLowerCase();
  const key = email ? `${STORAGE_KEY}:${email}` : accountStorageKey(STORAGE_KEY, currentDemoProfile());
  try {
    const parsed = stateSchema.safeParse(JSON.parse(localStorage.getItem(key) ?? "null"));
    if (!parsed.success || !parsed.data.creatorSessionBookings.some((booking) => booking.id === id)) return false;
    localStorage.setItem(key, JSON.stringify(stateSchema.parse({
      ...parsed.data,
      creatorSessionBookings: parsed.data.creatorSessionBookings.map((booking) => booking.id === id ? { ...booking, ...patch } : booking),
    })));
    window.dispatchEvent(new CustomEvent("enski:learner-session-updated", { detail: key }));
    return true;
  } catch {
    return false;
  }
}