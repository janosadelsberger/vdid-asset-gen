"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  CustomTemplate,
  NormalizedBox,
  TemplateElement,
} from "@/lib/custom-template";
import { ELEMENT_KIND_LABELS } from "@/lib/custom-template";

export type ElementPropertiesProps = {
  element: TemplateElement | null;
  onChange: (element: TemplateElement) => void;
};

function BoxFields({
  box,
  onChange,
}: {
  box: NormalizedBox;
  onChange: (box: NormalizedBox) => void;
}) {
  const fields: (keyof NormalizedBox)[] = ["x", "y", "w", "h"];
  const labels = { x: "X", y: "Y", w: "Breite", h: "Höhe" };
  return (
    <div className="grid grid-cols-2 gap-2">
      {fields.map((key) => (
        <div key={key} className="space-y-1">
          <Label className="text-xs">{labels[key]}</Label>
          <Input
            type="number"
            step={0.01}
            min={0}
            max={1}
            value={Math.round(box[key] * 1000) / 1000}
            onChange={(e) =>
              onChange({ ...box, [key]: Number(e.target.value) })
            }
          />
        </div>
      ))}
    </div>
  );
}

export function ElementProperties({ element, onChange }: ElementPropertiesProps) {
  if (!element) {
    return (
      <p className="text-sm text-slate-500">
        Element auswählen oder neues hinzufügen.
      </p>
    );
  }

  const patch = (partial: Partial<TemplateElement>) =>
    onChange({ ...element, ...partial } as TemplateElement);

  const patchBox = (box: NormalizedBox) => patch({ box } as Partial<TemplateElement>);

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-900">
        {ELEMENT_KIND_LABELS[element.kind]}
      </p>

      <BoxFields box={element.box} onChange={patchBox} />

      {element.kind === "text" && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Feld-ID</Label>
            <Input
              value={element.field}
              onChange={(e) => patch({ field: e.target.value } as Partial<TemplateElement>)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Label</Label>
            <Input
              value={element.label}
              onChange={(e) => patch({ label: e.target.value } as Partial<TemplateElement>)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Standardtext</Label>
            <Input
              value={element.defaultText}
              onChange={(e) =>
                patch({ defaultText: e.target.value } as Partial<TemplateElement>)
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Schriftgröße (Anteil Höhe)</Label>
            <Input
              type="number"
              step={0.005}
              min={0.01}
              max={0.2}
              value={element.style.heightFraction}
              onChange={(e) =>
                onChange({
                  ...element,
                  style: {
                    ...element.style,
                    heightFraction: Number(e.target.value),
                  },
                })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="autoFit"
              checked={element.style.autoFit}
              onChange={(e) =>
                onChange({
                  ...element,
                  style: { ...element.style, autoFit: e.target.checked },
                })
              }
            />
            <Label htmlFor="autoFit" className="cursor-pointer text-xs">
              Auto-Anpassung
            </Label>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ausrichtung</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={element.style.align}
              onChange={(e) =>
                onChange({
                  ...element,
                  style: {
                    ...element.style,
                    align: e.target.value as "left" | "right",
                  },
                })
              }
            >
              <option value="left">Links</option>
              <option value="right">Rechts</option>
            </select>
          </div>
        </>
      )}

      {(element.kind === "image" || element.kind === "partnerLogo") && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Slot-ID</Label>
            <Input
              value={element.slot}
              onChange={(e) => patch({ slot: e.target.value } as Partial<TemplateElement>)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Label</Label>
            <Input
              value={element.label}
              onChange={(e) => patch({ label: e.target.value } as Partial<TemplateElement>)}
            />
          </div>
        </>
      )}

      {element.kind === "logo" && (
        <div className="space-y-1">
          <Label className="text-xs">Variante</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={element.variant}
            onChange={(e) =>
              onChange({
                ...element,
                variant: e.target.value as "auto" | "dark" | "white",
              })
            }
          >
            <option value="auto">Automatisch</option>
            <option value="dark">Dunkel</option>
            <option value="white">Weiß</option>
          </select>
        </div>
      )}

      {element.kind === "rect" && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Farbe</Label>
            <Input
              type="color"
              value={element.fill}
              onChange={(e) =>
                onChange({ ...element, fill: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Deckkraft</Label>
            <Input
              type="number"
              step={0.1}
              min={0}
              max={1}
              value={element.opacity}
              onChange={(e) =>
                onChange({ ...element, opacity: Number(e.target.value) })
              }
            />
          </div>
        </>
      )}

      {element.kind === "line" && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Farbe</Label>
            <Input
              type="color"
              value={element.color}
              onChange={(e) =>
                onChange({ ...element, color: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Stärke (Anteil Höhe)</Label>
            <Input
              type="number"
              step={0.001}
              min={0.001}
              max={0.05}
              value={element.thicknessFraction}
              onChange={(e) =>
                onChange({
                  ...element,
                  thicknessFraction: Number(e.target.value),
                })
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

export type TemplateMetaFieldsProps = {
  template: CustomTemplate;
  onChange: (template: CustomTemplate) => void;
};

export function TemplateMetaFields({ template, onChange }: TemplateMetaFieldsProps) {
  return (
    <div className="space-y-3 border-b border-slate-200 pb-4">
      <div className="space-y-1">
        <Label className="text-xs">Vorlagenname</Label>
        <Input
          value={template.name}
          onChange={(e) => onChange({ ...template, name: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Hintergrund</Label>
        <Input
          type="color"
          value={template.backgroundColor}
          onChange={(e) =>
            onChange({ ...template, backgroundColor: e.target.value })
          }
        />
      </div>
    </div>
  );
}
