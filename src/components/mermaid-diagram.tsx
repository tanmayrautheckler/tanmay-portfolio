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
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
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
          },
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
        className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/5 p-6 md:p-8 overflow-x-auto"
      >
        <div
          ref={svgHost}
          className="mermaid-svg flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
        />
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-3 text-white/20 text-sm">
              <div className="w-4 h-4 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
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
          className="text-[12px] text-white/20 mt-3"
        >
          {caption}
        </motion.p>
      )}
    </div>
  );
}
