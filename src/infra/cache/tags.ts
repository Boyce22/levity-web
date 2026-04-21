export const CacheTags = {
  workspace: (id: string) => `workspace:${id}`,
  board: (workspaceId: string) => `board:${workspaceId}`,
  users: (workspaceId: string) => `users:${workspaceId}`,
  notifications: 'notifications:me',
  profile: 'profile:me',
};
