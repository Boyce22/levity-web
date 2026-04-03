"use client";

import { useState } from "react";
import { 
  Plus, 
  ChevronDown, 
  Layout, 
  Users, 
  Mail, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LevityLogo } from "../LevityLogo";
import { logoutAction } from "@/modules/users/actions/users";

interface SidebarProps {
  workspaces: any[];
  currentWorkspaceId: string;
  currentWorkspaceName?: string;
  userProfile: any;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  setIsCreatingWorkspace: (val: boolean) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: string;
}

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
    userProfile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username}`;

  const isAdmin = ['owner', 'admin'].includes(userRole);

  const navItems = [
    { id: "board", label: "Project Board", icon: Layout },
    ...(isAdmin ? [{ id: "management", label: "Workspace Management", icon: Users }] : []),
    { id: "dashboard", label: "Analytics", icon: BarChart3, disabled: true },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => {
        setIsCollapsed(true);
        setIsWsOpen(false);
      }}
      className="h-screen bg-(--app-bg) border-r border-(--app-border-faint) flex flex-col z-100 shrink-0 sticky top-0 left-0 transition-colors"
      style={{ boxShadow: "rgba(0, 0, 0, 0.15) 0px 4px 12px" }}
    >
      {/* Header / Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-(--app-border-faint) justify-between overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-sm bg-(--app-primary-muted)/30 border border-(--app-border-faint) flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
            <LevityLogo size={22} />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight text-(--app-text) truncate">
              Levity
            </span>
          )}
        </div>
      </div>


      {/* Workspace Area */}
      <div className="px-3 py-4 space-y-1">
        <div className="relative">
          <button
            onClick={() => setIsWsOpen(!isWsOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all group ${
              isWsOpen ? "bg-(--app-panel)" : "hover:bg-(--app-hover)"
            }`}
          >
            <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
              {currentWorkspaceName?.charAt(0).toUpperCase() || "W"}
            </div>
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left text-sm font-semibold truncate text-(--app-text)">
                  {currentWorkspaceName || "Workspace"}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-(--app-text-muted) transition-transform ${
                    isWsOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>

          <AnimatePresence>
            {isWsOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-(--app-elevated) border border-(--app-border-faint) rounded-sm shadow-xl z-[150] p-1 overflow-hidden"
              >
                <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                  {workspaces.map((w) => (
                    <a
                      key={w.id}
                      href={`/?workspace=${w.id}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors mb-0.5 ${
                        w.id === currentWorkspaceId
                          ? "bg-(--app-primary-muted) text-(--app-primary)"
                          : "text-(--app-text-muted) hover:bg-(--app-hover) hover:text-(--app-text)"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-bold ${
                          w.id === currentWorkspaceId
                            ? "bg-(--app-primary) text-white"
                            : "bg-(--app-border-faint) text-(--app-text-muted)"
                        }`}
                      >
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{w.name}</span>
                    </a>
                  ))}
                </div>
                <div className="border-t border-(--app-border-faint) mt-1 pt-1">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsWsOpen(false);
                        setIsCreatingWorkspace(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium text-(--app-primary) hover:bg-(--app-primary-muted) transition-colors"
                    >
                      <Plus size={16} />
                      <span>Create Workspace</span>
                    </button>
                  )}
                  {userRole === 'owner' && (
                    <button
                      onClick={() => {
                        setIsWsOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium text-(--app-text-muted) hover:bg-(--app-hover) hover:text-(--app-text) transition-colors"
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
        <div className="h-[1px] bg-(--app-border-faint)" />
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && onViewChange(item.id)}
            disabled={item.disabled}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all relative group ${
              activeView === item.id
                ? "bg-(--app-primary-muted) text-(--app-primary) font-bold"
                : "text-(--app-text-muted) hover:bg-(--app-hover) hover:text-(--app-text)"
            } ${item.disabled ? "opacity-40 cursor-not-allowed grayscale" : ""}`}
            title={isCollapsed ? item.label : ""}
          >
            <item.icon size={isCollapsed ? 20 : 18} />
            {!isCollapsed && <span className="text-sm tracking-tight">{item.label}</span>}
            {activeView === item.id && (
              <motion.div
                layoutId="activeNav"
                className="absolute right-0 w-1 h-5 bg-(--app-primary) rounded-l-full"
              />
            )}
            {item.disabled && !isCollapsed && (
              <span className="ml-auto text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-(--app-panel) rounded-sm">
                Soon
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer Profile Area */}
      <div className="p-3 border-t border-(--app-border-faint) bg-(--app-header)/30">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "px-3 py-2"}`}>
          <button
            onClick={onOpenProfile}
            className="flex items-center shrink-0 transition-transform hover:scale-105"
          >
            <img
              src={displayAvatar}
              alt="Profile"
              className="w-8 h-8 rounded-sm object-cover border border-(--app-border-faint) shadow-sm"
            />
          </button>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-(--app-text) truncate tracking-tight">
                {userProfile?.display_name || userProfile?.username}
              </p>
              <p className="text-[11px] text-(--app-text-muted) truncate opacity-60 capitalize">
                {userRole}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <form action={logoutAction}>
              <button
                type="submit"
                className="p-1.5 rounded-sm text-(--app-text-muted) hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
