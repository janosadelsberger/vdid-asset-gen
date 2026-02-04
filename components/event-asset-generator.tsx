"use client";

import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";

type EventFormState = {
  eventFormat: string;
  eventFormatCustom: string;
  title: string;
  subtitle: string;
  date: Date | null;
  time: string;
};

type FormatKey =
  | "websitePreview"
  | "websiteHeader"
  | "instagramGrid"
  | "instagramStory"
  | "linkedinSquare";

const FORMAT_CONFIG: Record<
  FormatKey,
  { label: string; width: number; height: number; includeMeta: boolean }
> = {
  websitePreview: {
    label: "Website Preview 800×800",
    width: 800,
    height: 800,
    includeMeta: false,
  },
  websiteHeader: {
    label: "Website Header 1920×800",
    width: 1920,
    height: 800,
    includeMeta: false,
  },
  instagramGrid: {
    label: "Instagram Grid 1080×1350",
    width: 1080,
    height: 1350,
    includeMeta: true,
  },
  instagramStory: {
    label: "Instagram Story 1080×1920",
    width: 1080,
    height: 1920,
    includeMeta: true,
  },
  linkedinSquare: {
    label: "LinkedIn 1080×1080",
    width: 1080,
    height: 1080,
    includeMeta: true,
  },
};

export function EventAssetGenerator() {
  const [form, setForm] = React.useState<EventFormState>({
    eventFormat: "–",
    eventFormatCustom: "",
    title: "VDID Event",
    subtitle: "",
    date: null,
    time: "",
  });
  const [logoLoaded, setLogoLoaded] = React.useState(false);
  const logoRef = React.useRef<HTMLImageElement | null>(null);
  const canvasRefs = React.useRef<
    Partial<Record<FormatKey, HTMLCanvasElement | null>>
  >({});

  // Load logo once
  React.useEffect(() => {
    const img = new Image();
    // Use the negative VDID SVG logo placed in /public
    img.src = "/VDID_Logo_neg.svg";
    img.onload = () => {
      logoRef.current = img;
      setLogoLoaded(true);
    };
  }, []);

  const handleChangeText = (
    field: "title" | "subtitle" | "time",
  ): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  };

  const handleDateChange = (date: Date | null) => {
    setForm((prev) => ({ ...prev, date }));
  };

  const handleTimeChange = (time: string) => {
    setForm((prev) => ({ ...prev, time }));
  };

  const renderAll = React.useCallback(() => {
    if (!logoRef.current) return;

    (Object.keys(FORMAT_CONFIG) as FormatKey[]).forEach((key) => {
      const canvas = canvasRefs.current[key];
      if (!canvas) return;
      const cfg = FORMAT_CONFIG[key];
      canvas.width = cfg.width;
      canvas.height = cfg.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      drawFormat(canvas, ctx, cfg, form, logoRef.current);
    });
  }, [form]);

  React.useEffect(() => {
    if (logoLoaded) {
      renderAll();
    }
  }, [logoLoaded, renderAll]);

  const handleGenerateClick = () => {
    renderAll();
  };

  const handleDownload = (key: FormatKey) => {
    const canvas = canvasRefs.current[key];
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${key}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>VDID Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600">
              Logo wird als fest eingebettete VDID-Bildmarke erwartet (
              <code>public/VDID_Logo_neg.svg</code>). Hintergrund: VDID-Blau
              (#0A2CD9), Text: Weiß in Roboto.
            </p>
            <div className="space-y-1">
              <Label htmlFor="eventFormat">Eventformat</Label>
              <select
                id="eventFormat"
                value={form.eventFormat}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, eventFormat: e.target.value }));
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="–">–</option>
                <option value="VDID Design.Wissen.Diskus.">
                  VDID Design.Wissen.Diskus.
                </option>
                <option value="VDID Insight Update">VDID Insight Update</option>
                <option value="other">other</option>
              </select>
              {form.eventFormat === "other" && (
                <Input
                  value={form.eventFormatCustom}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      eventFormatCustom: e.target.value,
                    }));
                  }}
                  placeholder="Eigenes Eventformat eingeben"
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="title">Titel *</Label>
              <Textarea
                id="title"
                value={form.title}
                onChange={handleChangeText("title")}
                placeholder="Titel der Veranstaltung"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="subtitle">Unterzeile (optional)</Label>
              <Textarea
                id="subtitle"
                value={form.subtitle}
                onChange={handleChangeText("subtitle")}
                placeholder="Kurze Beschreibung oder Claim"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Datum</Label>
                <DatePicker date={form.date} onChange={handleDateChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="time">Uhrzeit</Label>
                <TimePicker value={form.time} onChange={handleTimeChange} />
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={handleGenerateClick} disabled={!logoLoaded}>
                Assets generieren
              </Button>
              {!logoLoaded && (
                <p className="mt-2 text-xs text-slate-500">
                  Logo wird geladen… Stelle sicher, dass{" "}
                  <code>public/VDID_Logo_neg.svg</code> existiert.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Hinweise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>
              Alle Formate nutzen VDID-Blau als Vollflächenhintergrund mit
              weißer Typografie in Roboto, wie im VDID Styleguide beschrieben.
            </p>
            <p>
              Website-Formate nutzen nur Logo und Titel. Social-Formate
              enthalten zusätzlich Unterzeile, Datum und Uhrzeit, sofern
              angegeben.
            </p>
            <p>
              Du kannst jedes Asset unten als PNG herunterladen und direkt in
              Website oder Social Media verwenden.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(Object.keys(FORMAT_CONFIG) as FormatKey[]).map((key) => {
          const cfg = FORMAT_CONFIG[key];
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{cfg.label}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(key)}
                  disabled={!logoLoaded}
                >
                  PNG herunterladen
                </Button>
              </CardHeader>
              <CardContent>
                <div className="w-full border border-slate-200 rounded-md bg-slate-50 p-2 overflow-auto">
                  <div className="flex justify-center">
                    <canvas
                      ref={(el) => {
                        canvasRefs.current[key] = el;
                      }}
                      className="block bg-vdidBlue"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        maxHeight: 400,
                        aspectRatio: `${cfg.width} / ${cfg.height}`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function drawFormat(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  cfg: { width: number; height: number; includeMeta: boolean },
  form: EventFormState,
  logo: HTMLImageElement,
) {
  const { width, height } = cfg;

  // Background
  ctx.fillStyle = "#0A2CD9";
  ctx.fillRect(0, 0, width, height);

  // Safe margins
  const marginX = width * 0.08;
  const marginY = height * 0.12;

  // Draw logo (top left)
  const logoHeight = Math.min(height * 0.16, 160);
  const logoAspect = logo.width / logo.height || 1;
  const logoWidth = logoHeight * logoAspect;
  ctx.drawImage(logo, marginX, marginY, logoWidth, logoHeight);

  // Typography - positioned in lower third
  const titleMaxWidth = width - marginX * 2;
  
  // Calculate font size first
  const baseTitleSize = Math.min(width, height) * 0.07;
  const titleFontSize = Math.max(32, baseTitleSize);
  
  // Set up context for text measurement
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `500 ${titleFontSize}px Roboto, system-ui, sans-serif`;
  
  // Calculate all text dimensions first
  const metaFontSize = titleFontSize * 0.45;
  const subtitleFontSize = titleFontSize * 0.55;
  const lineHeightTitle = titleFontSize * 1.2;
  const lineHeightSubtitle = subtitleFontSize * 1.3;
  
  // Get event format text (styled like date/time)
  const eventFormatText =
    form.eventFormat === "other"
      ? form.eventFormatCustom
      : form.eventFormat !== "–"
        ? form.eventFormat
        : "";
  
  // Measure all text to calculate total height
  ctx.font = `400 ${metaFontSize}px Roboto, system-ui, sans-serif`;
  const eventFormatLines = eventFormatText
    ? wrapText(ctx, eventFormatText, titleMaxWidth)
    : [];
  
  ctx.font = `500 ${titleFontSize}px Roboto, system-ui, sans-serif`;
  const titleLines = wrapText(ctx, form.title || "VDID Event", titleMaxWidth);
  ctx.font = `400 ${subtitleFontSize}px Roboto, system-ui, sans-serif`;
  const subtitleLines = form.subtitle ? wrapText(ctx, form.subtitle, titleMaxWidth) : [];
  
  // Calculate spacing constants
  const spacingAfterEventFormat = metaFontSize * 0.8; // spacing between event format and title
  const spacingAfterTitle = subtitleFontSize * 0.8; // spacing between title and subtitle
  const spacingAfterSubtitle = metaFontSize * 1.0; // spacing between subtitle and date/time
  
  // Calculate actual heights
  const eventFormatHeight = eventFormatLines.length * metaFontSize * 1.2;
  const titleHeight = titleLines.length * lineHeightTitle;
  const subtitleHeight = subtitleLines.length * lineHeightSubtitle;
  const metaHeight = metaFontSize * 1.4;
  
  // Calculate total height needed for all content
  // For website formats, only count what will actually be rendered (event format + title)
  let totalTextHeight = 0;
  if (eventFormatText && eventFormatLines.length > 0) {
    totalTextHeight += eventFormatHeight + spacingAfterEventFormat;
  }
  totalTextHeight += titleHeight;
  
  // Only add subtitle and date/time for formats that include meta
  if (cfg.includeMeta) {
    if (form.subtitle && subtitleLines.length > 0) {
      totalTextHeight += spacingAfterTitle + subtitleHeight;
    }
    const dateText = form.date ? format(form.date, "dd.MM.yyyy") : "";
    const metaParts = [dateText, form.time].filter(Boolean);
    if (metaParts.length > 0) {
      totalTextHeight += spacingAfterSubtitle + metaHeight;
    }
  }
  
  // Position text group in lower third, ensuring no overlap
  // Minimum safe distance from logo
  const logoBottom = marginY + logoHeight;
  const minDistanceFromLogo = height * 0.05; // 5% of canvas height minimum
  const minTextStartY = logoBottom + minDistanceFromLogo;
  
  // Target position: lower third (67% of height)
  const lowerThirdStart = height * 0.67;
  
  // For formats with meta: position from bottom, but respect constraints
  let textStartY: number;
  if (cfg.includeMeta) {
    // Calculate position from bottom
    const bottomPosition = height - marginY - totalTextHeight;
    // Use the higher of: bottom-calculated position, lower third start, or minimum from logo
    textStartY = Math.max(bottomPosition, lowerThirdStart, minTextStartY);
  } else {
    // For website formats: fixed position in lower third, regardless of date/time input
    textStartY = Math.max(lowerThirdStart, minTextStartY);
  }
  
  // Ensure text doesn't overflow bottom (only check for formats with meta)
  if (cfg.includeMeta) {
    const maxTextEndY = height - marginY;
    if (textStartY + totalTextHeight > maxTextEndY) {
      // If content is too tall, position from bottom with margin
      textStartY = maxTextEndY - totalTextHeight;
      // But still respect minimum from logo
      textStartY = Math.max(textStartY, minTextStartY);
    }
  }

  // Draw Event Format (above title, styled like date/time)
  let y = textStartY;
  if (eventFormatText && eventFormatLines.length > 0) {
    ctx.font = `400 ${metaFontSize}px Roboto, system-ui, sans-serif`;
    for (const line of eventFormatLines) {
      ctx.fillText(line, marginX, y);
      y += metaFontSize * 1.2;
    }
    y += spacingAfterEventFormat;
  }

  // Draw Title
  ctx.font = `500 ${titleFontSize}px Roboto, system-ui, sans-serif`;
  for (const line of titleLines) {
    ctx.fillText(line, marginX, y);
    y += lineHeightTitle;
  }

  if (!cfg.includeMeta) {
    return;
  }

  // Draw Subtitle
  if (form.subtitle && subtitleLines.length > 0) {
    y += spacingAfterTitle;
    ctx.font = `400 ${subtitleFontSize}px Roboto, system-ui, sans-serif`;
    for (const line of subtitleLines) {
      ctx.fillText(line, marginX, y);
      y += lineHeightSubtitle;
    }
  }

  // Draw Date & time line
  if (metaParts.length > 0) {
    y += spacingAfterSubtitle;
    const metaText = metaParts.join(" • ");
    ctx.font = `400 ${metaFontSize}px Roboto, system-ui, sans-serif`;
    ctx.fillText(metaText, marginX, y);
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  // First, split on explicit line breaks (\n)
  const explicitLines = text.split(/\n/);
  const allLines: string[] = [];

  // For each explicit line, wrap it if needed
  for (const explicitLine of explicitLines) {
    const words = explicitLine.split(/\s+/);
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const width = ctx.measureText(test).width;
      if (width > maxWidth && current) {
        allLines.push(current);
        current = word;
      } else {
        current = test;
      }
    }

    if (current) {
      allLines.push(current);
    }
  }

  return allLines;
}

