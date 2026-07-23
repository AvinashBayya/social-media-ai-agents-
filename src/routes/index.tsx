import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader, Tone, StatusDot } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  fetchNews,
  fetchReviews,
  fetchOSINT,
  fetchSearchIntelligence,
  fetchSocialIntelligence,
  executeGoogleDork,
  executeShodanScan,
} from "./news";
import type {
  GoogleDorkParams,
  GoogleDorkLog,
  GoogleDorkHistoryItem,
  ShodanScanParams,
  ShodanHostTelemetry,
  ShodanTelemetryLog,
  ShodanHistoryItem,
} from "./news";
import {
  Search,
  FolderOpen,
  Bookmark,
  User,
  TrendingUp,
  Sparkles,
  MapPin,
  ShieldAlert,
  Globe2,
  Radio,
  Newspaper,
  Video,
  Image as ImageIcon,
  MessageCircle,
  ExternalLink,
  Calendar,
  Network,
  FileText,
  Activity,
  Terminal,
  CheckCircle2,
  ChevronRight,
  Download,
  RefreshCw,
  Plus,
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  GitBranch,
  ArrowUpRight,
  Bot,
  Key,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Research Center — Sentinel AI" },
      {
        name: "description",
        content: "AI-powered global OSINT, social, and sentiment intelligence platform.",
      },
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
    summary:
      "Tesla, Inc. displays medium risk indicators centered around Gigafactory Berlin regulatory hurdles and EU automotive tariffs. Sentiment is neutral-to-negative in retail investor spaces, balanced by positive spikes regarding autonomous drive software rollout.",
    progress: 94,
    risk: 54,
    sentiment: -8,
    credibility: 92,
    findings: [
      "Water conservation regulatory disputes identified at Berlin Gigafactory site.",
      "Coordinated short-selling discussions active on retail trading subreddits.",
      "DNS updates logged on production subsystems last week.",
    ],
    recommendations: [
      "Monitor European environmental compliance registry updates.",
      "Escalate tracking of Berlin Gigafactory operational feeds.",
      "Perform regular DNS history checks on core domains.",
    ],
    whois: {
      Domain: "tesla.com",
      Registrar: "MarkMonitor Inc.",
      Created: "1997-11-04",
      Expires: "2029-11-03",
      NS: "dns1.p01.nsone.net, ns1.markmonitor.com",
    },
    dns: [
      { type: "A", record: "198.51.100.42 (Primary Web Server)" },
      { type: "MX", record: "10 mail.tesla.com (Inbound Gateway)" },
      { type: "TXT", record: "v=spf1 include:spf.mandrillapp.com -all" },
    ],
    github: [
      "tesla-motors/model3-can-bus",
      "tesla-motors/energy-gateway-monitor",
      "tesla-motors/tesla-ap-reverse",
    ],
    business: {
      Status: "Active / Good Standing",
      Jurisdiction: "Delaware, US",
      FileNo: "3679812",
      HQ: "13101 Tesla Rd, Austin, TX",
    },
    socialProfiles: [
      { platform: "X / Twitter", handle: "@Tesla", followers: "22.4M" },
      { platform: "YouTube", handle: "TeslaMotors", followers: "2.8M" },
      { platform: "LinkedIn", handle: "tesla", followers: "11.2M" },
    ],
  },
  OpenAI: {
    summary:
      "OpenAI exhibits high research progress with prominent media focus on public release of reasoning models and corporate structure modifications. Sentiment remains heavily positive in developer ecosystems but critical in regulatory forums.",
    progress: 100,
    risk: 32,
    sentiment: 36,
    credibility: 96,
    findings: [
      "Surge in developer forum signups following reasoning model preview.",
      "Trademark filings registered for new model identifiers.",
      "Corporate restructuring documents circulating in legal forums.",
    ],
    recommendations: [
      "Track trademark database updates for newly registered tokens.",
      "Monitor federal antitrust regulatory watchlists.",
      "Assess open-source repository contributions for credential leaks.",
    ],
    whois: {
      Domain: "openai.com",
      Registrar: "GoDaddy.com, LLC",
      Created: "2015-06-24",
      Expires: "2028-06-24",
      NS: "dns1.p04.nsone.net, dns2.p04.nsone.net",
    },
    dns: [
      { type: "A", record: "104.18.7.12 (Cloudflare CDN Edge)" },
      { type: "MX", record: "10 asg.mta.openai.com (Microsoft 365)" },
      { type: "TXT", record: "v=spf1 include:spf.protection.outlook.com ~all" },
    ],
    github: ["openai/openai-cookbook", "openai/whisper", "openai/triton", "openai/gym"],
    business: {
      Status: "Active",
      Jurisdiction: "Delaware, US",
      FileNo: "5791244",
      HQ: "3180 18th St, San Francisco, CA",
    },
    socialProfiles: [
      { platform: "X / Twitter", handle: "@OpenAI", followers: "6.2M" },
      { platform: "GitHub", handle: "openai", followers: "84K" },
      { platform: "LinkedIn", handle: "openai", followers: "3.1M" },
    ],
  },
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
    `No active credentials leaks found on public repositories.`,
  ],
  recommendations: [
    `Continue routine continuous scanning on topic.`,
    `Set alerts for sudden mention volume shifts (>50%).`,
    `Perform periodic WHOIS record monitoring.`,
  ],
  whois: {
    Domain: `${query.toLowerCase().replace(/[^a-z0-9]/g, "") || "target"}.com`,
    Registrar: "MarkMonitor Inc.",
    Created: "2004-03-12",
    Expires: "2028-03-11",
    NS: "ns1.dns.com, ns2.dns.com",
  },
  dns: [
    { type: "A", record: "203.0.113.88 (Target Network)" },
    { type: "MX", record: "10 mail-gateway.target.com" },
  ],
  github: [`${query.toLowerCase()}/public-sdk`, `${query.toLowerCase()}/documentation`],
  business: {
    Status: "Active / Registered",
    Jurisdiction: "Standard Corporate Registry",
    FileNo: "8821945",
    HQ: "Global Distribution Network",
  },
  socialProfiles: [
    { platform: "X / Twitter", handle: `@${query.replace(/\s+/g, "")}`, followers: "125K" },
    { platform: "LinkedIn", handle: query.toLowerCase(), followers: "450K" },
  ],
});

interface ReviewItem {
  sourceName: string;
  platformIcon: string;
  rating: number;
  maxRating: number;
  content: string;
  url: string;
  tone:
    | "positive"
    | "negative"
    | "neutral"
    | "critical"
    | "high"
    | "medium"
    | "low"
    | "verified"
    | "unverified";
}

const quickFilters = ["Social", "News", "Images", "Videos", "OSINT", "Forums", "Documents"];
const validTones = new Set([
  "positive",
  "negative",
  "neutral",
  "critical",
  "high",
  "medium",
  "low",
  "verified",
  "unverified",
]);

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
    "Workspace ready.",
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
  // Google Dorks Connector States
  const [dorkStatus, setDorkStatus] = useState<"Connected" | "Running" | "Disabled" | "Error">(
    "Connected",
  );
  const [dorkParams, setDorkParams] = useState<GoogleDorkParams>({
    query: "",
    site: "",
    filetype: "",
    intitle: "",
    inurl: "",
    related: "",
    cache: "",
    maxResults: 10,
    safetyFilter: true,
  });
  const [dorkResults, setDorkResults] = useState<any[]>([]);
  const [dorkLogs, setDorkLogs] = useState<GoogleDorkLog[]>([
    {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "Google Dorks search connector initialized. Registry: Active.",
    },
    {
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: "SUCCESS",
      message: "Initial health self-test diagnostic passed.",
    },
  ]);
  const [dorkHistory, setDorkHistory] = useState<GoogleDorkHistoryItem[]>([
    {
      id: "hist-0",
      timestamp: new Date(Date.now() - 180000).toISOString(),
      rawQuery: `site:github.com filetype:pdf "leak"`,
      parameters: { query: "leak", site: "github.com", filetype: "pdf" },
      resultsCount: 2,
      status: "success",
    },
  ]);
  const [isExecutingDork, setIsExecutingDork] = useState(false);
  const [dorkRateLimit, setDorkRateLimit] = useState({ total: 100, used: 24, remaining: 76 });
  const [dorkLatency, setDorkLatency] = useState(142);
  const [dorkSuccessRate, setDorkSuccessRate] = useState(98);

  // Shodan Infrastructure Connector States
  const [shodanStatus, setShodanStatus] = useState<"Connected" | "Running" | "Disabled" | "Error">(
    "Connected",
  );
  const [shodanApiKey, setShodanApiKey] = useState("SHODAN_MOCK_API_KEY_XXXXXXXXXX");
  const [shodanParams, setShodanParams] = useState<ShodanScanParams>({
    query: "",
    apiKey: "",
    scanType: "host",
    safetyCheck: true,
  });
  const [shodanTelemetry, setShodanTelemetry] = useState<ShodanHostTelemetry | null>(null);
  const [shodanLogs, setShodanLogs] = useState<ShodanTelemetryLog[]>([
    {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "Shodan search connector initialized. OSINT Registry: Active.",
    },
    {
      timestamp: new Date(Date.now() - 3000).toISOString(),
      level: "SUCCESS",
      message: "Shodan credential authenticity scan passed.",
    },
  ]);
  const [shodanHistory, setShodanHistory] = useState<ShodanHistoryItem[]>([
    {
      id: "shod-0",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      query: "8.8.8.8",
      scanType: "host",
      status: "success",
    },
  ]);
  const [isExecutingShodan, setIsExecutingShodan] = useState(false);
  const [shodanRateLimit, setShodanRateLimit] = useState({
    total: 10000,
    used: 142,
    remaining: 9858,
  });
  const [shodanLatency, setShodanLatency] = useState(95);
  const [shodanSuccessRate, setShodanSuccessRate] = useState(100);

  useEffect(() => {
    setShodanParams((prev) => ({ ...prev, query: activeQuery }));
  }, [activeQuery]);

  useEffect(() => {
    setDorkParams((prev) => ({ ...prev, query: activeQuery }));
  }, [activeQuery]);

  const handleExecuteDork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dorkStatus === "Disabled") {
      setDorkLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          level: "WARNING",
          message: "Execution blocked: Google Dorks connector is disabled.",
        },
        ...prev,
      ]);
      return;
    }

    setIsExecutingDork(true);
    setDorkStatus("Running");
    setDorkLogs((prev) => [
      {
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: `Initiating Google Dork query build...`,
      },
      ...prev,
    ]);

    try {
      const res = await executeGoogleDork({ data: { params: dorkParams } });
      if (res && res.status === "success") {
        setDorkResults(res.results);
        setDorkRateLimit(res.rateLimit);
        setDorkStatus("Connected");

        // Prepend logs
        setDorkLogs((prev) => [
          ...res.logs,
          {
            timestamp: new Date().toISOString(),
            level: "SUCCESS",
            message: `Execution completed successfully in ${res.executionMs}ms. ${res.results.length} records found.`,
          },
          ...prev,
        ]);

        // Prepend history
        setDorkHistory((prev) => [...res.history, ...prev]);
      } else {
        throw new Error("Invalid execution response");
      }
    } catch (err: any) {
      console.error(err);
      setDorkStatus("Error");
      setDorkLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          level: "ERROR",
          message: `Dork execution failed: ${err.message || err}`,
        },
        ...prev,
      ]);
    } finally {
      setIsExecutingDork(false);
    }
  };

  const handleExecuteShodan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shodanStatus === "Disabled") {
      setShodanLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          level: "WARNING",
          message: "Execution blocked: Shodan connector is disabled.",
        },
        ...prev,
      ]);
      return;
    }

    if (!shodanApiKey) {
      setShodanStatus("Error");
      setShodanLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          level: "ERROR",
          message: "Authentication Error: Missing Shodan API Key.",
        },
        ...prev,
      ]);
      return;
    }

    setIsExecutingShodan(true);
    setShodanStatus("Running");
    setShodanLogs((prev) => [
      {
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: `Executing Shodan OSINT Scan for query: ${shodanParams.query}...`,
      },
      ...prev,
    ]);

    try {
      const res = await executeShodanScan({
        data: { params: { ...shodanParams, apiKey: shodanApiKey } },
      });
      if (res && res.status === "success") {
        setShodanTelemetry(res.telemetry);
        setShodanStatus("Connected");

        // Prepend logs
        setShodanLogs((prev) => [
          ...res.logs,
          {
            timestamp: new Date().toISOString(),
            level: "SUCCESS",
            message: `Shodan scan completed in ${res.executionMs}ms. Host IP matching: ${res.telemetry.ip}`,
          },
          ...prev,
        ]);

        // Prepend history
        setShodanHistory((prev) => [...res.history, ...prev]);

        // Update rate limits remaining
        setShodanRateLimit((prev) => ({
          ...prev,
          used: prev.used + 1,
          remaining: prev.remaining - 1,
        }));
      } else {
        throw new Error("Invalid scan response");
      }
    } catch (err: any) {
      console.error(err);
      setShodanStatus("Error");
      setShodanLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          level: "ERROR",
          message: `Shodan scan failed: ${err.message || err}`,
        },
        ...prev,
      ]);
    } finally {
      setIsExecutingShodan(false);
    }
  };

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
    setIsLoadingSocial(true);

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
    } catch (err) {
      console.error(err);
      setStories([]);
      setReviewsData(null);
      setOsintData(null);
      setSearchResultData([]);
      setSocialMentions([]);
      setSocialProfiles([]);
    } finally {
      setIsLoadingNews(false);
      setIsLoadingReviews(false);
      setIsLoadingOSINT(false);
      setIsLoadingSearch(false);
      setIsLoadingSocial(false);
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

    return Object.entries(counts)
      .map(([name, data]) => {
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
      })
      .sort((a, b) => b.articles - a.articles);
  };

  const outlets = getOutletCoverage(stories.length > 0 ? stories : []);

  // SVG network graph coordinate definitions relative to center
  const getGraphNodes = (q: string) => {
    return [
      { id: "center", label: q, type: "org" as const, x: 400, y: 260, r: 24 },
      {
        id: "ceo",
        label: q === "Tesla" ? "Elon Musk" : q === "OpenAI" ? "Sam Altman" : "Lead Entity",
        type: "person" as const,
        x: 260,
        y: 180,
        r: 18,
      },
      {
        id: "domain",
        label: currentProfile.whois.Domain,
        type: "domain" as const,
        x: 540,
        y: 190,
        r: 18,
      },
      {
        id: "hq",
        label: q === "Tesla" ? "Austin, TX" : q === "OpenAI" ? "San Francisco" : "Global HQ",
        type: "country" as const,
        x: 320,
        y: 380,
        r: 18,
      },
      {
        id: "news",
        label: stories[0]?.primarySource || "BBC News",
        type: "social" as const,
        x: 500,
        y: 360,
        r: 16,
      },
      { id: "ip", label: "203.0.113.88", type: "phone" as const, x: 620, y: 300, r: 14 },
      { id: "case", label: "INV-2041", type: "email" as const, x: 180, y: 300, r: 14 },
    ];
  };

  const graphNodes = getGraphNodes(activeQuery);
  const graphEdges = [
    { from: "center", to: "ceo", rel: "led by" },
    { from: "center", to: "domain", rel: "operates" },
    { from: "center", to: "hq", rel: "located at" },
    { from: "center", to: "news", rel: "covered by" },
    { from: "domain", to: "ip", rel: "resolves to" },
    { from: "ceo", to: "case", rel: "flagged in" },
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
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Search Templates
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { label: "Find OpenAI info", query: "OpenAI" },
                { label: "Monitor Tesla", query: "Tesla" },
                { label: "Investigate John Doe", query: "John Doe" },
                { label: "Track #AI", query: "#AI" },
                { label: "Monitor Apple Inc", query: "Apple Inc" },
                { label: "Search google.com", query: "google.com" },
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
                  { id: "INV-2035", title: "Fintech vendor breach" },
                ].map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col rounded-md border p-2 bg-card/45 hover:bg-accent/40 cursor-pointer"
                    onClick={() => {
                      setSearchVal(c.title);
                      triggerSearch(c.title);
                    }}
                  >
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
                  { id: "INV-2029", title: "Aster Motors brand protection" },
                ].map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col rounded-md border p-2 bg-card/45 hover:bg-accent/40 cursor-pointer"
                    onClick={() => {
                      setSearchVal(c.title);
                      triggerSearch(c.title);
                    }}
                  >
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
                  { name: "Elon Musk", type: "CEO, Tesla" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between rounded-md border p-2 bg-card/45 hover:bg-accent/40 cursor-pointer"
                    onClick={() => {
                      setSearchVal(p.name);
                      triggerSearch(p.name);
                    }}
                  >
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
                <span className="font-semibold text-primary-foreground">
                  Sentinel Ingestion Core v4.2
                </span>
                <span className="ml-auto size-2.5 rounded-full bg-yellow-500 animate-ping" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2 select-none">
              <div className="text-muted-foreground">
                Initializing target research pipeline for:{" "}
                <strong className="text-white">"{activeQuery}"</strong>
              </div>
              <div className="mt-3 space-y-1.5">
                {steps.map((step, idx) => {
                  const isDone = searchStep > idx;
                  const isActive = searchStep === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 ${isDone ? "text-primary/90" : isActive ? "text-yellow-400" : "text-muted-foreground/40"}`}
                    >
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
                <Progress
                  value={(searchStep / (steps.length - 1)) * 100}
                  className="h-full bg-primary"
                />
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
                <span className="font-mono uppercase tracking-wider">
                  INV-{Math.abs(activeQuery.split("").reduce((a, c) => a + c.charCodeAt(0), 1000))}
                </span>
                <Badge variant="outline" className="text-primary border-primary/30">
                  Active Investigation
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="size-3 text-primary" />
                  AI Synthesized
                </Badge>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {activeQuery}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  · Target Workspace
                </span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                Dynamic OSINT and media intelligence correlation folder. Last ingestion cycle
                completed just now.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShowWorkspace(false)}
              >
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
                { id: "reviews", label: "Reviews" },
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
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Confidence Score
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{currentProfile.credibility}%</span>
                      <span className="text-[10px] text-green-500 font-semibold">
                        High Confidence
                      </span>
                    </div>
                    <Progress value={currentProfile.credibility} className="mt-2 h-1 bg-muted" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Overall Risk
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{currentProfile.risk}/100</span>
                      <span
                        className={`text-[10px] font-semibold ${currentProfile.risk > 50 ? "text-amber-500" : "text-green-500"}`}
                      >
                        {currentProfile.risk > 50 ? "Elevated" : "Low Risk"}
                      </span>
                    </div>
                    <Progress value={currentProfile.risk} className="mt-2 h-1 bg-muted" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Public Sentiment
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {currentProfile.sentiment > 0
                          ? `+${currentProfile.sentiment}`
                          : currentProfile.sentiment}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${currentProfile.sentiment > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {currentProfile.sentiment > 0 ? "Positive" : "Negative"}
                      </span>
                    </div>
                    <Progress
                      value={Math.max(0, currentProfile.sentiment + 50)}
                      className="mt-2 h-1 bg-muted"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Evidence Collected
                    </span>
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
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                      <Bot className="size-4 text-primary" />
                      Executive Briefing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {currentProfile.summary}
                    </p>
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Key OSINT Discoveries
                      </h4>
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
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                      <Sparkles className="size-4 text-primary" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <p className="text-muted-foreground">
                      Sentinel AI analysis suggests targeting these areas next:
                    </p>
                    <div className="space-y-2">
                      {currentProfile.recommendations.map((r, idx) => (
                        <div
                          key={idx}
                          className="rounded-md border bg-card/80 p-2 border-primary/10"
                        >
                          <span className="font-semibold text-primary">Rec 0{idx + 1} · </span>
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
                  <span className="text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="size-3.5" /> Filters:
                  </span>
                  {quickFilters.map((f) => (
                    <Badge key={f} variant="outline" className="cursor-pointer font-normal">
                      {f}
                    </Badge>
                  ))}
                </div>
                {isLoadingSocial && <RefreshCw className="size-4 animate-spin text-primary" />}
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {(socialProfiles.length > 0 ? socialProfiles : currentProfile.socialProfiles).map(
                  (p) => {
                    const isFound = p.handle && p.handle !== "No public profile found";

                    const getPlatformSearchUrl = (platform: string, handleOrQuery: string) => {
                      const clean = handleOrQuery.trim();
                      const isHandle =
                        clean.startsWith("@") ||
                        (platform === "LinkedIn" &&
                          !clean.includes(" ") &&
                          clean !== "No public profile found");

                      if (platform.includes("X") || platform.includes("Twitter")) {
                        if (isFound && isHandle) {
                          return `https://x.com/${clean.replace("@", "")}`;
                        }
                        return `https://x.com/search?q=${encodeURIComponent(clean || activeQuery)}`;
                      } else if (platform.includes("LinkedIn")) {
                        if (isFound && isHandle) {
                          return `https://www.linkedin.com/company/${clean}`;
                        }
                        return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(clean || activeQuery)}`;
                      }
                      return "#";
                    };

                    const targetText = isFound ? p.handle : activeQuery || "topic";
                    const searchUrl = getPlatformSearchUrl(p.platform, targetText);

                    return (
                      <Card
                        key={p.platform}
                        className={`cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                          isFound
                            ? "border-primary/25 bg-card/90 shadow-sm hover:border-primary/50 hover:shadow-md"
                            : "bg-muted/10 border-dashed border-muted-foreground/30 hover:border-primary/30 hover:bg-muted/15"
                        }`}
                        onClick={() => window.open(searchUrl, "_blank", "noopener,noreferrer")}
                      >
                        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {p.platform}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              {isFound && p.followers !== "N/A"
                                ? `${p.followers} followers`
                                : "Search live link"}
                              <ExternalLink className="size-3 text-muted-foreground/60" />
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                              {isFound
                                ? p.handle
                                : `Search "${targetText}" on ${p.platform.split(" ")[0]}`}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1 leading-normal">
                              {isFound
                                ? `Status: ${p.status || "Monitored · Active Ingestion"}`
                                : `Click to search live profiles & posts for "${targetText}"`}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  },
                )}
              </div>

              {/* Feed simulation */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Recent Social Mentions</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {isLoadingSocial ? (
                    <div className="flex justify-center items-center py-12">
                      <RefreshCw className="size-6 animate-spin text-primary" />
                    </div>
                  ) : socialMentions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs">
                      No recent social media mentions found matching query "{activeQuery}". Try
                      clicking the "Analyze" button.
                    </div>
                  ) : (
                    socialMentions.map((p, idx) => {
                      const timeAgo = formatRelativeTime(p.pubDate);
                      return (
                        <div
                          key={idx}
                          className="p-4 text-xs space-y-1 hover:bg-accent/40 cursor-pointer transition-colors"
                          onClick={() => window.open(p.url, "_blank", "noopener,noreferrer")}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                              {p.author}{" "}
                              <ExternalLink className="size-3 text-muted-foreground inline" />
                            </span>
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-[9px] font-medium scale-90"
                            >
                              {p.platform}
                            </Badge>
                            <span className="text-muted-foreground">· {timeAgo} ago</span>
                            <div className="ml-auto">
                              <Tone tone={p.tone} />
                            </div>
                          </div>
                          <p className="text-foreground/80 mt-1 leading-relaxed">{p.text}</p>
                          <div className="flex gap-4 text-muted-foreground text-[10px] mt-2">
                            <span>Likes: {p.likes}</span>
                            <span>Shares: {p.shares}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEWS TAB (Live filtered RSS Feeds) */}
            <TabsContent value="news" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Newspaper className="size-4" /> Live Wires
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Concurrently aggregated feeds filtered for key phrase:{" "}
                    <strong>"{activeQuery}"</strong>
                  </p>
                </div>
                {isLoadingNews && <RefreshCw className="size-4 animate-spin text-primary" />}
              </div>

              <div className="grid gap-3">
                {stories.length > 0 ? (
                  stories.map((s, i) => {
                    const timeAgo = formatRelativeTime(s.pubDate);
                    const threatTone = validTones.has(s.threatLevel)
                      ? (s.threatLevel as any)
                      : "neutral";
                    const cred = s.isAlert ? "unverified" : "verified";

                    return (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{s.primarySource}</span>
                            <MapPin className="size-3" />
                            {s.countryCode || "Global"}
                            <span>·</span>
                            <span>{timeAgo} ago</span>
                            <div className="ml-auto flex gap-1.5">
                              <Tone tone={threatTone} />
                              <Tone tone={cred} />
                            </div>
                          </div>
                          <h3 className="mt-2 text-base font-semibold leading-snug">
                            {s.primaryTitle}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Analyzed across {s.sourceCount} outlets. Category:{" "}
                            {s.category || "general"}.
                          </p>
                          <div className="mt-2 flex gap-1.5 items-center">
                            <Badge variant="secondary" className="font-normal text-[10px]">
                              {s.sourceCount} outlets · Importance {s.importanceScore}%
                            </Badge>
                            {s.url && (
                              <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="ml-auto h-6 gap-1 text-[10px]"
                              >
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
                  })
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground text-xs">
                      No active feed headlines found matching query "{activeQuery}". Try "Tesla",
                      "AI", or "India".
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* SEARCH TAB */}
            <TabsContent value="search" className="space-y-4">
              {/* Connector Registry Status Overview */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <Card className="bg-card/45 border-primary/10">
                  <CardContent className="p-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Search RSS Connector
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-green-500/10 text-green-500 hover:bg-green-500/15 border-0 font-normal scale-90"
                      >
                        Connected
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-lg font-bold">Google RSS</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Latency: 180ms</span>
                      <span>Success: 99.4%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/45 border-primary/10">
                  <CardContent className="p-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Dorks OSINT Connector
                      </span>
                      <Badge
                        variant="secondary"
                        className={`border-0 font-normal scale-90 ${
                          dorkStatus === "Connected"
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/15"
                            : dorkStatus === "Running"
                              ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/15"
                              : dorkStatus === "Disabled"
                                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                : "bg-red-500/10 text-red-500 hover:bg-red-500/15"
                        }`}
                      >
                        {dorkStatus}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-lg font-bold">Google Dorks</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Latency: {dorkLatency}ms</span>
                      <span>Success: {dorkSuccessRate}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/45 border-primary/10 sm:col-span-2 md:col-span-1">
                  <CardContent className="p-3 text-left">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Rate Quota Remaining
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-lg font-bold">{dorkRateLimit.remaining}</span>
                      <span className="text-xs text-muted-foreground">
                        / {dorkRateLimit.total} hr
                      </span>
                    </div>
                    <Progress
                      value={(dorkRateLimit.remaining / dorkRateLimit.total) * 100}
                      className="mt-2 h-1 bg-muted"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {/* CONFIGURATION & HEALTH CONTROL PANELS */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                          <Search className="size-4 text-primary" />
                          Google Dorks Query Builder
                        </CardTitle>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span>Status:</span>
                          <select
                            value={dorkStatus}
                            onChange={(e) => {
                              const nextStatus = e.target.value as any;
                              setDorkStatus(nextStatus);
                              setDorkLogs((prev) => [
                                {
                                  timestamp: new Date().toISOString(),
                                  level: "INFO",
                                  message: `Manual status change: Connector set to ${nextStatus}`,
                                },
                                ...prev,
                              ]);
                            }}
                            className="bg-muted text-foreground border rounded px-1 py-0.5 outline-none font-medium"
                          >
                            <option value="Connected">Connected</option>
                            <option value="Disabled">Disabled</option>
                            <option value="Error">Error</option>
                          </select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-4">
                      <form onSubmit={handleExecuteDork} className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                              Target Query
                            </label>
                            <Input
                              placeholder="e.g. confidential leak"
                              value={dorkParams.query}
                              onChange={(e) =>
                                setDorkParams((prev) => ({ ...prev, query: e.target.value }))
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                              site: (Domain scope)
                            </label>
                            <Input
                              placeholder="e.g. github.com"
                              value={dorkParams.site}
                              onChange={(e) =>
                                setDorkParams((prev) => ({ ...prev, site: e.target.value }))
                              }
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                              filetype: (File extension)
                            </label>
                            <Input
                              placeholder="e.g. pdf, xlsx"
                              value={dorkParams.filetype}
                              onChange={(e) =>
                                setDorkParams((prev) => ({ ...prev, filetype: e.target.value }))
                              }
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                              intitle: (Text in Title)
                            </label>
                            <Input
                              placeholder="e.g. index of /"
                              value={dorkParams.intitle}
                              onChange={(e) =>
                                setDorkParams((prev) => ({ ...prev, intitle: e.target.value }))
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                              inurl: (Path segment)
                            </label>
                            <Input
                              placeholder="e.g. config, secrets"
                              value={dorkParams.inurl}
                              onChange={(e) =>
                                setDorkParams((prev) => ({ ...prev, inurl: e.target.value }))
                              }
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-left">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                related:
                              </label>
                              <Input
                                placeholder="related domain"
                                value={dorkParams.related}
                                onChange={(e) =>
                                  setDorkParams((prev) => ({ ...prev, related: e.target.value }))
                                }
                                className="h-8 text-xs font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                cache:
                              </label>
                              <Input
                                placeholder="domain to cache"
                                value={dorkParams.cache}
                                onChange={(e) =>
                                  setDorkParams((prev) => ({ ...prev, cache: e.target.value }))
                                }
                                className="h-8 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Query Preview Box */}
                        <div className="rounded border bg-muted/30 p-2.5 text-left">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">
                            Generated Dork Query Preview
                          </span>
                          <code className="text-xs font-mono text-primary font-bold break-all leading-normal">
                            {[
                              dorkParams.site ? `site:${dorkParams.site}` : "",
                              dorkParams.filetype ? `filetype:${dorkParams.filetype}` : "",
                              dorkParams.intitle ? `intitle:"${dorkParams.intitle}"` : "",
                              dorkParams.inurl ? `inurl:"${dorkParams.inurl}"` : "",
                              dorkParams.related ? `related:${dorkParams.related}` : "",
                              dorkParams.cache ? `cache:${dorkParams.cache}` : "",
                              dorkParams.query ? `"${dorkParams.query}"` : "",
                            ]
                              .filter(Boolean)
                              .join(" ") || "No operators defined"}
                          </code>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-4 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={dorkParams.safetyFilter}
                                onChange={(e) =>
                                  setDorkParams((prev) => ({
                                    ...prev,
                                    safetyFilter: e.target.checked,
                                  }))
                                }
                                className="rounded accent-primary"
                              />
                              <span>Enforce Safety Filter</span>
                            </label>
                          </div>
                          <Button
                            type="submit"
                            disabled={isExecutingDork || dorkStatus === "Disabled"}
                            className="h-8 px-4 gap-1.5 text-xs font-semibold"
                          >
                            {isExecutingDork ? (
                              <RefreshCw className="size-3 animate-spin" />
                            ) : (
                              <Search className="size-3" />
                            )}
                            Execute Dork Scan
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* EXECUTION LOGS PANEL */}
                  <Card className="bg-card/90">
                    <CardHeader className="pb-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                          <Terminal className="size-4 text-primary" />
                          Connector logs
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDorkLogs([])}
                          className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="rounded bg-black/90 p-3 font-mono text-[9px] text-green-400 space-y-1.5 max-h-48 overflow-y-auto leading-normal text-left">
                        {dorkLogs.length === 0 ? (
                          <div className="text-muted-foreground/60 italic text-center py-2">
                            No logging events registered.
                          </div>
                        ) : (
                          dorkLogs.map((log, idx) => (
                            <div
                              key={idx}
                              className="flex gap-2 items-start whitespace-pre-wrap break-all border-b border-white/5 pb-1"
                            >
                              <span className="text-white/40 select-none">
                                [{log.timestamp.substring(11, 19)}]
                              </span>
                              <span
                                className={`font-bold ${
                                  log.level === "SUCCESS"
                                    ? "text-green-500"
                                    : log.level === "WARNING"
                                      ? "text-amber-500"
                                      : log.level === "ERROR"
                                        ? "text-red-500"
                                        : "text-blue-400"
                                }`}
                              >
                                {log.level}
                              </span>
                              <span className="text-white/85">{log.message}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* TIMELINE, HEALTH & HISTORY SIDEBAR */}
                <div className="space-y-4">
                  {/* HEALTH MONITOR */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        <Activity className="size-4 text-primary" />
                        Health Diagnostics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-3 text-xs text-left">
                      <div className="space-y-1 border-b pb-2">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Connection Health</span>
                          <span className="text-foreground font-semibold">Healthy</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Latency (ms)</span>
                          <span className="text-foreground font-semibold">{dorkLatency}ms</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Diagnostics status</span>
                          <span className="text-green-500 font-semibold flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-green-500 inline-block animate-ping" />{" "}
                            Passed
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] w-full gap-1"
                          onClick={() => {
                            const newPing = 100 + Math.floor(Math.random() * 90);
                            setDorkLatency(newPing);
                            setDorkLogs((prev) => [
                              {
                                timestamp: new Date().toISOString(),
                                level: "INFO",
                                message: `Self-test ping diagnostics completed. Latency: ${newPing}ms.`,
                              },
                              ...prev,
                            ]);
                          }}
                        >
                          <RefreshCw className="size-3" /> Test Latency
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] w-full gap-1"
                          onClick={() => {
                            setDorkSuccessRate(99);
                            setDorkLogs((prev) => [
                              {
                                timestamp: new Date().toISOString(),
                                level: "SUCCESS",
                                message:
                                  "Health check completed. Self-healing system repaired 0 errors.",
                              },
                              ...prev,
                            ]);
                          }}
                        >
                          <CheckCircle2 className="size-3" /> Repair Health
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SEARCH HISTORY & RE-RUN */}
                  <Card>
                    <CardHeader className="pb-1">
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        <Clock className="size-4 text-primary" />
                        Dork Scan History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 text-left">
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {dorkHistory.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setDorkParams(item.parameters);
                              setDorkLogs((prev) => [
                                {
                                  timestamp: new Date().toISOString(),
                                  level: "INFO",
                                  message: `Loaded query from history: ${item.rawQuery}`,
                                },
                                ...prev,
                              ]);
                            }}
                            className="p-2 border rounded-md hover:border-primary/40 bg-card/50 cursor-pointer hover:bg-accent/40 transition-colors text-[10px] space-y-1"
                          >
                            <div className="flex items-center justify-between text-muted-foreground text-[9px]">
                              <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                              <Badge
                                variant="outline"
                                className="scale-90 font-normal px-1 py-0 border-primary/20 text-primary"
                              >
                                {item.resultsCount} hits
                              </Badge>
                            </div>
                            <div className="font-mono text-foreground font-semibold truncate leading-tight mt-0.5">
                              {item.rawQuery}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* DORK SCANNING RESULTS TABLE */}
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Google Dork Scan Results</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-left">
                  {dorkResults.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs leading-normal">
                      No dork scan records in session cache. Configure dork operators above and
                      click **"Execute Dork Scan"** to fetch mock results.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/40 font-semibold">
                          <th className="p-3">Matched Record</th>
                          <th className="p-3 w-[80px]">Hits</th>
                          <th className="p-3 w-[120px]">Indexed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {dorkResults.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-accent/40 cursor-pointer transition-colors"
                            onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                          >
                            <td className="p-3">
                              <div className="font-medium text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                                {item.title}{" "}
                                <ExternalLink className="size-3 text-muted-foreground inline" />
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[450px]">
                                {item.displayUrl}
                              </div>
                              {item.snippet && (
                                <div
                                  className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2 max-w-[550px]"
                                  dangerouslySetInnerHTML={{ __html: item.snippet }}
                                ></div>
                              )}
                            </td>
                            <td className="p-3 tabular-nums font-semibold text-primary">
                              {idx + 1}
                            </td>
                            <td className="p-3 text-muted-foreground">Just now</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Standard Engine Search Results Card */}
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Standard Engine Search Results</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-left">
                  {isLoadingSearch ? (
                    <div className="flex justify-center items-center py-12">
                      <RefreshCw className="size-6 animate-spin text-primary" />
                    </div>
                  ) : searchResultData.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs leading-normal">
                      No search engine results found matching query "{activeQuery}". Try clicking
                      the "Analyze" button.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/40 font-semibold">
                          <th className="p-3">Result Target</th>
                          <th className="p-3 w-[80px]">Rank</th>
                          <th className="p-3 w-[120px]">Indexed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {searchResultData.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-accent/40 cursor-pointer transition-colors"
                            onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                          >
                            <td className="p-3">
                              <div className="font-medium text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                                {item.title}{" "}
                                <ExternalLink className="size-3 text-muted-foreground inline" />
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[450px]">
                                {item.displayUrl}
                              </div>
                              {item.snippet && (
                                <div
                                  className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2 max-w-[550px]"
                                  dangerouslySetInnerHTML={{ __html: item.snippet }}
                                ></div>
                              )}
                            </td>
                            <td className="p-3 tabular-nums font-semibold text-primary">
                              {idx + 1}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {idx === 0
                                ? "24h ago"
                                : idx === 1
                                  ? "2 days ago"
                                  : `${idx + 1} days ago`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* OSINT TAB */}
            <TabsContent value="osint" className="space-y-4">
              {(() => {
                const whoisDisplay = osintData?.whois || currentProfile.whois;
                const dnsDisplay = osintData
                  ? [
                      { type: "A", record: osintData.dns.a },
                      { type: "MX", record: osintData.dns.mx },
                    ]
                  : currentProfile.dns;
                const githubDisplay =
                  osintData?.github ||
                  currentProfile.github.map((g) => ({ name: g, url: "https://github.com" }));
                const corporateDisplay = osintData?.corporate || currentProfile.business;
                const isUnregistered =
                  whoisDisplay.Registrar === "Not found" || whoisDisplay.Registrar === "N/A";

                const renderRDAPRecords = (rawJsonStr: string) => {
                  try {
                    const data = JSON.parse(rawJsonStr);
                    const events = data.events || [];
                    const statusFlags = data.status || [];
                    const entities = data.entities || [];

                    return (
                      <div className="space-y-3 mt-3 pt-3 border-t text-left">
                        {statusFlags.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                              Domain Status Flags
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {statusFlags.map((flag: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0 font-mono"
                                >
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {events.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                              Registration Timeline
                            </div>
                            <div className="space-y-1">
                              {events.map((ev: any, idx: number) => {
                                const label = ev.eventAction
                                  ? ev.eventAction.charAt(0).toUpperCase() + ev.eventAction.slice(1)
                                  : "Event";
                                const dateVal = ev.eventDate
                                  ? new Date(ev.eventDate).toLocaleDateString()
                                  : "Unknown";
                                return (
                                  <div
                                    key={idx}
                                    className="flex justify-between text-[10px] border-b border-muted/50 pb-0.5"
                                  >
                                    <span className="text-muted-foreground font-medium">
                                      {label}
                                    </span>
                                    <span className="font-mono text-foreground">{dateVal}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {entities.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                              Associated Registry Entities
                            </div>
                            <div className="space-y-1">
                              {entities.slice(0, 3).map((ent: any, idx: number) => {
                                const roles = ent.roles ? ent.roles.join(", ") : "contact";
                                const handle = ent.handle || "N/A";
                                return (
                                  <div
                                    key={idx}
                                    className="flex justify-between text-[10px] border-b border-muted/50 pb-0.5"
                                  >
                                    <span className="text-muted-foreground font-medium">
                                      Handle / Roles:
                                    </span>
                                    <span className="font-mono text-foreground truncate max-w-[150px]">
                                      {handle} ({roles})
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } catch (e) {
                    return (
                      <div className="text-[10px] text-muted-foreground mt-2 italic text-left whitespace-pre-wrap leading-relaxed">
                        {rawJsonStr}
                      </div>
                    );
                  }
                };

                return (
                  <div className="space-y-4">
                    {isUnregistered && !isLoadingOSINT && (
                      <div className="rounded-md border border-amber-500/25 bg-amber-500/5 p-3.5 text-xs text-amber-500/90 flex flex-col gap-2">
                        <div className="font-semibold flex items-center gap-1.5 text-amber-550">
                          <ShieldAlert className="size-4 animate-pulse text-amber-500" />{" "}
                          Unregistered Domain Alert
                        </div>
                        <p className="text-muted-foreground leading-normal">
                          The domain{" "}
                          <strong className="font-mono text-foreground">
                            {whoisDisplay.Domain}
                          </strong>{" "}
                          does not have an active WHOIS registration. Phishing, spoofing, and
                          typo-squatting risks are present.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-500 hover:text-amber-500 font-medium"
                          >
                            <a
                              href={`https://www.namecheap.com/domains/registration/results/?domain=${whoisDisplay.Domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Register on Namecheap <ExternalLink className="size-3 ml-1 inline" />
                            </a>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-500 hover:text-amber-500 font-medium"
                          >
                            <a
                              href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${whoisDisplay.Domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Register on GoDaddy <ExternalLink className="size-3 ml-1 inline" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-1.5">
                            <Globe2 className="size-4" />
                            WHOIS Registration
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2 text-xs">
                          {isLoadingOSINT ? (
                            <div className="flex justify-center py-4">
                              <RefreshCw className="size-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <>
                              {Object.entries(whoisDisplay).map(([key, value]) => (
                                <div key={key} className="flex justify-between border-b pb-1">
                                  <span className="font-medium text-muted-foreground">{key}</span>
                                  <span className="font-mono text-foreground">{String(value)}</span>
                                </div>
                              ))}
                              {osintData?.rawRDAP && (
                                <div className="mt-3 border-t pt-2">
                                  {renderRDAPRecords(osintData.rawRDAP)}
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-1.5">
                            <GitBranch className="size-4" />
                            DNS Nameservers
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2 text-xs">
                          {isLoadingOSINT ? (
                            <div className="flex justify-center py-4">
                              <RefreshCw className="size-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            dnsDisplay.map((dnsRec: any, idx: number) => (
                              <div key={idx} className="flex flex-col border-b pb-1">
                                <span className="font-bold text-primary text-[10px]">
                                  {dnsRec.type}
                                </span>
                                <span className="font-mono text-foreground truncate mt-0.5">
                                  {dnsRec.record}
                                </span>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-1.5">
                            <FileText className="size-4" />
                            GitHub Repositories
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2 text-xs">
                          {isLoadingOSINT ? (
                            <div className="flex justify-center py-4">
                              <RefreshCw className="size-4 animate-spin text-primary" />
                            </div>
                          ) : githubDisplay.length === 0 ? (
                            <div className="text-muted-foreground text-center py-4">
                              No public repositories found.
                            </div>
                          ) : (
                            githubDisplay.map((repo: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between border-b pb-1"
                              >
                                <span className="font-mono text-foreground truncate max-w-[200px]">
                                  {repo.name}
                                </span>
                                <Button
                                  asChild
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 gap-1 text-[10px]"
                                >
                                  <a
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="open-link"
                                  >
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
                          <CardTitle className="text-sm flex items-center gap-1.5">
                            <FolderOpen className="size-4" />
                            Corporate Registry
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2 text-xs">
                          {isLoadingOSINT ? (
                            <div className="flex justify-center py-4">
                              <RefreshCw className="size-4 animate-spin text-primary" />
                            </div>
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

                    {/* INFRASTRUCTURE INTELLIGENCE (SHODAN) */}
                    <div className="mt-6 border-t pt-6 space-y-4 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Radio className="size-4 text-primary" /> Infrastructure Intelligence
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Monitor network exposures, open ports, and vulnerabilities using Shodan
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-semibold border-0 ${
                            shodanStatus === "Connected"
                              ? "bg-green-500/10 text-green-500"
                              : shodanStatus === "Running"
                                ? "bg-blue-500/10 text-blue-500"
                                : shodanStatus === "Disabled"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          Shodan: {shodanStatus}
                        </Badge>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-3">
                        {/* CONFIGURATION & STATS */}
                        <div className="space-y-4">
                          {/* CONNECTOR CARD & AUTH */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                <Key className="size-4 text-primary" /> Credentials & Config
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3.5 space-y-3 text-xs">
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  API Authentication Key
                                </label>
                                <div className="flex gap-2">
                                  <Input
                                    type="password"
                                    placeholder="Shodan API Key"
                                    value={shodanApiKey}
                                    onChange={(e) => setShodanApiKey(e.target.value)}
                                    className="h-8 text-xs font-mono"
                                  />
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setShodanLogs((prev) => [
                                        {
                                          timestamp: new Date().toISOString(),
                                          level: "SUCCESS",
                                          message:
                                            "API key updated and registered in volatile configuration memory.",
                                        },
                                        ...prev,
                                      ]);
                                    }}
                                    className="h-8 text-[10px] px-2.5"
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] pt-1">
                                <span className="text-muted-foreground">Connector Status:</span>
                                <select
                                  value={shodanStatus}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value as any;
                                    setShodanStatus(nextStatus);
                                    setShodanLogs((prev) => [
                                      {
                                        timestamp: new Date().toISOString(),
                                        level: "INFO",
                                        message: `Manual configuration: Shodan state updated to ${nextStatus}`,
                                      },
                                      ...prev,
                                    ]);
                                  }}
                                  className="bg-muted text-foreground border rounded px-1.5 py-0.5 outline-none font-medium text-[10px]"
                                >
                                  <option value="Connected">Connected</option>
                                  <option value="Disabled">Disabled</option>
                                  <option value="Error">Error</option>
                                </select>
                              </div>
                            </CardContent>
                          </Card>

                          {/* RATE LIMIT & METRICS */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                <Activity className="size-4 text-primary" /> Usage & Health
                                Telemetry
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3.5 space-y-3 text-xs">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-muted-foreground">Monthly Quota used</span>
                                  <span className="font-semibold text-foreground">
                                    {shodanRateLimit.used} / {shodanRateLimit.total}
                                  </span>
                                </div>
                                <Progress
                                  value={(shodanRateLimit.used / shodanRateLimit.total) * 100}
                                  className="h-1 bg-muted"
                                />
                              </div>

                              <div className="space-y-1 pt-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Success Rate</span>
                                  <span className="text-foreground font-semibold">
                                    {shodanSuccessRate}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Latency</span>
                                  <span className="text-foreground font-semibold">
                                    {shodanLatency}ms
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const nextLatency = 80 + Math.floor(Math.random() * 40);
                                    setShodanLatency(nextLatency);
                                    setShodanLogs((prev) => [
                                      {
                                        timestamp: new Date().toISOString(),
                                        level: "SUCCESS",
                                        message: `Health Diagnostics Ping success. Latency: ${nextLatency}ms`,
                                      },
                                      ...prev,
                                    ]);
                                  }}
                                  className="w-full h-7 text-[9px] gap-1"
                                >
                                  <RefreshCw className="size-2.5" /> Ping Test
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* HISTORY */}
                          <Card>
                            <CardHeader className="pb-1">
                              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                <Clock className="size-4 text-primary" /> Shodan Scan History
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {shodanHistory.map((item, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setShodanParams((prev) => ({ ...prev, query: item.query }));
                                      setShodanLogs((prev) => [
                                        {
                                          timestamp: new Date().toISOString(),
                                          level: "INFO",
                                          message: `Loaded search configuration for target: ${item.query}`,
                                        },
                                        ...prev,
                                      ]);
                                    }}
                                    className="p-1.5 border rounded bg-card/60 cursor-pointer hover:bg-accent/40 text-[10px] flex items-center justify-between"
                                  >
                                    <span className="font-mono truncate">{item.query}</span>
                                    <Badge
                                      variant="outline"
                                      className="scale-90 px-1 py-0 font-normal"
                                    >
                                      {item.scanType}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* SCAN ACTIONS & HOST RESULTS */}
                        <div className="lg:col-span-2 space-y-4">
                          {/* SEARCH BAR CARD */}
                          <Card>
                            <CardContent className="p-3.5">
                              <form onSubmit={handleExecuteShodan} className="flex gap-2">
                                <Input
                                  placeholder="Enter IP or Hostname (e.g. 8.8.8.8, tesla.com)"
                                  value={shodanParams.query}
                                  onChange={(e) =>
                                    setShodanParams((prev) => ({ ...prev, query: e.target.value }))
                                  }
                                  className="h-9 text-xs"
                                />
                                <Button
                                  type="submit"
                                  disabled={isExecutingShodan || shodanStatus === "Disabled"}
                                  className="h-9 font-semibold text-xs gap-1"
                                >
                                  {isExecutingShodan ? (
                                    <RefreshCw className="size-3 animate-spin" />
                                  ) : (
                                    <Search className="size-3" />
                                  )}
                                  Scan Host
                                </Button>
                              </form>
                            </CardContent>
                          </Card>

                          {/* SHODAN HOST PROFILE DETAIL */}
                          <Card>
                            <CardHeader className="pb-2 border-b">
                              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                <Globe2 className="size-4 text-primary" /> Shodan Host Profile
                                Telemetry
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                              {!shodanTelemetry ? (
                                <div className="py-12 text-center text-muted-foreground text-xs leading-normal">
                                  No active Shodan host record loaded. Enter an IP or hostname above
                                  and click **"Scan Host"** to fetch mock telemetry details.
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* BASIC DETAILS */}
                                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-xs text-left">
                                    <div className="border-b pb-1.5">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                        IP Address
                                      </div>
                                      <div className="font-mono font-semibold text-foreground mt-0.5">
                                        {shodanTelemetry.ip}
                                      </div>
                                    </div>
                                    <div className="border-b pb-1.5">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Hostnames
                                      </div>
                                      <div className="font-mono truncate text-foreground mt-0.5">
                                        {shodanTelemetry.hostnames.join(", ")}
                                      </div>
                                    </div>
                                    <div className="border-b pb-1.5">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Organization
                                      </div>
                                      <div className="text-foreground truncate mt-0.5">
                                        {shodanTelemetry.org}
                                      </div>
                                    </div>
                                    <div className="border-b pb-1.5">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Operating System
                                      </div>
                                      <div className="text-foreground mt-0.5">
                                        {shodanTelemetry.os}
                                      </div>
                                    </div>
                                    <div className="border-b pb-1.5">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                        ASN / ISP
                                      </div>
                                      <div className="font-mono text-foreground mt-0.5">
                                        {shodanTelemetry.asn}
                                      </div>
                                    </div>
                                    <div className="border-b pb-1.5">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Location
                                      </div>
                                      <div className="text-foreground mt-0.5">
                                        {shodanTelemetry.location.city},{" "}
                                        {shodanTelemetry.location.country} (
                                        {shodanTelemetry.location.countryCode})
                                      </div>
                                    </div>
                                  </div>

                                  {/* HOST TAGS */}
                                  {shodanTelemetry.tags.length > 0 && (
                                    <div className="text-left">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                                        Host Tags
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {shodanTelemetry.tags.map((tag) => (
                                          <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-[9px] px-2 py-0 h-4.5 bg-primary/10 text-primary border-0 font-mono"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* OPEN PORTS & SERVICES */}
                                  <div className="text-left">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                                      Open Ports & Services
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      {shodanTelemetry.services.map((service, index) => (
                                        <div
                                          key={index}
                                          className="p-2.5 border rounded bg-card/60 flex items-start justify-between"
                                        >
                                          <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                              <Badge
                                                variant="outline"
                                                className="text-[10px] px-1 py-0 border-primary/20 text-primary font-bold"
                                              >
                                                {service.port}
                                              </Badge>
                                              <span className="font-mono font-bold text-[11px] text-foreground">
                                                {service.serviceName}
                                              </span>
                                            </div>
                                            <p
                                              className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]"
                                              title={service.banner}
                                            >
                                              {service.banner || "No banner found"}
                                            </p>
                                          </div>
                                          <Badge
                                            variant="secondary"
                                            className="text-[9px] uppercase"
                                          >
                                            {service.protocol}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* SSL CERTIFICATE PLACEHOLDER */}
                                  {shodanTelemetry.sslCert && (
                                    <div className="p-3 border rounded bg-card/40 text-xs text-left">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                                        SSL Certificate Details
                                      </div>
                                      <div className="grid gap-2 md:grid-cols-2 text-left">
                                        <div>
                                          <span className="text-muted-foreground block text-[10px]">
                                            Subject
                                          </span>
                                          <span className="font-mono text-foreground font-semibold">
                                            {shodanTelemetry.sslCert.subject}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block text-[10px]">
                                            Issuer
                                          </span>
                                          <span className="font-mono text-foreground font-semibold">
                                            {shodanTelemetry.sslCert.issuer}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block text-[10px]">
                                            Expiry Timeline
                                          </span>
                                          <span className="text-foreground">
                                            {shodanTelemetry.sslCert.expires}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block text-[10px]">
                                            Protocol Version
                                          </span>
                                          <span className="font-mono text-foreground">
                                            {shodanTelemetry.sslCert.version}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* VULNERABILITIES LIST */}
                                  {shodanTelemetry.vulnerabilities.length > 0 && (
                                    <div className="text-left">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                                        CVE Vulnerabilities Correlated
                                      </div>
                                      <div className="space-y-2">
                                        {shodanTelemetry.vulnerabilities.map((vuln) => (
                                          <div
                                            key={vuln.id}
                                            className="p-2.5 border rounded border-red-500/15 bg-red-500/5 flex items-start gap-3"
                                          >
                                            <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/15 border-0 font-bold font-mono py-0.5 px-2 text-[10px]">
                                              CVSS {vuln.cvss.toFixed(1)}
                                            </Badge>
                                            <div className="space-y-0.5 text-xs text-left">
                                              <div className="font-bold text-foreground font-mono">
                                                {vuln.id}
                                              </div>
                                              <p className="text-muted-foreground text-[11px] leading-normal">
                                                {vuln.summary}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* SHODAN LOGS CONSOLE */}
                          <Card className="bg-card/90">
                            <CardHeader className="pb-1">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                  <Terminal className="size-4 text-primary" /> Shodan Connector logs
                                </CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShodanLogs([])}
                                  className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                                >
                                  Clear
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-3">
                              <div className="rounded bg-black/90 p-3 font-mono text-[9px] text-green-400 space-y-1.5 max-h-40 overflow-y-auto leading-normal text-left">
                                {shodanLogs.length === 0 ? (
                                  <div className="text-muted-foreground/60 italic text-center py-2">
                                    No logging events registered.
                                  </div>
                                ) : (
                                  shodanLogs.map((log, idx) => (
                                    <div
                                      key={idx}
                                      className="flex gap-2 items-start whitespace-pre-wrap break-all border-b border-white/5 pb-1"
                                    >
                                      <span className="text-white/40 select-none">
                                        [{log.timestamp.substring(11, 19)}]
                                      </span>
                                      <span
                                        className={`font-bold ${
                                          log.level === "SUCCESS"
                                            ? "text-green-500"
                                            : log.level === "WARNING"
                                              ? "text-amber-500"
                                              : log.level === "ERROR"
                                                ? "text-red-500"
                                                : "text-blue-400"
                                        }`}
                                      >
                                        {log.level}
                                      </span>
                                      <span className="text-white/85">{log.message}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </TabsContent>

            {/* MEDIA TAB */}
            <TabsContent value="media" className="space-y-4">
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                {[
                  { title: "Dashboard mock", type: "Image" },
                  { title: "Press briefing raw", type: "Video" },
                  { title: "Leaked audit memo", type: "PDF" },
                  { title: "Regulatory guidelines", type: "Doc" },
                ].map((item, idx) => (
                  <Card key={idx} className="overflow-hidden bg-card/60">
                    <div className="h-28 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                      <ImageIcon className="size-8 text-primary/40" />
                    </div>
                    <CardContent className="p-2 text-xs">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{item.type}</span>
                        <span>428 KB</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                      {
                        time: "Just now",
                        event: "Target domain DNS logs verified",
                        note: "Nameservers successfully verified in ingestion cycle.",
                      },
                      {
                        time: "1 hour ago",
                        event: "Media coverage volume spike",
                        note: "Social chatter velocity increased by 42% following news wire update.",
                      },
                      {
                        time: "24 hours ago",
                        event: "WHOIS Registry update",
                        note: "Domain registry values modified. Scheduled crawler triggered.",
                      },
                    ].map((t, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[30px] top-0.5 size-2.5 rounded-full bg-primary border-4 border-background" />
                        <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                          {t.event}{" "}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            ({t.time})
                          </span>
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
                          <path
                            d="M20 0H0V20"
                            fill="none"
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="0.5"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      {graphEdges.map((e, idx) => {
                        const fromNode = graphNodes.find((n) => n.id === e.from);
                        const toNode = graphNodes.find((n) => n.id === e.to);
                        if (!fromNode || !toNode) return null;
                        return (
                          <g key={idx}>
                            <line
                              x1={fromNode.x}
                              y1={fromNode.y}
                              x2={toNode.x}
                              y2={toNode.y}
                              stroke="rgba(255,255,255,0.15)"
                              strokeWidth="1.5"
                            />
                            <text
                              x={(fromNode.x + toNode.x) / 2}
                              y={(fromNode.y + toNode.y) / 2 - 4}
                              textAnchor="middle"
                              fontSize="9"
                              fill="rgba(255,255,255,0.4)"
                              className="font-mono"
                            >
                              {e.rel}
                            </text>
                          </g>
                        );
                      })}
                      {graphNodes.map((n) => {
                        const style = TYPE_STYLE[n.type];
                        return (
                          <g key={n.id}>
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r={n.r}
                              fill={style.fill}
                              opacity="0.85"
                              stroke={style.ring}
                              strokeWidth="2"
                              className="cursor-pointer"
                            />
                            <text
                              x={n.x}
                              y={n.y + n.r + 12}
                              textAnchor="middle"
                              fontSize="10"
                              fill="white"
                              className="font-semibold select-none"
                            >
                              {n.label}
                            </text>
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
                              <Badge
                                variant="outline"
                                className={
                                  risk === "Low Risk"
                                    ? "text-green-500 border-green-500/20"
                                    : risk === "Medium Risk"
                                      ? "text-yellow-500 border-yellow-500/20"
                                      : "text-red-500 border-red-500/20"
                                }
                              >
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
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Rolling Sentiment Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { h: "12:00", pos: 42, neg: 12, neu: 20 },
                          { h: "15:00", pos: 55, neg: 8, neu: 24 },
                          { h: "18:00", pos: 35, neg: 22, neu: 32 },
                          { h: "21:00", pos: 48, neg: 15, neu: 28 },
                        ]}
                        margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
                      >
                        <defs>
                          <linearGradient id="posG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.68 0.17 145)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(0.68 0.17 145)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                          vertical={false}
                        />
                        <XAxis dataKey="h" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="pos"
                          stroke="oklch(0.68 0.17 145)"
                          fill="url(#posG)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Platform Mentions Split
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "News wires", value: 45, color: "oklch(0.6 0.19 255)" },
                            { name: "Social feeds", value: 35, color: "oklch(0.68 0.17 145)" },
                            { name: "Public forums", value: 20, color: "oklch(0.62 0.23 27)" },
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
                    <h3 className="text-sm font-bold border-b pb-1 text-primary">
                      SENTINEL AI INTEL BRIEF · CONFIDENTIAL
                    </h3>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Subject: {activeQuery} Research Dossier</span>
                      <span>Date: {new Date().toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-foreground/90">
                      <strong>Executive Summary:</strong> Dynamic OSINT and media intelligence
                      correlation folder. Sentinel models suggest {activeQuery} holds an overall
                      risk profile of <strong>{currentProfile.risk}/100</strong>. Core domain names
                      resolved to target servers correctly. Social references are running within
                      standard baseline thresholds.
                    </p>
                    <p>
                      <strong>Strategic Recommendations:</strong> Maintain monitoring frequency and
                      configure target keyword triggers in Watchlist folders.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5">
                      <Download className="size-3.5" />
                      Download PDF
                    </Button>
                    <Button size="sm" variant="outline">
                      Share dossier
                    </Button>
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
                    <span className="text-xs text-muted-foreground">
                      Aggregating public reviews across web platforms...
                    </span>
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
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Overall Score
                      </span>
                      <div className="mt-2 text-3xl font-bold text-primary">
                        {reviewsData.rating}{" "}
                        <span className="text-base text-muted-foreground">
                          / {reviewsData.maxRating}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-center gap-0.5 text-yellow-500 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < Math.round(reviewsData.rating) ? "★" : "☆"}</span>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-4 space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Sentiment Breakdown
                      </span>
                      <div className="space-y-1.5 text-xs mt-1">
                        <div className="flex justify-between items-center">
                          <span>Positive</span>
                          <span className="font-semibold text-green-500">
                            {reviewsData.positive}%
                          </span>
                        </div>
                        <Progress value={reviewsData.positive} className="h-1 bg-muted" />
                        <div className="flex justify-between items-center">
                          <span>Neutral</span>
                          <span className="font-semibold text-muted-foreground">
                            {reviewsData.neutral}%
                          </span>
                        </div>
                        <Progress value={reviewsData.neutral} className="h-1 bg-muted" />
                        <div className="flex justify-between items-center">
                          <span>Negative</span>
                          <span className="font-semibold text-red-500">
                            {reviewsData.negative}%
                          </span>
                        </div>
                        <Progress value={reviewsData.negative} className="h-1 bg-muted" />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Sparkles className="size-3 text-primary" />
                        AI Synthesis Key Takeaways
                      </span>
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
                        r.platformIcon === "User"
                          ? User
                          : r.platformIcon === "MapPin"
                            ? MapPin
                            : r.platformIcon === "ShieldAlert"
                              ? ShieldAlert
                              : Globe2;

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
                              <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="h-7 gap-1 text-[10px]"
                              >
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
