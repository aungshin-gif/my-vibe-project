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
}> = ({ text, x, y, p, glow = 0.3, hot = false, scale = 1, tilt = 0, seed = 0 }) => {
  const frame = useF();
  if (p <= 0.001) return null;
  const w = chipW(text);
  const c1 = hot ? theme.colors.magenta : theme.colors.cyan;
  const c2 = hot ? theme.colors.violet : theme.colors.blue;
  const float = Math.sin(frame / 26 + seed) * 5;
  const sweep = ((frame * 5 + seed * 97) % (w + 260)) - 130;
  const corner = (pos: React.CSSProperties): React.ReactElement => (
    <div style={{ position: "absolute", width: 16, height: 16, borderColor: c1, borderStyle: "solid", borderWidth: 0, ...pos }} />
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - CHIP_H / 2 + float,
        width: w,
        height: CHIP_H,
        opacity: Math.min(1, p),
        transform: `perspective(900px) rotateX(-6deg) rotateY(${tilt}deg) scale(${(0.8 + 0.2 * Math.min(1.08, p)) * scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      {/* gradient rim + outer glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 24,
          padding: 2.5,
          background: `linear-gradient(135deg, ${c1}, ${c2} 55%, ${c1})`,
          boxShadow: `0 0 ${26 + glow * 70}px ${c1}${hex(0.25 + glow * 0.5)}, 0 22px 44px rgba(0,0,0,0.55)`,
        }}
      >
        {/* glass body */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 21.5,
            overflow: "hidden",
            background: `linear-gradient(160deg, ${c2}66 0%, rgba(10,14,40,0.92) 45%, rgba(5,6,20,0.96) 100%)`,
            boxShadow: `inset 0 0 28px ${c2}55, inset 0 -10px 20px ${c1}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "46%", background: "linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0.02))" }} />
          <div style={{ position: "absolute", top: -10, bottom: -10, left: sweep, width: 70, transform: "skewX(-20deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }} />
          <span
            style={{
              position: "relative",
              fontFamily: theme.fonts.display,
              fontWeight: 650,
              fontSize: 46,
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              textShadow: `0 0 18px ${c1}, 0 2px 0 rgba(0,0,0,0.35)`,
            }}
          >
            {text}
          </span>
        </div>
      </div>
      {/* HUD corner ticks */}
      {corner({ left: -7, top: -7, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 })}
      {corner({ right: -7, top: -7, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 })}
      {corner({ left: -7, bottom: -7, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 })}
      {corner({ right: -7, bottom: -7, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 })}
      {/* under-glow */}
      <div style={{ position: "absolute", left: "12%", width: "76%", bottom: -16, height: 8, borderRadius: 8, background: `linear-gradient(90deg, transparent, ${c1}, transparent)`, filter: "blur(5px)", opacity: 0.55 + glow * 0.45 }} />
    </div>
  );
};
