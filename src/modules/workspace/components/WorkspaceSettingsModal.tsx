'use client';

import { useState, useEffect } from "react";
import { Trash2, X, AlertTriangle, Loader2, Check, Settings } from "lucide-react";
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
          className="relative w-full max-w-[420px] bg-(--app-bg) border border-(--app-border) rounded-sm shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-(--app-border-faint)">
            <h2 className="text-md font-bold text-(--app-text) tracking-tight flex items-center gap-3">
              <Settings className="w-5 h-5 text-(--app-primary)" />
              Workspace Settings
            </h2>
            <button
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="text-(--app-text-muted) hover:text-(--app-text) transition-colors p-1.5 hover:bg-(--app-panel) rounded-sm disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 pt-5 pb-6 space-y-8">
            {/* Rename Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-(--app-text-muted) uppercase tracking-wider opacity-60">
                  Workspace Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving || isDeleting}
                  placeholder="e.g. Engineering Board"
                  className="w-full bg-(--app-panel) border border-(--app-border-faint) rounded-sm px-3 py-2.5 text-sm text-(--app-text) focus:outline-none focus:ring-2 focus:ring-(--app-primary)/20 focus:border-(--app-primary) transition-all placeholder:text-(--app-text-muted) placeholder:opacity-50"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || isDeleting || !name.trim() || name === workspace.name}
                className="flex items-center justify-center gap-2 w-full px-6 py-2.5 shadow-lg shadow-indigo-950/20 focus:ring-4 focus:ring-indigo-500/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13.5px] font-bold rounded-sm transition-all"
                style={{ background: saved ? "#10b981" : 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" /> Changes Saved
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-(--app-border-faint) space-y-4">
              <h3 className="text-[11px] font-bold text-red-500/80 uppercase tracking-wider">
                Danger Zone
              </h3>
              
              <p className="text-[13px] text-(--app-text-muted) leading-relaxed opacity-90">
                Deleting this workspace will permanently remove all associated boards, lists, cards, and comments. This action cannot be undone.
              </p>

              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="w-full px-4 py-2.5 rounded-sm text-[13.5px] font-medium transition-all bg-(--app-panel) border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-50"
                >
                  Delete Workspace...
                </button>
              ) : (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-[13.5px] font-bold text-red-400">Are you absolutely sure?</h4>
                      <p className="text-[12px] text-red-400/70 mt-1">This is a destructive and permanent action.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold rounded-sm transition-all shadow-sm"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" /> Yes, Delete
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 text-[13px] font-medium text-(--app-text-muted) hover:bg-(--app-panel) border border-(--app-border-faint) rounded-sm transition-all"
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
