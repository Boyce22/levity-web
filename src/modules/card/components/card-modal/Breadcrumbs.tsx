import React from "react";

interface BreadcrumbsProps {
  workspaceName: string;
  listName: string;
}

export function Breadcrumbs({ workspaceName, listName }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-(--app-text-muted) opacity-60 mb-2">
      <span className="hover:text-(--app-primary) cursor-default transition-colors">
        {workspaceName}
      </span>
      <span className="opacity-30">/</span>
      <span className="hover:text-(--app-primary) cursor-default transition-colors">
        {listName}
      </span>
    </div>
  );
}
