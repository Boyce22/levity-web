// src/app/invite/[token]/page.tsx
import { getInviteDetailsAction, acceptInviteAction } from "@/modules/workspace/actions/members";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyJwtToken } from "@/lib/auth";
import { Share2, AlertCircle, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const invite = await getInviteDetailsAction(token);

  // Check if user is logged in
  const cookieToken = (await cookies()).get("token")?.value;
  const payload = cookieToken ? await verifyJwtToken(cookieToken) : null;
  const isLoggedIn = !!payload;

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
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[var(--app-panel)] rounded-[32px] border border-[var(--app-border)] shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-[var(--app-primary)]/10 rounded-2xl flex items-center justify-center mb-8">
          <Share2 className="w-8 h-8 text-[var(--app-primary)]" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--app-text)] mb-3 tracking-tight">
          Join Workspace
        </h1>
        
        <p className="text-[15px] text-[var(--app-text-muted)] mb-10 leading-relaxed">
          You've been invited to join <strong className="text-[var(--app-text)] font-semibold">{invite.workspaceName}</strong>. 
          As a member, you'll be able to collaborate on boards and manage cards.
        </p>

        <form action={async () => {
          'use server';
          let workspaceId: string | null = null;
          try {
            workspaceId = await acceptInviteAction(token);
          } catch (err) {
            console.error("Join error:", err);
          }
          
          if (workspaceId) {
            redirect(`/?workspace=${workspaceId}`);
          } else {
            redirect("/?error=join_failed");
          }
        }} className="w-full">
          <button
            type="submit"
            className="w-full bg-[var(--app-primary)] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[var(--app-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            Accept Invitation <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-[12px] text-[var(--app-text-muted)] opacity-50 font-medium tracking-wider uppercase">
        Protected by Levity Cryptography
      </p>
    </div>
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-[var(--app-panel)] rounded-[32px] border border-[var(--app-border)] shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[var(--app-text)] mb-3">Invite Invalid</h2>
        <p className="text-[14px] text-[var(--app-text-muted)] mb-8 leading-relaxed">
          {message}
        </p>
        <Link
          href="/"
          className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] font-bold py-3 rounded-xl hover:bg-[var(--app-panel-hover)] transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
