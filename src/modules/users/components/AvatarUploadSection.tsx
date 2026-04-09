import React from "react";
import { Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarUploadSectionProps {
  avatarPreview: string | null;
  avatarHovered: boolean;
  setAvatarHovered: (val: boolean) => void;
  onAvatarClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AvatarUploadSection({
  avatarPreview,
  avatarHovered,
  setAvatarHovered,
  onAvatarClick,
  fileInputRef,
  handleFileUpload,
}: AvatarUploadSectionProps) {
  return (
    <div
      className="relative group cursor-pointer shrink-0"
      onClick={onAvatarClick}
      onMouseEnter={() => setAvatarHovered(true)}
      onMouseLeave={() => setAvatarHovered(false)}
    >
      <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-[var(--app-panel)] border border-[var(--app-border)] relative z-10 transition-colors shadow-sm ring-4 ring-[var(--app-panel)]/50">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[var(--app-panel)]" />
        )}

        <AnimatePresence>
          {avatarHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"
            >
              <Camera size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
