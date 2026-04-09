export type Comment = {
  id: string;
  cardId: string;
  createdBy: string;
  updatedBy?: string | null;
  parentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  users: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
};
