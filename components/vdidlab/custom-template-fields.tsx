"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageDropZone } from "@/components/image-drop-zone";
import type { CustomTemplate } from "@/lib/custom-template";
import type { LabSlide } from "@/lib/lab-slide-render";
import { MARKDOWN_FORMAT_HINT } from "@/lib/canvas-richtext";

export type CustomTemplateFieldsProps = {
  slide: LabSlide;
  template: CustomTemplate;
  onFieldChange: (field: string, value: string) => void;
  onImageUpload: (
    slot: string,
    kind: "image" | "partnerLogo",
    file: File | undefined,
  ) => void;
  onImageClear: (slot: string, kind: "image" | "partnerLogo") => void;
};

export function CustomTemplateFields({
  slide,
  template,
  onFieldChange,
  onImageUpload,
  onImageClear,
}: CustomTemplateFieldsProps) {
  const textElements = template.elements.filter((el) => el.kind === "text");
  const imageElements = template.elements.filter(
    (el) => el.kind === "image" || el.kind === "partnerLogo",
  );

  if (textElements.length === 0 && imageElements.length === 0) {
    return (
      <p className="text-sm text-slate-500 md:col-span-2">
        Diese Vorlage hat keine bearbeitbaren Platzhalter.
      </p>
    );
  }

  return (
    <>
      {textElements.map((el) => (
        <div key={el.id} className="space-y-1 md:col-span-2">
          <Label htmlFor={`custom-field-${el.field}`}>{el.label || el.field}</Label>
          {el.defaultText.length > 60 || el.field.includes("body") ? (
            <Textarea
              id={`custom-field-${el.field}`}
              value={slide.fields?.[el.field] ?? ""}
              onChange={(e) => onFieldChange(el.field, e.target.value)}
              rows={3}
              className="resize-y"
            />
          ) : (
            <Input
              id={`custom-field-${el.field}`}
              value={slide.fields?.[el.field] ?? ""}
              onChange={(e) => onFieldChange(el.field, e.target.value)}
            />
          )}
          <p className="text-xs text-slate-500">{MARKDOWN_FORMAT_HINT}</p>
        </div>
      ))}
      {imageElements.map((el) => {
        const slot = el.slot;
        const url = slide.images?.[slot]?.url ?? null;
        return (
          <div key={el.id} className="space-y-1 md:col-span-2">
            <Label>{el.label || slot}</Label>
            <ImageDropZone
              id={`custom-image-${slot}`}
              previewUrl={url}
              onFile={(file) =>
                onImageUpload(slot, el.kind === "partnerLogo" ? "partnerLogo" : "image", file)
              }
              onClear={() =>
                onImageClear(slot, el.kind === "partnerLogo" ? "partnerLogo" : "image")
              }
              chooseLabel="Bild wählen"
            />
          </div>
        );
      })}
    </>
  );
}
