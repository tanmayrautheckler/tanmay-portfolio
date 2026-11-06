"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);
  const request = useRef<AbortController | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; request.current?.abort(); clearTimeout(fallbackTimer.current); };
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || sending.current) return;
    sending.current = true;

    const newUserMsg: ChatMessage = { role: "user", content: userMessage.trim() };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);
    setError(null);

    if (!API_URL) {
      // No API configured — provide a friendly fallback
      fallbackTimer.current = setTimeout(() => {
        if (!mounted.current) return;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "The AI chat isn't connected yet — Tanmay is still setting up the backend! In the meantime, feel free to reach out via the contact page or email tanmay.rautwork@gmail.com.",
          },
        ]);
        sending.current = false;
        setIsLoading(false);
      }, 800);
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    // Blocked requests and stalled networks must not leave the launcher thinking forever.
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const allMessages = [...messages, newUserMsg];
      // System prompt and grounded context live in the Worker — client sends messages only.
      const res = await fetch(API_URL, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      const assistantContent = typeof data.content === "string" ? data.content : typeof data.message === "string" ? data.message : null;
      if (!assistantContent?.trim()) throw new Error("Empty chat response");
      if (!mounted.current) return;

      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
    } catch {
      if (!mounted.current) return;
      setError("Couldn't reach the AI. Try again later or email Tanmay directly.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try the contact page instead!" },
      ]);
    } finally {
      clearTimeout(timeout);
      request.current = null;
      sending.current = false;
      if (mounted.current) setIsLoading(false);
    }
  }, [messages]);

  return { messages, isLoading, error, sendMessage };
}
