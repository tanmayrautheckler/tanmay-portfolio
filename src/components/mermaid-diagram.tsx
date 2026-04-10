"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";

interface MermaidDiagramProps {
  chart: string;
  caption?: string;
  className?: string;
}

/**
 * Renders mermaid charts client-side with scroll-triggered animation.
 * Mermaid's render() produces sanitised SVG from a domain-specific language
 * (not user HTML) — the output is safe to insert into the DOM.
 */
export default function MermaidDiagram({ chart, caption, className = "" }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgHost = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [loading, setLoading] = useState(true);
  const renderedRef = useRef(false);

  const insertSvg = useCallback((svgCode: string) => {
    if (!svgHost.current) return;
    // Parse the SVG string safely via DOMParser — no script execution
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, "image/svg+xml");
    const svgEl = doc.documentElement;
    // Clear and append
    while (svgHost.current.firstChild) {
      svgHost.current.removeChild(svgHost.current.firstChild);
    }
    svgHost.current.appendChild(document.importNode(svgEl, true));
  }, []);

  useEffect(() => {
    if (!isInView || renderedRef.current || !svgHost.current) return;

    const renderChart = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = document.documentElement.classList.contains("dark");

        const darkVars = {
          darkMode: true,
          background: "transparent",
          primaryColor: "#0EBBFF",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#0EBBFF44",
          secondaryColor: "#8b5cf6",
          secondaryTextColor: "#e2e8f0",
          secondaryBorderColor: "#8b5cf644",
          tertiaryColor: "#22c55e",
          tertiaryTextColor: "#e2e8f0",
          tertiaryBorderColor: "#22c55e44",
          lineColor: "#475569",
          textColor: "#94a3b8",
          mainBkg: "#1e293b",
          nodeBorder: "#334155",
          clusterBkg: "#0f172a",
          clusterBorder: "#1e293b",
          titleColor: "#e2e8f0",
          edgeLabelBackground: "#0f172a",
          nodeTextColor: "#e2e8f0",
          actorTextColor: "#e2e8f0",
          actorBkg: "#1e293b",
          actorBorder: "#0EBBFF44",
          actorLineColor: "#475569",
          signalColor: "#94a3b8",
          signalTextColor: "#e2e8f0",
          labelBoxBkgColor: "#1e293b",
          labelBoxBorderColor: "#334155",
          labelTextColor: "#e2e8f0",
          loopTextColor: "#94a3b8",
          noteBkgColor: "#1e293b",
          noteBorderColor: "#0EBBFF44",
          noteTextColor: "#e2e8f0",
          activationBkgColor: "#1e293b",
          activationBorderColor: "#0EBBFF44",
          sequenceNumberColor: "#0EBBFF",
        };

        const lightVars = {
          darkMode: false,
          background: "transparent",
          primaryColor: "#0099dd",
          primaryTextColor: "#1e293b",
          primaryBorderColor: "#0099dd44",
          secondaryColor: "#7c3aed",
          secondaryTextColor: "#1e293b",
          secondaryBorderColor: "#7c3aed44",
          tertiaryColor: "#16a34a",
          tertiaryTextColor: "#1e293b",
          tertiaryBorderColor: "#16a34a44",
          lineColor: "#94a3b8",
          textColor: "#334155",
          mainBkg: "#f1f5f9",
          nodeBorder: "#cbd5e1",
          clusterBkg: "#f8fafc",
          clusterBorder: "#e2e8f0",
          titleColor: "#0f172a",
          edgeLabelBackground: "#f8fafc",
          nodeTextColor: "#1e293b",
          actorTextColor: "#1e293b",
          actorBkg: "#f1f5f9",
          actorBorder: "#0099dd44",
          actorLineColor: "#94a3b8",
          signalColor: "#475569",
          signalTextColor: "#1e293b",
          labelBoxBkgColor: "#f1f5f9",
          labelBoxBorderColor: "#cbd5e1",
          labelTextColor: "#1e293b",
          loopTextColor: "#475569",
          noteBkgColor: "#f1f5f9",
          noteBorderColor: "#0099dd44",
          noteTextColor: "#1e293b",
          activationBkgColor: "#f1f5f9",
          activationBorderColor: "#0099dd44",
          sequenceNumberColor: "#0099dd",
        };

        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          themeVariables: isDark ? darkVars : lightVars,
          flowchart: { htmlLabels: true, curve: "basis", padding: 15 },
          sequence: {
            actorMargin: 50,
            messageMargin: 40,
            boxMargin: 10,
            noteMargin: 10,
            mirrorActors: false,
          },
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
          fontSize: 13,
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);

        insertSvg(svg);
        renderedRef.current = true;
        setLoading(false);
      } catch (err) {
        console.error("Mermaid render failed:", err);
        setLoading(false);
      }
    };

    renderChart();
  }, [isInView, chart, insertSvg]);

  return (
    <div ref={containerRef} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface backdrop-blur-sm rounded-xl border border-border p-6 md:p-8 overflow-x-auto"
      >
        <div
          ref={svgHost}
          className="mermaid-svg flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
        />
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <div className="w-4 h-4 border-2 border-border border-t-accent rounded-full animate-spin" />
              Rendering diagram...
            </div>
          </div>
        )}
      </motion.div>
      {caption && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-[12px] text-text-secondary/60 mt-3"
        >
          {caption}
        </motion.p>
      )}
    </div>
  );
}
