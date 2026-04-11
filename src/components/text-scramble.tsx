"use client";

import { useTextScramble } from "@/hooks/use-text-scramble";

interface TextScrambleProps {
  words: string[];
  className?: string;
}

export function TextScramble({ words, className = "" }: TextScrambleProps) {
  const { display } = useTextScramble(words);

  return (
    <span className={`inline-block font-mono ${className}`} aria-label={words[0]}>
      {display.split("").map((char, i) => {
        // Check if this char matches the target word at this position
        // We approximate: if it's a real letter from the target, it's "locked"
        const isSpace = char === " ";
        return (
          <span
            key={i}
            className={isSpace ? "" : "inline-block"}
            style={{
              opacity: isSpace ? 1 : undefined,
              minWidth: isSpace ? "0.3em" : undefined,
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
