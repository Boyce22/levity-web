"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SimpleField } from "@/ui/components/SimpleField";
import { AvatarUploadSection } from "./AvatarUploadSection";
import { uploadAvatarAction, updateUserProfileAction as updateUserProfile } from "@/features/users/server/actions";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdated: (p: any) => void;
  currentWorkspaceId: string;
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
  currentWorkspaceId,
}: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatarUrl ||
    (profile?.username
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
      : null),
  );
  const [avatarHovered, setAvatarHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setAvatarUrl(profile.avatarUrl || "");
      setBio(profile.bio || "");
      setAvatarPreview(
        profile.avatarUrl ||
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
      
      // 1. First handle avatar upload if it's a data URL
      if (avatarUrl.startsWith("data:")) {
        finalAvatarUrl = await uploadAvatarAction(avatarUrl);
      }

      // 2. Next handle other profile updates
      await updateUserProfile({
        displayName,
        bio,
        avatarUrl: finalAvatarUrl
      });

      onProfileUpdated({
        ...profile,
        displayName,
        avatarUrl: finalAvatarUrl,
        bio,
      });
      setAvatarUrl(finalAvatarUrl);
      setAvatarPreview(finalAvatarUrl);
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

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-10 flex w-full max-w-[400px] flex-col overflow-hidden"
          style={{
            background: "var(--app-bg)",
            borderRadius: "6px",
            border: "1px solid var(--app-border)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}
        >
          <form onSubmit={handleSave} className="relative z-10 flex h-full w-full flex-col">

            {/* Header: Left-aligned profile info */}
            <div className="flex items-center gap-4 px-6 pt-6 pb-5">
              <AvatarUploadSection
                avatarPreview={avatarPreview}
                avatarHovered={avatarHovered}
                setAvatarHovered={setAvatarHovered}
                onAvatarClick={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                handleFileUpload={handleFileUpload}
              />

              <div className="flex flex-col justify-center">
                <h1 className="text-[22px] font-bold tracking-tight text-[var(--app-text)]">
                  {profile?.displayName || "Profile"}
                </h1>
                {profile?.username && (
                  <span className="mt-1.5 text-[14px] text-[var(--app-text-muted)] opacity-90">
                    @{profile.username}
                  </span>
                )}
                {memberSince && (
                  <span className="text-[13px] text-[var(--app-text-muted)] opacity-60">
                    Joined {memberSince}
                  </span>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col px-6 pb-4">

              <div className="flex flex-col gap-5">
                <SimpleField label="Display Name" error={errors.displayName}>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-sm border border-[var(--app-border-faint)] bg-[var(--app-panel)] px-3 py-2 text-[14px] text-[var(--app-text)] shadow-sm transition-all placeholder:text-[var(--app-text-muted)] placeholder:opacity-50 focus:border-[var(--app-primary)] focus:ring-[3px] focus:ring-[var(--app-primary)]/20 focus:outline-none"
                  />
                </SimpleField>

                <SimpleField label="Bio" error={errors.bio}>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself"
                    rows={3}
                    className="w-full resize-none rounded-sm border border-[var(--app-border-faint)] bg-[var(--app-panel)] px-3 py-2 text-[14px] leading-relaxed text-[var(--app-text)] shadow-sm transition-all placeholder:text-[var(--app-text-muted)] placeholder:opacity-50 focus:border-[var(--app-primary)] focus:ring-[3px] focus:ring-[var(--app-primary)]/20 focus:outline-none"
                  />
                </SimpleField>
              </div>
            </div>

            {/* Separator */}
            <div className="mx-6 my-4 border-t border-[var(--app-border-faint)] opacity-50" />

            <div className="mb-4 flex flex-col px-6">
              <SimpleField label="Avatar URL (opcional)" error={errors.avatarUrl}>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full rounded-sm border border-[var(--app-border-faint)] bg-[var(--app-panel)] px-3 py-2 text-[14px] text-[var(--app-text)] shadow-sm transition-all placeholder:text-[var(--app-text-muted)] placeholder:opacity-50 focus:border-[var(--app-primary)] focus:ring-[3px] focus:ring-[var(--app-primary)]/20 focus:outline-none"
                />
              </SimpleField>
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between border-t border-[var(--app-border-faint)] bg-[var(--app-panel)]/30 px-6 pt-4 pb-5">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-sm bg-transparent px-3 py-2 text-[13.5px] font-medium text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-panel)] hover:text-[var(--app-text)] focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || saved}
                className="flex items-center gap-2 rounded-sm px-5 py-2 text-[13.5px] font-medium text-white shadow-sm transition-all focus:ring-[3px] focus:ring-[var(--app-primary)]/30"
                style={
                  saved
                    ? { background: "#10b981", opacity: 1 }
                    : {
                        background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
                        opacity: saving ? 0.8 : 1,
                      }
                }
              >
                {saved ? (
                  <>
                    <Check size={16} strokeWidth={2.5} /> Saved
                  </>
                ) : saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving
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
