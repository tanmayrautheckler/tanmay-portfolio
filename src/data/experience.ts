export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  highlights: string[];
  type: "manufacturing" | "erp";
}

export const experiences: Experience[] = [
  {
    title: "ERP Systems Engineer II",
    company: "Heckler Design Inc",
    location: "Phoenix, AZ",
    period: "Apr 2024 - Present",
    description: "Sole owner of Odoo ERP across 8+ departments, managing system architecture for 500+ active SKUs.",
    highlights: [
      "Lead enterprise-wide ERP strategy and governance across Manufacturing, Procurement, Sales, Finance, Quality, Inventory, CRM, and Shipping",
      "Integrated manufacturing cost accounting with Odoo Accounting — full cost traceability from production floor to financial statements",
      "Designed and deployed custom SQL analytics dashboards for real-time operational visibility",
      "Built AI-to-ERP connector (MCP protocol) for real-time manufacturing analytics",
      "Manage cross-platform integrations: Shopify, ShipStation, Stripe, Slack, Avalara",
      "Designed C-SKU cut parts program: 35+ components with multi-level BOMs and machine routings"
    ],
    type: "erp"
  },
  {
    title: "ERP Systems Engineer",
    company: "Heckler Design Inc",
    location: "Phoenix, AZ",
    period: "Oct 2023 - Mar 2024",
    description: "Led Odoo ERP upgrade and launched core financial and manufacturing modules.",
    highlights: [
      "Led full Odoo 16 to 17 upgrade — end-to-end testing, UAT, department training, post-go-live support",
      "Launched MRP module with automated reordering and procurement automation",
      "Implemented Odoo Accounting as the company's financial system from scratch",
      "Configured Python/XML automations in Odoo Studio for work order generation"
    ],
    type: "erp"
  },
  {
    title: "Manufacturing Engineer",
    company: "United Foods",
    location: "Phoenix, AZ",
    period: "Jul 2023 - Oct 2023",
    description: "Led continuous improvement projects targeting labor efficiency and line balancing.",
    highlights: [
      "Improved hourly output through time studies and standardized work instructions",
      "Optimized preventive maintenance scheduling to reduce equipment downtime",
      "Implemented line balancing for production efficiency"
    ],
    type: "manufacturing"
  },
  {
    title: "Production Supervisor — Industrial Fabrication",
    company: "Vats and Vessels Ltd",
    location: "Mumbai, India",
    period: "Jan 2020 - Dec 2022",
    description: "Managed pressure vessel fabrication for 30+ personnel under ASME Section VIII and ISO 9001.",
    highlights: [
      "Managed welding, machining, and inspection for pressure vessel fabrication",
      "Applied Lean tools (5S, Kaizen), improving first-pass yield and efficiency",
      "Developed BOMs, routing sheets, and operator logs",
      "Zero reportable safety incidents across 12+ months"
    ],
    type: "manufacturing"
  }
];
