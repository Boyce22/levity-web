import { useState } from "react";
import { CommentInput } from "./CommentInput";
import { CommentThread } from "./CommentThread";
import { Comment } from "@/modules/board/actions/comments";
import { MessageSquare } from "lucide-react";

interface CommentsTabProps {
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onPostComment: (text: string, parentId?: string | null) => void;
  currentUserAvatar: string;
  allUsers: any[];
}

export function CommentsTab({
  comments,
  loading,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onPostComment,
  currentUserAvatar,
  allUsers,
}: CommentsTabProps) {
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  const handleReply = (parent: any, targetUser: any) => {
    setReplyingTo(parent);
  };

  const handleCancelReply = () => setReplyingTo(null);

  const rootComments = comments.filter((c) => !c.parent_id);
  const repliesMap = new Map();
  comments.forEach((c) => {
    if (c.parent_id) {
      if (!repliesMap.has(c.parent_id)) repliesMap.set(c.parent_id, []);
      repliesMap.get(c.parent_id).push(c);
    }
  });

  return (
    <div className="space-y-6">
      {/* Input sempre visível, independente de ter comentários */}
      <CommentInput
        avatarUrl={currentUserAvatar}
        onPost={onPostComment}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        allUsers={allUsers}
      />

      {/* Lista de comentários */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "var(--app-border)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded" style={{ width: "30%", background: "var(--app-border)" }} />
                <div className="h-12 rounded-lg" style={{ background: "var(--app-border-faint)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center">
          <div
            className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: "var(--app-hover)", border: "1px solid var(--app-border)" }}
          >
            <MessageSquare className="w-5 h-5" style={{ color: "var(--app-text-muted)", opacity: 0.5 }} />
          </div>
          <p className="text-sm" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
            Sem comentários ainda. Seja o primeiro!
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[38vh] overflow-y-auto pr-2 pb-2 custom-scrollbar" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--app-border) transparent" }}>
          {rootComments.map((comment, i) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={repliesMap.get(comment.id) || []}
              index={i}
              onReply={handleReply}
              allUsers={allUsers}
            />
          ))}
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full py-2 text-xs font-semibold transition-colors rounded-xl flex justify-center items-center gap-1.5 disabled:opacity-50"
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
              {isLoadingMore ? "Carregando…" : "Ver mais ⌄"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}