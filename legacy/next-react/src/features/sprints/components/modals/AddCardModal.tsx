'use client';

import { useState, useMemo } from 'react';
import { X, Search, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprint, SprintCard } from '@/contracts/Sprint';
import { Card as CardType, List as ListType } from '@/contracts/Board';
import { createCardAction } from '@/features/board/server/actions/card.actions';
import { Input } from '@/ui/primitives/Input';
import { cn } from '@/ui/utils/cn';

interface AddCardModalProps {
  isOpen: boolean;
  sprint: Sprint;
  boardLists: ListType[];
  boardCards: CardType[];
  sprintCards: SprintCard[];
  workspaceId: string;
  onClose: () => void;
  onAddCard: (cardId: string) => Promise<void>;
}

type Tab = 'existing' | 'new';

export function AddCardModal({
  isOpen,
  sprint,
  boardLists,
  boardCards,
  sprintCards,
  workspaceId,
  onClose,
  onAddCard,
}: AddCardModalProps) {
  const [tab, setTab] = useState<Tab>('existing');
  const [search, setSearch] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const addedCardIds = useMemo(
    () => new Set(sprintCards.map((sc) => sc.cardId)),
    [sprintCards],
  );

  const availableCards = useMemo(
    () =>
      boardCards.filter(
        (c) =>
          !addedCardIds.has(c.id) &&
          (search === '' ||
            c.content.toLowerCase().includes(search.toLowerCase())),
      ),
    [boardCards, addedCardIds, search],
  );

  const handleAddExisting = async (cardId: string) => {
    setLoadingCardId(cardId);
    try {
      await onAddCard(cardId);
    } finally {
      setLoadingCardId(null);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      setCreateError('Content is required');
      return;
    }
    if (!selectedListId) {
      setCreateError('Please select a list');
      return;
    }
    setCreateError('');
    setIsCreating(true);
    try {
      const position = boardCards.filter((c) => c.listId === selectedListId).length;
      const created = await createCardAction(selectedListId, newContent.trim(), position, workspaceId);
      if (created) {
        await onAddCard(created.id);
        setNewContent('');
        setSelectedListId('');
      }
    } catch (err) {
      setCreateError('Failed to create card. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating || loadingCardId) return;
    setSearch('');
    setNewContent('');
    setSelectedListId('');
    setCreateError('');
    setTab('existing');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-card-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-app-bg border-app-border relative flex w-full max-w-md flex-col overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
            style={{ maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
              <h2
                id="add-card-title"
                className="text-app-text text-base font-bold tracking-tight"
              >
                Add Card to Sprint
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-app-border-faint flex border-b px-6">
              {(['existing', 'new'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium transition-colors -mb-px border-b-2',
                    tab === t
                      ? 'text-app-primary border-app-primary'
                      : 'text-app-text-muted border-transparent hover:text-app-text',
                  )}
                >
                  {t === 'existing' ? 'Existing cards' : 'New card'}
                </button>
              ))}
            </div>

            {/* Content */}
            {tab === 'existing' ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="px-6 py-4">
                  <div className="relative">
                    <Search
                      size={14}
                      className="text-app-text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      placeholder="Search cards..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search cards"
                      className={cn(
                        'w-full bg-[#1c1c1e] text-white rounded-lg border border-white/10 pl-9 pr-3 py-2 text-sm',
                        'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500',
                        'placeholder:text-slate-500',
                      )}
                    />
                  </div>
                </div>
                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-4">
                  {availableCards.length === 0 ? (
                    <p className="text-app-text-muted py-8 text-center text-sm opacity-60">
                      {search ? 'No cards match your search.' : 'All cards are already in this sprint.'}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {availableCards.map((card) => {
                        const listName = boardLists.find((l) => l.id === card.listId)?.title;
                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => handleAddExisting(card.id)}
                            disabled={loadingCardId === card.id}
                            className={cn(
                              'flex items-center gap-3 w-full px-4 py-3 rounded-sm transition-all text-left',
                              'bg-app-panel border-app-border-faint border hover:bg-app-elevated hover:border-app-border',
                              'disabled:opacity-50 disabled:cursor-not-allowed',
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-app-text truncate text-sm">{card.content}</p>
                              {listName && (
                                <p className="text-app-text-muted mt-0.5 text-xs opacity-60">
                                  {listName}
                                </p>
                              )}
                            </div>
                            {loadingCardId === card.id ? (
                              <Loader2 size={14} className="shrink-0 animate-spin text-indigo-400" />
                            ) : (
                              <Plus
                                size={14}
                                className="text-app-text-muted shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateNew} className="flex flex-col gap-4 px-6 py-5">
                <Input
                  label="Card content *"
                  placeholder="Describe the task..."
                  value={newContent}
                  onChange={(e) => {
                    setNewContent(e.target.value);
                    setCreateError('');
                  }}
                  disabled={isCreating}
                />
                <div className="flex flex-col gap-1">
                  <label htmlFor="new-card-list" className="text-sm font-medium text-slate-300">
                    Destination list *
                  </label>
                  <select
                    id="new-card-list"
                    value={selectedListId}
                    onChange={(e) => {
                      setSelectedListId(e.target.value);
                      setCreateError('');
                    }}
                    disabled={isCreating}
                    aria-label="Destination list"
                    className={cn(
                      'w-full bg-[#1c1c1e] text-white rounded-lg border border-white/10 px-3 py-2 text-sm',
                      'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500',
                      'disabled:opacity-50',
                    )}
                  >
                    <option value="">Select a list...</option>
                    {boardLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
                {createError && (
                  <p className="text-xs text-red-500">{createError}</p>
                )}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="bg-app-panel border-app-border-faint text-app-text-muted hover:text-app-text flex-1 rounded-sm border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-bold transition-all',
                      'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                        Creating…
                      </>
                    ) : (
                      'Create & Add'
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

AddCardModal.displayName = 'AddCardModal';
