import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatMentions, timeAgo } from "@/modules/shared/utils/date";
import { AttachmentCard } from "../AttachmentCard";
import { extractAttachments, isImageUrl } from "@/modules/shared/utils/attachments";
import { useState } from "react";
import { Edit2, Trash2, X, Check, Loader2 } from "lucide-react";
import { updateCommentAction, deleteCommentAction } from "@/modules/board/actions/comments";

interface CommentItemProps {
  comment: any;
  index: number;
  isReply?: boolean;
  onReply: (parent: any, targetUser: any) => void;
  allUsers: any[];
  currentUserId?: string;
}

const markdownComponents = (allUrls: string[]) => ({
  a: ({ href, children, ...props }: any) => {
    const cleanHref = decodeURIComponent(href?.trim() || "");
    if (allUrls.some(u => decodeURIComponent(u?.trim() || "") === cleanHref)) return null;

    if (href === "#mention") {
      return (
        <span
          className="inline-flex items-center font-bold px-1.5 py-0.5 mx-0.5 rounded-md text-[0.9em] cursor-pointer"
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
        className="underline text-indigo-400 hover:text-indigo-300 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
});

export function CommentItem({ comment, index, isReply, onReply, allUsers, currentUserId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = comment.users || allUsers.find((u) => u.id === comment.created_by);
  const avatar = user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;
  const isOwner = currentUserId === comment.created_by;

  const attachments = extractAttachments(isEditing ? editContent : comment.content);
  const attachmentUrls = attachments.map(a => a.url);

  const handleSave = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateCommentAction(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este comentário?")) return;
    setIsDeleting(true);
    try {
      await deleteCommentAction(comment.id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setIsDeleting(false);
    }
  };

  const removeAttachment = (url: string) => {
    // Regex para encontrar o padrão exato [Arquivo: Nome](url)
    const regex = new RegExp(`\\[Arquivo:.*?\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
    setEditContent((prev: string) => prev.replace(regex, '').trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex gap-3 group ${isDeleting ? "opacity-50 grayscale pointer-events-none" : ""}`}
    >
      <img
        src={avatar}
        className={`rounded-sm object-cover shrink-0 bg-[var(--app-panel)] ${isReply ? "w-6 h-6 mt-1" : "w-8 h-8 mt-0.5"}`}
        style={{ border: "1.5px solid var(--app-border-faint)" }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-baseline">
            <span className="text-sm font-semibold mr-2" style={{ color: "var(--app-text)" }}>
              {user?.display_name || user?.username}
            </span>
            <span className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>
              {timeAgo(comment.created_at)}
            </span>
            {comment.updated_at && (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" 
                    style={{ background: "var(--app-hover)", color: "var(--app-primary)", opacity: 0.8 }}>
                Editado
              </span>
            )}
          </div>

          {isOwner && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditContent(comment.content);
                }}
                className="p-1 rounded hover:bg-[var(--app-panel)] transition-colors"
                style={{ color: "var(--app-text-muted)" }}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-red-500/10 hover:text-red-400 transition-colors"
                style={{ color: "var(--app-text-muted)" }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div
          className={`text-[13.5px] leading-relaxed rounded-sm rounded-tl-none min-w-0 transition-all ${isEditing ? "p-1" : "px-4 py-3"}`}
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
                className="w-full bg-[var(--app-panel)] border border-[var(--app-primary)] rounded-sm p-3 text-[13.5px] focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)] resize-none min-h-[80px]"
                style={{ color: "var(--app-text)" }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors border border-[var(--app-border-faint)] hover:bg-[var(--app-hover)]"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !editContent.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-sm transition-all focus:outline-none shadow-sm shadow-indigo-950/20"
                  style={{ 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
                    color: "white" 
                  }}
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents(attachmentUrls)}
              >
                {formatMentions(comment.content)}
              </ReactMarkdown>
            </div>
          )}

          {/* Seção de Anexos */}
          {attachments.length > 0 && (
            <div className={`mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2 ${isEditing ? "opacity-80" : ""}`}>
              {attachments.map((file, i) => (
                <div key={i} className="relative w-full sm:w-[calc(50%-4px)] max-w-xs group/att">
                  <AttachmentCard url={file.url} name={file.name} />
                  {isEditing && (
                    <button
                      onClick={() => removeAttachment(file.url)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-2 border-[var(--app-bg)] hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="w-3.5 h-3.5" />
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
              className="text-[11px] font-medium px-2 py-0.5 rounded transition-colors"
              style={{ color: "var(--app-text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--app-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-muted)")}
            >
              Responder
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
