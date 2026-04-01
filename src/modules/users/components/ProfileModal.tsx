"use client";

import { useState, useEffect, useRef } from "react";
import { updateUserProfile, uploadAvatarAction } from "@/modules/users/actions/user";
import { X, Check, Camera, Loader2, User, Type, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdated: (p: any) => void;
}

interface FormErrors {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatar_url ||
      (profile?.username
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
        : null),
  );
  const [avatarHovered, setAvatarHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url || "");
      setBio(profile.bio || "");
      setAvatarPreview(
        profile.avatar_url ||
          (profile.username
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
            : null),
      );
    }
  }, [profile]);

  useEffect(() => {
    if (avatarUrl) setAvatarPreview(avatarUrl);
    else if (profile?.username)
      setAvatarPreview(
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
      );
  }, [avatarUrl, profile]);

  if (!isOpen) return null;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!displayName.trim()) newErrors.displayName = "Required";
    else if (displayName.length < 2)
      newErrors.displayName = "Min 2 characters";
    else if (displayName.length > 50)
      newErrors.displayName = "Max 50 characters";
    if (avatarUrl && !isValidUrl(avatarUrl) && !avatarUrl.startsWith("data:"))
      newErrors.avatarUrl = "Invalid URL";
    if (bio.length > 200) newErrors.bio = "Max 200 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, avatarUrl: "Upload an image file" }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const r = reader.result as string;
      setAvatarPreview(r);
      setAvatarUrl(r);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setErrors({});
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarUrl.startsWith("data:")) {
        finalAvatarUrl = await uploadAvatarAction(avatarUrl);
        setAvatarUrl(finalAvatarUrl);
      }
      await updateUserProfile({
        display_name: displayName,
        avatar_url: finalAvatarUrl,
        bio,
      });
      onProfileUpdated({
        ...profile,
        display_name: displayName,
        avatar_url: finalAvatarUrl,
        bio,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch {
      setErrors({ avatarUrl: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-[420px] z-10 flex flex-col"
          style={{
            background: "var(--app-panel)",
            borderRadius: "10px",
            border: "1px solid var(--app-border-faint)",
            boxShadow: "0 24px 64px -12px rgba(0,0,0,0.8)",
          }}
        >
          {/* Subtle top border highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-white/5 rounded-t-[10px]" />

          <form onSubmit={handleSave} className="flex flex-col relative z-10 w-full h-full">
            {/* Header */}
            <div className="pt-7 pb-5 px-7 flex flex-col items-center relative border-b border-[var(--app-border-faint)] bg-[var(--app-elevated)]/50 rounded-t-[10px]">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-md text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>

              <div
                className="relative group cursor-pointer mb-5"
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={() => setAvatarHovered(true)}
                onMouseLeave={() => setAvatarHovered(false)}
              >
                <div className="w-20 h-20 rounded-md overflow-hidden bg-[var(--app-bg)] border border-[var(--app-border)] group-hover:border-[var(--app-primary)] transition-colors duration-200 relative z-10 shadow-sm">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() =>
                        setAvatarPreview(
                          profile?.username
                            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
                            : null,
                        )
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--app-bg)] text-[var(--app-text-muted)]">
                      <User size={28} />
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {avatarHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white"
                      >
                        <Camera size={20} />
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

              <h2 className="text-[17px] font-medium text-[var(--app-text)] tracking-tight">
                {profile?.display_name || profile?.username || "Profile Settings"}
              </h2>
              {profile?.username && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="bg-[var(--app-bg)] px-2 py-0.5 rounded-[4px] border border-[var(--app-border-faint)] text-[12px] font-mono text-[var(--app-text-muted)]">
                    @{profile.username}
                  </span>
                  {memberSince && (
                    <span className="text-[12px] text-[var(--app-text-muted)] opacity-60">
                      Joined {memberSince}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="px-7 py-6 flex flex-col gap-5">
              <CleanField
                label="Display Name"
                icon={<User size={14} />}
                error={errors.displayName}
              >
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-[var(--app-bg)] text-[var(--app-text)] rounded-md pl-9 pr-3 py-2.5 text-[13px] border border-[var(--app-border)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-1 focus:ring-[var(--app-primary)] transition-all placeholder:text-[var(--app-text-muted)] placeholder:opacity-50"
                />
              </CleanField>

              <CleanField
                label="Bio"
                icon={<Type size={14} />}
                error={errors.bio}
              >
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short bio..."
                  rows={3}
                  className="w-full bg-[var(--app-bg)] text-[var(--app-text)] rounded-md pl-9 pr-3 py-2.5 text-[13px] border border-[var(--app-border)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-1 focus:ring-[var(--app-primary)] transition-all resize-none placeholder:text-[var(--app-text-muted)] placeholder:opacity-50"
                />
              </CleanField>

              <CleanField
                label="Avatar URL"
                icon={<LinkIcon size={14} />}
                error={errors.avatarUrl}
              >
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[var(--app-bg)] text-[var(--app-text)] rounded-md pl-9 pr-3 py-2.5 text-[13px] border border-[var(--app-border)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-1 focus:ring-[var(--app-primary)] transition-all placeholder:text-[var(--app-text-muted)] placeholder:opacity-50"
                />
              </CleanField>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 flex items-center justify-end gap-3 border-t border-[var(--app-border-faint)] bg-[var(--app-elevated)]/30 rounded-b-[10px]">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-md text-[13px] font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] bg-transparent border border-transparent hover:border-[var(--app-border)] hover:bg-[var(--app-hover)] transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || saved}
                className="px-5 py-2 rounded-md text-[13px] font-medium text-white transition-all flex items-center gap-2"
                style={{
                  background: saved ? "#10b981" : "var(--app-primary)",
                  opacity: saving ? 0.8 : 1,
                }}
              >
                {saved ? (
                  <>
                    <Check size={14} strokeWidth={2.5} /> Saved
                  </>
                ) : saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function CleanField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 relative">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-[var(--app-text)] opacity-70">
          {label}
        </label>
        {error && (
          <span className="text-[11px] text-red-400 font-medium">{error}</span>
        )}
      </div>
      <div className="relative">
        <div className="absolute left-[11px] top-[11px] text-[var(--app-text-muted)] pointer-events-none opacity-50">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}
