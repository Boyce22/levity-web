"use client";

import React, { useRef, useState, useEffect } from 'react';
import { getStroke } from 'perfect-freehand';
import { DiagramElement, Point, ElementType } from '../hooks/useDiagram';
import { RoughShape } from './RoughShape';
import { motion } from 'framer-motion';

interface DiagramCanvasProps {
  elements: DiagramElement[];
  currentElement: DiagramElement | null;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  className?: string;
  tool?: ElementType;
  size?: number;
  autoScale?: boolean;
}

export function DiagramCanvas({
  elements,
  currentElement,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  className,
  tool,
  size = 2,
  autoScale = false,
}: DiagramCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Calculate Bounding Box for Auto-Scaling
  const getViewBox = () => {
    if (!autoScale || elements.length === 0) return undefined;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((el) => {
      if (el.type === 'path' && el.points) {
        el.points.forEach((p) => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
      } else if (el.x !== undefined && el.y !== undefined && el.w !== undefined && el.h !== undefined) {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.w);
        maxY = Math.max(maxY, el.y + el.h);
      }
    });

    if (minX === Infinity) return undefined;

    const padding = 40;
    const width = (maxX - minX) + padding * 2;
    const height = (maxY - minY) + padding * 2;
    
    return `${minX - padding} ${minY - padding} ${width} ${height}`;
  };

  const viewBox = getViewBox();

  const getSvgPathFromStroke = (points: Point[], size: number) => {
    const stroke = getStroke(points || [], {
      size: size,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      easing: (t) => t,
      start: { cap: true },
      end: { cap: true },
    });

    if (!stroke.length) return "";

    const d = stroke.reduce(
      (acc, [x, y], i) => {
        if (i === 0) return `M ${x} ${y}`;
        return `${acc} L ${x} ${y}`;
      },
      ""
    );

    return `${d} Z`;
  };

  const renderElement = (el: DiagramElement) => {
    if (el.type === 'path') {
      return (
        <path
          key={el.id}
          d={getSvgPathFromStroke(el.points || [], el.size)}
          fill={el.color}
        />
      );
    }
    
    return (
      <RoughShape
        key={el.id}
        type={el.type}
        x={el.x}
        y={el.y}
        w={el.w}
        h={el.h}
        color={el.color}
        size={el.size}
      />
    );
  };

  const handleInnerPointerMove = (e: React.PointerEvent) => {
    if (tool === 'eraser') {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    onPointerMove(e);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-(--app-bg)">
      {/* Simple Dot Grid - Standard Board Alignment */}
      {!autoScale && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(var(--app-border) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      )}

      <svg
        ref={svgRef}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className={`w-full h-full touch-none select-none relative z-10 ${className}`}
        onPointerDown={onPointerDown}
        onPointerMove={handleInnerPointerMove}
        onPointerUp={onPointerUp}
        style={{ cursor: tool === 'eraser' ? 'none' : 'crosshair' }}
      >
        <rect width="100%" height="100%" fill="none" />
        
        {/* Existing elements */}
        {elements.map(renderElement)}

        {/* Current drawing element */}
        {currentElement && renderElement(currentElement)}

        {/* Visual Eraser Indicator */}
        {tool === 'eraser' && (
          <circle
            cx={mousePos.x}
            cy={mousePos.y}
            r={size * 4}
            fill="rgba(239, 68, 68, 0.15)"
            stroke="#ef4444"
            strokeWidth="1"
            className="pointer-events-none"
            style={{ transition: 'none' }}
          />
        )}
      </svg>
    </div>
  );
}
