import { useState, useRef, useEffect, useCallback } from "react";
import { NAVY, GOLD, NAVY_LIGHT } from "../constants";
import {
  buildSystemPrompt,
  callGroq,
  FOLLOW_UP_PROMPT,
  parseFollowUps,
  getErrorMessage,
} from "../services/aiService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: NAVY_LIGHT,
            animation: `tdBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes tdBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded"
      style={{ color: NAVY_LIGHT }}
    >
      {copied ? "✓" : "copy"}
    </button>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div className="max-w-xs lg:max-w-2xl">
        {/* meta row */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? "justify-end" : "justify-start"}`}>
          {!isUser && <span className="text-xs font-semibold" style={{ color: GOLD }}>TIS AI</span>}
          <span className="text-xs text-gray-400">{msg.time}</span>
          {!isUser && <CopyButton text={msg.text} />}
        </div>

        {/* bubble */}
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
          style={
            isUser
              ? { background: NAVY, color: "white", borderBottomRightRadius: "4px" }
              : { background: "#f0f2f5", color: "#1e293b", borderBottomLeftRadius: "4px" }
          }
        >
          {msg.text}
          {msg.streaming && (
            <span
              className="inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded"
              style={{ background: GOLD, animation: "cursorBlink 0.8s step-end infinite" }}
            />
          )}
        </div>
      </div>
      <style>{`@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_MESSAGE = {
  role: "assistant",
  text: "Hi! Ask me anything about TIS project data — revenue, margins, clients, cities, ratings, and more.",
  time: timestamp(),
};

const DEFAULT_SUGGESTIONS = [
  "Which city has the most projects?",
  "Who is the top client by revenue?",
  "What is the overall profit margin?",
  "Which service earns the most revenue?",
  "Compare all services by margin.",
  "Which market segment is most profitable?",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function AskAI({ data }) {
  const [messages,    setMessages]    = useState([INITIAL_MESSAGE]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [streamingId, setStreamingId] = useState(null);

  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const systemPrompt = useRef(buildSystemPrompt(data));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setInput("");
    inputRef.current?.focus();

    const userMsg = { role: "user",      text: question, time: timestamp() };
    const aiMsgId = Date.now();
    const aiMsg   = { id: aiMsgId, role: "assistant", text: "", time: timestamp(), streaming: true };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setStreamingId(aiMsgId);
    setLoading(true);
    setSuggestions([]);

    const history = [...messages, userMsg]
      .slice(-10)
      .map(m => ({ role: m.role, content: m.text }));

    const apiMessages = [
      { role: "system", content: systemPrompt.current },
      ...history,
    ];

    try {
      let accumulated = "";
      await callGroq(apiMessages, chunk => {
        accumulated += chunk;
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, text: accumulated } : m)
        );
      });

      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, streaming: false } : m)
      );

      // fire-and-forget follow-up generation
      generateFollowUps(apiMessages, accumulated);

    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? { ...m, text: getErrorMessage(err), streaming: false, isError: true }
            : m
        )
      );
      setSuggestions(DEFAULT_SUGGESTIONS);
    } finally {
      setLoading(false);
      setStreamingId(null);
    }
  }, [input, loading, messages]);

  async function generateFollowUps(prevMessages, lastReply) {
    try {
      const msgs = [
        ...prevMessages,
        { role: "assistant", content: lastReply },
        { role: "user",      content: FOLLOW_UP_PROMPT },
      ];
      let raw = "";
      await callGroq(msgs, chunk => { raw += chunk; });
      const parsed = parseFollowUps(raw);
      setSuggestions(parsed.length > 0 ? parsed : DEFAULT_SUGGESTIONS);
    } catch {
      setSuggestions(DEFAULT_SUGGESTIONS);
    }
  }

  function clearChat() {
    setMessages([{ ...INITIAL_MESSAGE, time: timestamp() }]);
    setSuggestions(DEFAULT_SUGGESTIONS);
    setInput("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="p-6 h-full flex flex-col">

      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: NAVY }}>Ask AI 🤖</h1>
          <p className="text-sm text-gray-400">Ask questions about TIS project data</p>
        </div>
        <button
          onClick={clearChat}
          className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-red-50"
          style={{ borderColor: "#fca5a5", color: "#ef4444" }}
        >
          Clear chat
        </button>
      </div>

      {/* chat window — full width, no sidebar */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden min-h-0">

        {/* messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id ?? i} msg={msg} />
          ))}

          {/* typing dots while waiting for first chunk */}
          {loading && streamingId && messages.find(m => m.id === streamingId)?.text === "" && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl"
                style={{ background: "#f0f2f5", borderBottomLeftRadius: "4px" }}
              >
                <span className="text-xs font-semibold block mb-2" style={{ color: GOLD }}>TIS AI</span>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* follow-up suggestion chips */}
        {suggestions.length > 0 && !loading && (
          <div className="px-5 py-3 border-t border-gray-50 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all hover:border-yellow-400 hover:bg-yellow-50"
                style={{ borderColor: "#c8d8e8", color: "#374151" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* input bar */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#c8d8e8" }}
              placeholder="Ask something about the data..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: NAVY, color: "white" }}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskAI;
