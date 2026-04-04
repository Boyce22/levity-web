"use client";

import React, { useState } from 'react';
import { DiagramCanvas } from '../../../../diagram/components/DiagramCanvas';
import { DiagramEditor } from '../../../../diagram/components/DiagramEditor';
import { Loader2, Maximize2, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-medium text-[var(--app-text-muted)]">Loading architecture...</span>
      </div>
    );
  }

  const hasData = initialData?.elements?.length > 0 || initialData?.strokes?.length > 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Enhanced Preview Area */}
      <div
        className="group relative flex-1 min-h-[450px] rounded-sm border border-dashed border-(--app-border) overflow-hidden transition-all hover:border-(--app-primary)/30"
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-(--app-text-muted)">
            <div className="w-16 h-16 rounded-sm bg-(--app-panel) border border-(--app-border-faint) flex items-center justify-center">
              <Maximize2 size={32} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-(--app-text)">No Architecture Diagram</p>
              <p className="text-[12px] opacity-60">Click to start designing your system</p>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-(--app-primary)/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Action Button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-indigo-950/20 focus:ring-4 focus:ring-indigo-500/20 hover:brightness-110 text-white text-[13.5px] font-bold rounded-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}
          >
            <Maximize2 size={16} />
            {hasData ? 'Edit Diagram' : 'Create Diagram'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">
            {hasData ? 'Live Sync Active' : 'Waiting for design'}
          </span>
        </div>

        {hasData && (
          <button
            onClick={() => onSave({ elements: [] })}
            className="text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1.5"
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
    </div>
  );
}
