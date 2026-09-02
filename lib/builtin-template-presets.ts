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
import {
  getLabLayout,
  LAB_MARGIN_RATIO,
  LAB_REF_PX,
  LAB_TYPE,
  labLogoNormalizedBox,
} from "@/lib/lab-layout";
import { LAB_BLUE, LAB_MUTED, LAB_TEXT } from "@/lib/lab-theme";
import { SLIDE_TYPE_LABELS } from "@/components/vdidlab/slide-template-picker";

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

function pxBox(
  x: number,
  y: number,
  w: number,
  h: number,
  width: number,
  height: number,
) {
  return {
    x: x / width,
    y: y / height,
    w: w / width,
    h: h / height,
  };
}

function textStyle(
  fontPx: number,
  height: number,
  extras: Partial<TextTemplateElement["style"]> & {
    fontWeight: string;
    align?: "left" | "right";
    autoFit?: boolean;
    lineHeightRatio?: number;
    baseColor?: string;
    highlightColor?: string;
  },
): TextTemplateElement["style"] {
  return {
    heightFraction: fontPx / height,
    fontWeight: extras.fontWeight,
    baseColor: extras.baseColor ?? LAB_TEXT,
    highlightColor: extras.highlightColor ?? LAB_BLUE,
    align: extras.align ?? "left",
    lineHeightRatio: extras.lineHeightRatio ?? 1.4,
    autoFit: extras.autoFit ?? false,
  };
}

function layoutForAspect(baseAspect: number) {
  const width = LAB_REF_PX;
  const height = width / Math.max(0.01, baseAspect);
  const layout = getLabLayout(width, height);
  const box = (x: number, y: number, w: number, h: number) =>
    pxBox(x, y, w, h, width, height);
  return { width, height, layout, box };
}

function logoEl(
  baseAspect: number,
  variant: LogoTemplateElement["variant"] = "dark",
): TemplateElement {
  return el({
    kind: "logo",
    variant,
    box: labLogoNormalizedBox(baseAspect),
  });
}

function formatLabelEl(
  metrics: ReturnType<typeof layoutForAspect>,
  y: number,
  defaultText: string,
): TemplateElement {
  const size = LAB_TYPE.formatLabel * metrics.layout.scale;
  return el({
    kind: "text",
    field: "formatLabel",
    label: "Formatzeile",
    defaultText,
    style: textStyle(size, metrics.height, {
      fontWeight: "400",
      baseColor: LAB_MUTED,
      autoFit: false,
      lineHeightRatio: 1.4,
    }),
    box: metrics.box(
      metrics.layout.marginX,
      y,
      metrics.layout.contentWidth,
      size * 1.55,
    ),
  });
}

function titleElements(baseAspect: number): TemplateElement[] {
  const m = layoutForAspect(baseAspect);
  const { layout } = m;
  const labelSize = LAB_TYPE.formatLabel * layout.scale;
  const headingSize = LAB_TYPE.titleHeading * layout.scale;
  const dateSize = LAB_TYPE.titleDate * layout.scale;

  let y = layout.marginY;
  const format = formatLabelEl(m, y, "VDID Fortbildung");
  y += labelSize * 1.4 + labelSize * 0.5;

  const dateH = dateSize * 1.8;
  const headingH = headingSize * 1.08 * 2.6;

  const heading = el({
    kind: "text",
    field: "heading",
    label: "Titel",
    defaultText: "VDID Event",
    style: textStyle(headingSize, m.height, {
      fontWeight: "700",
      lineHeightRatio: 1.08,
      autoFit: true,
    }),
    box: m.box(layout.marginX, y, layout.contentWidth, headingH),
  });

  const dateY = y + headingH + headingSize * 0.28;
  const date = el({
    kind: "text",
    field: "dateLine",
    label: "Datum",
    defaultText: "01.01.2026 | 10:00",
    style: textStyle(dateSize, m.height, {
      fontWeight: "400",
      lineHeightRatio: 1.4,
      autoFit: false,
    }),
    box: m.box(layout.marginX, dateY, layout.contentWidth, dateH),
  });

  return [format, heading, date, logoEl(baseAspect)];
}

function eventPhotoLikeElements(
  baseAspect: number,
  opts: { presenter: boolean; defaultDate: string },
): TemplateElement[] {
  const m = layoutForAspect(baseAspect);
  const { layout } = m;
  const labelSize = LAB_TYPE.formatLabel * layout.scale;
  const headingSize = LAB_TYPE.eventHeading * layout.scale;
  const dateSize = LAB_TYPE.eventDate * layout.scale;
  const presenterSize = LAB_TYPE.presenter * layout.scale;

  let y = layout.marginY;
  const format = formatLabelEl(m, y, "VDID Design.Wissen.Diskurs.");
  y += labelSize * 1.4 + labelSize * 0.5;

  const headingH = headingSize * 1.08 * 2.3;
  const heading = el({
    kind: "text",
    field: "heading",
    label: "Titel",
    defaultText: "VDID Event",
    style: textStyle(headingSize, m.height, {
      fontWeight: "700",
      lineHeightRatio: 1.08,
      autoFit: true,
    }),
    box: m.box(layout.marginX, y, layout.contentWidth, headingH),
  });
  y += headingH + headingSize * 0.28;

  const dateH = dateSize * 1.7;
  const date = el({
    kind: "text",
    field: "dateLine",
    label: "Datum",
    defaultText: opts.defaultDate,
    style: textStyle(dateSize, m.height, {
      fontWeight: "400",
      lineHeightRatio: 1.4,
      autoFit: false,
    }),
    box: m.box(layout.marginX, y, layout.contentWidth, dateH),
  });

  const imageTop = y + dateH + layout.scale * 8;
  const footerReserve =
    layout.logoSize +
    layout.marginY +
    (opts.presenter ? presenterSize * 1.4 : 20 * layout.scale);
  const imageH = Math.max(40, layout.height - imageTop - footerReserve);

  const image = el({
    kind: "image",
    slot: "photo",
    label: "Foto",
    box: m.box(layout.marginX, imageTop, layout.contentWidth, imageH),
  });

  const elements: TemplateElement[] = [format, heading, date, image];

  if (opts.presenter) {
    const nameBaseline =
      layout.height - layout.marginY - layout.logoSize * 0.25;
    const nameY = nameBaseline - presenterSize;
    const nameX = layout.width * 0.45;
    elements.push(
      el({
        kind: "text",
        field: "name",
        label: "Name",
        defaultText: "mit Name",
        style: textStyle(presenterSize, m.height, {
          fontWeight: "700",
          align: "right",
          lineHeightRatio: 1.4,
          autoFit: false,
        }),
        box: m.box(
          nameX,
          nameY,
          layout.width - layout.marginX - nameX,
          presenterSize * 1.5,
        ),
      }),
    );
  }

  return elements;
}

function eventPhotoElements(baseAspect: number): TemplateElement[] {
  return [
    ...eventPhotoLikeElements(baseAspect, {
      presenter: true,
      defaultDate: "01.01.2026 | 18:00",
    }),
    logoEl(baseAspect),
  ];
}

function fullImageElements(baseAspect: number): TemplateElement[] {
  return [
    el({
      kind: "image",
      slot: "photo",
      label: "Foto",
      box: { x: 0, y: 0, w: 1, h: 1 },
    }),
    logoEl(baseAspect, "auto"),
  ];
}

function quoteElements(baseAspect: number): TemplateElement[] {
  const m = layoutForAspect(baseAspect);
  const { layout } = m;
  const headingSize = LAB_TYPE.quoteHeading * layout.scale;
  const bodySize = LAB_TYPE.quoteBody * layout.scale;
  const nameSize = LAB_TYPE.attributionName * layout.scale;
  const roleSize = LAB_TYPE.attributionRole * layout.scale;

  let y = layout.marginY;
  const headingH = headingSize * 1.1 * 1.6;
  const heading = el({
    kind: "text",
    field: "heading",
    label: "Titel",
    defaultText: "Zum Event sagt",
    style: textStyle(headingSize, m.height, {
      fontWeight: "700",
      lineHeightRatio: 1.1,
      autoFit: false,
    }),
    box: m.box(layout.marginX, y, layout.contentWidth, headingH),
  });
  y += headingH + headingSize * 0.55;

  const attrReserve = nameSize * 1.4 + roleSize * 1.4;
  const bodyBottom = layout.logoY - attrReserve;
  const bodyH = Math.max(bodySize * 1.3, bodyBottom - y);

  const body = el({
    kind: "text",
    field: "body",
    label: "Zitat",
    defaultText: "„Ein überzeugendes Zitat.“",
    style: textStyle(bodySize, m.height, {
      fontWeight: "400",
      lineHeightRatio: 1.3,
      autoFit: true,
    }),
    box: m.box(layout.marginX, y, layout.contentWidth, bodyH),
  });

  const attrX = layout.width * 0.4;
  const attrW = layout.width - layout.marginX - attrX;
  const nameBaseline =
    layout.height - layout.marginY - layout.logoSize * 0.25;
  const roleY = nameBaseline - roleSize;
  const nameY = roleY - nameSize * 1.4;

  return [
    heading,
    body,
    el({
      kind: "text",
      field: "name",
      label: "Name",
      defaultText: "Name",
      style: textStyle(nameSize, m.height, {
        fontWeight: "700",
        align: "right",
        autoFit: false,
      }),
      box: m.box(attrX, nameY, attrW, nameSize * 1.5),
    }),
    el({
      kind: "text",
      field: "role",
      label: "Rolle",
      defaultText: "Rolle",
      style: textStyle(roleSize, m.height, {
        fontWeight: "400",
        align: "right",
        autoFit: false,
      }),
      box: m.box(attrX, roleY, attrW, roleSize * 1.5),
    }),
    logoEl(baseAspect),
  ];
}

function ctaElements(baseAspect: number): TemplateElement[] {
  const m = layoutForAspect(baseAspect);
  const { layout } = m;
  const headingSize = LAB_TYPE.ctaHeading * layout.scale;
  const bodySize = LAB_TYPE.ctaBody * layout.scale;
  const contactSize = LAB_TYPE.ctaContact * layout.scale;

  let y = layout.marginY;
  const headingH = headingSize * 1.1 * 2.2;
  const heading = el({
    kind: "text",
    field: "heading",
    label: "Titel",
    defaultText: "Jetzt anmelden",
    style: textStyle(headingSize, m.height, {
      fontWeight: "700",
      lineHeightRatio: 1.1,
      autoFit: true,
      baseColor: LAB_BLUE,
      highlightColor: LAB_BLUE,
    }),
    box: m.box(layout.marginX, y, layout.contentWidth, headingH),
  });
  y += headingH + headingSize * 0.55;

  const contactH = contactSize * 1.6;
  const bodyBottom = layout.logoY - contactH - layout.marginY * 0.1;
  const bodyH = Math.max(bodySize * 1.3, bodyBottom - y);

  const body = el({
    kind: "text",
    field: "body",
    label: "Text",
    defaultText: "Kurzer Text mit Handlungsaufforderung.",
    style: textStyle(bodySize, m.height, {
      fontWeight: "400",
      lineHeightRatio: 1.3,
      autoFit: true,
    }),
    box: m.box(layout.marginX, y, layout.contentWidth, bodyH),
  });

  const contactBaseline =
    layout.height - layout.marginY - layout.logoSize * 0.25;
  const contactY = contactBaseline - contactSize;

  return [
    heading,
    body,
    el({
      kind: "text",
      field: "contact",
      label: "Kontakt",
      defaultText: "Anmeldungen an mail@vdid.de",
      style: textStyle(contactSize, m.height, {
        fontWeight: "400",
        align: "right",
        autoFit: false,
      }),
      box: m.box(
        layout.marginX,
        contactY,
        layout.contentWidth,
        contactH,
      ),
    }),
    logoEl(baseAspect),
  ];
}

function coBrandedElements(baseAspect: number): TemplateElement[] {
  const logo = labLogoNormalizedBox(baseAspect);
  const partnerW = 0.24;
  return [
    ...eventPhotoLikeElements(baseAspect, {
      presenter: false,
      defaultDate: "01.01.2026 | 10:00",
    }),
    el({
      kind: "partnerLogo",
      slot: "partner",
      label: "Partner-Logo",
      box: {
        x: 1 - LAB_MARGIN_RATIO - partnerW,
        y: logo.y,
        w: partnerW,
        h: logo.h,
      },
    }),
    logoEl(baseAspect),
  ];
}

function freeformElements(baseAspect: number): TemplateElement[] {
  const m = layoutForAspect(baseAspect);
  const { layout } = m;
  const labelSize = LAB_TYPE.formatLabel * layout.scale;
  const headingSize = LAB_TYPE.eventHeading * layout.scale;
  const bodySize = LAB_TYPE.freeformBody * layout.scale;
  const nameSize = LAB_TYPE.presenter * layout.scale;

  let y = layout.marginY;
  const format = formatLabelEl(m, y, "VDID Design.Wissen.Diskurs.");
  y += labelSize * 1.4 + labelSize * 0.4;

  const headingH = headingSize * 1.08 * 2;
  const heading = el({
    kind: "text",
    field: "heading",
    label: "Titel",
    defaultText: "Titel",
    style: textStyle(headingSize, m.height, {
      fontWeight: "700",
      lineHeightRatio: 1.08,
      autoFit: true,
    }),
    box: m.box(layout.marginX, y, layout.contentWidth, headingH),
  });
  y += headingH + bodySize * 0.3;

  const bodyH = bodySize * 1.3 * 2.4;
  const body = el({
    kind: "text",
    field: "body",
    label: "Text",
    defaultText: "Text",
    style: textStyle(bodySize, m.height, {
      fontWeight: "400",
      lineHeightRatio: 1.3,
      autoFit: true,
    }),
    box: m.box(layout.marginX, y, layout.contentWidth, bodyH),
  });
  y += bodyH + bodySize * 0.6;

  const footerReserve =
    layout.logoSize + layout.marginY + nameSize * 1.4;
  const imageH = Math.max(60, layout.height - y - footerReserve);

  const image = el({
    kind: "image",
    slot: "photo",
    label: "Foto",
    box: m.box(layout.marginX, y, layout.contentWidth, imageH),
  });

  const nameBaseline =
    layout.height - layout.marginY - layout.logoSize * 0.25;
  const nameY = nameBaseline - nameSize;
  const nameX = layout.width * 0.45;

  return [
    format,
    heading,
    body,
    image,
    el({
      kind: "text",
      field: "name",
      label: "Name",
      defaultText: "Name",
      style: textStyle(nameSize, m.height, {
        fontWeight: "700",
        align: "right",
        autoFit: false,
      }),
      box: m.box(
        nameX,
        nameY,
        layout.width - layout.marginX - nameX,
        nameSize * 1.5,
      ),
    }),
    logoEl(baseAspect),
  ];
}

const PRESET_BUILDERS: Record<
  Exclude<SlideType, "custom">,
  (baseAspect: number) => TemplateElement[]
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
    elements: PRESET_BUILDERS[slideType](baseAspect),
    guides: {
      vertical: [LAB_MARGIN_RATIO, 1 - LAB_MARGIN_RATIO],
      horizontal: [LAB_MARGIN_RATIO, 1 - LAB_MARGIN_RATIO],
    },
  };
}
