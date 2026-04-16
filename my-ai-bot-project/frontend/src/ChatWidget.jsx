/**
 * ChatWidget.jsx  –  AI-CX Premium Support Widget
 * ─────────────────────────────────────────────────────────────────────────────
 * Stack  : React 18 · Tailwind CSS (CDN Play) · Framer Motion
 * Renders: Into window.__AICX_MOUNT_POINT__ (inside Shadow DOM)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
} from "react";
import ReactDOM from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";

// ─── Config (injected by widget-loader.js) ───────────────────────────────────
const CFG = window.__AICX_CONFIG__ || {
  apiUrl: "https://my-ai-bot-backend.onrender.com",
  theme: "dark",
  companyName: "Support",
  primaryColor: "#6C63FF",
  welcomeMessage: "Hi! I'm your AI assistant. How can I help you today?",
};

// ─── Design tokens ───────────────────────────────────────────────────────────
const TOKEN = {
  primary: CFG.primaryColor,
  glass: "rgba(12, 12, 28, 0.82)",
  glassHover: "rgba(20, 20, 45, 0.90)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(255,255,255,0.14)",
  surface: "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  textPrimary: "#F0EEFF",
  textSecondary: "rgba(240,238,255,0.55)",
  textMuted: "rgba(240,238,255,0.3)",
  userBubble: CFG.primaryColor,
  aiBubble: "rgba(255,255,255,0.06)",
  systemBubble: "rgba(250,204,21,0.08)",
  errorColor: "#f87171",
  successColor: "#34d399",
  dangerGradient: "linear-gradient(135deg, #f87171, #fb923c)",
  primaryGradient: `linear-gradient(135deg, ${CFG.primaryColor}, #60a5fa)`,
  fontMono: "'JetBrains Mono', monospace",
};

// ─── Framer Motion variants ───────────────────────────────────────────────────
const WIDGET_VARIANTS = {
  hidden: { opacity: 0, scale: 0.85, y: 24, transformOrigin: "bottom right" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.88,
    y: 20,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const MSG_VARIANTS = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 28 },
  },
};

const FAB_VARIANTS = {
  idle: { scale: 1 },
  hover: { scale: 1.08 },
  tap: { scale: 0.94 },
};

// ─── Utility: format timestamp ────────────────────────────────────────────────
const formatTime = (d) =>
  new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(d);

// ─── Quick-reply chips ────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  { label: "📦 Track Order", value: "How do I track my order?" },
  { label: "↩️ Returns", value: "What is your return policy?" },
  { label: "💳 Billing", value: "I have a billing question." },
  { label: "🛠️ Troubleshoot", value: "I need help troubleshooting an issue." },
  { label: "🙋 Talk to Human", value: "I want to speak to a human agent." },
  { label: "📋 File Complaint", value: "I want to register a complaint." },
];

// ─── SVG Icons (inline, no external dep) ─────────────────────────────────────
const Icon = {
  Bot: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4M8 15h.01M16 15h.01" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Minimize: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Dot: () => (
    <span style={{ display: "inline-flex", gap: "4px", alignItems: "center",
      color: TOKEN.textSecondary }}>
      <span className="aicx-dot" />
      <span className="aicx-dot" />
      <span className="aicx-dot" />
    </span>
  ),
  CheckDouble: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <polyline points="20 6 9 17 4 12" />
      <polyline points="16 6 11.3 11" />
    </svg>
  ),
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    variants={MSG_VARIANTS}
    initial="hidden"
    animate="visible"
    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
    style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "4px" }}
  >
    <div style={{
      width: 30, height: 30, borderRadius: "50%",
      background: TOKEN.primaryGradient,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon.Bot />
    </div>
    <div style={{
      background: TOKEN.aiBubble,
      border: `1px solid ${TOKEN.border}`,
      borderRadius: "18px 18px 18px 4px",
      padding: "12px 16px",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", gap: "4px",
      height: "44px",
    }}>
      <Icon.Dot />
    </div>
  </motion.div>
);

// ─── Complaint Form (rendered inside chat) ────────────────────────────────────
const ComplaintForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({ name: "", email: "", issue: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (form.issue.trim().length < 10) e.issue = "Please describe the issue (min 10 chars)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  const field = (key, label, type = "text", rows) => (
    <div style={{ marginBottom: "12px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: 600,
        color: TOKEN.textSecondary, marginBottom: "5px", letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>{label}</label>
      {rows ? (
        <textarea
          rows={rows}
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={inputStyle(!!errors[key])}
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={inputStyle(!!errors[key])}
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      )}
      {errors[key] && (
        <p style={{ fontSize: "10px", color: TOKEN.errorColor, marginTop: "4px" }}>
          {errors[key]}
        </p>
      )}
    </div>
  );

  const inputStyle = (hasError) => ({
    width: "100%", padding: "9px 12px",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${hasError ? TOKEN.errorColor : TOKEN.border}`,
    borderRadius: "10px",
    color: TOKEN.textPrimary,
    fontSize: "13px",
    transition: "border 0.2s",
    resize: "vertical",
    fontFamily: "'DM Sans', sans-serif",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{
        background: "rgba(20, 16, 50, 0.85)",
        border: `1px solid ${TOKEN.border}`,
        borderRadius: "16px", padding: "16px",
        backdropFilter: "blur(16px)",
        marginTop: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "8px",
          background: "rgba(248,113,113,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 20 20" fill={TOKEN.errorColor} width="14" height="14">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 700, color: TOKEN.textPrimary, margin: 0 }}>
            Register a Complaint
          </p>
          <p style={{ fontSize: "11px", color: TOKEN.textSecondary, margin: 0 }}>
            We'll get back to you within 24 hours
          </p>
        </div>
      </div>

      {field("name",  "Full Name")}
      {field("email", "Email Address", "email")}
      {field("issue", "Describe Your Issue", "text", 3)}

      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: "9px",
            background: TOKEN.surface,
            border: `1px solid ${TOKEN.border}`,
            borderRadius: "10px",
            color: TOKEN.textSecondary,
            fontSize: "13px", fontWeight: 600,
            transition: "background 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            flex: 2, padding: "9px",
            background: submitting ? "rgba(108,99,255,0.5)" : TOKEN.primaryGradient,
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "13px", fontWeight: 700,
            transition: "opacity 0.2s",
            opacity: submitting ? 0.7 : 1,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {submitting ? "Submitting…" : "Submit Complaint →"}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, onComplaintSubmit, onComplaintCancel }) => {
  const isUser   = msg.role === "user";
  const isSystem = msg.role === "system";
  const isAI     = msg.role === "assistant";

  if (msg.type === "complaint-form") {
    return (
      <motion.div variants={MSG_VARIANTS} initial="hidden" animate="visible">
        <ComplaintForm
          onSubmit={onComplaintSubmit}
          onCancel={onComplaintCancel}
        />
      </motion.div>
    );
  }

  if (isSystem) {
    return (
      <motion.div variants={MSG_VARIANTS} initial="hidden" animate="visible"
        style={{ textAlign: "center", margin: "8px 0" }}>
        <span style={{
          fontSize: "11px", padding: "4px 12px",
          background: TOKEN.systemBubble,
          border: `1px solid rgba(250,204,21,0.2)`,
          borderRadius: "99px", color: "#fbbf24",
          fontWeight: 500,
        }}>
          {msg.content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={MSG_VARIANTS}
      initial="hidden"
      animate="visible"
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: "8px",
        marginBottom: "4px",
      }}
    >
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: TOKEN.primaryGradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, color: "#fff",
        }}>
          <Icon.Bot />
        </div>
      )}
      {isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: "13px", fontWeight: 700, color: TOKEN.textPrimary,
        }}>
          U
        </div>
      )}

      {/* Bubble */}
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div style={{
          padding: "11px 14px",
          background: isUser
            ? TOKEN.userBubble
            : TOKEN.aiBubble,
          border: `1px solid ${isUser ? "transparent" : TOKEN.border}`,
          borderRadius: isUser
            ? "18px 18px 4px 18px"
            : "18px 18px 18px 4px",
          backdropFilter: isUser ? "none" : "blur(12px)",
          fontSize: "13.5px",
          lineHeight: "1.55",
          color: TOKEN.textPrimary,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: isUser
            ? `0 4px 20px ${CFG.primaryColor}44`
            : "0 2px 12px rgba(0,0,0,0.25)",
        }}>
          {msg.content}
        </div>
        {/* Timestamp + read receipt */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px",
          marginTop: "4px", color: TOKEN.textMuted, fontSize: "10px" }}>
          {isUser && <span style={{ color: TOKEN.successColor }}><Icon.CheckDouble /></span>}
          <span>{formatTime(msg.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main ChatWidget ───────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const [unread, setUnread]       = useState(1);
  const [hasOpened, setHasOpened] = useState(false);
  const [isError, setIsError]     = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const chatHistory = useRef([]); // persists across renders for API context
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Initialise welcome message ──────────────────────────────────────────────
  useEffect(() => {
    const welcome = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: CFG.welcomeMessage,
      timestamp: new Date(),
    };
    setMessages([welcome]);
  }, []);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  // ── Listen to programmatic open/close events from host page ────────────────
  useEffect(() => {
    const handlers = {
      "aicx:open":   () => handleOpen(),
      "aicx:close":  () => setIsOpen(false),
      "aicx:toggle": () => setIsOpen(p => !p),
      "aicx:sendMessage": (e) => e.detail?.text && sendMessage(e.detail.text),
    };
    Object.entries(handlers).forEach(([ev, fn]) => window.addEventListener(ev, fn));
    return () => Object.entries(handlers).forEach(([ev, fn]) => window.removeEventListener(ev, fn));
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setUnread(0);
    setHasOpened(true);
    setTimeout(() => inputRef.current?.focus(), 350);
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isTyping) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    // Update local history ref (sent to API for context)
    chatHistory.current.push({ role: "user", content: text.trim() });

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setIsError(false);

    try {
      const res = await fetch(`${CFG.apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: chatHistory.current }),
        signal: AbortSignal.timeout(30_000), // 30 s timeout
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const aiText = data.message || "Sorry, I couldn't process that.";
      const intent = data.intent || "general"; // "complaint" | "human" | "general"

      const aiMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiText,
        timestamp: new Date(),
      };

      chatHistory.current.push({ role: "assistant", content: aiText });
      setMessages(prev => [...prev, aiMsg]);

      // ── Intent routing ──────────────────────────────────────────────────────
      if ((intent === "complaint" || intent === "human") && !complaintSubmitted) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "system",
              content: "Opening complaint registration form…",
              timestamp: new Date(),
            },
            {
              id: crypto.randomUUID(),
              role: "assistant",
              type: "complaint-form",
              timestamp: new Date(),
            },
          ]);
        }, 600);
      }
    } catch (err) {
      console.error("[AI-CX Widget] API error:", err);
      setIsError(true);
      const errMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          err.name === "TimeoutError"
            ? "The request timed out. Please check your connection and try again."
            : "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, complaintSubmitted]);

  // ── Handle complaint form submit ─────────────────────────────────────────────
  const handleComplaintSubmit = async (formData) => {
    try {
      const res = await fetch(`${CFG.apiUrl}/api/complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      // Remove the form message, replace with success
      setMessages(prev => prev.filter(m => m.type !== "complaint-form"));
      setComplaintSubmitted(true);

      const ticketId = data.ticketId || `TKT-${Math.floor(Math.random() * 90000) + 10000}`;
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: `✅ Complaint registered! Ticket ID: ${ticketId}`,
          timestamp: new Date(),
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Your complaint has been logged successfully. Our support team will reach out to **${formData.email}** within 24 hours. Is there anything else I can help you with?`,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.type !== "complaint-form"),
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, there was an error submitting your complaint. Please try again.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleComplaintCancel = () => {
    setMessages(prev => prev.filter(m => m.type !== "complaint-form"));
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "No problem! Is there anything else I can help you with?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasComplaintForm = messages.some(m => m.type === "complaint-form");

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
return (
  <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999, overflow: "visible", fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── FAB Button ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            variants={FAB_VARIANTS}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 20 } }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.18 } }}
            whileHover="hover"
            whileTap="tap"
            onClick={handleOpen}
            aria-label="Open AI Support"
            style={{
              position: "absolute",
              bottom: "24px",
              right: "24px",
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: TOKEN.primaryGradient,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 32px ${CFG.primaryColor}60, 0 2px 8px rgba(0,0,0,0.4)`,
              cursor: "pointer",
              border: "none",
            }}
          >
            {/* Pulse ring */}
            <motion.div
              className="aicx-pulse-ring"
              style={{
                position: "absolute",
                width: 60, height: 60,
                borderRadius: "50%",
                border: `2px solid ${CFG.primaryColor}`,
                pointerEvents: "none",
              }}
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              width="26" height="26">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <circle cx="9" cy="10" r="0.5" fill="currentColor" />
              <circle cx="12" cy="10" r="0.5" fill="currentColor" />
              <circle cx="15" cy="10" r="0.5" fill="currentColor" />
            </svg>
            {/* Notification badge */}
            {unread > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { type: "spring", stiffness: 500 } }}
                style={{
                  position: "absolute",
                  top: 0, right: 0,
                  width: 20, height: 20,
                  borderRadius: "50%",
                  background: "#f87171",
                  border: "2px solid rgba(12,12,28,0.9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 800, color: "#fff",
                }}
              >
                {unread}
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="widget"
            variants={WIDGET_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="aicx-glass"
            style={{
              position: "absolute",
              bottom: "24px",
              right: "24px",
              width: 380,
              height: 600,
              borderRadius: "24px",
              background: TOKEN.glass,
              border: `1px solid ${TOKEN.border}`,
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{
              padding: "16px 18px 14px",
              borderBottom: `1px solid ${TOKEN.border}`,
              background: "rgba(255,255,255,0.02)",
              display: "flex", alignItems: "center", gap: "12px",
              flexShrink: 0,
            }}>
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: "12px",
                background: TOKEN.primaryGradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 12px ${CFG.primaryColor}50`,
                flexShrink: 0,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  width="20" height="20">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4M8 15h.01M16 15h.01" />
                </svg>
              </div>
              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700,
                  color: TOKEN.textPrimary, lineHeight: 1.3 }}>
                  {CFG.companyName} AI
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: TOKEN.successColor,
                    boxShadow: `0 0 6px ${TOKEN.successColor}`,
                  }} />
                  <span style={{ fontSize: "11px", color: TOKEN.textSecondary }}>
                    Online · Powered by GPT-4o
                  </span>
                </div>
              </div>
              {/* Controls */}
              <div style={{ display: "flex", gap: "4px" }}>
                <motion.button
                  whileHover={{ background: TOKEN.surfaceHover }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: 30, height: 30, borderRadius: "8px",
                    background: TOKEN.surface,
                    border: `1px solid ${TOKEN.border}`,
                    color: TOKEN.textSecondary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Minimise"
                >
                  <Icon.Minimize />
                </motion.button>
                <motion.button
                  whileHover={{ background: "rgba(248,113,113,0.1)" }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: 30, height: 30, borderRadius: "8px",
                    background: TOKEN.surface,
                    border: `1px solid ${TOKEN.border}`,
                    color: TOKEN.textSecondary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Close"
                >
                  <Icon.Close />
                </motion.button>
              </div>
            </div>

            {/* ── Messages ───────────────────────────────────────────────── */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              scrollbarWidth: "thin",
            }}>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    onComplaintSubmit={handleComplaintSubmit}
                    onComplaintCancel={handleComplaintCancel}
                  />
                ))}
                {isTyping && <TypingIndicator key="typing" />}
              </AnimatePresence>
              <div ref={messagesEndRef} style={{ height: 1 }} />
            </div>

            {/* ── Quick Replies ───────────────────────────────────────────── */}
            {!hasComplaintForm && messages.length <= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                style={{
                  padding: "6px 14px 10px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                {QUICK_REPLIES.map((qr) => (
                  <motion.button
                    key={qr.value}
                    whileHover={{ background: TOKEN.surfaceHover, borderColor: TOKEN.borderHover, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage(qr.value)}
                    style={{
                      padding: "5px 10px",
                      background: TOKEN.surface,
                      border: `1px solid ${TOKEN.border}`,
                      borderRadius: "99px",
                      color: TOKEN.textSecondary,
                      fontSize: "11.5px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {qr.label}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* ── Input Area ─────────────────────────────────────────────── */}
            {!hasComplaintForm && (
              <div style={{
                padding: "10px 14px 16px",
                borderTop: `1px solid ${TOKEN.border}`,
                background: "rgba(255,255,255,0.015)",
                flexShrink: 0,
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "8px",
                  background: inputFocused
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${inputFocused ? TOKEN.borderHover : TOKEN.border}`,
                  borderRadius: "16px",
                  padding: "8px 8px 8px 14px",
                  transition: "all 0.2s",
                }}>
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      // Auto-grow
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Message AI support…"
                    disabled={isTyping}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      color: TOKEN.textPrimary,
                      fontSize: "13.5px",
                      lineHeight: "1.5",
                      resize: "none",
                      maxHeight: "100px",
                      overflow: "auto",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: input.trim() ? 1.06 : 1 }}
                    whileTap={{ scale: input.trim() ? 0.92 : 1 }}
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    aria-label="Send"
                    style={{
                      width: 36, height: 36, borderRadius: "10px",
                      background: input.trim()
                        ? TOKEN.primaryGradient
                        : "rgba(255,255,255,0.05)",
                      color: input.trim() ? "#fff" : TOKEN.textMuted,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s",
                      boxShadow: input.trim() ? `0 4px 12px ${CFG.primaryColor}50` : "none",
                    }}
                  >
                    <Icon.Send />
                  </motion.button>
                </div>
                {/* Footer note */}
                <p style={{
                  textAlign: "center", fontSize: "10px",
                  color: TOKEN.textMuted, marginTop: "6px", marginBottom: 0,
                }}>
                  AI can make mistakes · Powered by GPT-4o
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Entry point: mount into Shadow DOM ──────────────────────────────────────
const mountPoint = window.__AICX_MOUNT_POINT__;
if (mountPoint) {
  const root = ReactDOM.createRoot(mountPoint);
  root.render(<ChatWidget />);
} else {
  // Fallback for standalone dev (outside shadow DOM)
  const devMount = document.getElementById("aicx-root") || document.body;
  const root = ReactDOM.createRoot(devMount);
  root.render(<ChatWidget />);
}
