import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusDot, Tone } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/social")({
  head: () => ({ meta: [{ title: "Social Intelligence — Sentinel AI" }] }),
  component: Page,
});

const platforms = [
  {
    name: "X / Twitter",
    status: "ok",
    vol: "482K",
    latest: "8s ago",
    health: 96,
    hue: "oklch(0.5 0.02 250)",
  },
  {
    name: "Facebook",
    status: "ok",
    vol: "312K",
    latest: "22s ago",
    health: 92,
    hue: "oklch(0.55 0.18 260)",
  },
  {
    name: "Instagram",
    status: "warn",
    vol: "228K",
    latest: "1m ago",
    health: 78,
    hue: "oklch(0.65 0.22 350)",
  },
  {
    name: "YouTube",
    status: "ok",
    vol: "184K",
    latest: "17s ago",
    health: 94,
    hue: "oklch(0.62 0.23 27)",
  },
  {
    name: "TikTok",
    status: "ok",
    vol: "162K",
    latest: "12s ago",
    health: 90,
    hue: "oklch(0.2 0.03 250)",
  },
  {
    name: "Telegram",
    status: "warn",
    vol: "141K",
    latest: "3m ago",
    health: 71,
    hue: "oklch(0.65 0.15 230)",
  },
  {
    name: "Reddit",
    status: "ok",
    vol: "98K",
    latest: "35s ago",
    health: 88,
    hue: "oklch(0.65 0.2 40)",
  },
  {
    name: "LinkedIn",
    status: "ok",
    vol: "62K",
    latest: "45s ago",
    health: 91,
    hue: "oklch(0.5 0.14 245)",
  },
  {
    name: "Threads",
    status: "ok",
    vol: "44K",
    latest: "1m ago",
    health: 87,
    hue: "oklch(0.35 0.05 250)",
  },
  {
    name: "Pinterest",
    status: "err",
    vol: "0",
    latest: "12m ago",
    health: 12,
    hue: "oklch(0.62 0.23 27)",
  },
];

const posts = [
  {
    platform: "X",
    author: "@osint_watch",
    text: "Coordinated cluster of 4 accounts amplifying #ElectionIntegrity within a 90s window.",
    likes: 4210,
    shares: 812,
    tone: "negative" as const,
  },
  {
    platform: "Telegram",
    author: "channel_9821",
    text: "Unverified image of convoy movement; face-match hit at 71% on Vector-17.",
    likes: 122,
    shares: 41,
    tone: "negative" as const,
  },
  {
    platform: "Instagram",
    author: "@aster_motors",
    text: "Behind-the-scenes at the keynote — thank you for the incredible energy.",
    likes: 18320,
    shares: 402,
    tone: "positive" as const,
  },
  {
    platform: "TikTok",
    author: "@newsnowlive",
    text: "Explainer: what happened at the central bank briefing today.",
    likes: 62100,
    shares: 4820,
    tone: "neutral" as const,
  },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Social Intelligence"
        description="Platform-by-platform coverage, health, and drill-down into posts, profiles, hashtags, and comments."
        actions={<Button size="sm">Connect platform</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {platforms.map((p) => (
          <Card key={p.name} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="grid size-8 place-items-center rounded-md text-xs font-bold text-white"
                    style={{ background: p.hue }}
                  >
                    {p.name.slice(0, 2)}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">Updated {p.latest}</div>
                  </div>
                </div>
                <StatusDot
                  tone={p.status === "ok" ? "success" : p.status === "warn" ? "warning" : "danger"}
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-lg font-semibold tabular-nums">{p.vol}</span>
                <span className="text-[11px] text-muted-foreground">24h volume</span>
              </div>
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Health</span>
                  <span>{p.health}%</span>
                </div>
                <Progress value={p.health} className="h-1.5" />
              </div>
              <div className="mt-3 flex gap-1">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  Feed
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  Profiles
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  Tags
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold">Cross-platform feed</h3>
                <p className="text-[11px] text-muted-foreground">
                  Filtered · English + Hindi · last 15m
                </p>
              </div>
              <div className="flex gap-1">
                {[
                  "All",
                  "Posts",
                  "Profiles",
                  "Images",
                  "Videos",
                  "Hashtags",
                  "Comments",
                  "Mentions",
                ].map((t, i) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={i === 0 ? "default" : "ghost"}
                    className="h-7 text-xs"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div className="divide-y">
              {posts.map((p, i) => (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {p.author.slice(1, 3).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                        {p.platform}
                      </Badge>
                      <span className="font-medium">{p.author}</span>
                      <Tone tone={p.tone} />
                    </div>
                    <p className="mt-1 text-sm">{p.text}</p>
                    <div className="mt-1.5 flex gap-3 text-[11px] text-muted-foreground">
                      <span>{p.likes.toLocaleString()} likes</span>
                      <span>{p.shares.toLocaleString()} shares</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold">Top hashtags · today</h3>
            <div className="mt-3 space-y-2">
              {[
                { h: "#ElectionIntegrity", v: 412000, tone: "negative" as const },
                { h: "#AIRegulation", v: 298000, tone: "neutral" as const },
                { h: "#Chandrayaan", v: 241000, tone: "positive" as const },
                { h: "#DataBreach", v: 188000, tone: "negative" as const },
                { h: "#KeynoteRecap", v: 141000, tone: "positive" as const },
                { h: "#CentralBank", v: 98000, tone: "negative" as const },
              ].map((h) => (
                <div
                  key={h.h}
                  className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{h.h}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {(h.v / 1000).toFixed(0)}K mentions
                    </div>
                  </div>
                  <Tone tone={h.tone} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
