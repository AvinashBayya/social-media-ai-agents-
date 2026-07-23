// Enterprise Connector Architecture & Manager Subsystem

export type ConnectorCategory =
  | "Internet Search"
  | "OSINT"
  | "Social Intelligence"
  | "News Intelligence"
  | "Infrastructure Intelligence"
  | "Document Intelligence"
  | "Media Intelligence"
  | "Investigation Connectors";

export type ConnectorState =
  | "Installed"
  | "Not Installed"
  | "Enabled"
  | "Disabled"
  | "Running"
  | "Waiting"
  | "Updating"
  | "Failed"
  | "Deprecated";

export interface ConnectorLog {
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  message: string;
}

export interface ConnectorConfig {
  apiKey: string;
  oauthToken: string;
  schedule: string; // Cron schedule or interval
  retryCount: number;
  timeout: number; // in milliseconds
  rateLimitMax: number; // max per hour
  loggingEnabled: boolean;
}

export interface ConnectorMetadata {
  id: string;
  name: string;
  category: ConnectorCategory;
  description: string;
  version: string;
  status: ConnectorState;
  health: "Healthy" | "Degraded" | "Down";
  capabilities: string[];
  lastRun: string | null;
  averageRuntimeMs: number;
  rateLimits: { total: number; used: number; remaining: number };
  errorsCount: number;
  usageCount: number;
  config: ConnectorConfig;
  logs: ConnectorLog[];
}

// Every connector MUST implement this contract
export interface Connector {
  metadata: ConnectorMetadata;
  initialize(): Promise<void>;
  authenticate(): Promise<boolean>;
  healthCheck(): Promise<{ status: "Healthy" | "Degraded" | "Down"; latencyMs: number }>;
  collect(query: string): Promise<any>;
  normalize(raw: any): Promise<any>;
  cleanup(): Promise<void>;
  disconnect(): Promise<void>;
}

// Connector Manager class responsible for Loading, Lifecycle, Config, and Monitoring
export class ConnectorManager {
  private static instance: ConnectorManager;
  private registry: Map<string, Connector> = new Map();

  private constructor() {
    this.initializeDefaultRegistry();
  }

  public static getInstance(): ConnectorManager {
    if (!ConnectorManager.instance) {
      ConnectorManager.instance = new ConnectorManager();
    }
    return ConnectorManager.instance;
  }

  // Registers a new connector dynamically
  public register(connector: Connector): void {
    if (this.registry.has(connector.metadata.id)) {
      console.warn(
        `Connector with ID ${connector.metadata.id} is already registered. Overwriting.`,
      );
    }
    this.registry.set(connector.metadata.id, connector);
    connector.metadata.logs.push({
      timestamp: new Date().toISOString(),
      level: "SUCCESS",
      message: `Connector ${connector.metadata.name} successfully registered in Connector Registry.`,
    });
  }

  // Fetches a connector by ID
  public get(id: string): Connector | undefined {
    return this.registry.get(id);
  }

  // Returns all registered connectors
  public list(): Connector[] {
    return Array.from(this.registry.values());
  }

  // Dynamic lifecycle triggers
  public async enableConnector(id: string): Promise<void> {
    const conn = this.get(id);
    if (!conn) throw new Error("Connector not found");
    conn.metadata.status = "Enabled";
    conn.metadata.logs.push({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: `Lifecycle command: CONNECTOR_ENABLE triggered.`,
    });
    await conn.initialize();
  }

  public async disableConnector(id: string): Promise<void> {
    const conn = this.get(id);
    if (!conn) throw new Error("Connector not found");
    conn.metadata.status = "Disabled";
    conn.metadata.logs.push({
      timestamp: new Date().toISOString(),
      level: "WARNING",
      message: `Lifecycle command: CONNECTOR_DISABLE triggered. Releasing socket bounds.`,
    });
    await conn.disconnect();
  }

  public updateConnectorConfig(id: string, config: Partial<ConnectorConfig>): void {
    const conn = this.get(id);
    if (!conn) throw new Error("Connector not found");
    conn.metadata.config = { ...conn.metadata.config, ...config };
    conn.metadata.logs.push({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: `Config update applied: ${Object.keys(config).join(", ")} changed.`,
    });
  }

  // Bootstraps default connectors representing Sentinel AI's existing services
  private initializeDefaultRegistry(): void {
    // 1. Google News RSS Connector
    this.register(
      new MockAdapter({
        id: "google-rss-news",
        name: "Google News RSS Aggregator",
        category: "News Intelligence",
        description: "Aggregates global live RSS feeds for intelligence tracking.",
        version: "1.2.0",
        status: "Enabled",
        health: "Healthy",
        capabilities: ["rss-parsing", "feed-correlative-search"],
        averageRuntimeMs: 180,
        rateLimits: { total: 500, used: 42, remaining: 458 },
      }),
    );

    // 2. Google Dorks Connector
    this.register(
      new MockAdapter({
        id: "google-dorks",
        name: "Google Dorks OSINT Connector",
        category: "Internet Search",
        description:
          "Generates and queries advanced operators (site:, filetype:, intitle:) to detect exposed files.",
        version: "1.0.0",
        status: "Enabled",
        health: "Healthy",
        capabilities: ["operator-compilation", "filetype-matching", "caching"],
        averageRuntimeMs: 240,
        rateLimits: { total: 100, used: 25, remaining: 75 },
      }),
    );

    // 3. Shodan Infrastructure Scanner
    this.register(
      new MockAdapter({
        id: "shodan-infra",
        name: "Shodan Scanner",
        category: "Infrastructure Intelligence",
        description:
          "Queries Shodan database nodes for exposed ports, SSL states, and CVE associations.",
        version: "2.1.4",
        status: "Enabled",
        health: "Healthy",
        capabilities: ["port-scanning", "ssl-certificate-analysis", "cve-lookup"],
        averageRuntimeMs: 280,
        rateLimits: { total: 10000, used: 142, remaining: 9858 },
      }),
    );

    // 4. WHOIS & RDAP Domain Registry
    this.register(
      new MockAdapter({
        id: "whois-rdap",
        name: "WHOIS & RDAP Registry lookup",
        category: "OSINT",
        description:
          "Fetches domain registrar, expiration timeline, status flags, and registry contact entities.",
        version: "1.1.0",
        status: "Enabled",
        health: "Healthy",
        capabilities: ["rdap-parsing", "whois-contact-scraping"],
        averageRuntimeMs: 120,
        rateLimits: { total: 1000, used: 82, remaining: 918 },
      }),
    );

    // 5. Wikidata Corporate Analyzer
    this.register(
      new MockAdapter({
        id: "wikidata-corp",
        name: "Wikidata Corporate Indexer",
        category: "OSINT",
        description:
          "Extracts corporate registries, parent orgs, official site URLs, and social profile links.",
        version: "1.0.2",
        status: "Enabled",
        health: "Healthy",
        capabilities: ["claims-correlation", "social-handle-resolution"],
        averageRuntimeMs: 150,
        rateLimits: { total: 2000, used: 64, remaining: 1936 },
      }),
    );

    // 6. Social Mentions Analyzer
    this.register(
      new MockAdapter({
        id: "social-mentions",
        name: "Social Profiles & Mentions Ingester",
        category: "Social Intelligence",
        description:
          "Monitors and scans X/Twitter and LinkedIn profiles matching target companies.",
        version: "1.4.1",
        status: "Enabled",
        health: "Healthy",
        capabilities: ["profile-monitoring", "sentiment-correlation"],
        averageRuntimeMs: 310,
        rateLimits: { total: 500, used: 12, remaining: 488 },
      }),
    );

    // 7. Live Stream Feeds
    this.register(
      new MockAdapter({
        id: "live-streams",
        name: "Live Intelligence streams",
        category: "Media Intelligence",
        description: "Aggregates real-time news updates and raw Telegram alerts.",
        version: "1.5.0",
        status: "Enabled",
        health: "Healthy",
        capabilities: ["stream-pooling", "live-sentinel-alerts"],
        averageRuntimeMs: 95,
        rateLimits: { total: 20000, used: 450, remaining: 19550 },
      }),
    );
  }
}

// Standardized Adapter wrapper that implements the Connector interface
class MockAdapter implements Connector {
  public metadata: ConnectorMetadata;

  constructor(opts: Partial<ConnectorMetadata>) {
    this.metadata = {
      id: opts.id || "mock-conn",
      name: opts.name || "Mock Connector",
      category: opts.category || "OSINT",
      description: opts.description || "Simulated connector plugin.",
      version: opts.version || "1.0.0",
      status: opts.status || "Installed",
      health: opts.health || "Healthy",
      capabilities: opts.capabilities || [],
      lastRun: new Date().toISOString(),
      averageRuntimeMs: opts.averageRuntimeMs || 150,
      rateLimits: opts.rateLimits || { total: 100, used: 0, remaining: 100 },
      errorsCount: 0,
      usageCount: opts.rateLimits?.used || 0,
      config: {
        apiKey: "MOCK_SECRET_KEY_XXXXXXXX",
        oauthToken: "",
        schedule: "*/5 * * * *",
        retryCount: 3,
        timeout: 10000,
        rateLimitMax: opts.rateLimits?.total || 100,
        loggingEnabled: true,
      },
      logs: [
        { timestamp: new Date().toISOString(), level: "INFO", message: `Plugin initialized.` },
      ],
    };
  }

  public async initialize(): Promise<void> {
    this.metadata.logs.push({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: `Initialising connections...`,
    });
  }

  public async authenticate(): Promise<boolean> {
    this.metadata.logs.push({
      timestamp: new Date().toISOString(),
      level: "SUCCESS",
      message: `Credentials authenticated successfully.`,
    });
    return true;
  }

  public async healthCheck(): Promise<{
    status: "Healthy" | "Degraded" | "Down";
    latencyMs: number;
  }> {
    return { status: "Healthy", latencyMs: 85 };
  }

  public async collect(query: string): Promise<any> {
    this.metadata.usageCount++;
    this.metadata.rateLimits.used++;
    this.metadata.rateLimits.remaining--;
    this.metadata.lastRun = new Date().toISOString();
    return { data: `Simulated collect result for: ${query}` };
  }

  public async normalize(raw: any): Promise<any> {
    return { data: raw.data };
  }

  public async cleanup(): Promise<void> {
    this.metadata.logs.push({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: `Performing garbage cleanup.`,
    });
  }

  public async disconnect(): Promise<void> {
    this.metadata.logs.push({
      timestamp: new Date().toISOString(),
      level: "WARNING",
      message: `Releasing active socket connections.`,
    });
  }
}
