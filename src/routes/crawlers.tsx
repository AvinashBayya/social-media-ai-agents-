import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, CheckCircle2, Activity } from "lucide-react";

export const Route = createFileRoute("/crawlers")({
  head: () => ({ meta: [{ title: "Crawler Status — Sentinel AI" }] }),
  component: CrawlersPage,
});

function CrawlersPage() {
  const CRAWLERS = [
    { name: "Google News RSS Collector", status: "ONLINE", rate: "12 req/min", target: "Global News" },
    { name: "Wikidata Entity Resolver", status: "ONLINE", rate: "45 req/min", target: "Entity Resolution" },
    { name: "Cloudflare DoH Resolver", status: "ONLINE", rate: "80 req/min", target: "DNS Telemetry" },
    { name: "GitHub Public Search Worker", status: "ONLINE", rate: "5 req/min", target: "Code Repositories" },
    { name: "Hacker News Algolia Stream", status: "ONLINE", rate: "20 req/min", target: "Tech Forums" },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Crawler Operations & Feed Health"
        description="Monitor status of real-time server-side collectors, RSS engines, and Wikidata API pipelines."
      />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CRAWLERS.map((c) => (
          <Card key={c.name} className="bg-[#111827] border-[#263548] p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F3F4F6] flex items-center gap-2">
                <Cpu className="size-4 text-[#10B981]" />
                {c.name}
              </span>
              <Badge className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 text-[10px]">
                {c.status}
              </Badge>
            </div>
            <div className="text-[#94A3B8]">Target: {c.target}</div>
            <div className="text-[#64748B] text-[10px]">Throughput: {c.rate}</div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
