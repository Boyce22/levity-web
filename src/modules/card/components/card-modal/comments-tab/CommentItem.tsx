import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatMentions, timeAgo } from "@/modules/shared/utils/date";

interface CommentItemProps {
  comment: any;
  index: number;
  isReply?: boolean;
  onReply: (parent: any, targetUser: any) => void;
  allUsers: any[];
}

const markdownComponents = {
  a: ({ href, children, ...props }: any) => {
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
        className="underline"
        style={{ color: "var(--app-primary)" }}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
};

export function CommentItem({ comment, index, isReply, onReply, allUsers }: CommentItemProps) {
  const user = comment.users || allUsers.find((u) => u.id === comment.user_id);
  const avatar = user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-3"
    >
      <img
        src={avatar}
        className={`rounded-full object-cover shrink-0 ${isReply ? "w-6 h-6 mt-1" : "w-8 h-8 mt-0.5"}`}
        style={{ border: "1.5px solid var(--app-border)" }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline mb-1.5">
          <span className="text-sm font-semibold mr-2" style={{ color: "var(--app-text)" }}>
            {user?.display_name || user?.username}
          </span>
          <span className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>
            {timeAgo(comment.created_at)}
          </span>
        </div>
        <div
          className="text-[13.5px] leading-relaxed rounded-xl rounded-tl-none px-4 py-3 min-w-0"
          style={{
            background: "var(--app-panel)",
            border: "1px solid var(--app-border-faint)",
            color: "var(--app-text-muted)",
            wordBreak: "break-word",
          }}
        >
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {formatMentions(comment.content)}
            </ReactMarkdown>
          </div>
        </div>
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
      </div>
    </motion.div>
  );
}