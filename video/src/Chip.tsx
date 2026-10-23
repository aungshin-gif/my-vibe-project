import React from "react";
import { theme } from "./theme";

export const chipW = (t: string) => Math.max(88, t.length * 27 + 64);
export const CHIP_H = 84;
export const GAP = 18;

// Glowing token block. x/y = centre. p = entrance progress (0..1).
export const Chip: React.FC<{
  text: string;
  x: number;
  y: number;
  p: number;
  glow?: number;
  hot?: boolean;
}> = ({ text, x, y, p, glow = 0.3, hot = false }) => {
  if (p <= 0.001) return null;
  const w = chipW(text);
  const c1 = hot ? theme.colors.magenta : theme.colors.cyan;
  const c2 = hot ? theme.colors.violet : theme.colors.blue;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - CHIP_H / 2,
        width: w,
        height: CHIP_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18,
        fontFamily: theme.fonts.display,
        fontWeight: 600,
        fontSize: 44,
        letterSpacing: "-0.01em",
        color: theme.colors.text,
        background: `linear-gradient(135deg, ${c2}55, rgba(8,10,30,0.82))`,
        border: `1.5px solid ${c1}`,
        boxShadow: `0 0 ${30 + glow * 60}px ${c1}${Math.round(40 + glow * 80).toString(16).padStart(2, "0")}, inset 0 0 24px ${c2}44`,
        opacity: Math.min(1, p),
        transform: `scale(${0.82 + 0.18 * Math.min(1.08, p)})`,
      }}
    >
      {text}
    </div>
  );
};
