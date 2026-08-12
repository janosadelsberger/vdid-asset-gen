import type { SlideType } from "@/lib/lab-slide-render";
import {
  createElementId,
  type CustomTemplate,
  type ImageTemplateElement,
  type LineTemplateElement,
  type LogoTemplateElement,
  type PartnerLogoTemplateElement,
  type RectTemplateElement,
  type TemplateElement,
  type TextTemplateElement,
} from "@/lib/custom-template";
import { SLIDE_TYPE_LABELS } from "@/components/vdidlab/slide-template-picker";

const M = 0.08;
const CW = 1 - M * 2;

type ElementSeed =
  | Omit<TextTemplateElement, "id">
  | Omit<ImageTemplateElement, "id">
  | Omit<LogoTemplateElement, "id">
  | Omit<PartnerLogoTemplateElement, "id">
  | Omit<RectTemplateElement, "id">
  | Omit<LineTemplateElement, "id">;

function el(partial: ElementSeed): TemplateElement {
  return { ...partial, id: createElementId() } as TemplateElement;
}

function titleElements(): TemplateElement[] {
  return [
    el({
      kind: "text",
      field: "formatLabel",
      label: "Formatzeile",
      defaultText: "VDID Fortbildung",
      style: {
        heightFraction: 0.028,
        fontWeight: "400",
        baseColor: "#5A5A5A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: M, y: 0.1, w: CW, h: 0.05 },
    }),
    el({
      kind: "text",
      field: "heading",
      label: "Titel",
      defaultText: "VDID Event",
      style: {
        heightFraction: 0.065,
        fontWeight: "700",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.15,
        autoFit: true,
      },
      box: { x: M, y: 0.18, w: CW, h: 0.25 },
    }),
    el({
      kind: "text",
      field: "dateLine",
      label: "Datum",
      defaultText: "01.01.2026 | 10:00",
      style: {
        heightFraction: 0.032,
        fontWeight: "400",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: M, y: 0.48, w: CW, h: 0.06 },
    }),
    el({
      kind: "logo",
      variant: "dark",
      box: { x: M, y: 0.82, w: 0.22, h: 0.1 },
    }),
  ];
}

function eventPhotoElements(): TemplateElement[] {
  return [
    el({
      kind: "text",
      field: "formatLabel",
      label: "Formatzeile",
      defaultText: "VDID Design.Wissen.Diskurs.",
      style: {
        heightFraction: 0.028,
        fontWeight: "400",
        baseColor: "#5A5A5A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: M, y: 0.06, w: CW, h: 0.05 },
    }),
    el({
      kind: "text",
      field: "heading",
      label: "Titel",
      defaultText: "VDID Event",
      style: {
        heightFraction: 0.055,
        fontWeight: "700",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.15,
        autoFit: true,
      },
      box: { x: M, y: 0.12, w: CW, h: 0.18 },
    }),
    el({
      kind: "text",
      field: "dateLine",
      label: "Datum",
      defaultText: "01.01.2026 | 18:00",
      style: {
        heightFraction: 0.03,
        fontWeight: "400",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: M, y: 0.3, w: CW, h: 0.05 },
    }),
    el({
      kind: "image",
      slot: "photo",
      label: "Foto",
      box: { x: M, y: 0.38, w: CW, h: 0.38 },
    }),
    el({
      kind: "text",
      field: "name",
      label: "Name",
      defaultText: "mit Name",
      style: {
        heightFraction: 0.028,
        fontWeight: "700",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "right",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: 0.45, y: 0.8, w: 0.47, h: 0.05 },
    }),
    el({
      kind: "logo",
      variant: "dark",
      box: { x: M, y: 0.82, w: 0.22, h: 0.1 },
    }),
  ];
}

function fullImageElements(): TemplateElement[] {
  return [
    el({
      kind: "image",
      slot: "photo",
      label: "Foto",
      box: { x: 0, y: 0, w: 1, h: 1 },
    }),
    el({
      kind: "logo",
      variant: "auto",
      box: { x: M, y: 0.82, w: 0.22, h: 0.1 },
    }),
  ];
}

function quoteElements(): TemplateElement[] {
  return [
    el({
      kind: "text",
      field: "heading",
      label: "Titel",
      defaultText: "Zum Event sagt",
      style: {
        heightFraction: 0.04,
        fontWeight: "700",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.2,
        autoFit: false,
      },
      box: { x: M, y: 0.1, w: CW, h: 0.08 },
    }),
    el({
      kind: "text",
      field: "body",
      label: "Zitat",
      defaultText: "„Ein überzeugendes Zitat.“",
      style: {
        heightFraction: 0.048,
        fontWeight: "400",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.35,
        autoFit: true,
      },
      box: { x: M, y: 0.22, w: CW, h: 0.4 },
    }),
    el({
      kind: "text",
      field: "name",
      label: "Name",
      defaultText: "Name",
      style: {
        heightFraction: 0.03,
        fontWeight: "700",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "right",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: 0.4, y: 0.78, w: 0.52, h: 0.05 },
    }),
    el({
      kind: "text",
      field: "role",
      label: "Rolle",
      defaultText: "Rolle",
      style: {
        heightFraction: 0.026,
        fontWeight: "400",
        baseColor: "#5A5A5A",
        highlightColor: "#0A2CD9",
        align: "right",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: 0.4, y: 0.83, w: 0.52, h: 0.05 },
    }),
    el({
      kind: "logo",
      variant: "dark",
      box: { x: M, y: 0.82, w: 0.22, h: 0.1 },
    }),
  ];
}

function ctaElements(): TemplateElement[] {
  return [
    el({
      kind: "text",
      field: "heading",
      label: "Titel",
      defaultText: "Jetzt anmelden",
      style: {
        heightFraction: 0.06,
        fontWeight: "700",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.15,
        autoFit: true,
      },
      box: { x: M, y: 0.12, w: CW, h: 0.2 },
    }),
    el({
      kind: "text",
      field: "body",
      label: "Text",
      defaultText: "Kurzer Text mit Handlungsaufforderung.",
      style: {
        heightFraction: 0.038,
        fontWeight: "400",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.35,
        autoFit: true,
      },
      box: { x: M, y: 0.35, w: CW, h: 0.25 },
    }),
    el({
      kind: "text",
      field: "contact",
      label: "Kontakt",
      defaultText: "Anmeldungen an mail@vdid.de",
      style: {
        heightFraction: 0.03,
        fontWeight: "400",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: M, y: 0.65, w: CW, h: 0.08 },
    }),
    el({
      kind: "logo",
      variant: "dark",
      box: { x: M, y: 0.82, w: 0.22, h: 0.1 },
    }),
  ];
}

function coBrandedElements(): TemplateElement[] {
  return [
    ...eventPhotoElements().filter((e) => e.kind !== "logo"),
    el({
      kind: "partnerLogo",
      slot: "partner",
      label: "Partner-Logo",
      box: { x: 0.68, y: 0.82, w: 0.24, h: 0.1 },
    }),
    el({
      kind: "logo",
      variant: "dark",
      box: { x: M, y: 0.82, w: 0.22, h: 0.1 },
    }),
  ];
}

function freeformElements(): TemplateElement[] {
  return [
    el({
      kind: "text",
      field: "formatLabel",
      label: "Formatzeile",
      defaultText: "VDID Design.Wissen.Diskurs.",
      style: {
        heightFraction: 0.028,
        fontWeight: "400",
        baseColor: "#5A5A5A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: M, y: 0.06, w: CW, h: 0.05 },
    }),
    el({
      kind: "text",
      field: "heading",
      label: "Titel",
      defaultText: "Titel",
      style: {
        heightFraction: 0.05,
        fontWeight: "700",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.15,
        autoFit: true,
      },
      box: { x: M, y: 0.12, w: CW, h: 0.15 },
    }),
    el({
      kind: "text",
      field: "body",
      label: "Text",
      defaultText: "Text",
      style: {
        heightFraction: 0.035,
        fontWeight: "400",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "left",
        lineHeightRatio: 1.35,
        autoFit: true,
      },
      box: { x: M, y: 0.28, w: CW, h: 0.2 },
    }),
    el({
      kind: "image",
      slot: "photo",
      label: "Foto",
      box: { x: M, y: 0.5, w: CW, h: 0.28 },
    }),
    el({
      kind: "text",
      field: "name",
      label: "Name",
      defaultText: "Name",
      style: {
        heightFraction: 0.028,
        fontWeight: "700",
        baseColor: "#1A1A1A",
        highlightColor: "#0A2CD9",
        align: "right",
        lineHeightRatio: 1.4,
        autoFit: false,
      },
      box: { x: 0.45, y: 0.8, w: 0.47, h: 0.05 },
    }),
    el({
      kind: "logo",
      variant: "dark",
      box: { x: M, y: 0.82, w: 0.22, h: 0.1 },
    }),
  ];
}

const PRESET_BUILDERS: Record<
  Exclude<SlideType, "custom">,
  () => TemplateElement[]
> = {
  title: titleElements,
  eventPhoto: eventPhotoElements,
  fullImage: fullImageElements,
  quote: quoteElements,
  cta: ctaElements,
  coBranded: coBrandedElements,
  freeform: freeformElements,
};

export type BuiltinTemplatePreset = {
  slideType: Exclude<SlideType, "custom">;
  name: string;
};

export const BUILTIN_TEMPLATE_PRESETS: BuiltinTemplatePreset[] = (
  Object.keys(PRESET_BUILDERS) as Exclude<SlideType, "custom">[]
).map((slideType) => ({
  slideType,
  name: SLIDE_TYPE_LABELS[slideType],
}));

export function createBuiltinTemplatePreset(
  slideType: Exclude<SlideType, "custom">,
  baseAspect: number,
): CustomTemplate {
  const name = SLIDE_TYPE_LABELS[slideType];
  return {
    id: crypto.randomUUID(),
    name: `${name} (Vorlage)`,
    baseAspect,
    backgroundColor: "#F0F0F0",
    elements: PRESET_BUILDERS[slideType](),
    guides: { vertical: [], horizontal: [] },
  };
}
