/**
 * Production-critical integrations for the risk-map visualization.
 * noSandbox=true means the 17-compatible connector could only be validated live.
 */

export interface Integration {
  key: string;
  name: string;
  category: "Order Intake" | "Shipping" | "Finance" | "Tax" | "Payments" | "Banking";
  breaks: string; // "If this broke: ..."
  noSandbox: boolean;
}

export const INTEGRATIONS: Integration[] = [
  {
    key: "shopify",
    name: "Shopify",
    category: "Order Intake",
    breaks: "Order intake halts — no new customer orders reach the floor.",
    noSandbox: true,
  },
  {
    key: "shipstation",
    name: "ShipStation",
    category: "Shipping",
    breaks: "Shipping freezes — nothing ships to customers.",
    noSandbox: true,
  },
  {
    key: "avalara",
    name: "Avalara",
    category: "Tax",
    breaks: "Tax calc breaks — invoices go out wrong or not at all.",
    noSandbox: false,
  },
  {
    key: "ramp",
    name: "Ramp",
    category: "Finance",
    breaks:
      "Corporate card spend can't sync to GL — finance loses visibility into day-to-day spend.",
    noSandbox: true,
  },
  {
    key: "stripe",
    name: "Stripe",
    category: "Payments",
    breaks: "Payment links dead — customers can't pay invoices.",
    noSandbox: false,
  },
  {
    key: "nacha",
    name: "NACHA Banking",
    category: "Banking",
    breaks: "Vendor ACH payments fail — supply-chain AP breaks.",
    noSandbox: false,
  },
];
