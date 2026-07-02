"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  createDefaultElement,
  ELEMENT_KIND_LABELS,
  type CustomTemplate,
  type NormalizedBox,
  type TemplateElement,
} from "@/lib/custom-template";
import { renderCustomTemplateSampleToContext } from "@/lib/custom-template-render";
import type { RenderAssets } from "@/lib/lab-slide-render";
import { cn } from "@/lib/utils";

const EDITOR_WIDTH = 540;

export type EditorCanvasProps = {
  template: CustomTemplate;
  assets: RenderAssets;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateTemplate: (template: CustomTemplate) => void;
  onDeleteSelected: () => void;
};

type DragMode =
  | { type: "move"; id: string; startX: number; startY: number; startBox: NormalizedBox }
  | {
      type: "resize";
      id: string;
      startX: number;
      startY: number;
      startBox: NormalizedBox;
    };

export function EditorCanvas({
  template,
  assets,
  selectedElementId,
  onSelectElement,
  onUpdateTemplate,
  onDeleteSelected,
}: EditorCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<DragMode | null>(null);

  const height = Math.round(EDITOR_WIDTH / template.baseAspect);

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = EDITOR_WIDTH;
    canvas.height = height;
    renderCustomTemplateSampleToContext(
      ctx,
      template,
      { width: EDITOR_WIDTH, height },
      assets,
    );
  }, [template, assets, height]);

  const updateElement = (id: string, patch: Partial<TemplateElement>) => {
    onUpdateTemplate({
      ...template,
      elements: template.elements.map((el) =>
        el.id === id ? ({ ...el, ...patch } as TemplateElement) : el,
      ),
    });
  };

  const pointerToNorm = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { nx: 0, ny: 0 };
    return {
      nx: (clientX - rect.left) / rect.width,
      ny: (clientY - rect.top) / rect.height,
    };
  };

  const onPointerDown = (
    e: React.PointerEvent,
    el: TemplateElement,
    mode: "move" | "resize",
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onSelectElement(el.id);
    dragRef.current = {
      type: mode,
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...el.box },
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - drag.startX) / rect.width;
    const dy = (e.clientY - drag.startY) / rect.height;
    const { startBox } = drag;

    if (drag.type === "move") {
      const w = startBox.w;
      const h = startBox.h;
      updateElement(drag.id, {
        box: {
          ...startBox,
          x: Math.min(1 - w, Math.max(0, startBox.x + dx)),
          y: Math.min(1 - h, Math.max(0, startBox.y + dy)),
        },
      });
    } else {
      updateElement(drag.id, {
        box: {
          ...startBox,
          w: Math.min(1 - startBox.x, Math.max(0.02, startBox.w + dx)),
          h: Math.min(1 - startBox.y, Math.max(0.02, startBox.h + dy)),
        },
      });
    }
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const addElement = (kind: TemplateElement["kind"]) => {
    const el = createDefaultElement(kind);
    onUpdateTemplate({
      ...template,
      elements: [...template.elements, el],
    });
    onSelectElement(el.id);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {(Object.keys(ELEMENT_KIND_LABELS) as TemplateElement["kind"][]).map(
          (kind) => (
            <Button
              key={kind}
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => addElement(kind)}
            >
              + {ELEMENT_KIND_LABELS[kind]}
            </Button>
          ),
        )}
        {selectedElementId && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs text-red-600"
            onClick={onDeleteSelected}
          >
            Löschen
          </Button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-[540px] select-none"
        style={{ aspectRatio: `${template.baseAspect}` }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={() => onSelectElement(null)}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full rounded-md border border-slate-200"
        />
        {template.elements.map((el) => {
          const selected = el.id === selectedElementId;
          const left = `${el.box.x * 100}%`;
          const top = `${el.box.y * 100}%`;
          const width = `${el.box.w * 100}%`;
          const heightPct = `${el.box.h * 100}%`;
          return (
            <div
              key={el.id}
              className={cn(
                "absolute border-2",
                selected ? "border-vdidBlue" : "border-transparent hover:border-vdidBlue/40",
              )}
              style={{ left, top, width, height: heightPct }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement(el.id);
              }}
              onPointerDown={(e) => onPointerDown(e, el, "move")}
            >
              <div
                className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize rounded-sm bg-vdidBlue"
                onPointerDown={(e) => onPointerDown(e, el, "resize")}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
