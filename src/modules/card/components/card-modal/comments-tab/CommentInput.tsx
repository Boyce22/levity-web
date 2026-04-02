import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMentions } from "@/modules/card/hooks/useMentions";

interface CommentInputProps {
  avatarUrl: string;
  onPost: (text: string, parentId?: string | null) => Promise<void> | void;
  replyingTo: any | null;
  onCancelReply: () => void;
  allUsers: any[];
}

export function CommentInput({ avatarUrl, onPost, replyingTo, onCancelReply, allUsers }: CommentInputProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, bottom: 0, left: 0, width: 0 });
  
  const {
    mentionState,
    setMentionState,
    handleMentionTextChange,
    handleMentionSelect,
    handleMentionKeyDown,
    textareaRef,
  } = useMentions(allUsers);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updatePos = () => {
      const el = textareaRef.current;
      if (mentionState.active && el) {
        const rect = el.getBoundingClientRect();
        setMenuPos({
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
    };
    
    if (mentionState.active) {
      updatePos();
      window.addEventListener("resize", updatePos, { passive: true });
      window.addEventListener("scroll", updatePos, { capture: true, passive: true });
    }
    
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, { capture: true } as any);
    };
  }, [mentionState.active, textareaRef]);

  useEffect(() => {
    if (textareaRef.current && replyingTo) {
      textareaRef.current.focus();
    }
  }, [replyingTo, textareaRef]);

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    const draft = text;
    setText("");
    setSubmitError("");
    setMentionState({ active: false, query: "", target: null, index: 0, filteredUsers: [] });
    setIsSubmitting(true);
    try {
      await onPost(draft, replyingTo?.id || null);
    } catch (err: any) {
      setText(draft);
      setSubmitError("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionState.active && mentionState.filteredUsers.length > 0) {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleMentionSelect(mentionState.filteredUsers[mentionState.index], text, setText);
        return;
      }
    }

    handleMentionKeyDown(e);
    
    if (!mentionState.active && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3 items-start">
      <img
        src={avatarUrl}
        className="w-8 h-8 rounded-sm object-cover shrink-0 mt-1 bg-[var(--app-panel)]"
        style={{ border: "1.5px solid var(--app-border-faint)" }}
      />
      <div
        className="flex-1 rounded-sm overflow-visible relative transition-all duration-300 focus-within:ring-2 z-20"
        style={{
          background: "var(--app-panel)",
          border: "1px solid var(--app-border)",
          ["--tw-ring-color" as string]: "var(--app-primary)",
        }}
      >
        {mounted && createPortal(
          <AnimatePresence>
            {mentionState.active && mentionState.filteredUsers.length > 0 && menuPos.bottom > 0 && (
              <motion.div
                key="mention-list"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="fixed z-[99999] overflow-hidden py-1 mt-2"
                style={{
                  top: menuPos.bottom + 8,
                  left: menuPos.left,
                  width: Math.max(menuPos.width, 220),
                  maxHeight: "30vh",
                  overflowY: "auto",
                  borderRadius: "6px",
                  background: "var(--app-panel)",
                  border: "1px solid var(--app-border)",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                }}
              >
                {mentionState.filteredUsers.map((u, i) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      handleMentionSelect(u, text, setText);
                    }}
                    onMouseEnter={() => setMentionState((p) => ({ ...p, index: i }))}
                    className="px-3 py-2.5 flex items-center gap-2.5 cursor-pointer transition-colors"
                    style={{
                      background: i === mentionState.index ? "var(--app-primary-muted)" : "transparent",
                    }}
                  >
                    <img
                      src={
                        u.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                      }
                      className="w-5 h-5 rounded-[4px] object-cover"
                    />
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: i === mentionState.index ? "var(--app-primary)" : "var(--app-text)",
                      }}
                    >
                      {u.display_name || u.username}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {replyingTo && (
          <div
            className="px-4 py-2 flex justify-between items-center text-[11px] rounded-t-xl"
            style={{
              background: "var(--app-border-faint)",
              borderBottom: "1px solid var(--app-border)",
              color: "var(--app-text-muted)",
            }}
          >
            <span>
              Respondendo para{" "}
              <span className="font-medium" style={{ color: "var(--app-text)" }}>
                @{replyingTo.users?.display_name || replyingTo.users?.username}
              </span>
            </span>
            <button onClick={onCancelReply}>✕</button>
          </div>
        )}

        <div className="relative min-h-[100px]">
          {/* Highlight Layer */}
          <div
            ref={(el) => {
              if (el && textareaRef.current) {
                el.scrollTop = textareaRef.current.scrollTop;
              }
            }}
            className="absolute inset-0 px-4 pt-3 pb-2 text-[14px] leading-relaxed whitespace-pre-wrap break-words pointer-events-none select-none overflow-hidden"
            style={{ 
              color: "var(--app-text)",
              fontFamily: "inherit",
              letterSpacing: "inherit",
            }}
          >
            {text.split(/(@\w+)/g).map((part, i) => {
              if (part.startsWith("@") && part.length > 1) {
                return (
                  <span
                    key={i}
                    className="px-1 -mx-1 rounded-md"
                    style={{
                      background: "var(--app-primary-muted)",
                      color: "var(--app-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {part}
                  </span>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            spellCheck={false}
            onChange={(e) => {
              setText(e.target.value);
              handleMentionTextChange(e.target.value, "comment", e.target.selectionStart || 0);
            }}
            onScroll={(e) => {
              const highlight = e.currentTarget.previousSibling as HTMLDivElement;
              if (highlight) highlight.scrollTop = e.currentTarget.scrollTop;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              replyingTo
                ? "Escreva sua resposta… @ para mencionar (⌘↵ para enviar)"
                : "Adicione um comentário… @ para mencionar (⌘↵ para enviar)"
            }
            className="w-full bg-transparent text-[13px] px-4 pt-3 pb-2 focus:outline-none resize-none leading-relaxed relative z-10 block cursor-text max-h-[120px] overflow-y-auto"
            style={{ 
              color: "var(--app-text)",
              fontFamily: "inherit",
              caretColor: "var(--app-text)",
              WebkitTextFillColor: "transparent",
            }}
            rows={3}
          />
        </div>

        <div className="px-3 pb-3 flex justify-between items-center relative">
          <div className="flex gap-1">
            <button className="p-1.5 rounded-sm transition-colors" style={{ color: "var(--app-text-muted)" }} title="Sugerência: Use Win + . para emojis nativos">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2 shadow-sm shadow-indigo-950/20 focus:ring-4 focus:ring-indigo-500/20 hover:brightness-110 text-white text-[13px] font-bold rounded-sm transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              text.trim()
                ? { background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }
                : { background: "var(--app-hover)", border: "1px solid var(--app-border)", color: "var(--app-text-muted)" }
            }
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
            ) : (
              <>Enviar <Send className="w-4 h-4" /></>
            )}
          </button>
        </div>
        {submitError && (
          <p className="px-3 pb-2 text-[11px] font-medium" style={{ color: "#f87171" }}>
            {submitError}
          </p>
        )}
      </div>
    </div>
  );
}