import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Tone } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title: "Timeline Explorer — Sentinel AI" }] }),
  component: Page,
});

const events = [
  { d: "2025-11-19 09:42", k: "Alert", t: "Face-match hit · Vector-17 in Damascus feed", tone: "critical" as const },
  { d: "2025-11-19 08:14", k: "Note", t: "M. Ortega: EXIF metadata authentic. Requesting chain-of-custody review.", tone: "medium" as const },
  { d: "2025-11-19 07:04", k: "Corroboration", t: "Analyst commentary on r/netsec corroborates fintech IOC.", tone: "medium" as const },
  { d: "2025-11-18 22:11", k: "Publication", t: "BBC covers coordinated behavior around #ElectionIntegrity.", tone: "verified" as const },
  { d: "2025-11-18 17:42", k: "Capture", t: "Image posted to channel_9821 with EXIF placing it within restricted zone.", tone: "high" as const },
  { d: "2025-11-17 12:00", k: "Signal", t: "Sentiment shift to negative in retail investor communities post rate hike.", tone: "negative" as const },
  { d: "2025-11-14 09:00", k: "Case", t: "Investigation INV-2038 opened: #ElectionIntegrity CIB cluster.", tone: "high" as const },
  { d: "2025-11-11 15:20", k: "Case", t: "Investigation INV-2041 opened: Vector-17 · surveillance leak.", tone: "critical" as const },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Timeline Explorer"
        description="A chronological view of alerts, evidence, publications, and analyst notes."
      />
      <Card>
        <CardContent className="p-6">
          <div className="relative pl-6">
            <span className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
            {events.map((e, i) => (
              <div key={i} className="relative pb-5 last:pb-0">
                <span className="absolute -left-[14px] top-1.5 grid size-3 place-items-center rounded-full bg-background ring-2 ring-primary" />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{e.d}</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{e.k}</Badge>
                  <Tone tone={e.tone} />
                </div>
                <p className="mt-1 text-sm">{e.t}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}