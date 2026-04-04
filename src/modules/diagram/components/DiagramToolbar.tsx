"use client";

import React from 'react';
import { 
  Pencil, Undo, Redo, Trash2, Square, Database, 
  Circle, Cloud, Server, User, ArrowUpRight, Minus, Eraser 
} from 'lucide-react';
import { ElementType } from '../hooks/useDiagram';
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
      className={`p-2 rounded-sm transition-all relative group flex flex-col items-center gap-1 ${tool === type ? 'text-(--app-primary) bg-(--app-primary)/10' : 'text-(--app-text-muted) hover:text-(--app-text) hover:bg-(--app-panel)'}`}
      title={title}
    >
      <Icon size={18} />
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-sm bg-(--app-panel) border border-(--app-border) text-[9px] font-bold text-(--app-text) opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] shadow-lg">
        {title}
      </div>
    </button>
  );

  return (
    <motion.div 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-wrap items-center gap-6 p-2 px-4 rounded-sm shadow-xl border border-(--app-border-faint) bg-(--app-bg)/80 backdrop-blur-md relative"
    >
      {/* Category: General Drawing */}
      <div className="flex items-center gap-1">
        <ToolButton type="path" icon={Pencil} title="Draft" />
        <ToolButton type="eraser" icon={Eraser} title="Eraser" />
        <div className="w-px h-6 bg-(--app-border-faint) mx-2" />
        <ToolButton type="rect" icon={Square} title="Rectangle" />
        <ToolButton type="circle" icon={Circle} title="Circle" />
      </div>

      <div className="w-px h-6 bg-(--app-border-faint)" />

      {/* Category: Architectural Icons */}
      <div className="flex items-center gap-1">
        <ToolButton type="cloud" icon={Cloud} title="Cloud" />
        <ToolButton type="server" icon={Server} title="Server" />
        <ToolButton type="db" icon={Database} title="Database" />
        <ToolButton type="user" icon={User} title="User" />
      </div>

      <div className="w-px h-6 bg-(--app-border-faint)" />

      {/* Category: Connectors */}
      <div className="flex items-center gap-1">
        <ToolButton type="arrow" icon={ArrowUpRight} title="Arrow" />
        <ToolButton type="line" icon={Minus} title="Line" />
      </div>

      <div className="w-px h-8 bg-(--app-border-faint) ml-2" />

      {/* Controls: Color & Size */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-3.5 h-3.5 rounded-full border transition-all hover:scale-110 focus:outline-none ${color === c ? 'border-(--app-text) ring-1 ring-(--app-primary)/30 scale-110 shadow-md' : 'border-transparent'}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range" min="1" max="10" value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-12 accent-(--app-primary) h-1 bg-(--app-panel) rounded-full appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-bold text-(--app-primary) min-w-[2ch]">{size}</span>
        </div>
      </div>
      
      <div className="w-px h-6 bg-(--app-border-faint)" />

      {/* History Controls */}
      <div className="flex items-center gap-0.5">
        <button onClick={onUndo} className="p-1.5 rounded-sm hover:bg-(--app-panel) text-(--app-text-muted) hover:text-(--app-text) transition-colors" title="Undo"><Undo size={16} /></button>
        <button onClick={onRedo} className="p-1.5 rounded-sm hover:bg-(--app-panel) text-(--app-text-muted) hover:text-(--app-text) transition-colors" title="Redo"><Redo size={16} /></button>
        <button onClick={onClear} className="p-1.5 rounded-sm hover:bg-red-500/10 text-red-500 opacity-60 hover:opacity-100 transition-all ml-1" title="Clear Canvas"><Trash2 size={16} /></button>
      </div>
    </motion.div>
  );
}
