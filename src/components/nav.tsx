"use client";

/**
 * Minimal hover-expand nav.
 *
 * Collapsed: single "Menu" word + ⌘K hint + CV link + theme toggle.
 * Hover/focus "Menu" — links fan out beneath it.
 * Mobile: tap "Menu" toggles drawer.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Command, ChevronDown } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { MagneticCard } from "./scroll-animations";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/labs", label: "Labs" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  // Auto-close after mouse leaves with grace period
  function handleEnter() {
    if (closeT.current) {
      clearTimeout(closeT.current);
      closeT.current = null;
    }
    setOpen(true);
  }
  function handleLeave() {
    closeT.current = setTimeout(() => setOpen(false), 200);
  }

  const openCmdK = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true }),
    );
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand mark */}
        <MagneticCard strength={0.25}>
          <Link
            href="/"
            className="text-lg font-bold tracking-tight hover:text-accent transition-colors inline-block"
          >
            TR
          </Link>
        </MagneticCard>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* MENU word — hover expand */}
          <div
            className="relative"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onFocus={handleEnter}
            onBlur={handleLeave}
          >
            <button
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-accent transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              <span>Menu</span>
              {pathname !== "/" && (
                <span className="text-accent font-mono text-[11px] opacity-80">
                  · {links.find((l) => l.href === pathname)?.label ?? "…"}
                </span>
              )}
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="inline-flex"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
            </button>

            {/* Hover-expand panel */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full right-0 mt-2 min-w-[220px] rounded-2xl border border-border shadow-2xl overflow-hidden"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <ul className="p-2">
                    {links.map((link, i) => (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.025 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            pathname === link.href
                              ? "text-accent bg-accent/10"
                              : "text-foreground hover:bg-surface-hover"
                          }`}
                        >
                          <span>{link.label}</span>
                          <span
                            className="font-mono text-[10px] text-text-secondary/50 group-hover:text-accent transition-colors"
                            style={{ letterSpacing: "0.1em" }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="px-3 py-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-text-secondary/70">
                    <span>navigation</span>
                    <span>{links.length} routes</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cmd+K hint */}
          <button
            onClick={openCmdK}
            className="px-2.5 py-1.5 inline-flex items-center gap-1.5 text-[11px] font-mono text-text-secondary border border-border rounded-lg hover:text-accent hover:border-accent transition-colors"
            aria-label="Open command palette"
          >
            <Command className="w-3 h-3" />
            <span className="opacity-70">{isMac ? "⌘" : "Ctrl"}</span>
            <span>K</span>
          </button>

          {/* Resume download */}
          <a
            href="/resume.pdf"
            download="Tanmay-Raut-Resume.pdf"
            className="px-2.5 py-1.5 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors rounded-lg border border-transparent hover:border-border"
            aria-label="Download resume"
          >
            <FileDown className="w-3.5 h-3.5" />
            CV
          </a>

          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  );
}
