import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Pencil, Trash2, Check, X, Pin,
  CalendarDays, AlignLeft, Info, Save, Clock
} from "lucide-react";
import { useSWRConfig } from "swr";

import GlassCard from "../../components/cards/GlassCard";
import noteService from "../../services/app/noteService";

/* ─────────────────────────────────────────
   Helpers
 ───────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return "—";
  const dateStr = String(iso).split("T")[0];
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};

const inputCls = `w-full bg-white/5 border border-white/[0.08] rounded-xl px-3 py-2.5
  text-sm font-bold text-white/80 placeholder:text-white/20
  outline-none focus:border-indigo-500/40 focus:bg-indigo-500/[0.04] transition-all`;

function FieldLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon size={10} className="text-white/25" />
      <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">{children}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Delete Confirm Dialog
 ───────────────────────────────────────── */
function DeleteConfirm({ title, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-8 md:pb-0"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.95 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{ opacity: 0,  y: 20,  scale: 0.95 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative z-10 w-full max-w-sm bg-[#0d1828] border border-white/10 rounded-3xl p-7 shadow-2xl shadow-black/70"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h3 className="text-base font-black text-white text-center mb-1">Delete Note?</h3>
        <p className="text-xs font-bold text-white/35 text-center mb-1 px-2 truncate">"{title}"</p>
        <p className="text-[10px] text-white/20 text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/[0.08] text-sm font-bold text-white/40 hover:bg-white/8 transition-all"
          >
            Cancel
          </button>
          <motion.button
            onClick={onConfirm}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-black
                       shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_28px_rgba(239,68,68,0.4)] transition-all"
          >
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   NotesDetail Page
 ───────────────────────────────────────── */
export default function NotesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();

  const [note, setNote] = useState(null);
  const [mode, setMode] = useState("view");
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  // Form state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editIsPinned, setEditIsPinned] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      noteService.getOneNote(id)
        .then((data) => {
          setNote(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch note error:", err);
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (mode === "edit" && note) {
      setEditTitle(note.title ?? "");
      setEditContent(note.content ?? "");
      setEditDate(note.relatedDate ? String(note.relatedDate).split("T")[0] : "");
      setEditIsPinned(note.isPinned ?? false);
    }
  }, [mode, note]);

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    const updated = {
      ...note,
      title: editTitle.trim(),
      content: editContent.trim() || null,
      relatedDate: editDate || null,
      isPinned: editIsPinned
    };

    try {
      await noteService.updateNote(note.id, updated);
      setNote(updated);
      mutate((key) => typeof key === "string" && key.includes("/api/notes"));
      setMode("view");
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 2500);
    } catch (err) {
      console.error("Gagal update note:", err);
    }
  };

  const handleTogglePin = async () => {
    try {
      const updated = await noteService.togglePin(note.id);
      setNote(updated);
      mutate((key) => typeof key === "string" && key.includes("/api/notes"));
    } catch (err) {
      console.error("Gagal toggle pin:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await noteService.deleteNote(note.id);
      mutate((key) => typeof key === "string" && key.includes("/api/notes"));
      navigate("/notes");
    } catch (err) {
      console.error("Gagal delete note:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
        />
        <p className="text-xs font-black uppercase tracking-widest text-white/20">Loading Note...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-bold text-white/40">Note not found.</p>
        <button onClick={() => navigate("/notes")} className="mt-4 text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto">
          <ArrowLeft size={12} /> Back to list
        </button>
      </div>
    );
  }

  const isEditing = mode === "edit";

  return (
    <>
      <motion.div
        className="pb-20 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/notes")}
            className="group flex items-center gap-2 text-white/30 hover:text-white transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
              <ArrowLeft size={16} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {saveFlash && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase text-green-400 tracking-wider mr-2"
                >
                  <Check size={10} strokeWidth={3} /> Change Saved
                </motion.div>
              )}
            </AnimatePresence>

            {!isEditing ? (
              <>
                <button
                  onClick={handleTogglePin}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${note.isPinned ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                >
                  <Pin size={16} className={note.isPinned ? "rotate-45" : ""} />
                </button>
                <button
                  onClick={() => setMode("edit")}
                  className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("view")}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-30"
                >
                  <Save size={12} /> Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Note Card */}
        <GlassCard className="!p-8 sm:!p-10 border-white/[0.08] relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
          
          {isEditing ? (
            <div className="space-y-6">
              {/* Edit Title */}
              <div>
                <FieldLabel icon={Info}>Title</FieldLabel>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full bg-transparent border-b border-indigo-500/30 pb-3 text-2xl sm:text-3xl font-black text-white placeholder:text-white/10 outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Edit Content */}
              <div>
                <FieldLabel icon={AlignLeft}>Content</FieldLabel>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={10}
                  className={`${inputCls} min-h-[300px] text-base leading-relaxed font-medium bg-white/[0.02] border-white/5`}
                />
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div>
                  <FieldLabel icon={CalendarDays}>Related Date</FieldLabel>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-end">
                   <button
                    onClick={() => setEditIsPinned(!editIsPinned)}
                    className={`flex items-center justify-center gap-2 w-full h-[41px] rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all
                      ${editIsPinned 
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                        : 'bg-white/5 text-white/20 border-white/10 hover:border-white/20'}`}
                  >
                    <Pin size={12} className={editIsPinned ? "rotate-45" : ""} /> {editIsPinned ? "Pinned" : "Pin Note"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* View Note */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {note.title}
                  </h1>
                  {note.isPinned && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
                      <Pin size={14} className="rotate-45" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-white/20">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                       <Clock size={11} /> 
                       {note.createdAt ? new Date(note.createdAt).toLocaleDateString("id-ID") : "No date"}
                    </div>
                    {note.source && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            Source: {note.source}
                        </div>
                    )}
                </div>
              </div>

              <div className="text-white/60 leading-relaxed text-lg font-medium whitespace-pre-wrap min-h-[200px]">
                {note.content || <span className="italic opacity-30">No content...</span>}
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-wrap gap-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Related Date</p>
                    <div className="flex items-center gap-2 text-white/40 font-bold text-sm">
                        <CalendarDays size={14} className="text-indigo-400/50" />
                        {formatDate(note.relatedDate)}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {showDelete && (
          <DeleteConfirm
            title={note.title}
            onConfirm={handleDelete}
            onCancel={() => setShowDelete(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}