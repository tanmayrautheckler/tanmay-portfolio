"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Send, User, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChat } from "@/hooks/use-chat";
import { SplineCharacter } from "./spline-character";
import { PikachuAvatar } from "./pikachu-avatar";
import "./pikachu-chat.css";
import { Button } from "@/components/ui/button";
import { INPUT_PLACEHOLDER, SUGGESTED_PROMPTS } from "@/data/chatbot-context";

export function AIChatbot() {
  const alignRight = usePathname().startsWith("/projects");
  const [isOpen, setIsOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, error, sendMessage } = useChat();
  const reducedMotion = useReducedMotion();
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const clampPosition = (x: number, y: number) => {
    const width = launcherRef.current?.offsetWidth ?? 120;
    const height = launcherRef.current?.offsetHeight ?? 120;
    const maxY = Math.max(8, window.innerHeight - height - 8);
    // Keep the launcher below the fixed navigation so dragging cannot bury its hit target.
    const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
    const minY = Math.min(maxY, Math.max(8, headerBottom + 8));
    return {
      x: Math.max(8, Math.min(x, window.innerWidth - width - 8)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  };
  useEffect(() => {
    const resize = () => setPosition(previous => previous ? clampPosition(previous.x, previous.y) : null);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    if (messages.length === 0) { container.scrollTop = 0; return; }
    container.scrollTo({
      top: container.scrollHeight,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }, [messages, isLoading, isOpen, reducedMotion]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const closeChat = () => {
    setIsOpen(false);
    launcherRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className={`pika-chat fixed bottom-4 z-50 md:bottom-5 ${alignRight ? "right-3 md:right-5" : "left-3 md:left-5"}`} data-side={alignRight ? "right" : "left"} data-thinking={isLoading} data-open={isOpen} style={position ? { left: position.x, top: position.y, bottom: "auto", right: "auto" } : undefined}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="portfolio-assistant"
            role="dialog"
            aria-labelledby="portfolio-assistant-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                closeChat();
              }
            }}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
            className="fixed left-3 md:left-5 flex w-[calc(100vw-1.5rem)] max-w-96 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="pika-header-avatar"><PikachuAvatar size={45} active={isLoading}/></span>
                <div>
                  <div id="portfolio-assistant-title" className="text-sm font-semibold text-foreground">Pikachu’s corner</div>
                  <div className="mt-0.5 text-xs text-text-secondary">{isLoading ? "Thinking about your question…" : "Tanmay’s little AI sidekick"}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="size-11" onClick={closeChat} aria-label="Close assistant">
                <X aria-hidden="true" />
              </Button>
            </div>

            <div ref={messagesRef} className="h-72 min-h-0 space-y-3 overflow-y-auto overscroll-contain p-4" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
              {messages.length === 0 && (
                <div className="pika-welcome py-3"><span className="pika-welcome-kicker"><Zap size={12}/> A LITTLE SPARK OF CURIOSITY</span>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    Pika! Curious about Tanmay? I can help you explore his projects, experience, and the things he builds.
                  </p>
                  <div className="mt-4 flex flex-col items-start gap-2">
                    {SUGGESTED_PROMPTS.map((question) => (
                      <Button
                        key={question}
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => { setInput(""); sendMessage(question); }}
                        className="h-auto whitespace-normal px-3 py-2 text-left text-xs leading-relaxed"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <span className="mt-1 shrink-0"><PikachuAvatar size={25}/></span>
                  )}
                  <div className={`max-w-[85%] rounded-xl border px-3 py-2 text-sm ${message.role === "user" ? "rounded-br-sm border-transparent bg-foreground text-background" : "rounded-bl-sm border-border bg-surface-hover text-foreground"}`}>
                    {message.role === "user" ? message.content : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          ul: ({ children }) => <ul className="my-1 list-inside list-disc space-y-0.5">{children}</ul>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          code: ({ children }) => <code className="rounded bg-foreground/10 px-1 font-mono text-xs">{children}</code>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  {message.role === "user" && <User className="mt-2 size-4 shrink-0 text-text-secondary" aria-hidden="true" />}
                </div>
              ))}

              {isLoading && <div role="status" className="pika-thinking"><PikachuAvatar size={28} active/><span>Pikachu is thinking<i/><i/><i/></span></div>}
            </div>

            {error && <p role="alert" className="pika-connection-note">Chat connection unavailable. <a href="/contact">Contact Tanmay directly <span aria-hidden="true">↗</span></a></p>}
            <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t border-border p-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={INPUT_PLACEHOLDER}
                aria-label="Your question about Tanmay"
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base sm:text-sm text-foreground placeholder:text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="size-11" aria-label="Send question">
                <Send aria-hidden="true" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        ref={launcherRef}
        variant="ghost"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
        title="Drag to move · Click to chat · Arrow keys to move"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const rect = event.currentTarget.getBoundingClientRect();
          suppressClick.current = false;
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          if (!start.moved && Math.hypot(dx, dy) < 6) return;
          start.moved = true;
          suppressClick.current = true;
          setPosition(clampPosition(start.left + dx, start.top + dy));
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; suppressClick.current = true; }}
        onLostPointerCapture={() => { drag.current = null; }}
        onKeyDown={(event) => {
          const delta = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[event.key];
          if (!delta) return;
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          setPosition(clampPosition(rect.left + delta[0], rect.top + delta[1]));
        }}
        onClick={(event) => { if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; } if (isOpen) closeChat(); else setIsOpen(true); }}
        aria-label={isOpen ? "Close Pikachu chat" : "Chat with Pikachu about Tanmay"}
        aria-expanded={isOpen}
        aria-controls={isOpen ? "portfolio-assistant" : undefined}
        className="pika-launcher"
      >
        <span className="pika-launcher-character"><SplineCharacter size={120} state={isLoading || hovering || isOpen ? "talking" : "idle"}/></span>
        <span className="pika-launcher-spark" aria-hidden="true"><Zap size={12}/></span>
      </Button>
    </div>
  );
}
