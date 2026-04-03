import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommentItem } from "./CommentItem";

interface CommentThreadProps {
  comment: any;
  replies: any[];
  index: number;
  onReply: (parent: any, targetUser: any) => void;
  allUsers: any[];
  currentUserId?: string;
  onDelete: (commentId: string) => void;
}

export function CommentThread({ comment, replies, index, onReply, allUsers, currentUserId, onDelete }: CommentThreadProps) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="space-y-2">
      <CommentItem
        comment={comment}
        index={index}
        onReply={onReply}
        onDelete={onDelete}
        allUsers={allUsers}
        currentUserId={currentUserId}
      />
      <AnimatePresence>
        {showReplies && replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pl-4 ml-4 space-y-4 mt-2 mb-4"
            style={{ borderLeft: "2px solid var(--app-primary-muted)" }}
          >
            {replies.map((reply, j) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                index={j}
                isReply
                onReply={onReply}
                onDelete={onDelete}
                allUsers={allUsers}
                currentUserId={currentUserId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {replies.length > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="text-[11px] font-semibold transition-colors flex items-center gap-1 mt-1"
          style={{ color: "var(--app-primary)" }}
        >
          {showReplies
            ? `Ocultar respostas ▴`
            : `Ver ${replies.length} resposta${replies.length > 1 ? "s" : ""} ▾`}
        </button>
      )}
    </div>
  );
}