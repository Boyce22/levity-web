"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void> | void;
}

export default function CreateWorkspaceModal({ isOpen, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("O nome é obrigatório.");
      return;
    }
    if (trimmed.length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(trimmed);
      setName("");
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Falha ao criar o workspace.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-[400px] z-10 flex flex-col overflow-hidden"
          style={{
            background: "var(--app-bg)",
            borderRadius: "24px",
            border: "1px solid var(--app-border)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-[var(--app-border-faint)] bg-[var(--app-bg)]">
            <h2 className="text-md font-bold text-[var(--app-text)] tracking-tight">
              Create New Workspace
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-panel)] transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col relative z-20">
            <div className="px-8 py-6 flex flex-col gap-3">
              <label className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--app-text-muted)] opacity-70 block">
                Workspace Name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Engineering Board"
                disabled={isSubmitting}
                className={`w-full bg-[var(--app-panel)] text-[var(--app-text)] rounded-xl px-4 py-3 text-[14.5px] border focus:outline-none focus:ring-[3px] transition-all placeholder:text-[var(--app-text-muted)] placeholder:opacity-50 shadow-sm ${error
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                  : "border-[var(--app-border-faint)] focus:border-[var(--app-primary)] focus:ring-[var(--app-primary)]/20"
                  }`}
              />
              {error && (
                <span className="text-[12px] text-red-400 font-medium mt-1">
                  {error}
                </span>
              )}
            </div>

            <div className="px-8 pt-5 pb-6 flex items-center justify-end gap-3 mt-2 bg-[var(--app-panel)]/30 border-t border-[var(--app-border-faint)]">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  onClose();
                }}
                disabled={isSubmitting}
                className="px-3 py-2 text-sm font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] bg-transparent hover:bg-[var(--app-panel)] rounded-lg transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all flex items-center gap-2 bg-[var(--app-primary)] disabled:opacity-50 hover:brightness-110 shadow-sm focus:ring-[3px] focus:ring-[var(--app-primary)]/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating
                  </>
                ) : (
                  "Create Workspace"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
