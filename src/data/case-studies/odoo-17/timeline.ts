/**
 * 65-hour cutover timeline milestones.
 * Quote timestamps/texts sourced from Slack (#general, #odoo-17-upgrade) and
 * the Notion "Odoo 17 Timeline" page — see README for source mapping.
 */

export type TimelineTier = "freeze" | "test" | "decision" | "live" | "stabilize";

export interface TimelineMilestone {
  id: string;
  time: string; // Display string
  iso: string; // ISO 8601 for machine-readable
  day: "Fri" | "Sat" | "Sun" | "Mon" | "Week";
  tier: TimelineTier;
  title: string;
  detail: string;
  quote?: {
    author: string;
    text: string;
    source: string; // e.g. "#general, 2024-10-18 15:50 MST"
  };
  screenshotSlug?: string; // Reference to /public/images/case-studies/odoo-17/slack/<slug>.png
}

export const TIMELINE: TimelineMilestone[] = [
  {
    id: "freeze",
    time: "Fri · 4:00 PM AZT",
    iso: "2024-10-18T16:00:00-07:00",
    day: "Fri",
    tier: "freeze",
    title: "Production freeze",
    detail:
      "Posted company-wide freeze notice in #general. Disconnected Shopify, bank sync, and ShipStation integrations. Started DB backups. Niraj kicked off the overnight migration script.",
    quote: {
      author: "Tanmay",
      text:
        "Please be informed that we will be upgrading our Odoo system from version 16 to 17 this weekend… all users stop using Odoo after 4 PM AZ time today. At that time, we will be disconnecting all integrations, including Shopify, bank synchronization, and ShipStation.",
      source: "#general · 2024-10-18 15:50 MST",
    },
    screenshotSlug: "fri-freeze-post",
  },
  {
    id: "backup",
    time: "Fri · 4:30 PM",
    iso: "2024-10-18T16:30:00-07:00",
    day: "Fri",
    tier: "freeze",
    title: "Backup confirmed, migration begins",
    detail:
      "Marshall confirmed DB backup complete: \"The backup has been started, any work performed in Odoo beyond this point will likely not transfer over to our new instance.\"",
    quote: {
      author: "Marshall Hardwick",
      text:
        "The backup has been started, any work performed in Odoo beyond this point will likely not transfer over to our new instance.",
      source: "#general · 2024-10-18 16:06 MST",
    },
  },
  {
    id: "sat-test",
    time: "Sat · all day",
    iso: "2024-10-19T00:00:00-07:00",
    day: "Sat",
    tier: "test",
    title: "Full functional test suite",
    detail:
      "Marshall and I ran every flow end-to-end: sales orders, manufacturing orders, purchase orders, invoice generation, payment portal, shipping, tax calculation. Most paths were clean. ShipStation auto-validation was broken. Dashboard Ninja (a paid 3rd-party module) flagged as incompatible with 17 — moved to the ≤1-week tier, proceed.",
    quote: {
      author: "Tanmay",
      text:
        "Except shipstation validation it all looks good to us. Me and Marshall ran tests and check critical points from our end. Will run final complete tests tomorrow with PMs.",
      source: "#odoo-17-upgrade · 2024-10-19 15:50 MST",
    },
  },
  {
    id: "sun-shipstation-fix",
    time: "Sun · 12:10 PM",
    iso: "2024-10-20T12:10:00-07:00",
    day: "Sun",
    tier: "test",
    title: "ShipStation auto-validation fixed",
    detail:
      "Fixed the ShipStation DO auto-validation path Sunday afternoon. Ran final regression with department heads. Confirmed in #odoo-17-upgrade that we were ready for the go/no-go meeting.",
    quote: {
      author: "Tanmay",
      text:
        "Auto validation of the shipstation based DOs is fixed. Me and Marshall feel its ready.",
      source: "#odoo-17-upgrade · 2024-10-20 12:10 MST",
    },
  },
  {
    id: "go-nogo",
    time: "Sun · 2:00 PM",
    iso: "2024-10-20T14:00:00-07:00",
    day: "Sun",
    tier: "decision",
    title: "Go/no-go stakeholder meeting",
    detail:
      "Department heads signed off by name. Jess (sales ops), Nick (production), Bijan (procurement), Regina (operations), and Catalina (accounting) each gave explicit yes/no on whether their workflows were ready. All five said yes. Dashboard Ninja (3rd-party module) formally deferred.",
    quote: {
      author: "Dean Heckler (CEO)",
      text: "Nice! Congrats! See you at 2pm.",
      source: "#odoo-17-upgrade · 2024-10-20 12:38 MST",
    },
  },
  {
    id: "live",
    time: "Mon · 9:57 AM",
    iso: "2024-10-21T09:57:00-07:00",
    day: "Mon",
    tier: "live",
    title: "Production live on Odoo 17",
    detail:
      "Database cutover complete. All 34 users pointed at the 17 instance. 65 hours from freeze to live. Dean posted in #general within minutes.",
    quote: {
      author: "Dean Heckler (CEO)",
      text:
        "Great work Tanmay, Marshall, and Niraj on a smooth Odoo 17 upgrade! Very impressive work. Thanks for Nick, Jess, Bij, and Regina for your preparation and for giving a part of your weekend to the effort!",
      source: "#general · 2024-10-21 09:57 MST",
    },
    screenshotSlug: "mon-dean-congrats",
  },
  {
    id: "stabilize",
    time: "Mon–Fri · Oct 21–25",
    iso: "2024-10-21T12:00:00-07:00",
    day: "Week",
    tier: "stabilize",
    title: "Stabilization week",
    detail:
      "Maintained a running numbered issue register in Slack. Each issue triaged against the tiered criteria, assigned (me, Marshall, or Niraj), and tracked to close. Real issues that surfaced: email template defaults changed, DHL shipping rates differed (carrier API weight-vs-dimensional behavior change between versions), customer invoices landing in spam folders, Canadian tax edge cases.",
    quote: {
      author: "Regina Badilla (Operations)",
      text:
        "Tanmay — Unable to cancel D58414 Test order. Shows it can not cancel because it is shipped by shipstation.",
      source: "#odoo-17-upgrade · 2024-10-21 10:59 MST",
    },
  },
];

/** Production-frozen window, for display in timeline header */
export const FROZEN_WINDOW_HOURS = 65;
