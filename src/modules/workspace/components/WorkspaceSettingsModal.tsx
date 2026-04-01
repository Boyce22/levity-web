'use client';

import { useState, useEffect } from "react";
import { Trash2, X, AlertTriangle, Loader2, Check } from "lucide-react";
import { renameWorkspaceAction, deleteWorkspaceAction } from "@/modules/workspace/actions/workspace";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspace: { id: string; name: string } | undefined;
}

export default function WorkspaceSettingsModal({ isOpen, onClose, workspace }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (workspace && isOpen) {
      setName(workspace.name);
      setDeleteConfirm(false);
      setSaved(false);
    }
  }, [workspace, isOpen]);

  if (!isOpen || !workspace) return null;

  const handleSave = async () => {
    if (!name.trim() || name === workspace.name) return;
    setIsSaving(true);
    try {
      await renameWorkspaceAction(workspace.id, name);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkspaceAction(workspace.id);
      setIsDeleting(false);
      onClose();
      router.push("/");
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-[480px] z-10 flex flex-col overflow-hidden"
          style={{
            background: "var(--app-bg)",
            borderRadius: "24px",
            border: "1px solid var(--app-border)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 flex items-center justify-between">
            <h2 className="text-[22px] font-bold text-[var(--app-text)] tracking-tight">
              Configurações
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-panel)] transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="px-8 pb-4 flex flex-col">
            <h3 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[var(--app-text-muted)] mb-5 opacity-70">
              Workspace
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-[13.5px] text-[var(--app-text-muted)]">
                Nome do Workspace
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                className="w-full bg-[var(--app-panel)] text-[var(--app-text)] rounded-xl px-4 py-3 text-[14.5px] border border-[var(--app-border-faint)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-[3px] focus:ring-[var(--app-primary)]/20 transition-all placeholder:text-[var(--app-text-muted)] placeholder:opacity-50 shadow-sm"
                placeholder="E.g. Engineering Board"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim() || name === workspace.name}
                className="px-6 py-2.5 rounded-xl text-[14px] font-medium text-white transition-all flex items-center gap-2 hover:brightness-110 disabled:opacity-50 shadow-sm focus:ring-[3px] focus:ring-[var(--app-primary)]/30"
                style={{
                  background: saved ? "#10b981" : "var(--app-primary)",
                  transform: isSaving ? "scale(0.98)" : "scale(1)",
                }}
              >
                {saved ? (
                  <>
                    <Check size={16} strokeWidth={2.5} /> Salvo
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Salvando
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </div>
          </div>

          <div className="mx-8 border-t border-[var(--app-border-faint)] my-3 opacity-50" />

          {/* Danger Zone */}
          <div className="px-8 pt-4 pb-8 flex flex-col">
            <h3 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-red-500 mb-4 opacity-90">
              Danger Zone
            </h3>

            <div className="flex flex-col gap-4">
              <p className="text-[13.5px] text-[var(--app-text-muted)] leading-relaxed">
                Deletar este workspace apagará permanentemente todas as listas, cartões e comentários vinculados. Esta ação é irrecuperável.
              </p>

              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="mt-2 w-fit px-5 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 rounded-xl text-[14px] font-medium transition-colors focus:ring-[3px] focus:ring-red-500/20"
                >
                  Deletar Workspace...
                </button>
              ) : (
                <div className="mt-3 flex flex-col items-start gap-4 p-5 bg-[var(--app-panel)]/50 border border-red-500/30 rounded-2xl shadow-sm">
                  <span className="text-[14px] text-red-400 font-semibold align-middle flex items-center gap-2">
                    <AlertTriangle size={18} /> Você tem certeza absoluta?
                  </span>
                  <div className="flex items-center gap-3 w-full justify-end mt-2">
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="px-4 py-2 text-[14px] font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border-faint)] rounded-lg transition-colors focus:outline-none"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-5 py-2.5 bg-red-500 hover:bg-red-600 focus:ring-[3px] focus:ring-red-500/30 disabled:opacity-50 text-white text-[14px] font-medium rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <><Loader2 size={16} className="animate-spin" /> Deletando</>
                      ) : (
                        <><Trash2 size={16} /> Sim, deletar</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
