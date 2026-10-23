// theme.ts — single source of truth. No inline colors/easings in components.
import { Easing } from "remotion";

export const theme = {
  size: { w: 1920, h: 1080 },
  fps: 30,
  colors: {
    bg: "#04050C",
    bgAlt: "#0A0B1A",
    cyan: "#22E1FF",
    blue: "#3B6CFF",
    violet: "#8B5CF6",
    magenta: "#E040FB",
    orange: "#FF9A3C",
    text: "#EAF6FF",
    textDim: "#8FA3C2",
  },
  fonts: {
    display: "'Inter Display', Inter, 'DejaVu Sans', sans-serif",
    mono: "'DejaVu Sans Mono', monospace",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
} as const;

// Layer palette, near -> far: cyan -> blue -> violet -> magenta.
export const layerColor = (t: number): string => {
  const stops = [theme.colors.cyan, theme.colors.blue, theme.colors.violet, theme.colors.magenta];
  const i = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  return t * (stops.length - 1) - i < 0.5 ? stops[i] : stops[i + 1];
};
