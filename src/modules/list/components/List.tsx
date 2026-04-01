"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { renameListAction } from "@/modules/board/actions/board";
import Card from "@/modules/card/components/Card";
import { ListHeader } from "./ListHeader";
import { ListAddCard } from "./ListAddCard";
import { List as ListType, Card as CardType, ListType as LType } from "@/modules/board/actions/board";
import { getListType, LIST_TYPE_COLOR } from "@/modules/list/utils/listType";

interface ListProps {
  list: ListType;
  cards: CardType[];
  index: number;
  totalLists: number;
  onAddCard: (listId: string, content: string) => Promise<any> | void;
  onDeleteList: () => void;
  onDeleteCard: (cardId: string) => void;
  onCardClick: (card: CardType) => void;
  avatarUrl: string;
  allUsers: any[];
  commentCounts?: Record<string, number>;
  wipLimit?: number;
  onListTypeChange?: (listId: string, type: LType) => void;
}

const COL_ACCENTS: string[] = [
  "#818cf8", "#fbbf24", "#34d399", "#f87171", "#c084fc", "#2dd4bf", "#fb923c",
];

export default function List({
  list,
  cards,
  index,
  totalLists,
  onAddCard,
  onDeleteList,
  onDeleteCard,
  onCardClick,
  allUsers,
  commentCounts = {},
  wipLimit,
  onListTypeChange,
}: ListProps) {
  const listType = getListType(list, index, totalLists);
  const accent = LIST_TYPE_COLOR[listType];
  const isWipExceeded = wipLimit != null && cards.length >= wipLimit;

  const handleRename = async (newTitle: string) => {
    await renameListAction(list.id, newTitle);
  };

  const handleAddCard = async (content: string) => {
    await onAddCard(list.id, content);
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex flex-col"
          style={{
            ...provided.draggableProps.style,
            minWidth: "280px",
            maxWidth: "280px",
            background: snapshot.isDragging ? "var(--app-elevated)" : "var(--app-panel)",
            border: isWipExceeded
              ? "1px solid rgba(248,113,113,0.4)"
              : snapshot.isDragging
                ? `1px solid ${accent}60`
                : "1px solid var(--app-border-faint)",
            borderRadius: "0 0 18px 18px",
            boxShadow: snapshot.isDragging
              ? `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${accent}40`
              : "0 2px 8px rgba(0,0,0,0.15)",
            transition: snapshot.isDragging
              ? provided.draggableProps.style?.transition
              : provided.draggableProps.style?.transition
                ? `${provided.draggableProps.style.transition}, border-color 0.2s, box-shadow 0.2s`
                : "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          {/* Barra de cor superior */}
          <div
            style={{
              height: "3px",
              background: isWipExceeded ? "#f87171" : accent,
              borderRadius: "0",
              opacity: isWipExceeded ? 1 : 0.7,
              transition: "background 0.3s",
            }}
          />

          {/* Cabeçalho */}
          <ListHeader
            dragHandleProps={provided.dragHandleProps}
            listId={list.id}
            title={list.title}
            cardCount={cards.length}
            wipLimit={wipLimit}
            accentColor={accent}
            listType={listType}
            onRename={handleRename}
            onDelete={onDeleteList}
            onTypeChange={(type) => onListTypeChange?.(list.id, type)}
          />

          {/* Aviso de limite WIP */}
          <AnimatePresence>
            {isWipExceeded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-4"
              >
                <div
                  className="text-[11px] font-semibold text-center py-1.5 rounded-lg mb-2"
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    color: "#f87171",
                    border: "1px solid rgba(248,113,113,0.2)",
                  }}
                >
                  ⚠ Limite WIP atingido — conclua antes de adicionar
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Área de cards */}
          <Droppable droppableId={list.id} type="card">
            {(prov, snap) => (
              <div
                ref={prov.innerRef}
                {...prov.droppableProps}
                className="px-3 pb-2 flex flex-col gap-2.5 transition-colors duration-150"
                style={{
                  minHeight: "10px",
                  background: snap.isDraggingOver ? `${accent}08` : "transparent",
                  borderRadius: snap.isDraggingOver ? "12px" : "0",
                  paddingTop: snap.isDraggingOver ? "4px" : "0",
                  scrollbarWidth: "thin",
                  scrollbarColor: "var(--app-border) transparent",
                }}
              >
                {cards.map((card, idx) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={idx}
                    onDelete={() => onDeleteCard(card.id)}
                    onClick={() => onCardClick(card)}
                    allUsers={allUsers}
                    commentCount={commentCounts[card.id] ?? 0}
                  />
                ))}
                {prov.placeholder}
              </div>
            )}
          </Droppable>

          {/* Botão de adicionar card */}
          <ListAddCard accentColor={accent} onAdd={handleAddCard} />
        </div>
      )}
    </Draggable>
  );
}