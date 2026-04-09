"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SimpleField } from "@/modules/shared/components/SimpleField";
import { AvatarUploadSection } from "./AvatarUploadSection";

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
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        const formData = new FormData();
        // The user says "envie só o file e o token". 
        // I will use 'file' as the standard field name if not specified.
        formData.append('file', blob, 'avatar.png');

        const res = await fetch('/api/users/me/avatar', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error('Avatar upload failed');
        const data = await res.json();
        // The response shape for avatar usually returns the new url or the user
        finalAvatarUrl = data.avatarUrl || data.url;
      }

      // 2. Next handle other profile updates via /api/users/me
      const profileRes = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl: finalAvatarUrl // Just in case, although the avatar was already updated
        })
      });

      if (!profileRes.ok) throw new Error('Profile update failed');
      const profileData = await profileRes.json();
      finalAvatarUrl = profileData.avatarUrl;

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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative w-full max-w-[400px] z-10 flex flex-col overflow-hidden"
          style={{
            background: "var(--app-bg)",
            borderRadius: "6px",
            border: "1px solid var(--app-border)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}
        >
          <form onSubmit={handleSave} className="flex flex-col relative z-10 w-full h-full">

            {/* Header: Left-aligned profile info */}
            <div className="px-6 pt-6 pb-5 flex items-center gap-4">
              <AvatarUploadSection
                avatarPreview={avatarPreview}
                avatarHovered={avatarHovered}
                setAvatarHovered={setAvatarHovered}
                onAvatarClick={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                handleFileUpload={handleFileUpload}
              />

              <div className="flex flex-col justify-center">
                <h1 className="text-[22px] font-bold text-[var(--app-text)] tracking-tight">
                  {profile?.displayName || "Profile"}
                </h1>
                {profile?.username && (
                  <span className="text-[14px] text-[var(--app-text-muted)] mt-1.5 opacity-90">
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
            <div className="px-6 pb-4 flex flex-col">

              <div className="flex flex-col gap-5">
                <SimpleField label="Display Name" error={errors.displayName}>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-[var(--app-panel)] text-[var(--app-text)] rounded-sm px-3 py-2 text-[14px] border border-[var(--app-border-faint)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-[3px] focus:ring-[var(--app-primary)]/20 transition-all placeholder:text-[var(--app-text-muted)] placeholder:opacity-50 shadow-sm"
                  />
                </SimpleField>

                <SimpleField label="Bio" error={errors.bio}>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself"
                    rows={3}
                    className="w-full bg-[var(--app-panel)] text-[var(--app-text)] rounded-sm px-3 py-2 text-[14px] border border-[var(--app-border-faint)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-[3px] focus:ring-[var(--app-primary)]/20 transition-all resize-none placeholder:text-[var(--app-text-muted)] placeholder:opacity-50 shadow-sm leading-relaxed"
                  />
                </SimpleField>
              </div>
            </div>

            {/* Separator */}
            <div className="mx-6 border-t border-[var(--app-border-faint)] my-4 opacity-50" />

            <div className="px-6 flex flex-col mb-4">
              <SimpleField label="Avatar URL (opcional)" error={errors.avatarUrl}>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full bg-[var(--app-panel)] text-[var(--app-text)] rounded-sm px-3 py-2 text-[14px] border border-[var(--app-border-faint)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-[3px] focus:ring-[var(--app-primary)]/20 transition-all placeholder:text-[var(--app-text-muted)] placeholder:opacity-50 shadow-sm"
                />
              </SimpleField>
            </div>

            {/* Footer */}
            <div className="px-6 pt-4 pb-5 flex items-center justify-between mt-2 bg-[var(--app-panel)]/30 border-t border-[var(--app-border-faint)]">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-3 py-2 text-[13.5px] font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] bg-transparent hover:bg-[var(--app-panel)] rounded-sm transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || saved}
                className="px-5 py-2 rounded-sm text-[13.5px] font-medium text-white transition-all flex items-center gap-2 shadow-sm focus:ring-[3px] focus:ring-[var(--app-primary)]/30"
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
