'use client';

import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { List as ListType, Card as CardType, updateListPositionsAction, updateCardPositionsAction, createListAction, createCardAction, deleteListAction, deleteCardAction } from '@/actions/board';
import { logoutAction } from '@/actions/users';
import List from './List';
import CardModal from './CardModal';
import ProfileModal from './ProfileModal';
import NotificationBell from './NotificationBell';
import { Plus, Layout, Star, Search, LayoutGrid, LogOut, ChevronDown } from 'lucide-react';

interface BoardProps {
  initialLists: ListType[];
  initialCards: CardType[];
  userProfile: any;
  allUsers: any[];
  workspaces: any[];
  currentWorkspaceId: string;
}

export default function Board({ initialLists, initialCards, userProfile, allUsers, workspaces, currentWorkspaceId }: BoardProps) {
  const [lists, setLists] = useState<ListType[]>(initialLists);
  const [cards, setCards] = useState<CardType[]>(initialCards);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  // Global App States
  const [profile, setProfile] = useState(userProfile);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserFilters, setSelectedUserFilters] = useState<string[]>([]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'list') {
      const newLists = Array.from(lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);

      const updatedLists = newLists.map((list, index) => ({ ...list, position: index }));
      setLists(updatedLists);

      const updates = updatedLists.map(l => ({ id: l.id, position: l.position }));
      await updateListPositionsAction(updates);
      return;
    }

    if (type === 'card') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;

      const newCards = Array.from(cards);
      const cardIndex = newCards.findIndex(c => c.id === draggableId);
      const [movedCard] = newCards.splice(cardIndex, 1);

      movedCard.list_id = destListId;

      const destListCards = newCards.filter(c => c.list_id === destListId).sort((a, b) => a.position - b.position);
      destListCards.splice(destination.index, 0, movedCard);

      const updatedDestListCards = destListCards.map((c, index) => ({ ...c, position: index }));

      const otherCards = newCards.filter(c => c.list_id !== destListId);
      setCards([...otherCards, ...updatedDestListCards]);

      const updates = updatedDestListCards.map(c => ({ id: c.id, list_id: c.list_id, position: c.position }));
      await updateCardPositionsAction(updates);
    }
  };

  const handleCreateList = async () => {
    if (!newListTitle.trim()) {
      setIsAddingList(false);
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const position = lists.length;

    // Optimistic
    const newList: ListType = { id: tempId, title: newListTitle, position, user_id: profile?.id || 'temp' };
    setLists(prev => [...prev, newList]);
    setNewListTitle('');
    setIsAddingList(false);

    const saved = await createListAction(newListTitle, position, currentWorkspaceId);
    if (saved) {
      setLists(prev => prev.map(l => l.id === tempId ? saved : l));
    } else {
      setLists(prev => prev.filter(l => l.id !== tempId));
    }
  };

  const handleDeleteList = async (listId: string) => {
    setLists(prev => prev.filter(l => l.id !== listId));
    setCards(prev => prev.filter(c => c.list_id !== listId));
    await deleteListAction(listId);
  };

  const handleAddCard = async (listId: string, content: string) => {
    const tempId = `temp-${Date.now()}`;
    const position = cards.filter(c => c.list_id === listId).length;
    const newCard: CardType = { id: tempId, list_id: listId, content, position };

    setCards(prev => [...prev, newCard]);

    const saved = await createCardAction(listId, content, position);
    if (saved) {
      setCards(prev => prev.map(c => c.id === tempId ? saved : c));
    } else {
      setCards(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    await deleteCardAction(cardId);
  };

  const handleEditCardUpdate = (updatedCard: CardType) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const displayAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`;

  // Use Memo for Performance Filter
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const matchesSearch = c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProfile = selectedUserFilters.length === 0 ||
        (c.assignee_id && selectedUserFilters.includes(c.assignee_id));

      return matchesSearch && matchesProfile;
    });
  }, [cards, searchQuery, selectedUserFilters]);

  return (
    <>
      <header className="px-6 py-4 border-b border-white/5 bg-[#1c1c1e] flex flex-wrap gap-4 items-center justify-between shrink-0 z-[60] sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Layout className="w-5 h-5" />
          </div>
          <div className="relative group/ws z-[100]">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors">
              {workspaces.find(w => w.id === currentWorkspaceId)?.name} <ChevronDown className="w-4 h-4 text-white/30" />
            </h1>
            <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover/ws:opacity-100 group-hover/ws:visible transition-all">
              <div className="p-2 space-y-1">
                {workspaces.map(w => (
                  <a key={w.id} href={`/?workspace=${w.id}`} className={`block px-3 py-2 rounded-lg hover:bg-white/5 text-sm ${w.id === currentWorkspaceId ? 'text-indigo-400 bg-white/5' : 'text-white/80'}`}>{w.name}</a>
                ))}
                <div className="h-px bg-white/10 my-1"></div>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-500/20 text-sm text-indigo-400 font-medium transition-colors">+ Create Workspace</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="relative group">
            <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search cards..."
              className="bg-[#151515] border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-[140px] sm:w-[220px] transition-all"
            />
          </div>

          <div className="flex items-center text-white/40 gap-3 ml-1 z-50">
            <NotificationBell onNotificationClick={(cardId) => {
              const c = cards.find(c => c.id === cardId);
              if (c) setEditingCard(c);
            }} />
          </div>

          <div className="w-px h-6 bg-white/10 mx-1"></div>

          {/* Avatar Profile Toggle & Filter */}
          <div className="flex -space-x-1.5 cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsProfileOpen(true)}>
            <img src={displayAvatar} alt="Profile" className="w-8 h-8 rounded-full border-2 border-[#1c1c1e] bg-[#212124] shadow-sm object-cover" />
          </div>

          <form action={logoutAction}>
            <button type="submit" title="Logout" className="flex items-center justify-center w-8 h-8 text-white/40 hover:text-red-400 transition-colors hover:bg-white/5 rounded-full ml-1">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Secondary Bar */}
      <div className="px-6 border-b border-white/5 bg-[#1c1c1e] shrink-0 sticky top-[73px] z-10 flex overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 text-[14px] font-medium text-white/50 w-full">
          <button className="text-indigo-400 border-b-2 border-indigo-400 py-3 flex items-center gap-2 whitespace-nowrap shrink-0">
            <LayoutGrid className="w-4 h-4" /> Board
          </button>

          <div className="w-px h-5 bg-white/10 mx-2 shrink-0"></div>

          <div className="flex items-center gap-1.5 py-2 shrink-0 overflow-hidden">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mr-2">Members Filter</span>
            <div className="flex -space-x-1.5">
              {allUsers.map((user) => {
                const isActive = selectedUserFilters.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserFilters(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])}
                    className={`relative rounded-full transition-all duration-200 ${isActive ? 'z-20 scale-110 ring-2 ring-indigo-500' : 'z-10 opacity-70 hover:opacity-100 hover:scale-110 hover:z-30'}`}
                    title={user.display_name || user.username}
                  >
                    <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-7 h-7 rounded-full bg-zinc-700 object-cover border-2 border-[#1c1c1e]" />
                    {isActive && <div className="absolute -bottom-0.5 -right-0.5 bg-indigo-500 rounded-full w-2.5 h-2.5 border-2 border-[#1c1c1e]" />}
                  </button>
                )
              })}
            </div>
            {selectedUserFilters.length > 0 && (
              <button onClick={() => setSelectedUserFilters([])} className="ml-3 text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider">Clear</button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 overflow-x-auto overflow-y-auto w-full flex items-start gap-5">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex items-start gap-5 h-full"
              >
                {lists.map((list, index) => {
                  const listCards = filteredCards.filter(c => c.list_id === list.id).sort((a, b) => a.position - b.position);
                  return (
                    <List
                      key={list.id}
                      list={list}
                      cards={listCards}
                      index={index}
                      onAddCard={handleAddCard}
                      onDeleteList={() => handleDeleteList(list.id)}
                      onDeleteCard={handleDeleteCard}
                      onCardClick={setEditingCard}
                      avatarUrl={displayAvatar}
                      allUsers={allUsers}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="min-w-[280px] shrink-0">
          {isAddingList ? (
            <div className="bg-[#212124] p-3 rounded-[1.25rem] border border-white/5 shadow-lg">
              <input
                autoFocus
                className="w-full px-3 py-2 bg-[#151515] text-white/90 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-white/30 text-[13px]"
                placeholder="Enter list title..."
                value={newListTitle}
                onChange={e => setNewListTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateList();
                  if (e.key === 'Escape') setIsAddingList(false);
                }}
              />
              <div className="flex items-center gap-2 mt-3 pl-1">
                <button onClick={handleCreateList} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors">Add</button>
                <button onClick={() => setIsAddingList(false)} className="px-4 py-1.5 text-white/40 hover:text-white rounded-lg text-xs font-semibold transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-transparent border-[1.5px] border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 rounded-[1.25rem] text-white/40 hover:text-white/70 transition-all text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add another list
            </button>
          )}
        </div>
      </div>

      {editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onUpdate={handleEditCardUpdate}
          currentUserAvatar={displayAvatar}
          allUsers={allUsers}
        />
      )}

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onProfileUpdated={setProfile}
      />
    </>
  );
}
