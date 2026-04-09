'use client';

import { useState, useEffect } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { getNotificationsAction, markNotificationsReadAction, Notification } from '@/modules/users/actions/notifications';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationHeader } from './notifications/NotificationHeader';
import { NotificationItem } from './notifications/NotificationItem';

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

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

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

  const handleItemClick = (notif: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notif.cardId);
      setIsOpen(false);
    }
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
              <NotificationHeader
                notifications={notifications}
                unreadCount={unreadCount}
                handleMarkAll={handleMarkAll}
              />

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
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        index={i}
                        onClick={onNotificationClick}
                        onItemClick={handleItemClick}
                      />
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