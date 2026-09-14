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
      className="group relative shrink-0 cursor-pointer"
      onClick={onAvatarClick}
      onMouseEnter={() => setAvatarHovered(true)}
      onMouseLeave={() => setAvatarHovered(false)}
    >
      <div className="relative z-10 h-[72px] w-[72px] overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-panel)] shadow-sm ring-4 ring-[var(--app-panel)]/50 transition-colors">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[var(--app-panel)]" />
        )}

        <AnimatePresence>
          {avatarHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white"
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
