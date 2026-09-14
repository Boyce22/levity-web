"use client";

import React from 'react';
import { 
  Pencil, Undo, Redo, Trash2, Square, Database, 
  Circle, Cloud, Server, User, ArrowUpRight, Minus, Eraser 
} from 'lucide-react';
import { ElementType } from '@/features/board/hooks/useDiagram';
import { motion, AnimatePresence } from 'framer-motion';

interface DiagramToolbarProps {
  tool: ElementType;
  setTool: (tool: ElementType) => void;
  color: string;
  setColor: (color: string) => void;
  size: number;
  setSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const COLORS = [
  '#818cf8', // Indigo
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#fbbf24', // Amber
  '#94a3b8', // Slate
  '#ffffff', // White
];

export function DiagramToolbar({
  tool,
  setTool,
  color,
  setColor,
  size,
  setSize,
  onUndo,
  onRedo,
  onClear,
}: DiagramToolbarProps) {
  const ToolButton = ({ type, icon: Icon, title }: { type: ElementType, icon: any, title: string }) => (
    <button
      onClick={() => setTool(type)}
      className={`group relative flex flex-col items-center gap-1 rounded-sm p-2 transition-all ${tool === type ? 'text-app-primary bg-app-primary/10' : 'text-app-text-muted hover:text-app-text hover:bg-app-panel'}`}
      title={title}
    >
      <Icon size={18} />
      <div className="bg-app-panel border-app-border text-app-text pointer-events-none absolute -top-8 left-1/2 z-100 -translate-x-1/2 rounded-sm border px-2 py-0.5 text-[9px] font-bold whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {title}
      </div>
    </button>
  );

  return (
    <motion.div 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-app-border-faint bg-app-bg/80 relative flex flex-wrap items-center gap-6 rounded-sm border p-2 px-4 shadow-xl backdrop-blur-md"
    >
      {/* Category: General Drawing */}
      <div className="flex items-center gap-1">
        <ToolButton type="path" icon={Pencil} title="Draft" />
        <ToolButton type="eraser" icon={Eraser} title="Eraser" />
        <div className="bg-app-border-faint mx-2 h-6 w-px" />
        <ToolButton type="rect" icon={Square} title="Rectangle" />
        <ToolButton type="circle" icon={Circle} title="Circle" />
      </div>

      <div className="bg-app-border-faint h-6 w-px" />

      {/* Category: Architectural Icons */}
      <div className="flex items-center gap-1">
        <ToolButton type="cloud" icon={Cloud} title="Cloud" />
        <ToolButton type="server" icon={Server} title="Server" />
        <ToolButton type="db" icon={Database} title="Database" />
        <ToolButton type="user" icon={User} title="User" />
      </div>

      <div className="bg-app-border-faint h-6 w-px" />

      {/* Category: Connectors */}
      <div className="flex items-center gap-1">
        <ToolButton type="arrow" icon={ArrowUpRight} title="Arrow" />
        <ToolButton type="line" icon={Minus} title="Line" />
      </div>

      <div className="bg-app-border-faint ml-2 h-8 w-px" />

      {/* Controls: Color & Size */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-3.5 w-3.5 rounded-full border transition-all hover:scale-110 focus:outline-none ${color === c ? 'border-app-text ring-app-primary/30 scale-110 shadow-md ring-1' : 'border-transparent'}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range" min="1" max="10" value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="accent-app-primary bg-app-panel h-1 w-12 cursor-pointer appearance-none rounded-full"
          />
          <span className="text-app-primary min-w-[2ch] text-[10px] font-bold">{size}</span>
        </div>
      </div>
      
      <div className="bg-app-border-faint h-6 w-px" />

      {/* History Controls */}
      <div className="flex items-center gap-0.5">
        <button onClick={onUndo} className="hover:bg-app-panel text-app-text-muted hover:text-app-text rounded-sm p-1.5 transition-colors" title="Undo"><Undo size={16} /></button>
        <button onClick={onRedo} className="hover:bg-app-panel text-app-text-muted hover:text-app-text rounded-sm p-1.5 transition-colors" title="Redo"><Redo size={16} /></button>
        <button onClick={onClear} className="ml-1 rounded-sm p-1.5 text-red-500 opacity-60 transition-all hover:bg-red-500/10 hover:opacity-100" title="Clear Canvas"><Trash2 size={16} /></button>
      </div>
    </motion.div>
  );
}

