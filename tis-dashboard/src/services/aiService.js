/**
 * aiService.js
 * Owns all AI / Groq API logic so AskAI.jsx stays focused on UI.
 *
 * Exports:
 *   buildSystemPrompt(data)          — rich context string for the LLM
 *   callGroq(messages, onChunk)      — streaming Groq call; calls onChunk(text) per chunk
 *   FOLLOW_UP_PROMPT                 — system instruction to generate follow-up questions
 *   parseFollowUps(text)             — extract follow-up list from AI response
 *   ERROR_MESSAGES                   — human-friendly error strings keyed by type
 */

import {
  getTotals,
  getProfitMargin,
  getAverageRating,
  groupByService,
  groupByCity,
  groupByClient,
  groupByMarket,
  topByRevenue,
  topByRating,
} from "./dataService";
import { formatCurrency } from "../constants";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";
const MODEL        = "llama-3.3-70b-versatile";

// ─── System prompt ────────────────────────────────────────────────────────────

/**
 * Build a rich system prompt that gives the LLM full context about the data.
 * We include per-service margins, market breakdown, city stats, top clients,
 * and best/worst performers so the AI can answer detailed questions.
 */
export function buildSystemPrompt(data) {
  const { revenue, cost, profit } = getTotals(data);
  const margin    = getProfitMargin(data).toFixed(1);
  const avgRating = getAverageRating(data);

  // Per-service breakdown
  const byService = groupByService(data);
  const serviceLines = byService
    .map(s =>
      `  • ${s.name.replace("_", " ")}: ${s.count} projects, ` +
      `revenue ${formatCurrency(s.revenue)}, margin ${s.margin.toFixed(1)}%, avg rating ${s.avgRating}`
    )
    .join("\n");

  // Per-city breakdown
  const byCity = groupByCity(data);
  const cityLines = byCity
    .map(c => `  • ${c.name}: ${c.count} projects, revenue ${formatCurrency(c.revenue)}`)
    .join("\n");

  // Top 5 clients
  const byClient = groupByClient(data);
  const clientLines = byClient.slice(0, 5)
    .map((c, i) =>
      `  ${i + 1}. ${c.name}: ${c.count} projects, revenue ${formatCurrency(c.revenue)}, ` +
      `profit ${formatCurrency(c.profit)}`
    )
    .join("\n");

  // Market segments
  const byMarket = groupByMarket(data);
  const marketLines = byMarket
    .map(m => `  • ${m.name}: ${m.count} projects, revenue ${formatCurrency(m.revenue)}`)
    .join("\n");

  // Best and worst performers
  const best  = topByRating(data, 1)[0];
  const worst = [...data].sort((a, b) => a.Rating - b.Rating)[0];
  const topRev = topByRevenue(data, 1)[0];

  return `You are TIS AI, a sharp business analyst assistant for True Infra Solutions (TIS), a construction and fit-out company based in NCR, India.

=== OVERALL SUMMARY ===
Total Projects : ${data.length}
Total Revenue  : ${formatCurrency(revenue)}
Total Cost     : ${formatCurrency(cost)}
Net Profit     : ${formatCurrency(profit)}
Profit Margin  : ${margin}%
Average Rating : ${avgRating} / 5.0

=== BY SERVICE ===
${serviceLines}

=== BY CITY ===
${cityLines}

=== TOP 5 CLIENTS (by revenue) ===
${clientLines}

=== MARKET SEGMENTS ===
${marketLines}

=== NOTABLE PROJECTS ===
Highest rated  : ${best?.Client_Name} (${best?.Service}, ${best?.City}) — ⭐ ${best?.Rating}
Lowest rated   : ${worst?.Client_Name} (${worst?.Service}, ${worst?.City}) — ⭐ ${worst?.Rating}
Highest revenue: ${topRev?.Client_Name} (${topRev?.Service}) — ${formatCurrency(topRev?.Revenue)}

=== INSTRUCTIONS ===
- Answer questions about this data concisely and accurately.
- Use plain text only — no markdown bold (**), headers (##), or bullet symbols unless listing items.
- Keep answers to 2–5 sentences unless a list is genuinely needed.
- If asked for a comparison or ranking, use the data above.
- If asked something unrelated to TIS data, politely decline and redirect.
- Speak in a professional but friendly tone.`;
}

// ─── Groq streaming call ──────────────────────────────────────────────────────

/**
 * Call the Groq API with streaming enabled.
 *
 * @param {Array<{role: string, content: string}>} messages  — full message history
 * @param {(chunk: string) => void}                onChunk   — called with each text delta
 * @returns {Promise<string>}                                — resolves with the full reply
 */
export async function callGroq(messages, onChunk) {
  if (!GROQ_API_KEY) {
    throw new Error("NO_KEY");
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 500,
      stream: true,
    }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const msg  = json.error?.message || "";
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 401) throw new Error("BAD_KEY");
    throw new Error(msg || `HTTP_${res.status}`);
  }

  // Read the SSE stream
  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText  = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

    for (const line of lines) {
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") break;
      try {
        const parsed = JSON.parse(raw);
        const delta  = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }
      } catch {
        // malformed chunk — skip
      }
    }
  }

  return fullText;
}

// ─── Follow-up question generation ───────────────────────────────────────────

/**
 * System prompt appended when asking the model to suggest follow-up questions.
 * We ask for exactly 3 short questions as a numbered list.
 */
export const FOLLOW_UP_PROMPT = `Based on the previous answer, suggest exactly 3 short follow-up questions the user might want to ask next. 
Output ONLY a numbered list like:
1. Question one?
2. Question two?
3. Question three?
No other text.`;

/**
 * Parse the numbered list returned by the follow-up prompt into a string array.
 * Handles both "1. text" and "1) text" formats.
 */
export function parseFollowUps(text) {
  return text
    .split("\n")
    .map(l => l.replace(/^\d+[.)]\s*/, "").trim())
    .filter(l => l.length > 5 && l.endsWith("?"))
    .slice(0, 3);
}

// ─── Human-friendly error messages ───────────────────────────────────────────

export const ERROR_MESSAGES = {
  NO_KEY:     "No API key found. Add VITE_GROQ_API_KEY to your .env file.",
  BAD_KEY:    "API key is invalid. Check your VITE_GROQ_API_KEY in .env.",
  RATE_LIMIT: "Rate limit hit. Wait a moment and try again.",
  NETWORK:    "Network error. Check your internet connection.",
  DEFAULT:    "Something went wrong. Please try again.",
};

export function getErrorMessage(err) {
  const code = err?.message;
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.DEFAULT;
}
