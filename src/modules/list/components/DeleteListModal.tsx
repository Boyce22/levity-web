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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--app-bg)] w-full max-w-[400px] rounded-[24px] shadow-[0_32px_80px_rgba(0,0,0,0.6)] border border-[var(--app-border)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-[var(--app-border-faint)]">
          <h2 className="text-md font-bold text-[var(--app-text)] tracking-tight flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-400" />
            Deletar lista
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors p-1.5 hover:bg-[var(--app-panel)] rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-8 space-y-5">
          <p className="text-[14px] text-[var(--app-text-muted)] leading-relaxed">
            Tem certeza que deseja deletar a lista{" "}
            <strong className="text-[var(--app-text)] font-semibold">
              &ldquo;{listTitle}&rdquo;
            </strong>
            ?
          </p>

          {cardCount > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[13.5px] flex items-start gap-2.5 text-amber-400 font-medium">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
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
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
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
