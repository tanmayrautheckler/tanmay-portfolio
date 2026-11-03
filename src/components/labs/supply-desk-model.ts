export type SupplyStatus = "new" | "building" | "ready" | "shipped";
export type SupplyLine = { id: string; name: string; quantity: number; first: number; date: string; laterDate: string };
export type SupplyOrder = { id: string; label: string; requested: string; status: SupplyStatus; reference: string; lines: SupplyLine[]; received: number; tracking?: string };

// Entirely invented records. No imported vendor, customer, product or pricing data.
export const SUPPLY_ORDERS: SupplyOrder[] = [
  { id: "DEMO-104", label: "Confirm the plan", requested: "2026-11-18", status: "new", reference: "", received: 0, lines: [
    { id: "frame", name: "Frame kit", quantity: 36, first: 24, date: "2026-11-12", laterDate: "2026-11-17" },
    { id: "tray", name: "Cable tray", quantity: 24, first: 24, date: "2026-11-12", laterDate: "2026-11-17" },
  ] },
  { id: "DEMO-105", label: "Ready for dispatch", requested: "2026-11-16", status: "ready", reference: "SAMPLE-52", received: 0, lines: [
    { id: "shelf", name: "Shelf kit", quantity: 18, first: 18, date: "2026-11-11", laterDate: "2026-11-11" },
  ] },
  { id: "DEMO-106", label: "Some arrived. Some to come.", requested: "2026-11-20", status: "building", reference: "SAMPLE-53", received: 12, lines: [
    { id: "rail", name: "Rail set", quantity: 30, first: 12, date: "2026-11-09", laterDate: "2026-11-19" },
  ] },
  { id: "DEMO-107", label: "Two batches planned", requested: "2026-11-24", status: "building", reference: "SAMPLE-55", received: 0, lines: [{ id: "cover", name: "Cover set", quantity: 48, first: 32, date: "2026-11-14", laterDate: "2026-11-22" }] },
  { id: "DEMO-108", label: "Receipt complete", requested: "2026-11-10", status: "shipped", reference: "SAMPLE-56", tracking: "DEMO-TRACK-08", received: 12, lines: [{ id: "kit", name: "Service kit", quantity: 12, first: 12, date: "2026-11-08", laterDate: "2026-11-08" }] },
  { id: "DEMO-109", label: "Ready for dispatch", requested: "2026-11-28", status: "ready", reference: "SAMPLE-57", received: 0, lines: [{ id: "support", name: "Support set", quantity: 24, first: 24, date: "2026-11-16", laterDate: "2026-11-16" }] },
];
export const supplyTotal = (order: SupplyOrder) => order.lines.reduce((sum, line) => sum + line.quantity, 0);
export const validSchedule = (lines: SupplyLine[]) => lines.every(line => Number.isInteger(line.first) && line.first > 0 && line.first <= line.quantity && !!line.date && (line.first === line.quantity || (!!line.laterDate && line.laterDate >= line.date)));
export const readyDateLabel = (value: string) => new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
