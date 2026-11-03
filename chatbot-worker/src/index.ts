/**
 * Cloudflare Worker — Anthropic API proxy for Tanmay's portfolio chatbot.
 *
 * Architecture:
 *   browser → Worker (this file) → Anthropic API → Worker → browser
 *
 * The Worker is authoritative on system prompt: it loads the rich
 * context.generated.md (built from src/data/*.ts via scripts/build-context.mjs)
 * and prepends it to every Anthropic API call with cache_control: ephemeral.
 * Client `body.system` is ignored to prevent context drift.
 *
 * Model: claude-haiku-4-5 (fast, cheap, $1/$5 per 1M tokens).
 * Caching: 5-minute TTL ephemeral cache on the ~30K-token system block.
 */

// @ts-expect-error — wrangler [[rules]] type="Text" loads .md as string at build time
import CONTEXT from "./context.generated.md";

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGIN?: string; // comma-separated list of allowed origins
}

type ChatMessage = { role: "user" | "assistant"; content: string };

interface RequestBody {
  messages?: ChatMessage[];
}

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 512;

const CONTEXT_HEADER = `You are Pikachu, Tanmay Raut's friendly portfolio mascot and AI helper for visitors who want to understand his work, experience and projects. You are not Tanmay; say so if asked. Always talk about Tanmay in third person ("Tanmay designed…", "He led…").

PERSONA:
- Warm, curious and lightly playful. Use plain language and concise explanations.
- Keep Pikachu’s personality subtle: an occasional Pika or lightning reference is welcome. Focus on useful answers; never let the character obscure facts.
- Personality must never distort facts.

STRICT RULES:
1. Only use facts from the CONTEXT block below. Never invent names, employers, dates, metrics, or project details not in CONTEXT.
2. If something isn't in CONTEXT, say "I don't have that information. You can reach Tanmay directly at tanmay.rautwork@gmail.com."
3. Answer in 3–6 sentences. Be specific and concrete. No walls of text.
4. Cite real numbers when available: "65-hour cutover", "4,762 SKUs", "8,441-row spreadsheet".
5. No filler phrases like "based on the context" or "it appears that". Just answer.
6. Use markdown bold (**word**) for key terms, project names, and metrics.

---

CONTEXT:
`;

// Simple in-memory rate limiter — 15 req/min per IP
// Resets per Worker instance but provides meaningful protection
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function corsHeaders(origin: string | null, allowed: string | undefined): HeadersInit {
  // Support comma-separated origins e.g. "https://tanmay-portfolio-pied.vercel.app,https://tanmayrautheckler.github.io"
  if (!allowed) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };
  }
  const allowedList = allowed.split(",").map((s) => s.trim());
  const allow = origin && allowedList.includes(origin) ? origin : allowedList[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // Rate limit
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Try again in a minute." }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { messages } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Cap history to keep token usage bounded.
    const cappedMessages = messages.slice(-20).map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 4000),
    }));

    try {
      const apiResp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: [
            {
              type: "text",
              text: CONTEXT_HEADER + (CONTEXT as unknown as string),
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: cappedMessages,
        }),
      });

      if (!apiResp.ok) {
        const errText = await apiResp.text();
        return new Response(
          JSON.stringify({ error: `Anthropic API error: ${apiResp.status}`, detail: errText }),
          {
            status: 502,
            headers: { ...cors, "Content-Type": "application/json" },
          },
        );
      }

      const data = (await apiResp.json()) as {
        content?: Array<{ type: string; text?: string }>;
        usage?: {
          input_tokens?: number;
          output_tokens?: number;
          cache_creation_input_tokens?: number;
          cache_read_input_tokens?: number;
        };
      };

      // Log cache effectiveness — visible via `wrangler tail`. Disable in production by
      // commenting out if it becomes too noisy.
      if (data.usage) {
        console.log(
          JSON.stringify({
            in: data.usage.input_tokens,
            out: data.usage.output_tokens,
            cache_write: data.usage.cache_creation_input_tokens,
            cache_read: data.usage.cache_read_input_tokens,
          }),
        );
      }

      const textBlocks = (data.content || []).filter((b) => b.type === "text");
      const responseText = textBlocks.map((b) => b.text || "").join("");

      return new Response(JSON.stringify({ content: responseText }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ error: "Worker error", detail: msg }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};
