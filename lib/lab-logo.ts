import { publicFile } from "@/lib/public-file";

const logoCache = new Map<string, Promise<HTMLImageElement>>();

async function loadLogoSvgFile(
  filename: string,
  recolorWhiteTo?: string,
): Promise<HTMLImageElement> {
  const cacheKey = recolorWhiteTo
    ? `${filename}::${recolorWhiteTo.toUpperCase()}`
    : filename;
  const cached = logoCache.get(cacheKey);
  if (cached) return cached;

  const promise = (async () => {
    const url = publicFile(`/${filename}`);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch logo: ${url}`);
    }
    let svg = await res.text();
    if (recolorWhiteTo) {
      svg = svg.replace(/fill="#FFFFFF"/gi, `fill="${recolorWhiteTo}"`);
    }

    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load logo"));
      img.src = dataUrl;
    });
    return img;
  })().catch((err) => {
    logoCache.delete(cacheKey);
    throw err;
  });

  logoCache.set(cacheKey, promise);
  return promise;
}

/** Full-color VDID logo (`VDID_Logo_rgb.svg`). */
export function loadRgbLogo(): Promise<HTMLImageElement> {
  return loadLogoSvgFile("VDID_Logo_rgb.svg");
}

/** Black-and-white VDID logo (`VDID_Logo_sw.svg`). */
export function loadSwLogo(): Promise<HTMLImageElement> {
  return loadLogoSvgFile("VDID_Logo_sw.svg");
}

/** White / negative logo for dark backgrounds (`VDID_Logo_neg.svg`). */
export function loadWhiteLogo(): Promise<HTMLImageElement> {
  return loadLogoSvgFile("VDID_Logo_neg.svg");
}

/**
 * Load `VDID_Logo_neg.svg` with white fills recolored (default `#1A1A1A`).
 * Kept for Keyvisual generator compatibility.
 */
export function loadRecoloredLogo(hex = "#1A1A1A"): Promise<HTMLImageElement> {
  return loadLogoSvgFile("VDID_Logo_neg.svg", hex);
}
