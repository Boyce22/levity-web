
import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

import { List as ListType, Card as CardType, ListType as LType } from "@/modules/board/actions/board";
import List from "@/modules/list/components/List";

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
    <div className="p-5 md:p-6 flex-1 overflow-x-auto overflow-y-auto w-full flex items-start gap-4">
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
            className="flex items-start gap-4 h-full"
          >
            {lists.map((list, index) => {
              const listCards = cards
                .filter((c) => c.list_id === list.id)
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
                  wipLimit={list.wip_limit ?? DEFAULT_WIP_LIMIT}
                  onListTypeChange={onListTypeChange}
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
              className="p-3 rounded-[18px]"
              style={{
                background: "var(--app-panel)",
                border: "1px solid var(--app-border)",
              }}
            >
              <input
                autoFocus
                className="w-full px-3 py-2 rounded-xl text-[13px] focus:outline-none"
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
              <div className="flex items-center gap-2 mt-2.5 pl-1">
                <button
                  onClick={handleCreateList}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
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
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  Discard
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="flex items-center justify-center gap-2 w-full py-4 px-4 rounded-[18px] text-sm font-semibold transition-all"
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
              <Plus className="w-4 h-4" /> Create list
            </button>
          )}
        </div>
      )}
    </div>
  );
}