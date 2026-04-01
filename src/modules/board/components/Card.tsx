'use client';

import { Card as CardType } from '@/modules/board/actions/board';
import { Draggable } from '@hello-pangea/dnd';
import { Trash2, MessageSquare, AlignLeft, User } from 'lucide-react';

interface CardProps {
  card: CardType;
  index: number;
  onDelete: () => void;
  onClick: () => void;
  allUsers: any[];
}

export default function Card({ card, index, onDelete, onClick, allUsers }: CardProps) {

  const gradients = [
    'from-red-500 to-orange-500',
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-fuchsia-500 to-pink-500',
    'from-yellow-400 to-orange-400',
    'from-indigo-500 to-purple-500'
  ];
  
  const charSum = card.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = gradients[charSum % gradients.length];
  
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`group bg-[#151515] hover:bg-[#1a1a1c] border border-transparent hover:border-white/5 rounded-xl flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-200 overflow-hidden ${
            snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2 z-50 ring-1 ring-white/20' : 'shadow-md shadow-black/20'
          }`}
        >
          {card.cover_url && (
            <div className="w-full h-24 bg-zinc-800">
               <img src={card.cover_url} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-4">
            {!card.cover_url && (
              <div className={`w-8 h-1 bg-gradient-to-r ${gradient} rounded-full mb-3 opacity-90`}></div>
            )}
            
            <div className="flex justify-between items-start gap-3">
              <p className="text-[13px] font-medium text-white/80 leading-[1.4] flex-1 tracking-wide">{card.content}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/5 -mt-1 -mr-1 shrink-0 z-10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-white/40">
                {card.description && (
                  <button className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                <button className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">{index + 1}</span>
                </button>
              </div>
              
               <div className="flex -space-x-[6px]">
                  {card.assignee_id ? (() => {
                        const user = allUsers.find(u => u.id === card.assignee_id);
                        if (!user) return null;
                        return (
                          <img 
                            key={user.id} 
                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                            title={user.display_name || user.username} 
                            className="w-5 h-5 rounded-full border border-[#151515] bg-[#333] shadow-sm object-cover cursor-pointer" 
                          />
                        );
                     })()
                  : (
                     <div className="w-5 h-5 rounded-full border border-[#151515] bg-white/5 shadow-sm flex items-center justify-center">
                        <User className="w-3 h-3 text-white/30" />
                     </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
