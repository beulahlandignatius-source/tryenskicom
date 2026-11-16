import { findResource } from "./catalog";
import type { LearnerState } from "./rules";

export type CoachingAppointment = LearnerState["coachingAppointments"][number];

/** Recurring demo appointment options; these never contact a creator or reserve a real calendar. */
export function coachingSlots(appointments: CoachingAppointment[], resourceId: string, now = new Date(), limit = 12) {
  const taken = new Set(appointments.filter((a) => a.status === "confirmed").map((a) => a.scheduledAt));
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