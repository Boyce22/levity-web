'use client';

import { List as ListType, Card as CardType, renameListAction } from '@/actions/board';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { useState } from 'react';
import Card from './Card';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ListProps {
  list: ListType;
  cards: CardType[];
  index: number;
  onAddCard: (listId: string, content: string) => void;
  onDeleteList: () => void;
  onDeleteCard: (cardId: string) => void;
  onCardClick: (card: CardType) => void;
  avatarUrl: string;
  allUsers: any[];
}

export default function List({ list, cards, index, onAddCard, onDeleteList, onDeleteCard, onCardClick, avatarUrl, allUsers }: ListProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardContent, setNewCardContent] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const handleRenameSubmit = async () => {
    setIsEditingTitle(false);
    if (listTitle.trim() && listTitle !== list.title) {
       await renameListAction(list.id, listTitle.trim());
    } else {
       setListTitle(list.title);
    }
  };

  const handleAddSubmit = () => {
    if (!newCardContent.trim()) {
      setIsAddingCard(false);
      return;
    }
    onAddCard(list.id, newCardContent);
    setNewCardContent('');
    setIsAddingCard(false);
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          layout
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`min-w-[280px] max-w-[280px] flex flex-col rounded-[1.25rem] transition-all duration-300 ${
            snapshot.isDragging 
              ? 'bg-[#262629] shadow-2xl scale-105 z-50 ring-1 ring-white/10' 
              : 'bg-[#212124]'
          }`}
          style={{ ...provided.draggableProps.style, height: 'max-content', maxHeight: '100%' }}
        >
          <div className="px-5 pt-4 pb-3 flex items-center justify-between group/header cursor-grab active:cursor-grabbing" {...provided.dragHandleProps}>
            <div className="flex items-center gap-2 flex-1">
              {isEditingTitle ? (
                 <input 
                   autoFocus
                   value={listTitle}
                   onChange={e => setListTitle(e.target.value)}
                   onBlur={handleRenameSubmit}
                   onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameSubmit();
                      if (e.key === 'Escape') { setListTitle(list.title); setIsEditingTitle(false); }
                   }}
                   className="font-semibold text-[15px] bg-[#151515] px-2 py-0.5 rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-[90%] transition-colors"
                 />
              ) : (
                <h2 onClick={() => setIsEditingTitle(true)} className="font-semibold text-[15px] text-white/90 truncate cursor-text hover:text-white transition-colors">{list.title}</h2>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white/40">{cards.length}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteList(); }}
                className="text-white/30 hover:text-red-400 opacity-0 group-hover/header:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <Droppable droppableId={list.id} type="card">
            {(providedDroppable, snapshotDroppable) => (
              <div
                ref={providedDroppable.innerRef}
                {...providedDroppable.droppableProps}
                className={`flex-1 overflow-y-auto px-3 pb-2 min-h-[10px] flex flex-col gap-2.5 transition-colors ${
                  snapshotDroppable.isDraggingOver ? 'bg-white/5 pt-1 rounded-2xl mx-1' : ''
                }`}
              >
                {cards.map((card, idx) => (
                  <Card 
                    key={card.id} 
                    card={card} 
                    index={idx} 
                    onDelete={() => onDeleteCard(card.id)}
                    onClick={() => onCardClick(card)}
                    allUsers={allUsers}
                  />
                ))}
                {providedDroppable.placeholder}
              </div>
            )}
          </Droppable>

          <div className="px-3 pb-3 pt-1">
            {isAddingCard ? (
              <div className="bg-[#151515] p-2 rounded-xl border border-white/5 shadow-inner">
                <textarea
                  autoFocus
                  className="w-full px-2 py-1 bg-transparent text-white/90 placeholder-white/30 border-none focus:ring-0 resize-none h-16 text-[13px] focus:outline-none"
                  placeholder="Task description..."
                  value={newCardContent}
                  onChange={e => setNewCardContent(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddSubmit();
                    }
                    if (e.key === 'Escape') setIsAddingCard(false);
                  }}
                />
                <div className="flex items-center gap-2 mt-2 px-1">
                  <button onClick={handleAddSubmit} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[11px] font-semibold transition-colors">Add</button>
                  <button onClick={() => setIsAddingCard(false)} className="px-3 py-1 text-white/40 hover:text-white rounded-md text-[11px] font-semibold transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingCard(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold group"
              >
                <Plus className="w-4 h-4" />
                Add task
              </button>
            )}
          </div>
        </motion.div>
      )}
    </Draggable>
  );
}
