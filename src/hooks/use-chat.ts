"use client";

import { useState, useCallback } from "react";
import { SYSTEM_PROMPT } from "@/data/chatbot-context";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const newUserMsg: ChatMessage = { role: "user", content: userMessage.trim() };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);
    setError(null);

    if (!API_URL) {
      // No API configured — provide a friendly fallback
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "The AI chat isn't connected yet — Tanmay is still setting up the backend! In the meantime, feel free to reach out via the contact page or email tanmay.rautwork@gmail.com.",
          },
        ]);
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      const allMessages = [...messages, newUserMsg];
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      const assistantContent = data.content || data.message || "Sorry, I couldn't process that.";

      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
    } catch {
      setError("Couldn't reach the AI. Try again later or email Tanmay directly.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try the contact page instead!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  return { messages, isLoading, error, sendMessage };
}
