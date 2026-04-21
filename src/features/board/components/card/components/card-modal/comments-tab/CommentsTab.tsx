import {  useState, useMemo } from "react";
import { CommentInput } from "./CommentInput";
import { CommentThread } from "./CommentThread";
import type { Comment  } from '@/contracts/Comment';
import { MessageSquare } from "lucide-react";

interface CommentsTabProps {
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onPostComment: (text: string, parentId?: string | null) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId?: string;
  currentUserAvatar: string;
  allUsers: any[];
  workspaceId: string;
}

export function CommentsTab({
  comments,
  loading,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onPostComment,
  onDeleteComment,
  currentUserId,
  currentUserAvatar,
  allUsers,
  workspaceId,
}: CommentsTabProps) {
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  // targetUser removido: nunca foi usado nesta função
  const handleReply = (parent: any) => {
    setReplyingTo(parent);
  };

  const handleCancelReply = () => setReplyingTo(null);

  // Memoizados: evitam loop linear a cada render quando comments não mudou
  const rootComments = useMemo(() => comments.filter((c) => !c.parentId), [comments]);
  const repliesMap = useMemo(() => {
    const map = new Map<string, typeof comments>();
    comments.forEach((c) => {
      if (c.parentId) {
        if (!map.has(c.parentId)) map.set(c.parentId, []);
        map.get(c.parentId)!.push(c);
      }
    });
    return map;
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* Input sempre visível, independente de ter comentários */}
      <CommentInput
        avatarUrl={currentUserAvatar}
        onPost={onPostComment}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        allUsers={allUsers}
        workspaceId={workspaceId}
      />

      {/* Lista de comentários */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-pulse gap-3">
              <div className="h-8 w-8 shrink-0 rounded-sm" style={{ background: "var(--app-border)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded" style={{ width: "30%", background: "var(--app-border)" }} />
                <div className="h-12 rounded-sm" style={{ background: "var(--app-border-faint)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center">
          <div
            className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-sm"
            style={{ background: "var(--app-hover)", border: "1px solid var(--app-border)" }}
          >
            <MessageSquare className="h-5 w-5" style={{ color: "var(--app-text-muted)", opacity: 0.5 }} />
          </div>
          <p className="text-sm" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
            No comments yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="custom-scrollbar max-h-[38vh] space-y-4 overflow-y-auto pr-2 pb-2" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--app-border) transparent" }}>
          {rootComments.map((comment, i) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={repliesMap.get(comment.id) || []}
              index={i}
              onReply={handleReply}
              onDelete={onDeleteComment}
              allUsers={allUsers}
              currentUserId={currentUserId}
            />
          ))}
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="flex w-full items-center justify-center gap-1.5 rounded-sm py-2 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{ color: "var(--app-text-muted)", border: "1px solid var(--app-border-faint)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--app-primary)";
                e.currentTarget.style.borderColor = "var(--app-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--app-text-muted)";
                e.currentTarget.style.borderColor = "var(--app-border-faint)";
              }}
            >
              {isLoadingMore ? "Loading…" : "Show more ⌄"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
