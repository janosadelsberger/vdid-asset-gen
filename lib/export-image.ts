/** Raster image formats for canvas asset downloads. */

export type ExportImageFormat = "png" | "jpeg";

export const EXPORT_IMAGE_FORMATS: ExportImageFormat[] = ["png", "jpeg"];

export const EXPORT_IMAGE_FORMAT_LABELS: Record<ExportImageFormat, string> = {
  png: "PNG",
  jpeg: "JPEG",
};

export const EXPORT_IMAGE_MIME: Record<ExportImageFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
};

export const EXPORT_IMAGE_EXT: Record<ExportImageFormat, string> = {
  png: "png",
  jpeg: "jpg",
};

/** High-quality JPEG for design assets (no transparency). */
export const EXPORT_JPEG_QUALITY = 0.92;

/**
 * Encode a canvas as PNG or JPEG data URL.
 * JPEG draws onto an opaque white backdrop first (no alpha).
 */
export function canvasToExportDataUrl(
  canvas: HTMLCanvasElement,
  format: ExportImageFormat,
  jpegQuality = EXPORT_JPEG_QUALITY,
): string {
  if (format === "png") {
    return canvas.toDataURL(EXPORT_IMAGE_MIME.png);
  }

  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d");
  if (!ctx) {
    return canvas.toDataURL(EXPORT_IMAGE_MIME.jpeg, jpegQuality);
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0);
  return out.toDataURL(EXPORT_IMAGE_MIME.jpeg, jpegQuality);
}

export function allExportImageFormatsEnabled(): Record<ExportImageFormat, boolean> {
  return { png: true, jpeg: true };
}
