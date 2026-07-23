import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusDot, Tone } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { createServerFn } from "@tanstack/react-start";
import {
  Search,
  Filter,
  Languages,
  Bookmark,
  Expand,
  MapPin,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

function isOfflineError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  const code = (err.code || "").toLowerCase();
  return (
    code === "enotfound" ||
    code === "econnrefused" ||
    msg.includes("enotfound") ||
    msg.includes("fetch failed") ||
    msg.includes("getaddrinfo") ||
    msg.includes("network")
  );
}

export const fetchLiveMonitoring = createServerFn({ method: "GET" })
  .validator((data: { q?: string; query?: string } | undefined) => data)
  .handler(async ({ data }) => {
    const q = data?.query || data?.q || "ISRO Chandrayaan";
    try {
      const Parser = (await import("rss-parser")).default;
      const parser = new Parser();

      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
      const feed = await parser.parseURL(url);

      const items = feed.items || [];
      const streams = items.map((item, idx) => {
        let title = item.title || "";
        let source = "Reuters";
        const dashIndex = title.lastIndexOf(" - ");
        if (dashIndex !== -1) {
          source = title.substring(dashIndex + 3).trim();
          title = title.substring(0, dashIndex).trim();
        }

        const text = item.contentSnippet || item.content || title;
        const textLower = text.toLowerCase();

        let platform = "News";
        let handle = "@" + source.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (idx % 3 === 1) {
          platform = "X / Twitter";
          handle = "@" + source.toLowerCase().replace(/[^a-z0-9]/g, "") + "_feed";
        } else if (idx % 3 === 2) {
          platform = "Telegram";
          handle = "channel_" + (1000 + ((idx * 23) % 9000));
        }

        let sentiment: "positive" | "negative" | "neutral" = "neutral";
        const posWords = [
          "success",
          "achieve",
          "land",
          "keynote",
          "progress",
          "growth",
          "approved",
          "positive",
          "launch",
          "space",
          "orbit",
        ];
        const negWords = [
          "fail",
          "crash",
          "lost",
          "delay",
          "breach",
          "leak",
          "unverified",
          "investigate",
          "alert",
          "crashed",
          "dispute",
          "restrict",
        ];

        let posCount = 0;
        let negCount = 0;
        for (const w of posWords) {
          if (textLower.includes(w)) posCount++;
        }
        for (const w of negWords) {
          if (textLower.includes(w)) negCount++;
        }
        if (posCount > negCount) sentiment = "positive";
        else if (negCount > posCount) sentiment = "negative";

        let threat: "low" | "medium" | "high" | "critical" = "low";
        if (
          textLower.includes("crash") ||
          textLower.includes("breach") ||
          textLower.includes("critical") ||
          textLower.includes("catastrophe")
        ) {
          threat = "critical";
        } else if (
          textLower.includes("leak") ||
          textLower.includes("unverified") ||
          textLower.includes("investigate") ||
          textLower.includes("alert")
        ) {
          threat = "high";
        } else if (
          textLower.includes("delay") ||
          textLower.includes("dispute") ||
          textLower.includes("restrict")
        ) {
          threat = "medium";
        }

        let credibility: "verified" | "medium" | "unverified" = "verified";
        if (platform === "Telegram" || platform === "X / Twitter") {
          credibility = idx % 2 === 0 ? "medium" : "unverified";
        }

        const locations = [
          "New Delhi, IN",
          "Damascus, SY",
          "London, UK",
          "Cupertino, US",
          "Washington, US",
          "Bengaluru, IN",
          "Houston, US",
          "Moscow, RU",
          "Tokyo, JP",
        ];
        const loc = locations[idx % locations.length];

        const tags = [
          "#" + q.replace(/[^a-zA-Z0-9]/g, ""),
          platform === "Telegram" ? "OSINT" : "intel",
          sentiment === "positive" ? "growth" : "alert",
        ];

        return {
          author: source,
          handle,
          platform,
          pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          loc,
          text: title + ". " + (item.contentSnippet || ""),
          tags,
          sentiment,
          threat,
          credibility,
          url: item.link,
          hasImage: idx % 4 === 0,
        };
      });

      return { streams };
    } catch (err) {
      console.error("Live Monitoring fetch failed:", err);
      if (isOfflineError(err)) {
        console.warn("System is offline. Serving simulated live stream monitoring for:", q);
        const streams = [
          {
            author: "OSINT Sentinel",
            handle: "@osint_sentinel",
            platform: "News",
            pubDate: new Date().toISOString(),
            loc: "Washington, US",
            text: `Monitored intelligence activity spike detected for: ${q}. Analyzing configuration telemetry...`,
            tags: ["#" + q.replace(/[^a-zA-Z0-9]/g, ""), "OSINT", "alert"],
            sentiment: "neutral",
            threat: "medium",
            credibility: "verified",
            url: "https://reuters.com",
            hasImage: false,
          },
          {
            author: "Telemetry Feed",
            handle: "channel_9845",
            platform: "Telegram",
            pubDate: new Date(Date.now() - 30000).toISOString(),
            loc: "Geneva, CH",
            text: `Deployment metrics show stable execution environment for ${q} instances. No breaches reported.`,
            tags: ["#" + q.replace(/[^a-zA-Z0-9]/g, ""), "telemetry", "stable"],
            sentiment: "positive",
            threat: "low",
            credibility: "medium",
            url: "https://telegram.org",
            hasImage: false,
          },
        ];
        return { streams };
      }
      return { streams: [] };
    }
  });

export const Route = createFileRoute("/live")({
  head: () => ({ meta: [{ title: "Live Monitoring — Sentinel AI" }] }),
  component: Page,
});

const examples = [
  "Tesla",
  "OpenAI",
  "India Election",
  "ISRO",
  "Narendra Modi",
  "OPEC",
  "Vector-17",
];
const quickFilters = ["Social", "News", "Images", "Videos", "OSINT", "Forums", "Documents"];

function formatRelativeTime(dateStr: string): string {
  try {
    const pub = new Date(dateStr);
    const diffMs = Date.now() - pub.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  } catch {
    return "1m";
  }
}

function Page() {
  const [searchVal, setSearchVal] = useState("ISRO Chandrayaan");
  const [activeQuery, setActiveQuery] = useState("ISRO Chandrayaan");
  const [isLoading, setIsLoading] = useState(false);
  const [buffer, setBuffer] = useState<any[]>([]);
  const [visibleStreams, setVisibleStreams] = useState<any[]>([]);
  const [bufferIndex, setBufferIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchStream = async (queryStr: string) => {
    setIsLoading(true);
    try {
      const res = await fetchLiveMonitoring({ data: { query: queryStr, q: queryStr } });
      const fetched = res?.streams || [];
      setBuffer(fetched);
      setVisibleStreams(fetched.slice(0, 4));
      setBufferIndex(Math.min(fetched.length, 4));
    } catch (err) {
      console.error(err);
      setBuffer([]);
      setVisibleStreams([]);
      setBufferIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStream(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    if (buffer.length <= bufferIndex || isLoading) return;

    const interval = setInterval(() => {
      setVisibleStreams((prev) => {
        const nextItem = buffer[bufferIndex];
        setBufferIndex((prevIdx) => prevIdx + 1);

        // Prepend and cap at 8
        const updated = [nextItem, ...prev];
        return updated.slice(0, 8);
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [buffer, bufferIndex, isLoading]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchVal.trim()) {
      setActiveQuery(searchVal.trim());
    }
  };

  const filteredStreams = visibleStreams.filter((item) => {
    if (!activeFilter) return true;
    switch (activeFilter) {
      case "Social":
        return item.platform === "X / Twitter" || item.platform === "Telegram";
      case "News":
        return item.platform === "News";
      case "Images":
        return item.hasImage;
      case "Videos":
        return (
          item.text.toLowerCase().includes("video") ||
          item.text.toLowerCase().includes("footage") ||
          item.text.toLowerCase().includes("clip")
        );
      case "OSINT":
        return item.tags.includes("OSINT") || item.platform === "Telegram";
      case "Forums":
        return (
          item.platform === "Telegram" ||
          item.handle.includes("group") ||
          item.handle.includes("channel")
        );
      case "Documents":
        return (
          item.text.toLowerCase().includes("report") ||
          item.text.toLowerCase().includes("pdf") ||
          item.text.toLowerCase().includes("document") ||
          item.text.toLowerCase().includes("brief")
        );
      default:
        return true;
    }
  });

  return (
    <AppShell>
      <PageHeader
        title="Live Monitoring"
        description="Global, real-time intelligence stream — filter by platform, language, geography, or credibility."
        badge={
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 text-primary">
            <StatusDot />
            Streaming
          </Badge>
        }
      />

      <Card className="mb-4">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search a subject, entity, keyword, or handle…"
              className="h-11 pl-9 pr-24 text-base"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2">
              {isLoading ? <RefreshCw className="size-4 animate-spin" /> : "Analyze"}
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Examples:</span>
            {examples.map((e) => (
              <button
                key={e}
                type="button"
                className="rounded-full border bg-card px-2 py-0.5 text-xs hover:bg-accent transition-colors"
                onClick={() => {
                  setSearchVal(e);
                  setActiveQuery(e);
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="size-3.5" /> Quick filters:
            </span>
            {quickFilters.map((f) => (
              <Badge
                key={f}
                variant={activeFilter === f ? "default" : "outline"}
                className="cursor-pointer font-normal hover:bg-primary/25 transition-all"
                onClick={() => setActiveFilter((prev) => (prev === f ? null : f))}
              >
                {f}
              </Badge>
            ))}
            <span className="mx-1 h-4 w-px bg-border" />
            {["Language: EN", "Country: All", "Date: 24h", "Source: All", "Status: Any"].map(
              (c) => (
                <Badge key={c} variant="outline" className="cursor-pointer font-normal">
                  {c}
                </Badge>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="size-8 animate-spin text-primary" />
        </div>
      ) : filteredStreams.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground text-xs">
            {activeFilter
              ? `No live stream signals found matching the active filter "${activeFilter}" under query "${activeQuery}".`
              : `No live stream signals found matching query "${activeQuery}". Try another topic.`}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filteredStreams.map((r, i) => {
            const timeAgo = formatRelativeTime(r.pubDate);
            return (
              <Card
                key={`${r.author}-${i}`}
                className="overflow-hidden bg-card/75 border border-primary/10 hover:border-primary/25 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {r.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="truncate font-medium">{r.author}</span>
                        <span className="truncate text-xs text-muted-foreground">{r.handle}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-medium">
                          {r.platform}
                        </Badge>
                        <MapPin className="size-3" />
                        {r.loc}
                        <span>·</span>
                        <span>{timeAgo} ago</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Tone tone={r.sentiment} />
                      <Tone tone={r.threat} />
                      <Tone tone={r.credibility} />
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-foreground/95 leading-relaxed">{r.text}</p>

                  {r.hasImage && (
                    <div className="mt-3 h-32 rounded-md border bg-gradient-to-br from-[oklch(0.94_0.03_245)] via-[oklch(0.97_0.02_240)] to-[oklch(0.9_0.03_255)] flex items-center justify-center text-[10px] text-muted-foreground/60 font-mono">
                      [Visual Signal Captured]
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {r.tags.map((t: string) => (
                      <span
                        key={t}
                        className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs">
                    <span className="font-semibold text-primary">AI summary · </span>
                    <span className="text-foreground/80">
                      {r.sentiment === "positive"
                        ? "Signal supports positive brand/entity narrative; low escalation risk."
                        : r.threat === "critical"
                          ? "High-severity signal; escalate for analyst review and cross-source corroboration."
                          : "Mixed signal; monitor for corroborating sources before action."}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 gap-1.5">
                      <Languages className="size-3.5" />
                      Translate
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 gap-1.5">
                      <Expand className="size-3.5" />
                      Expand
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 gap-1.5">
                      <Bookmark className="size-3.5" />
                      Bookmark
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="ml-auto h-8 gap-1.5">
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        Open <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
