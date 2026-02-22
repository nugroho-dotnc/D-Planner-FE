import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pin, Trash2, Search, CalendarDays } from "lucide-react";
import GlassCard from "../../components/cards/GlassCard";
import { useNotes } from "../../hooks/useNotes";
import AddNoteModal from "../../components/notes/AddNoteModal";

const formatDate = (val) => {
  if (!val) return null;
  const iso = String(val).split("T")[0];
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
};

/* ─────────────────────────────────────────
   NoteCard — style asli dipertahankan
   Fix: tambah layoutId + layout prop
   agar Framer track kartu sebagai objek SAMA
   saat pindah posisi (pin/unpin) → tidak exit+enter
───────────────────────────────────────── */
const NoteCard = ({ note, onTogglePin, onRemove }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      layoutId={`note-${note.id}`}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={() => note.id && navigate(`/notes/${note.id}`)}
      className="cursor-pointer"
    >
    <GlassCard className="!p-5 bg-white/[0.03] border-white/5 flex flex-col gap-3 group h-full hover:border-white/10 hover:bg-white/[0.05] transition-all">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm text-white leading-snug flex-1 min-w-0 truncate">{note.title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onTogglePin(note.id)}
            title={note.isPinned ? "Unpin" : "Pin"}
            className={`p-1.5 rounded-lg transition-all ${note.isPinned ? "text-indigo-400 bg-indigo-500/20" : "text-white/30 hover:text-indigo-400 hover:bg-indigo-500/10"}`}
          >
            <motion.div animate={{ rotate: note.isPinned ? 45 : 0 }} transition={{ duration: 0.2 }}>
              <Pin size={13} />
            </motion.div>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onRemove(note.id)}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>
      {note.content && (
        <p className="text-xs text-white/55 leading-relaxed line-clamp-4">{note.content}</p>
      )}
      <div className="flex items-center justify-between text-[10px] font-medium mt-auto">
        <div className="flex items-center gap-1.5 text-white/20">
          {note.relatedDate ? (
            <>
              <CalendarDays size={9} />
              <span>{formatDate(note.relatedDate)}</span>
            </>
          ) : (
            <span>{note.createdAt ? new Date(note.createdAt).toLocaleDateString("id-ID") : ""}</span>
          )}
        </div>
        {note.isPinned && (
          <span className="text-indigo-400 font-black uppercase tracking-widest text-[8px]">Pinned</span>
        )}
      </div>
    </GlassCard>
    </motion.div>
  );
};

export default function Notes() {
  const [search,    setSearch]    = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { notes, isLoading, addNote, removeNote, togglePin } = useNotes();

  const filtered = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter((n) =>
      n.title.toLowerCase().includes(q) ||
      (n.content ?? "").toLowerCase().includes(q),
    );
  }, [notes, search]);

  /*
    FIX: jangan split jadi 2 array + 2 AnimatePresence.
    Cukup sort — pinned duluan, lalu newest first.
    Satu array → satu grid → satu AnimatePresence.
    layoutId di NoteCard yang handle shared layout transition.
  */
  const sorted = useMemo(() => (
    [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
    })
  ), [filtered]);

  const hasPinned = sorted.some((n) => n.isPinned);

  const handleAddSubmit = async (payload) => {
    try { await addNote(payload); }
    catch (err) { console.error("Add note error:", err); }
  };

  const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemV = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <>
      <motion.div className="pb-12" variants={containerV} initial="hidden" animate="visible">

        {/* Header */}
        <motion.div variants={itemV} className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-0.5">Personal</p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Notes</h1>
          </div>
          <motion.button
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.5)] transition-all"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Note</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemV} className="relative mb-6">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {isLoading && (
          <p className="text-xs text-white/20 text-center py-8 font-black uppercase tracking-widest">
            Loading notes...
          </p>
        )}

        {/* "Pinned" label — hanya muncul kalau ada pinned */}
        {hasPinned && (
          <motion.p layout variants={itemV} className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4 flex items-center gap-2">
            <Pin size={10} className="text-indigo-400 rotate-45" /> Pinned
          </motion.p>
        )}

        {/* Satu grid, satu AnimatePresence — ini kuncinya */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {sorted.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                onTogglePin={togglePin}
                onRemove={removeNote}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {!isLoading && sorted.length === 0 && (
          <GlassCard className="!p-12 text-center border-dashed border-white/10 bg-transparent">
            <p className="text-xs text-white/20 font-bold uppercase tracking-widest">
              {notes.length === 0 ? "No notes yet. Create your first one!" : "No notes match your search."}
            </p>
          </GlassCard>
        )}

      </motion.div>

      <AddNoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddSubmit}
      />
    </>
  );
}