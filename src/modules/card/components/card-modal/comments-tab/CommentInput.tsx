import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useMentions } from "@/modules/card/hooks/useMentions";

interface CommentInputProps {
  avatarUrl: string;
  onPost: (text: string, parentId?: string | null) => void;
  replyingTo: any | null;
  onCancelReply: () => void;
  allUsers: any[];
}

export function CommentInput({ avatarUrl, onPost, replyingTo, onCancelReply, allUsers }: CommentInputProps) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    mentionState,
    setMentionState,
    handleMentionTextChange,
    handleMentionSelect,
    handleMentionKeyDown,
  } = useMentions(allUsers);

  useEffect(() => {
    if (textareaRef.current && replyingTo) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onPost(text, replyingTo?.id || null);
    setText("");
    setMentionState({ active: false, query: "", target: null, index: 0, filteredUsers: [] });
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
        style={{ border: "1.5px solid var(--app-border)" }}
      />
      <div
        className="flex-1 rounded-xl overflow-visible relative transition-all duration-300 focus-within:ring-2 z-20"
        style={{
          background: "var(--app-hover)",
          border: "1px solid var(--app-border)",
          ["--tw-ring-color" as string]: "var(--app-primary)",
        }}
      >
        <AnimatePresence>
          {mentionState.active && mentionState.filteredUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-2 z-9999 w-56 overflow-hidden py-1"
              style={{
                borderRadius: "14px",
                background: "var(--app-panel)",
                border: "1px solid var(--app-border)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
              }}
            >
              {mentionState.filteredUsers.map((u, i) => (
                <div
                  key={u.id}
                  onClick={() => {
                    handleMentionSelect(u, text, setText);
                    textareaRef.current?.focus();
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
                    className="w-5 h-5 rounded-full object-cover"
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
        </AnimatePresence>

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

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleMentionTextChange(e.target.value, "comment", e.target.selectionStart);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            replyingTo
              ? "Escreva sua resposta… @ para mencionar (⌘↵ para enviar)"
              : "Adicione um comentário… @ para mencionar (⌘↵ para enviar)"
          }
          className="w-full bg-transparent text-[14px] px-4 pt-3 pb-2 focus:outline-none resize-none leading-relaxed"
          style={{ color: "var(--app-text)" }}
          rows={3}
        />

        <div className="px-3 pb-3 flex justify-between items-center relative">
          <div className="flex gap-1">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: showEmojiPicker ? "var(--app-primary)" : "var(--app-text-muted)" }}
            >
              <Smile className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--app-text-muted)" }}>
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-2 z-9999 rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--app-border)" }}
              >
                <EmojiPicker
                  theme={Theme.DARK}
                  onEmojiClick={(data) => {
                    setText((prev) => prev + data.emoji);
                    setShowEmojiPicker(false);
                    textareaRef.current?.focus();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: text.trim() ? "var(--app-primary-muted)" : "var(--app-hover)",
              border: `1px solid ${text.trim() ? "var(--app-primary)" : "var(--app-border)"}`,
              color: text.trim() ? "var(--app-primary)" : "var(--app-text-muted)",
            }}
          >
            Enviar <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}