"use client";

import { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  X,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { generateInviteAction } from "@/modules/workspace/actions/members";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName?: string;
}

export default function ShareWorkspaceModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      // Hardcapped UX: 100 uses per default link in this interface
      const token = await generateInviteAction(workspaceId, 100);
      const url = `${window.location.origin}/invite/${token}`;
      setInviteUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate invite link.");
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
      <div className="bg-[var(--app-bg)] w-full max-w-[400px] rounded-[24px] shadow-[0_32px_80px_rgba(0,0,0,0.6)] border border-[var(--app-border)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-[var(--app-border-faint)]">
          <h2 className="text-md font-bold text-[var(--app-text)] tracking-tight flex items-center gap-3">
            <Share2 className="w-5 h-5 text-[var(--app-primary)]" /> Share Workspace
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors p-1.5 hover:bg-[var(--app-panel)] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pt-6 pb-8">
          <p className="text-[14px] text-[var(--app-text-muted)] mb-6 leading-relaxed">
            Invite colleagues to{" "}
            <strong className="text-[var(--app-text)] font-semibold">
              {workspaceName || "this workspace"}
            </strong>
            . Anyone with this secure cryptographic link will be able to join as
            a full member.
          </p>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[13.5px] flex items-start gap-2 text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!inviteUrl ? (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--app-primary)] shadow-sm focus:ring-[3px] focus:ring-[var(--app-primary)]/30 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating Secure Link...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" /> Create Invite Link
                </>
              )}
            </button>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-2 p-1.5 bg-[var(--app-panel)] border border-[var(--app-border-faint)] rounded-xl shadow-sm focus-within:ring-[3px] focus-within:ring-[var(--app-primary)]/20 transition-all">
                <input
                  readOnly
                  value={inviteUrl}
                  className="bg-transparent flex-1 px-3 py-2 text-[14.5px] text-[var(--app-text)] focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 text-[14px] font-medium rounded-lg transition-colors shrink-0 ${copied ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[var(--app-bg)] hover:bg-[var(--app-border-faint)] text-[var(--app-text)]"}`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-[12px] text-center text-[var(--app-text-muted)] font-medium opacity-80">
                Link expires automatically in 7 days and allows up to 100 uses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
