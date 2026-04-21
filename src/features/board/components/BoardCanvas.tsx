
import {  useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

import type { List as ListType, Card as CardType, ListType as LType  } from '@/contracts/Board';
import List from "@/features/board/components/list/components/List";

interface BoardCanvasProps {
  lists: ListType[];
  cards: CardType[];
  onAddCard: (listId: string, content: string) => Promise<any> | void;
  onAddList: (title: string) => Promise<any> | void;
  onDeleteList: (listId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onCardClick: (card: CardType) => void;
  allUsers: any[];
  commentCounts: Record<string, number>;
  userAvatarUrl: string;
  onListTypeChange?: (listId: string, type: LType) => void;
  onWipLimitChange?: (listId: string, wipLimit: number | null) => void;
  userRole: string;
}

const DEFAULT_WIP_LIMIT = 5;

export function BoardCanvas({
  lists,
  cards,
  onAddCard,
  onAddList,
  onDeleteList,
  onDeleteCard,
  onCardClick,
  allUsers,
  commentCounts,
  userAvatarUrl,
  onListTypeChange,
  onWipLimitChange,
  userRole,
}: BoardCanvasProps) {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const handleCreateList = () => {
    if (!newListTitle.trim()) return setIsAddingList(false);
    
    if (onAddList) {
      onAddList(newListTitle);
    }
    setNewListTitle("");
    setIsAddingList(false);
  };


  return (
    <div className="flex w-full flex-1 items-start gap-4 overflow-auto p-5 md:p-6">
      <Droppable 
        droppableId="board" 
        type="list" 
        direction="horizontal"
        isDropDisabled={userRole === 'viewer'}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex h-full items-start gap-4"
          >
            {lists.map((list, index) => {
              const listCards = cards
                .filter((c) => c.listId === list.id)
                .sort((a, b) => a.position - b.position);
              return (
                <List
                  key={list.id}
                  list={list}
                  cards={listCards}
                  index={index}
                  totalLists={lists.length}
                  onAddCard={onAddCard}
                  onDeleteList={() => onDeleteList(list.id)}
                  onDeleteCard={onDeleteCard}
                  onCardClick={onCardClick}
                  avatarUrl={userAvatarUrl}
                  allUsers={allUsers}
                  commentCounts={commentCounts}
                  wipLimit={list.wipLimit}
                  onListTypeChange={onListTypeChange}
                  onWipLimitChange={onWipLimitChange}
                  userRole={userRole}
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add list button - Hidden for Editor and Viewer */}
      {['owner', 'admin', 'member'].includes(userRole) && (
        <div className="min-w-65 shrink-0">
          {isAddingList ? (
            <div
              className="rounded-[18px] p-3"
              style={{
                background: "var(--app-panel)",
                border: "1px solid var(--app-border)",
              }}
            >
              <input
                autoFocus
                className="w-full rounded-xl px-3 py-2 text-[13px] focus:outline-none"
                style={{
                  background: "var(--app-bg)",
                  color: "var(--app-text)",
                  border: "1px solid var(--app-border)",
                }}
                placeholder="Title"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateList();
                  if (e.key === "Escape") setIsAddingList(false);
                }}
              />
              <div className="mt-2.5 flex items-center gap-2 pl-1">
                <button
                  onClick={handleCreateList}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    background: "var(--app-primary-muted)",
                    color: "var(--app-primary)",
                    border: "1px solid var(--app-primary)",
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingList(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  Discard
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[18px] px-4 py-4 text-sm font-semibold transition-all"
              style={{
                color: "var(--app-text-muted)",
                border: "1.5px dashed var(--app-border)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--app-primary)";
                e.currentTarget.style.borderColor = "var(--app-primary)";
                e.currentTarget.style.background = "var(--app-primary-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--app-text-muted)";
                e.currentTarget.style.borderColor = "var(--app-border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Plus className="h-4 w-4" /> Create list
            </button>
          )}
        </div>
      )}
    </div>
  );
}