import { File, FileText, ImageIcon, Download, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { isImageUrl } from "@/ui/utils/attachments";

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
    if (isImage) return <ImageIcon className="h-4 w-4 text-indigo-400" />;
    if (fileName.endsWith(".pdf")) return <FileText className="h-4 w-4 text-red-400" />;
    return <File className="h-4 w-4 text-emerald-400" />;
  };

  return (
    <div
      className="group flex items-center gap-3 rounded-sm border bg-[var(--app-bg)]/40 p-2 transition-all hover:bg-[var(--app-bg)]/60"
      style={{ borderColor: "var(--app-border-faint)" }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-white/5 bg-[var(--app-panel)] shadow-inner">
        {getIcon()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold tracking-tight text-[var(--app-text)] uppercase opacity-80">
          {fileName}
        </p>
        <p className="text-[9px] font-medium tracking-widest text-[var(--app-text-muted)] uppercase opacity-50">
          {isImage ? "Imagem / GIF" : "Anexo"}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm p-1.5 text-[var(--app-text-muted)] transition-all hover:bg-[var(--app-hover)] hover:text-indigo-400"
          title="Download"
        >
          <Download className="h-3.5 w-3.5" />
        </a>

        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            disabled={isDeleting}
            className="rounded-sm p-1.5 text-[var(--app-text-muted)] transition-all hover:bg-red-500/10 hover:text-red-400"
            title="Remover"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
