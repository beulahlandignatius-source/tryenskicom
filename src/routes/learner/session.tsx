import { createFileRoute } from "@tanstack/react-router";
import { SessionDetails } from "@/components/learner/bookings/SessionDetails";
import { learnerMeta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/session")({
  validateSearch: (search: Record<string, unknown>): { handle?: string; itemId?: string; kind?: "coaching" | "live" } => ({
    ...(typeof search["handle"] === "string" ? { handle: search["handle"] } : {}),
    ...(typeof search["itemId"] === "string" ? { itemId: search["itemId"] } : {}),
    ...(search["kind"] === "coaching" || search["kind"] === "live" ? { kind: search["kind"] } : {}),
  }),
  head: () => learnerMeta("Coaching and live sessions", "Explore creator session details and manage a simulated booking."),
  component: Page,
});

function Page() {
  const { handle, itemId, kind } = Route.useSearch();
  if (!handle || !itemId || !kind) return <SessionDetails handle="" itemId="" kind="coaching" />;
  return <SessionDetails key={`${handle}:${itemId}:${kind}`} handle={handle} itemId={itemId} kind={kind} />;
}