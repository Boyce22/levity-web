export type Notification = {
  id: string;
  userId: string;
  actorId: string;
  cardId: string;
  type: "mention" | "assignment" | "reply" | "comment";
  content: string;
  read: boolean;
  createdAt: string;
  actor?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};
