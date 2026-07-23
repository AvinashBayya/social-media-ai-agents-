import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radio,
  Search,
  Users,
  Bookmark,
  Share2,
  Newspaper,
  Globe2,
  Image as ImageIcon,
  Video,
  UserSearch,
  Network,
  GitBranch,
  Clock,
  LineChart,
  TrendingUp,
  User,
  FileBarChart,
  Bell,
  ShieldAlert,
  Map,
  Database,
  Bot,
  Cpu,
  ListChecks,
  Download,
  Settings as SettingsIcon,
  Command as CommandIcon,
  Sparkles,
  ChevronDown,
  CircleUser,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";

const NAV_GROUPS: { label: string; items: { title: string; to: string; icon: any }[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", to: "/", icon: LayoutDashboard },
      { title: "Live Monitoring", to: "/live", icon: Radio },
      { title: "AI Investigations", to: "/investigations", icon: Search },
    ],
  },
  {
    label: "Targets",
    items: [
      { title: "Subjects", to: "/subjects", icon: Users },
      { title: "Watchlists", to: "/watchlists", icon: Bookmark },
      { title: "Entity Explorer", to: "/entities", icon: UserSearch },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Social Intelligence", to: "/social", icon: Share2 },
      { title: "News Intelligence", to: "/news", icon: Newspaper },
      { title: "OSINT Intelligence", to: "/osint", icon: Globe2 },
      { title: "Image Intelligence", to: "/images", icon: ImageIcon },
      { title: "Video Intelligence", to: "/videos", icon: Video },
    ],
  },
  {
    label: "Analysis",
    items: [
      { title: "Knowledge Graph", to: "/graph", icon: Network },
      { title: "Network Analysis", to: "/network", icon: GitBranch },
      { title: "Timeline Explorer", to: "/timeline", icon: Clock },
      { title: "Sentiment", to: "/sentiment", icon: LineChart },
      { title: "Trends", to: "/trends", icon: TrendingUp },
    ],
  },
  {
    label: "Response",
    items: [
      { title: "Reports", to: "/reports", icon: FileBarChart },
      { title: "Alert Center", to: "/alerts", icon: Bell },
      { title: "Threat Intel", to: "/threats", icon: ShieldAlert },
      { title: "GIS Intelligence", to: "/gis", icon: Map },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Data Sources", to: "/sources", icon: Database },
      { title: "AI Agents", to: "/agents", icon: Bot },
      { title: "Crawler Status", to: "/crawlers", icon: Cpu },
      { title: "Tasks", to: "/tasks", icon: ListChecks },
      { title: "Exports", to: "/exports", icon: Download },
      { title: "Settings", to: "/settings", icon: SettingsIcon },
    ],
  },
];

function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">Sentinel AI</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Intelligence Platform
            </span>
          </div>
        </div>
        <button
          type="button"
          className="mx-1 mb-1 flex items-center justify-between rounded-md border bg-card px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent group-data-[collapsible=icon]:hidden"
        >
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[oklch(0.68_0.17_145)]" />
            Global Ops · Tier 1
          </span>
          <ChevronDown className="size-3.5" />
        </button>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.title}>
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <div className="relative flex-1 max-w-2xl">
        <CommandIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search subjects, entities, events, hashtags…  (⌘K)"
          className="h-9 pl-9 pr-16 bg-card"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sparkles className="size-3.5 text-primary" /> Ask AI
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 pr-2">
              <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
                <CircleUser className="size-4" />
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-xs font-medium">A. Chen</span>
                <span className="block text-[10px] text-muted-foreground">Lead Analyst</span>
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
            <DropdownMenuItem className="text-xs text-muted-foreground">
              a.chen@sentinel.io
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Audit log</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  badge,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusDot({
  tone = "success",
}: {
  tone?: "success" | "warning" | "danger" | "info" | "muted";
}) {
  const map: Record<string, string> = {
    success: "bg-[oklch(0.68_0.17_145)]",
    warning: "bg-[oklch(0.78_0.16_85)]",
    danger: "bg-[oklch(0.62_0.23_27)]",
    info: "bg-[oklch(0.72_0.15_210)]",
    muted: "bg-muted-foreground/40",
  };
  return (
    <span className="relative inline-flex">
      <span className={`size-2 rounded-full ${map[tone]}`} />
      <span className={`absolute inset-0 animate-ping rounded-full opacity-60 ${map[tone]}`} />
    </span>
  );
}

export function toneBadge(
  tone:
    | "positive"
    | "negative"
    | "neutral"
    | "critical"
    | "high"
    | "medium"
    | "low"
    | "verified"
    | "unverified",
): {
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
  label: string;
} {
  const map = {
    positive: {
      className:
        "bg-[oklch(0.68_0.17_145)]/12 text-[oklch(0.4_0.17_145)] border-[oklch(0.68_0.17_145)]/25",
      label: "Positive",
    },
    negative: {
      className: "bg-destructive/10 text-destructive border-destructive/25",
      label: "Negative",
    },
    neutral: { className: "bg-muted text-muted-foreground border-border", label: "Neutral" },
    critical: {
      className: "bg-destructive/12 text-destructive border-destructive/30",
      label: "Critical",
    },
    high: {
      className:
        "bg-[oklch(0.78_0.16_50)]/15 text-[oklch(0.5_0.18_50)] border-[oklch(0.78_0.16_50)]/30",
      label: "High",
    },
    medium: {
      className:
        "bg-[oklch(0.78_0.16_85)]/15 text-[oklch(0.5_0.15_75)] border-[oklch(0.78_0.16_85)]/35",
      label: "Medium",
    },
    low: {
      className:
        "bg-[oklch(0.72_0.15_210)]/12 text-[oklch(0.45_0.15_240)] border-[oklch(0.72_0.15_210)]/30",
      label: "Low",
    },
    verified: {
      className:
        "bg-[oklch(0.68_0.17_145)]/12 text-[oklch(0.4_0.17_145)] border-[oklch(0.68_0.17_145)]/25",
      label: "Verified",
    },
    unverified: { className: "bg-muted text-muted-foreground border-border", label: "Unverified" },
  } as const;
  return { variant: "outline", ...map[tone] };
}

export function Tone({
  tone,
  children,
}: {
  tone: Parameters<typeof toneBadge>[0];
  children?: ReactNode;
}) {
  const t = toneBadge(tone);
  return (
    <Badge variant="outline" className={`font-medium ${t.className}`}>
      {children ?? t.label}
    </Badge>
  );
}
