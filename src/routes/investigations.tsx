import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Tone } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  FolderOpen, Plus, Paperclip, FileText, ImageIcon, Link2, Users2, Clock,
  Sparkles, MessageSquare, ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/investigations")({
  head: () => ({ meta: [{ title: "AI Investigations — Sentinel AI" }] }),
  component: Page,
});

const cases = [
  { id: "INV-2041", title: "Vector-17 · surveillance leak", status: "Active", owner: "A. Chen", evidence: 42, confidence: 78, tone: "critical" as const },
  { id: "INV-2038", title: "#ElectionIntegrity CIB cluster", status: "Active", owner: "M. Ortega", evidence: 128, confidence: 88, tone: "high" as const },
  { id: "INV-2035", title: "Fintech vendor breach chatter", status: "Triage", owner: "K. Patel", evidence: 24, confidence: 61, tone: "high" as const },
  { id: "INV-2029", title: "Brand smear · Aster Motors", status: "Watch", owner: "R. Silva", evidence: 17, confidence: 42, tone: "medium" as const },
  { id: "INV-2011", title: "Deepfake · press briefing", status: "Closed", owner: "A. Chen", evidence: 63, confidence: 94, tone: "verified" as const },
];

const evidence = [
  { t: "09:42", type: "Tweet", src: "@osint_watch", note: "Coordinated cluster identified — 4 accounts, 90s window.", tone: "high" as const },
  { t: "09:31", type: "Image", src: "Telegram · channel_9821", note: "EXIF corroborates capture time; geolocation within 200m.", tone: "critical" as const },
  { t: "08:58", type: "Doc", src: "Leaked PDF · anonfiles", note: "Redacted memo consistent with prior authentic sample.", tone: "high" as const },
  { t: "08:12", type: "Video", src: "YouTube · GlobalNews", note: "Press briefing does not deny surveillance program.", tone: "medium" as const },
  { t: "07:04", type: "Post", src: "Reddit · r/netsec", note: "Analyst commentary corroborates fintech IOC.", tone: "medium" as const },
];

function Page() {
  return (
    <AppShell>
      <PageHeader
        title="AI Investigations"
        description="Structured case workspaces — evidence, relationships, and analyst notes, guided by AI."
        actions={
          <>
            <Button variant="outline" size="sm">Import case</Button>
            <Button size="sm" className="gap-1.5"><Plus className="size-3.5" />New investigation</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Cases list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><FolderOpen className="size-4" />Open cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-2">
            {cases.map((c, i) => (
              <button
                key={c.id}
                className={`w-full rounded-md border px-3 py-2 text-left transition ${i === 0 ? "border-primary/40 bg-primary/5" : "bg-card hover:bg-accent"}`}
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-mono">{c.id}</span>
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px]">{c.status}</Badge>
                </div>
                <div className="mt-0.5 text-sm font-medium leading-tight">{c.title}</div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{c.owner}</span>
                  <Tone tone={c.tone} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Case workspace */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">INV-2041</span>
                    <Badge variant="outline">Active</Badge>
                    <Tone tone="critical" />
                  </div>
                  <h2 className="mt-1 text-xl font-semibold">Vector-17 · surveillance leak</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Suspected exposure of internal surveillance program with imagery attributed to watchlist subject Vector-17.
                    Cross-linked with fintech breach chatter and CIB cluster INV-2038.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-md border bg-card px-3 py-2 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Evidence</div>
                    <div className="text-lg font-semibold tabular-nums">42</div>
                  </div>
                  <div className="rounded-md border bg-card px-3 py-2 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Confidence</div>
                    <div className="text-lg font-semibold tabular-nums">78%</div>
                    <Progress value={78} className="mt-1 h-1" />
                  </div>
                  <div className="rounded-md border bg-card px-3 py-2 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Analysts</div>
                    <div className="flex justify-center -space-x-2 pt-1">
                      {["AC", "MO", "KP"].map((a) => (
                        <span key={a} className="grid size-6 place-items-center rounded-full border-2 border-card bg-primary/10 text-[10px] font-semibold text-primary">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Clock className="size-4" />Evidence timeline</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {evidence.map((e, i) => (
                  <div key={i} className="relative pl-6">
                    <span className="absolute left-1.5 top-1.5 size-2 rounded-full bg-primary" />
                    {i < evidence.length - 1 && <span className="absolute left-[9px] top-4 h-full w-px bg-border" />}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-muted-foreground">{e.t}</span>
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{e.type}</Badge>
                      <span className="truncate text-muted-foreground">{e.src}</span>
                      <Tone tone={e.tone} />
                    </div>
                    <p className="mt-0.5 text-sm">{e.note}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Users2 className="size-4" />Relationships</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    { a: "Vector-17", rel: "linked to", b: "channel_9821", strength: 82 },
                    { a: "channel_9821", rel: "amplifies", b: "#ElectionIntegrity", strength: 71 },
                    { a: "INV-2038", rel: "related", b: "INV-2041", strength: 64 },
                    { a: "Fintech-A", rel: "mentioned in", b: "r/netsec", strength: 48 },
                  ].map((r, i) => (
                    <div key={i} className="rounded-md border bg-card p-2">
                      <div className="text-xs">
                        <span className="font-medium">{r.a}</span>{" "}
                        <span className="text-muted-foreground">{r.rel}</span>{" "}
                        <span className="font-medium">{r.b}</span>
                      </div>
                      <Progress value={r.strength} className="mt-1.5 h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-primary" />AI notes</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs">
                    Cross-corroboration across 3 independent sources raises confidence to 78%. Recommend
                    escalation and legal review before external disclosure.
                  </div>
                  <div className="rounded-md border bg-card p-2.5 text-xs">
                    Detected face-match on Vector-17 (71%) and voice-match on interview clip (66%).
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="size-4" />Analyst comments</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { u: "M. Ortega", t: "08:14", m: "EXIF metadata authentic. Suggest chain-of-custody review." },
                  { u: "A. Chen", t: "09:02", m: "Cross-linking with INV-2038 disinfo cluster. Confidence ↑ 12 pts." },
                ].map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{c.u.split(" ").map((x) => x[0]).join("")}</span>
                    <div className="min-w-0 flex-1 rounded-md border bg-card p-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{c.u}</span>
                        <span className="text-muted-foreground">{c.t}</span>
                      </div>
                      <p className="mt-0.5 text-sm">{c.m}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Textarea placeholder="Add a note or @mention an analyst…" className="min-h-20" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1 text-muted-foreground">
                  <Button size="sm" variant="ghost" className="h-8 gap-1.5"><Paperclip className="size-3.5" />Attach</Button>
                  <Button size="sm" variant="ghost" className="h-8 gap-1.5"><Link2 className="size-3.5" />Link</Button>
                  <Button size="sm" variant="ghost" className="h-8 gap-1.5"><ShieldCheck className="size-3.5" />Chain of custody</Button>
                </div>
                <Button size="sm">Post comment</Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                <FileText className="size-3.5" /> memo-redacted.pdf
                <ImageIcon className="size-3.5" /> exif-hit.jpg
                <Paperclip className="size-3.5" /> transcript.vtt
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}