import { TemplateAnalysis } from '@/types';

interface RGB {
  r: number;
  g: number;
  b: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function toHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) * 60;
    else if (max === gg) h = ((bb - rr) / d + 2) * 60;
    else h = ((rr - gg) / d + 4) * 60;
  }
  return { h, s, l };
}

export async function extractPalette(dataUrl: string, maxColors = 6): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 96;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 200) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const key = `${r >> 4}:${g >> 4}:${b >> 4}`;
          const existing = buckets.get(key);
          if (existing) {
            existing.r += r;
            existing.g += g;
            existing.b += b;
            existing.count += 1;
          } else {
            buckets.set(key, { r, g, b, count: 1 });
          }
        }

        const colors = Array.from(buckets.values())
          .sort((x, y) => y.count - x.count)
          .slice(0, maxColors * 4)
          .map((c) => {
            const n = c.count;
            return { hex: rgbToHex(Math.round(c.r / n), Math.round(c.g / n), Math.round(c.b / n)), count: n };
          });

        const unique: string[] = [];
        for (const c of colors) {
          const similar = unique.some((existing) => {
            const a = hexToRgb(existing);
            const b = hexToRgb(c.hex);
            return Math.abs(a.r - b.r) < 24 && Math.abs(a.g - b.g) < 24 && Math.abs(a.b - b.b) < 24;
          });
          if (!similar) unique.push(c.hex);
          if (unique.length >= maxColors) break;
        }
        resolve(unique);
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = dataUrl;
  });
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hslOf(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return toHsl(r, g, b);
}

export function applySampledColors(analysis: TemplateAnalysis, palette: string[]): TemplateAnalysis {
  if (!palette.length) return analysis;
  const nonNeutral = palette.filter((hex) => {
    const { r, g, b } = hexToRgb(hex);
    return toHsl(r, g, b).s > 0.12;
  });

  const lightest = [...palette].sort((a, b) => luminance(b) - luminance(a))[0];
  const darkest = [...palette].sort((a, b) => luminance(a) - luminance(b))[0];

  const viable = nonNeutral.length > 0 ? nonNeutral : palette.filter((hex) => hex !== lightest && hex !== darkest);
  const primary = viable[0] || darkest || '#1e293b';
  const secondary = viable[1] || lightest || '#334155';
  const accent =
    [...viable].sort((a, b) => {
      const ah = hslOf(a);
      const bh = hslOf(b);
      return bh.s - ah.s;
    })[0] || primary;

  return {
    ...analysis,
    style: {
      ...analysis.style,
      backgroundColor: lightest || analysis.style.backgroundColor,
      textColor: darkest || analysis.style.textColor,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
    },
  };
}