"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/social-icons";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export function CSFooter() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();

  return (
    <footer
      ref={ref}
      className="px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-border"
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4"
        >
          Case study series
        </motion.p>

        <motion.h2
          initial={reduced ? undefined : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="serif-display text-2xl md:text-4xl font-normal tracking-tight leading-[1.15] text-foreground max-w-2xl"
        >
          Two more coming in the series.
        </motion.h2>

        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Case study 02 placeholder */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="border border-dashed border-border rounded-lg p-6 md:p-8 bg-surface/60"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-3">
              Case study 02 · Coming soon
            </p>
            <h3 className="serif-display text-lg md:text-xl tracking-tight text-foreground/70 leading-tight">
              AEI Vendor Management Portal
            </h3>
            <p className="text-xs text-text-secondary/70 serif-prose mt-2">
              Replacing a spreadsheet with a full supplier-relationship portal, Odoo as the sole
              data store.
            </p>
          </motion.div>

          {/* Case study 03 placeholder */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border border-dashed border-border rounded-lg p-6 md:p-8 bg-surface/60"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-3">
              Case study 03 · Coming soon
            </p>
            <h3 className="serif-display text-lg md:text-xl tracking-tight text-foreground/70 leading-tight">
              MCP-to-Odoo AI Integration
            </h3>
            <p className="text-xs text-text-secondary/70 serif-prose mt-2">
              Direct Claude → Odoo tool use via an MCP server. How an ERP becomes an AI-native
              system of record.
            </p>
          </motion.div>
        </div>

        {/* Nav row */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 md:mt-20 pt-8 border-t border-border/60 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-text-secondary transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to portfolio
          </Link>

          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <a
              href="https://github.com/tanmayrautheckler"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              GitHub
            </a>
            {/* LinkedIn intentionally disabled until publish-approved */}
            <span
              className="inline-flex items-center gap-1.5 opacity-40 cursor-not-allowed"
              title="LinkedIn link withheld until public publish is approved"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              LinkedIn
            </span>
          </div>
        </motion.div>

        {/* Privacy note (visible only on this preview build) */}
        <p className="mt-10 text-[10px] font-mono uppercase tracking-[0.25em] text-text-secondary/40">
          Preview · not indexed · attorney review pending
        </p>
      </div>
    </footer>
  );
}
