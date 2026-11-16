import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

/** Distinct brand colours for chart series: blue, lemon, orange, red, sky. */
export const CHART_COLORS = ["var(--cobalt)", "var(--lime)", "var(--chart-orange)", "var(--chart-red)", "var(--sky)"];
const tip = { background: "var(--card)", borderColor: "var(--line)", borderRadius: 12, color: "var(--foreground)", fontSize: 12 };
const axis = { fill: "var(--muted-foreground)", fontSize: 11 };

export type TrendPoint = { label: string; value: number };

/** Bar chart over a period. With no activity the bars sit at zero and a calm note explains why. */
export function TrendBars({ data, name, format = (v) => String(v), empty, className, color = "var(--cobalt)" }: {
  data: TrendPoint[]; name: string; format?: (v: number) => string; empty?: string; className?: string; color?: string;
}) {
  const none = data.every((d) => !d.value);
  return (
    <div className={cn("relative h-60 w-full min-w-0", className)} role="img" aria-label={`${name} bar chart`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 6, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={`bar-${name.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, (m: number) => Math.max(m, 4)]} tickFormatter={(v) => format(Number(v))} width={52} />
          <Tooltip formatter={(v) => [format(Number(v)), name]} contentStyle={tip} cursor={{ fill: "var(--ice)" }} />
          <Bar dataKey="value" fill={`url(#bar-${name.replace(/\W/g, "")})`} radius={[6, 6, 0, 0]} maxBarSize={34} minPointSize={none ? 3 : 0} />
        </BarChart>
      </ResponsiveContainer>
      {none && empty && (
        <p className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto w-fit max-w-[80%] rounded-full border bg-card/95 px-3.5 py-1.5 text-center text-xs font-bold text-muted-foreground shadow-sm">{empty}</p>
      )}
    </div>
  );
}

export type Slice = { label: string; value: number };

/** Donut with a legend. Shows a soft empty ring when there is nothing to split yet. */
export function ShareDonut({ data, center, centerLabel, empty, className }: { data: Slice[]; center: string; centerLabel: string; empty?: string; className?: string }) {
  const shown = data.filter((d) => d.value > 0);
  const total = shown.reduce((n, d) => n + d.value, 0);
  return (
    <div className={cn("grid items-center gap-4 sm:grid-cols-[180px_minmax(0,1fr)]", className)}>
      <div className="relative mx-auto h-44 w-44" role="img" aria-label={`${centerLabel}: ${shown.map((d) => `${d.label} ${d.value}`).join(", ") || "none yet"}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={total ? shown : [{ label: "none", value: 1 }]} dataKey="value" nameKey="label" innerRadius="64%" outerRadius="100%" paddingAngle={total && shown.length > 1 ? 3 : 0} stroke="none" isAnimationActive={!!total}>
              {(total ? shown : [0]).map((_, i) => <Cell key={i} fill={total ? CHART_COLORS[i % CHART_COLORS.length] : "var(--soft)"} />)}
            </Pie>
            {total > 0 && <Tooltip contentStyle={tip} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><p className="text-2xl font-extrabold tabular-nums">{center}</p><p className="text-[11px] font-semibold text-muted-foreground">{centerLabel}</p></div>
        </div>
      </div>
      {total ? (
        <ul className="space-y-2">
          {shown.map((d, i) => (
            <li key={d.label} className="flex items-center gap-2.5 text-sm">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate font-semibold">{d.label}</span>
              <span className="tabular-nums text-muted-foreground">{Math.round((d.value / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-center text-sm text-muted-foreground sm:text-left">{empty}</p>}
    </div>
  );
}

/** Empty buckets for the last n days or months, labelled for the axis. */
export function periodBuckets(range: string, now = new Date()): { key: string; label: string }[] {
  const months = range === "365" || range === "12m" || range === "all";
  if (months) return Array.from({ length: 12 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1); return { key: d.toISOString().slice(0, 7), label: d.toLocaleString("en", { month: "short" }) }; });
  const n = Math.min(Number(range) || 7, 30);
  const step = Number(range) > 30 ? Math.ceil(Number(range) / 12) : 1;
  const len = Number(range) > 30 ? 12 : n;
  return Array.from({ length: len }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - (len - 1 - i) * step); return { key: d.toISOString().slice(0, 10), label: d.toLocaleString("en", { day: "numeric", month: "short" }) }; });
}
