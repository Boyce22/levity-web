import { getInviteDetailsAction, acceptInviteAction } from '@/features/workspaces/server/actions';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { isTokenStructurallyValid } from '@/infra/auth/session';
import { Share2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ApiError } from '@/infra/http/errors';

interface PageProps {
  params: Promise<{ workspaceId: string; token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { workspaceId, token } = await params;
  const invite = await getInviteDetailsAction(workspaceId, token);

  const cookieToken = (await cookies()).get('token')?.value;
  const isLoggedIn = !!cookieToken && isTokenStructurallyValid(cookieToken);

  if (!invite) {
    return <InviteError message="This invitation link is invalid or has been revoked." />;
  }

  if (invite.isExpired) {
    return <InviteError message="This invitation has expired. Please ask the sender for a new link." />;
  }

  if (invite.isFull) {
    return <InviteError message="This invitation has reached its maximum number of uses." />;
  }

  if (!isLoggedIn) {
    redirect(`/login?callbackUrl=/invite/${workspaceId}/${token}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--app-bg)] p-4">
      <div className="animate-in fade-in zoom-in-95 flex w-full max-w-[440px] flex-col items-center rounded-[32px] border border-[var(--app-border)] bg-[var(--app-panel)] p-10 text-center shadow-[0_32px_80px_rgba(0,0,0,0.5)] duration-500">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-primary)]/10">
          <Share2 className="h-8 w-8 text-[var(--app-primary)]" />
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-[var(--app-text)]">
          Join Workspace
        </h1>

        <p className="mb-10 text-[15px] leading-relaxed text-[var(--app-text-muted)]">
          You've been invited to join{' '}
          <strong className="font-semibold text-[var(--app-text)]">{invite.workspaceName}</strong>.
          As a member, you'll be able to collaborate on boards and manage cards.
        </p>

        <form
          action={async () => {
            'use server';
            let joinedWorkspaceId: string | null = null;
            try {
              const result: any = await acceptInviteAction(workspaceId, token);
              joinedWorkspaceId = result.workspaceId || result;
            } catch (err) {
              if (err instanceof ApiError) {
                console.error(`Join failed. Code: ${err.code}, TraceId: ${err.traceId}`);
              } else {
                console.error('Join error:', err);
              }
            }

            if (joinedWorkspaceId) {
              redirect(`/?workspace=${joinedWorkspaceId}`);
            } else {
              redirect('/?error=joinFailed');
            }
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--app-primary)] py-4 font-bold text-white shadow-[var(--app-primary)]/20 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Accept Invitation <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>

      <p className="mt-8 text-[12px] font-medium tracking-wider text-[var(--app-text-muted)] uppercase opacity-50">
        Protected by Levity Cryptography
      </p>
    </div>
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--app-bg)] p-4">
      <div className="flex w-full max-w-[400px] flex-col items-center rounded-[32px] border border-[var(--app-border)] bg-[var(--app-panel)] p-10 text-center shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="mb-3 text-xl font-bold text-[var(--app-text)]">Invite Invalid</h2>
        <p className="mb-8 text-[14px] leading-relaxed text-[var(--app-text-muted)]">{message}</p>
        <Link
          href="/"
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-3 font-bold text-[var(--app-text)] transition-all hover:bg-[var(--app-panel-hover)]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
