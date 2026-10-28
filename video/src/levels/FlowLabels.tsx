import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import data from "./flowLabels.json";

type Meta = { t: string; s: string; c: string; z: number };
const META = data.labels as Meta[];
const FRAMES = data.frames as number[][][];
// nudge coordinate labels that would otherwise touch each other
const NUDGE: Record<string, number> = { help: 70, you: -45 };

// Labels that sit in the 3D scene are positioned from a per-frame projection of
// the three.js camera (scripts/river/export-labels.js) and drawn here as live
// text, so they stay sharp at 1080p instead of being baked into the video.
export const FlowLabels: React.FC = () => {
  const k = Math.min(FRAMES.length - 1, Math.max(0, useCurrentFrame()));
  return (
    <>
      {FRAMES[k].map(([id, x, y, w, op]) => {
        const m = META[id];
        const isTick = m.z < 0.4 && !m.s;
        const isAxis = m.t.length === 1 && m.z >= 0.5;
        const base = (w * 56) / 512;
        const size = isAxis ? Math.max(30, base * 2) : isTick ? Math.max(15, base * 1.6) : Math.max(22, base * (m.s ? 1.05 : 1.7));
        return (
          <div key={id} style={{ position: "absolute", left: x + (m.s ? NUDGE[m.t] ?? 0 : 0), top: y, transform: "translate(-50%, -50%)", textAlign: "center", opacity: Math.min(1, op), whiteSpace: "nowrap", pointerEvents: "none" }}>
            <div style={{ fontFamily: theme.fonts.display, fontWeight: isAxis ? 800 : 600, fontSize: size, lineHeight: 1.1, color: m.c, textShadow: `0 0 ${size * 0.5}px ${m.c}99, 0 2px 6px rgba(0,0,0,0.6)` }}>{m.t}</div>
            {m.s && <div style={{ fontFamily: theme.fonts.mono, fontSize: Math.max(14, size * 0.62), color: "#9fb6d6", marginTop: 2, textShadow: "0 2px 6px rgba(0,0,0,0.7)" }}>{m.s}</div>}
          </div>
        );
      })}
    </>
  );
};
