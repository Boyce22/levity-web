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
import { generateInviteAction } from "@/features/workspaces/server/actions";
import { Select, SelectOption } from "@/ui/components/Select";

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
      const token = await generateInviteAction(workspaceId, { maxUses, duration, role });
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
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-app-bg border-app-border animate-in fade-in zoom-in-95 flex w-full max-w-[380px] flex-col overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)] duration-200">
        <div className="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
          <h2 className="text-app-text flex items-center gap-3 text-base font-bold tracking-tight">
            <Share2 className="text-app-primary h-5 w-5" /> Share Workspace
          </h2>
          <button
            onClick={onClose}
            className="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-5 pb-6">
          <p className="text-app-text-muted mb-5 text-[13.5px] leading-relaxed opacity-90">
            Invite colleagues to{" "}
            <strong className="text-app-text font-semibold">
              {workspaceName || "this workspace"}
            </strong>
            . Anyone with this secure cryptographic link will be able to join as
            a full member.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-sm border border-red-500/20 bg-red-500/10 p-4 text-[13.5px] font-medium text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!inviteUrl ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-app-text-muted flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase opacity-60">
                    <Users className="h-3 w-3" /> Max Uses
                  </label>
                  <Select
                    value={maxUses}
                    onChange={(v) => setMaxUses(v as number)}
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

                <div className="flex flex-col space-y-1.5">
                  <label className="text-app-text-muted flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase opacity-60">
                    <Clock className="h-3 w-3" /> Expiration
                  </label>
                  <Select
                    value={duration}
                    onChange={(v) => setDuration(v as number)}
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

              <div className="flex flex-col space-y-1.5">
                <label className="text-app-text-muted flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase opacity-60">
                  <Shield className="h-3 w-3" /> Assign Role
                </label>
                <Select
                  value={role}
                  onChange={(v) => setRole(v as string)}
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
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm px-6 py-3 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4" /> Create Secure Link
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-app-panel border-app-border-faint focus-within:ring-app-primary/20 flex items-center gap-2 rounded-sm border p-1.5 shadow-sm transition-all focus-within:ring-[3px]">
                <input
                  readOnly
                  value={inviteUrl}
                  className="text-app-text min-w-0 flex-1 bg-transparent px-3 py-2 text-[13.5px] focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`flex shrink-0 items-center gap-2 rounded-sm px-4 py-2 text-[14px] font-medium transition-colors ${copied ? "bg-[#10b981]/10 text-[#10b981]" : "bg-app-bg hover:bg-app-border-faint text-app-text"}`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-app-text-muted text-center text-[12px] font-medium italic opacity-80">
                This link allows up to {maxUses} uses and expires in {duration >= 24 ? `${duration/24} day(s)` : `${duration} hour(s)`}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

