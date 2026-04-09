export type ListType = "todo" | "inProgress" | "review" | "done";

export type Card = {
  id: string;
  listId: string;
  content: string;
  position: number;
  description?: string | null;
  coverUrl?: string | null;
  assigneeId?: string | null;
  priority?: string | null;
  label?: string | null;
  progress?: number | null;
  dueDate?: string | null;
  createdBy: string;
  createdAt: string;
  commentCount?: number;
};

export type List = {
  id: string;
  createdBy: string;
  title: string;
  position: number;
  wipLimit?: number | null;
  workspaceId: string;
  listType?: ListType | null;
  createdAt: string;
  cards: Card[];
};
