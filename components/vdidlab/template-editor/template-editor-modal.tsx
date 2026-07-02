"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  cloneTemplate,
  createDefaultTemplate,
  exportTemplatesJson,
  importTemplatesJsonFile,
  saveCustomTemplatesToStorage,
  type CustomTemplate,
  type TemplateElement,
} from "@/lib/custom-template";
import type { RenderAssets } from "@/lib/lab-slide-render";
import { EditorCanvas } from "@/components/vdidlab/template-editor/editor-canvas";
import {
  ElementProperties,
  TemplateMetaFields,
} from "@/components/vdidlab/template-editor/element-properties";
import {
  ElementLayerList,
  TemplateList,
} from "@/components/vdidlab/template-editor/template-list";

export type TemplateEditorModalProps = {
  open: boolean;
  onClose: () => void;
  templates: CustomTemplate[];
  onTemplatesChange: (templates: CustomTemplate[]) => void;
  assets: RenderAssets;
  /** Current preview aspect (width/height) */
  editorAspect: number;
};

export function TemplateEditorModal({
  open,
  onClose,
  templates,
  onTemplatesChange,
  assets,
  editorAspect,
}: TemplateEditorModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(
    templates[0]?.id ?? null,
  );
  const [selectedElementId, setSelectedElementId] = React.useState<string | null>(
    null,
  );
  const importRef = React.useRef<HTMLInputElement>(null);

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) ?? null;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  React.useEffect(() => {
    if (templates.length === 0) {
      setSelectedTemplateId(null);
      return;
    }
    if (!selectedTemplateId || !templates.some((t) => t.id === selectedTemplateId)) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const persist = (next: CustomTemplate[]) => {
    onTemplatesChange(next);
    saveCustomTemplatesToStorage(next);
  };

  const updateTemplate = (updated: CustomTemplate) => {
    persist(
      templates.map((t) =>
        t.id === updated.id
          ? { ...updated, baseAspect: editorAspect }
          : t,
      ),
    );
  };

  const handleNew = () => {
    const t = createDefaultTemplate();
    t.baseAspect = editorAspect;
    persist([...templates, t]);
    setSelectedTemplateId(t.id);
    setSelectedElementId(null);
  };

  const handleDuplicate = (id: string) => {
    const src = templates.find((t) => t.id === id);
    if (!src) return;
    const copy = cloneTemplate(src);
    copy.baseAspect = editorAspect;
    persist([...templates, copy]);
    setSelectedTemplateId(copy.id);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Vorlage wirklich löschen?")) return;
    const next = templates.filter((t) => t.id !== id);
    persist(next);
    if (selectedTemplateId === id) {
      setSelectedTemplateId(next[0]?.id ?? null);
    }
  };

  const handleImport = () => importRef.current?.click();

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imported = await importTemplatesJsonFile(file);
    if (imported.length === 0) return;
    const merged = [...templates];
    for (const t of imported) {
      merged.push({ ...t, id: crypto.randomUUID(), baseAspect: editorAspect });
    }
    persist(merged);
    e.target.value = "";
  };

  const selectedElement =
    selectedTemplate?.elements.find((el) => el.id === selectedElementId) ?? null;

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex flex-col bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label="Vorlagen bearbeiten"
    >
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <CardTitle className="text-lg">Vorlagen bearbeiten</CardTitle>
          <Button type="button" variant="outline" onClick={onClose}>
            Schließen
          </Button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[220px_1fr_260px]">
          <aside className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
            <TemplateList
              templates={templates}
              selectedId={selectedTemplateId}
              assets={assets}
              onSelect={(id) => {
                setSelectedTemplateId(id);
                setSelectedElementId(null);
              }}
              onNew={handleNew}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onImport={handleImport}
              onExport={() => exportTemplatesJson(templates)}
            />
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={onImportFile}
            />
          </aside>

          <main className="min-h-0 overflow-y-auto p-4">
            {selectedTemplate ? (
              <EditorCanvas
                template={{ ...selectedTemplate, baseAspect: editorAspect }}
                assets={assets}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateTemplate={updateTemplate}
                onDeleteSelected={() => {
                  if (!selectedTemplate || !selectedElementId) return;
                  updateTemplate({
                    ...selectedTemplate,
                    elements: selectedTemplate.elements.filter(
                      (el) => el.id !== selectedElementId,
                    ),
                  });
                  setSelectedElementId(null);
                }}
              />
            ) : (
              <p className="text-sm text-slate-500">
                Vorlage anlegen oder aus der Liste wählen.
              </p>
            )}
          </main>

          <aside className="border-t border-slate-200 p-4 lg:border-l lg:border-t-0">
            {selectedTemplate && (
              <>
                <TemplateMetaFields
                  template={selectedTemplate}
                  onChange={updateTemplate}
                />
                <div className="mb-3 mt-4">
                  <p className="mb-2 text-xs font-medium text-slate-500">Ebenen</p>
                  <ElementLayerList
                    elements={selectedTemplate.elements}
                    selectedId={selectedElementId}
                    onSelect={setSelectedElementId}
                    onReorder={(elements) =>
                      updateTemplate({ ...selectedTemplate, elements })
                    }
                  />
                </div>
                <ElementProperties
                  element={selectedElement}
                  onChange={(element) => {
                    updateTemplate({
                      ...selectedTemplate,
                      elements: selectedTemplate.elements.map((el) =>
                        el.id === element.id ? element : el,
                      ),
                    });
                  }}
                />
              </>
            )}
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  );
}
