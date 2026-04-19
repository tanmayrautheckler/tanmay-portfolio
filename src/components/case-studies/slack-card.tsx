"use client";

import { useMemo } from "react";

interface Props {
  author: string;
  channel: string; // "general", "odoo-17-upgrade"
  timestamp: string; // Display string: "Oct 18, 2024 · 3:50 PM"
  body: string; // Plain text; @mentions rendered below
  me?: boolean; // When Tanmay is the author, highlight
}

const avatarColors: Record<string, string> = {
  Tanmay: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  "Dean Heckler (CEO)": "linear-gradient(135deg, #ea580c, #f59e0b)",
  "Dean Heckler": "linear-gradient(135deg, #ea580c, #f59e0b)",
  "Marshall Hardwick": "linear-gradient(135deg, #0ea5e9, #06b6d4)",
  "Regina Badilla (Operations)": "linear-gradient(135deg, #ec4899, #a855f7)",
  "Regina Badilla": "linear-gradient(135deg, #ec4899, #a855f7)",
};

function initials(name: string) {
  return name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Render @Name and *bold* tokens from Slack text */
function renderBody(text: string) {
  // Convert @-mentions into styled spans and preserve line breaks
  const parts = text.split(/(@[A-Za-z][A-Za-z .'\-]+?(?=[,.!?…\s]|$))/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="text-[#1d4ed8] dark:text-[#93c5fd] font-medium bg-[#1d4ed8]/10 dark:bg-[#93c5fd]/10 rounded px-1 py-[1px]">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function SlackCard({ author, channel, timestamp, body, me }: Props) {
  const avatar = useMemo(() => avatarColors[author] ?? "linear-gradient(135deg, #64748b, #334155)", [author]);

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[#fafafa] dark:bg-[#1a1d21] shadow-xl max-w-xl">
      {/* Channel header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f4f4f4] dark:bg-[#222529] border-b border-border/60">
        <span className="text-[#616061] dark:text-[#abadb0] text-sm font-normal">#</span>
        <span className="text-[13px] font-semibold text-[#1d1c1d] dark:text-[#d1d2d3]">
          {channel}
        </span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.18em] text-text-secondary/60">
          Slack
        </span>
      </div>

      {/* Message */}
      <div className="px-4 py-3 flex gap-3">
        <div
          className="w-9 h-9 rounded-md shrink-0 flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
          style={{ background: avatar }}
          aria-hidden="true"
        >
          {initials(author)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[14px] font-bold text-[#1d1c1d] dark:text-[#d1d2d3]">
              {author}
            </span>
            {me ? (
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-accent bg-accent/10 rounded px-1.5 py-[1px]">
                Me
              </span>
            ) : null}
            <span className="text-[11px] text-[#616061] dark:text-[#abadb0] font-normal">
              {timestamp}
            </span>
          </div>
          <div className="text-[14px] leading-[1.5] text-[#1d1c1d] dark:text-[#d1d2d3] whitespace-pre-wrap break-words font-sans">
            {renderBody(body)}
          </div>
        </div>
      </div>
    </div>
  );
}
