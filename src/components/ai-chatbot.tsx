"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { useChat } from "@/hooks/use-chat";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 left-6 z-50" style={{ pointerEvents: "auto" }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-16 left-0 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Ask about Tanmay</div>
                  <div className="text-[10px] text-text-secondary">AI-powered assistant</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-hover flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-8 h-8 text-accent/40 mx-auto mb-3" />
                  <p className="text-sm text-text-secondary">
                    Ask me anything about Tanmay&apos;s experience, skills, or projects!
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                    {["What does Tanmay do?", "ERP experience?", "Tech stack?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); sendMessage(q); }}
                        className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-accent" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-accent text-black rounded-br-sm"
                        : "bg-surface-hover text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3 text-accent" />
                  </div>
                  <div className="bg-surface-hover px-3 py-2 rounded-xl rounded-bl-sm">
                    <motion.div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-text-secondary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent text-black hover:bg-accent-hover transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full bg-accent text-black shadow-lg shadow-accent/25 flex items-center justify-center hover:bg-accent-hover transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
