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
  Users,
  Clock,
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
  
  const [maxUses, setMaxUses] = useState(10);
  const [duration, setDuration] = useState(168); // 7 days in hours

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await generateInviteAction(workspaceId, maxUses, duration);
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
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Max Uses
                  </label>
                  <select
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full bg-[var(--app-panel)] border border-[var(--app-border-faint)] rounded-xl px-3 py-2 text-sm text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20 appearance-none cursor-pointer"
                  >
                    <option value={1}>1 person</option>
                    <option value={5}>5 people</option>
                    <option value={10}>10 people</option>
                    <option value={25}>25 people</option>
                    <option value={100}>100 people</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Expiration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-[var(--app-panel)] border border-[var(--app-border-faint)] rounded-xl px-3 py-2 text-sm text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20 appearance-none cursor-pointer"
                  >
                    <option value={1}>1 hour</option>
                    <option value={24}>1 day</option>
                    <option value={72}>3 days</option>
                    <option value={168}>7 days</option>
                    <option value={720}>30 days</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--app-primary)] shadow-md shadow-[var(--app-primary)]/10 focus:ring-4 focus:ring-[var(--app-primary)]/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" /> Create Secure Link
                  </>
                )}
              </button>
            </div>
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
              <p className="text-[12px] text-center text-[var(--app-text-muted)] font-medium opacity-80 italic">
                This link allows up to {maxUses} uses and expires in {duration >= 24 ? `${duration/24} day(s)` : `${duration} hour(s)`}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
