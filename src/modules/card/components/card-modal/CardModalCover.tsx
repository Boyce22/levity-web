import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

interface CardModalCoverProps {
  coverUrl: string | null;
  isUploading: boolean;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function CardModalCover({ coverUrl, isUploading, onUpload, onRemove }: CardModalCoverProps) {
  if (!coverUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 200 }}
        exit={{ opacity: 0, height: 0 }}
        className="relative w-full overflow-hidden group shrink-0"
        style={{ borderRadius: "20px 20px 0 0" }}
      >
        <img src={coverUrl} className="w-full h-full object-cover" alt="Cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 50%, var(--app-elevated) 100%)",
          }}
        />
        {isUploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <span className="text-white text-sm font-semibold animate-pulse">Enviando…</span>
          </div>
        )}
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
          style={{
            background: "rgba(239,68,68,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <Trash2 className="w-3 h-3" /> Remover
        </button>
      </motion.div>
    </AnimatePresence>
  );
}