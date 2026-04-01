"use client";

import { useState, useEffect, useRef } from "react";
import { updateUserProfile, uploadAvatarAction } from "@/modules/users/actions/user";
import { X, Check, Camera, AlertCircle, Loader2 } from "lucide-react";
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

const ease = [0.16, 1, 0.3, 1];

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
  const [activeField, setActiveField] = useState<string | null>(null);
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
    if (!displayName.trim()) newErrors.displayName = "Display name is required";
    else if (displayName.length < 2)
      newErrors.displayName = "At least 2 characters";
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
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, avatarUrl: "Image must be < 5MB" }));
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
      }, 1600);
    } catch {
      setErrors({ avatarUrl: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(14px)",
          }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="relative w-full max-w-110 z-10 overflow-hidden"
          style={{
            background: "var(--app-panel)",
            borderRadius: "24px",
            border: "1px solid var(--app-border)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.55)",
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              zIndex: 2,
              background:
                "linear-gradient(90deg, transparent 0%, var(--app-primary) 35%, var(--app-primary-hover) 65%, transparent 100%)",
              opacity: 0.6,
            }}
          />

          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              top: -80,
              left: "50%",
              transform: "translateX(-50%)",
              width: 260,
              height: 260,
              background:
                "radial-gradient(circle, var(--app-primary-muted) 0%, transparent 70%)",
              pointerEvents: "none",
              opacity: 0.6,
            }}
          />

          <form onSubmit={handleSave}>
            {/* Hero */}
            <div
              className="relative flex flex-col items-center"
              style={{ paddingTop: 40, paddingBottom: 28, paddingInline: 32 }}
            >
              {/* Close button */}
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.2 }}
                className="absolute flex items-center justify-center"
                style={{
                  top: 14,
                  right: 14,
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  background: "var(--app-hover)",
                  border: "1px solid var(--app-border-faint)",
                  color: "var(--app-text-muted)",
                  cursor: "pointer",
                  zIndex: 3,
                }}
                aria-label="Close"
              >
                <X size={13} />
              </motion.button>

              {/* Avatar */}
              <motion.div
                className="relative cursor-pointer"
                style={{ marginBottom: 16 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onHoverStart={() => setAvatarHovered(true)}
                onHoverEnd={() => setAvatarHovered(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Spinning ring */}
                <motion.div
                  animate={{ rotate: avatarHovered ? 360 : 0 }}
                  transition={{
                    duration: 2.5,
                    ease: "linear",
                    repeat: avatarHovered ? Infinity : 0,
                  }}
                  style={{
                    position: "absolute",
                    inset: -3,
                    borderRadius: "50%",
                    background:
                      "conic-gradient(from 0deg, var(--app-primary) 0%, var(--app-primary-hover) 40%, transparent 60%, var(--app-primary) 100%)",
                    opacity: avatarHovered ? 1 : 0.35,
                    transition: "opacity 0.3s",
                  }}
                />
                {/* Gap ring */}
                <div
                  style={{
                    position: "absolute",
                    inset: -0.5,
                    borderRadius: "50%",
                    background: "var(--app-panel)",
                  }}
                />

                {/* Photo */}
                <div
                  style={{
                    position: "relative",
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "var(--app-elevated)",
                  }}
                >
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={() =>
                        setAvatarPreview(
                          profile?.username
                            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
                            : null,
                        )
                      }
                    />
                  )}
                  <AnimatePresence>
                    {avatarHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          background: "rgba(0,0,0,0.5)",
                          backdropFilter: "blur(2px)",
                        }}
                      >
                        <Camera size={20} style={{ color: "white" }} />
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
              </motion.div>

              {/* Identity */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "easeInOut" }}
                className="text-center"
              >
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.4px",
                    color: "var(--app-text)",
                    lineHeight: 1.25,
                    marginBottom: 6,
                  }}
                >
                  {profile?.display_name || profile?.username || "Your Profile"}
                </h2>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {profile?.username && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--app-primary)",
                        background: "var(--app-primary-muted)",
                        padding: "3px 10px",
                        borderRadius: 999,
                        border: "1px solid var(--app-border)",
                      }}
                    >
                      @{profile.username}
                    </span>
                  )}
                  {memberSince && (
                    <span
                      style={{
                        fontSize: 11.5,
                        color: "var(--app-text-muted)",
                        opacity: 0.65,
                      }}
                    >
                      Member since {memberSince}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Divider */}
            <div
              style={{ height: "1px", background: "var(--app-border-faint)" }}
            />

            {/* Fields */}
            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <PremiumField
                label="Display name"
                error={errors.displayName}
                counter={`${displayName.length}/50`}
                active={activeField === "name"}
              >
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onFocus={() => setActiveField("name")}
                  onBlur={() => setActiveField(null)}
                  placeholder="Your full name"
                  style={fieldInputStyle(
                    !!errors.displayName,
                    activeField === "name",
                  )}
                />
              </PremiumField>

              <PremiumField
                label="Bio"
                error={errors.bio}
                counter={`${bio.length}/200`}
                active={activeField === "bio"}
              >
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onFocus={() => setActiveField("bio")}
                  onBlur={() => setActiveField(null)}
                  rows={3}
                  placeholder="A few words about yourself..."
                  style={{
                    ...fieldInputStyle(!!errors.bio, activeField === "bio"),
                    resize: "none",
                  }}
                />
              </PremiumField>

              <PremiumField
                label="Avatar URL"
                error={errors.avatarUrl}
                hint="Or click your photo above to upload"
                active={activeField === "avatar"}
              >
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  onFocus={() => setActiveField("avatar")}
                  onBlur={() => setActiveField(null)}
                  placeholder="https://example.com/photo.jpg"
                  style={fieldInputStyle(
                    !!errors.avatarUrl,
                    activeField === "avatar",
                  )}
                />
              </PremiumField>
            </div>

            {/* Divider */}
            <div
              style={{ height: "1px", background: "var(--app-border-faint)" }}
            />

            {/* Footer */}
            <div
              className="flex items-center justify-between"
              style={{ padding: "16px 28px 24px" }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="text-sm font-medium rounded-xl px-4 py-2 transition-all"
                style={{
                  color: "var(--app-text-muted)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--app-text)";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--app-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--app-text-muted)";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
              >
                Cancel
              </button>

              <motion.button
                type="submit"
                disabled={saving || saved}
                whileHover={{ scale: saving || saved ? 1 : 1.025 }}
                whileTap={{ scale: saving || saved ? 1 : 0.97 }}
                className="flex items-center justify-center gap-1.5"
                style={{
                  minWidth: 140,
                  padding: "10px 24px",
                  borderRadius: "13px",
                  border: "none",
                  fontSize: 13.5,
                  fontWeight: 650,
                  letterSpacing: "-0.15px",
                  cursor: saving || saved ? "not-allowed" : "pointer",
                  opacity: saving ? 0.72 : 1,
                  transition:
                    "background 0.3s, color 0.3s, box-shadow 0.3s, opacity 0.2s",
                  ...(saved
                    ? {
                        background: "rgba(52,211,153,0.12)",
                        color: "#34d399",
                        boxShadow: "0 0 0 1px rgba(52,211,153,0.3)",
                      }
                    : {
                        background: "var(--app-primary)",
                        color: "var(--app-bg)",
                        boxShadow:
                          "0 6px 24px var(--app-primary-muted), 0 2px 6px rgba(0,0,0,0.3)",
                      }),
                }}
              >
                <AnimatePresence mode="wait">
                  {saved ? (
                    <motion.span
                      key="saved"
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check size={14} strokeWidth={2.5} /> Saved
                    </motion.span>
                  ) : saving ? (
                    <motion.span
                      key="saving"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1.5"
                    >
                      <Loader2 size={14} className="animate-spin" /> Saving…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Save changes
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─── PremiumField ─── */

function PremiumField({
  label,
  error,
  hint,
  counter,
  active,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  counter?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 8 }}
      >
        <label
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: active ? "var(--app-primary)" : "var(--app-text-muted)",
            transition: "color 0.2s",
          }}
        >
          {label}
        </label>
        {counter && (
          <span
            style={{
              fontSize: 11,
              color: "var(--app-text-muted)",
              opacity: 0.5,
            }}
          >
            {counter}
          </span>
        )}
      </div>

      <div style={{ position: "relative" }}>
        {/* Animated left accent bar */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute",
                left: 0,
                top: 8,
                bottom: 8,
                width: 2.5,
                borderRadius: 2,
                background: "var(--app-primary)",
                transformOrigin: "center",
                zIndex: 1,
              }}
            />
          )}
        </AnimatePresence>
        {children}
      </div>

      <AnimatePresence>
        {(error || hint) && (
          <motion.div
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5"
            style={{
              marginTop: 7,
              fontSize: 11.5,
              lineHeight: 1.4,
              color: error ? "#f87171" : "var(--app-text-muted)",
              opacity: error ? 1 : 0.65,
            }}
          >
            {error && <AlertCircle size={11} strokeWidth={2.5} />}
            <span>{error || hint}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Field input style ─── */

function fieldInputStyle(
  hasError: boolean,
  active: boolean,
): React.CSSProperties {
  return {
    width: "100%",
    padding: "10px 14px 10px 16px",
    borderRadius: 12,
    border: `1px solid ${
      hasError
        ? "rgba(248,113,113,0.5)"
        : active
          ? "var(--app-primary)"
          : "var(--app-border)"
    }`,
    background: "var(--app-elevated)",
    color: "var(--app-text)",
    fontSize: 13.5,
    fontFamily: "inherit",
    outline: "none",
    display: "block",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: active
      ? "0 0 0 3px var(--app-primary-muted), 0 2px 8px rgba(0,0,0,0.15)"
      : hasError
        ? "0 0 0 3px rgba(248,113,113,0.1)"
        : "0 1px 3px rgba(0,0,0,0.12)",
  };
}
