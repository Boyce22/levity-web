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
import { getWorkspaceInvitesAction, revokeInviteAction } from "../actions/members";

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
  display_name: string;
  avatar_url: string;
  email: string;
  role: string;
  joined_at: string;
}

interface Invite {
  id: string;
  token: string;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  created_at: string;
  role: string;
}

interface Props {
  workspaceId: string;
  members: Member[];
  onOpenShare: () => void;
  initialInvites?: Invite[];
}

export function MembersManagement({ workspaceId, members, onOpenShare, initialInvites = [] }: Props) {
  const [activeTab, setActiveTab] = useState<"members" | "invites">("members");
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);

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

  const handleRevoke = async (token: string) => {
    setRevokingToken(token);
    try {
      await revokeInviteAction(workspaceId, token);
      await fetchInvites();
    } catch (err) {
      console.error("Failed to revoke", err);
    } finally {
      setRevokingToken(null);
    }
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    // Could show a toast here
  };

  const activeInvites = invites.filter(i => new Date(i.expires_at) > new Date() && i.current_uses < i.max_uses).length;
  const expiredInvites = invites.length - activeInvites;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-(--app-panel) border border-(--app-border-faint) rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-2 py-0.5 rounded-sm">Growth</span>
          </div>
          <h3 className="text-2xl font-bold text-(--app-text)">{members.length}</h3>
          <p className="text-xs text-(--app-text-muted) mt-1">Total workspace members</p>
        </div>

        <div className="p-5 bg-(--app-panel) border border-(--app-border-faint) rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Mail size={20} />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-sm">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-(--app-text)">{activeInvites}</h3>
          <p className="text-xs text-(--app-text-muted) mt-1">Live invitation links</p>
        </div>

        <div className="p-5 bg-(--app-panel) border border-(--app-border-faint) rounded-sm shadow-sm text-center flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/40 transition-colors group" onClick={onOpenShare}>
           <div className="p-3 rounded-full bg-indigo-600/10 text-indigo-400 group-hover:scale-110 transition-transform">
             <Plus size={24} />
           </div>
           <p className="text-sm font-bold text-indigo-400 mt-2">Generate New Link</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-(--app-border-faint) gap-8">
        <button 
          onClick={() => setActiveTab("members")}
          className={`pb-4 text-sm font-bold tracking-tight relative transition-colors ${activeTab === "members" ? "text-(--app-text)" : "text-(--app-text-muted) hover:text-(--app-text)"}`}
        >
          Members ({members.length})
          {activeTab === "members" && (
            <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab("invites")}
          className={`pb-4 text-sm font-bold tracking-tight relative transition-colors ${activeTab === "invites" ? "text-(--app-text)" : "text-(--app-text-muted) hover:text-(--app-text)"}`}
        >
          Invitation Links ({invites.length})
          {activeTab === "invites" && (
            <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
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
            className="bg-(--app-panel) border border-(--app-border-faint) rounded-sm overflow-hidden"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="bg-(--app-header)/50 border-b border-(--app-border-faint)">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted)">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted)">Project Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted)">Email Address</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted)">Joined On</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted) text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--app-border-faint)">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-(--app-hover)/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} 
                          className="w-8 h-8 rounded-sm object-cover border border-(--app-border-faint)"
                          alt={member.username} 
                        />
                        <div>
                          <p className="text-sm font-bold text-(--app-text)">{member.display_name || member.username}</p>
                          <p className="text-[11px] text-(--app-text-muted) opacity-60">@{member.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className={
                          member.role === 'owner' ? 'text-amber-400' : 
                          member.role === 'admin' ? 'text-indigo-400' : 
                          member.role === 'viewer' ? 'text-emerald-400' : 
                          'text-slate-400'
                        } />
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                          member.role === 'owner' ? 'bg-amber-500/10 text-amber-400' : 
                          member.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 
                          member.role === 'editor' ? 'bg-blue-500/10 text-blue-400' : 
                          member.role === 'viewer' ? 'bg-emerald-500/10 text-emerald-400' : 
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-(--app-text-muted)">{member.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-(--app-text-muted)">
                         <Calendar size={14} />
                         <span className="text-[13px]">{formatDate(member.joined_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-sm hover:bg-(--app-hover) text-(--app-text-muted) transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={16} />
                      </button>
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
                 <div className="p-12 text-center bg-(--app-panel) border border-(--app-border-faint) rounded-sm shadow-xl">
                    <Mail size={40} className="mx-auto text-indigo-400/30 mb-4" />
                    <h4 className="text-lg font-bold text-(--app-text)">No active invites</h4>
                    <p className="text-sm text-(--app-text-muted) mt-1">Generated share links will appear here.</p>
                 </div>
            ) : (
              <div className="bg-(--app-panel) border border-(--app-border-faint) rounded-sm overflow-hidden">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="bg-(--app-header)/50 border-b border-(--app-border-faint)">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted)">Link Details</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted)">Usage</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted)">Role</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted)">Expirations</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted)">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-(--app-text-muted) text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--app-border-faint)">
                    {invites.map((invite) => {
                      const isExpired = new Date(invite.expires_at) < new Date();
                      const isRevoked = new Date(invite.expires_at).getFullYear() === 2000;
                      const isFull = invite.current_uses >= invite.max_uses;
                      const isActive = !isExpired && !isFull && !isRevoked;

                      return (
                        <tr key={invite.id} className="hover:bg-(--app-hover)/20 transition-colors group">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="p-2 rounded-sm bg-(--app-bg) border border-(--app-border-faint) text-indigo-400">
                                   <ExternalLink size={14} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                     <p className="text-[13px] font-mono font-medium text-indigo-300">...{invite.token.slice(-8)}</p>
                                     <button onClick={() => copyToClipboard(invite.token)} className="p-1 rounded-sm hover:bg-indigo-500/10 text-indigo-400 transition-colors" title="Copy URL">
                                       <Copy size={12} />
                                     </button>
                                  </div>
                                  <p className="text-[10px] text-(--app-text-muted) uppercase font-bold tracking-widest mt-0.5 opacity-50">Created {formatDate(invite.created_at)}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold mb-1">
                                   <span className="text-(--app-text)">{invite.current_uses} / {invite.max_uses}</span>
                                   <span className="text-(--app-text-muted)">{Math.round((invite.current_uses / invite.max_uses) * 100)}%</span>
                                </div>
                                <div className="w-24 h-1 rounded-full bg-(--app-hover) overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                      style={{ width: `${(invite.current_uses / invite.max_uses) * 100}%` }}
                                   />
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
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
                                <div className="flex items-center gap-1.5 text-(--app-text-muted)">
                                   <Clock size={12} />
                                   <span>{isRevoked ? 'Manually Revoked' : formatDate(invite.expires_at, 'HH:mm')}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             {isActive ? (
                               <div className="flex items-center gap-1.5 text-emerald-400">
                                  <CheckCircle2 size={14} />
                                  <span className="text-[11px] font-bold uppercase tracking-wider">Active</span>
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 text-red-400 opacity-60">
                                  <XCircle size={14} />
                                  <span className="text-[11px] font-bold uppercase tracking-wider">{isRevoked ? 'Revoked' : isFull ? 'Exhausted' : 'Expired'}</span>
                               </div>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             {isActive && (
                               <button 
                                 onClick={() => handleRevoke(invite.token)}
                                 disabled={revokingToken === invite.token}
                                 className="px-3 py-1.5 rounded-sm bg-red-500/10 text-red-500 border border-red-500/20 text-[11px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                               >
                                 {revokingToken === invite.token ? '...' : 'Revoke'}
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
