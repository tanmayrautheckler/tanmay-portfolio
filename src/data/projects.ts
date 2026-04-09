export type ProjectCategory = "Manufacturing" | "Finance" | "Integrations" | "AI & Automation" | "Data & Dashboards" | "Operations" | "Academic";

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
    date: "2026"
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
    date: "2026"
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
    date: "2025–2026"
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
    title: "3D Printer Production Planning",
    category: "Manufacturing",
    description: "ERP-integrated production planning framework for 30+ 3D printers balancing capacity, labor, and material flow.",
    tech: ["Odoo 19", "Python", "Capacity Planning", "Custom Module"],
    featured: false,
    problem: "30+ printers running with no centralized capacity planning.",
    role: "Designed the planning framework. Custom module prototyped using Claude Code.",
    solution: "Built a capacity planning module balancing machine capacity, labor availability, and material flow for 30+ printers.",
    impact: ["Centralized capacity planning for 30+ printers", "Balanced machine, labor, and material constraints", "Custom Odoo 19 module ready for deployment"],
    date: "2026"
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
