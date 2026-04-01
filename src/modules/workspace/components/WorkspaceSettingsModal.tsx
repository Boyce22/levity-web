'use client';

import { useState, useEffect } from 'react';
import { Settings, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { renameWorkspaceAction, deleteWorkspaceAction } from '@/modules/workspace/actions/workspace';
import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspace: { id: string; name: string } | undefined;
}

export default function WorkspaceSettingsModal({ isOpen, onClose, workspace }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (workspace && isOpen) {
      setName(workspace.name);
      setDeleteConfirm(false);
    }
  }, [workspace, isOpen]);

  if (!isOpen || !workspace) return null;

  const handleSave = async () => {
    if (!name.trim() || name === workspace.name) return;
    setIsSaving(true);
    try {
      await renameWorkspaceAction(workspace.id, name);
      onClose();
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
      router.push('/');
      onClose();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1c1c1e] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/2">
          <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" /> Workspace Settings
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Workspace Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={isSaving}
              className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              placeholder="E.g. Engineering Board"
            />
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={isSaving || !name.trim() || name === workspace.name}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>

          <div className="pt-5 border-t border-white/5">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Danger Zone</h3>
              <p className="text-xs text-white/40">Deleting a workspace will permanently delete all associated lists, cards, and comments. This action cannot be undone.</p>
              
              {!deleteConfirm ? (
                <button 
                  onClick={() => setDeleteConfirm(true)}
                  className="mt-2 text-left w-fit px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-xl border border-red-500/20 transition-colors"
                >
                  Delete Workspace...
                </button>
              ) : (
                <div className="mt-2 flex flex-col md:flex-row items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <span className="text-sm text-red-400 font-medium">Are you absolutely sure?</span>
                  <div className="flex-1"></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDeleteConfirm(false)} className="px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleDelete} disabled={isDeleting} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg flex items-center gap-2">
                      {isDeleting ? "Deleting..." : <><Trash2 className="w-3.5 h-3.5" /> Confirm</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
