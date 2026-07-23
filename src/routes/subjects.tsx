import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Tone } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/subjects")({
  head: () => ({ meta: [{ title: "Subjects — Sentinel AI" }] }),
  component: Page,
});

const rows = [
  {
    n: "Vector-17",
    type: "Person",
    risk: 88,
    tone: "critical" as const,
    mentions: 1241,
    seen: "12m ago",
  },
  {
    n: "Aster Motors",
    type: "Organization",
    risk: 34,
    tone: "medium" as const,
    mentions: 4211,
    seen: "3m ago",
  },
  {
    n: "Meridian Capital",
    type: "Organization",
    risk: 62,
    tone: "high" as const,
    mentions: 812,
    seen: "22m ago",
  },
  {
    n: "M. Ortega",
    type: "Person",
    risk: 24,
    tone: "verified" as const,
    mentions: 118,
    seen: "1h ago",
  },
  {
    n: "channel_9821",
    type: "Alias",
    risk: 78,
    tone: "high" as const,
    mentions: 342,
    seen: "8m ago",
  },
  {
    n: "Northwind Logistics",
    type: "Company",
    risk: 41,
    tone: "medium" as const,
    mentions: 288,
    seen: "45m ago",
  },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Subjects"
        description="Persons, organizations, and companies under active monitoring."
      />
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Subject</th>
                <th className="px-4 text-left font-medium">Type</th>
                <th className="px-4 text-left font-medium">Risk</th>
                <th className="px-4 text-left font-medium">Mentions</th>
                <th className="px-4 text-left font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.n} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      {r.n}
                      <Tone tone={r.tone} />
                    </div>
                  </td>
                  <td className="px-4 text-muted-foreground">{r.type}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 tabular-nums text-sm font-semibold">{r.risk}</span>
                      <Progress value={r.risk} className="h-1 w-24" />
                    </div>
                  </td>
                  <td className="px-4 tabular-nums text-muted-foreground">
                    {r.mentions.toLocaleString()}
                  </td>
                  <td className="px-4 text-muted-foreground">{r.seen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
