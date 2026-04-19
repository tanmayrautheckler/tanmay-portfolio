/**
 * Scope numbers for the Odoo 16→17 case study.
 *
 * Values reflect the environment at cutover time (Oct 2024). Live Odoo MCP
 * counts are noted in parentheses as of the most recent fetch — use those to
 * refresh this file if the scope has drifted materially.
 *
 * Fetched: 2026-04-17 via odoo19 MCP.
 */

export interface ScopeStat {
  key: string;
  value: number;
  suffix?: string;
  label: string;
  tooltip: string;
  formatted?: string; // Optional pre-formatted display (e.g. "~300K")
}

export const SCOPE: ScopeStat[] = [
  {
    key: "skus",
    value: 4762,
    label: "Sellable SKUs",
    tooltip:
      "4,762 active product variants across 3,311 templates: finished goods, components, and raw materials. Live count today: 4,811 — within 1% of cutover-time scope.",
  },
  {
    key: "boms",
    value: 1221,
    label: "Bills of Materials",
    tooltip:
      "1,221 BOMs with 1,742 routed operations. Every manufactured SKU maps to a BOM that had to survive the schema migration intact.",
  },
  {
    key: "workcenters",
    value: 47,
    label: "Work Centers",
    tooltip:
      "47 production work centers across welding, machining, finishing, and assembly. Each routing step references a work center ID that migrates with the BOM.",
  },
  {
    key: "users",
    value: 34,
    label: "Internal Users",
    tooltip:
      "34 internal users across 8 departments (sales, production, procurement, operations, accounting, finance, IT, exec). Every user's access rights had to be re-validated post-migration.",
  },
  {
    key: "integrations",
    value: 6,
    label: "Production Integrations",
    tooltip:
      "Shopify (order intake), ShipStation (shipping), Avalara (tax), Ramp (corporate cards), Stripe (payment links), NACHA (vendor ACH). Three had no sandbox — live was the only test.",
  },
  {
    key: "journal",
    value: 300000,
    formatted: "~300K",
    label: "Journal Entries",
    tooltip:
      "~300,000 lifetime accounting journal entries to migrate without double-posting or breaking GL balance. Live count today: 285,934.",
  },
];

/** Secondary numbers surfaced in situation prose / tooltips (not primary grid cells) */
export const SECONDARY_SCOPE = {
  productTemplates: 3311,
  routedOperations: 1742,
  departments: 8,
  salesOrders: 35000, // ~35K
  manufacturingOrders: 53000, // ~53K
  purchaseOrders: 8000, // ~8K
} as const;
