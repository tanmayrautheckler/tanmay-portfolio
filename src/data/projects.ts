export type ProjectCategory = "Manufacturing" | "Finance" | "Integrations" | "AI & Automation" | "Data & Dashboards" | "Operations" | "Academic";

export interface CaseStudySection {
  type: "narrative" | "mockup" | "mockup-pair" | "flow" | "metrics" | "quote" | "image" | "image-pair" | "image-grid" | "mermaid" | "code";
  /** Section heading */
  title?: string;
  /** Body text (narrative, quote) */
  body?: string;
  /** Mockup component key(s) from project-mockups registry */
  mockup?: string;
  mockupLeft?: string;
  mockupRight?: string;
  /** Caption below mockup */
  caption?: string;
  captionLeft?: string;
  captionRight?: string;
  /** Image path(s) for screenshot sections */
  image?: string;
  imageLeft?: string;
  imageRight?: string;
  /** Multiple images for grid */
  images?: { src: string; caption?: string }[];
  /** Mermaid chart definition string */
  mermaid?: string;
  /** Code snippet */
  code?: string;
  /** Code language */
  language?: string;
  /** Metrics data */
  metrics?: { label: string; value: string; sub?: string }[];
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  description: string;
  tech: string[];
  featured: boolean;
  problem: string;
  role: string;
  solution: string;
  impact: string[];
  date: string;
  /** Rich case study sections for featured projects */
  caseStudy?: CaseStudySection[];
}

export const projects: Project[] = [
  // ═══ FEATURED ═══
  {
    slug: "vendor-management-portal",
    title: "AEI Vendor Management Portal",
    category: "AI & Automation",
    description: "Full-stack portal replacing an 8,400-row spreadsheet for managing vendor relationships, POs, products, pricing, deliveries, and returns.",
    tech: ["Next.js 16", "TypeScript", "Tailwind CSS", "shadcn/ui", "Odoo 19", "XML-RPC", "TanStack Query"],
    featured: true,
    problem: "Heckler Design managed their entire AEI vendor relationship through a single 8,441-row spreadsheet with 50+ columns tracking SKU mappings, multi-year pricing, kanban quantities, PO history, delivery status, production holds, and returns.",
    role: "Designed the entire system architecture and built it using AI-assisted development. Created dual interfaces: an admin dashboard for Heckler staff and a collaborative portal for AEI with restricted access.",
    solution: "Built a Next.js application with Odoo 19 as the sole data store via XML-RPC. Admin gets full CRUD across 8 modules (dashboard, products, orders, pricing, deliveries, returns, holds, analytics). Vendor portal provides read-only access with limited update capabilities. Live data: 398 products, 3,292+ POs, 3,583 pickings.",
    impact: ["Eliminated spreadsheet dependency for vendor management", "Real-time PO and delivery tracking", "Multi-step return wizard with automated workflows", "Inline SKU editing with access control"],
    date: "2026",
    caseStudy: [
      {
        type: "narrative",
        title: "The Spreadsheet That Ran the Business",
        body: "Every week, Heckler Design's ops team opened the same spreadsheet — 8,441 rows, 50+ columns. SKU mappings, multi-year pricing tiers, kanban quantities, PO history, delivery tracking, production holds, returns. One file held the entire AEI vendor relationship. If it broke, the relationship broke with it.",
      },
      {
        type: "mockup",
        title: "The Admin Dashboard",
        mockup: "aei-dashboard",
        caption: "Real-time operational dashboard replacing the spreadsheet's summary tab — PO volume, delivery health, recent activity all in one view.",
      },
      {
        type: "narrative",
        title: "Dual-Interface Architecture",
        body: "The system needed two faces: an admin dashboard giving Heckler staff full CRUD across 8 modules, and a restricted vendor portal where AEI could view their products, track POs, and respond to returns — without touching anything they shouldn't. Both interfaces pull from the same Odoo 19 backend via XML-RPC, but with completely different permission models.",
      },
      {
        type: "mockup-pair",
        title: "Admin vs. Vendor Views",
        mockupLeft: "aei-products",
        mockupRight: "aei-vendor-portal",
        captionLeft: "Admin: full product table with inline editing, SKU mapping, status management",
        captionRight: "Vendor: read-only portal with order tracking and limited action capabilities",
      },
      {
        type: "mockup",
        title: "Multi-Step Return Wizard",
        mockup: "aei-return-wizard",
        caption: "4-step wizard flow: Select PO → Choose defective items → Set reasons & quantities → Review and submit. Each step validates before proceeding.",
      },
      {
        type: "mermaid",
        title: "System Architecture",
        mermaid: `graph TB
    subgraph Client["Next.js 16 App"]
        Admin["Admin Dashboard (8 modules)"]
        Portal["Vendor Portal (5 modules)"]
        API["API Routes (8 endpoints)"]
    end
    subgraph Integration["Integration Layer"]
        OdooLib["lib/odoo.ts — executeKw wrapper"]
        Cache["TanStack Query Cache"]
    end
    subgraph Odoo["Odoo 19 (Sole Data Store)"]
        PO["purchase.order"]
        Prod["product.product"]
        Pick["stock.picking"]
        SI["product.supplierinfo"]
        Partner["res.partner (id: 474)"]
    end
    Admin --> API
    Portal --> API
    Admin --> Cache
    Portal --> Cache
    API --> OdooLib
    OdooLib -->|XML-RPC| PO
    OdooLib -->|XML-RPC| Prod
    OdooLib -->|XML-RPC| Pick
    OdooLib -->|XML-RPC| SI
    PO --> Partner
    Prod --> SI`,
        caption: "Single integration point: every API route calls lib/odoo.ts which wraps XML-RPC with Promise-based auth caching. Odoo 19 is the sole data store — no local database.",
      },
      {
        type: "mermaid",
        title: "Return Wizard — Data Flow",
        mermaid: `sequenceDiagram
    participant U as Admin User
    participant UI as Return Wizard
    participant API as /api/odoo/returns
    participant Lib as lib/odoo.ts
    participant Odoo as Odoo 19

    U->>UI: Click Create Return
    UI->>API: GET /orders?partner_id=474
    API->>Lib: searchRead("purchase.order", domain)
    Lib->>Odoo: XML-RPC execute_kw
    Odoo-->>Lib: PO list with lines
    Lib-->>API: JSON response
    API-->>UI: PO data
    U->>UI: Select PO, pick items, set reasons
    UI->>API: POST /returns (body: lines, reasons, qtys)
    API->>Lib: create("vendor.return", values)
    Lib->>Odoo: XML-RPC execute_kw
    Odoo-->>Lib: return_id
    Lib-->>API: {id: 42}
    API-->>UI: Success
    UI->>U: Return #42 created`,
        caption: "Each wizard step fetches live data from Odoo. The final POST creates a vendor.return record with linked lines — no intermediate state stored client-side.",
      },
      {
        type: "code",
        title: "The Integration Layer",
        language: "typescript",
        code: `// lib/odoo.ts — single point of Odoo communication
const xmlrpc = require('xmlrpc');

let cachedUid: number | null = null;

async function getUid(): Promise<number> {
  if (cachedUid) return cachedUid;
  const client = xmlrpc.createSecureClient(
    \`\${ODOO_URL}/xmlrpc/2/common\`
  );
  cachedUid = await call(client, 'authenticate',
    [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]
  );
  return cachedUid!;
}

export async function searchRead(
  model: string,
  domain: any[],
  fields: string[],
  opts?: { limit?: number; offset?: number; order?: string }
) {
  const uid = await getUid();
  return executeKw(model, 'search_read',
    [domain], { fields, ...opts }
  );
}`,
        caption: "Every API route calls through this single abstraction. UID is cached after first authentication. All Odoo models accessed via the same executeKw pattern.",
      },
      {
        type: "metrics",
        title: "By the Numbers",
        metrics: [
          { label: "Products Managed", value: "398", sub: "live SKU mappings" },
          { label: "Purchase Orders", value: "3,292+", sub: "tracked in real-time" },
          { label: "Pickings", value: "3,583", sub: "delivery records" },
          { label: "API Endpoints", value: "8", sub: "orders, products, pickings, returns, supplierinfo, version" },
        ],
      },
    ],
  },
  {
    slug: "qc-vendor-rma",
    title: "QC + Vendor RMA Module",
    category: "Manufacturing",
    description: "Native Odoo 19 module for quality control inspections and vendor return merchandise authorization with full portal access.",
    tech: ["Python", "Odoo 19", "XML", "QWeb", "PostgreSQL"],
    featured: true,
    problem: "Manufacturing defects discovered during assembly had no structured workflow. QC issues were tracked informally, vendor communication was via email chains, and credit notes were manually created.",
    role: "Designed the complete business process and built the module using AI-assisted development. Created models, views, portal controllers, email templates, and automated processing logic.",
    solution: "Built a native Odoo module with mail.thread and portal.mixin. RMA flows from defect discovery through 6 possible dispositions. Auto-generates draft credit notes, scrap records, and return shipments on confirmation. Vendor portal lets suppliers view photos, set dispositions, and track status.",
    impact: ["Structured QC workflow replacing informal tracking", "Vendor self-service portal for disposition decisions", "Auto-generated credit notes (draft until accountant confirms)", "Full traceability: PO → RMA → Credit Note → Scrap"],
    date: "2026",
    caseStudy: [
      {
        type: "narrative",
        title: "When Defects Had No Workflow",
        body: "A machinist finds a cracked weld on a vendor part mid-assembly. What happens next? Before this module: an email, maybe a photo in Slack, a mental note to ask about credit. No tracking, no traceability, no accountability. The vendor.rma model with mail.thread and portal.mixin replaced all of that with a structured 6-state workflow.",
      },
      {
        type: "image",
        title: "The RMA Form View",
        image: "/tanmay-portfolio/screenshots/01_form_view.png",
        caption: "Native Odoo form with smart buttons (PO, Returns, Scrapped, Credit Notes), status bar, defect lines with severity badges, and full chatter integration.",
      },
      {
        type: "image-pair",
        title: "List & Kanban Views",
        imageLeft: "/tanmay-portfolio/screenshots/02_list_view.png",
        imageRight: "/tanmay-portfolio/screenshots/03_kanban_view.png",
        captionLeft: "List view with color-coded states, totals, and user avatars",
        captionRight: "Kanban grouped by state — draft through done",
      },
      {
        type: "flow",
        title: "6-State Machine",
        mockup: "rma-flow",
        caption: "Draft → Sent (email triggers) → Vendor Responded (dispositions set via portal) → Confirmed (auto-generates credit notes, scrap records, return pickings) → Done. Side branch to Awaiting Parts when replacement is needed.",
      },
      {
        type: "mermaid",
        title: "Complete RMA Process Flow",
        mermaid: `flowchart TD
    A[PO + Receipt] --> B[Manufacturing Finds Defect]
    B --> C[QC Creates RMA - Links PO + Photos]
    C --> D{Decision}
    D -- Internal --> E[Scrap/Touch-Up - CLOSED]
    D -- Vendor --> F[Send to Vendor - Email + Portal Link]
    F --> G[Vendor Sets Disposition on Portal]
    G --> H[Confirm and Process]
    H --> I[Auto: Draft Credit Note + Scrap + Return Shipment]
    I --> J{Awaiting Parts?}
    J -- No --> K[CLOSED]
    J -- Yes --> L[AWAITING PARTS]
    L --> M[Parts Received - CLOSED]`,
        caption: "End-to-end flow from the FLOW_DIAGRAM.md in the repo. Each step maps to a state transition in the vendor.rma model.",
      },
      {
        type: "mermaid",
        title: "Vendor Portal Interaction",
        mermaid: `sequenceDiagram
    participant QC as Heckler QC
    participant Odoo as Odoo
    participant Email as Email
    participant Portal as Vendor Portal
    participant AEI as AEI Vendor

    QC->>Odoo: Create RMA + attach photos
    QC->>Odoo: Click Send to Vendor
    Odoo->>Email: Send RMA notification
    Email->>AEI: Email with portal link
    AEI->>Portal: Click link, sees RMA
    Portal->>AEI: Shows photos, defects, severity
    AEI->>Portal: Sets disposition per line
    AEI->>Portal: Adds scheduled return date
    Portal->>Odoo: Dispositions saved
    Odoo->>QC: Notification: vendor responded`,
        caption: "The vendor portal flow — from email notification to disposition submission. Portal write access is restricted to 3 fields (disposition, disposition_note, date_scheduled_return) and only when state = 'sent'.",
      },
      {
        type: "mermaid",
        title: "Credit Note Sub-Flow",
        mermaid: `sequenceDiagram
    participant QC as QC Person
    participant Odoo as Odoo RMA
    participant Vendor as AEI Vendor
    participant Acct as Accountant

    QC->>Odoo: Confirm and Process RMA
    Odoo->>Odoo: Auto-create DRAFT credit note
    Odoo->>Vendor: Email: dispositions confirmed
    Vendor->>Acct: Sends credit memo PDF via email
    Acct->>Odoo: Reviews credit note vs vendor PDF
    Acct->>Odoo: Confirms credit note to POSTED`,
        caption: "Credit notes stay DRAFT until the accountant verifies against the vendor's credit memo PDF. This prevents posting incorrect amounts.",
      },
      {
        type: "mockup",
        title: "15 Defect Types + 6 Dispositions",
        mockup: "rma-defect-types",
        caption: "Real defect categories from manufacturing: structural welding, powder coat issues, PEM problems, dimensional errors. Each with severity (minor/major/critical) and fault allocation (vendor/shared/heckler).",
      },
      {
        type: "mockup",
        title: "6 Disposition Paths",
        mockup: "rma-dispositions",
        caption: "On confirmation, the system auto-generates the right documents based on disposition: draft credit notes, scrap records, return pickings, or replacement receipts. Credit notes stay draft until the accountant confirms against the vendor's PDF.",
      },
      {
        type: "image-pair",
        title: "Internal vs. Vendor Portal",
        imageLeft: "/tanmay-portfolio/screenshots/04_vendor_portal.png",
        imageRight: "/tanmay-portfolio/screenshots/05_portal_rma_list.png",
        captionLeft: "Vendor portal detail: defect photos, disposition selector, notes — vendors can only write 3 fields and only when state is 'sent'",
        captionRight: "Portal list view with filter tabs (Action Needed, Open, Closed) and status badges",
      },
      {
        type: "metrics",
        title: "Module Scope",
        metrics: [
          { label: "Defect Types", value: "15", sub: "structural, powder coat, PEM, dimensional, etc." },
          { label: "Dispositions", value: "6", sub: "with fault % and cost allocation" },
          { label: "Auto-Generated", value: "4", sub: "credit notes, scrap, return pickings, replacement receipts" },
          { label: "Python + XML", value: "2,200+", sub: "lines of production code" },
        ],
      },
    ],
  },
  {
    slug: "ai-erp-connector",
    title: "AI-to-ERP Connector (MCP)",
    category: "AI & Automation",
    description: "Model Context Protocol server connecting Claude AI directly to Odoo ERP for real-time operational querying and analytics.",
    tech: ["Python", "MCP Protocol", "XML-RPC", "Cloudflare Tunnel", "Claude AI"],
    featured: true,
    problem: "Operational data lived inside Odoo, accessible only through the web interface. Getting answers to business questions required manual navigation, exports, and analysis.",
    role: "Built and deployed the MCP server, configured the Cloudflare Tunnel, and integrated it as the primary interface for real-time ERP querying.",
    solution: "Created an MCP server that connects Claude AI directly to Odoo via XML-RPC. Supports search, read, create, update, aggregate, and model introspection across all Odoo models.",
    impact: ["Real-time manufacturing analytics from natural language queries", "BOM cost analysis without manual exports", "Deployed org-wide via Cowork as primary interface", "Reduced time-to-answer from hours to seconds"],
    date: "2025–2026",
    caseStudy: [
      {
        type: "narrative",
        title: "Trapped Behind a Login Screen",
        body: "Every answer lived inside Odoo — inventory levels, BOM costs, production throughput, vendor lead times. But getting those answers meant logging in, navigating to the right model, setting up filters, exporting to CSV, and analyzing in a spreadsheet. A simple question like 'what's our most expensive BOM?' could take 20 minutes. What if you could just ask?",
      },
      {
        type: "mockup",
        title: "Natural Language → Real Data",
        mockup: "mcp-chat",
        caption: "Claude queries Odoo in real-time through the MCP server. No exports, no filters, no spreadsheets — just ask a question and get a structured answer with live data.",
      },
      {
        type: "mockup",
        title: "System Architecture",
        mockup: "mcp-architecture",
        caption: "Three components: Claude AI speaks MCP protocol to a Python server, which tunnels through Cloudflare to reach the on-premise Odoo instance via XML-RPC.",
      },
      {
        type: "mockup",
        title: "Under the Hood",
        mockup: "mcp-terminal",
        caption: "The MCP server running in production — handling search, aggregation, and model introspection requests in real-time.",
      },
      {
        type: "mermaid",
        title: "MCP Protocol Flow",
        mermaid: `graph LR
    subgraph User["User Environment"]
        Claude["Claude AI"]
    end
    subgraph MCP["MCP Server (Python)"]
        FastMCP["FastMCP Framework"]
        Auth["_get_uid() — cached auth"]
        Exec["_execute_kw() — unified RPC"]
    end
    subgraph Network["Network Layer"]
        Tunnel["Cloudflare Tunnel"]
    end
    subgraph ERP["On-Premise Odoo 19"]
        Common["/xmlrpc/2/common"]
        Object["/xmlrpc/2/object"]
        Models["All Odoo Models"]
    end
    Claude -->|"MCP Protocol (stdio)"| FastMCP
    FastMCP --> Auth
    FastMCP --> Exec
    Auth -->|authenticate| Tunnel
    Exec -->|execute_kw| Tunnel
    Tunnel --> Common
    Tunnel --> Object
    Object --> Models`,
        caption: "Claude speaks MCP protocol over stdio to the Python server. All Odoo operations route through a single _execute_kw() abstraction. Cloudflare Tunnel bridges the gap to the on-premise instance.",
      },
      {
        type: "mermaid",
        title: "Example Query: BOM Cost Analysis",
        mermaid: `sequenceDiagram
    participant U as User
    participant C as Claude AI
    participant MCP as MCP Server
    participant Odoo as Odoo 19

    U->>C: What's our most expensive BOM?
    C->>MCP: Tool: search_records("mrp.bom", [], ["product_tmpl_id","product_qty"])
    MCP->>Odoo: execute_kw("mrp.bom", "search_read", ...)
    Odoo-->>MCP: 47 BOMs with product references
    MCP-->>C: JSON array of BOMs
    C->>MCP: Tool: aggregate_records("mrp.bom.line", group_by: "bom_id")
    MCP->>Odoo: execute_kw("mrp.bom.line", "read_group", ...)
    Odoo-->>MCP: Grouped component costs
    MCP-->>C: Cost aggregations per BOM
    C->>U: The SIT-Stand Frame BOM costs $142.37 per unit across 23 components`,
        caption: "A natural language question triggers multiple MCP tool calls. Claude chains search_records and aggregate_records to compute the answer — no manual exports needed.",
      },
      {
        type: "code",
        title: "Tool Implementation Pattern",
        language: "python",
        code: `@mcp.tool()
async def search_records(
    model: str,
    domain: str = "[]",
    fields: str = "[]",
    limit: int = 80,
    offset: int = 0,
    order: str = ""
) -> str:
    """Search and read records from any Odoo model."""
    uid = _get_uid()
    parsed_domain = json.loads(domain)
    parsed_fields = json.loads(fields)

    result = _execute_kw(
        model, 'search_read',
        [parsed_domain],
        {'fields': parsed_fields, 'limit': limit,
         'offset': offset, 'order': order}
    )
    return json.dumps(result, default=str)

@mcp.tool()
async def aggregate_records(
    model: str,
    domain: str = "[]",
    group_by: str = "[]",
    fields: str = "[]"
) -> str:
    """Aggregate records using Odoo's read_group."""
    uid = _get_uid()
    result = _execute_kw(
        model, 'read_group',
        [json.loads(domain)],
        {'fields': json.loads(fields),
         'groupby': json.loads(group_by)}
    )
    return json.dumps(result, default=str)`,
        caption: "Every tool follows the same pattern: parse JSON parameters, call _execute_kw(), serialize response. The aggregate_records tool exposes Odoo's read_group for analytics — the key to answering 'most expensive BOM' type questions.",
      },
      {
        type: "narrative",
        title: "From Tool to Interface",
        body: "What started as a developer utility became the primary way the entire organization queries their ERP. Deployed via Anthropic's Cowork platform, every team member — from the warehouse floor to accounting — can ask operational questions in plain English and get answers backed by live production data. The 12 tools cover the full CRUD spectrum plus model introspection and aggregation — enough for Claude to answer virtually any operational question.",
      },
      {
        type: "metrics",
        title: "Impact",
        metrics: [
          { label: "Time to Answer", value: "~5s", sub: "down from 20+ minutes" },
          { label: "MCP Tools", value: "12", sub: "search, read, create, update, aggregate, introspect, and more" },
          { label: "Deployment", value: "Org-wide", sub: "via Anthropic Cowork" },
          { label: "Models Accessible", value: "500+", sub: "every Odoo model queryable via natural language" },
        ],
      },
    ],
  },

  // ═══ PROFESSIONAL ═══
  {
    slug: "csku-cut-parts",
    title: "C-SKU Cut Parts Program",
    category: "Manufacturing",
    description: "Complete ERP implementation for transitioning corrugated packaging and felt cutting production in-house with 35+ component SKUs.",
    tech: ["Odoo 17", "Multi-level BOMs", "Machine Routings", "Cost Analysis"],
    featured: false,
    problem: "Packaging was outsourced, adding cost and lead time. No ERP structure existed for in-house packaging production.",
    role: "Designed the complete Odoo implementation — all BOMs, routings, reorder rules, and cost structures.",
    solution: "Structured 35+ component SKUs with multi-level BOMs, machine routings for xEdge, C64, and Kongsberg machines, yield tracking, reorder rules, and per-part cost analysis.",
    impact: ["In-house packaging production fully ERP-managed", "35+ component SKUs with multi-level BOMs", "Per-part cost visibility across 3 machine types", "Automated reorder rules for raw materials"],
    date: "2024"
  },
  {
    slug: "odoo-accounting",
    title: "Odoo Accounting Implementation",
    category: "Finance",
    description: "Implemented Odoo Accounting as the company's entire financial system from scratch — AP, inventory valuation, manufacturing cost accounting.",
    tech: ["Odoo 17", "PostgreSQL", "Dashboard Ninja", "AVCO Costing"],
    featured: false,
    problem: "The company had no real financial system in ERP. Operational tracking was spreadsheet-based with no cost traceability.",
    role: "Configured everything myself — AP, inventory valuation, manufacturing cost accounting, bank reconciliation, GL mapping, invoicing, and credit notes.",
    solution: "Built the complete accounting stack in Odoo: three-way matching, scrap tracking, suspense account management, and GL mapping for all transaction types.",
    impact: ["Company's first real financial system in ERP", "Full cost traceability from floor to financial statements", "Accountants escalate to me, not the other way around"],
    date: "2023–2024"
  },
  {
    slug: "manufacturing-cost-accounting",
    title: "Manufacturing Cost Accounting",
    category: "Finance",
    description: "Connected production costs to financial statements — labor, materials, overhead — for full per-unit cost visibility.",
    tech: ["Odoo 17", "AVCO Costing", "Work Order Integration", "GL Mapping"],
    featured: false,
    problem: "No visibility into true per-unit manufacturing costs. Labor, material, and overhead were tracked separately.",
    role: "Configured the entire integration myself, learning multiple accounting concepts in the process.",
    solution: "Integrated work order cost components directly with Odoo Accounting. Enabled per-unit cost visibility through AVCO costing method.",
    impact: ["First time the company could see true per-unit costs", "Improved budgeting accuracy", "Cost traceability from production floor to P&L"],
    date: "2024"
  },
  {
    slug: "framework-configurator",
    title: "Framework Product Configurator",
    category: "Integrations",
    description: "ERP backend for a website product configurator — Shopify orders automatically trigger correct manufacturing orders.",
    tech: ["Odoo 17", "Shopify Connector", "Variant BOMs", "Manufacturing Routes"],
    featured: false,
    problem: "Configured product orders from the website needed to flow through manufacturing with the right materials and costs.",
    role: "Configured all native Odoo pieces. Developer built the custom connector code to my specifications.",
    solution: "Created variant-based product structures so configured orders from Shopify trigger the right MO with correct materials and costs.",
    impact: ["Automated MO generation from website orders", "Correct material allocation per variant", "Accurate cost calculation for configured products"],
    date: "2024"
  },
  {
    slug: "stripe-integration",
    title: "Stripe Payment Integration",
    category: "Integrations",
    description: "Stripe payment gateway for customer invoicing with portal access, pro forma workflows, and fee optimization.",
    tech: ["Odoo 17", "Stripe API", "Portal", "Payment Gateway"],
    featured: false,
    problem: "No online payment option for customer invoices. Payment collection was manual and slow.",
    role: "Defined all business requirements — portal access, invoice email links, pro forma pre-payment workflow, payment expiry rules, fee-based amount limits. Managed developer through delivery.",
    solution: "Implemented Stripe with business logic: portal payments, pro forma invoices, 15-day expiry, and fee-optimized amount limits.",
    impact: ["Customers can pay invoices online", "Reduced payment collection time", "Pro forma pre-payment workflow"],
    date: "2024"
  },
  {
    slug: "sql-kpi-dashboards",
    title: "SQL KPI Dashboards",
    category: "Data & Dashboards",
    description: "Custom SQL dashboards providing real-time operational visibility into cycle time, rework, yield, backlog, and throughput.",
    tech: ["Dashboard Ninja", "PostgreSQL", "Custom SQL", "Odoo 17"],
    featured: false,
    problem: "Leadership had no real-time visibility into manufacturing operations.",
    role: "Built all dashboards myself. Trained the operations manager to self-configure additional ones.",
    solution: "Designed KPI dashboards covering cycle time, utilization, yield, rework rate, backlog, throughput, and labor productivity.",
    impact: ["Real-time operational visibility for the first time", "Operations manager can self-configure dashboards", "Data-driven decision making across production"],
    date: "2024"
  },
  {
    slug: "barcode-sku-audit",
    title: "Barcode/SKU Audit Skill",
    category: "AI & Automation",
    description: "AI-powered cross-system validation tool auditing barcodes and SKUs across Shopify, Odoo, and printed labels.",
    tech: ["Claude AI", "Custom Skill", "Shopify API", "Odoo API"],
    featured: false,
    problem: "Barcode mismatches between systems were only discovered at shipping time.",
    role: "Built the skill and distributed it org-wide.",
    solution: "Cross-references barcodes/SKUs across Shopify label exports, printed label PDFs, and Odoo product variant exports.",
    impact: ["Catches mismatches before shipping", "Validates across 3 systems simultaneously", "Distributed org-wide via Cowork"],
    date: "2025"
  },
  {
    slug: "3d-printer-planning",
    title: "3D Printer Capacity Planner",
    category: "Manufacturing",
    description: "Odoo 19 module with zero-hardcoding architecture: daily occupancy tracking, BOM traversal for 3D-printed components, what-if impact analysis, and an OWL 2 dashboard — all configuration-driven.",
    tech: ["Odoo 19", "Python", "OWL 2", "REST API", "PostgreSQL", "Service Layer"],
    featured: false,
    problem: "30+ 3D printers running with no centralized capacity planning. Planners couldn't answer 'can we deliver by this date?' without manually checking every printer's schedule.",
    role: "Designed the full architecture — configuration-driven service layer, REST API, OWL 2 dashboard, and MO integration. Built using Claude Code.",
    solution: "Built a capacity planning module with zero hardcoded parameters. OccupancyService computes daily load from work orders on tracked workcenters. ImpactAnalyzer simulates scheduling what-ifs. DependencyService recursively walks BOMs to find 3D-printed components at any depth. REST API exposes all operations. OWL 2 dashboard shows timeline with live updates.",
    impact: ["Configuration-driven: 30 printers × 8 hrs × 70% efficiency = 168 hrs/day", "Automatic earliest-feasible-date suggestions", "What-if analysis before scheduling any MO", "REST API with 10+ endpoints for external integration"],
    date: "2026",
    caseStudy: [
      {
        type: "narrative",
        title: "Can We Deliver by Friday?",
        body: "That was the question nobody could answer quickly. With 30 printers running different jobs at different speeds, the only way to check capacity was to walk the floor or scroll through Odoo's manufacturing calendar. The module answers it in one click: check current occupancy, simulate adding the new MO, and get a feasible/at-risk/over-capacity verdict with suggested alternatives.",
      },
      {
        type: "mockup",
        title: "Occupancy Dashboard",
        mockup: "printer-dashboard",
        caption: "OWL 2 dashboard showing daily occupancy across 30 printers. Bars colored by status threshold (configurable): green < 85%, amber 85-100%, red > 100%. Formula: (booked hours / capacity) × 100.",
      },
      {
        type: "mockup",
        title: "MO Capacity Check",
        mockup: "printer-capacity-check",
        caption: "Integrated widget on the Manufacturing Order form. One click shows current vs. projected occupancy, risk assessment, and alternative dates if the target is at-risk.",
      },
      {
        type: "mermaid",
        title: "System Architecture",
        mermaid: `graph TB
    subgraph Frontend
        Dashboard["OccupancyDashboard (OWL 2)"]
        Checker["CapacityChecker (MO Form Widget)"]
    end
    subgraph REST_API[REST API Layer]
        ConfigAPI["config endpoint"]
        OccAPI["occupancy endpoint"]
        PlanAPI["planning endpoint"]
    end
    subgraph Services[Service Layer - Zero Hardcoding]
        OccSvc[OccupancyService]
        DepSvc[DependencyService]
        Impact[ImpactAnalyzer]
    end
    subgraph Models[Odoo Models]
        Config["printer.capacity.config (Singleton)"]
        Occ["printer.occupancy (Daily Records)"]
        MRP["mrp.production (Extended)"]
    end
    Dashboard --> OccAPI
    Checker --> PlanAPI
    ConfigAPI --> OccSvc
    OccAPI --> OccSvc
    PlanAPI --> OccSvc
    PlanAPI --> DepSvc
    OccSvc --> Config
    OccSvc --> Occ
    DepSvc --> MRP
    Impact --> OccSvc`,
        caption: "Three-layer architecture: OWL 2 frontend → REST API → stateless service layer → Odoo models. Every parameter comes from the singleton config record.",
      },
      {
        type: "mermaid",
        title: "Can We Deliver? — Data Flow",
        mermaid: `sequenceDiagram
    participant T as Thomas (Planner)
    participant UI as OWL Dashboard
    participant API as REST API
    participant Svc as OccupancyService
    participant Cfg as printer.capacity.config
    participant WO as mrp.workorder

    T->>UI: Clicks Check Capacity on MO
    UI->>API: POST /api/v1/planning/check/12345
    API->>Svc: can_schedule_order(mo, date)
    Svc->>Cfg: get_config()
    Cfg-->>Svc: 30 printers, 70% efficiency
    Svc->>WO: SUM duration WHERE workcenter IN tracked
    WO-->>Svc: booked_hours = 145.2
    Svc->>Svc: + MO hours 12.5 = 93.9%
    Svc->>Cfg: get_status_definition(93.9)
    Cfg-->>Svc: at_risk / amber
    Svc-->>API: can_schedule, at_risk, 93.9%
    API-->>UI: JSON response
    UI-->>T: At Risk 93.9% - Suggests Apr 17, 18`,
        caption: "Single request traces through the full stack: API → OccupancyService → config lookup → work order aggregation → status threshold check → suggested alternatives.",
      },
      {
        type: "metrics",
        title: "Architecture",
        metrics: [
          { label: "Service Classes", value: "3", sub: "OccupancyService, DependencyService, ImpactAnalyzer" },
          { label: "API Endpoints", value: "10+", sub: "config, occupancy, planning, workcenters" },
          { label: "Zero Hardcoding", value: "100%", sub: "every parameter from database config" },
          { label: "BOM Depth", value: "∞", sub: "recursive traversal with cycle detection" },
        ],
      },
    ],
  },
  {
    slug: "attendance-gate",
    title: "Attendance Gate & Time Clock",
    category: "Operations",
    description: "Full-screen Odoo overlay that blocks hourly employees from working until clocked in, with automatic timesheet creation and break handling.",
    tech: ["Odoo 17", "OWL 2", "JavaScript", "SCSS", "QWeb"],
    featured: false,
    problem: "Workers could start work orders without being clocked in to the Attendance app, causing inaccurate timesheets. Constant app switching between Manufacturing, Attendance, and Timesheets.",
    role: "Designed the complete UX flow (5-state machine), built the OWL component, server controller, and interactive HTML prototype for stakeholder approval.",
    solution: "A systray OWL component that renders on every Odoo backend page. Single RPC endpoint returns full state in one call. On clock-in, workers select an activity from project tasks. Bottom control panel shows live timer, activity switching, and break handling. Salaried employees bypass entirely via configurable tags.",
    impact: ["Every page gated — works in Manufacturing, Sales, Inventory, everywhere", "Single RPC round-trip instead of 4-5 separate ORM calls", "Automatic timesheet entries — no manual timekeeping", "Configurable: project, tags, poll interval all via Settings"],
    date: "2026",
    caseStudy: [
      {
        type: "narrative",
        title: "The Problem With Voluntary Clock-Ins",
        body: "Odoo's native attendance module is optional — workers can start manufacturing orders, move inventory, and log time without ever clocking in. The result: phantom hours, missing timesheets, and no way to know who's actually on the floor. The gate makes clocking in mandatory by intercepting every page load.",
      },
      {
        type: "image-pair",
        title: "Gate → Activity Picker",
        imageLeft: "/tanmay-portfolio/screenshots/01-clocked-out.png",
        imageRight: "/tanmay-portfolio/screenshots/02-pick-activity.png",
        captionLeft: "Dark overlay blocks all content. Worker must clock in before accessing any Odoo module.",
        captionRight: "After clock-in, dynamic activity picker shows tasks from the configured project.",
      },
      {
        type: "image-pair",
        title: "Working → Break",
        imageLeft: "/tanmay-portfolio/screenshots/03-working.png",
        imageRight: "/tanmay-portfolio/screenshots/04-on-break.png",
        captionLeft: "Non-blocking bottom panel: live timer (HH:MM:SS), activity name, Switch Activity dropdown, Break and Clock Out buttons.",
        captionRight: "Amber overlay during break with break timer and hours worked display. Polls are skipped until worker taps End Break.",
      },
      {
        type: "mockup-pair",
        title: "How It Works",
        mockupLeft: "attendance-gate",
        mockupRight: "attendance-working",
        captionLeft: "Gate state: full-screen overlay with blurred content behind",
        captionRight: "Working state: bottom panel only, full Odoo access above",
      },
      {
        type: "mermaid",
        title: "Gate Logic — Single RPC Decision Tree",
        mermaid: `flowchart TD
    A[Page Load / Poll every N seconds] --> B[Single RPC: /heckler_attendance_gate/state]
    B --> C{gate_applies?}
    C -->|false: salaried or no employee| Z[No overlay - normal Odoo]
    C -->|true| D{clocked_in?}
    D -->|false| E[BLOCKED - Clock In Required overlay]
    D -->|true| F{timesheet active?}
    F -->|true| G[WORKING - Bottom panel with timer]
    F -->|false| H[PICK ACTIVITY - Activity selection overlay]`,
        caption: "Every page load triggers one RPC call that returns the full state. The OWL component renders the appropriate overlay based on the response — no multi-call chains.",
      },
      {
        type: "mermaid",
        title: "Clock In → Activity → Timesheet Flow",
        mermaid: `sequenceDiagram
    participant W as Worker (iPad)
    participant OWL as OWL Component
    participant CTRL as /heckler_attendance_gate/state
    participant ATT as hr.attendance
    participant TS as account.analytic.line

    W->>OWL: Opens any Odoo page
    OWL->>CTRL: GET gate state (single call)
    CTRL-->>OWL: gate_applies: true, clocked_in: false
    OWL->>W: Show Clock In Required overlay
    W->>OWL: Clicks Clock In
    OWL->>ATT: attendance_manual([emp_id])
    ATT-->>OWL: OK
    OWL->>CTRL: GET gate state
    CTRL-->>OWL: clocked_in: true, timesheet.active: false
    OWL->>W: Show Activity Picker
    W->>OWL: Selects Manufacturing/Assembly
    OWL->>TS: create(project_id, task_id, unit_amount: 0)
    TS-->>OWL: timesheet_id
    OWL->>W: Show Working Panel + unblock content`,
        caption: "Full data flow from gate → clock in → activity selection → timesheet creation. Every interaction is tracked: attendance record + timesheet entry + project task.",
      },
      {
        type: "metrics",
        title: "Design Decisions",
        metrics: [
          { label: "States", value: "5", sub: "loading, clocked_out, picking, working, on_break" },
          { label: "RPC Calls", value: "1", sub: "single endpoint returns full state" },
          { label: "Configurable", value: "4", sub: "project, hourly tag, salaried tag, poll interval" },
          { label: "z-index", value: "1050+", sub: "above Odoo navbar (1030) and modals (1040)" },
        ],
      },
    ],
  },
  {
    slug: "trip-command",
    title: "TripCommand — Travel Ops Platform",
    category: "Integrations",
    description: "B2B SaaS platform coordinating travel agencies, DMCs, drivers, and hotels on a single interface with event-driven cascade automation.",
    tech: ["Next.js 16", "React 19", "CSS (Custom)", "REST API", "In-Memory Store"],
    featured: false,
    problem: "Travel operations coordination happened over WhatsApp and email. Flight delays caused a cascade of manual phone calls to drivers, agencies, and hotels.",
    role: "Designed and built the full application — role-based dashboards, cascade automation engine, driver mobile app, and agency portal.",
    solution: "Three role-based interfaces: DMC admin hub with real-time fleet monitoring, agency portal for booking management, and mobile-first driver app. Flight delay cascade system automatically adjusts bookings, notifies drivers via WhatsApp, and alerts agencies via SMS.",
    impact: ["Automated flight delay cascades across all stakeholders", "3 role-based dashboards (admin, agency, driver)", "18 API endpoints with service layer architecture", "Mobile-first driver interface with live trip tracking"],
    date: "2025",
    caseStudy: [
      {
        type: "narrative",
        title: "When a Flight is Delayed, Everything Breaks",
        body: "A flight from Istanbul lands 2.5 hours late. The driver is waiting at the wrong time. The hotel check-in window has passed. The agency doesn't know. Before TripCommand, someone had to make 6 phone calls in 15 minutes. The cascade system does it in 2 seconds: detect delay → adjust bookings → notify driver (WhatsApp) → alert agency (SMS) → log everything.",
      },
      {
        type: "mockup",
        title: "DMC Operations Hub",
        mockup: "trip-dashboard",
        caption: "Admin dashboard with active trip monitoring, booking management, fleet status, and real-time cascade alerts. 5-second polling for live updates.",
      },
      {
        type: "mockup",
        title: "Driver Mobile App",
        mockup: "trip-driver",
        caption: "Mobile-first interface: current trip with ETA, next booking alerts, daily stats. Online/offline toggle, GPS tracking (simulated), trip history.",
      },
      {
        type: "mermaid",
        title: "Cascade Architecture",
        mermaid: `graph TB
    subgraph Detection["Event Detection"]
        Flight["Flight API Poll (5s)"]
        Manual["Manual Trigger"]
    end
    subgraph Engine["Cascade Engine"]
        Detect["FlightService.checkDelays()"]
        Cascade["CascadeProcessor"]
        Rules["Cascade Rules"]
    end
    subgraph Actions["Automated Actions"]
        Booking["Adjust Bookings"]
        Driver["Notify Driver (WhatsApp)"]
        Agency["Alert Agency (SMS)"]
        Hotel["Update Hotel ETA"]
        Log["Audit Log Entry"]
    end
    subgraph Roles["Role Dashboards"]
        Admin["DMC Admin Hub"]
        AgencyUI["Agency Portal"]
        DriverUI["Driver Mobile App"]
    end
    Flight --> Detect
    Manual --> Detect
    Detect -->|delay detected| Cascade
    Cascade --> Rules
    Rules --> Booking
    Rules --> Driver
    Rules --> Agency
    Rules --> Hotel
    Rules --> Log
    Booking --> Admin
    Booking --> AgencyUI
    Driver --> DriverUI
    Log --> Admin`,
        caption: "Flight delay detection triggers the cascade engine, which applies rules to automatically adjust bookings and notify all affected stakeholders in parallel — driver via WhatsApp, agency via SMS, hotel via API.",
      },
      {
        type: "mermaid",
        title: "Flight Delay → Full Cascade",
        mermaid: `sequenceDiagram
    participant API as Flight API
    participant FS as FlightService
    participant CP as CascadeProcessor
    participant BS as BookingService
    participant NS as NotificationService
    participant D as Driver (WhatsApp)
    participant A as Agency (SMS)

    API->>FS: Flight TK1234 delayed +2.5hrs
    FS->>CP: triggerCascade(flight, delay)
    CP->>BS: getAffectedBookings(flight)
    BS-->>CP: 3 bookings affected
    par Parallel Notifications
        CP->>BS: adjustPickupTimes(+2.5hrs)
        CP->>NS: notifyDriver(driver_id, new_time)
        NS->>D: WhatsApp: Pickup moved to 14:30
        CP->>NS: notifyAgency(agency_id, delay_info)
        NS->>A: SMS: Flight TK1234 delayed
        CP->>BS: updateHotelETA(booking, new_eta)
    end
    CP-->>FS: cascade_complete, 5 actions taken`,
        caption: "A single flight delay triggers parallel notifications to all stakeholders. The cascade processor coordinates BookingService and NotificationService to execute all adjustments in ~2 seconds.",
      },
      {
        type: "metrics",
        title: "Platform Scope",
        metrics: [
          { label: "Roles", value: "3", sub: "admin, agency, driver" },
          { label: "API Endpoints", value: "18", sub: "bookings, drivers, flights, notifications, docs, subscriptions" },
          { label: "Service Classes", value: "7", sub: "booking, driver, flight, notification, document, dashboard, subscription" },
          { label: "Cascade Time", value: "~2s", sub: "detect → adjust → notify all stakeholders" },
        ],
      },
    ],
  },
  {
    slug: "odoo-upgrade-16-17",
    title: "Odoo 16 → 17 Upgrade",
    category: "Operations",
    description: "Led full ERP version upgrade with zero operational disruption — testing, training, and post-go-live support across all departments.",
    tech: ["Odoo 16", "Odoo 17", "Change Management", "UAT"],
    featured: false,
    problem: "Running on Odoo 16 with accumulating technical debt. Needed to upgrade without disrupting operations.",
    role: "Led everything — coordinated with offshore team, end-to-end testing, UAT, department meetings, training, post-upgrade resolution.",
    solution: "Managed the full upgrade lifecycle: pre-upgrade audit, module compatibility testing, data migration, staged rollout, and monitoring.",
    impact: ["Minimal operational disruption", "All modules tested end-to-end", "Hands-on training to all departments", "Resulted in significant raise ($91K → $105K + bonus)"],
    date: "2023–2024"
  },
  {
    slug: "rma-workflow",
    title: "RMA Workflow System",
    category: "Operations",
    description: "Return merchandise authorization for website, distributor, and dealer returns with automated inventory adjustments and credit notes.",
    tech: ["Odoo 17", "Inventory", "Accounting", "Multi-channel"],
    featured: false,
    problem: "Returns from multiple channels (website, distributors, dealers) had no unified workflow.",
    role: "Designed and configured the entire workflow myself.",
    solution: "Built RMA workflows handling returns across all sales channels with automated inventory adjustments and credit note generation.",
    impact: ["Unified return handling across all channels", "Automated inventory adjustments", "Automated credit note generation"],
    date: "2024"
  },
  {
    slug: "barcode-label-system",
    title: "Barcode & Label Printing System",
    category: "Operations",
    description: "ERP-integrated barcode scanning with data cleansing and label printing via auto-cut machine from manufacturing orders.",
    tech: ["Odoo 17", "Barcode Scanner", "Auto-Cut Machine", "Data Cleansing"],
    featured: false,
    problem: "Pre-printed labels caused waste and barcode data was inconsistent across systems.",
    role: "Configured the barcode system, led data cleansing, and implemented label printing integration.",
    solution: "Implemented barcode scanning with clean data, connected to auto-cut label printer triggered from manufacturing orders.",
    impact: ["Eliminated pre-printed label waste", "Clean barcode data across systems", "Labels generated on-demand from MOs"],
    date: "2024"
  },

  // ═══ ACADEMIC — Masters at ASU ═══
  {
    slug: "spc-quality-analysis",
    title: "Statistical Process Control Analysis",
    category: "Academic",
    description: "Applied SPC methods to manufacturing process data — control charts, capability analysis, and defect reduction strategies.",
    tech: ["JMP", "SPC", "Control Charts", "Cp/Cpk Analysis", "DOE"],
    featured: false,
    problem: "Manufacturing processes needed quantitative quality assessment to identify out-of-control conditions and reduce variability.",
    role: "Designed experiments, collected data, built control charts, and performed capability analysis as part of MS coursework at ASU.",
    solution: "Applied X-bar/R charts, p-charts, and process capability indices to identify assignable causes. Used DOE to optimize process parameters.",
    impact: ["Demonstrated measurable process improvement", "Applied to real manufacturing scenarios", "Foundation for Lean Six Sigma certification"],
    date: "2023 (ASU)"
  },
  {
    slug: "operations-optimization",
    title: "Operations Management Simulation",
    category: "Academic",
    description: "Optimized production scheduling, inventory management, and supply chain logistics using simulation and modeling techniques.",
    tech: ["Operations Research", "Linear Programming", "Simulation", "Excel Solver"],
    featured: false,
    problem: "Complex multi-constraint production scheduling problems requiring optimal resource allocation.",
    role: "Built optimization models and simulations as part of Operations Management coursework at ASU.",
    solution: "Developed linear programming models for production scheduling, used simulation for inventory policy optimization, and applied queuing theory to service operations.",
    impact: ["Practical optimization skills applied to manufacturing", "Directly applicable to Odoo MRP configuration", "Strong foundation for ERP demand planning"],
    date: "2023 (ASU)"
  },

  // ═══ ACADEMIC — Bachelors at Manipal ═══
  {
    slug: "aerodynamics-cfd",
    title: "Aerodynamic CFD Analysis",
    category: "Academic",
    description: "Computational fluid dynamics analysis of airfoil designs using ANSYS Fluent — drag reduction and lift optimization studies.",
    tech: ["ANSYS Fluent", "CFD", "CATIA", "MATLAB", "Aerodynamics"],
    featured: false,
    problem: "Analyzing and optimizing airfoil performance for aeronautical applications.",
    role: "Designed and ran CFD simulations as part of B.Tech Aeronautical Engineering capstone at Manipal.",
    solution: "Modeled airfoil geometries in CATIA, meshed in ANSYS, and ran turbulence simulations to analyze pressure distribution, lift coefficients, and drag characteristics across different angles of attack.",
    impact: ["Developed CAD and simulation proficiency", "Applied fluid mechanics theory to practical design", "Foundation for engineering problem-solving approach"],
    date: "2019 (Manipal)"
  },
  {
    slug: "supply-chain-project",
    title: "Supply Chain Network Optimization",
    category: "Academic",
    description: "Designed and optimized a multi-tier supply chain network — facility location, transportation routing, and inventory positioning.",
    tech: ["Supply Chain Modeling", "Excel", "Network Optimization", "Logistics"],
    featured: false,
    problem: "Optimizing a supply chain network with multiple suppliers, warehouses, and distribution centers to minimize total cost.",
    role: "Led team project as part of Supply Chain Management coursework at Manipal.",
    solution: "Built a network optimization model considering facility costs, transportation, and demand patterns. Analyzed trade-offs between centralized vs. distributed inventory strategies.",
    impact: ["End-to-end supply chain thinking", "Directly relevant to Odoo procurement configuration", "Foundation for understanding vendor lead times and reorder strategies"],
    date: "2018 (Manipal)"
  },
];

export const categories: ProjectCategory[] = [
  "Manufacturing",
  "Finance",
  "Integrations",
  "AI & Automation",
  "Data & Dashboards",
  "Operations",
  "Academic",
];
