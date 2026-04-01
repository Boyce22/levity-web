'use client';

import { useState, useEffect, useRef } from 'react';
import { Card as CardType, updateCardDetailsAction } from '@/actions/board';
import { getCommentsAction, createCommentAction, Comment } from '@/actions/comments';
import { getCardHistoryAction } from '@/actions/history';
import { uploadImageAction } from '@/actions/upload';
import {
  X, ImagePlus, AlignLeft, MessageSquare, Send,
  Calendar, Tag, Trash2, Paperclip, Smile, Users, Check,
  Clock, ArrowRight, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import RichTextEditor from './RichTextEditor';

interface CardModalProps {
  card: CardType | null;
  onClose: () => void;
  onUpdate: (updatedCard: CardType) => void;
  currentUserAvatar: string;
  allUsers: any[];
}

type Tab = 'description' | 'comments';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ACTION_META: Record<string, { label: (field?: string) => string; color: string; dot: string }> = {
  updated: { label: f => `edited ${f || 'card'}`, color: 'rgba(99,102,241,0.15)', dot: '#6366f1' },
  assigned: { label: () => 'changed assignee', color: 'rgba(245,158,11,0.15)', dot: '#f59e0b' },
  created: { label: () => 'created this card', color: 'rgba(16,185,129,0.15)', dot: '#10b981' },
  moved: { label: f => `moved to ${f || '…'}`, color: 'rgba(59,130,246,0.15)', dot: '#3b82f6' },
};

function ActionPill({ type, field }: { type: string; field?: string }) {
  const meta = ACTION_META[type] ?? { label: () => type, color: 'rgba(255,255,255,0.06)', dot: '#fff' };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-white/55"
      style={{ background: meta.color }}>
      {meta.label(field)}
    </span>
  );
}

function formatMentions(text: string) {
  if (!text) return '';
  return text.replace(/(^|\s)(@\w+)/g, '$1[$2](#mention)');
}

const markdownComponents = {
  a: ({ node, href, children, ...props }: any) => {
    if (href === '#mention') {
      return (
        <span
          className="inline-flex items-center font-bold px-1.5 py-0.5 mx-0.5 rounded-md text-[0.9em] transition-all hover:scale-105 cursor-pointer"
          style={{
            background: 'rgba(99,102,241,0.15)',
            color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 2px 8px rgba(99,102,241,0.15)'
          }}
          {...props}
        >
          {children}
        </span>
      );
    }
    return <a href={href} className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  }
};

function CommentText({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > 255;
  const displayContent = !expanded && isLong ? content.slice(0, 255) + '...' : content;

  return (
    <>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {formatMentions(displayContent)}
      </ReactMarkdown>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[12.5px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors mt-0.5 inline-block"
        >
          {expanded ? 'Mostrar menos' : 'Ver mais'}
        </button>
      )}
    </>
  );
}

function CommentThread({
  comment,
  replies,
  index,
  onReplyClick
}: {
  comment: any;
  replies: any[];
  index: number;
  onReplyClick: (parent: any, targetUser: any) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const hasReplies = replies.length > 0;

  return (
    <div className="space-y-2">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="flex gap-3">
        <img src={comment.users?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.users?.username}`}
          className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
          style={{ border: '1.5px solid rgba(255,255,255,0.1)' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline mb-1.5">
            <span className="text-sm font-semibold text-white/85 mr-2">{comment.users?.display_name || comment.users?.username}</span>
            <span className="text-[11px] text-white/30">{timeAgo(comment.created_at)}</span>
          </div>
          <div className="text-[13.5px] text-white/70 leading-relaxed rounded-xl rounded-tl-none px-4 py-3 min-w-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', wordBreak: 'break-word' }}>
            <div className="prose prose-invert prose-sm max-w-none">
              <CommentText content={comment.content} />
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between">
            {hasReplies ? (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-[11px] font-semibold text-indigo-400/90 hover:text-indigo-300 transition-colors flex items-center gap-1.5 py-1 pr-2 rounded-lg"
              >
                {showReplies ? 'Ocultar respostas ▴' : `Ver ${replies.length} resposta${replies.length > 1 ? 's' : ''} ▾`}
              </button>
            ) : <div />}
            <button onClick={() => onReplyClick(comment, comment.users)} className="text-[11px] font-medium text-white/30 hover:text-indigo-400 transition-colors px-2 py-0.5 rounded hover:bg-white/5">
              Reply
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {hasReplies && showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-4 ml-4 space-y-4 border-l-2 border-indigo-500/20 mt-2 mb-4">
              {replies.map((reply, j) => (
                <div key={reply.id} className="flex gap-3 relative">
                  <img src={reply.users?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.users?.username}`}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-1"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline mb-1">
                      <span className="text-[13px] font-semibold text-white/80 mr-2">{reply.users?.display_name || reply.users?.username}</span>
                      <span className="text-[10px] text-white/30">{timeAgo(reply.created_at)}</span>
                    </div>
                    <div className="text-[13px] text-white/70 leading-relaxed min-w-0">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <CommentText content={reply.content} />
                      </div>
                    </div>
                    <div className="mt-1 flex justify-start">
                      <button onClick={() => onReplyClick(comment, reply.users)} className="text-[11px] font-medium text-white/30 hover:text-indigo-400 transition-colors py-0.5 px-2 hover:bg-white/5 rounded-md">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CardModal({ card, onClose, onUpdate, currentUserAvatar, allUsers }: CardModalProps) {
  const [description, setDescription] = useState(card?.description || '');
  const [coverUrl, setCoverUrl] = useState(card?.cover_url || '');
  const [content, setContent] = useState(card?.content || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [assigneeId, setAssigneeId] = useState<string | null>(card?.assignee_id || null);
  const [history, setHistory] = useState<any[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const [mentionState, setMentionState] = useState<{ active: boolean, query: string, target: 'desc' | 'comment' | null, index: number, filteredUsers: any[] }>({ active: false, query: '', target: null, index: 0, filteredUsers: [] });

  useEffect(() => {
    if (!card) return;
    (async () => {
      const [commentsData, historyData] = await Promise.all([
        getCommentsAction(card!.id, 3, null),
        getCardHistoryAction(card!.id),
      ]);
      setComments(commentsData);
      setHasMoreComments(commentsData.filter(c => !c.parent_id).length === 3);
      setHistory(historyData);
      setLoadingComments(false);
    })();
  }, [card?.id]);

  const handleLoadMoreComments = async () => {
    setIsLoadingMore(true);
    const parents = comments.filter(c => !c.parent_id);
    const oldestParent = parents[0]; // Assuming older comes first or adjust logic to fetch correct cursor
    const cursor = oldestParent ? oldestParent.created_at : null;

    if (cursor) {
      const moreComments = await getCommentsAction(card!.id, 3, cursor);
      // ✨ FIX 1: Anexando os novos comentários no final do array para expandir para baixo
      setComments(prev => [...prev, ...moreComments]);
      setHasMoreComments(moreComments.filter(c => !c.parent_id).length === 3);
    }
    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (!isEditingDesc) return;
    if (description === card?.description) { setSavedStatus('idle'); return; }
    setSavedStatus('saving');
    const t = setTimeout(async () => {
      await handleSave();
      setSavedStatus('saved');
      setTimeout(() => setSavedStatus('idle'), 2000);
    }, 1500);
    return () => clearTimeout(t);
  }, [description, isEditingDesc]);

  const handleMentionTextChange = (val: string, target: 'desc' | 'comment', cursorIdx: number) => {
    if (target === 'desc') setDescription(val);
    else setNewComment(val);

    const beforeCursor = val.slice(0, cursorIdx);
    const match = beforeCursor.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      const query = match[1];
      const filtered = allUsers.filter(u => u.username.toLowerCase().startsWith(query.toLowerCase()) || (u.display_name && u.display_name.toLowerCase().startsWith(query.toLowerCase()))).slice(0, 5);
      setMentionState({ active: true, query, target, index: 0, filteredUsers: filtered });
    } else {
      setMentionState(prev => ({ ...prev, active: false }));
    }
  };

  const handleMentionSelect = (user: any) => {
    if (!mentionState.active || !mentionState.target) return;
    const ref = mentionState.target === 'desc' ? descRef : commentRef;
    const val = mentionState.target === 'desc' ? description : newComment;
    const cursor = ref.current?.selectionStart || val.length;
    const textBefore = val.slice(0, cursor);
    const textAfter = val.slice(cursor);

    const match = textBefore.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      const replaceStart = textBefore.lastIndexOf('@' + mentionState.query);
      const newTextBefore = textBefore.slice(0, replaceStart) + `@${user.username} `;
      const finalVal = newTextBefore + textAfter;
      if (mentionState.target === 'desc') setDescription(finalVal);
      else setNewComment(finalVal);
      setMentionState(prev => ({ ...prev, active: false }));
      setTimeout(() => {
        ref.current?.focus();
        ref.current?.setSelectionRange(newTextBefore.length, newTextBefore.length);
      }, 0);
    }
  };

  const handleMentionKeyDown = (e: React.KeyboardEvent, target: 'desc' | 'comment') => {
    if (mentionState.active && mentionState.target === target && mentionState.filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionState(prev => ({ ...prev, index: (prev.index + 1) % prev.filteredUsers.length }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionState(prev => ({ ...prev, index: (prev.index - 1 + prev.filteredUsers.length) % prev.filteredUsers.length }));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleMentionSelect(mentionState.filteredUsers[mentionState.index]);
      } else if (e.key === 'Escape') {
        setMentionState(prev => ({ ...prev, active: false }));
      }
    }
  };

  if (!card) return null;

  const handleSave = async (explicitCoverUrl?: string, explicitAssignee?: string | null) => {
    const changes = {
      content,
      description,
      cover_url: explicitCoverUrl !== undefined ? explicitCoverUrl : coverUrl,
      assignee_id: explicitAssignee !== undefined ? explicitAssignee : assigneeId,
    };
    onUpdate({ ...card, ...changes });
    await updateCardDetailsAction(card.id, changes);
  };

  const toggleAssignee = async (userId: string) => {
    const next = assigneeId === userId ? null : userId;
    setAssigneeId(next);
    await handleSave(undefined, next);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const text = newComment;
    setNewComment('');
    try {
      const commentRes = await createCommentAction(card.id, newComment, replyingTo?.id || null);
      if (commentRes) {
        setComments(prev => [...prev, commentRes]);
      }
      setNewComment('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
    } catch (err: any) { console.error(err); }
  };



  const handleRemoveCover = async () => { setCoverUrl(''); await handleSave(''); };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'description', label: 'Description', icon: <AlignLeft className="w-3.5 h-3.5" /> },
    { id: 'comments', label: 'Comments', icon: <MessageSquare className="w-3.5 h-3.5" />, badge: comments.length },
  ];

  const sortedHistory = history
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70"
          style={{ backdropFilter: 'blur(12px)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full sm:max-w-[780px] sm:mx-4 flex flex-col z-10"
          style={{
            maxHeight: '92vh',
            borderRadius: '20px',
            background: '#151515',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          {/* COVER */}
          <AnimatePresence>
            {coverUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 200 }} exit={{ opacity: 0, height: 0 }}
                className="relative w-full overflow-hidden group shrink-0"
                style={{ borderRadius: '20px 20px 0 0' }}
              >
                <img src={coverUrl} className="w-full h-full object-cover" alt="Cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(21,21,21,0.95) 100%)' }} />
                <button onClick={handleRemoveCover}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/90"
                  style={{ background: 'rgba(239,68,68,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HEADER */}
          <div className="shrink-0 px-7 pt-6 pb-0">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/30 text-xs font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" /> My Workspace
                  </span>
                </div>

                {isEditingTitle ? (
                  <textarea ref={titleRef} value={content}
                    onChange={e => setContent(e.target.value)}
                    onBlur={() => { setIsEditingTitle(false); handleSave(); }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setIsEditingTitle(false); handleSave(); } }}
                    rows={1}
                    className="w-full bg-transparent text-[22px] font-bold text-white focus:outline-none resize-none leading-tight"
                  />
                ) : (
                  <h2 onClick={() => setIsEditingTitle(true)}
                    className="text-[22px] font-bold text-white leading-tight cursor-text hover:text-white/80 transition-colors truncate">
                    {content || <span className="text-white/20 font-normal italic">Untitled task…</span>}
                  </h2>
                )}

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-white/30 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {assigneeId && (() => {
                    const u = allUsers.find(u => u.id === assigneeId);
                    if (!u) return null;
                    return (
                      <>
                        <span className="text-white/10">|</span>
                        <div className="flex items-center gap-1.5">
                          <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                            className="w-4 h-4 rounded-full object-cover" style={{ border: '1px solid rgba(255,255,255,0.15)' }} />
                          <span className="text-white/40 text-xs">{u.display_name || u.username}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 mt-1 relative">
                <button onClick={() => setIsMembersOpen(!isMembersOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white/90 transition-all"
                  style={{ background: isMembersOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Members</span>
                </button>

                <AnimatePresence>
                  {isMembersOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                      className="absolute top-11 right-14 w-56 p-1.5 z-50"
                      style={{ borderRadius: '14px', background: '#1c1c1f', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                      <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Assign member</div>
                      <div className="space-y-0.5 max-h-48 overflow-y-auto">
                        {allUsers.map(u => (
                          <div key={u.id} onClick={() => toggleAssignee(u.id)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                            <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                              className="w-6 h-6 rounded-full object-cover" />
                            <span className="flex-1 text-[13px] text-white/80 truncate">{u.display_name || u.username}</span>
                            {assigneeId === u.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={onClose}
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-white/40 hover:text-white/80 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TABS */}
            <div className="flex mt-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="relative pb-3 px-1 mr-6 text-sm font-semibold transition-colors"
                  style={{ color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                  <span className="flex items-center gap-1.5">
                    {tab.icon}
                    {tab.label}
                    {tab.badge != null && tab.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                        {tab.badge}
                      </span>
                    )}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
            <AnimatePresence mode="wait">

              {/* ── DESCRIPTION + HISTORY ── */}
              {activeTab === 'description' && (
                <motion.div key="desc"
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4">

                  {/* Description editor / preview */}
                  {isEditingDesc ? (
                    <div className="space-y-3 relative z-20">
                      <RichTextEditor
                        initialValue={description}
                        onChange={(val) => {
                          setDescription(val);
                        }}
                      />

                      {/* Desc Mention Dropdown */}
                      <AnimatePresence>
                        {mentionState.active && mentionState.target === 'desc' && mentionState.filteredUsers.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute bottom-full left-4 mb-2 z-[9999] w-56 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
                          >
                            {mentionState.filteredUsers.map((u, i) => (
                              <div key={u.id} onClick={() => handleMentionSelect(u)} onMouseEnter={() => setMentionState(prev => ({ ...prev, index: i }))} className={`px-3 py-2.5 flex items-center gap-2.5 cursor-pointer transition-colors ${i === mentionState.index ? 'bg-indigo-500/20' : 'hover:bg-white/5'}`}>
                                <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-5 h-5 rounded-full object-cover" />
                                <span className={`text-xs ${i === mentionState.index ? 'text-indigo-400 font-bold' : 'text-white/80 font-medium'}`}>{u.display_name || u.username}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-mono">
                          {savedStatus === 'saving' ? <span className="text-amber-400 animate-pulse">Saving…</span>
                            : savedStatus === 'saved' ? <span className="text-emerald-400 font-semibold">✓ Saved</span>
                              : <span className="text-white/25">Markdown supported · auto-saves</span>}
                        </span>
                        <button onClick={() => setIsEditingDesc(false)}
                          className="px-4 py-1.5 text-sm font-medium text-white/50 hover:text-white/80 transition-colors">
                          Close Editor
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setIsEditingDesc(true)}
                      className="group cursor-text rounded-xl p-4 transition-all"
                      style={{ border: '1px dashed rgba(255,255,255,0.07)' }}>
                      {description ? (
                        <div className="prose prose-invert prose-sm max-w-none text-white/75 prose-p:leading-relaxed prose-headings:text-white/90">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {formatMentions(description)}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-white/25 text-sm italic">Add a description… Supports **Markdown**.</p>
                      )}
                      <p className="mt-3 text-xs text-indigo-400/60 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to edit
                      </p>
                    </div>
                  )}

                  {/* ── COLLAPSIBLE HISTORY ── */}
                  <div className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}>

                    {/* toggle header */}
                    <button
                      onClick={() => setHistoryOpen(v => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/3 group"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-[13px] font-semibold text-white/50 group-hover:text-white/70 transition-colors">
                          Edit history
                        </span>
                        {history.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                            {history.length}
                          </span>
                        )}
                      </div>
                      <motion.div
                        animate={{ rotate: historyOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
                      </motion.div>
                    </button>

                    {/* collapsible content */}
                    <AnimatePresence initial={false}>
                      {historyOpen && (
                        <motion.div
                          key="history-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="px-4 pb-4 pt-2"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {sortedHistory.length === 0 ? (
                              <p className="text-[12px] text-white/25 py-3 text-center italic">No edits recorded yet.</p>
                            ) : (
                              <ol className="relative pl-8 space-y-0 mt-1">
                                {/* vertical line */}
                                <div className="absolute left-[11px] top-2 bottom-2 w-px"
                                  style={{ background: 'rgba(255,255,255,0.06)' }} />

                                {sortedHistory.map((item, i) => {
                                  const user = allUsers.find(u => u.id === item.user_id) || item.users;
                                  const meta = ACTION_META[item.action_type];
                                  return (
                                    <motion.li key={item.id}
                                      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.025 }}
                                      className="relative pb-4 last:pb-0">

                                      {/* colored dot on line */}
                                      <span className="absolute -left-8 top-[5px] w-[22px] flex justify-center">
                                        <span className="w-2 h-2 rounded-full shrink-0 ring-2 ring-[#151515]"
                                          style={{
                                            background: meta?.dot ?? '#666',
                                            boxShadow: `0 0 0 3px #151515`,
                                          }} />
                                      </span>

                                      <div className="flex items-start gap-2 flex-wrap">
                                        {/* avatar */}
                                        {user && (
                                          <img
                                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                            className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                                          />
                                        )}
                                        <span className="text-[12.5px] font-semibold text-white/65 leading-snug">
                                          {user?.display_name || user?.username || 'Someone'}
                                        </span>
                                        <ActionPill type={item.action_type} field={item.field} />

                                        {/* before → after */}
                                        {item.action_type === 'updated' && item.old_value && item.new_value && (
                                          <span className="flex items-center gap-1 text-[11px] text-white/25 mt-0.5">
                                            <span className="line-through truncate max-w-[72px]">{item.old_value}</span>
                                            <ArrowRight className="w-2.5 h-2.5 shrink-0" />
                                            <span className="text-white/40 truncate max-w-[72px]">{item.new_value}</span>
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-white/20 mt-0.5 block">{timeAgo(item.created_at)}</span>
                                    </motion.li>
                                  );
                                })}
                              </ol>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* ── COMMENTS ── */}
              {activeTab === 'comments' && (
                <motion.div key="comments"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }} className="space-y-6">
                  <div className="flex gap-3 items-start">
                    <img src={currentUserAvatar} className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                      style={{ border: '1.5px solid rgba(255,255,255,0.12)' }} />

                    {/* ✨ FIX 2: Adicionado z-20 no container para colocá-lo acima da listagem de comentários */}
                    <div className="flex-1 rounded-xl overflow-visible relative transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/30 z-20"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>

                      {/* Comment Mention Dropdown */}
                      <AnimatePresence>
                        {mentionState.active && mentionState.target === 'comment' && mentionState.filteredUsers.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-2 z-[9999] w-56 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
                          >
                            {mentionState.filteredUsers.map((u, i) => (
                              <div key={u.id} onClick={() => handleMentionSelect(u)} onMouseEnter={() => setMentionState(prev => ({ ...prev, index: i }))} className={`px-3 py-2.5 flex items-center gap-2.5 cursor-pointer transition-colors ${i === mentionState.index ? 'bg-indigo-500/20' : 'hover:bg-white/5'}`}>
                                <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-5 h-5 rounded-full object-cover" />
                                <span className={`text-xs ${i === mentionState.index ? 'text-indigo-400 font-bold' : 'text-white/80 font-medium'}`}>{u.display_name || u.username}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {replyingTo && (
                        <div className="bg-[#1c1c1e] border-b border-white/5 px-4 py-2 flex justify-between items-center text-[11px] text-white/50 rounded-t-xl">
                          <span>Replying to <span className="text-white/80 font-medium">@{replyingTo.users?.display_name || replyingTo.users?.username}</span></span>
                          <button onClick={() => setReplyingTo(null)} className="hover:text-white/80 transition-colors">✕</button>
                        </div>
                      )}

                      <textarea
                        ref={commentRef}
                        value={newComment}
                        onChange={e => handleMentionTextChange(e.target.value, 'comment', e.target.selectionStart)}
                        onKeyDown={e => {
                          handleMentionKeyDown(e, 'comment');
                          if (!mentionState.active && e.key === 'Enter' && e.metaKey) handlePostComment();
                        }}
                        placeholder="Add a comment… Type @ to mention someone (⌘↵ to send)"
                        className={`w-full bg-transparent text-[14px] px-4 pt-3 pb-2 focus:outline-none text-white/80 placeholder-white/25 resize-none leading-relaxed ${replyingTo ? 'rounded-t-none' : ''}`}
                        rows={3} />

                      <div className="px-3 pb-3 flex justify-between items-center relative">
                        <div className="flex gap-1">
                          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'bg-white/10 text-white/80' : 'text-white/25 hover:text-white/60 hover:bg-white/5'}`}><Smile className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"><Paperclip className="w-4 h-4" /></button>
                        </div>

                        {/* ✨ FIX 2: Alterado de z-50 para z-[9999] */}
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-0 mb-2 z-[9999] shadow-2xl rounded-xl overflow-hidden border border-white/10"
                            >
                              <EmojiPicker theme={Theme.DARK} onEmojiClick={(emojiData) => {
                                setNewComment(prev => prev + emojiData.emoji);
                                setShowEmojiPicker(false);
                                commentRef.current?.focus();
                              }} />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button onClick={(e) => { e.preventDefault(); handlePostComment(); }}
                          disabled={!newComment.trim()}
                          className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-1.5"
                          style={{
                            background: newComment.trim() ? '#303030ff' : 'rgba(255,255,255,0.05)',
                            border: newComment.trim() ? '1px solid #303030ff' : '1px solid rgba(255,255,255,0.1)',
                            color: newComment.trim() ? '#fff' : '#888',
                          }}>
                          Send <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {loadingComments ? (
                    <div className="space-y-4">
                      {[0.7, 1].map((w, i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-white/8 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 rounded bg-white/8" style={{ width: `${w * 30}%` }} />
                            <div className="h-12 rounded-lg bg-white/5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <MessageSquare className="w-5 h-5 text-white/20" />
                      </div>
                      <p className="text-white/30 text-sm">No comments yet. Start the discussion.</p>
                    </div>
                  ) : (
                    <div
                      className="space-y-5 max-h-[45vh] overflow-y-auto pr-2 pb-2"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
                    >

                      {comments.filter(c => !c.parent_id).map((comment, i) => (
                        <CommentThread
                          key={comment.id}
                          comment={comment}
                          replies={comments.filter(r => r.parent_id === comment.id)}
                          index={i}
                          onReplyClick={(parent, targetUser) => {
                            setReplyingTo(parent); // Reply to parent thread
                            setNewComment(prev => `${prev}@${targetUser.username} `);
                            setTimeout(() => commentRef.current?.focus(), 50);
                          }}
                        />
                      ))}

                      {hasMoreComments && (
                        <button
                          onClick={handleLoadMoreComments}
                          disabled={isLoadingMore}
                          className="w-full py-2 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors hover:bg-white/5 rounded-xl flex justify-center items-center gap-1.5 border border-transparent hover:border-white/5 mb-2"
                        >
                          {isLoadingMore ? 'Carregando...' : 'Ver mais ⌄'}
                        </button>
                      )}

                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* FOOTER */}
          <div className="shrink-0 px-7 py-4 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <img src={currentUserAvatar} className="w-6 h-6 rounded-full object-cover"
                style={{ border: '1.5px solid rgba(255,255,255,0.1)' }} />
              <span className="text-xs text-white/30">You're editing this task</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose}
                className="px-4 py-1.5 text-sm font-medium text-white/40 hover:text-white/70 rounded-lg transition-colors">
                Discard
              </button>
              <button onClick={() => { handleSave(); onClose(); }}
                className="px-4 py-1.5 text-sm font-semibold transition-all rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}