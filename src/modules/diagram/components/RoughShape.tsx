"use client";

import React, { useMemo } from 'react';
import rough from 'roughjs';
import { ElementType } from '../hooks/useDiagram';

interface RoughShapeProps {
  type: ElementType;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  color: string;
  size: number;
}

export const RoughShape = ({ type, x = 0, y = 0, w = 0, h = 0, color, size }: RoughShapeProps) => {
  const generator = useMemo(() => rough.generator(), []);

  const paths = useMemo(() => {
    if (w === 0 && h === 0) return [];
    
    // Normalize coordinates (allow drawing in any direction)
    const normalizedX = w < 0 ? x + w : x;
    const normalizedY = h < 0 ? y + h : y;
    const normalizedW = Math.abs(w);
    const normalizedH = Math.abs(h);

    if (type === 'rect') {
      const drawable = generator.rectangle(normalizedX, normalizedY, normalizedW, normalizedH, {
        stroke: color,
        strokeWidth: size,
        roughness: 1.5,
      });
      return generator.toPaths(drawable);
    }

    if (type === 'circle') {
      const drawable = generator.ellipse(normalizedX + normalizedW / 2, normalizedY + normalizedH / 2, normalizedW, normalizedH, {
        stroke: color,
        strokeWidth: size,
      });
      return generator.toPaths(drawable);
    }

    if (type === 'db') {
      // Cylinder for Database
      const topEllipse = generator.ellipse(normalizedX + normalizedW / 2, normalizedY, normalizedW, normalizedH / 4, {
        stroke: color,
        strokeWidth: size,
      });
      const bottomEllipse = generator.ellipse(normalizedX + normalizedW / 2, normalizedY + normalizedH, normalizedW, normalizedH / 4, {
        stroke: color,
        strokeWidth: size,
      });
      const sideLeft = generator.line(normalizedX, normalizedY, normalizedX, normalizedY + normalizedH, {
        stroke: color,
        strokeWidth: size,
      });
      const sideRight = generator.line(normalizedX + normalizedW, normalizedY, normalizedX + normalizedW, normalizedY + normalizedH, {
        stroke: color,
        strokeWidth: size,
      });

      return [
        ...generator.toPaths(topEllipse),
        ...generator.toPaths(bottomEllipse),
        ...generator.toPaths(sideLeft),
        ...generator.toPaths(sideRight),
      ];
    }

    if (type === 'cloud') {
      // Composite cloud from overlapping ellipses
      const c1 = generator.ellipse(normalizedX + normalizedW * 0.3, normalizedY + normalizedH * 0.6, normalizedW * 0.5, normalizedH * 0.5, { stroke: color, strokeWidth: size });
      const c2 = generator.ellipse(normalizedX + normalizedW * 0.5, normalizedY + normalizedH * 0.3, normalizedW * 0.6, normalizedH * 0.6, { stroke: color, strokeWidth: size });
      const c3 = generator.ellipse(normalizedX + normalizedW * 0.7, normalizedY + normalizedH * 0.6, normalizedW * 0.5, normalizedH * 0.5, { stroke: color, strokeWidth: size });
      const bottom = generator.line(normalizedX + normalizedW * 0.1, normalizedY + normalizedH * 0.8, normalizedX + normalizedW * 0.9, normalizedY + normalizedH * 0.8, { stroke: color, strokeWidth: size });
      
      return [
        ...generator.toPaths(c1),
        ...generator.toPaths(c2),
        ...generator.toPaths(c3),
        ...generator.toPaths(bottom)
      ];
    }

    if (type === 'server') {
      // Stack of 3 server units
      const unitH = normalizedH / 3;
      const s1 = generator.rectangle(normalizedX, normalizedY, normalizedW, unitH, { stroke: color, strokeWidth: size });
      const s2 = generator.rectangle(normalizedX, normalizedY + unitH, normalizedW, unitH, { stroke: color, strokeWidth: size });
      const s3 = generator.rectangle(normalizedX, normalizedY + unitH * 2, normalizedW, unitH, { stroke: color, strokeWidth: size });
      
      return [
        ...generator.toPaths(s1),
        ...generator.toPaths(s2),
        ...generator.toPaths(s3)
      ];
    }

    if (type === 'user') {
      // User icon: Circle head + shoulder arc
      const headSize = Math.min(normalizedW, normalizedH) * 0.4;
      const head = generator.ellipse(normalizedX + normalizedW / 2, normalizedY + headSize / 2, headSize, headSize, { stroke: color, strokeWidth: size });
      const shoulders = generator.arc(normalizedX + normalizedW / 2, normalizedY + normalizedH, normalizedW * 0.9, normalizedH * 0.8, Math.PI, Math.PI * 2, false, { stroke: color, strokeWidth: size });
      
      return [
        ...generator.toPaths(head),
        ...generator.toPaths(shoulders)
      ];
    }

    if (type === 'arrow' || type === 'line') {
      // Arrow/Line from (x,y) to (x+w, y+h)
      // Note: For arrows/lines, w and h are deltas
      const mainLine = generator.line(x, y, x + w, y + h, { stroke: color, strokeWidth: size });
      
      if (type === 'line') return generator.toPaths(mainLine);

      // Arrowhead calculation
      const angle = Math.atan2(h, w);
      const headLen = 15;
      const p1x = (x + w) - headLen * Math.cos(angle - Math.PI / 6);
      const p1y = (y + h) - headLen * Math.sin(angle - Math.PI / 6);
      const p2x = (x + w) - headLen * Math.cos(angle + Math.PI / 6);
      const p2y = (y + h) - headLen * Math.sin(angle + Math.PI / 6);
      
      const h1 = generator.line(x + w, y + h, p1x, p1y, { stroke: color, strokeWidth: size });
      const h2 = generator.line(x + w, y + h, p2x, p2y, { stroke: color, strokeWidth: size });
      
      return [
        ...generator.toPaths(mainLine),
        ...generator.toPaths(h1),
        ...generator.toPaths(h2)
      ];
    }

    return [];
  }, [type, x, y, w, h, color, size, generator]);

  return (
    <g>
      {paths.map((path, i) => (
        <path
          key={i}
          d={path.d}
          stroke={color}
          strokeWidth={size}
          fill="none"
        />
      ))}
    </g>
  );
};
