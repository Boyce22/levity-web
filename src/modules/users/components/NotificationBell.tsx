'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';
import { getNotificationsAction, markNotificationsReadAction, Notification } from '@/modules/users/actions/notifications';
import { AnimatePresence, motion } from 'framer-motion';

interface NotificationBellProps {
  onNotificationClick?: (cardId: string) => void;
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifs = () => getNotificationsAction().then(data => setNotifications(data));
    fetchNotifs();
    
    // Live polling for notifications so they appear without refresh
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening && unreadCount > 0) {
      markNotificationsReadAction();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleMarkAll = () => {
    markNotificationsReadAction();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{
          background: isOpen ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isOpen ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
          color: isOpen ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
        }}
      >
        <Bell className="w-4 h-4" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.5)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className="absolute right-0 top-12 w-75 flex flex-col z-50 overflow-hidden"
              style={{
                borderRadius: '18px',
                background: '#151515',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
                maxHeight: '380px',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-white/85">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={handleMarkAll}
                    className="flex items-center gap-1 text-[11px] font-medium text-white/30 hover:text-indigo-400 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1 p-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Sparkles className="w-4 h-4 text-white/20" />
                    </div>
                    <p className="text-[12px] text-white/30 font-medium">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {notifications.map((notif, i) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => {
                          if (onNotificationClick) {
                            onNotificationClick(notif.card_id);
                            setIsOpen(false);
                          }
                        }}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${onNotificationClick ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
                        style={{
                          background: notif.read ? 'transparent' : 'rgba(99,102,241,0.07)',
                          opacity: notif.read ? 0.6 : 1,
                        }}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={notif.actor?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actor?.username}`}
                            className="w-7 h-7 rounded-full object-cover"
                            style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}
                          />
                          {!notif.read && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                              style={{ background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.6)' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] text-white/75 leading-snug">
                            <span className="font-semibold text-white/90">
                              {notif.actor?.display_name || notif.actor?.username}
                            </span>{' '}
                            mentioned you in a comment.
                          </p>
                          {notif.content && (
                            <p className="text-[11.5px] text-white/35 mt-0.5 truncate">
                              "{notif.content}"
                            </p>
                          )}
                          <span className="text-[10px] text-white/25 mt-1 block">
                            {new Date(notif.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}