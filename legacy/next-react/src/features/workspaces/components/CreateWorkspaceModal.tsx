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
      <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
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
          className="bg-app-bg border-app-border relative flex w-full max-w-[380px] flex-col overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        >
          {/* Header */}
          <div className="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
            <h2 className="text-app-text flex items-center gap-3 text-base font-bold tracking-tight">
              <PlusCircle className="text-app-primary h-5 w-5" />
              Create Workspace
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm p-1.5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-app-text-muted text-[11px] font-bold tracking-wider uppercase opacity-60">
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
                  className={`bg-app-panel text-app-text placeholder:text-app-text-muted w-full rounded-sm border px-3 py-2 text-sm transition-all placeholder:opacity-50 focus:outline-none ${error
                      ? "border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                      : "border-app-border-faint focus:ring-app-primary/20 focus:border-app-primary focus:ring-2"
                    }`}
                />
                {error && (
                  <p className="mt-1 text-[12px] font-medium text-red-400">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-sm px-6 py-3 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
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
                  className="bg-app-panel border-app-border-faint text-app-text-muted hover:text-app-text w-full rounded-sm border px-6 py-3 text-[13.5px] font-medium transition-all disabled:opacity-50"
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

