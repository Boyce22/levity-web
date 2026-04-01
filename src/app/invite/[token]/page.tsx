import { acceptInviteAction } from '@/modules/workspace/actions/members';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Layout, CheckCircle, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Workspace Invitation | Levity',
  referrer: 'no-referrer', // Referrer Leakage Protection Guardrail
};

export default async function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token;
  
  const tokenValue = (await cookies()).get('token')?.value;
  if (!tokenValue) {
    // Force login but encode the rigorous Internal relative redirect URL mechanism
    const callbackUrl = encodeURIComponent(`/invite/${token}`);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  // Attempt the action transaction immediately upon loaded mount via server components directly
  // In a truly scalable UX, you'd show an "Accept?" button. But since we forced auth natively, 
  // auto-joining the user creates a flawless "magical loop" directly to the board.
  let errorMsg = '';
  let workspaceId = '';

  try {
    workspaceId = await acceptInviteAction(token);
  } catch (e: any) {
    errorMsg = e.message || 'Invitation processing critically failed.';
  }

  if (workspaceId) {
    // Immediate Success Drop
    redirect(`/?workspace=${workspaceId}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151515] text-slate-100 font-sans p-4">
      <div className="w-full max-w-[400px] p-8 bg-[#1c1c1e] border border-red-500/30 rounded-[2rem] shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex flex-col items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Invitation Invalid</h1>
        <p className="text-sm text-white/50 mb-8 font-medium">
          {errorMsg} The token could have expired, reached its user limit, or been structurally malformed.
        </p>
        <a 
          href="/"
          className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all text-sm"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
