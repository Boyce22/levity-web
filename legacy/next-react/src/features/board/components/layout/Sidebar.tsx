'use client';

import { useState } from 'react';
import {
  Plus,
  ChevronDown,
  Layout,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/ui/utils/cn';
import { LevityLogo } from '@/ui/components/LevityLogo';
import { logoutAction } from '@/features/users/server/actions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Workspace {
  id: string;
  name: string;
}

interface UserProfile {
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface SidebarProps {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  currentWorkspaceName?: string;
  userProfile: UserProfile;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  setIsCreatingWorkspace: (val: boolean) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: string;
}

// ─── Nav Items ────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar({
  workspaces,
  currentWorkspaceId,
  currentWorkspaceName,
  userProfile,
  onOpenSettings,
  onOpenProfile,
  setIsCreatingWorkspace,
  activeView,
  onViewChange,
  userRole,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isWsOpen, setIsWsOpen] = useState(false);

  const displayAvatar =
    userProfile.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`;

  const isAdmin = ['owner', 'admin'].includes(userRole);

  const navItems: NavItem[] = [
    { id: 'board', label: 'Project Board', icon: Layout },
    { id: 'sprints', label: 'Sprints', icon: Zap },
    ...(isAdmin ? [{ id: 'management', label: 'Workspace Management', icon: Users }] : []),
    { id: 'dashboard', label: 'Analytics', icon: BarChart3, disabled: true },
  ];

  const collapseMotion = {
    animate: (show: boolean) => ({
      opacity: show ? 1 : 0,
      width: show ? 'auto' : 0,
      marginLeft: show ? 12 : 0,
    }),
    transition: { duration: 0.2 },
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => {
        setIsCollapsed(true);
        setIsWsOpen(false);
      }}
      className="bg-app-bg border-app-border-faint sticky top-0 left-0 z-100 flex h-screen shrink-0 flex-col border-r transition-colors"
      style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0px 4px 12px' }}
    >
      {/* ── Header / Logo ── */}
      <div className="border-app-border-faint flex h-16 items-center justify-between overflow-hidden border-b px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-app-primary-muted/30 border-app-border-faint relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border shadow-sm">
            <LevityLogo size={22} />
          </div>
          <motion.span
            animate={collapseMotion.animate(!isCollapsed)}
            transition={collapseMotion.transition}
            className="text-app-text overflow-hidden text-lg font-bold tracking-tight whitespace-nowrap"
          >
            Levity
          </motion.span>
        </div>
      </div>

      {/* ── Workspace Switcher ── */}
      <div className="space-y-1 px-3 py-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsWsOpen(!isWsOpen)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all group',
              isWsOpen ? 'bg-app-panel' : 'hover:bg-app-hover',
            )}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-500 to-indigo-700 text-[10px] font-bold text-white shadow-sm">
              {currentWorkspaceName?.charAt(0).toUpperCase() ?? 'W'}
            </div>
            <motion.div
              animate={collapseMotion.animate(!isCollapsed)}
              transition={collapseMotion.transition}
              className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap"
            >
              <span className="text-app-text truncate text-left text-sm font-semibold">
                {currentWorkspaceName ?? 'Workspace'}
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  'text-app-text-muted transition-transform shrink-0',
                  isWsOpen && 'rotate-180',
                )}
              />
            </motion.div>
          </button>

          <AnimatePresence>
            {isWsOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-app-elevated border-app-border-faint absolute top-full right-0 left-0 z-150 mt-1 overflow-hidden rounded-sm border p-1 shadow-xl"
              >
                <div className="custom-scrollbar max-h-[240px] overflow-y-auto">
                  {workspaces.map((w) => (
                    <a
                      key={w.id}
                      href={`/?workspace=${w.id}`}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors mb-0.5',
                        w.id === currentWorkspaceId
                          ? 'bg-app-primary-muted text-app-primary'
                          : 'text-app-text-muted hover:bg-app-hover hover:text-app-text',
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-bold',
                          w.id === currentWorkspaceId
                            ? 'bg-app-primary text-white'
                            : 'bg-app-border-faint text-app-text-muted',
                        )}
                      >
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{w.name}</span>
                    </a>
                  ))}
                </div>
                <div className="border-app-border-faint mt-1 border-t pt-1">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsWsOpen(false);
                        setIsCreatingWorkspace(true);
                      }}
                      className="text-app-primary hover:bg-app-primary-muted flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <Plus size={16} />
                      <span>Create Workspace</span>
                    </button>
                  )}
                  {userRole === 'owner' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsWsOpen(false);
                        onOpenSettings();
                      }}
                      className="text-app-text-muted hover:bg-app-hover hover:text-app-text flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-3 py-2 opacity-40">
        <div className="bg-app-border-faint h-px" />
      </div>

      {/* ── Main Nav ── */}
      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => !item.disabled && onViewChange(item.id)}
            disabled={item.disabled}
            title={isCollapsed ? item.label : undefined}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all relative group',
              activeView === item.id
                ? 'bg-app-primary-muted text-app-primary font-bold'
                : 'text-app-text-muted hover:bg-app-hover hover:text-app-text',
              item.disabled && 'opacity-40 cursor-not-allowed grayscale',
            )}
          >
            <item.icon size={isCollapsed ? 20 : 18} className="shrink-0" />
            <motion.span
              animate={collapseMotion.animate(!isCollapsed)}
              transition={collapseMotion.transition}
              className="flex-1 overflow-hidden text-left text-sm tracking-tight whitespace-nowrap"
            >
              {item.label}
            </motion.span>
            {activeView === item.id && (
              <motion.div
                layoutId="activeNav"
                className="bg-app-primary absolute right-0 h-5 w-1 rounded-l-full"
              />
            )}
            {item.disabled && !isCollapsed && (
              <span className="bg-app-panel ml-auto rounded-sm px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase">
                Soon
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Footer / Profile ── */}
      <div className="border-app-border-faint bg-app-header/30 border-t p-3">
        <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : 'px-3 py-2')}>
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile"
            className="flex shrink-0 items-center transition-transform hover:scale-105"
          >
            <img
              src={displayAvatar}
              alt={userProfile.displayName ?? userProfile.username}
              className="border-app-border-faint h-8 w-8 rounded-sm border object-cover shadow-sm"
            />
          </button>
          <motion.div
            animate={collapseMotion.animate(!isCollapsed)}
            transition={collapseMotion.transition}
            className="min-w-0 flex-1 overflow-hidden whitespace-nowrap"
          >
            <p className="text-app-text truncate text-sm font-bold tracking-tight">
              {userProfile.displayName ?? userProfile.username}
            </p>
            <p className="text-app-text-muted truncate text-[11px] capitalize opacity-60">
              {userRole}
            </p>
          </motion.div>
          <motion.div
            animate={collapseMotion.animate(!isCollapsed)}
            transition={collapseMotion.transition}
            className="overflow-hidden whitespace-nowrap"
          >
            <form action={logoutAction}>
              <button
                type="submit"
                title="Logout"
                aria-label="Logout"
                className="text-app-text-muted rounded-sm p-1.5 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}

Sidebar.displayName = 'Sidebar';

