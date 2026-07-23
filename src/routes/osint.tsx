import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Tone } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Globe, Shield, Github, FileText, Newspaper, Link2 } from "lucide-react";

export const Route = createFileRoute("/osint")({
  head: () => ({ meta: [{ title: "OSINT Intelligence — Sentinel AI" }] }),
  component: Page,
});

const modules = [
  {
    icon: Globe,
    name: "DNS & WHOIS",
    count: 24,
    tone: "verified" as const,
    note: "Registrar: NameCheap · created 2019-08-14 · privacy: masked",
  },
  {
    icon: Shield,
    name: "TLS Certificates",
    count: 6,
    tone: "medium" as const,
    note: "Wildcard cert · issued 2025-03-01 · CT-log matches: 42",
  },
  {
    icon: Github,
    name: "GitHub",
    count: 18,
    tone: "high" as const,
    note: "3 repos leak internal endpoints · 1 secret token flagged",
  },
  {
    icon: FileText,
    name: "Public documents",
    count: 12,
    tone: "medium" as const,
    note: "Redacted memo consistent with authentic sample",
  },
  {
    icon: Newspaper,
    name: "News mentions",
    count: 88,
    tone: "verified" as const,
    note: "412 outlets · 14 languages",
  },
  {
    icon: Search,
    name: "Search results",
    count: 214,
    tone: "unverified" as const,
    note: "SERP variance high · possible SEO manipulation",
  },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="OSINT Intelligence"
        description="Public-source search across DNS, certificates, code, documents, and news — with confidence scoring."
      />

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              defaultValue="aster-motors.com"
              className="h-11 pl-9 pr-24 font-mono text-base"
            />
            <Button size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2">
              Search
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Try:</span>
            {[
              "aster-motors.com",
              "vector17@proton.me",
              "+91 98••••4211",
              "0x8a2c…f019",
              "@osint_watch",
            ].map((e) => (
              <button
                key={e}
                className="rounded-full border bg-card px-2 py-0.5 font-mono hover:bg-accent"
              >
                {e}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Card key={m.name}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
                    <m.icon className="size-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">{m.count} results</div>
                  </div>
                </div>
                <Tone tone={m.tone} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{m.note}</p>
              <Button size="sm" variant="outline" className="mt-3 h-7 gap-1 text-xs">
                <Link2 className="size-3" />
                Open records
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Aggregate confidence</h3>
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
              74 / 100
            </Badge>
          </div>
          <Progress value={74} className="h-2" />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { l: "Corroborating sources", v: "8 / 12" },
              { l: "Recency", v: "83% within 30d" },
              { l: "Source diversity", v: "5 domains" },
            ].map((x) => (
              <div key={x.l} className="rounded-md border bg-card p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {x.l}
                </div>
                <div className="mt-1 text-sm font-semibold">{x.v}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
