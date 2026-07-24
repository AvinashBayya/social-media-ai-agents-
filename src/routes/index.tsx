import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader, Tone, StatusDot } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchNews, fetchReviews, fetchOSINT, fetchSearchIntelligence, fetchSocialIntelligence, fetchMediaIntelligence } from "./news";
import {
  Search, FolderOpen, Bookmark, User, TrendingUp, Sparkles, MapPin,
  ShieldAlert, Globe2, Radio, Newspaper, Video, Image as ImageIcon,
  MessageCircle, ExternalLink, Calendar, Network, FileText, Activity,
  Terminal, CheckCircle2, ChevronRight, Download, RefreshCw, Plus, Clock,
  ZoomIn, ZoomOut, Maximize2, Share2, GitBranch, ArrowUpRight, Bot
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, Legend
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Research Center — Sentinel AI" },
      { name: "description", content: "AI-powered global OSINT, social, and sentiment intelligence platform." },
    ],
  }),
  component: ResearchCenter,
});

interface APIStory {
  primaryTitle: string;
  primarySource: string;
  primaryLink?: string;
  url?: string;
  sourceUrl?: string;
  pubDate: string;
  sourceCount: number;
  importanceScore: number;
  velocity: {
    level: string;
    sourcesPerHour: number;
  };
  category: string;
  threatLevel: string;
  countryCode: string | null;
  isAlert: boolean;
}

// Tailored search-specific mock details
interface ProfileData {
  summary: string;
  progress: number;
  risk: number;
  sentiment: number;
  credibility: number;
  findings: string[];
  recommendations: string[];
  whois: Record<string, string>;
  dns: { type: string; record: string }[];
  github: string[];
  business: Record<string, string>;
  socialProfiles: { platform: string; handle: string; followers: string }[];
}

const PROFILE_TEMPLATES: Record<string, ProfileData> = {
  Tesla: {
    summary: "Tesla, Inc. displays medium risk indicators centered around Gigafactory Berlin regulatory hurdles and EU automotive tariffs. Sentiment is neutral-to-negative in retail investor spaces, balanced by positive spikes regarding autonomous drive software rollout.",
    progress: 94,
    risk: 54,
    sentiment: -8,
    credibility: 92,
    findings: [
      "Water conservation regulatory disputes identified at Berlin Gigafactory site.",
      "Coordinated short-selling discussions active on retail trading subreddits.",
      "DNS updates logged on production subsystems last week."
    ],
    recommendations: [
      "Monitor European environmental compliance registry updates.",
      "Escalate tracking of Berlin Gigafactory operational feeds.",
      "Perform regular DNS history checks on core domains."
    ],
    whois: {
      Domain: "tesla.com",
      Registrar: "MarkMonitor Inc.",
      Created: "1997-11-04",
      Expires: "2029-11-03",
      NS: "dns1.p01.nsone.net, ns1.markmonitor.com"
    },
    dns: [
      { type: "A", record: "198.51.100.42 (Primary Web Server)" },
      { type: "MX", record: "10 mail.tesla.com (Inbound Gateway)" },
      { type: "TXT", record: "v=spf1 include:spf.mandrillapp.com -all" }
    ],
    github: ["tesla-motors/model3-can-bus", "tesla-motors/energy-gateway-monitor", "tesla-motors/tesla-ap-reverse"],
    business: {
      Status: "Active / Good Standing",
      Jurisdiction: "Delaware, US",
      FileNo: "3679812",
      HQ: "13101 Tesla Rd, Austin, TX"
    },
    socialProfiles: [
      { platform: "X / Twitter", handle: "@Tesla", followers: "22.4M" },
      { platform: "YouTube", handle: "TeslaMotors", followers: "2.8M" },
      { platform: "LinkedIn", handle: "tesla", followers: "11.2M" }
    ]
  },
  OpenAI: {
    summary: "OpenAI exhibits high research progress with prominent media focus on public release of reasoning models and corporate structure modifications. Sentiment remains heavily positive in developer ecosystems but critical in regulatory forums.",
    progress: 100,
    risk: 32,
    sentiment: 36,
    credibility: 96,
    findings: [
      "Surge in developer forum signups following reasoning model preview.",
      "Trademark filings registered for new model identifiers.",
      "Corporate restructuring documents circulating in legal forums."
    ],
    recommendations: [
      "Track trademark database updates for newly registered tokens.",
      "Monitor federal antitrust regulatory watchlists.",
      "Assess open-source repository contributions for credential leaks."
    ],
    whois: {
      Domain: "openai.com",
      Registrar: "GoDaddy.com, LLC",
      Created: "2015-06-24",
      Expires: "2028-06-24",
      NS: "dns1.p04.nsone.net, dns2.p04.nsone.net"
    },
    dns: [
      { type: "A", record: "104.18.7.12 (Cloudflare CDN Edge)" },
      { type: "MX", record: "10 asg.mta.openai.com (Microsoft 365)" },
      { type: "TXT", record: "v=spf1 include:spf.protection.outlook.com ~all" }
    ],
    github: ["openai/openai-cookbook", "openai/whisper", "openai/triton", "openai/gym"],
    business: {
      Status: "Active",
      Jurisdiction: "Delaware, US",
      FileNo: "5791244",
      HQ: "3180 18th St, San Francisco, CA"
    },
    socialProfiles: [
      { platform: "X / Twitter", handle: "@OpenAI", followers: "6.2M" },
      { platform: "GitHub", handle: "openai", followers: "84K" },
      { platform: "LinkedIn", handle: "openai", followers: "3.1M" }
    ]
  }
};

const DEFAULT_PROFILE = (query: string): ProfileData => ({
  summary: `Automated intelligence scan completed for "${query}". Multi-source collector profiling returns stable operations with minor sentiment fluctuation. Digital footprint analysis shows active domains with correct DNS registration and low security risks.`,
  progress: 88,
  risk: 15,
  sentiment: 12,
  credibility: 85,
  findings: [
    `Public references mapped to "${query}" across news wires.`,
    `DNS records successfully resolved and mapped to secure subnets.`,
    `No active credentials leaks found on public repositories.`
  ],
  recommendations: [
    `Continue routine continuous scanning on topic.`,
    `Set alerts for sudden mention volume shifts (>50%).`,
    `Perform periodic WHOIS record monitoring.`
  ],
  whois: {
    Domain: `${query.toLowerCase().replace(/[^a-z0-9]/g, "") || "target"}.com`,
    Registrar: "MarkMonitor Inc.",
    Created: "2004-03-12",
    Expires: "2028-03-11",
    NS: "ns1.dns.com, ns2.dns.com"
  },
  dns: [
    { type: "A", record: "203.0.113.88 (Target Network)" },
    { type: "MX", record: "10 mail-gateway.target.com" }
  ],
  github: [`${query.toLowerCase()}/public-sdk`, `${query.toLowerCase()}/documentation`],
  business: {
    Status: "Active / Registered",
    Jurisdiction: "Standard Corporate Registry",
    FileNo: "8821945",
    HQ: "Global Distribution Network"
  },
  socialProfiles: [
    { platform: "X / Twitter", handle: `@${query.replace(/\s+/g, "")}`, followers: "125K" },
    { platform: "LinkedIn", handle: query.toLowerCase(), followers: "450K" }
  ]
});

interface ReviewItem {
  sourceName: string;
  platformIcon: string;
  rating: number;
  maxRating: number;
  content: string;
  url: string;
  tone: "positive" | "negative" | "neutral" | "critical" | "high" | "medium" | "low" | "verified" | "unverified";
}

const quickFilters = ["Social", "News", "Images", "Videos", "OSINT", "Forums", "Documents"];
const validTones = new Set(["positive", "negative", "neutral", "critical", "high", "medium", "low", "verified", "unverified"]);

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
    return "1h";
  }
}

function ResearchCenter() {
  const [searchVal, setSearchVal] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Visibility limits for View More buttons
  const [visibleSocialCount, setVisibleSocialCount] = useState(5);
  const [visibleNewsCount, setVisibleNewsCount] = useState(3);
  const [visibleSearchCount, setVisibleSearchCount] = useState(5);

  // Real media data fetched from APIs/agents
  const [mediaData, setMediaData] = useState<{ images: any[]; videos: any[]; documents: any[] }>({ images: [], videos: [], documents: [] });
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Simulation steps
  const [searchStep, setSearchStep] = useState(0);
  const steps = [
    "Entity classified: resolving subject parameters...",
    "Generating dynamic multi-vector search strategy...",
    "Launching intelligence acquisition crawlers...",
    "Harvesting OSINT, WHOIS and DNS records...",
    "Fetching live RSS news wires & correlating content...",
    "Running Sentinel AI sentiment and risk models...",
    "Synthesizing Knowledge Graph and case timeline...",
    "Workspace ready."
  ];

  // Feed/stories state
  const [stories, setStories] = useState<APIStory[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [osintData, setOsintData] = useState<any>(null);
  const [isLoadingOSINT, setIsLoadingOSINT] = useState(false);
  const [searchResultData, setSearchResultData] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [socialMentions, setSocialMentions] = useState<any[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<any[]>([]);
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);

  useEffect(() => {
    if (isSearching) {
      setSearchStep(0);
      const interval = setInterval(() => {
        setSearchStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            setIsSearching(false);
            setShowWorkspace(true);
            return prev;
          }
          return prev + 1;
        });
      }, 350);
      return () => clearInterval(interval);
    }
  }, [isSearching]);

  // Fetch news when query is analyzed
  const triggerSearch = async (query: string) => {
    if (!query.trim()) return;
    setActiveQuery(query);
    setIsSearching(true);
    setShowWorkspace(false);
    setIsLoadingNews(true);
    setIsLoadingReviews(true);
    setIsLoadingOSINT(true);
    setIsLoadingSearch(true);
    setIsLoadingMedia(true);
    setVisibleSocialCount(5);
    setVisibleNewsCount(3);
    setVisibleSearchCount(5);

    try {
      const res = await fetchNews({ data: { query, q: query } });
      if (res && res.stories && res.stories.length > 0) {
        setStories(res.stories);
      } else {
        setStories([]);
      }

      const revRes = await fetchReviews({ data: { query, q: query } });
      setReviewsData(revRes);

      const osintRes = await fetchOSINT({ data: { query, q: query } });
      setOsintData(osintRes);

      const searchRes = await fetchSearchIntelligence({ data: { query, q: query } });
      setSearchResultData(searchRes?.results || []);

      const socialRes = await fetchSocialIntelligence({ data: { query, q: query } });
      setSocialMentions(socialRes?.mentions || []);
      setSocialProfiles(socialRes?.profiles || []);

      const mediaRes = await fetchMediaIntelligence({ data: { query, q: query } });
      setMediaData(mediaRes || { images: [], videos: [], documents: [] });
    } catch (err) {
      console.error(err);
      setStories([]);
      setReviewsData(null);
      setOsintData(null);
      setSearchResultData([]);
      setSocialMentions([]);
      setSocialProfiles([]);
      setMediaData({ images: [], videos: [], documents: [] });
    } finally {
      setIsLoadingNews(false);
      setIsLoadingReviews(false);
      setIsLoadingOSINT(false);
      setIsLoadingSearch(false);
      setIsLoadingSocial(false);
      setIsLoadingMedia(false);
    }
  };

  const currentProfile = PROFILE_TEMPLATES[activeQuery] || DEFAULT_PROFILE(activeQuery);

  // Group outlets dynamic stats
  const getOutletCoverage = (storiesList: APIStory[]) => {
    const counts: Record<string, { count: number; maxThreat: string }> = {};
    for (const s of storiesList) {
      const srcName = s.primarySource || "Unknown Source";
      if (!counts[srcName]) {
        counts[srcName] = { count: 0, maxThreat: s.threatLevel };
      }
      counts[srcName].count += 1;
      if (s.threatLevel === "high" || s.threatLevel === "critical") {
        counts[srcName].maxThreat = s.threatLevel;
      }
    }

    return Object.entries(counts).map(([name, data]) => {
      const cred = Math.min(98, 85 + (name.charCodeAt(0) % 13));
      let tone: "verified" | "medium" | "unverified" = "verified";
      if (data.maxThreat === "critical") tone = "unverified";
      else if (data.maxThreat === "high") tone = "medium";

      return {
        name,
        articles: data.count * 15 + 5,
        credibility: cred,
        tone,
      };
    }).sort((a, b) => b.articles - a.articles);
  };

  const outlets = getOutletCoverage(stories.length > 0 ? stories : []);

  // SVG network graph coordinate definitions relative to center
  const getGraphNodes = (q: string) => {
    return [
      { id: "center", label: q, type: "org" as const, x: 400, y: 260, r: 24 },
      { id: "ceo", label: q === "Tesla" ? "Elon Musk" : q === "OpenAI" ? "Sam Altman" : "Lead Entity", type: "person" as const, x: 260, y: 180, r: 18 },
      { id: "domain", label: currentProfile.whois.Domain, type: "domain" as const, x: 540, y: 190, r: 18 },
      { id: "hq", label: q === "Tesla" ? "Austin, TX" : q === "OpenAI" ? "San Francisco" : "Global HQ", type: "country" as const, x: 320, y: 380, r: 18 },
      { id: "news", label: stories[0]?.primarySource || "BBC News", type: "social" as const, x: 500, y: 360, r: 16 },
      { id: "ip", label: "203.0.113.88", type: "phone" as const, x: 620, y: 300, r: 14 },
      { id: "case", label: "INV-2041", type: "email" as const, x: 180, y: 300, r: 14 }
    ];
  };

  const graphNodes = getGraphNodes(activeQuery);
  const graphEdges = [
    { from: "center", to: "ceo", rel: "led by" },
    { from: "center", to: "domain", rel: "operates" },
    { from: "center", to: "hq", rel: "located at" },
    { from: "center", to: "news", rel: "covered by" },
    { from: "domain", to: "ip", rel: "resolves to" },
    { from: "ceo", to: "case", rel: "flagged in" }
  ];

  const TYPE_STYLE = {
    person: { fill: "oklch(0.6_0.19_255)", ring: "oklch(0.6_0.19_255)" },
    org: { fill: "oklch(0.68_0.17_145)", ring: "oklch(0.68_0.17_145)" },
    country: { fill: "oklch(0.78_0.16_85)", ring: "oklch(0.78_0.16_85)" },
    domain: { fill: "oklch(0.7_0.16_210)", ring: "oklch(0.7_0.16_210)" },
    phone: { fill: "oklch(0.62_0.23_27)", ring: "oklch(0.62_0.23_27)" },
    email: { fill: "oklch(0.55_0.15_300)", ring: "oklch(0.55_0.15_300)" },
    social: { fill: "oklch(0.4_0.02_250)", ring: "oklch(0.4_0.02_250)" },
  };

  return (
    <AppShell>
      {!showWorkspace && !isSearching && (
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary animate-pulse">
            <Bot className="size-4" /> Global Intelligence Engine Active
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
            Sentinel AI
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            Enterprise AI-Powered Intelligence, OSINT & Sentiment Analysis Platform
          </p>

          {/* Centered Search Box */}
          <div className="relative mt-8 w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search a Person, Company, Organization, Domain, Email, Phone Number, Topic or Hashtag..."
              className="h-14 pl-12 pr-28 text-base border-primary/20 bg-card shadow-2xl focus-visible:ring-primary/45 rounded-lg"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && triggerSearch(searchVal)}
            />
            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-md font-semibold text-sm"
              onClick={() => triggerSearch(searchVal)}
            >
              Analyze
            </Button>
          </div>

          {/* Quick Search Templates */}
          <div className="mt-8 w-full max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Search Templates</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { label: "Find OpenAI info", query: "OpenAI" },
                { label: "Monitor Tesla", query: "Tesla" },
                { label: "Investigate John Doe", query: "John Doe" },
                { label: "Track #AI", query: "#AI" },
                { label: "Monitor Apple Inc", query: "Apple Inc" },
                { label: "Search google.com", query: "google.com" }
              ].map((t) => (
                <Button
                  key={t.label}
                  variant="outline"
                  className="justify-start text-xs border-primary/10 bg-card/60 hover:bg-primary/5 hover:border-primary/30 py-4"
                  onClick={() => {
                    setSearchVal(t.query);
                    triggerSearch(t.query);
                  }}
                >
                  <Sparkles className="mr-2 size-3.5 text-primary" />
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Dashboard Hub: Recent / Pinned cases */}
          <div className="mt-12 grid w-full gap-4 text-left sm:grid-cols-3">
            <Card className="bg-card/40 border-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FolderOpen className="size-4 text-primary" /> Recent Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { id: "INV-2041", title: "Vector-17 · surveillance leak" },
                  { id: "INV-2035", title: "Fintech vendor breach" }
                ].map((c) => (
                  <div key={c.id} className="flex flex-col rounded-md border p-2 bg-card/45 hover:bg-accent/40 cursor-pointer" onClick={() => { setSearchVal(c.title); triggerSearch(c.title); }}>
                    <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span>
                    <span className="font-medium text-xs truncate mt-0.5">{c.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Bookmark className="size-4 text-primary" /> Pinned Investigations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { id: "INV-2038", title: "#ElectionIntegrity CIB cluster" },
                  { id: "INV-2029", title: "Aster Motors brand protection" }
                ].map((c) => (
                  <div key={c.id} className="flex flex-col rounded-md border p-2 bg-card/45 hover:bg-accent/40 cursor-pointer" onClick={() => { setSearchVal(c.title); triggerSearch(c.title); }}>
                    <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span>
                    <span className="font-medium text-xs truncate mt-0.5">{c.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <User className="size-4 text-primary" /> Saved Profiles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { name: "Sam Altman", type: "CEO, OpenAI" },
                  { name: "Elon Musk", type: "CEO, Tesla" }
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-md border p-2 bg-card/45 hover:bg-accent/40 cursor-pointer" onClick={() => { setSearchVal(p.name); triggerSearch(p.name); }}>
                    <div className="min-w-0">
                      <div className="font-medium text-xs">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{p.type}</div>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Ingestion & Analysis terminal progress */}
      {isSearching && (
        <div className="mx-auto max-w-2xl py-24">
          <Card className="border-primary/20 bg-slate-950 font-mono text-xs shadow-2xl">
            <CardHeader className="border-b border-primary/10 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-primary" />
                <span className="font-semibold text-primary-foreground">Sentinel Ingestion Core v4.2</span>
                <span className="ml-auto size-2.5 rounded-full bg-yellow-500 animate-ping" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2 select-none">
              <div className="text-muted-foreground">Initializing target research pipeline for: <strong className="text-white">"{activeQuery}"</strong></div>
              <div className="mt-3 space-y-1.5">
                {steps.map((step, idx) => {
                  const isDone = searchStep > idx;
                  const isActive = searchStep === idx;
                  return (
                    <div key={idx} className={`flex items-start gap-2 ${isDone ? "text-primary/90" : isActive ? "text-yellow-400" : "text-muted-foreground/40"}`}>
                      {isDone ? (
                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                      ) : isActive ? (
                        <RefreshCw className="size-4 animate-spin text-yellow-400 shrink-0" />
                      ) : (
                        <span className="size-4 shrink-0 rounded-full border border-muted/20" />
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                <Progress value={(searchStep / (steps.length - 1)) * 100} className="h-full bg-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investigation Case Workspace */}
      {showWorkspace && (
        <div>
          {/* Workspace Case Header */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-wider">INV-{Math.abs(activeQuery.split("").reduce((a,c)=>a+c.charCodeAt(0), 1000))}</span>
                <Badge variant="outline" className="text-primary border-primary/30">Active Investigation</Badge>
                <Badge variant="secondary" className="gap-1"><Sparkles className="size-3 text-primary" />AI Synthesized</Badge>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {activeQuery} <span className="text-xs font-normal text-muted-foreground">· Target Workspace</span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                Dynamic OSINT and media intelligence correlation folder. Last ingestion cycle completed just now.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowWorkspace(false)}>
                <RefreshCw className="size-3.5" /> New Search
              </Button>
              <Button size="sm" className="gap-1.5">
                <Download className="size-3.5" /> Export Case
              </Button>
            </div>
          </div>

          {/* Dedicated Tab Headers */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 border-b bg-transparent p-0 mb-4 justify-start overflow-x-auto">
              {[
                { id: "overview", label: "Overview" },
                { id: "social", label: "Social Intelligence" },
                { id: "news", label: "News Intelligence" },
                { id: "search", label: "Search Intelligence" },
                { id: "osint", label: "OSINT Intelligence" },
                { id: "media", label: "Media" },
                { id: "timeline", label: "Timeline" },
                { id: "graph", label: "Knowledge Graph" },
                { id: "entities", label: "Entities" },
                { id: "analytics", label: "Analytics" },
                { id: "reports", label: "Reports" },
                { id: "reviews", label: "Reviews" }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-t-md border-b-2 border-transparent px-3.5 py-2 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-primary/5 bg-transparent"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* TAB CONTENTS */}

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">
              {/* KPIs Row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Confidence Score</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{currentProfile.credibility}%</span>
                      <span className="text-[10px] text-green-500 font-semibold">High Confidence</span>
                    </div>
                    <Progress value={currentProfile.credibility} className="mt-2 h-1 bg-muted" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overall Risk</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{currentProfile.risk}/100</span>
                      <span className={`text-[10px] font-semibold ${currentProfile.risk > 50 ? "text-amber-500" : "text-green-500"}`}>
                        {currentProfile.risk > 50 ? "Elevated" : "Low Risk"}
                      </span>
                    </div>
                    <Progress value={currentProfile.risk} className="mt-2 h-1 bg-muted" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Public Sentiment</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{currentProfile.sentiment > 0 ? `+${currentProfile.sentiment}` : currentProfile.sentiment}</span>
                      <span className={`text-[10px] font-semibold ${currentProfile.sentiment > 0 ? "text-green-500" : "text-red-500"}`}>
                        {currentProfile.sentiment > 0 ? "Positive" : "Negative"}
                      </span>
                    </div>
                    <Progress value={Math.max(0, currentProfile.sentiment + 50)} className="mt-2 h-1 bg-muted" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Evidence Collected</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{stories.length * 4 + 8}</span>
                      <span className="text-[10px] text-muted-foreground">across 8 platforms</span>
                    </div>
                    <Progress value={80} className="mt-2 h-1 bg-muted" />
                  </CardContent>
                </Card>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Bot className="size-4 text-primary" />Executive Briefing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {currentProfile.summary}
                    </p>
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key OSINT Discoveries</h4>
                      <ul className="space-y-2 text-xs">
                        {currentProfile.findings.map((f, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Sparkles className="size-4 text-primary" />AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <p className="text-muted-foreground">Sentinel AI analysis suggests targeting these areas next:</p>
                    <div className="space-y-2">
                      {currentProfile.recommendations.map((r, idx) => (
                        <div key={idx} className="rounded-md border bg-card/80 p-2 border-primary/10">
                          <span className="font-semibold text-primary">Rec 0{idx+1} · </span>
                          <span className="text-foreground/80">{r}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* SOCIAL TAB */}
            <TabsContent value="social" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1"><RefreshCw className="size-3.5" /> Filters:</span>
                  {quickFilters.map((f) => (
                    <Badge key={f} variant="outline" className="cursor-pointer font-normal">{f}</Badge>
                  ))}
                </div>
                {isLoadingSocial && <RefreshCw className="size-4 animate-spin text-primary" />}
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                {(socialProfiles.length > 0 ? socialProfiles : currentProfile.socialProfiles).map((p) => {
                  const isFound = p.handle && p.handle !== "No public profile found";
                  return (
                    <Card key={p.platform} className={isFound ? "border-primary/10 bg-card" : "opacity-60 bg-muted/20 border-dashed"}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground bg-primary/10 px-2 py-0.5 rounded text-primary">{p.platform}</span>
                          <span className="text-xs text-muted-foreground">
                            {isFound && p.followers !== "N/A"
                              ? p.platform === "Reddit"
                                ? p.followers
                                : `${p.followers} followers`
                              : "Profile not registered"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-foreground truncate">{p.handle}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Status: {isFound ? (p.status || "Monitored · Active Ingestion") : "Inactive"}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Feed simulation */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Recent Social Mentions</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {isLoadingSocial ? (
                    <div className="flex justify-center items-center py-12"><RefreshCw className="size-6 animate-spin text-primary" /></div>
                  ) : socialMentions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs">
                      No recent social media mentions found matching query "{activeQuery}". Try clicking the "Analyze" button.
                    </div>
                  ) : (
                    <>
                      {socialMentions.slice(0, visibleSocialCount).map((p, idx) => {
                        const timeAgo = formatRelativeTime(p.pubDate);
                        return (
                          <div
                            key={idx}
                            className="p-4 text-xs space-y-1 hover:bg-accent/40 cursor-pointer transition-colors"
                            onClick={() => window.open(p.url, "_blank", "noopener,noreferrer")}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                                {p.author} <ExternalLink className="size-3 text-muted-foreground inline" />
                              </span>
                              <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-medium scale-90">{p.platform}</Badge>
                              <span className="text-muted-foreground">· {timeAgo} ago</span>
                              <div className="ml-auto"><Tone tone={p.tone} /></div>
                            </div>
                            <p className="text-foreground/80 mt-1 leading-relaxed">{p.text}</p>
                            <div className="flex gap-4 text-muted-foreground text-[10px] mt-2">
                              <span>Likes: {p.likes}</span>
                              <span>Shares: {p.shares}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="p-3 flex justify-center bg-card">
                        {visibleSocialCount < socialMentions.length ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setVisibleSocialCount(prev => Math.min(prev + 5, socialMentions.length))}
                            className="text-xs h-7 px-3"
                          >
                            View More
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 font-medium py-1.5">That's it for now</span>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEWS TAB (Live filtered RSS Feeds) */}
            <TabsContent value="news" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2"><Newspaper className="size-4" /> Live Wires</h3>
                  <p className="text-xs text-muted-foreground">Concurrently aggregated feeds filtered for key phrase: <strong>"{activeQuery}"</strong></p>
                </div>
                {isLoadingNews && <RefreshCw className="size-4 animate-spin text-primary" />}
              </div>

              <div className="grid gap-3">
                {stories.length > 0 ? (
                  <>
                    {stories.slice(0, visibleNewsCount).map((s, i) => {
                      const timeAgo = formatRelativeTime(s.pubDate);
                      const threatTone = validTones.has(s.threatLevel) ? (s.threatLevel as any) : "neutral";
                      const cred = s.isAlert ? "unverified" : "verified";

                      return (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">{s.primarySource}</span>
                              <MapPin className="size-3" />{s.countryCode || "Global"}
                              <span>·</span>
                              <span>{timeAgo} ago</span>
                              <div className="ml-auto flex gap-1.5">
                                <Tone tone={threatTone} />
                                <Tone tone={cred} />
                              </div>
                            </div>
                            <h3 className="mt-2 text-base font-semibold leading-snug">{s.primaryTitle}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Analyzed across {s.sourceCount} outlets. Category: {s.category || "general"}.
                            </p>
                            <div className="mt-2 flex gap-1.5 items-center">
                              <Badge variant="secondary" className="font-normal text-[10px]">{s.sourceCount} outlets · Importance {s.importanceScore}%</Badge>
                              {s.url && (
                                <Button asChild size="sm" variant="ghost" className="ml-auto h-6 gap-1 text-[10px]">
                                  <a 
                                    href={s.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="open-link"
                                  >
                                    Open <ExternalLink className="size-3" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    <div className="p-2 flex justify-center">
                      {visibleNewsCount < stories.length ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setVisibleNewsCount(prev => Math.min(prev + 5, stories.length))}
                          className="text-xs h-7 px-3"
                        >
                          View More
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 font-medium py-1.5">That's it for now</span>
                      )}
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground text-xs">
                      No active feed headlines found matching query "{activeQuery}". Try "Tesla", "AI", or "India".
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* SEARCH TAB */}
            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Search Engines Results</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingSearch ? (
                    <div className="flex justify-center items-center py-12"><RefreshCw className="size-6 animate-spin text-primary" /></div>
                  ) : searchResultData.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs">
                      No search engine results found matching query "{activeQuery}". Try clicking the "Analyze" button.
                    </div>
                  ) : (
                    <>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/40 font-semibold">
                            <th className="p-3">Result Target</th>
                            <th className="p-3 w-[80px]">Rank</th>
                            <th className="p-3 w-[120px]">Indexed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {searchResultData.slice(0, visibleSearchCount).map((item, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-accent/40 cursor-pointer transition-colors"
                              onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                            >
                              <td className="p-3">
                                <div className="font-medium text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                                  {item.title} <ExternalLink className="size-3 text-muted-foreground inline" />
                                </div>
                                <div className="text-[10px] text-muted-foreground truncate max-w-[450px]">{item.displayUrl}</div>
                                {item.snippet && (
                                  <div className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2 max-w-[550px]" dangerouslySetInnerHTML={{ __html: item.snippet }}></div>
                                )}
                              </td>
                              <td className="p-3 tabular-nums font-semibold text-primary">{idx + 1}</td>
                              <td className="p-3 text-muted-foreground">
                                {idx === 0 ? "24h ago" : idx === 1 ? "2 days ago" : `${idx + 1} days ago`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div className="p-3 flex justify-center bg-card border-t">
                        {visibleSearchCount < searchResultData.length ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setVisibleSearchCount(prev => Math.min(prev + 5, searchResultData.length))}
                            className="text-xs h-7 px-3"
                          >
                            View More
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 font-medium py-1.5">That's it for now</span>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* OSINT TAB */}
             <TabsContent value="osint" className="space-y-4">
              {(() => {
                const whoisDisplay = osintData?.whois || currentProfile.whois;
                const dnsDisplay = osintData ? [
                  { type: "A", record: osintData.dns.a },
                  { type: "MX", record: osintData.dns.mx }
                ] : currentProfile.dns;
                const githubDisplay = osintData?.github || currentProfile.github.map(g => ({ name: g, url: "https://github.com" }));
                const corporateDisplay = osintData?.corporate || currentProfile.business;

                return (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-1.5"><Globe2 className="size-4" />WHOIS Registration</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2 text-xs">
                        {isLoadingOSINT ? (
                          <div className="flex justify-center py-4"><RefreshCw className="size-4 animate-spin text-primary" /></div>
                        ) : (
                          Object.entries(whoisDisplay).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b pb-1">
                              <span className="font-medium text-muted-foreground">{key}</span>
                              <span className="font-mono text-foreground">{String(value)}</span>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-1.5"><GitBranch className="size-4" />DNS Nameservers</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2 text-xs">
                        {isLoadingOSINT ? (
                          <div className="flex justify-center py-4"><RefreshCw className="size-4 animate-spin text-primary" /></div>
                        ) : (
                          dnsDisplay.map((dnsRec: any, idx: number) => (
                            <div key={idx} className="flex flex-col border-b pb-1">
                              <span className="font-bold text-primary text-[10px]">{dnsRec.type}</span>
                              <span className="font-mono text-foreground truncate mt-0.5">{dnsRec.record}</span>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-1.5"><FileText className="size-4" />GitHub Repositories</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2 text-xs">
                        {isLoadingOSINT ? (
                          <div className="flex justify-center py-4"><RefreshCw className="size-4 animate-spin text-primary" /></div>
                        ) : githubDisplay.length === 0 ? (
                          <div className="text-muted-foreground text-center py-4">No public repositories found.</div>
                        ) : (
                          githubDisplay.map((repo: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between border-b pb-1">
                              <span className="font-mono text-foreground truncate max-w-[200px]">{repo.name}</span>
                              <Button asChild size="sm" variant="ghost" className="h-6 gap-1 text-[10px]">
                                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="open-link">
                                  Open <ExternalLink className="size-3" />
                                </a>
                              </Button>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-1.5"><FolderOpen className="size-4" />Corporate Registry</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2 text-xs">
                        {isLoadingOSINT ? (
                          <div className="flex justify-center py-4"><RefreshCw className="size-4 animate-spin text-primary" /></div>
                        ) : (
                          Object.entries(corporateDisplay).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b pb-1">
                              <span className="font-medium text-muted-foreground">{key}</span>
                              <span className="text-foreground">{String(value)}</span>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
             </TabsContent>

            {/* MEDIA TAB */}
            <TabsContent value="media" className="space-y-6">
              {isLoadingMedia ? (
                <div className="flex justify-center items-center py-12"><RefreshCw className="size-6 animate-spin text-primary" /></div>
              ) : (
                <>
                  {/* IMAGES SECTION */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Visual Imagery & Geospatial Maps ({mediaData.images?.length || 0})
                    </h3>
                    {(!mediaData.images || mediaData.images.length === 0) ? (
                      <div className="p-4 text-center border rounded-lg text-muted-foreground text-xs bg-muted/10 border-dashed">
                        No real-time visual imagery or geospatial maps resolved for query "{activeQuery}".
                      </div>
                    ) : (
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        {mediaData.images.map((item, idx) => (
                          <Card key={idx} className="overflow-hidden bg-card/60 border-primary/10 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => window.open(item.url, "_blank")}>
                            <div className="h-28 relative bg-muted overflow-hidden">
                              <img 
                                src={item.url} 
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ExternalLink className="size-5 text-white" />
                              </div>
                            </div>
                            <CardContent className="p-2 text-xs">
                              <div className="font-medium truncate" title={item.title}>{item.title}</div>
                              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Image</span>
                                <span>{item.size}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* VIDEOS SECTION */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-red-500" />
                      Video Feeds & Briefings ({mediaData.videos?.length || 0})
                    </h3>
                    {(!mediaData.videos || mediaData.videos.length === 0) ? (
                      <div className="p-4 text-center border rounded-lg text-muted-foreground text-xs bg-muted/10 border-dashed">
                        No video briefings found matching query "{activeQuery}".
                      </div>
                    ) : (
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        {mediaData.videos.slice(0, 4).map((video, idx) => (
                          <Card key={idx} className="overflow-hidden bg-card/60 border-primary/10 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => window.open(video.url, "_blank")}>
                            <div className="h-28 relative bg-gradient-to-br from-red-950/40 via-zinc-900 to-black flex items-center justify-center overflow-hidden border-b border-primary/5">
                              <span className="absolute size-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:bg-red-600 group-hover:scale-105 transition-all duration-300">
                                <Video className="size-4 fill-white ml-0.5" />
                              </span>
                              <div className="absolute bottom-1 right-2 text-[8px] text-muted-foreground/80 font-mono">LIVE FEED</div>
                            </div>
                            <CardContent className="p-2 text-xs">
                              <div className="font-medium truncate" title={video.title}>{video.title}</div>
                              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>YouTube Video</span>
                                <span>{formatRelativeTime(video.pubDate)} ago</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DOCUMENTS SECTION */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      Intelligence Documents & PDF Reports ({mediaData.documents?.length || 0})
                    </h3>
                    {(!mediaData.documents || mediaData.documents.length === 0) ? (
                      <div className="p-4 text-center border rounded-lg text-muted-foreground text-xs bg-muted/10 border-dashed">
                        No PDF reports or leaked documents found matching query "{activeQuery}".
                      </div>
                    ) : (
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        {mediaData.documents.slice(0, 4).map((doc, idx) => (
                          <Card key={idx} className="overflow-hidden bg-card/60 border-primary/10 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => window.open(doc.url, "_blank")}>
                            <div className="h-28 bg-gradient-to-br from-amber-500/10 to-amber-700/20 flex flex-col items-center justify-center p-3 text-center relative">
                              <FileText className="size-8 text-amber-500/60 group-hover:text-amber-500 transition-colors mb-2" />
                              <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                                {doc.type}
                              </span>
                            </div>
                            <CardContent className="p-2 text-xs">
                              <div className="font-medium truncate" title={doc.title}>{doc.title}</div>
                              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Size: {doc.size}</span>
                                <span>{formatRelativeTime(doc.pubDate)} ago</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            {/* TIMELINE TAB */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Chronological Intelligence Logs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative pl-6 border-l-2 border-primary/20 m-4 space-y-6">
                    {[
                      { time: "Just now", event: "Target domain DNS logs verified", note: "Nameservers successfully verified in ingestion cycle." },
                      { time: "1 hour ago", event: "Media coverage volume spike", note: "Social chatter velocity increased by 42% following news wire update." },
                      { time: "24 hours ago", event: "WHOIS Registry update", note: "Domain registry values modified. Scheduled crawler triggered." }
                    ].map((t, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[30px] top-0.5 size-2.5 rounded-full bg-primary border-4 border-background" />
                        <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                          {t.event} <span className="text-[10px] font-normal text-muted-foreground">({t.time})</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 max-w-lg">{t.note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* KNOWLEDGE GRAPH TAB */}
            <TabsContent value="graph" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b px-4 py-2">
                    <div className="text-xs font-semibold">Entity Relationships Graph</div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {Object.entries(TYPE_STYLE).map(([t, s]) => (
                        <span key={t} className="flex items-center gap-1 text-muted-foreground">
                          <span className="size-2 rounded-full" style={{ background: s.fill }} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="relative h-[480px] w-full bg-slate-950 overflow-hidden">
                    <svg viewBox="0 0 800 480" className="h-full w-full">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      {graphEdges.map((e, idx) => {
                        const fromNode = graphNodes.find(n => n.id === e.from);
                        const toNode = graphNodes.find(n => n.id === e.to);
                        if (!fromNode || !toNode) return null;
                        return (
                          <g key={idx}>
                            <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                            <text x={(fromNode.x + toNode.x)/2} y={(fromNode.y + toNode.y)/2 - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" className="font-mono">{e.rel}</text>
                          </g>
                        );
                      })}
                      {graphNodes.map((n) => {
                        const style = TYPE_STYLE[n.type];
                        return (
                          <g key={n.id}>
                            <circle cx={n.x} cy={n.y} r={n.r} fill={style.fill} opacity="0.85" stroke={style.ring} strokeWidth="2" className="cursor-pointer" />
                            <text x={n.x} y={n.y + n.r + 12} textAnchor="middle" fontSize="10" fill="white" className="font-semibold select-none">{n.label}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ENTITIES TAB */}
            <TabsContent value="entities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Discovered Entity Registry</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/40 font-semibold">
                        <th className="p-3">Entity Name</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Confidence</th>
                        <th className="p-3">Risk Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {graphNodes.slice(1).map((node, idx) => {
                        const risks = ["Low Risk", "Medium Risk", "Elevated Risk"];
                        const risk = risks[idx % risks.length];
                        return (
                          <tr key={idx} className="hover:bg-accent/40">
                            <td className="p-3 font-semibold text-foreground">{node.label}</td>
                            <td className="p-3 text-muted-foreground capitalize">{node.type}</td>
                            <td className="p-3 font-semibold text-primary">{95 - idx * 4}%</td>
                            <td className="p-3">
                              <Badge variant="outline" className={risk === "Low Risk" ? "text-green-500 border-green-500/20" : risk === "Medium Risk" ? "text-yellow-500 border-yellow-500/20" : "text-red-500 border-red-500/20"}>
                                {risk}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rolling Sentiment Volume</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { h: "12:00", pos: 42, neg: 12, neu: 20 },
                        { h: "15:00", pos: 55, neg: 8, neu: 24 },
                        { h: "18:00", pos: 35, neg: 22, neu: 32 },
                        { h: "21:00", pos: 48, neg: 15, neu: 28 }
                      ]} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="posG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.68 0.17 145)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(0.68 0.17 145)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="h" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="pos" stroke="oklch(0.68 0.17 145)" fill="url(#posG)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform Mentions Split</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "News wires", value: 45, color: "oklch(0.6 0.19 255)" },
                            { name: "Social feeds", value: 35, color: "oklch(0.68 0.17 145)" },
                            { name: "Public forums", value: 20, color: "oklch(0.62 0.23 27)" }
                          ]}
                          dataKey="value"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          stroke="none"
                        >
                          <Cell fill="oklch(0.6 0.19 255)" />
                          <Cell fill="oklch(0.68 0.17 145)" />
                          <Cell fill="oklch(0.62 0.23 27)" />
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* REPORTS TAB */}
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Executive Report Draft</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-4 max-w-3xl leading-relaxed">
                  <div className="border p-4 bg-muted/20 rounded-md space-y-2">
                    <h3 className="text-sm font-bold border-b pb-1 text-primary">SENTINEL AI INTEL BRIEF · CONFIDENTIAL</h3>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Subject: {activeQuery} Research Dossier</span>
                      <span>Date: {new Date().toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-foreground/90">
                      <strong>Executive Summary:</strong> Dynamic OSINT and media intelligence correlation folder. 
                      Sentinel models suggest {activeQuery} holds an overall risk profile of <strong>{currentProfile.risk}/100</strong>. 
                      Core domain names resolved to target servers correctly. Social references are running within standard baseline thresholds.
                    </p>
                    <p>
                      <strong>Strategic Recommendations:</strong> Maintain monitoring frequency and configure target keyword triggers in Watchlist folders.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5"><Download className="size-3.5" />Download PDF</Button>
                    <Button size="sm" variant="outline">Share dossier</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* REVIEWS TAB */}
            <TabsContent value="reviews" className="space-y-4">
              {isLoadingReviews ? (
                <Card>
                  <CardContent className="p-8 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="size-6 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Aggregating public reviews across web platforms...</span>
                  </CardContent>
                </Card>
              ) : !reviewsData || !reviewsData.reviews || reviewsData.reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground text-xs">
                    No public review data found for this entity across monitored sources.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Summary row */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="flex flex-col justify-center p-4 text-center">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overall Score</span>
                      <div className="mt-2 text-3xl font-bold text-primary">{reviewsData.rating} <span className="text-base text-muted-foreground">/ {reviewsData.maxRating}</span></div>
                      <div className="mt-1 flex justify-center gap-0.5 text-yellow-500 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < Math.round(reviewsData.rating) ? "★" : "☆"}</span>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-4 space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sentiment Breakdown</span>
                      <div className="space-y-1.5 text-xs mt-1">
                        <div className="flex justify-between items-center">
                          <span>Positive</span>
                          <span className="font-semibold text-green-500">{reviewsData.positive}%</span>
                        </div>
                        <Progress value={reviewsData.positive} className="h-1 bg-muted" />
                        <div className="flex justify-between items-center">
                          <span>Neutral</span>
                          <span className="font-semibold text-muted-foreground">{reviewsData.neutral}%</span>
                        </div>
                        <Progress value={reviewsData.neutral} className="h-1 bg-muted" />
                        <div className="flex justify-between items-center">
                          <span>Negative</span>
                          <span className="font-semibold text-red-500">{reviewsData.negative}%</span>
                        </div>
                        <Progress value={reviewsData.negative} className="h-1 bg-muted" />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Sparkles className="size-3 text-primary" />AI Synthesis Key Takeaways</span>
                      <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground leading-relaxed list-disc pl-3">
                        {reviewsData.takeaways.map((takeaway: string, idx: number) => (
                          <li key={idx}>{takeaway}</li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  {/* Detailed list */}
                  <div className="space-y-3">
                    {reviewsData.reviews.map((r: ReviewItem, idx: number) => {
                      const IconComponent = 
                        r.platformIcon === "User" ? User : 
                        r.platformIcon === "MapPin" ? MapPin : 
                        r.platformIcon === "ShieldAlert" ? ShieldAlert : 
                        Globe2;
                      
                      return (
                        <Card key={idx}>
                          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1 rounded-md">
                                  <IconComponent className="size-4" />
                                </span>
                                <span className="font-semibold text-sm">{r.sourceName}</span>
                                <span className="text-yellow-500 text-xs font-semibold">
                                  {Array.from({ length: r.maxRating }).map((_, i) => (
                                    <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                                  ))}
                                </span>
                              </div>
                              <p className="text-xs text-foreground/80 leading-relaxed italic">
                                "{r.content}"
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              <Tone tone={r.tone} />
                              <Button asChild size="sm" variant="ghost" className="h-7 gap-1 text-[10px]">
                                <a 
                                  href={r.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="open-link"
                                >
                                  Open <ExternalLink className="size-3" />
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

          </Tabs>
        </div>
      )}
    </AppShell>
  );
}