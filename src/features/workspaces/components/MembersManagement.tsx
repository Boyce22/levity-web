"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Mail, 
  Trash2, 
  ExternalLink, 
  Shield, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Copy,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWorkspaceInvitesAction, revokeInviteAction, removeMemberAction, updateMemberRoleAction } from "@/features/workspaces/server/actions";
import { Select } from "@/ui/components/Select";

const formatDate = (date: string | Date, pattern?: string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: pattern?.includes('HH') ? '2-digit' : undefined,
    minute: pattern?.includes('mm') ? '2-digit' : undefined,
  }).format(d);
};

interface Member {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface Invite {
  id: string;
  token: string;
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  createdAt: string;
  role: string;
}

interface Props {
  workspaceId: string;
  members: Member[];
  onOpenShare: () => void;
  initialInvites?: Invite[];
  currentUserId?: string;
}

export function MembersManagement({ workspaceId, members, onOpenShare, initialInvites = [], currentUserId }: Props) {
  const [activeTab, setActiveTab] = useState<"members" | "invites">("members");
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, [workspaceId]);

  const fetchInvites = async () => {
    setIsLoadingInvites(true);
    try {
      const data = await getWorkspaceInvitesAction(workspaceId);
      setInvites(data as any[]);
    } catch (err) {
      console.error("Failed to fetch invites", err);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    setRevokingToken(inviteId);
    try {
      await revokeInviteAction(workspaceId, inviteId);
      await fetchInvites();
    } catch (err) {
      console.error("Failed to revoke", err);
    } finally {
      setRevokingToken(null);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setUpdatingMemberId(memberId);
    try {
      await updateMemberRoleAction(workspaceId, memberId, newRole);
    } catch (err) {
      console.error("Failed to update role", err);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setRemovingMemberId(memberId);
    try {
      await removeMemberAction(workspaceId, memberId);
    } catch (err) {
      console.error("Failed to remove member", err);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/invite/${workspaceId}/${token}`;
    navigator.clipboard.writeText(url);
    // Could show a toast here
  };

  const activeInvites = invites.filter(i => new Date(i.expiresAt) > new Date() && i.currentUses < i.maxUses).length;
  const expiredInvites = invites.length - activeInvites;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-app-panel border-app-border-faint rounded-sm border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded-sm border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
              <Users size={20} />
            </div>
            <span className="rounded-sm bg-indigo-400/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-indigo-400 uppercase">Growth</span>
          </div>
          <h3 className="text-app-text text-2xl font-bold">{members.length}</h3>
          <p className="text-app-text-muted mt-1 text-xs">Total workspace members</p>
        </div>

        <div className="bg-app-panel border-app-border-faint rounded-sm border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
              <Mail size={20} />
            </div>
            <span className="rounded-sm bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Active</span>
          </div>
          <h3 className="text-app-text text-2xl font-bold">{activeInvites}</h3>
          <p className="text-app-text-muted mt-1 text-xs">Live invitation links</p>
        </div>

        <div className="bg-app-panel border-app-border-faint group flex cursor-pointer flex-col items-center justify-center rounded-sm border p-5 text-center shadow-sm transition-colors hover:border-indigo-500/40" onClick={onOpenShare}>
           <div className="rounded-full bg-indigo-600/10 p-3 text-indigo-400 transition-transform group-hover:scale-110">
             <Plus size={24} />
           </div>
           <p className="mt-2 text-sm font-bold text-indigo-400">Generate New Link</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-app-border-faint flex gap-8 border-b">
        <button 
          onClick={() => setActiveTab("members")}
          className={`relative pb-4 text-sm font-bold tracking-tight transition-colors ${activeTab === "members" ? "text-app-text" : "text-app-text-muted hover:text-app-text"}`}
        >
          Members ({members.length})
          {activeTab === "members" && (
            <motion.div layoutId="tabUnderline" className="absolute right-0 bottom-0 left-0 h-0.5 bg-indigo-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab("invites")}
          className={`relative pb-4 text-sm font-bold tracking-tight transition-colors ${activeTab === "invites" ? "text-app-text" : "text-app-text-muted hover:text-app-text"}`}
        >
          Invitation Links ({invites.length})
          {activeTab === "invites" && (
            <motion.div layoutId="tabUnderline" className="absolute right-0 bottom-0 left-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "members" ? (
          <motion.div 
            key="members-table"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-app-panel border-app-border-faint overflow-hidden rounded-sm border"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="bg-app-header/50 border-app-border-faint border-b">
                  <th className="text-app-text-muted px-6 py-4 text-[10px] font-bold tracking-widest uppercase">User</th>
                  <th className="text-app-text-muted px-6 py-4 text-[10px] font-bold tracking-widest uppercase">Project Role</th>
                  <th className="text-app-text-muted px-6 py-4 text-[10px] font-bold tracking-widest uppercase">Email Address</th>
                  <th className="text-app-text-muted px-6 py-4 text-[10px] font-bold tracking-widest uppercase">Joined On</th>
                  <th className="text-app-text-muted px-6 py-4 text-right text-[10px] font-bold tracking-widest uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-app-border-faint divide-y">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-app-hover/20 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} 
                          className="border-app-border-faint h-8 w-8 rounded-sm border object-cover"
                          alt={member.username} 
                        />
                        <div>
                          <p className="text-app-text text-sm font-bold">{member.displayName || member.username}</p>
                          <p className="text-app-text-muted text-[11px] opacity-60">@{member.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={member.role}
                        disabled={member.role === 'owner' || member.id === currentUserId}
                        onChange={(val) => handleUpdateRole(member.id, val as string)}
                        isLoading={updatingMemberId === member.id}
                        size="sm"
                        triggerClassName="w-[120px] bg-app-hover/10 border-app-border-faint hover:bg-app-hover/20 shadow-none border"
                        options={[
                          { 
                            value: "owner", 
                            label: "Owner", 
                            icon: <Shield size={12} />, 
                            color: "#fbbf24",
                            disabled: member.role !== 'owner' // Only the current owner can have the owner role
                          },
                          { 
                            value: "admin", 
                            label: "Admin", 
                            icon: <Shield size={12} />, 
                            color: "#818cf8"
                          },
                          { 
                            value: "editor", 
                            label: "Editor", 
                            icon: <Shield size={12} />, 
                            color: "#6366f1"
                          },
                          { 
                            value: "viewer", 
                            label: "Viewer", 
                            icon: <Shield size={12} />, 
                            color: "#34d399"
                          },
                        ]}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-app-text-muted text-[13px]">{member.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-app-text-muted flex items-center gap-2">
                         <Calendar size={14} />
                         <span className="text-[13px]">{formatDate(member.joinedAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'owner' && member.id !== currentUserId && (
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removingMemberId === member.id}
                          className="rounded-sm p-2 text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {removingMemberId === member.id ? <Clock size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      )}
                      {member.id === currentUserId && member.role !== 'owner' && (
                         <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-[10px] font-bold tracking-tighter text-red-500 uppercase hover:underline"
                         >
                           Leave Project
                         </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div 
            key="invites-table"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {invites.length === 0 ? (
                 <div className="bg-app-panel border-app-border-faint rounded-sm border p-12 text-center shadow-xl">
                    <Mail size={40} className="mx-auto mb-4 text-indigo-400/30" />
                    <h4 className="text-app-text text-lg font-bold">No active invites</h4>
                    <p className="text-app-text-muted mt-1 text-sm">Generated share links will appear here.</p>
                 </div>
            ) : (
              <div className="bg-app-panel border-app-border-faint overflow-hidden rounded-sm border">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="bg-app-header/50 border-app-border-faint border-b">
                      <th className="text-app-text-muted px-6 py-4 text-[10px] font-bold tracking-widest uppercase">Link Details</th>
                      <th className="text-app-text-muted px-6 py-4 text-[10px] font-bold tracking-widest uppercase">Usage</th>
                      <th className="text-app-text-muted px-6 py-4 text-[10px] font-bold tracking-widest uppercase">Role</th>
                      <th className="text-app-text-muted px-6 py-4 text-[10px] font-bold tracking-widest uppercase">Expirations</th>
                      <th className="text-app-text-muted px-6 py-4 text-[10px] font-bold tracking-widest uppercase">Status</th>
                      <th className="text-app-text-muted px-6 py-4 text-right text-[10px] font-bold tracking-widest uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-app-border-faint divide-y">
                    {invites.map((invite) => {
                      const isExpired = new Date(invite.expiresAt) < new Date();
                      const isRevoked = new Date(invite.expiresAt).getFullYear() === 2000;
                      const isFull = invite.currentUses >= invite.maxUses;
                      const isActive = !isExpired && !isFull && !isRevoked;

                      return (
                        <tr key={invite.id} className="hover:bg-app-hover/20 group transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="bg-app-bg border-app-border-faint rounded-sm border p-2 text-indigo-400">
                                   <ExternalLink size={14} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                     <p className="font-mono text-[13px] font-medium text-indigo-300">...{invite.token.slice(-8)}</p>
                                     <button onClick={() => copyToClipboard(invite.token)} className="rounded-sm p-1 text-indigo-400 transition-colors hover:bg-indigo-500/10" title="Copy URL">
                                       <Copy size={12} />
                                     </button>
                                  </div>
                                  <p className="text-app-text-muted mt-0.5 text-[10px] font-bold tracking-widest uppercase opacity-50">Created {formatDate(invite.createdAt)}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="space-y-1">
                                <div className="mb-1 flex justify-between text-[11px] font-bold">
                                   <span className="text-app-text">{invite.currentUses} / {invite.maxUses}</span>
                                   <span className="text-app-text-muted">{Math.round((invite.currentUses / invite.maxUses) * 100)}%</span>
                                </div>
                                <div className="bg-app-hover h-1 w-24 overflow-hidden rounded-full">
                                   <div 
                                      className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                      style={{ width: `${(invite.currentUses / invite.maxUses) * 100}%` }}
                                   />
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                                  invite.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 
                                  invite.role === 'editor' ? 'bg-blue-500/10 text-blue-400' : 
                                  invite.role === 'viewer' ? 'bg-emerald-500/10 text-emerald-400' : 
                                  'bg-slate-500/10 text-slate-400'
                                }`}>
                                  {invite.role || 'member'}
                                </span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-[13px]">
                             <div className="flex flex-col gap-1">
                                <div className="text-app-text-muted flex items-center gap-1.5">
                                   <Clock size={12} />
                                   <span>{isRevoked ? 'Manually Revoked' : formatDate(invite.expiresAt, 'HH:mm')}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             {isActive ? (
                               <div className="flex items-center gap-1.5 text-emerald-400">
                                  <CheckCircle2 size={14} />
                                  <span className="text-[11px] font-bold tracking-wider uppercase">Active</span>
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 text-red-400 opacity-60">
                                  <XCircle size={14} />
                                  <span className="text-[11px] font-bold tracking-wider uppercase">{isRevoked ? 'Revoked' : isFull ? 'Exhausted' : 'Expired'}</span>
                               </div>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             {isActive && (
                               <button
                                 onClick={() => handleRevoke(invite.id)}
                                 disabled={revokingToken === invite.id}
                                 className="rounded-sm border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold tracking-widest text-red-500 uppercase transition-all hover:bg-red-500 hover:text-white disabled:opacity-50"
                               >
                                 {revokingToken === invite.id ? '...' : 'Revoke'}
                               </button>
                             )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

