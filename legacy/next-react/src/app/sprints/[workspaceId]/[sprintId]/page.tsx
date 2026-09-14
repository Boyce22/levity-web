import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getSprintByIdAction, getSprintsByWorkspaceAction } from '@/features/sprints/server/actions';
import { getBoardDataAction } from '@/features/board/server/actions/board.actions';
import { getUserProfileAction, getAllUsersAction } from '@/features/users/server/actions';
import { SprintView } from '@/features/sprints/components/SprintView';
import { ApiError } from '@/infra/http/errors';

export const dynamic = 'force-dynamic';

interface SprintPageProps {
  params: Promise<{ workspaceId: string; sprintId: string }>;
}

export default async function SprintPage({ params }: SprintPageProps) {
  const { workspaceId, sprintId } = await params;

  try {
    const [sprint, sprints, boardData, userProfile, allUsers] = await Promise.all([
      getSprintByIdAction(workspaceId, sprintId),
      getSprintsByWorkspaceAction(workspaceId),
      getBoardDataAction(workspaceId),
      getUserProfileAction(),
      getAllUsersAction(workspaceId),
    ]);

    return (
      <main className="flex h-screen flex-col overflow-hidden bg-[#1c1c1e] font-sans text-slate-200">
        <SprintView
          sprint={sprint}
          initialSprints={sprints}
          workspaceId={workspaceId}
          boardLists={boardData.lists as any}
          boardCards={boardData.cards as any}
          workspaces={boardData.workspaces as any}
          userProfile={userProfile}
          allUsers={allUsers}
          userRole={boardData.userRole}
        />
      </main>
    );
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      redirect('/');
    }
    if ((err as any)?.message === 'Unauthorized' || (err as any)?.statusCode === 401) {
      redirect('/login');
    }
    console.error('Failed to load sprint', err);
    redirect('/');
  }
}
