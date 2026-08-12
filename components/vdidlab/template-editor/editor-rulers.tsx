"use client";

import React from "react";
import type { TemplateGuides } from "@/lib/custom-template";
import type { ActiveSnapLines } from "@/lib/editor-snap";
import { cn } from "@/lib/utils";

export const RULER_SIZE = 24;

export type SelectedGuide =
  | { orientation: "vertical"; index: number }
  | { orientation: "horizontal"; index: number };

export type GuideDrag =
  | { orientation: "vertical"; position: number }
  | { orientation: "horizontal"; position: number };

export type EditorRulersProps = {
  guides: TemplateGuides;
  selectedGuide: SelectedGuide | null;
  guideDrag: GuideDrag | null;
  activeSnapLines: ActiveSnapLines;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onSelectGuide: (guide: SelectedGuide | null) => void;
  onStartGuideFromRuler: (
    orientation: "vertical" | "horizontal",
    clientX: number,
    clientY: number,
  ) => void;
  onGuideDragMove: (clientX: number, clientY: number) => void;
  onGuideDragEnd: (clientX: number, clientY: number) => void;
  onGuidePointerDown: (
    e: React.PointerEvent,
    orientation: "vertical" | "horizontal",
    index: number,
  ) => void;
  children: React.ReactNode;
};

function RulerTicks({ orientation }: { orientation: "horizontal" | "vertical" }) {
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const isH = orientation === "horizontal";
  return (
    <>
      {ticks.map((pct) => (
        <span
          key={pct}
          className={cn(
            "absolute text-[9px] text-slate-400",
            isH ? "top-0.5 -translate-x-1/2" : "left-0.5 -translate-y-1/2",
          )}
          style={isH ? { left: `${pct}%` } : { top: `${pct}%` }}
        >
          {pct}
        </span>
      ))}
    </>
  );
}

export function EditorRulers({
  guides,
  selectedGuide,
  guideDrag,
  activeSnapLines,
  onSelectGuide,
  onStartGuideFromRuler,
  onGuideDragMove,
  onGuideDragEnd,
  onGuidePointerDown,
  children,
}: EditorRulersProps) {
  return (
    <div
      className="mx-auto grid w-full max-w-[540px] select-none"
      style={{
        gridTemplateColumns: `${RULER_SIZE}px 1fr`,
        gridTemplateRows: `${RULER_SIZE}px 1fr`,
      }}
      onPointerMove={(e) => {
        if (guideDrag) onGuideDragMove(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (guideDrag) onGuideDragEnd(e.clientX, e.clientY);
      }}
      onPointerLeave={(e) => {
        if (guideDrag) onGuideDragEnd(e.clientX, e.clientY);
      }}
    >
      <div className="border-b border-r border-slate-200 bg-slate-50" />

      <div
        className="relative cursor-crosshair border-b border-slate-200 bg-slate-50"
        onPointerDown={(e) => {
          e.preventDefault();
          onStartGuideFromRuler("horizontal", e.clientX, e.clientY);
        }}
      >
        <RulerTicks orientation="horizontal" />
      </div>

      <div
        className="relative cursor-crosshair border-r border-slate-200 bg-slate-50"
        onPointerDown={(e) => {
          e.preventDefault();
          onStartGuideFromRuler("vertical", e.clientX, e.clientY);
        }}
      >
        <RulerTicks orientation="vertical" />
      </div>

      <div className="relative min-h-0 min-w-0">
        {children}

        {guides.vertical.map((pos, index) => {
          const selected =
            selectedGuide?.orientation === "vertical" &&
            selectedGuide.index === index;
          const isActive = activeSnapLines.vertical === pos;
          return (
            <div
              key={`v-${index}-${pos}`}
              className={cn(
                "absolute top-0 bottom-0 z-20 w-px cursor-col-resize",
                selected || isActive ? "bg-vdidBlue" : "bg-cyan-500/70",
              )}
              style={{ left: `${pos * 100}%` }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onGuidePointerDown(e, "vertical", index);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectGuide({ orientation: "vertical", index });
              }}
            />
          );
        })}

        {guides.horizontal.map((pos, index) => {
          const selected =
            selectedGuide?.orientation === "horizontal" &&
            selectedGuide.index === index;
          const isActive = activeSnapLines.horizontal === pos;
          return (
            <div
              key={`h-${index}-${pos}`}
              className={cn(
                "absolute left-0 right-0 z-20 h-px cursor-row-resize",
                selected || isActive ? "bg-vdidBlue" : "bg-cyan-500/70",
              )}
              style={{ top: `${pos * 100}%` }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onGuidePointerDown(e, "horizontal", index);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectGuide({ orientation: "horizontal", index });
              }}
            />
          );
        })}

        {guideDrag?.orientation === "vertical" && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-30 w-px border-l border-dashed border-vdidBlue"
            style={{ left: `${guideDrag.position * 100}%` }}
          />
        )}
        {guideDrag?.orientation === "horizontal" && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-30 h-px border-t border-dashed border-vdidBlue"
            style={{ top: `${guideDrag.position * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}
