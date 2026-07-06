"use client";

import React from "react";
import type { CustomTemplate } from "@/lib/custom-template";
import {
  renderLabSlideToContext,
  type LabSlide,
  type LabLogoStyle,
  type RenderAssets,
} from "@/lib/lab-slide-render";
import { cn } from "@/lib/utils";

export type LabSlidePreviewProps = {
  slide: LabSlide;
  width: number;
  height: number;
  topUiSafeInsetRatio?: number;
  logoRef: React.RefObject<HTMLImageElement | null>;
  logoWhiteRef?: React.RefObject<HTMLImageElement | null>;
  slideImagesRef: React.RefObject<Map<string, HTMLImageElement>>;
  partnerLogosRef: React.RefObject<Map<string, HTMLImageElement>>;
  customTemplatesRef?: React.RefObject<Map<string, CustomTemplate>>;
  logoStyle?: LabLogoStyle;
  logoLoaded: boolean;
  /** Bump when async images finish loading into the ref maps. */
  renderRevision?: number;
  maxHeight?: number;
  className?: string;
  canvasClassName?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export const LabSlidePreview = React.forwardRef<
  HTMLCanvasElement,
  LabSlidePreviewProps
>(function LabSlidePreview(
  {
    slide,
    width,
    height,
    topUiSafeInsetRatio,
    logoRef,
    logoWhiteRef,
    slideImagesRef,
    partnerLogosRef,
    customTemplatesRef,
    logoStyle = "color",
    logoLoaded,
    renderRevision = 0,
    maxHeight = 480,
    className,
    canvasClassName,
    onClick,
    disabled,
    ariaLabel,
  },
  ref,
) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const logo = logoRef.current;
    if (!canvas || !logo || !logoLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const assets: RenderAssets = {
      logoStyle,
      logo,
      logoWhite: logoWhiteRef?.current ?? null,
      slideImages: slideImagesRef.current ?? new Map(),
      partnerLogos: partnerLogosRef.current ?? new Map(),
      customTemplates: customTemplatesRef?.current ?? new Map(),
    };

    renderLabSlideToContext(
      ctx,
      slide,
      { width, height, topUiSafeInsetRatio },
      assets,
    );
  }, [
    slide,
    width,
    height,
    topUiSafeInsetRatio,
    logoLoaded,
    renderRevision,
    logoStyle,
    logoRef,
    logoWhiteRef,
    slideImagesRef,
    partnerLogosRef,
    customTemplatesRef,
  ]);

  const canvas = (
    <canvas
      ref={canvasRef}
      className={cn("block max-w-full bg-[#F0F0F0]", canvasClassName)}
      style={{
        maxHeight,
        aspectRatio: `${width} / ${height}`,
      }}
    />
  );

  if (!onClick) {
    return <div className={cn("flex justify-center", className)}>{canvas}</div>;
  }

  return (
    <div className={cn("flex justify-center", className)}>
      <button
        type="button"
        className="relative cursor-pointer rounded outline-none disabled:cursor-not-allowed disabled:opacity-60"
        onClick={(e) => {
          onClick();
          e.currentTarget.blur();
        }}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {canvas}
      </button>
    </div>
  );
});
