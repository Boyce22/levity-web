'use client';

import { useState } from 'react';
import { Plus, ChevronDown, Layout, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprint } from '@/contracts/Sprint';
import { cn } from '@/ui/utils/cn';
import { LevityLogo } from '@/ui/components/LevityLogo';
import { logoutAction } from '@/features/users/server/actions';

interface SprintSidebarProps {
  sprints: Sprint[];
  currentSprintId: string;
  workspaceId: string;
  onNewSprint: () => void;
  onNavigate: (sprintId: string) => void;
  workspaces: { id: string; name: string }[];
  currentWorkspaceName?: string;
  userProfile: any;
  userRole: string;
}

const statusDot = {
  planning: 'bg-amber-400',
  active: 'bg-emerald-400',
  completed: 'bg-slate-400',
} as const;

const collapseMotion = {
  animate: (show: boolean) => ({
    opacity: show ? 1 : 0,
    width: show ? 'auto' : 0,
    marginLeft: show ? 12 : 0,
  }),
  transition: { duration: 0.2 },
};

export function SprintSidebar({
  sprints,
  currentSprintId,
  workspaceId,
  onNewSprint,
  onNavigate,
  workspaces,
  currentWorkspaceName,
  userProfile,
  userRole,
}: SprintSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isWsOpen, setIsWsOpen] = useState(false);

  const displayAvatar =
    userProfile?.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username}`;

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
      {/* Header */}
      <div className="border-app-border-faint flex h-16 items-center overflow-hidden border-b px-4">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href={`/?workspace=${workspaceId}`}
            className="bg-app-primary-muted/30 border-app-border-faint relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border shadow-sm"
            aria-label="Go to board"
          >
            <LevityLogo size={22} />
          </a>
          <motion.span
            animate={collapseMotion.animate(!isCollapsed)}
            transition={collapseMotion.transition}
            className="text-app-text overflow-hidden text-lg font-bold tracking-tight whitespace-nowrap"
          >
            Levity
          </motion.span>
        </div>
      </div>

      {/* Workspace switcher */}
      <div className="space-y-1 px-3 py-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsWsOpen(!isWsOpen)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all',
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
                <div className="custom-scrollbar max-h-[200px] overflow-y-auto">
                  {workspaces.map((w) => (
                    <a
                      key={w.id}
                      href={`/?workspace=${w.id}`}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors mb-0.5',
                        w.id === workspaceId
                          ? 'bg-app-primary-muted text-app-primary'
                          : 'text-app-text-muted hover:bg-app-hover hover:text-app-text',
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-bold',
                          w.id === workspaceId
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-3 py-1 opacity-40">
        <div className="bg-app-border-faint h-px" />
      </div>

      {/* Board link */}
      <div className="px-3 py-2">
        <a
          href={`/?workspace=${workspaceId}`}
          className="text-app-text-muted hover:bg-app-hover hover:text-app-text flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-all"
          aria-label="Go to Project Board"
          title={isCollapsed ? 'Project Board' : undefined}
        >
          <Layout size={isCollapsed ? 20 : 18} className="shrink-0" />
          <motion.span
            animate={collapseMotion.animate(!isCollapsed)}
            transition={collapseMotion.transition}
            className="overflow-hidden text-left tracking-tight whitespace-nowrap"
          >
            Project Board
          </motion.span>
        </a>
      </div>

      <div className="px-3 py-1 opacity-40">
        <div className="bg-app-border-faint h-px" />
      </div>

      {/* Sprint list */}
      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-2 flex items-center justify-between px-3">
          <motion.span
            animate={collapseMotion.animate(!isCollapsed)}
            transition={collapseMotion.transition}
            className="text-app-text-muted overflow-hidden text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
          >
            Sprints
          </motion.span>
          <button
            type="button"
            onClick={onNewSprint}
            aria-label="Create new sprint"
            title="New Sprint"
            className="text-app-text-muted hover:bg-app-hover hover:text-app-text rounded-sm p-1 transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-0.5">
          {sprints.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onNavigate(s.id)}
              title={isCollapsed ? s.name : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all relative group',
                s.id === currentSprintId
                  ? 'bg-app-primary-muted text-app-primary font-bold'
                  : 'text-app-text-muted hover:bg-app-hover hover:text-app-text',
              )}
            >
              <span
                className={cn(
                  'shrink-0 h-2 w-2 rounded-full',
                  statusDot[s.status],
                )}
                aria-label={s.status}
              />
              <motion.span
                animate={collapseMotion.animate(!isCollapsed)}
                transition={collapseMotion.transition}
                className="flex-1 overflow-hidden text-left text-sm tracking-tight whitespace-nowrap"
              >
                {s.name}
              </motion.span>
              {s.id === currentSprintId && (
                <motion.div
                  layoutId="activeSprintNav"
                  className="bg-app-primary absolute right-0 h-5 w-1 rounded-l-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-app-border-faint bg-app-header/30 border-t p-3">
        <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : 'px-3 py-2')}>
          <div className="flex shrink-0 items-center">
            <img
              src={displayAvatar}
              alt={userProfile?.displayName ?? userProfile?.username ?? 'User'}
              className="border-app-border-faint h-8 w-8 rounded-sm border object-cover shadow-sm"
            />
          </div>
          <motion.div
            animate={collapseMotion.animate(!isCollapsed)}
            transition={collapseMotion.transition}
            className="min-w-0 flex-1 overflow-hidden whitespace-nowrap"
          >
            <p className="text-app-text truncate text-sm font-bold tracking-tight">
              {userProfile?.displayName ?? userProfile?.username}
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

SprintSidebar.displayName = 'SprintSidebar';
