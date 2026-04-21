'use client';

import { useState, useEffect } from "react";
import { Trash2, X, AlertTriangle, Loader2, Check, Settings } from "lucide-react";
import { updateWorkspaceAction as renameWorkspaceAction, deleteWorkspaceAction } from "@/features/workspaces/server/actions";
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
      await renameWorkspaceAction(workspace.id, { name });
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
      <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
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
          className="bg-app-bg border-app-border relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        >
          {/* Header */}
          <div className="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
            <h2 className="text-app-text flex items-center gap-3 text-base font-bold tracking-tight">
              <Settings className="text-app-primary h-5 w-5" />
              Workspace Settings
            </h2>
            <button
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm p-1.5 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-8 px-6 pt-5 pb-6">
            {/* Rename Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-app-text-muted text-[11px] font-bold tracking-wider uppercase opacity-60">
                  Workspace Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving || isDeleting}
                  placeholder="e.g. Engineering Board"
                  className="bg-app-panel border-app-border-faint text-app-text focus:ring-app-primary/20 focus:border-app-primary placeholder:text-app-text-muted w-full rounded-sm border px-3 py-2.5 text-sm transition-all placeholder:opacity-50 focus:ring-2 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || isDeleting || !name.trim() || name === workspace.name}
                className="flex w-full items-center justify-center gap-2 rounded-sm px-6 py-2.5 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: saved ? "#10b981" : 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" /> Changes Saved
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="border-app-border-faint space-y-4 border-t pt-6">
              <h3 className="text-[11px] font-bold tracking-wider text-red-500/80 uppercase">
                Danger Zone
              </h3>
              
              <p className="text-app-text-muted text-[13px] leading-relaxed opacity-90">
                Deleting this workspace will permanently remove all associated boards, lists, cards, and comments. This action cannot be undone.
              </p>

              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="bg-app-panel w-full rounded-sm border border-red-500/20 px-4 py-2.5 text-[13.5px] font-medium text-red-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 disabled:opacity-50"
                >
                  Delete Workspace...
                </button>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4 rounded-sm border border-red-500/20 bg-red-500/5 p-4 duration-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
                    <div>
                      <h4 className="text-[13.5px] font-bold text-red-400">Are you absolutely sure?</h4>
                      <p className="mt-1 text-[12px] text-red-400/70">This is a destructive and permanent action.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-red-500 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-red-600"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" /> Yes, Delete
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="text-app-text-muted hover:bg-app-panel border-app-border-faint flex-1 rounded-sm border px-4 py-2 text-[13px] font-medium transition-all"
                    >
                      Cancel
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

