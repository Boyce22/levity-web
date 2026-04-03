import { getBoardData, List as ListType, Card as CardType } from '@/modules/board/actions/board';
import { getUserProfile } from '@/modules/users/actions/user';
import { getAllUsersAction } from '@/modules/users/actions/users';
import Board from '@/modules/board/components/Board';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home(props: { searchParams: Promise<{ workspace?: string }> }) {
  const sp = await props.searchParams;
  let initialLists: ListType[] = [];
  let initialCards: CardType[] = [];
  let userProfile = null;
  let allUsers: any[] = [];
  let workspaces: any[] = [];
  let tags: any[] = [];
  let priorities: any[] = [];
  let currentWorkspaceId = sp.workspace || '';
  let isAuthError = false;

  try {
    const data = await getBoardData(sp.workspace);
    initialLists = data.lists;
    initialCards = data.cards;
    workspaces = data.workspaces;
    tags = data.tags;
    priorities = data.priorities;
    const userRole = data.userRole;
    const initialInvites = data.invites || [];
    
    if (!currentWorkspaceId && workspaces.length > 0) currentWorkspaceId = workspaces[0].id;

    userProfile = await getUserProfile();
    allUsers = await getAllUsersAction(currentWorkspaceId);

    return (
      <main className="h-screen bg-[#1c1c1e] text-slate-200 flex flex-col font-sans overflow-hidden">
        <Board 
          initialLists={initialLists} 
          initialCards={initialCards} 
          userProfile={userProfile} 
          allUsers={allUsers} 
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          tags={tags}
          priorities={priorities}
          userRole={userRole}
          initialInvites={initialInvites}
        />
      </main>
    );
  } catch (err: any) {
    if (err?.message === 'Unauthorized') {
      redirect('/login');
    }
    console.error('Failed to fetch board data', err);
    // Generic fallback if everything fails
    return <div>Error loading workspace. Please try logging in again.</div>;
  }
}
