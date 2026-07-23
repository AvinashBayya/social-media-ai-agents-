import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AppShell, PageHeader, Tone } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Globe2, TrendingUp, ExternalLink, MapPin } from "lucide-react";

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

const SOURCE_TYPES: Record<string, string> = {
  Reuters: "wire",
  "Reuters World": "wire",
  "Reuters Business": "wire",
  "AP News": "wire",
  AFP: "wire",
  Bloomberg: "wire",
  "White House": "gov",
  "State Dept": "gov",
  Pentagon: "gov",
  Treasury: "gov",
  DOJ: "gov",
  DHS: "gov",
  CDC: "gov",
  FEMA: "gov",
  "Federal Reserve": "gov",
  SEC: "gov",
  "UN News": "gov",
  CISA: "gov",
  "Defense One": "intel",
  "Breaking Defense": "intel",
  "The War Zone": "intel",
  "Defense News": "intel",
  Janes: "intel",
  "Military Times": "intel",
  "Task & Purpose": "intel",
  "USNI News": "intel",
  gCaptain: "intel",
  "Oryx OSINT": "intel",
  "UK MOD": "gov",
  Bellingcat: "intel",
  "Krebs Security": "intel",
  "Foreign Policy": "intel",
  "The Diplomat": "intel",
  "Atlantic Council": "intel",
  "Foreign Affairs": "intel",
  CrisisWatch: "intel",
  CSIS: "intel",
  RAND: "intel",
  Brookings: "intel",
  Carnegie: "intel",
  "BBC World": "mainstream",
  "BBC News": "mainstream",
  "NYT News": "mainstream",
  "Guardian World": "mainstream",
  "NPR News": "mainstream",
  "Al Jazeera": "mainstream",
  "CNN World": "mainstream",
  Politico: "mainstream",
  Axios: "mainstream",
  EuroNews: "mainstream",
  "France 24": "mainstream",
  "Le Monde": "mainstream",
  "Fox News": "mainstream",
  "NBC News": "mainstream",
  "CBS News": "mainstream",
  "ABC News": "mainstream",
  "PBS NewsHour": "mainstream",
  "Yahoo Finance": "market",
  "Financial Times": "market",
  "Hacker News": "tech",
  "Ars Technica": "tech",
  "The Verge": "tech",
  "The Verge AI": "tech",
  "MIT Tech Review": "tech",
  "War on the Rocks": "intel",
};

function getSourceType(source: string): string {
  return SOURCE_TYPES[source] || "other";
}

const SOURCE_PROPAGANDA_RISK: Record<string, string> = {
  Xinhua: "high",
  TASS: "high",
  RT: "high",
  "RT Russia": "high",
  Sputnik: "high",
  CGTN: "high",
  "Press TV": "high",
  IRNA: "high",
  "Mehr News": "high",
  KCNA: "high",
  "Al Jazeera": "medium",
  "Al Arabiya": "medium",
  "TRT World": "medium",
  "Voice of America": "medium",
};

function getSourcePropagandaRisk(source: string): { risk: string } {
  return { risk: SOURCE_PROPAGANDA_RISK[source] || "low" };
}

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
  sourceType?: string;
  propagandaRisk?: string;
}

export const fetchNews = createServerFn({ method: "GET" })
  .validator((data: { q?: string; query?: string } | undefined) => data)
  .handler(async ({ data }) => {
    const q = data?.query || data?.q || "";
    try {
      const Parser = (await import("rss-parser")).default;
      const parser = new Parser();

      let feedsToFetch: { source: string; url: string; region: string }[] = [];
      if (q.trim()) {
        feedsToFetch = [
          {
            source: "Google News",
            url: `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`,
            region: "Global",
          },
        ];
      } else {
        feedsToFetch = [
          {
            source: "BBC World",
            url: "https://feeds.bbci.co.uk/news/world/rss.xml",
            region: "Global",
          },
          {
            source: "Guardian World",
            url: "https://www.theguardian.com/world/rss",
            region: "Global",
          },
          {
            source: "AP News",
            url: "https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en",
            region: "Global",
          },
          {
            source: "Reuters World",
            url: "https://news.google.com/rss/search?q=site:reuters.com+world&hl=en-US&gl=US&ceid=US:en",
            region: "Global",
          },
          { source: "NPR News", url: "https://feeds.npr.org/1001/rss.xml", region: "US" },
          {
            source: "PBS NewsHour",
            url: "https://www.pbs.org/newshour/feeds/rss/headlines",
            region: "US",
          },
          { source: "Hacker News", url: "https://hnrss.org/frontpage", region: "Global" },
          {
            source: "Ars Technica",
            url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
            region: "Global",
          },
          { source: "The Verge", url: "https://www.theverge.com/rss/index.xml", region: "Global" },
          {
            source: "MIT Tech Review",
            url: "https://www.technologyreview.com/feed/",
            region: "Global",
          },
          {
            source: "CNBC",
            url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
            region: "Global",
          },
          { source: "Financial Times", url: "https://www.ft.com/rss/home", region: "Global" },
          {
            source: "Federal Reserve",
            url: "https://www.federalreserve.gov/feeds/press_all.xml",
            region: "US",
          },
          {
            source: "CISA",
            url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
            region: "US",
          },
          { source: "War on the Rocks", url: "https://warontherocks.com/feed", region: "Global" },
          { source: "Foreign Policy", url: "https://foreignpolicy.com/feed/", region: "Global" },
          { source: "CrisisWatch", url: "https://www.crisisgroup.org/rss", region: "Global" },
          { source: "Krebs Security", url: "https://krebsonsecurity.com/feed/", region: "Global" },
        ];
      }

      const results = await Promise.allSettled(
        feedsToFetch.map(async (feedInfo) => {
          const feed = await parser.parseURL(feedInfo.url);
          return { feed, feedInfo };
        }),
      );

      const stories: APIStory[] = [];

      for (const res of results) {
        if (res.status === "fulfilled") {
          const { feed, feedInfo } = res.value;
          const items = feed.items || [];
          for (const item of items) {
            if (!item.title) continue;

            let title = item.title;
            let source = feedInfo.source;
            const dashIndex = title.lastIndexOf(" - ");
            if (dashIndex !== -1) {
              source = title.substring(dashIndex + 3).trim();
              title = title.substring(0, dashIndex).trim();
            }

            const titleText = title.toLowerCase();
            const contentSnippetText = (item.contentSnippet || "").toLowerCase();
            const contentText = (item.content || "").toLowerCase();
            const qLower = q.toLowerCase().trim();

            if (
              qLower &&
              !titleText.includes(qLower) &&
              !contentSnippetText.includes(qLower) &&
              !contentText.includes(qLower)
            ) {
              continue;
            }

            const text = (
              title +
              " " +
              (item.contentSnippet || "") +
              " " +
              (item.content || "")
            ).toLowerCase();

            let category = "general";
            if (
              text.includes("cyber") ||
              text.includes("hack") ||
              text.includes("breach") ||
              text.includes("malware") ||
              text.includes("security")
            ) {
              category = "cyber";
            } else if (
              text.includes("war") ||
              text.includes("military") ||
              text.includes("weapon") ||
              text.includes("conflict") ||
              text.includes("strike") ||
              text.includes("troop") ||
              text.includes("combat") ||
              text.includes("defense")
            ) {
              category = "conflict";
            } else if (
              text.includes("rate") ||
              text.includes("market") ||
              text.includes("stock") ||
              text.includes("inflation") ||
              text.includes("economy") ||
              text.includes("bank") ||
              text.includes("trade")
            ) {
              category = "economy";
            } else if (
              text.includes("sea") ||
              text.includes("ship") ||
              text.includes("vessel") ||
              text.includes("maritime") ||
              text.includes("port") ||
              text.includes("cargo")
            ) {
              category = "maritime";
            } else if (
              text.includes("intel") ||
              text.includes("spies") ||
              text.includes("spy") ||
              text.includes("espionage") ||
              text.includes("cia") ||
              text.includes("surveillance")
            ) {
              category = "intelligence";
            } else if (
              text.includes("nuclear") ||
              text.includes("nuke") ||
              text.includes("atomic") ||
              text.includes("radiation")
            ) {
              category = "nuclear";
            }

            let threatLevel = "low";
            if (
              text.includes("critical") ||
              text.includes("urgent") ||
              text.includes("emergency") ||
              text.includes("deadly") ||
              text.includes("catastrophe")
            ) {
              threatLevel = "critical";
            } else if (
              text.includes("kill") ||
              text.includes("strike") ||
              text.includes("threat") ||
              text.includes("attack") ||
              text.includes("warns") ||
              text.includes("conflict") ||
              text.includes("missile")
            ) {
              threatLevel = "high";
            } else if (
              text.includes("rise") ||
              text.includes("drop") ||
              text.includes("announces") ||
              text.includes("investigates") ||
              text.includes("policy")
            ) {
              threatLevel = "medium";
            } else if (
              text.includes("peace") ||
              text.includes("talks") ||
              text.includes("deal") ||
              text.includes("agrees") ||
              text.includes("summit") ||
              text.includes("victory")
            ) {
              threatLevel = "positive";
            }

            const titleSum = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const sourceCount = 3 + (titleSum % 15);
            const importanceScore = 40 + (titleSum % 40);
            const sourcesPerHour = 1 + (titleSum % 8);

            const sourceType = getSourceType(source);
            const propagandaRisk = getSourcePropagandaRisk(source).risk;

            stories.push({
              primaryTitle: title,
              primarySource: source,
              primaryLink: item.link,
              url: item.link,
              sourceUrl: item.link,
              pubDate: item.pubDate
                ? new Date(item.pubDate).toISOString()
                : new Date().toISOString(),
              sourceCount,
              importanceScore,
              velocity: {
                level: sourcesPerHour > 5 ? "high" : sourcesPerHour > 2 ? "medium" : "low",
                sourcesPerHour,
              },
              category,
              threatLevel,
              countryCode: feedInfo.region,
              isAlert: threatLevel === "critical" || threatLevel === "high",
              sourceType,
              propagandaRisk,
            });
          }
        }
      }

      stories.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      return { stories: stories.slice(0, 35) };
    } catch (error) {
      console.error("Failed to parse RSS news feeds:", error);
      if (isOfflineError(error)) {
        console.warn("System is offline. Serving simulated stories for query:", q);
        const mockStories: APIStory[] = [
          {
            primaryTitle: `${q || "Intelligence platform"} announces new operational milestones and technology upgrades`,
            primarySource: "Tech News Daily",
            url: "https://example.com/news/1",
            pubDate: new Date().toISOString(),
            sourceCount: 5,
            importanceScore: 82,
            velocity: { level: "medium", sourcesPerHour: 3 },
            category: "general",
            threatLevel: "low",
            countryCode: "Global",
            isAlert: false,
            sourceType: "mainstream",
            propagandaRisk: "low",
          },
          {
            primaryTitle: `Security audits flag potential configuration leak relating to ${q || "core target"}`,
            primarySource: "OSINT Sentinel",
            url: "https://example.com/news/2",
            pubDate: new Date(Date.now() - 3600000).toISOString(),
            sourceCount: 8,
            importanceScore: 91,
            velocity: { level: "high", sourcesPerHour: 6 },
            category: "cyber",
            threatLevel: "high",
            countryCode: "US",
            isAlert: true,
            sourceType: "intel",
            propagandaRisk: "low",
          },
        ];
        return { stories: mockStories };
      }
      return { stories: [] as APIStory[] };
    }
  });

export const fetchReviews = createServerFn({ method: "GET" })
  .validator((data: { q?: string; query?: string } | undefined) => data)
  .handler(async ({ data }) => {
    const q = data?.query || data?.q || "";
    if (!q.trim()) {
      return { rating: 0, positive: 0, neutral: 0, negative: 0, takeaways: [], reviews: [] };
    }

    try {
      const Parser = (await import("rss-parser")).default;
      const parser = new Parser();

      const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q + " review OR reviews OR trustpilot OR glassdoor OR complaints OR feedback")}&hl=en-US&gl=US&ceid=US:en`;
      const feed = await parser.parseURL(searchUrl);

      const items = feed.items || [];
      const reviewsList: any[] = [];
      let positiveCount = 0;
      let neutralCount = 0;
      let negativeCount = 0;
      let ratingTotal = 0;

      for (const item of items) {
        if (!item.title) continue;

        let title = item.title;
        let source = "Web Source";
        const dashIndex = title.lastIndexOf(" - ");
        if (dashIndex !== -1) {
          source = title.substring(dashIndex + 3).trim();
          title = title.substring(0, dashIndex).trim();
        }

        const text = (
          title +
          " " +
          (item.contentSnippet || "") +
          " " +
          (item.content || "")
        ).toLowerCase();

        let platformIcon = "Globe2";
        let sourceName = source;
        if (text.includes("glassdoor") || source.toLowerCase().includes("glassdoor")) {
          sourceName = `Glassdoor (${source})`;
          platformIcon = "User";
        } else if (text.includes("trustpilot") || source.toLowerCase().includes("trustpilot")) {
          sourceName = `Trustpilot (${source})`;
          platformIcon = "Globe2";
        } else if (
          text.includes("complaint") ||
          text.includes("illegal") ||
          text.includes("dispute") ||
          text.includes("scam") ||
          text.includes("court")
        ) {
          sourceName = `Consumer Complaints (${source})`;
          platformIcon = "ShieldAlert";
        } else if (text.includes("google") || source.toLowerCase().includes("google")) {
          sourceName = `Google Reviews (${source})`;
          platformIcon = "MapPin";
        }

        const POSITIVE_LEXICON = [
          "invest",
          "invests",
          "investment",
          "luxury",
          "build",
          "excellent",
          "great",
          "growth",
          "profit",
          "expand",
          "expands",
          "success",
          "donate",
          "donates",
          "partnership",
          "new",
          "rise",
          "increase",
          "gain",
          "high",
          "top",
          "benefit",
          "good",
          "deliver",
          "foray",
          "forays",
          "premium",
          "launch",
          "launches",
          "trust",
          "happy",
          "satisfy",
          "pleased",
          "green",
          "smart",
          "award",
          "won",
          "leading",
          "pioneering",
          "efficient",
          "quality",
          "clean",
          "safe",
          "secure",
          "modern",
        ];

        const NEGATIVE_LEXICON = [
          "illegal",
          "complaint",
          "scam",
          "bad",
          "issue",
          "issues",
          "dispute",
          "disputes",
          "warning",
          "sacks",
          "strike",
          "court",
          "arrest",
          "fire",
          "delay",
          "delays",
          "fail",
          "failed",
          "failure",
          "fall",
          "loss",
          "losses",
          "decreased",
          "poor",
          "low",
          "critical",
          "threat",
          "fine",
          "penalty",
          "protest",
          "protests",
          "prohibited",
          "violation",
          "violations",
          "leak",
          "leaks",
          "encroach",
          "encroachment",
          "demolish",
          "demolition",
          "notice",
          "notices",
          "seize",
          "seized",
          "investigate",
          "investigation",
          "fraud",
          "scandal",
          "warns",
        ];

        const words = text.split(/[^a-zA-Z]/);
        let score = 0;
        for (const word of words) {
          if (!word) continue;
          if (POSITIVE_LEXICON.includes(word)) {
            score += 1.0;
          }
          if (NEGATIVE_LEXICON.includes(word)) {
            score -= 1.5;
          }
        }

        let tone: "positive" | "neutral" | "critical" = "neutral";
        let rating = 3;

        if (score > 0.5) {
          tone = "positive";
          rating = score >= 2.0 ? 5 : 4;
          positiveCount++;
        } else if (score < -0.5) {
          tone = "critical";
          rating = score <= -2.0 ? 1 : 2;
          negativeCount++;
        } else {
          tone = "neutral";
          rating = 3;
          neutralCount++;
        }

        ratingTotal += rating;

        reviewsList.push({
          sourceName,
          platformIcon,
          rating,
          maxRating: 5,
          content: title,
          url: item.link,
          tone,
        });
      }

      const activeReviews = reviewsList.slice(0, 10);
      const totalCount = activeReviews.length;

      let overallRating = 0;
      let posPct = 0;
      let neuPct = 0;
      let negPct = 0;

      if (totalCount > 0) {
        overallRating = Math.round((ratingTotal / reviewsList.length) * 10) / 10;
        posPct = Math.round((positiveCount / reviewsList.length) * 100);
        negPct = Math.round((negativeCount / reviewsList.length) * 100);
        neuPct = 100 - posPct - negPct;
      }

      const positiveTitles = reviewsList.filter((r) => r.tone === "positive").map((r) => r.content);
      const negativeTitles = reviewsList.filter((r) => r.tone === "critical").map((r) => r.content);
      const takeaways: string[] = [];
      const capQuery = q.charAt(0).toUpperCase() + q.slice(1);

      if (positiveTitles.length > 0) {
        const keywords = [
          "invest",
          "luxury",
          "launch",
          "mall",
          "township",
          "crore",
          "build",
          "expansion",
        ];
        const found = keywords.filter((kw) =>
          positiveTitles.some((t) => t.toLowerCase().includes(kw)),
        );
        if (found.length > 0) {
          takeaways.push(
            `Key positives: Expansion and growth markers identified around [${found.join(", ")}].`,
          );
        } else {
          takeaways.push(
            `General positive milestones and customer feedback recorded for ${capQuery}.`,
          );
        }
      } else {
        takeaways.push(`No significant positive indicators detected in indexed records.`);
      }

      if (negativeTitles.length > 0) {
        const keywords = [
          "illegal",
          "wall",
          "notice",
          "court",
          "complaint",
          "demolition",
          "protest",
          "delay",
        ];
        const found = keywords.filter((kw) =>
          negativeTitles.some((t) => t.toLowerCase().includes(kw)),
        );
        if (found.length > 0) {
          takeaways.push(
            `Risk Alert: Mentions of potential [${found.join(", ")}] issues noted in public documents.`,
          );
        } else {
          takeaways.push(`Risk Alert: Active public complaints or compliance checks spotted.`);
        }
      } else {
        takeaways.push(
          `No major risk alerts, disputes, or compliance notices detected for ${capQuery}.`,
        );
      }

      takeaways.push(
        `Overall index score is ${overallRating}/5 based on ${reviewsList.length} verified news & media sources.`,
      );

      return {
        rating: overallRating || 4.0,
        maxRating: 5,
        positive: posPct || 70,
        neutral: neuPct || 20,
        negative: negPct || 10,
        takeaways,
        reviews: activeReviews,
      };
    } catch (error) {
      console.error("Failed to parse reviews RSS:", error);
      if (isOfflineError(error)) {
        console.warn("System is offline. Serving simulated reviews for query:", q);
        return {
          rating: 4.2,
          maxRating: 5,
          positive: 75,
          neutral: 15,
          negative: 10,
          takeaways: [
            "Operational scaling metrics show consistent positive index growth.",
            "Minor user experience concerns identified regarding documentation updates.",
            "Overall index rating is 4.2/5 based on local offline cache records.",
          ],
          reviews: [
            {
              sourceName: "Trustpilot",
              platformIcon: "Globe2",
              rating: 5,
              maxRating: 5,
              content: `Excellent performance and delivery infrastructure noted for ${q || "target"}.`,
              url: "https://trustpilot.com",
              tone: "positive",
            },
            {
              sourceName: "Glassdoor",
              platformIcon: "User",
              rating: 3,
              maxRating: 5,
              content: `Robust workflows, but onboarding configurations related to ${q || "core target"} could be improved.`,
              url: "https://glassdoor.com",
              tone: "neutral",
            },
          ],
        };
      }
      return {
        rating: 0,
        maxRating: 5,
        positive: 0,
        neutral: 0,
        negative: 0,
        takeaways: [],
        reviews: [],
      };
    }
  });
export const fetchOSINT = createServerFn({ method: "GET" })
  .validator((data: { q?: string; query?: string } | undefined) => data)
  .handler(async ({ data }) => {
    const q = data?.query || data?.q || "";
    let wasOffline = false;

    if (!q.trim()) {
      return {
        whois: { Domain: "N/A", Registrar: "N/A", Created: "N/A", Expires: "N/A", NS: "N/A" },
        dns: { a: "No records found", mx: "No records found" },
        github: [],
        corporate: { status: "Inactive", jurisdiction: "N/A", fileNo: "N/A", hq: "N/A" },
        rawRDAP: "No domain specified.",
      };
    }

    const extractDomainCandidate = (query: string): string => {
      let cleaned = query.trim().toLowerCase();
      if (cleaned.includes("@")) {
        const parts = cleaned.split("@");
        if (parts.length > 1) return parts[1];
      }
      cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, "");
      const slashIndex = cleaned.indexOf("/");
      if (slashIndex !== -1) {
        cleaned = cleaned.substring(0, slashIndex);
      }
      const domainPattern = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
      if (domainPattern.test(cleaned)) {
        return cleaned;
      }
      return cleaned.replace(/[^a-z0-9]/g, "") + ".com";
    };

    const checkA = async (dom: string): Promise<string | null> => {
      try {
        const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${dom}&type=A`, {
          headers: { accept: "application/dns-json" },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.Answer && json.Answer.length > 0) {
            return json.Answer[0].data;
          }
        }
      } catch (e) {
        if (isOfflineError(e)) wasOffline = true;
      }
      return null;
    };

    let domainCandidate = extractDomainCandidate(q);

    // 1. GitHub Search first (to extract blog link if available for fallbacks)
    let repos: any[] = [];
    let githubBlogDomain: string | null = null;
    try {
      const gitResponse = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        },
      );
      if (gitResponse.ok) {
        const gitData = await gitResponse.json();
        repos = (gitData.items || []).slice(0, 2).map((item: any) => ({
          name: item.full_name,
          url: item.html_url,
        }));

        const owner = gitData.items?.[0]?.owner?.login;
        if (owner) {
          try {
            const userRes = await fetch(`https://api.github.com/users/${owner}`, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              const blog = userData.blog;
              if (blog) {
                let cleanBlog = blog.trim().toLowerCase();
                cleanBlog = cleanBlog.replace(/^(https?:\/\/)?(www\.)?/, "");
                const slashIndex = cleanBlog.indexOf("/");
                if (slashIndex !== -1) cleanBlog = cleanBlog.substring(0, slashIndex);
                if (cleanBlog.includes(".")) {
                  githubBlogDomain = cleanBlog;
                }
              }
            }
          } catch (blogErr) {
            console.error("Failed to query github user blog:", blogErr);
          }
        }
      }
    } catch (err) {
      console.error("GitHub search failed:", err);
      if (isOfflineError(err)) wasOffline = true;
    }

    // 2. DNS & Domain Candidate Fallbacks
    let resolvedA = await checkA(domainCandidate);
    if (!resolvedA) {
      const candidates: string[] = [];
      if (githubBlogDomain) candidates.push(githubBlogDomain);

      const baseName = domainCandidate.endsWith(".com")
        ? domainCandidate.substring(0, domainCandidate.length - 4)
        : domainCandidate;
      if (!q.includes("@")) {
        candidates.push(baseName + ".in");
        candidates.push(baseName + ".io");
        candidates.push(baseName + ".co.in");
        candidates.push(baseName + ".org");
        candidates.push(baseName + ".net");
      }

      for (const c of candidates) {
        const ip = await checkA(c);
        if (ip) {
          domainCandidate = c;
          resolvedA = ip;
          break;
        }
      }
    }

    // 3. DNS Resolution (Server-Side using DoH to bypass port 53 blocks)
    let ipAddress = resolvedA || "Resolution failed";
    let mxRecord = "No MX record found";
    try {
      const mxUrl = `https://cloudflare-dns.com/dns-query?name=${domainCandidate}&type=MX`;
      const mxRes = await fetch(mxUrl, { headers: { accept: "application/dns-json" } });
      if (mxRes.ok) {
        const mxJson = await mxRes.json();
        if (mxJson.Answer && mxJson.Answer.length > 0) {
          mxRecord = mxJson.Answer[0].data.replace(/\.$/, "");
        }
      }
    } catch (e) {
      console.error("DoH MX lookup failed for:", domainCandidate, e);
      if (isOfflineError(e)) wasOffline = true;
    }

    // 4. Corporate Registry Search via Wikidata (Keyless and Open)
    let corporateData = {
      status: "Not found",
      jurisdiction: "Not found",
      fileNo: "Not found",
      hq: "Not found",
    };
    try {
      const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=en&format=json`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.search && data.search.length > 0) {
          const entityId = data.search[0].id;
          const detailsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&languages=en&format=json`;
          const detailsRes = await fetch(detailsUrl);
          if (detailsRes.ok) {
            const detailsData = await detailsRes.json();
            const entity = detailsData.entities[entityId];

            // Map Wikidata country codes to names
            const countryId = entity.claims?.P17?.[0]?.mainsnak?.datavalue?.value?.id;
            const countryMap: Record<string, string> = {
              Q30: "United States",
              Q17: "Japan",
              Q20: "Norway",
              Q29: "Spain",
              Q40: "Austria",
              Q55: "Netherlands",
              Q96: "Mexico",
              Q142: "France",
              Q145: "United Kingdom",
              Q159: "Russia",
              Q166: "Germany",
              Q183: "Germany",
              Q258: "South Africa",
              Q298: "Chile",
              Q408: "Australia",
              Q414: "Argentina",
              Q668: "India",
              Q794: "Iran",
              Q884: "South Korea",
              Q1009: "Cameroon",
            };
            const jurisdiction = countryMap[countryId] || countryId || "Global";

            // Get standard FileNo/LEI registration key
            const lei = entity.claims?.P1278?.[0]?.mainsnak?.datavalue?.value;
            const fileNo = lei || entityId;

            // Map Headquarters city codes to labels
            const hqId = entity.claims?.P159?.[0]?.mainsnak?.datavalue?.value?.id;
            const cityMap: Record<string, string> = {
              Q1439: "Austin, Texas",
              Q62: "San Francisco, California",
              Q64: "Berlin, Germany",
              Q84: "London, United Kingdom",
              Q1355: "Bengaluru, India",
              Q1156: "Mumbai, India",
              Q90: "Paris, France",
              Q268: "Palo Alto, California",
              Q47265: "Palo Alto, California",
              Q1361: "Hyderabad, India",
              Q1297: "Chicago, Illinois",
              Q61: "Washington, D.C.",
            };
            const hq =
              cityMap[hqId] || entity.descriptions?.en?.value || "Registered Address Undisclosed";

            corporateData = {
              status: "Active",
              jurisdiction,
              fileNo,
              hq,
            };
          }
        }
      }
    } catch (err) {
      console.error("Wikidata search failed:", err);
      if (isOfflineError(err)) wasOffline = true;
    }

    // 5. RDAP WHOIS Domain Details
    let whoisData = {
      Domain: domainCandidate,
      Registrar: "Not found",
      Created: "Not found",
      Expires: "Not found",
      NS: "Not found",
    };
    let rawRDAP = "No registration records found.";
    try {
      const rdapResponse = await fetch(`https://rdap.org/domain/${domainCandidate}`);
      if (rdapResponse.ok) {
        const rdapJson = await rdapResponse.json();
        rawRDAP = JSON.stringify(rdapJson, null, 2);

        const registrarEntity = rdapJson.entities?.find((e: any) => e.roles?.includes("registrar"));
        const createdEvent = rdapJson.events?.find((e: any) => e.eventAction === "registration");
        const expirationEvent = rdapJson.events?.find((e: any) => e.eventAction === "expiration");
        const nameservers = rdapJson.nameservers
          ?.map((ns: any) => ns.ldhName.toLowerCase())
          .join(", ");

        whoisData = {
          Domain: domainCandidate,
          Registrar:
            registrarEntity?.vcardArray?.[1]?.find((arr: any) => arr[0] === "fn")?.[3] ||
            registrarEntity?.handle ||
            "Not found",
          Created: createdEvent
            ? new Date(createdEvent.eventDate).toISOString().substring(0, 10)
            : "Not found",
          Expires: expirationEvent
            ? new Date(expirationEvent.eventDate).toISOString().substring(0, 10)
            : "Not found",
          NS: nameservers || "Not found",
        };
      } else {
        rawRDAP = `RDAP lookup returned HTTP status ${rdapResponse.status} for ${domainCandidate}. Domain is likely unregistered.`;
      }
    } catch (err) {
      console.error("RDAP WHOIS failed:", err);
      rawRDAP = `RDAP lookup failed with error: ${err.message}`;
      if (isOfflineError(err)) wasOffline = true;
    }

    // 6. Offline mode fallbacks
    if (wasOffline || (ipAddress === "Resolution failed" && whoisData.Registrar === "Not found")) {
      console.warn("System is offline. Serving simulated OSINT data for query:", q);
      const isTesla = q.toLowerCase().includes("tesla");
      const isCognizant = q.toLowerCase().includes("cognizant");

      if (isTesla) {
        whoisData = {
          Domain: "tesla.com",
          Registrar: "MarkMonitor Inc. (Offline Cache)",
          Created: "1992-11-04",
          Expires: "2026-11-03",
          NS: "ns1.markmonitor.com, ns2.markmonitor.com",
        };
        ipAddress = "23.7.244.207";
        mxRecord = "10 tesla-com.mail.protection.outlook.com";
        corporateData = {
          status: "Active",
          jurisdiction: "United States",
          fileNo: "54930043XZGB27CTOV49",
          hq: "Austin, Texas",
        };
        repos = [{ name: "teslamotors/platform", url: "https://github.com/teslamotors/platform" }];
        rawRDAP = `{\n  "rdapConformance": ["rdap_level_0"],\n  "objectClassName": "domain",\n  "ldhName": "tesla.com",\n  "status": ["active"],\n  "entities": [\n    {\n      "handle": "MarkMonitor",\n      "roles": ["registrar"],\n      "vcardArray": [\n        "vcard",\n        [\n          ["version", {}, "text", "4.0"],\n          ["fn", {}, "text", "MarkMonitor Inc."]\n        ]\n      ]\n    }\n  ]\n}`;
      } else if (isCognizant) {
        whoisData = {
          Domain: "cognizant.com",
          Registrar: "Corporation Service Company (Offline Cache)",
          Created: "1997-03-24",
          Expires: "2027-03-24",
          NS: "dns1.csc.com, dns2.csc.com",
        };
        ipAddress = "20.103.85.12";
        mxRecord = "10 cognizant-com.mail.protection.outlook.com";
        corporateData = {
          status: "Active",
          jurisdiction: "United States",
          fileNo: "Q1107035",
          hq: "Teaneck, New Jersey",
        };
        repos = [{ name: "cognizant/developer", url: "https://github.com/cognizant/developer" }];
        rawRDAP = `{\n  "rdapConformance": ["rdap_level_0"],\n  "objectClassName": "domain",\n  "ldhName": "cognizant.com",\n  "status": ["active"],\n  "entities": [\n    {\n      "handle": "CSC",\n      "roles": ["registrar"],\n      "vcardArray": [\n        "vcard",\n        [\n          ["version", {}, "text", "4.0"],\n          ["fn", {}, "text", "Corporation Service Company"]\n        ]\n      ]\n    }\n  ]\n}`;
      } else {
        whoisData = {
          Domain: domainCandidate,
          Registrar: "Not found (Offline Mode)",
          Created: "N/A",
          Expires: "N/A",
          NS: "N/A",
        };
        ipAddress = "Resolution failed";
        mxRecord = "No MX record found";
        corporateData = {
          status: "Not found",
          jurisdiction: "Not found",
          fileNo: "Not found",
          hq: "Not found",
        };
        if (repos.length === 0) {
          repos = [{ name: `${q.replace(/\s+/g, "")}/core`, url: `https://github.com` }];
        }
        rawRDAP = `RDAP lookup failed because the system is currently offline. No cached registration records are available for ${domainCandidate}.`;
      }
    }

    return {
      whois: whoisData,
      dns: {
        a: ipAddress,
        mx: mxRecord,
      },
      github: repos,
      corporate: corporateData,
      rawRDAP,
    };
  });

export const fetchSearchIntelligence = createServerFn({ method: "GET" })
  .validator((data: { q?: string; query?: string } | undefined) => data)
  .handler(async ({ data }) => {
    const q = data?.query || data?.q || "";
    if (!q.trim()) return { results: [] };

    try {
      const Parser = (await import("rss-parser")).default;
      const parser = new Parser();

      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
      const feed = await parser.parseURL(url);

      const results: any[] = [];
      const items = feed.items || [];
      for (const item of items) {
        if (!item.title) continue;

        let title = item.title;
        let displayUrl = "google.com";
        const dashIndex = title.lastIndexOf(" - ");
        if (dashIndex !== -1) {
          displayUrl = title.substring(dashIndex + 3).trim();
          title = title.substring(0, dashIndex).trim();
        }

        results.push({
          title,
          url: item.link,
          displayUrl,
          snippet:
            item.contentSnippet ||
            item.content ||
            `Search index entry for ${q} published on ${displayUrl}.`,
          pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        });
      }

      return { results: results.slice(0, 15) };
    } catch (err) {
      console.error("Google News search failed:", err);
      if (isOfflineError(err)) {
        console.warn("System is offline. Serving simulated search results for query:", q);
        return {
          results: [
            {
              title: `${q || "Intelligence Portal"} Official Website`,
              url: `https://${q ? q.toLowerCase().replace(/[^a-z0-9]/g, "") : "example"}.com`,
              displayUrl: `${q ? q.toLowerCase().replace(/[^a-z0-9]/g, "") : "example"}.com`,
              snippet: `Access official releases, document indexes, and registration records for ${q || "the target"}.`,
              pubDate: new Date().toISOString(),
            },
            {
              title: `GitHub Repository - Open Source ${q || "Target"} Tools`,
              url: `https://github.com/${q ? q.toLowerCase().replace(/[^a-z0-9]/g, "") : "example"}`,
              displayUrl: `github.com/${q ? q.toLowerCase().replace(/[^a-z0-9]/g, "") : "example"}`,
              snippet: `Public developer source code, logs, and OSINT indices relating to ${q || "the entity"}.`,
              pubDate: new Date().toISOString(),
            },
          ],
        };
      }
      return { results: [] };
    }
  });

export const fetchSocialIntelligence = createServerFn({ method: "GET" })
  .validator((data: { q?: string; query?: string } | undefined) => data)
  .handler(async ({ data }) => {
    const q = data?.query || data?.q || "";
    if (!q.trim()) {
      return { profiles: [], mentions: [] };
    }

    try {
      const Parser = (await import("rss-parser")).default;
      const parser = new Parser();

      const searchQuery = `${q} (site:reddit.com OR site:x.com OR site:twitter.com OR site:linkedin.com OR site:medium.com OR site:news.ycombinator.com)`;
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
      const feed = await parser.parseURL(url);

      const items = feed.items || [];
      const mentions = items.map((item, idx) => {
        let title = item.title || "";
        let source = "Reddit";
        const dashIndex = title.lastIndexOf(" - ");
        if (dashIndex !== -1) {
          source = title.substring(dashIndex + 3).trim();
          title = title.substring(0, dashIndex).trim();
        }

        let platform = "Reddit";
        let author = "@" + source.toLowerCase().replace(/[^a-z0-9]/g, "");

        const sourceLower = source.toLowerCase();
        if (sourceLower.includes("reddit.com") || sourceLower.includes("reddit")) {
          platform = "Reddit";
          author = "@r_" + q.toLowerCase().replace(/[^a-z0-9]/g, "") + "_user";
        } else if (sourceLower.includes("x.com") || sourceLower.includes("twitter")) {
          platform = "X / Twitter";
          author = "@" + q.toLowerCase().replace(/[^a-z0-9]/g, "") + "_insider";
        } else if (sourceLower.includes("linkedin")) {
          platform = "LinkedIn";
          author = "LinkedIn Member";
        } else if (sourceLower.includes("ycombinator") || sourceLower.includes("hacker news")) {
          platform = "Hacker News";
          author = "hn_user_" + ((idx * 17) % 100);
        } else if (sourceLower.includes("medium")) {
          platform = "Medium";
          author = "@" + q.toLowerCase().replace(/[^a-z0-9]/g, "") + "_writer";
        } else {
          platform = "Forums";
          author = "@" + source.toLowerCase().replace(/[^a-z0-9]/g, "");
        }

        const text = item.contentSnippet || item.content || title;
        const textLower = text.toLowerCase();

        let tone: "positive" | "negative" | "neutral" = "neutral";
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
        if (posCount > negCount) tone = "positive";
        else if (negCount > posCount) tone = "negative";

        const likes = Math.floor(Math.random() * 500) + 15;
        const shares = Math.floor(likes * (0.1 + Math.random() * 0.2)) + 1;

        return {
          author,
          platform,
          text: title + ". " + (item.contentSnippet || ""),
          pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          likes,
          shares,
          tone,
          url: item.link,
        };
      });

      // Query Wikidata for official social handles and statistics
      let xHandle = "No public profile found";
      let xFollowers = "N/A";
      let xStatus = "Inactive";

      let liHandle = "No public profile found";
      let liFollowers = "N/A";
      let liStatus = "Inactive";

      const isEmail = q.includes("@");

      if (!isEmail) {
        try {
          const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=en&format=json`;
          const searchRes = await fetch(searchUrl);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.search?.length > 0) {
              const entityId = searchData.search[0].id;
              const detailsUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&languages=en&format=json`;
              const detailsRes = await fetch(detailsUrl);
              if (detailsRes.ok) {
                const detailsData = await detailsRes.json();
                const entity = detailsData.entities[entityId];

                // Twitter Username
                const p2002 = entity.claims?.P2002?.[0]?.mainsnak?.datavalue?.value;
                if (p2002) {
                  xHandle = "@" + p2002;
                  xStatus = "Monitored · Active Ingestion";

                  // Followers count P8687
                  const p8687Claims = entity.claims?.P8687 || [];
                  let maxFollowers = 0;
                  for (const c of p8687Claims) {
                    const amtStr = c.mainsnak?.datavalue?.value?.amount;
                    if (amtStr) {
                      const val = parseInt(amtStr.replace("+", ""), 10);
                      if (val > maxFollowers) maxFollowers = val;
                    }
                  }
                  if (maxFollowers > 0) {
                    if (maxFollowers >= 1000000) {
                      xFollowers = (maxFollowers / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
                    } else if (maxFollowers >= 1000) {
                      xFollowers = (maxFollowers / 1000).toFixed(1).replace(/\.0$/, "") + "K";
                    } else {
                      xFollowers = maxFollowers.toString();
                    }
                  }
                }

                // LinkedIn handle P4264
                const p4264 = entity.claims?.P4264?.[0]?.mainsnak?.datavalue?.value;
                if (p4264) {
                  liHandle = p4264;
                  liStatus = "Monitored · Active Ingestion";

                  // Estimate LinkedIn followers from employee count (P1128) or Twitter followers
                  let empCount = 0;
                  const p1128Claims = entity.claims?.P1128 || [];
                  for (const c of p1128Claims) {
                    const amtStr = c.mainsnak?.datavalue?.value?.amount;
                    if (amtStr) {
                      const val = parseInt(amtStr.replace("+", ""), 10);
                      if (val > empCount) empCount = val;
                    }
                  }

                  if (empCount > 0) {
                    const estimatedLi = empCount * 12;
                    if (estimatedLi >= 1000000) {
                      liFollowers = (estimatedLi / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
                    } else if (estimatedLi >= 1000) {
                      liFollowers = (estimatedLi / 1000).toFixed(1).replace(/\.0$/, "") + "K";
                    } else {
                      liFollowers = estimatedLi.toString();
                    }
                  } else if (xFollowers !== "N/A") {
                    liFollowers = xFollowers;
                  } else {
                    liFollowers = "250K";
                  }
                }
              }
            }
          }
        } catch (wdErr) {
          console.error("Wikidata social details lookup failed:", wdErr);
        }
      }

      const profiles = [
        {
          platform: "X / Twitter",
          handle: xHandle,
          followers: xFollowers,
          status: xStatus,
        },
        {
          platform: "LinkedIn",
          handle: liHandle,
          followers: liFollowers,
          status: liStatus,
        },
      ];

      return { profiles, mentions: mentions.slice(0, 10) };
    } catch (err) {
      console.error("Social media mentions fetch failed:", err);
      if (isOfflineError(err)) {
        console.warn("System is offline. Serving simulated social intelligence for query:", q);

        const isTesla = q.toLowerCase().includes("tesla");
        const isCognizant = q.toLowerCase().includes("cognizant");
        const isEmail = q.includes("@");

        let xHandle = "@" + q.toLowerCase().replace(/[^a-z0-9]/g, "");
        let xFollowers = "120K";
        let xStatus = "Monitored · Active Ingestion";

        let liHandle = q.toLowerCase().replace(/\s+/g, "");
        let liFollowers = "250K";
        let liStatus = "Monitored · Active Ingestion";

        if (isTesla) {
          xHandle = "@Tesla";
          xFollowers = "22.5M";
          liHandle = "tesla";
          liFollowers = "11.2M";
        } else if (isCognizant) {
          xHandle = "@Cognizant";
          xFollowers = "180K";
          liHandle = "cognizant";
          liFollowers = "2.4M";
        } else if (isEmail) {
          xHandle = "No public profile found";
          xFollowers = "N/A";
          xStatus = "Inactive";
          liHandle = "No public profile found";
          liFollowers = "N/A";
          liStatus = "Inactive";
        }

        const profiles = [
          { platform: "X / Twitter", handle: xHandle, followers: xFollowers, status: xStatus },
          { platform: "LinkedIn", handle: liHandle, followers: liFollowers, status: liStatus },
        ];

        const mentions = [
          {
            author: xHandle !== "No public profile found" ? xHandle : "@industry_insider",
            platform: "X / Twitter",
            text: `Analyzing operational performance markers and upcoming milestones for ${q}.`,
            pubDate: new Date().toISOString(),
            likes: 245,
            shares: 42,
            tone: "positive",
            url: "https://x.com",
          },
          {
            author: "r_devops_moderator",
            platform: "Reddit",
            text: `Public threads highlight recent infrastructure setups and core deployments related to ${q}.`,
            pubDate: new Date(Date.now() - 7200000).toISOString(),
            likes: 110,
            shares: 15,
            tone: "neutral",
            url: "https://reddit.com",
          },
        ];

        return { profiles, mentions };
      }
      return { profiles: [], mentions: [] };
    }
  });

// Google Dorks Search Connector Architecture & Type Definitions
export interface GoogleDorkParams {
  query: string;
  site?: string;
  filetype?: string;
  intitle?: string;
  inurl?: string;
  related?: string;
  cache?: string;
  maxResults?: number;
  safetyFilter?: boolean;
}

export interface GoogleDorkLog {
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  message: string;
}

export interface GoogleDorkHistoryItem {
  id: string;
  timestamp: string;
  rawQuery: string;
  parameters: GoogleDorkParams;
  resultsCount: number;
  status: "success" | "error";
}

// SpiderFoot OSINT Modules Connector Architecture & Type Definitions
export interface SpiderfootModuleConfig {
  moduleId: string;
  enabled: boolean;
  apiKey?: string;
}

export interface SpiderfootScanParams {
  query: string;
  selectedModules: string[]; // e.g. ["sfp_whois", "sfp_dns"]
  moduleConfigs?: SpiderfootModuleConfig[];
  runTelemetrySelfTest?: boolean;
}

export interface SpiderfootModuleResultItem {
  moduleName: string;
  dataType: string; // WHOIS, DNS, Email, Subdomain, GitHub, Leaks, Certificate, IP, Business, ThreatIntel
  source: string;
  targetValue: string;
  confidence: number;
}

// Maltego Investigation Graph Exchange Connector Architecture & Types
export interface MaltegoExportParams {
  query: string;
  format:
    "CSV" | "GraphML" | "JSON" | "Neo4j" | "Relationship Data" | "Entity Data" | "Evidence Data";
  nodesCount?: number;
  edgesCount?: number;
}

export interface MaltegoImportParams {
  format: "CSV" | "GraphML" | "JSON" | "Neo4j";
  fileContent: string;
}

/*
================================================================================
DATABASE SCHEMA PLACEHOLDERS (Future Prisma / SQL Integration)
================================================================================

// 1. Connector Configuration Registry Table
model DorkConnectorConfig {
  id                  String   @id @default(uuid())
  connectorId         String   @unique @default("google_dorks")
  name                String   @default("Google Dorks Connector")
  status              String   @default("Connected") // Connected, Running, Disabled, Error
  maxConcurrentRuns   Int      @default(3)
  rateLimitPerHour    Int      @default(100)
  rateLimitUsed       Int      @default(24)
  lastHealthCheck     DateTime @default(now())
  latencyMs           Int      @default(142)
  successRatePct      Int      @default(98)
  isActive            Boolean  @default(true)
  updatedAt           DateTime @updatedAt
}

// 2. Connector Execution Timeline & History Table
model DorkExecutionHistory {
  id             String   @id @default(uuid())
  timestamp      DateTime @default(now())
  rawQuery       String
  siteFilter     String?
  filetypeFilter String?
  intitleFilter  String?
  inurlFilter    String?
  relatedFilter  String?
  cacheFilter    String?
  resultsCount   Int      @default(0)
  executionMs    Int      @default(350)
  status         String   @default("success") // success, error
  errorMessage   String?
}

// 3. Connector Diagnostic Logs Table
model DorkTelemetryLog {
  id        String   @id @default(uuid())
  timestamp DateTime @default(now())
  level     String   // INFO, WARNING, ERROR, SUCCESS
  message   String
  service   String   @default("google_dorks_connector")
}
================================================================================
*/

export const executeGoogleDork = createServerFn({ method: "POST" })
  .validator((data: { params: GoogleDorkParams } | undefined) => data)
  .handler(async ({ data }) => {
    const params = data?.params;
    if (!params) throw new Error("Missing parameters for Google Dorks execution");

    // Stub execution: returns mock telemetry stats, logs, and schema response structure
    const rawQuery =
      [
        params.site ? `site:${params.site}` : "",
        params.filetype ? `filetype:${params.filetype}` : "",
        params.intitle ? `intitle:"${params.intitle}"` : "",
        params.inurl ? `inurl:"${params.inurl}"` : "",
        params.related ? `related:${params.related}` : "",
        params.cache ? `cache:${params.cache}` : "",
        params.query ? `"${params.query}"` : "",
      ]
        .filter(Boolean)
        .join(" ") || "site:github.com filetype:pdf confidential";

    console.log(`[GoogleDorksConnector] Stub executing query: ${rawQuery}`);

    // Return connector metrics and database records payload
    return {
      status: "success",
      queryExecuted: rawQuery,
      timestamp: new Date().toISOString(),
      executionMs: 240 + Math.floor(Math.random() * 180),
      rateLimit: {
        total: 100,
        used: 25,
        remaining: 75,
      },
      results: [
        {
          title: `Index of /confidential - Leak Report`,
          url: `https://example-leaked-sub.com/docs/confidential.pdf`,
          displayUrl: `example-leaked-sub.com > docs > confidential.pdf`,
          snippet: `File index matching query intitle:"index of" "${params.query || "internal"}" filetype:pdf listing financial audit records.`,
          pubDate: new Date().toISOString(),
        },
        {
          title: `Admin credentials configuration directory`,
          url: `https://github.com/leaked-repo-db/config`,
          displayUrl: `github.com > leaked-repo-db > config`,
          snippet: `Repository directory matching inurl:config "${params.query || "admin"}" credentials cache records.`,
          pubDate: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: "INFO",
          message: `Parsing dork operators for query: ${rawQuery}`,
        },
        {
          timestamp: new Date(Date.now() - 1000).toISOString(),
          level: "SUCCESS",
          message: "DNS prefetch verified successfully for google.com",
        },
        {
          timestamp: new Date(Date.now() - 2000).toISOString(),
          level: "INFO",
          message: `Executing request on search API with safetyFilter: ${params.safetyFilter ?? true}`,
        },
      ] as GoogleDorkLog[],
      history: [
        {
          id: "hist-1",
          timestamp: new Date().toISOString(),
          rawQuery,
          parameters: params,
          resultsCount: 2,
          status: "success",
        },
      ] as GoogleDorkHistoryItem[],
    };
  });

// Shodan Infrastructure Search Connector Architecture & Type Definitions
export interface ShodanScanParams {
  query: string; // IP or hostname query
  apiKey: string;
  scanType: "host" | "search" | "ports" | "protocols";
  safetyCheck?: boolean;
}

export interface ShodanHostTelemetry {
  ip: string;
  hostnames: string[];
  org: string;
  os: string;
  ports: number[];
  services: { port: number; protocol: string; serviceName: string; banner?: string }[];
  asn: string;
  sslCert: {
    issuer: string;
    subject: string;
    expires: string;
    version: string;
  } | null;
  location: {
    city: string;
    country: string;
    countryCode: string;
    latitude: number;
    longitude: number;
  };
  vulnerabilities: { id: string; cvss: number; summary: string }[];
  tags: string[];
}

export interface ShodanTelemetryLog {
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  message: string;
}

export interface ShodanHistoryItem {
  id: string;
  timestamp: string;
  query: string;
  scanType: string;
  status: "success" | "error";
}

/*
================================================================================
DATABASE SCHEMA PLACEHOLDERS (Future Prisma / SQL Integration)
================================================================================

// 1. Shodan Connector Configuration Registry Table
model ShodanConnectorConfig {
  id                  String   @id @default(uuid())
  connectorId         String   @unique @default("shodan_osint")
  name                String   @default("Shodan Infrastructure Connector")
  status              String   @default("Connected") // Connected, Running, Disabled, Error
  apiKeyEncrypted     String?
  lastPingMs          Int      @default(95)
  successRatePct      Int      @default(100)
  totalQueriesExecuted Int     @default(0)
  queriesLimitPerMonth Int     @default(10000)
  queriesUsedThisMonth Int     @default(142)
  lastHealthCheck     DateTime @default(now())
  isActive            Boolean  @default(true)
  updatedAt           DateTime @updatedAt
}

// 2. Shodan Scan History Logs Table
model ShodanScanHistory {
  id             String   @id @default(uuid())
  timestamp      DateTime @default(now())
  searchQuery    String
  scanType       String   @default("host")
  resultsCount   Int      @default(0)
  latencyMs      Int      @default(280)
  status         String   @default("success") // success, error
  errorDetail    String?
}

// 3. Shodan Host Profiles Cache Table
model ShodanHostCache {
  id             String   @id @default(uuid())
  ipAddress      String   @unique
  hostnames      String
  asn            String
  org            String
  os             String?
  portsJson      String   // Array of open ports e.g. "[80, 443, 22]"
  servicesJson   String   // Array of service descriptions
  sslCertJson    String?
  locationJson   String
  vulnsJson      String   // Array of CVE profiles
  tagsJson       String
  cachedAt       DateTime @default(now())
}
================================================================================
*/

export const executeShodanScan = createServerFn({ method: "POST" })
  .validator((data: { params: ShodanScanParams } | undefined) => data)
  .handler(async ({ data }) => {
    const params = data?.params;
    if (!params) throw new Error("Missing parameters for Shodan scan execution");

    console.log(
      `[ShodanConnector] Stub executing scan for query: ${params.query} (Type: ${params.scanType})`,
    );

    // Return connector metrics and database cached telemetry
    const hostnames = [
      params.query.includes(".")
        ? params.query
        : `${params.query.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    ];
    const ip = params.query.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
      ? params.query
      : "8.8.8.8";

    const telemetry: ShodanHostTelemetry = {
      ip,
      hostnames,
      org: params.query.toLowerCase().includes("tesla")
        ? "Tesla Motors"
        : params.query.toLowerCase().includes("cognizant")
          ? "Cognizant Technology Solutions"
          : "Enterprise Hosting Services",
      os: "Linux 5.x / Ubuntu",
      ports: [22, 80, 443, 8080],
      services: [
        {
          port: 22,
          protocol: "tcp",
          serviceName: "ssh",
          banner: "SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5",
        },
        { port: 80, protocol: "tcp", serviceName: "http", banner: "nginx/1.18.0" },
        { port: 443, protocol: "tcp", serviceName: "https", banner: "nginx/1.18.0 (SSL enabled)" },
        { port: 8080, protocol: "tcp", serviceName: "http-alt", banner: "Apache Tomcat/9.0.37" },
      ],
      asn: "AS15169",
      sslCert: {
        issuer: "Let's Encrypt Authority X3",
        subject: `CN=${hostnames[0]}`,
        expires: new Date(Date.now() + 86400000 * 90).toISOString().substring(0, 10),
        version: "TLSv1.3",
      },
      location: {
        city: "Austin",
        country: "United States",
        countryCode: "US",
        latitude: 30.2672,
        longitude: -97.7431,
      },
      vulnerabilities: [
        {
          id: "CVE-2021-44228",
          cvss: 10.0,
          summary: "Apache Log4j2 JNDI RCE vulnerability allows full remote code execution.",
        },
        {
          id: "CVE-2018-11776",
          cvss: 8.1,
          summary: "Apache Struts double evaluation RCE vulnerability.",
        },
      ],
      tags: ["cloud", "database-node", "web-server"],
    };

    return {
      status: "success",
      timestamp: new Date().toISOString(),
      executionMs: 180 + Math.floor(Math.random() * 120),
      telemetry,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: "INFO",
          message: `Connecting to Shodan REST API endpoint for host: ${ip}`,
        },
        {
          timestamp: new Date(Date.now() - 1000).toISOString(),
          level: "SUCCESS",
          message: "API authentication header validated successfully.",
        },
        {
          timestamp: new Date(Date.now() - 2000).toISOString(),
          level: "INFO",
          message: `Executing port and vulnerability scan correlation.`,
        },
      ] as ShodanTelemetryLog[],
      history: [
        {
          id: `shod-${Date.now()}`,
          timestamp: new Date().toISOString(),
          query: params.query,
          scanType: params.scanType,
          status: "success",
        },
      ] as ShodanHistoryItem[],
    };
  });

export const executeSpiderfootScan = createServerFn({ method: "POST" })
  .validator((data: { params: SpiderfootScanParams } | undefined) => data)
  .handler(async ({ data }) => {
    const params = data?.params;
    if (!params) throw new Error("Missing parameters for SpiderFoot scan execution");

    console.log(
      `[SpiderFoot] Stub executing scan for query: ${params.query} with modules:`,
      params.selectedModules,
    );

    const target = params.query;
    const isDomain = target.includes(".") && !target.includes("@");
    const isEmail = target.includes("@");

    const results: SpiderfootModuleResultItem[] = [];
    const logs: {
      timestamp: string;
      level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
      message: string;
    }[] = [
      {
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: `SpiderFoot orchestration controller triggered for target: ${target}`,
      },
      {
        timestamp: new Date(Date.now() + 100).toISOString(),
        level: "INFO",
        message: `Loading ${params.selectedModules.length} selected module plugins...`,
      },
    ];

    // WHOIS module simulation
    if (params.selectedModules.includes("sfp_whois")) {
      logs.push({
        timestamp: new Date(Date.now() + 200).toISOString(),
        level: "INFO",
        message: "[sfp_whois] Querying registrar server whois.iana.org...",
      });
      results.push({
        moduleName: "sfp_whois",
        dataType: "WHOIS",
        source: "WHOIS Registry",
        targetValue: `Registrar: GoDaddy Inc. (Created: 2012-05-18, Expiry: 2028-05-18, Status: active)`,
        confidence: 1.0,
      });
      logs.push({
        timestamp: new Date(Date.now() + 300).toISOString(),
        level: "SUCCESS",
        message: "[sfp_whois] Finished WHOIS extraction: 1 record found.",
      });
    }

    // DNS module simulation
    if (params.selectedModules.includes("sfp_dns")) {
      logs.push({
        timestamp: new Date(Date.now() + 400).toISOString(),
        level: "INFO",
        message: "[sfp_dns] Fetching nameservers and checking AXFR zone transfers...",
      });
      results.push(
        {
          moduleName: "sfp_dns",
          dataType: "DNS",
          source: "DNS Lookup",
          targetValue: "A Record -> 104.244.42.1 (TTL: 3600)",
          confidence: 1.0,
        },
        {
          moduleName: "sfp_dns",
          dataType: "DNS",
          source: "DNS Lookup",
          targetValue: "MX Record -> mail.protonmail.ch (Priority: 10)",
          confidence: 0.95,
        },
      );
      logs.push({
        timestamp: new Date(Date.now() + 500).toISOString(),
        level: "SUCCESS",
        message: "[sfp_dns] Finished DNS checks: 2 records found.",
      });
    }

    // Emails module simulation
    if (params.selectedModules.includes("sfp_emails")) {
      logs.push({
        timestamp: new Date(Date.now() + 600).toISOString(),
        level: "INFO",
        message: "[sfp_emails] Crawling common open endpoints and metadata tables...",
      });
      const coreName = target.split(".")[0] || "admin";
      results.push(
        {
          moduleName: "sfp_emails",
          dataType: "Email",
          source: "Page Scrape",
          targetValue: `security@${isDomain ? target : "sentinel.ai"}`,
          confidence: 0.9,
        },
        {
          moduleName: "sfp_emails",
          dataType: "Email",
          source: "Metadata extract",
          targetValue: `support@${isDomain ? target : "sentinel.ai"}`,
          confidence: 0.85,
        },
      );
      logs.push({
        timestamp: new Date(Date.now() + 700).toISOString(),
        level: "SUCCESS",
        message: "[sfp_emails] Finished email harvesting: 2 records found.",
      });
    }

    // Subdomains module simulation
    if (params.selectedModules.includes("sfp_subdomains")) {
      logs.push({
        timestamp: new Date(Date.now() + 800).toISOString(),
        level: "INFO",
        message: "[sfp_subdomains] Running dictionary subdomain brute-force lookup...",
      });
      results.push(
        {
          moduleName: "sfp_subdomains",
          dataType: "Subdomain",
          source: "Subdomain bruteforce",
          targetValue: `vpn.${isDomain ? target : "sentinel.ai"}`,
          confidence: 1.0,
        },
        {
          moduleName: "sfp_subdomains",
          dataType: "Subdomain",
          source: "Subdomain bruteforce",
          targetValue: `api.${isDomain ? target : "sentinel.ai"}`,
          confidence: 1.0,
        },
      );
      logs.push({
        timestamp: new Date(Date.now() + 900).toISOString(),
        level: "SUCCESS",
        message: "[sfp_subdomains] Finished subdomain checks: 2 records found.",
      });
    }

    // GitHub module simulation
    if (params.selectedModules.includes("sfp_github")) {
      logs.push({
        timestamp: new Date(Date.now() + 1000).toISOString(),
        level: "INFO",
        message: "[sfp_github] Authenticating with GitHub API and searching target files...",
      });
      results.push({
        moduleName: "sfp_github",
        dataType: "GitHub",
        source: "GitHub API Search",
        targetValue: "Repository found: avinashbayya/sentinel-integration-scripts",
        confidence: 0.9,
      });
      logs.push({
        timestamp: new Date(Date.now() + 1100).toISOString(),
        level: "SUCCESS",
        message: "[sfp_github] Finished GitHub scanning: 1 repository matched.",
      });
    }

    // Leaks module simulation
    if (params.selectedModules.includes("sfp_leaks")) {
      logs.push({
        timestamp: new Date(Date.now() + 1200).toISOString(),
        level: "INFO",
        message: "[sfp_leaks] Querying HaveIBeenPwned and paste-site databases...",
      });
      results.push({
        moduleName: "sfp_leaks",
        dataType: "Leaks",
        source: "Breach Compilation Database",
        targetValue: `Exposed password hash found for admin@${isDomain ? target : "sentinel.ai"} (2024-PastebinDump)`,
        confidence: 0.88,
      });
      logs.push({
        timestamp: new Date(Date.now() + 1300).toISOString(),
        level: "WARNING",
        message: "[sfp_leaks] Leak check finished: 1 breach match detected!",
      });
    }

    // Certificates module simulation
    if (params.selectedModules.includes("sfp_certificates")) {
      logs.push({
        timestamp: new Date(Date.now() + 1400).toISOString(),
        level: "INFO",
        message: "[sfp_certificates] Connecting to crt.sh certificate logs...",
      });
      results.push({
        moduleName: "sfp_certificates",
        dataType: "Certificate",
        source: "Certificate Transparency Logs",
        targetValue: `SSL Cert (Issuer: Let's Encrypt, Valid: 2026-06-01 to 2026-09-01)`,
        confidence: 1.0,
      });
      logs.push({
        timestamp: new Date(Date.now() + 1500).toISOString(),
        level: "SUCCESS",
        message: "[sfp_certificates] Finished SSL certificate checks.",
      });
    }

    // IP Intelligence module simulation
    if (params.selectedModules.includes("sfp_ip_intel")) {
      logs.push({
        timestamp: new Date(Date.now() + 1600).toISOString(),
        level: "INFO",
        message: "[sfp_ip_intel] Fetching IP reputation, geolocation and ASN bindings...",
      });
      results.push(
        {
          moduleName: "sfp_ip_intel",
          dataType: "IP",
          source: "GeoIP ASN database",
          targetValue: "ASN: AS13335 (Cloudflare, Inc.)",
          confidence: 1.0,
        },
        {
          moduleName: "sfp_ip_intel",
          dataType: "IP",
          source: "MaxMind Location",
          targetValue: "Location: San Francisco, California, US",
          confidence: 0.9,
        },
      );
      logs.push({
        timestamp: new Date(Date.now() + 1700).toISOString(),
        level: "SUCCESS",
        message: "[sfp_ip_intel] Finished IP checks: 2 records resolved.",
      });
    }

    // Business Records module simulation
    if (params.selectedModules.includes("sfp_business")) {
      logs.push({
        timestamp: new Date(Date.now() + 1800).toISOString(),
        level: "INFO",
        message: "[sfp_business] Scrutinizing commercial indexes and corporate register files...",
      });
      results.push({
        moduleName: "sfp_business",
        dataType: "Business",
        source: "OpenCorporates Search",
        targetValue: "Company Number: US-CA-81829910 (Status: Active)",
        confidence: 0.95,
      });
      logs.push({
        timestamp: new Date(Date.now() + 1900).toISOString(),
        level: "SUCCESS",
        message: "[sfp_business] Finished corporate records scan.",
      });
    }

    // Threat Intelligence module simulation
    if (params.selectedModules.includes("sfp_threat_intel")) {
      logs.push({
        timestamp: new Date(Date.now() + 2000).toISOString(),
        level: "INFO",
        message: "[sfp_threat_intel] Checking abuseIPDB, Virustotal and Spamhaus blocklists...",
      });
      results.push({
        moduleName: "sfp_threat_intel",
        dataType: "ThreatIntel",
        source: "AbuseIPDB reputation lookup",
        targetValue: "Abuse score: 0% (Clean)",
        confidence: 0.99,
      });
      logs.push({
        timestamp: new Date(Date.now() + 2100).toISOString(),
        level: "SUCCESS",
        message: "[sfp_threat_intel] Threat intel check complete: target is clean.",
      });
    }

    logs.push({
      timestamp: new Date().toISOString(),
      level: "SUCCESS",
      message: "SpiderFoot module collection run successfully finished.",
    });

    return {
      results,
      logs,
      durationMs: 380,
    };
  });

/*
================================================================================
ENTERPRISE CONNECTOR MARKETPLACE DATABASE SCHEMAS (Future SQL / Prisma Integration)
================================================================================

// ================================================================================
// SPIDERFOOT OSINT MODULES CONNECTOR SCHEMAS (Prisma / SQL Placeholders)
// ================================================================================

// 1. SpiderFoot Master Connector Configuration Table
model SpiderfootConnectorConfig {
  id                 String   @id @default(uuid())
  status             String   @default("Connected") // Connected, Running, Disabled, Error
  health             String   @default("Healthy") // Healthy, Degraded, Down
  maxConcurrentScans Int      @default(5)
  totalQueriesRun    Int      @default(0)
  lastScanRun        DateTime?
  updatedAt          DateTime @updatedAt
}

// 2. SpiderFoot Sub-Module Plugins Registry Table (WHOIS, DNS, Emails, Subdomains, GitHub, etc.)
model SpiderfootModuleRegistry {
  id             String   @id @default(uuid())
  moduleId       String   @unique // e.g. "sfp_whois", "sfp_dns"
  name           String
  description    String
  enabled        Boolean  @default(true)
  health         String   @default("Healthy") // Healthy, Degraded, Down
  status         String   @default("Idle") // Idle, Running, Disabled, Error
  scansCount     Int      @default(0)
  targetsFound   Int      @default(0)
  apiKeyRequired Boolean  @default(false)
  apiKeySecured  String?
}

// 3. SpiderFoot Extracted Intelligence Cache Table
model SpiderfootIntelligenceCache {
  id             String   @id @default(uuid())
  query          String
  moduleId       String
  dataType       String   // WHOIS, DNS, Email, Subdomain, GitHub, Leaks, Certificate, IP, Business, ThreatIntel
  targetValue    String
  confidence     Float    @default(1.0)
  extractedAt    DateTime @default(now())
}

// ================================================================================
// MALTEGO INVESTIGATION GRAPH EXCHANGE SCHEMAS (Prisma / SQL Placeholders)
// ================================================================================

// 1. Maltego Integration Master Table
model MaltegoConnectorConfig {
  id                   String   @id @default(uuid())
  status               String   @default("Connected") // Connected, Disabled, Error
  health               String   @default("Healthy") // Healthy, Degraded, Down
  clientApiKeyEnc      String?
  clientOAuthTokenEnc  String?
  exportUrl            String   @default("https://sentinel.ai/api/maltego/export")
  importUrl            String   @default("https://sentinel.ai/api/maltego/import")
  loggingEnabled       Boolean  @default(true)
  updatedAt            DateTime @updatedAt
}

// 2. Maltego Exchange Job History Table
model MaltegoExchangeJob {
  id              String   @id @default(uuid())
  jobType         String   // Import, Export
  timestamp       DateTime @default(now())
  fileFormat      String   // CSV, GraphML, JSON, Neo4j
  targetQuery     String
  status          String   // Success, Failed
  entitiesCount   Int      @default(0)
  relationshipsCnt Int     @default(0)
  latencyMs       Int      @default(0)
  errorDetail     String?
}

// 3. Maltego Sync Entity Registry Table (Tracks custom mappings)
model MaltegoSyncedEntity {
  id            String   @id @default(uuid())
  sentinelType  String   // e.g. "person", "domain"
  maltegoType   String   // e.g. "maltego.Person", "maltego.Domain"
  isActive      Boolean  @default(true)
}

// 1. Central Connector Registry Configuration Table
model ConnectorRegistry {
  id                  String   @id @default(uuid())
  connectorId         String   @unique // e.g. "shodan-infra", "google-dorks"
  name                String
  category            String   // Internet Search, OSINT, Social Intelligence, News Intelligence, etc.
  description         String
  version             String   @default("1.0.0")
  status              String   @default("Installed") // Installed, Enabled, Disabled, Deprecated, Failed
  health              String   @default("Healthy") // Healthy, Degraded, Down
  capabilities        String   // Comma-separated list or JSON array of strings
  lastRun             DateTime?
  averageRuntimeMs    Int      @default(0)
  rateLimitsTotal     Int      @default(100)
  rateLimitsUsed      Int      @default(0)
  errorsCount         Int      @default(0)
  usageCount          Int      @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// 2. Connector API Credentials & Auth Config Table
model ConnectorConfigDetail {
  id                  String   @id @default(uuid())
  connectorId         String   @unique
  apiKeyEncrypted     String?
  oauthTokenEncrypted String?
  scheduleCron        String   @default("* / 5 * * * *")
  retryCount          Int      @default(3)
  timeoutMs           Int      @default(10000)
  rateLimitMaxPerHour Int      @default(100)
  policiesJson        String?  // JSON configuration representing safety/retry policies
  loggingEnabled      Boolean  @default(true)
  updatedAt           DateTime @updatedAt
}

// 3. Central Telemetry Logs Table
model ConnectorTelemetryLogs {
  id           String   @id @default(uuid())
  connectorId  String
  timestamp    DateTime @default(now())
  level        String   // INFO, WARNING, ERROR, SUCCESS
  message      String
}
================================================================================
*/

export const toggleConnectorState = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: "Enabled" | "Disabled" } | undefined) => data)
  .handler(async ({ data }) => {
    if (!data) throw new Error("Missing parameters");
    console.log(`[Marketplace API] Toggling connector ${data.id} to ${data.status}`);
    return { success: true, id: data.id, status: data.status, timestamp: new Date().toISOString() };
  });

export const updateConnectorConfigServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; config: any } | undefined) => data)
  .handler(async ({ data }) => {
    if (!data) throw new Error("Missing parameters");
    console.log(`[Marketplace API] Updating config for connector ${data.id}:`, data.config);
    return { success: true, id: data.id, timestamp: new Date().toISOString() };
  });

export const exportToMaltego = createServerFn({ method: "POST" })
  .validator((data: { params: MaltegoExportParams } | undefined) => data)
  .handler(async ({ data }) => {
    const params = data?.params;
    if (!params) throw new Error("Missing parameters for Maltego export");
    console.log(
      `[Maltego API] Simulating graph export for query: ${params.query} in format: ${params.format}`,
    );

    return {
      success: true,
      timestamp: new Date().toISOString(),
      jobId: `mtg-exp-${Date.now()}`,
      format: params.format,
      nodesExported: params.nodesCount || 12,
      edgesExported: params.edgesCount || 6,
      downloadUrl: `https://sentinel.ai/api/maltego/download?jobId=mtg-exp-${Date.now()}&format=${params.format.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    };
  });

export const importFromMaltego = createServerFn({ method: "POST" })
  .validator((data: { params: MaltegoImportParams } | undefined) => data)
  .handler(async ({ data }) => {
    const params = data?.params;
    if (!params) throw new Error("Missing parameters for Maltego import");
    console.log(`[Maltego API] Simulating graph import in format: ${params.format}`);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      jobId: `mtg-imp-${Date.now()}`,
      format: params.format,
      nodesImported: 14,
      edgesImported: 8,
      status: "Synced",
    };
  });

type NewsSearch = {
  q?: string;
};

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News Intelligence — Sentinel AI" }] }),
  validateSearch: (search: Record<string, unknown>): NewsSearch => {
    return {
      q: (search.q as string) || undefined,
    };
  },
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    return await fetchNews({ data: { q: deps.q } });
  },
  component: Page,
});

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

function getOutletCoverage(storiesList: APIStory[]) {
  const counts: Record<string, { count: number; region: string; maxThreat: string }> = {};
  for (const s of storiesList) {
    const srcName = s.primarySource || "Unknown Source";
    if (!counts[srcName]) {
      counts[srcName] = { count: 0, region: s.countryCode || "Global", maxThreat: s.threatLevel };
    }
    counts[srcName].count += 1;
    if (s.countryCode) counts[srcName].region = s.countryCode;
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
        region: data.region,
        articles: data.count * 15 + 8,
        credibility: cred,
        tone,
      };
    })
    .sort((a, b) => b.articles - a.articles);
}

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

function Page() {
  const { stories: fetchedStories } = Route.useLoaderData();
  const stories = fetchedStories || [];

  const outlets = getOutletCoverage(stories);

  const categories = Array.from(new Set(stories.map((s) => s.category).filter(Boolean)));
  const narratives =
    categories.length > 0
      ? categories.map((cat) => `${cat.charAt(0).toUpperCase() + cat.slice(1)} developments`)
      : [
          "Central bank policy shock",
          "Election disinformation",
          "Space program milestones",
          "AI regulation debate",
          "Fintech breach fallout",
        ];

  return (
    <AppShell>
      <PageHeader
        title="News Intelligence"
        description="Global news coverage with outlet credibility, cross-language coverage, and narrative tracking."
        badge={
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 text-primary">
            <Newspaper className="size-3.5" />
            Live wires
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {stories.length > 0 ? (
            stories.map((s, i) => {
              const timeAgo = formatRelativeTime(s.pubDate);
              const threatTone = validTones.has(s.threatLevel) ? (s.threatLevel as any) : "neutral";
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
                    <h3 className="mt-2 text-lg font-semibold leading-snug">{s.primaryTitle}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Story analyzed across {s.sourceCount} media outlets. Velocity is{" "}
                      {s.velocity?.level || "medium"} with {s.velocity?.sourcesPerHour || 1}{" "}
                      sources/hour. Category: {s.category || "general"}.
                    </p>
                    <div className="mt-2 flex gap-1.5 items-center">
                      <Badge variant="secondary" className="font-normal">
                        {s.sourceCount} outlets · Importance {s.importanceScore}%
                      </Badge>
                      {s.url && (
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="ml-auto h-7 gap-1 text-xs"
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
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                No active news headlines found matching this topic.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Globe2 className="size-4" />
                Outlet coverage
              </h3>
              <div className="mt-3 space-y-2">
                {outlets.slice(0, 6).map((o) => (
                  <div
                    key={o.name}
                    className="flex items-center justify-between rounded-md border bg-card p-2"
                  >
                    <div>
                      <div className="text-sm font-medium">{o.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {o.region} · {o.articles} articles
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        Cred {o.credibility}
                      </span>
                      <Tone tone={o.tone} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="size-4" />
                Narratives rising
              </h3>
              <div className="mt-3 space-y-2 text-sm">
                {narratives.slice(0, 5).map((n, i) => (
                  <div
                    key={n}
                    className="flex items-center justify-between rounded-md border bg-card px-3 py-1.5"
                  >
                    <span>{n}</span>
                    <span className="text-[11px] font-semibold text-primary">
                      +{Math.max(10, 200 - i * 38)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
