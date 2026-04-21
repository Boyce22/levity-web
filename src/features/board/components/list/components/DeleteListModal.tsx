"use client";

import { useState } from "react";
import { Trash2, X, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteListModalProps {
  isOpen: boolean;
  listTitle: string;
  cardCount: number;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function DeleteListModal({
  isOpen,
  listTitle,
  cardCount,
  onClose,
  onConfirm,
}: DeleteListModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 flex w-full max-w-[400px] flex-col overflow-hidden rounded-[24px] border border-[var(--app-border)] bg-[var(--app-bg)] shadow-[0_32px_80px_rgba(0,0,0,0.6)] duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--app-border-faint)] px-8 pt-8 pb-6">
          <h2 className="flex items-center gap-3 text-base font-bold tracking-tight text-[var(--app-text)]">
            <Trash2 className="h-5 w-5 text-red-400" />
            Deletar lista
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-panel)] hover:text-[var(--app-text)] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-8 pt-6 pb-8">
          <p className="text-[14px] leading-relaxed text-[var(--app-text-muted)]">
            Tem certeza que deseja deletar a lista{" "}
            <strong className="font-semibold text-[var(--app-text)]">
              &ldquo;{listTitle}&rdquo;
            </strong>
            ?
          </p>

          {cardCount > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-[13.5px] font-medium text-amber-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {cardCount === 1
                  ? "1 card dentro desta lista também será deletado permanentemente."
                  : `${cardCount} cards dentro desta lista também serão deletados permanentemente.`}
              </span>
            </div>
          )}

          <p className="text-[12px] text-[var(--app-text-muted)] opacity-80">
            Esta ação não pode ser desfeita.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                background: "var(--app-panel)",
                color: "var(--app-text-muted)",
                border: "1px solid var(--app-border-faint)",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "rgba(239,68,68,0.15)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(239,68,68,0.25)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Deletar lista
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
