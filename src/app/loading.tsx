import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden" style={{ background: '#1c1c1e' }}>
      {/* Skeleton Topbar */}
      <div className="h-14 flex items-center px-4 md:px-5 shrink-0 justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex gap-4 items-center">
          <div className="h-5 w-5 bg-white/10 rounded-md animate-pulse" />
          <div className="h-5 w-32 bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="flex gap-3 items-center">
          <div className="h-7 w-7 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Skeleton Board Matrix */}
      <div className="flex-1 overflow-hidden p-6 relative">
        {/* Absolute Centered Spinner */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-4 bg-[#1c1c1e]/80 p-8 rounded-3xl" style={{ backdropFilter: 'blur(12px)' }}>
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <div className="text-[13px] font-semibold tracking-wide text-white/50 animate-pulse">Loading Workspace...</div>
          </div>
        </div>

        {/* Ghost Columns */}
        <div className="flex gap-6 h-full opacity-20 pointer-events-none z-10">
          <div className="w-[320px] shrink-0 flex flex-col gap-3">
            <div className="h-6 w-32 bg-white/20 rounded mb-2 animate-pulse" />
            <div className="h-28 w-full bg-white/10 rounded-xl animate-pulse" />
            <div className="h-40 w-full bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="w-[320px] shrink-0 flex flex-col gap-3">
            <div className="h-6 w-24 bg-white/20 rounded mb-2 animate-pulse" />
            <div className="h-32 w-full bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="w-[320px] shrink-0 flex flex-col gap-3">
            <div className="h-6 w-40 bg-white/20 rounded mb-2 animate-pulse" />
            <div className="h-24 w-full bg-white/10 rounded-xl animate-pulse" />
            <div className="h-24 w-full bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
