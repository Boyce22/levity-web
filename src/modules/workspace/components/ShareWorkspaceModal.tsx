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
import { Select, SelectOption } from "@/modules/shared/components/Select";

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
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-(--app-text-muted) uppercase tracking-wider flex items-center gap-1.5 opacity-60">
                    <Users className="w-3 h-3" /> Max Uses
                  </label>
                  <Select
                    value={maxUses}
                    onChange={setMaxUses}
                    className="w-full"
                    triggerClassName="w-full"
                    options={[
                      { value: 1, label: "1 person" },
                      { value: 5, label: "5 people" },
                      { value: 10, label: "10 people" },
                      { value: 25, label: "25 people" },
                      { value: 100, label: "100 people" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-(--app-text-muted) uppercase tracking-wider flex items-center gap-1.5 opacity-60">
                    <Clock className="w-3 h-3" /> Expiration
                  </label>
                  <Select
                    value={duration}
                    onChange={setDuration}
                    className="w-full"
                    triggerClassName="w-full"
                    options={[
                      { value: 1, label: "1 hour" },
                      { value: 24, label: "1 day" },
                      { value: 72, label: "3 days" },
                      { value: 168, label: "7 days" },
                      { value: 720, label: "30 days" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-(--app-text-muted) uppercase tracking-wider flex items-center gap-1.5 opacity-60">
                  <Shield className="w-3 h-3" /> Assign Role
                </label>
                <Select
                  value={role}
                  onChange={setRole}
                  className="w-full"
                  triggerClassName="w-full"
                  options={[
                    { 
                      value: "member", 
                      label: "Member", 
                      icon: <Shield size={14} />, 
                      color: "#6366f1",
                      description: "Ideal for regular team members."
                    },
                    { 
                      value: "editor", 
                      label: "Editor", 
                      icon: <Shield size={14} />, 
                      color: "#60a5fa",
                      description: "Can edit details but cannot delete lists or cards."
                    },
                    { 
                      value: "viewer", 
                      label: "Viewer", 
                      icon: <Shield size={14} />, 
                      color: "#34d399",
                      description: "No editing permissions. Stakeholder mode."
                    },
                    { 
                      value: "admin", 
                      label: "Admin", 
                      icon: <Shield size={14} />, 
                      color: "#818cf8",
                      description: "Can manage members and workspace settings."
                    },
                    { 
                      value: "owner", 
                      label: "Owner", 
                      icon: <Shield size={14} />, 
                      color: "#fbbf24",
                      description: "Only one owner allowed. Invitations for this role are restricted.",
                      disabled: true
                    },
                  ]}
                />
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
