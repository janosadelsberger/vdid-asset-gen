import {
  drawRichText,
  fitRichTextFontSize,
  FIT_TEXT_GROW_RATIO,
  FIT_TEXT_MIN_RATIO,
} from "@/lib/canvas-richtext";
import {
  DEFAULT_IMAGE_EDIT_SETTINGS,
  drawEditedImageCover,
  type ImageEditSettings,
} from "@/lib/image-edit";
import {
  pickLogoVariant,
  sampleRegionAverageLuminance,
} from "@/lib/logo-contrast";
import type {
  CustomSlideContent,
  CustomTemplate,
  NormalizedBox,
  TemplateElement,
} from "@/lib/custom-template";
import { boxToPixels } from "@/lib/custom-template";
import type { RenderAssets, RenderImage, SlideDims } from "@/lib/lab-slide-render";
import { FONT, LAB_BG, LAB_BLUE, LAB_MUTED, LAB_TEXT } from "@/lib/lab-theme";

type Ctx = CanvasRenderingContext2D;

function drawPlaceholder(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  scale: number,
) {
  ctx.fillStyle = "#D8D8D8";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#8A8A8A";
  ctx.font = `400 ${24 * scale}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2);
}

function pickLogo(
  ctx: Ctx,
  variant: "auto" | "dark" | "white",
  box: { x: number; y: number; w: number; h: number },
  logoDark: RenderImage,
  logoWhite: RenderImage | null | undefined,
): RenderImage {
  if (variant === "dark") return logoDark;
  if (variant === "white" && logoWhite) return logoWhite;
  if (variant === "white") return logoDark;
  const lum = sampleRegionAverageLuminance(ctx, box.x, box.y, box.w, box.h);
  const v = pickLogoVariant(lum);
  return v === "light" && logoWhite ? logoWhite : logoDark;
}

function drawLogoInBox(
  ctx: Ctx,
  logo: RenderImage,
  box: { x: number; y: number; w: number; h: number },
) {
  const lnw = logo.naturalWidth || logo.width || 200;
  const lnh = logo.naturalHeight || logo.height || 200;
  const aspect = lnw / lnh;
  let drawW = box.w;
  let drawH = drawW / aspect;
  if (drawH > box.h) {
    drawH = box.h;
    drawW = drawH * aspect;
  }
  const dx = box.x + (box.w - drawW) / 2;
  const dy = box.y + (box.h - drawH) / 2;
  ctx.drawImage(logo, dx, dy, drawW, drawH);
}

function drawPartnerLogoInBox(
  ctx: Ctx,
  img: RenderImage,
  box: { x: number; y: number; w: number; h: number },
) {
  const lnw = img.naturalWidth || img.width || 200;
  const lnh = img.naturalHeight || img.height || 200;
  const aspect = lnw / lnh;
  let drawH = box.h;
  let drawW = drawH * aspect;
  if (drawW > box.w) {
    drawW = box.w;
    drawH = drawW / aspect;
  }
  const dx = box.x + box.w - drawW;
  const dy = box.y + box.h - drawH;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function drawElement(
  ctx: Ctx,
  el: TemplateElement,
  content: CustomSlideContent,
  dims: SlideDims,
  assets: RenderAssets,
  sampleMode: boolean,
) {
  const { width, height } = dims;
  const scale = Math.min(width, height) / 1080;
  const box = boxToPixels(el.box, width, height);

  switch (el.kind) {
    case "rect": {
      ctx.save();
      ctx.globalAlpha = el.opacity;
      ctx.fillStyle = el.fill;
      const r = el.radiusFraction * Math.min(box.w, box.h);
      if (r > 0) {
        ctx.beginPath();
        ctx.roundRect(box.x, box.y, box.w, box.h, r);
        ctx.fill();
      } else {
        ctx.fillRect(box.x, box.y, box.w, box.h);
      }
      ctx.restore();
      break;
    }
    case "line": {
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.thicknessFraction * height;
      ctx.beginPath();
      if (box.w >= box.h) {
        const cy = box.y + box.h / 2;
        ctx.moveTo(box.x, cy);
        ctx.lineTo(box.x + box.w, cy);
      } else {
        const cx = box.x + box.w / 2;
        ctx.moveTo(cx, box.y);
        ctx.lineTo(cx, box.y + box.h);
      }
      ctx.stroke();
      break;
    }
    case "image": {
      const slot = sampleMode ? null : content.images[el.slot];
      const url = slot?.url ?? null;
      const img = url ? assets.slideImages.get(url) ?? null : null;
      const edits = slot?.edits ?? DEFAULT_IMAGE_EDIT_SETTINGS;
      if (img) {
        drawEditedImageCover(ctx, img, box.x, box.y, box.w, box.h, edits);
      } else {
        drawPlaceholder(
          ctx,
          box.x,
          box.y,
          box.w,
          box.h,
          sampleMode ? "Foto" : "Foto hochladen",
          scale,
        );
      }
      break;
    }
    case "partnerLogo": {
      const slot = sampleMode ? null : content.images[el.slot];
      const url = slot?.url ?? null;
      const img = url ? assets.partnerLogos.get(url) ?? null : null;
      if (img) {
        drawPartnerLogoInBox(ctx, img, box);
      } else if (sampleMode) {
        drawPlaceholder(ctx, box.x, box.y, box.w, box.h, "Partner", scale);
      }
      break;
    }
    case "logo": {
      const logo = pickLogo(ctx, el.variant, box, assets.logo, assets.logoWhite);
      drawLogoInBox(ctx, logo, box);
      break;
    }
    case "text": {
      const text = sampleMode
        ? el.defaultText || el.label
        : (content.fields[el.field] ?? el.defaultText);
      if (!text.trim()) return;
      const fontSizeBase = el.style.heightFraction * height;
      const maxHeight = box.h;
      const fontSize = el.style.autoFit
        ? fitRichTextFontSize(ctx, text, {
            maxWidth: box.w,
            maxHeight,
            maxFontSize: fontSizeBase,
            minFontSize: fontSizeBase * FIT_TEXT_MIN_RATIO,
            fontWeight: el.style.fontWeight,
            lineHeightRatio: el.style.lineHeightRatio,
            fontFamily: FONT,
            growRatio: FIT_TEXT_GROW_RATIO,
          })
        : fontSizeBase;
      const lineHeight = fontSize * el.style.lineHeightRatio;
      const textX = el.style.align === "right" ? box.x + box.w : box.x;
      drawRichText(ctx, text, {
        x: textX,
        y: box.y,
        maxWidth: box.w,
        fontSize,
        fontWeight: el.style.fontWeight,
        lineHeight,
        baseColor: el.style.baseColor,
        highlightColor: el.style.highlightColor,
        fontFamily: FONT,
        textAlign: el.style.align,
      });
      break;
    }
  }
}

export function renderCustomTemplateToContext(
  ctx: Ctx,
  template: CustomTemplate,
  content: CustomSlideContent,
  dims: SlideDims,
  assets: RenderAssets,
): void {
  ctx.fillStyle = template.backgroundColor || LAB_BG;
  ctx.fillRect(0, 0, dims.width, dims.height);
  for (const el of template.elements) {
    drawElement(ctx, el, content, dims, assets, false);
  }
}

export function renderCustomTemplateSampleToContext(
  ctx: Ctx,
  template: CustomTemplate,
  dims: SlideDims,
  assets: RenderAssets,
): void {
  ctx.fillStyle = template.backgroundColor || LAB_BG;
  ctx.fillRect(0, 0, dims.width, dims.height);
  const sampleContent: CustomSlideContent = { fields: {}, images: {} };
  for (const el of template.elements) {
    if (el.kind === "text") sampleContent.fields[el.field] = el.defaultText || el.label;
  }
  for (const el of template.elements) {
    drawElement(ctx, el, sampleContent, dims, assets, true);
  }
}

export function renderCustomTemplateThumbnail(
  template: CustomTemplate,
  assets: RenderAssets,
  maxPx = 120,
): string | null {
  if (typeof document === "undefined") return null;
  const aspect = template.baseAspect;
  const width = maxPx;
  const height = Math.round(maxPx / aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  renderCustomTemplateSampleToContext(ctx, template, { width, height }, assets);
  return canvas.toDataURL("image/png");
}

export const CUSTOM_DEFAULT_COLORS = {
  text: LAB_TEXT,
  muted: LAB_MUTED,
  blue: LAB_BLUE,
  bg: LAB_BG,
};

export type { ImageEditSettings, NormalizedBox };
