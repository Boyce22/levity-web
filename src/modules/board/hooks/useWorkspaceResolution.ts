import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseWorkspaceResolutionProps {
  currentWorkspaceId: string;
  workspaces: any[];
}

export function useWorkspaceResolution({
  currentWorkspaceId,
  workspaces,
}: UseWorkspaceResolutionProps) {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(true);
  const [minTimeReached, setMinTimeReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeReached(true), 1200);

    const urlParams = new URLSearchParams(window.location.search);
    const urlWorkspace = urlParams.get("workspace");
    const lastWorkspace = localStorage.getItem("last-workspace-id");

    if (!urlWorkspace && lastWorkspace && lastWorkspace !== currentWorkspaceId) {
      const exists = workspaces.some((w) => w.id === lastWorkspace);
      if (exists) {
        router.replace(`/?workspace=${lastWorkspace}`);
        return;
      }
    }

    if (currentWorkspaceId) {
      localStorage.setItem("last-workspace-id", currentWorkspaceId);
    }

    setIsResolving(false);
    return () => clearTimeout(timer);
  }, [currentWorkspaceId, router, workspaces]);

  return { isResolving, minTimeReached };
}
