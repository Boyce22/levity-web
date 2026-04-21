"use client";

import React, { useState } from 'react';

import { Loader2, Maximize2, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { ConfirmationModal } from '@/ui/components/ConfirmationModal';
import { DiagramCanvas } from '@/features/board/components/diagram/DiagramCanvas';
import { DiagramEditor } from '@/features/board/components/diagram/DiagramEditor';

interface DiagramTabProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
  loading?: boolean;
  isSaving?: boolean;
}

export function DiagramTab({
  initialData,
  onSave,
  loading,
  isSaving,
}: DiagramTabProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="text-sm font-medium text-[var(--app-text-muted)]">Loading architecture...</span>
      </div>
    );
  }

  const hasData = initialData?.elements?.length > 0 || initialData?.strokes?.length > 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Enhanced Preview Area */}
      <div
        className="group border-app-border hover:border-app-primary/30 relative min-h-[450px] flex-1 overflow-hidden rounded-sm border border-dashed transition-all"
        style={{
          background: 'var(--app-bg-canvas, var(--app-panel))',
          backgroundImage: 'radial-gradient(var(--app-border) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {hasData ? (
          <div className="absolute inset-0 p-4">
            <DiagramCanvas
              elements={initialData.elements || []}
              currentElement={null}
              onPointerDown={() => setIsEditorOpen(true)} // Open editor on click
              onPointerMove={() => { }}
              onPointerUp={() => { }}
              className="cursor-zoom-in"
              autoScale={true}
            />
          </div>
        ) : (
          <div className="text-app-text-muted absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="bg-app-panel border-app-border-faint flex h-16 w-16 items-center justify-center rounded-sm border">
              <Maximize2 size={32} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-app-text text-sm font-bold">No Architecture Diagram</p>
              <p className="text-[12px] opacity-60">Click to start designing your system</p>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="bg-app-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Action Button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-2 rounded-sm px-6 py-2.5 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-950/20 transition-all hover:brightness-110 focus:ring-4 focus:ring-indigo-500/20"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
          >
            <Maximize2 size={16} />
            {hasData ? 'Edit Diagram' : 'Create Diagram'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold tracking-widest text-[var(--app-text-muted)] uppercase">
            {hasData ? 'Live Sync Active' : 'Waiting for design'}
          </span>
        </div>

        {hasData && (
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-red-400 transition-colors hover:text-red-300"
          >
            <Trash2 size={12} /> Clear Diagram
          </button>
        )}
      </div>

      {/* The Full Screen Editor Modal/Overlay */}
      <AnimatePresence>
        {isEditorOpen && (
          <DiagramEditor
            initialData={initialData}
            onSave={async (data) => {
              // Rapid feedback: Close the modal immediately
              setIsEditorOpen(false);
              await onSave(data);
            }}
            onClose={() => setIsEditorOpen(false)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={async () => {
          await onSave({ elements: [] });
          setIsClearConfirmOpen(false);
        }}
        title="Clear Diagram"
        description="Are you sure you want to clear this entire diagram? This will permanently delete all architecture elements and cannot be undone."
        confirmText="Clear Everything"
        variant="danger"
      />
    </div>
  );
}

