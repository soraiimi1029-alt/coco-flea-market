"use client";
import { useRef, useState, useCallback } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function ZoomableImage({
  src, alt, children,
}: { src: string; alt: string; children?: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastDist = useRef<number | null>(null);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const clamp = useCallback((nextScale: number, nextTx: number, nextTy: number) => {
    const el = containerRef.current;
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    if (!el) return { scale: s, tx: nextTx, ty: nextTy };
    const rect = el.getBoundingClientRect();
    const maxX = (rect.width * (s - 1)) / 2 + rect.width * 0.4;
    const maxY = (rect.height * (s - 1)) / 2 + rect.height * 0.4;
    return {
      scale: s,
      tx: Math.min(maxX, Math.max(-maxX, nextTx)),
      ty: Math.min(maxY, Math.max(-maxY, nextTy)),
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragStart.current = { x: e.clientX, y: e.clientY, tx, ty };
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      lastDist.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (lastDist.current) {
        const result = clamp(scale * (dist / lastDist.current), tx, ty);
        setScale(result.scale);
      }
      lastDist.current = dist;
    } else if (pointers.current.size === 1 && dragStart.current && scale > 1) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const result = clamp(scale, dragStart.current.tx + dx, dragStart.current.ty + dy);
      setTx(result.tx);
      setTy(result.ty);
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    lastDist.current = null;
    if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()];
      dragStart.current = { x: p.x, y: p.y, tx, ty };
    } else {
      dragStart.current = null;
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const result = clamp(scale - e.deltaY * 0.01, tx, ty);
    setScale(result.scale);
    setTx(result.tx);
    setTy(result.ty);
  };

  const reset = () => { setScale(1); setTx(0); setTy(0); };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden touch-none select-none bg-white"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={endPointer}
      onWheel={onWheel}
      onDoubleClick={reset}
    >
      <div
        className="relative origin-center"
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-auto block pointer-events-none" draggable={false} />
        {children}
      </div>
    </div>
  );
}
