import React from "react";

import { theme } from "./theme";
import { useF } from "./time";

export const chipW = (t: string) => Math.max(96, t.length * 28 + 72);
export const CHIP_H = 92;
export const GAP = 18;

const hex = (a: number) => Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, "0");

// Glass token block: gradient rim, inner bevel, top sheen, a light sweep,
// HUD corner ticks and an under-glow. x/y = centre. p = entrance (0..1).
export const Chip: React.FC<{
  text: string;
  x: number;
  y: number;
  p: number;
  glow?: number;
  hot?: boolean;
  scale?: number;
  tilt?: number; // degrees around Y
  seed?: number;
  rotate?: number; // degrees in the screen plane
  stretch?: number; // extra X stretch (spaghettification near the black hole)
}> = ({ text, x, y, p, glow = 0.3, hot = false, scale = 1, tilt = 0, seed = 0, rotate = 0, stretch = 1 }) => {
  const frame = useF();
  if (p <= 0.001) return null;
  const w = chipW(text);
  const c1 = hot ? theme.colors.magenta : theme.colors.cyan;
  const c2 = hot ? theme.colors.violet : theme.colors.blue;
  const float = Math.sin(frame / 26 + seed) * 5;

  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - CHIP_H / 2 + float,
        width: w,
        height: CHIP_H,
        opacity: Math.min(1, p),
        transform: `perspective(900px) rotateX(-6deg) rotateY(${tilt}deg) rotate(${rotate}deg) scaleX(${stretch}) scale(${(0.8 + 0.2 * Math.min(1.08, p)) * scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(30,36,70,0.82), rgba(10,13,30,0.92))",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: `0 14px 34px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 ${glow * 46}px ${c1}${hex(0.12 + glow * 0.3)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* accent hairline along the top edge */}
        <div style={{ position: "absolute", left: 16, right: 16, top: 0, height: 2, borderRadius: 2, background: `linear-gradient(90deg, transparent, ${c1}, ${c2}, transparent)`, opacity: 0.55 + glow * 0.45 }} />
        <span style={{ fontFamily: theme.fonts.display, fontWeight: 600, fontSize: 44, letterSpacing: "-0.01em", color: "#F4F8FF" }}>{text}</span>
      </div>
    </div>
  );
};
