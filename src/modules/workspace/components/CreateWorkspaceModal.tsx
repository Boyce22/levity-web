"use client";

import { useState } from "react";
import { Loader2, X, PlusCircle } from "lucide-react";
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
      setError("Workspace name is required.");
      return;
    }
    if (trimmed.length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(trimmed);
      setName("");
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Failed to create workspace.");
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
          className="relative w-full max-w-[380px] bg-(--app-bg) border border-(--app-border) rounded-sm shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-(--app-border-faint)">
            <h2 className="text-md font-bold text-(--app-text) tracking-tight flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-(--app-primary)" />
              Create Workspace
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-(--app-text-muted) hover:text-(--app-text) transition-colors p-1.5 hover:bg-(--app-panel) rounded-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-(--app-text-muted) uppercase tracking-wider opacity-60">
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
                  className={`w-full bg-(--app-panel) border rounded-sm px-3 py-2 text-sm text-(--app-text) focus:outline-none transition-all placeholder:text-(--app-text-muted) placeholder:opacity-50 ${error
                      ? "border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                      : "border-(--app-border-faint) focus:ring-2 focus:ring-(--app-primary)/20 focus:border-(--app-primary)"
                    }`}
                />
                {error && (
                  <p className="text-[12px] text-red-400 font-medium mt-1">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 shadow-lg shadow-indigo-950/20 focus:ring-4 focus:ring-indigo-500/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13.5px] font-bold rounded-sm transition-all"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 rounded-sm text-[13.5px] font-medium transition-all bg-(--app-panel) border border-(--app-border-faint) text-(--app-text-muted) hover:text-(--app-text) disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
