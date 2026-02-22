import { motion } from "motion/react";
import PlanPreviewCard from "./PlanPreviewCard";
/**
 * ChatMessage
 * Props:
 *  - message: { id, role, content, rawResponse?, timestamp }
 *  - index: number
 *  - onSavePlan: (activities, notes) => void
 *  - onRevise: () => void
 */
export default function ChatMessage({ message, index, onSavePlan, onRevise }) {
  const isUser = message.role === "user";

  const hasPreview =
    !isUser &&
    message.rawResponse &&
    (
      (message.rawResponse.activities?.length > 0) ||
      (message.rawResponse.notes?.length > 0) ||
      (message.rawResponse.warnings?.length > 0)
    );

  const timeStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString("id-ID", {
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.15), ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`${isUser ? "max-w-[78%]" : "w-full max-w-[92%]"}`}>

        {/* AI label */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 ml-1">
            <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <span className="text-[8px] text-indigo-300">✦</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/25">Asisten</span>
            {timeStr && (
              <span className="text-[9px] text-white/15 font-medium">{timeStr}</span>
            )}
          </div>
        )}

        {/* Bubble */}
        {message.content && (
          <div
            className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
              ${isUser
                ? "bg-indigo-500 text-white font-medium rounded-2xl rounded-br-sm shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
                : "bg-white/[0.05] border border-white/[0.07] text-white/65 font-medium rounded-2xl rounded-bl-sm"
              }`}
          >
            {message.content}
          </div>
        )}

        {/* Plan preview card */}
        {hasPreview && (
          <PlanPreviewCard
            planData={message.rawResponse}
            messageId={message.id}
            onSave={onSavePlan}
            onRevise={onRevise}
          />
        )}

        {/* Timestamp (user only) */}
        {isUser && timeStr && (
          <p className="text-[9px] text-white/20 text-right mt-1 mr-1">{timeStr}</p>
        )}
      </div>
    </motion.div>
  );
}