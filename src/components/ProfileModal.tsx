'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/actions/user';
import { X, UserRound, Link2, Check, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdated: (p: any) => void;
}

export default function ProfileModal({ isOpen, onClose, profile, onProfileUpdated }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const resolvedAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`;

  const handleSave = async () => {
    setSaving(true);
    await updateUserProfile({ display_name: displayName, avatar_url: avatarUrl });
    onProfileUpdated({ ...profile, display_name: displayName, avatar_url: avatarUrl });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(14px)' }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-[380px] z-10 flex flex-col overflow-hidden"
          style={{
            borderRadius: '22px',
            background: '#151515',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 28px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <UserRound className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <h2 className="text-[15px] font-semibold text-white/90">Edit Profile</h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Avatar section */}
          <div className="flex flex-col items-center pt-6 pb-5 px-6">
            <div className="relative group mb-1">
              <div className="w-20 h-20 rounded-full overflow-hidden"
                style={{ border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 0 0 4px rgba(99,102,241,0.1)' }}>
                <img
                  src={resolvedAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                <Camera className="w-4 h-4 text-white/80" />
              </div>
            </div>
            <p className="text-[13px] text-white/30 mt-2">
              {profile?.username && <span className="text-white/40 font-medium">@{profile.username}</span>}
            </p>
          </div>

          {/* Fields */}
          <div className="px-6 pb-6 space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-white/30 mb-2">
                Display Name
              </label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                className="w-full text-[14px] text-white/85 rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder-white/20"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
                placeholder="Your full name"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-white/30 mb-2">
                Avatar URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                <input
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="w-full text-[14px] text-white/85 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none transition-all placeholder-white/20"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            </div>

            {/* Save button */}
            <motion.button
              onClick={handleSave}
              disabled={saving || saved}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: saved ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${saved ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}`,
                color: saved ? '#34d399' : '#fff',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.span key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Saved!
                  </motion.span>
                ) : saving ? (
                  <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Saving...
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Save Profile
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}