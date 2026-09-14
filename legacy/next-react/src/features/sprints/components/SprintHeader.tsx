'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarDays, CheckCircle2, Play, Pencil, Plus, ChevronDown } from 'lucide-react';
import { Sprint } from '@/contracts/Sprint';
import { Button } from '@/ui/primitives/Button';
import { cn } from '@/ui/utils/cn';

interface SprintHeaderProps {
  sprint: Sprint;
  sprints: Sprint[];
  onActivate: () => Promise<void>;
  onComplete: () => void;
  onEdit: () => void;
  onAddCard: () => void;
  onNewSprint: () => void;
  onNavigate: (sprintId: string) => void;
}

const statusBadgeClass = {
  planning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  completed: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
} as const;

const statusDot = {
  planning: 'bg-amber-400',
  active: 'bg-emerald-400',
  completed: 'bg-slate-400',
} as const;

const statusLabel = {
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SprintHeader({
  sprint,
  sprints,
  onActivate,
  onComplete,
  onEdit,
  onAddCard,
  onNewSprint,
  onNavigate,
}: SprintHeaderProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false);
      }
    }
    if (selectorOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectorOpen]);

  return (
    <header className="border-app-border-faint bg-app-header/60 flex flex-col gap-3 border-b px-6 py-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          {/* Sprint selector */}
          <div className="relative" ref={selectorRef}>
            <button
              type="button"
              onClick={() => setSelectorOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={selectorOpen}
              className="flex items-center gap-2 rounded-sm px-1 py-0.5 transition-colors hover:bg-white/5"
            >
              <h1 className="text-app-text truncate text-xl font-bold tracking-tight">
                {sprint.name}
              </h1>
              <ChevronDown
                size={16}
                className={cn(
                  'text-app-text-muted shrink-0 transition-transform',
                  selectorOpen && 'rotate-180',
                )}
              />
              <span
                className={cn(
                  'shrink-0 rounded-sm border px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest',
                  statusBadgeClass[sprint.status],
                )}
              >
                {statusLabel[sprint.status]}
              </span>
            </button>

            {selectorOpen && (
              <div
                role="listbox"
                aria-label="Select sprint"
                className="bg-app-elevated border-app-border-faint absolute top-full left-0 z-50 mt-1 min-w-[240px] overflow-hidden rounded-sm border shadow-xl"
              >
                <div className="custom-scrollbar max-h-[280px] overflow-y-auto p-1">
                  {sprints.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="option"
                      aria-selected={s.id === sprint.id}
                      onClick={() => {
                        setSelectorOpen(false);
                        if (s.id !== sprint.id) onNavigate(s.id);
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm transition-colors',
                        s.id === sprint.id
                          ? 'bg-app-primary-muted text-app-primary font-semibold'
                          : 'text-app-text-muted hover:bg-app-hover hover:text-app-text',
                      )}
                    >
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', statusDot[s.status])} />
                      <span className="flex-1 truncate">{s.name}</span>
                      <span className="text-[10px] opacity-50 capitalize">{s.status}</span>
                    </button>
                  ))}
                </div>
                <div className="border-app-border-faint border-t p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectorOpen(false);
                      onNewSprint();
                    }}
                    className="text-app-primary hover:bg-app-primary-muted flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <Plus size={14} />
                    New Sprint
                  </button>
                </div>
              </div>
            )}
          </div>

          {sprint.goal && (
            <p className="text-app-text-muted px-1 text-sm leading-relaxed opacity-80">
              {sprint.goal}
            </p>
          )}

          <div className="text-app-text-muted flex items-center gap-2 px-1 text-xs">
            <CalendarDays size={13} className="shrink-0" />
            <span>
              {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {sprint.status === 'planning' && (
            <Button size="sm" variant="secondary" onClick={onActivate} aria-label="Activate sprint">
              <Play size={13} className="mr-1.5" />
              Activate
            </Button>
          )}
          {sprint.status === 'active' && (
            <Button size="sm" variant="secondary" onClick={onComplete} aria-label="Complete sprint">
              <CheckCircle2 size={13} className="mr-1.5" />
              Complete
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit sprint">
            <Pencil size={13} className="mr-1.5" />
            Edit
          </Button>
          <Button size="sm" variant="primary" onClick={onAddCard} aria-label="Add card to sprint">
            <Plus size={13} className="mr-1.5" />
            Add Card
          </Button>
        </div>
      </div>

      {sprint.totalCards > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${sprint.progressPercent}%` }}
            />
          </div>
          <span className="text-app-text-muted shrink-0 text-xs">
            {sprint.completedCards}/{sprint.totalCards}
          </span>
        </div>
      )}
    </header>
  );
}

SprintHeader.displayName = 'SprintHeader';
