"use client";

/* ═══════════════════════════════════════════════════════════
   BROWSER / APP FRAME WRAPPERS
   macOS-style chrome for screenshots, terminals, chat UIs
   ═══════════════════════════════════════════════════════════ */

interface FrameProps {
  children: React.ReactNode;
  url?: string;
  className?: string;
}

export function BrowserFrame({ children, url = "localhost:3000", className = "" }: FrameProps) {
  return (
    <div className={`rounded-xl overflow-hidden border border-border/60 shadow-2xl ${className}`}>
      {/* Chrome bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1c1c1e] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-8">
          <div className="bg-white/5 rounded-md px-3 py-1 text-[11px] text-white/30 font-mono text-center truncate">
            {url}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="bg-[#0f1117] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function OdooFrame({ children, className = "" }: FrameProps) {
  return (
    <div className={`rounded-xl overflow-hidden border border-border/60 shadow-2xl ${className}`}>
      {/* Odoo top bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#714B67] border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center gap-4 text-[11px] text-white/70 font-medium">
          <span className="text-white">RMA</span>
          <span className="opacity-50">Inventory</span>
          <span className="opacity-50">Accounting</span>
          <span className="opacity-50">Manufacturing</span>
        </div>
      </div>
      <div className="bg-[#f8f9fa] dark:bg-[#0f1117] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function TerminalFrame({ children, className = "" }: FrameProps) {
  return (
    <div className={`rounded-xl overflow-hidden border border-border/60 shadow-2xl ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1c1c1e] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] text-white/30 font-mono ml-4">mcp-server — zsh</span>
      </div>
      <div className="bg-[#0a0a0a] p-5 font-mono text-[12px] leading-relaxed overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function ChatFrame({ children, className = "" }: FrameProps) {
  return (
    <div className={`rounded-xl overflow-hidden border border-border/60 shadow-2xl ${className}`}>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#1c1c1e] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-600" />
          <span className="text-[12px] text-white/60 font-medium">Claude</span>
        </div>
      </div>
      <div className="bg-[#0f1117] p-5 space-y-4 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
