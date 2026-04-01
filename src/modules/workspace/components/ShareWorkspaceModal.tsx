'use client';

import { useState } from 'react';
import { Share2, Copy, Check, X, Link as LinkIcon, AlertCircle, Loader2 } from 'lucide-react';
import { generateInviteAction } from '@/modules/workspace/actions/members';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName?: string;
}

export default function ShareWorkspaceModal({ isOpen, onClose, workspaceId, workspaceName }: Props) {
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      // Hardcapped UX: 100 uses per default link in this interface
      const token = await generateInviteAction(workspaceId, 100);
      const url = `${window.location.origin}/invite/${token}`;
      setInviteUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate invite link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1c1c1e] w-full max-w-[420px] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" /> Share Workspace
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-white/50 mb-5 text-center leading-relaxed">
            Invite colleagues to <strong className="text-white/80">{workspaceName || 'this workspace'}</strong>. Anyone with this secure cryptographic link will be able to join as a full member.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] flex items-start gap-2 text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!inviteUrl ? (
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating Secure Link...</>
              ) : (
                <><LinkIcon className="w-4 h-4" /> Create Invite Link</>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1.5 bg-[#151515] border border-white/10 rounded-xl">
                <input 
                  readOnly 
                  value={inviteUrl} 
                  className="bg-transparent flex-1 px-3 py-1.5 text-sm text-white/70 focus:outline-none" 
                />
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors shrink-0 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
              </div>
              <p className="text-[11px] text-center text-white/30 font-medium">Link expires automatically in 7 days and allows up to 100 uses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
