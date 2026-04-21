import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatMentions, timeAgo } from "@/ui/utils/date";
import { AttachmentCard } from "../AttachmentCard";
import { extractAttachments, isImageUrl, stripAttachments, Attachment } from "@/ui/utils/attachments";
import { useState, useMemo } from "react";
import { Edit2, Trash2, X, Check, Loader2 } from "lucide-react";
import { updateCommentAction, deleteCommentAction } from '@/features/board/server/actions/comment.actions';
import { ConfirmationModal } from "@/ui/components/ConfirmationModal";

interface CommentItemProps {
  comment: any;
  index: number;
  isReply?: boolean;
  onReply: (parent: any, targetUser: any) => void;
  allUsers: any[];
  currentUserId?: string;
  onDelete: (commentId: string) => void;
}

const markdownComponents = (allUrls: string[]) => ({
  a: ({ href, children, ...props }: any) => {
    const cleanHref = decodeURIComponent(href?.trim() || "");
    if (allUrls.some(u => decodeURIComponent(u?.trim() || "") === cleanHref)) return null;

    if (href === "#mention") {
      return (
        <span
          className="mx-0.5 inline-flex cursor-pointer items-center rounded-md px-1.5 py-0.5 text-[0.9em] font-bold"
          style={{
            background: "var(--app-primary-muted)",
            color: "var(--app-primary)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
          {...props}
        >
          {children}
        </span>
      );
    }
    return (
      <a
        href={href}
        className="text-indigo-400 underline transition-colors hover:text-indigo-300"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
  img: () => null,
});

export function CommentItem({ comment, index, isReply, onReply, onDelete, allUsers, currentUserId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [stagedAttachments, setStagedAttachments] = useState<Attachment[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const user = comment.users || allUsers.find((u) => u.id === comment.createdBy);
  const avatar = user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;
  const isOwner = currentUserId === comment.createdBy;

  const attachments = extractAttachments(isEditing ? editContent : comment.content);
  const attachmentUrls = attachments.map(a => a.url);

  // Memoizado: markdownComponents cria um novo objeto a cada chamada.
  // Passá-lo inline causaria re-mount completo do ReactMarkdown em todo render.
  const mdComponents = useMemo(() => markdownComponents(attachmentUrls), [attachmentUrls.join(',')]);

  const handleSave = async () => {
    const finalAttachments = stagedAttachments
      .map(a => ` [File: ${a.name}](${a.url}) `)
      .join("");
    const finalContent = (editContent + finalAttachments).trim();

    if (!finalContent || finalContent === comment.content) {
      setIsEditing(false);
      setStagedAttachments([]);
      return;
    }
    setIsSaving(true);
    try {
      await updateCommentAction(comment.id, finalContent);
      setIsEditing(false);
      setStagedAttachments([]);
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleteModalOpen(false); // Close modal immediately
    onDelete(comment.id); // Trigger optimistic update in parent
  };

  const removeAttachment = (url: string) => {
    setStagedAttachments(prev => prev.filter(a => a.url !== url));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative flex gap-3"
    >
      <img
        src={avatar}
        className={`shrink-0 rounded-sm bg-[var(--app-panel)] object-cover ${isReply ? "mt-1 h-6 w-6" : "mt-0.5 h-8 w-8"}`}
        style={{ border: "1.5px solid var(--app-border-faint)" }}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="mr-2 text-sm font-semibold" style={{ color: "var(--app-text)" }}>
              {user?.displayName || user?.username}
            </span>
            <span className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>
              {timeAgo(comment.createdAt)}
            </span>
            {/* Mostra "Edited" apenas quando updatedAt é posterior a createdAt.
                updatedAt === createdAt na criação, então essa guarda é necessária
                para não mostrar "Edited" em comentários nunca editados. */}
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span className="ml-2 rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                    style={{ background: "var(--app-hover)", color: "var(--app-primary)", opacity: 0.8 }}>
                Edited
              </span>
            )}
          </div>

          {isOwner && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => {
                  setEditContent(stripAttachments(comment.content));
                  setStagedAttachments(extractAttachments(comment.content));
                  setIsEditing(true);
                }}
                className="rounded p-1 transition-colors hover:bg-[var(--app-panel)]"
                style={{ color: "var(--app-text-muted)" }}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="rounded p-1 transition-colors hover:bg-red-500/10 hover:text-red-400"
                style={{ color: "var(--app-text-muted)" }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div
          className={`min-w-0 rounded-sm rounded-tl-none text-[13.5px] leading-relaxed transition-all ${isEditing ? "p-1" : "px-4 py-3"}`}
          style={{
            background: isEditing ? "transparent" : "var(--app-panel)",
            border: isEditing ? "none" : "1px solid var(--app-border-faint)",
            color: "var(--app-text-muted)",
            wordBreak: "break-word",
          }}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] w-full resize-none rounded-sm border border-[var(--app-primary)] bg-[var(--app-panel)] p-3 text-[13.5px] focus:ring-1 focus:ring-[var(--app-primary)] focus:outline-none"
                style={{ color: "var(--app-text)" }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-sm border border-[var(--app-border-faint)] px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--app-hover)]"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !editContent.trim()}
                  className="flex items-center gap-1.5 rounded-sm px-4 py-1.5 text-xs font-bold shadow-sm shadow-indigo-950/20 transition-all focus:outline-none"
                  style={{ 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
                    color: "white" 
                  }}
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={mdComponents}
              >
                {formatMentions(comment.content)}
              </ReactMarkdown>
            </div>
          )}

          {/* Attachments Section */}
          {(isEditing ? stagedAttachments.length > 0 : attachments.length > 0) && (
            <div className={`mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-3 ${isEditing ? "opacity-80" : ""}`}>
              {(isEditing ? stagedAttachments : attachments).map((file, i) => (
                <div key={i} className="group/att relative w-full max-w-xs sm:w-[calc(50%-4px)]">
                  <AttachmentCard url={file.url} name={file.name} />
                  {isEditing && (
                    <button
                      onClick={() => removeAttachment(file.url)}
                      className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--app-bg)] bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {!isEditing && (
          <div className="mt-1 flex justify-end">
            <button
              onClick={() => onReply(comment, user)}
              className="rounded px-2 py-0.5 text-[11px] font-medium transition-colors"
              style={{ color: "var(--app-text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--app-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-muted)")}
            >
              Reply
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone and will permanently remove this comment and its attachments."
        confirmText="Delete"
        cancelText="Cancel"
      />

    </motion.div>
  );
}
