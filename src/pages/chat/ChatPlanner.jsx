import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, Sparkles } from "lucide-react";
import ChatMessage from "../../components/chat/ChatMessage";
import { aiService } from "../../services/ai/aiService";
import activityService from "../../services/app/activityService";
import noteService from "../../services/app/noteService";

/* ─────────────────────────────────────────
   Initial greeting
───────────────────────────────────────── */
const GREETING = {
  id:          "greeting",
  role:        "assistant",
  content:     "Hai! 👋 Hari esok mau kamu isi dengan apa?\n\nCeritain aja rencanamu secara bebas, misalnya:\n• \"Besok jam 9 ke rumah temen, malam ngerjain matematika\"\n• \"Ada kelas jam 10, lanjut organisasi jam 3\"\n• \"Sabtu pagi olahraga jam 7, ngepel jam 12\"",
  rawResponse: null,
  timestamp:   new Date(),
};

const SUGGESTIONS = [
  "Besok jam 9 ke rumah temen, jam 19 ngerjain matematika",
  "Ada rapat jam 10, makan siang jam 12, lanjut gym jam 17",
  "Sabtu olahraga pagi jam 7, ngepel lantai jam 12",
  "Hari ini capek banget, pengen istirahat dulu",
];

/* ─────────────────────────────────────────
   Typing indicator
───────────────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex justify-start"
    >
      <div className="flex items-center gap-2 ml-1">
        <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <span className="text-[8px] text-indigo-300">✦</span>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.07]">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/30 block"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   SavedToast
───────────────────────────────────────── */
function SavedToast({ count, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1,  y: 0,   scale: 1    }}
      exit={{ opacity: 0,    y: -12,  scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50
                 flex items-center gap-2.5 px-5 py-3 rounded-full
                 bg-green-500/15 border border-green-500/30
                 text-green-400 text-[11px] font-black
                 shadow-2xl shadow-black/50 backdrop-blur-sm"
    >
      <Sparkles size={12} />
      {count} aktivitas tersimpan ke jadwal!
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   ChatPage — UI sama persis, real API
═══════════════════════════════════════ */
export default function ChatPage() {
  const [messages,    setMessages]    = useState([GREETING]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [toast,       setToast]       = useState(null);
  const [showSuggest, setShowSuggest] = useState(true);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  /* ── Scroll to bottom on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 120) + "px";
  }, [input]);

  /* ── Send message → real API ── */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setShowSuggest(false);

    const userMsg = {
      id:          `u-${Date.now()}`,
      role:        "user",
      content:     text,
      rawResponse: null,
      timestamp:   new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Call real AI backend
      const parsed = await aiService.parsePrompt(text);

      const aiMsg = {
        id:          `a-${Date.now()}`,
        role:        "assistant",
        content:     parsed.message ?? "Berikut rencana yang aku buat:",
        rawResponse: parsed,
        timestamp:   new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errText = err?.response?.data?.message ?? "Koneksi ke AI gagal. Coba lagi ya!";
      setMessages((prev) => [
        ...prev,
        {
          id:          `a-${Date.now()}`,
          role:        "assistant",
          content:     errText,
          rawResponse: null,
          timestamp:   new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  /* ── Keyboard: Enter send, Shift+Enter newline ── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Save plan — PlanPreviewCard calls this with stripped activities + notes ──
     activities: camelCase objects ready for API (type: "schedule" | "task")
     notes: note objects ready for API
  ── */
  const handleSavePlan = useCallback(async (activities, notes) => {
    let savedCount = 0;
    console.log("Saving plan items:", { activities, notes });

    // Save activities (schedule & task type) — from AI → source: 'ai'
    for (const a of activities) {
      try {
        console.log("Saving activity:", a);
        await activityService.createActivity({ source: 'ai', ...a });
        savedCount++;
      } catch (err) {
        console.error("Gagal simpan aktivitas:", a.title, err);
      }
    }

    // Save notes
    for (const n of notes) {
      try {
        console.log("Saving note:", n);
        await noteService.createNote({ source: 'ai', ...n });
        savedCount++;
      } catch (err) {
        console.error("Gagal simpan catatan:", n.title, err);
      }
    }

    console.log("Total saved items:", savedCount);
    if (savedCount > 0) {
      setToast({ count: savedCount });
    }
  }, []);


  /* ── Revise: pre-fill input ── */
  const handleRevise = useCallback(() => {
    setInput("Tolong ubah rencananya, ");
    setTimeout(() => {
      textareaRef.current?.focus();
      const len = textareaRef.current?.value.length ?? 0;
      textareaRef.current?.setSelectionRange(len, len);
    }, 50);
  }, []);

  /* ── Use suggestion chip ── */
  const handleSuggestion = (text) => {
    setInput(text);
    setShowSuggest(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  return (
    <>
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <SavedToast count={toast.count} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>

      <div className="flex flex-col h-full min-h-0">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 flex items-end justify-between mb-6"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-0.5">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Rencanakan Harimu
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles size={10} className="text-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400">AI</span>
          </div>
        </motion.div>

        {/* ── Messages ── */}
        <div
          className="flex-1 min-h-0 overflow-y-auto space-y-5 pb-4
                     scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent"
        >
          {messages.map((msg, i) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              index={i}
              onSavePlan={handleSavePlan}
              onRevise={handleRevise}
            />
          ))}

          <AnimatePresence>
            {loading && <TypingIndicator />}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* ── Suggestion chips ── */}
        <AnimatePresence>
          {showSuggest && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="shrink-0 flex gap-2 flex-wrap mb-3"
            >
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSuggestion(s)}
                  className="text-left px-3.5 py-2 rounded-full
                             bg-white/[0.04] border border-white/[0.07]
                             text-[10px] font-bold text-white/35
                             hover:text-white/65 hover:bg-white/[0.07] hover:border-white/15
                             transition-all leading-snug"
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="shrink-0"
        >
          <div
            className={`flex items-end gap-3 px-4 py-3.5 rounded-3xl transition-all duration-200
              bg-white/[0.05] border
              ${input.length > 0
                ? "border-indigo-500/30 bg-indigo-500/[0.03]"
                : "border-white/[0.08]"
              }`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tulis rencanamu dengan bebas..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white/80 font-medium
                         placeholder:text-white/20 outline-none resize-none
                         leading-relaxed min-h-[1.5rem] max-h-[7.5rem]"
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className={`shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center transition-all
                ${input.trim() && !loading
                  ? "bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.4)] hover:shadow-[0_0_22px_rgba(99,102,241,0.55)]"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/20 border-t-white/70 rounded-full"
                />
              ) : (
                <ArrowUp size={15} />
              )}
            </motion.button>
          </div>

          <p className="text-center text-[9px] text-white/12 font-medium mt-2 tracking-wide">
            Enter untuk kirim · Shift+Enter baris baru
          </p>
        </motion.div>

      </div>
    </>
  );
}