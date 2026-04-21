import { redirect, RedirectType } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getSprintsByWorkspaceAction } from '@/features/sprints/server/actions';
import { getBoardDataAction } from '@/features/board/server/actions/board.actions';
import { getUserProfileAction, getAllUsersAction } from '@/features/users/server/actions';
import { ApiError } from '@/infra/http/errors';
import { SprintView } from '@/features/sprints/components/SprintView';

export const dynamic = 'force-dynamic';

interface SprintNewPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function SprintNewPage({ params }: SprintNewPageProps) {
  const { workspaceId } = await params;

  try {
    const sprints = await getSprintsByWorkspaceAction(workspaceId);

    const planning = sprints.find((s) => s.status === 'planning');
    if (planning) redirect(`/sprints/${workspaceId}/${planning.id}`);

    const first = sprints[0];
    if (first) redirect(`/sprints/${workspaceId}/${first.id}`);

    // No sprints — render the empty state with the create modal auto-open
    const [boardData, userProfile, allUsers] = await Promise.all([
      getBoardDataAction(workspaceId),
      getUserProfileAction(),
      getAllUsersAction(workspaceId),
    ]);

    const emptySprint = {
      id: '',
      workspaceId,
      name: '',
      startDate: '',
      endDate: '',
      status: 'planning' as const,
      trackingMode: 'count' as const,
      createdBy: '',
      createdAt: '',
      totalCards: 0,
      completedCards: 0,
      progressPercent: 0,
    };

    return (
      <main className="flex h-screen flex-col overflow-hidden bg-[#1c1c1e] font-sans text-slate-200">
        <SprintView
          sprint={emptySprint}
          initialSprints={[]}
          workspaceId={workspaceId}
          boardLists={boardData.lists as any}
          boardCards={boardData.cards as any}
          workspaces={boardData.workspaces as any}
          userProfile={userProfile}
          allUsers={allUsers}
          userRole={boardData.userRole}
          openCreateOnMount
        />
      </main>
    );
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof ApiError && err.status === 401) {
      redirect('/login');
    }
    console.error('Failed to load sprint new page', err);
    redirect(`/?workspace=${workspaceId}`);
  }
}
