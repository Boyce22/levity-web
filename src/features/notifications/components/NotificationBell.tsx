'use client';

import {  useState, useEffect } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import type { Notification  } from '@/contracts/Notification';
import { getNotificationsAction, markAllNotificationsReadAction } from '@/features/notifications/server/actions';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationHeader } from './NotificationHeader';
import { NotificationItem } from './NotificationItem';

interface NotificationBellProps {
  onNotificationClick?: (cardId: string) => void;
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifs = () => getNotificationsAction().then(data => {
      if (data && data.items) {
        setNotifications(data.items);
      }
    });
    fetchNotifs();
    
    // Polling agressivo foi removido em favor de atualizações eventuais via focus
    const onFocus = () => fetchNotifs();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  const handleOpen = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening && unreadCount > 0) {
      markAllNotificationsReadAction();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleMarkAll = () => {
    markAllNotificationsReadAction();
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
        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all"
        style={{
          background: isOpen ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isOpen ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
          color: isOpen ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
        }}
      >
        <Bell className="h-4 w-4" />
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
              className="absolute top-12 right-0 z-50 flex w-75 flex-col overflow-hidden"
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
              <div className="flex-1 overflow-y-auto p-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Sparkles className="h-4 w-4 text-white/20" />
                    </div>
                    <p className="text-[12px] font-medium text-white/30">All caught up!</p>
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