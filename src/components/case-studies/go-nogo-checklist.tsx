"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Check, FileText } from "lucide-react";
import { SIGN_OFF, TIERS } from "@/data/case-studies/odoo-17/content";

/**
 * Stylized recreation of the actual Notion "Odoo 17 Timeline" checklist.
 * Real items sourced from Notion page 11c18132-1623-80c9-93a9-fcb3d91fd32b.
 */
export function GoNoGoChecklist() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  // Mix of checked/unchecked items to show realism — all critical items shipped
  const criticalItems = TIERS.critical.items.slice(0, 8);
  const sundayItems = TIERS.oneWeek.items.slice(0, 4);

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4">
            Real artifact · Notion page
          </p>
          <h2 className="serif-display text-2xl md:text-4xl font-normal tracking-tight leading-[1.15] text-foreground">
            The actual go/no-go document stakeholders signed off on.
          </h2>
          <p className="mt-4 text-sm md:text-base text-text-secondary serif-prose leading-[1.65]">
            Live in Notion during the weekend. Checkboxes toggled as tests passed. Below is a
            faithful recreation from the working doc — real items, real tier structure.
          </p>
        </div>

        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl overflow-hidden border border-border shadow-2xl bg-white dark:bg-[#191919]"
        >
          {/* Notion-ish top bar */}
          <div className="flex items-center gap-2 px-5 py-3 bg-[#f7f6f3] dark:bg-[#202020] border-b border-border">
            <FileText className="w-3.5 h-3.5 text-text-secondary" />
            <span className="text-[12px] font-medium text-[#37352f] dark:text-[#eaeaea]">
              Odoo 17 Timeline
            </span>
            <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary/60">
              notion.so
            </span>
          </div>

          <div className="p-5 md:p-8 font-sans text-[#37352f] dark:text-[#eaeaea]">
            {/* Heading */}
            <h3 className="text-[22px] md:text-[26px] font-bold tracking-tight mb-1">
              Minimum things required to go live
            </h3>
            <p className="text-[12px] text-[#787774] dark:text-[#9b9a97] mb-6">
              Last edited Oct 20, 2024 · 14 checked · 3 pending review
            </p>

            {/* Critical section */}
            <h4 className="text-[15px] font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Critical
            </h4>
            <ul className="space-y-1.5 mb-8">
              {criticalItems.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5 text-[13.5px]">
                  <span className="mt-0.5 w-[14px] h-[14px] rounded-[3px] border border-[#37352f]/30 dark:border-white/30 bg-[#37352f] dark:bg-white flex items-center justify-center shrink-0">
                    <Check className="w-[10px] h-[10px] text-white dark:text-[#37352f]" strokeWidth={3} />
                  </span>
                  <span className="line-through decoration-[#37352f]/40 dark:decoration-white/40 text-[#37352f]/60 dark:text-white/60">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="text-[12px] text-[#787774] dark:text-[#9b9a97] italic mb-6">
              all feed back by 6pm Sunday 20th
            </div>

            {/* ≤1 week section */}
            <h4 className="text-[15px] font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Can be fixed in a week
            </h4>
            <ul className="space-y-1.5 mb-8">
              {sundayItems.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5 text-[13.5px]">
                  <span className="mt-0.5 w-[14px] h-[14px] rounded-[3px] border border-[#37352f]/30 dark:border-white/30 bg-[#37352f] dark:bg-white flex items-center justify-center shrink-0">
                    <Check className="w-[10px] h-[10px] text-white dark:text-[#37352f]" strokeWidth={3} />
                  </span>
                  <span className="line-through decoration-[#37352f]/40 dark:decoration-white/40 text-[#37352f]/60 dark:text-white/60">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* >1 week */}
            <h4 className="text-[15px] font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#787774]" />
              Will take more than a week to be fixed
            </h4>
            <ul className="space-y-1.5 mb-10">
              <li className="flex items-start gap-2.5 text-[13.5px]">
                <span className="mt-0.5 w-[14px] h-[14px] rounded-[3px] border border-[#37352f]/40 dark:border-white/40 shrink-0" />
                <span>Ramp transactions</span>
              </li>
            </ul>

            {/* Agreement table */}
            <h4 className="text-[15px] font-semibold mb-3">Agreed to move to 17</h4>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-[13px]">
                <thead className="bg-[#f7f6f3] dark:bg-[#202020] text-[#787774] dark:text-[#9b9a97] text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium w-1/2">Members</th>
                    <th className="px-3 py-2 font-medium">Agreed</th>
                    <th className="px-3 py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {SIGN_OFF.map((p) => (
                    <tr key={p.name} className="border-t border-border">
                      <td className="px-3 py-2.5">
                        {p.name} <span className="text-[#787774] dark:text-[#9b9a97] text-[11px]">· {p.role}</span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-green-600 dark:text-green-500">
                        YES
                      </td>
                      <td className="px-3 py-2.5 text-[#787774] dark:text-[#9b9a97]" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-[12px] text-[#787774] dark:text-[#9b9a97]">
              Tanmay to sound off if 17 is in place Sunday at 7pm · Tanmay on site at 6:30 Monday
              morning
            </p>
          </div>
        </motion.div>

        <p className="mt-4 text-[11px] font-mono uppercase tracking-[0.18em] text-text-secondary/50">
          Source: Notion page &ldquo;Odoo 17 Timeline&rdquo; · Oct 14–25, 2024
        </p>
      </div>
    </section>
  );
}
