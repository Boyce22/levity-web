"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { DiagramCanvas } from './DiagramCanvas';
import { DiagramToolbar } from './DiagramToolbar';
import { useDiagram, ElementType } from '../hooks/useDiagram';

interface DiagramEditorProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  isSaving?: boolean;
}

export function DiagramEditor({
  initialData,
  onSave,
  onClose,
  isSaving,
}: DiagramEditorProps) {
  const {
    elements,
    currentElement,
    startElement,
    updateElement,
    handleEraser,
    endElement,
    undo,
    redo,
    clear,
  } = useDiagram(initialData);

  const [tool, setTool] = useState<ElementType>('path');
  const [color, setColor] = useState('#818cf8'); // Standard Indigo
  const [size, setSize] = useState(2);
  const [isPointerDown, setIsPointerDown] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      if (isMod && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      
      if (isMod && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      if (isMod && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, onClose, elements]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIsPointerDown(true);
    startElement(tool, e.clientX - rect.left, e.clientY - rect.top, color, size);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateElement(x, y, tool, size);
  };

  const handlePointerUp = () => {
    setIsPointerDown(false);
    endElement();
  };

  const handleSave = () => {
    onSave({ elements });
  };

  const ShortcutHint = ({ keys, label }: { keys: string[], label: string }) => (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-(--app-panel)/50 rounded-sm border border-(--app-border-faint)">
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <React.Fragment key={k}>
            <span className="text-[9px] font-bold text-(--app-text) opacity-60 px-1 py-0.5 rounded-xs bg-(--app-bg) border border-(--app-border-faint) min-w-[1.2rem] text-center uppercase">
              {k}
            </span>
            {i < keys.length - 1 && <span className="text-[8px] text-(--app-text-muted) opacity-30">+</span>}
          </React.Fragment>
        ))}
      </div>
      <span className="text-[9px] font-bold text-(--app-text-muted) uppercase tracking-widest opacity-40 ml-1">{label}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex flex-col bg-(--app-bg) select-none overflow-hidden"
    >
      {/* 🏙️ Clean Header - Minimalist & Elegant */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-(--app-border-faint) bg-(--app-bg) backdrop-blur-md relative z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm hover:bg-(--app-panel) text-(--app-text-muted) hover:text-(--app-text) transition-all"
          >
            <X size={20} />
          </button>
          <div className="w-px h-4 bg-(--app-border-faint) mx-1" />
          <h2 className="text-[13px] font-bold text-(--app-text) tracking-tight uppercase opacity-80">Architecture Editor</h2>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-extrabold text-(--app-text-muted) uppercase tracking-widest opacity-40">Dedicated Drawing Surface</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-4 py-1.5 bg-(--app-primary) hover:bg-(--app-primary-hover) text-white text-[12px] font-bold rounded-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {isSaving ? 'Saving...' : 'Finish Design'}
          </button>
        </div>
      </div>

      {/* 🛠️ Floating Toolbar */}
      <div className="px-6 py-4 flex justify-center relative z-30 bg-transparent">
        <DiagramToolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          size={size}
          setSize={setSize}
          onUndo={undo}
          onRedo={redo}
          onClear={clear}
        />
      </div>

      {/* 🎨 Drawing Board */}
      <div className="flex-1 relative overflow-hidden bg-transparent cursor-crosshair">
        <DiagramCanvas
          elements={elements}
          currentElement={currentElement}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          tool={tool}
          size={size}
        />
      </div>

      {/* 🧭 Minimal Footer */}
      <div className="px-6 py-2 border-t border-(--app-border-faint) bg-(--app-bg) flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <ShortcutHint keys={['Ctrl', 'Z']} label="Undo" />
          <ShortcutHint keys={['Ctrl', 'Y']} label="Redo" />
          <ShortcutHint keys={['Ctrl', 'Shift', 'S']} label="Commit" />
        </div>
        <span className="text-[9px] font-bold text-(--app-text-muted) uppercase tracking-[0.2em] opacity-30">Esc to Terminate Session</span>
      </div>
    </motion.div>
  );
}
