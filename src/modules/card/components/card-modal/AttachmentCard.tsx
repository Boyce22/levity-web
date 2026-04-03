import { File, FileText, ImageIcon, Download, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { isImageUrl } from "@/modules/shared/utils/attachments";

interface AttachmentCardProps {
  url: string;
  name?: string;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function AttachmentCard({ url, name, onDelete, isDeleting }: AttachmentCardProps) {
  const fileName = name || url.split("/").pop()?.split("?")[0] || "Arquivo";
  const isImage = isImageUrl(url);

  const getIcon = () => {
    if (isImage) return <ImageIcon className="w-4 h-4 text-indigo-400" />;
    if (fileName.endsWith(".pdf")) return <FileText className="w-4 h-4 text-red-400" />;
    return <File className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div
      className="group flex items-center gap-3 p-2 rounded-sm border bg-[var(--app-bg)]/40 transition-all hover:bg-[var(--app-bg)]/60"
      style={{ borderColor: "var(--app-border-faint)" }}
    >
      <div className="w-8 h-8 rounded-sm bg-[var(--app-panel)] flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold truncate text-[var(--app-text)] opacity-80 uppercase tracking-tight">
          {fileName}
        </p>
        <p className="text-[9px] font-medium text-[var(--app-text-muted)] opacity-50 uppercase tracking-widest">
          {isImage ? "Imagem / GIF" : "Anexo"}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:bg-[var(--app-hover)] rounded-sm text-[var(--app-text-muted)] hover:text-indigo-400 transition-all"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </a>

        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            disabled={isDeleting}
            className="p-1.5 hover:bg-red-500/10 rounded-sm text-[var(--app-text-muted)] hover:text-red-400 transition-all"
            title="Remover"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
