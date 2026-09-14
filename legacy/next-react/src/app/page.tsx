import {  List as ListType, Card as CardType  } from '@/contracts/Board';
import { getUserProfileAction as getUserProfile, getAllUsersAction } from '@/features/users/server/actions';
import Board from '@/features/board/components/Board';
import { redirect } from 'next/navigation';
import { getBoardDataAction } from '@/features/board/server/actions/board.actions';

export const dynamic = 'force-dynamic';

export default async function Home(props: { searchParams: Promise<{ workspace?: string }> }) {
  const sp = await props.searchParams;

  try {
    const data = await getBoardDataAction(sp.workspace);

    const userProfile = await getUserProfile();
    const allUsers = await getAllUsersAction(data.currentWorkspaceId);

    return (
      <main className="flex h-screen flex-col overflow-hidden bg-[#1c1c1e] font-sans text-slate-200">
        <Board 
          initialLists={data.lists as any} 
          initialCards={data.cards as any} 
          userProfile={userProfile} 
          allUsers={allUsers} 
          workspaces={data.workspaces}
          currentWorkspaceId={data.currentWorkspaceId}
          tags={data.tags}
          priorities={data.priorities}
          userRole={data.userRole}
          initialInvites={data.invites}
        />
      </main>
    );
  } catch (err: any) {
    if (err?.message === 'Unauthorized' || err?.statusCode === 401) {
      redirect('/login');
    }
    console.error('Failed to fetch board data', err);
    return <div>Error loading workspace. Please try logging in again.</div>;
  }
}

