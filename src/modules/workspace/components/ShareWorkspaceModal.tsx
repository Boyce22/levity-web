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
  Shield,
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
  const [role, setRole] = useState("member");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await generateInviteAction(workspaceId, maxUses, duration, role);
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
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-(--app-bg) w-full max-w-[380px] rounded-sm shadow-[0_32px_80px_rgba(0,0,0,0.6)] border border-(--app-border) flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-(--app-border-faint)">
          <h2 className="text-md font-bold text-(--app-text) tracking-tight flex items-center gap-3">
            <Share2 className="w-5 h-5 text-(--app-primary)" /> Share Workspace
          </h2>
          <button
            onClick={onClose}
            className="text-(--app-text-muted) hover:text-(--app-text) transition-colors p-1.5 hover:bg-(--app-panel) rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-5 pb-6">
          <p className="text-[13.5px] text-(--app-text-muted) mb-5 leading-relaxed opacity-90">
            Invite colleagues to{" "}
            <strong className="text-(--app-text) font-semibold">
              {workspaceName || "this workspace"}
            </strong>
            . Anyone with this secure cryptographic link will be able to join as
            a full member.
          </p>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-[13.5px] flex items-start gap-2 text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!inviteUrl ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-(--app-text-muted) uppercase tracking-wider flex items-center gap-1.5 opacity-60">
                    <Users className="w-3 h-3" /> Max Uses
                  </label>
                  <select
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full bg-(--app-panel) border border-(--app-border-faint) rounded-sm px-3 py-1.5 text-[13px] text-(--app-text) focus:outline-none focus:ring-2 focus:ring-(--app-primary)/20 appearance-none cursor-pointer"
                  >
                    <option value={1}>1 person</option>
                    <option value={5}>5 people</option>
                    <option value={10}>10 people</option>
                    <option value={25}>25 people</option>
                    <option value={100}>100 people</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-(--app-text-muted) uppercase tracking-wider flex items-center gap-1.5 opacity-60">
                    <Clock className="w-3 h-3" /> Expiration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-(--app-panel) border border-(--app-border-faint) rounded-sm px-3 py-1.5 text-[13px] text-(--app-text) focus:outline-none focus:ring-2 focus:ring-(--app-primary)/20 appearance-none cursor-pointer"
                  >
                    <option value={1}>1 hour</option>
                    <option value={24}>1 day</option>
                    <option value={72}>3 days</option>
                    <option value={168}>7 days</option>
                    <option value={720}>30 days</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-(--app-text-muted) uppercase tracking-wider flex items-center gap-1.5 opacity-60">
                  <Shield className="w-3 h-3" /> Assign Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-(--app-panel) border border-(--app-border-faint) rounded-sm px-3 py-2 text-[13px] text-(--app-text) font-medium focus:outline-none focus:ring-2 focus:ring-(--app-primary)/20 appearance-none cursor-pointer"
                >
                  <option value="member">Member (Full editing)</option>
                  <option value="editor">Editor (Card updates only)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="admin">Admin (Workspace management)</option>
                </select>
                <p className="text-[10px] text-(--app-text-muted) italic px-0.5">
                  {role === 'member' && "Ideal for regular team members."}
                  {role === 'editor' && "Can edit details but cannot delete lists or cards."}
                  {role === 'viewer' && "No editing permissions. Perfect for stakeholders."}
                  {role === 'admin' && "Can manage members and workspace settings."}
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full mt-2 px-6 py-3 shadow-lg shadow-indigo-950/20 focus:ring-4 focus:ring-indigo-500/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13.5px] font-bold rounded-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
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
              <div className="flex items-center gap-2 p-1.5 bg-(--app-panel) border border-(--app-border-faint) rounded-sm shadow-sm focus-within:ring-[3px] focus-within:ring-(--app-primary)/20 transition-all">
                <input
                  readOnly
                  value={inviteUrl}
                  className="bg-transparent flex-1 min-w-0 px-3 py-2 text-[13.5px] text-(--app-text) focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 text-[14px] font-medium rounded-sm transition-colors shrink-0 ${copied ? "bg-[#10b981]/10 text-[#10b981]" : "bg-(--app-bg) hover:bg-(--app-border-faint) text-(--app-text)"}`}
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
              <p className="text-[12px] text-center text-(--app-text-muted) font-medium opacity-80 italic">
                This link allows up to {maxUses} uses and expires in {duration >= 24 ? `${duration/24} day(s)` : `${duration} hour(s)`}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
