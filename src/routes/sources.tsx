import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Database, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/sources")({
  head: () => ({ meta: [{ title: "Data Sources — Sentinel AI" }] }),
  component: SourcesPage,
});

function SourcesPage() {
  const SOURCES = [
    { name: "Google News RSS Wire", type: "Live RSS Feed", status: "Active" },
    { name: "Wikidata Entity API", type: "SPARQL / REST", status: "Active" },
    { name: "Cloudflare DNS over HTTPS", type: "DoH Protocol", status: "Active" },
    { name: "RDAP Domain WHOIS", type: "REST Protocol", status: "Active" },
    { name: "GitHub Public Search API", type: "REST API", status: "Active" },
    { name: "Hacker News Algolia", type: "Search API", status: "Active" },
    { name: "OpenSky Flight Network", type: "REST API", status: "Active" },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Data Source Registry"
        description="Connected open-source intelligence APIs, RSS channels, and protocol endpoints."
      />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {SOURCES.map((s) => (
          <Card key={s.name} className="bg-[#111827] border-[#263548] p-4 space-y-2">
            <div className="text-[#F3F4F6] font-bold flex items-center gap-2">
              <Database className="size-4 text-[#3B82F6]" />
              {s.name}
            </div>
            <div className="text-[#94A3B8]">Protocol: {s.type}</div>
            <div className="text-[#10B981] flex items-center gap-1 text-[10px]">
              <CheckCircle2 className="size-3" />
              {s.status}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
