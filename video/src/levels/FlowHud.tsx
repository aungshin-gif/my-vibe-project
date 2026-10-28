import React from "react";
import { interpolate, spring } from "remotion";
import { clamp } from "../lib";
import { theme } from "../theme";
import { DESIGN_FPS, useF } from "../time";
import { LAYERS, STAGES } from "../timeline2";

const C = theme.colors;
const pad = (n: number) => String(Math.round(n)).padStart(2, "0");

// Everything graphic now lives in the 3D scene; the overlay is only a small
// stage title, a thin six-step progress line and, during the layer stack, the
// layer counter.
export const FlowHud: React.FC<{ f: number }> = ({ f }) => {
  const frame = useF();
  const idx = Math.max(0, STAGES.findIndex((s) => f >= s.from && f < s.to));
  const st = STAGES[idx];
  const local = f - st.from;
  const dur = st.to - st.from;
  const p = spring({ frame: local, fps: DESIGN_FPS, config: theme.spring.smooth });
  const out = interpolate(local, [dur - 10, dur - 2], [0, 1], { easing: theme.ease.in, ...clamp });
  const total = STAGES[STAGES.length - 1].to - STAGES[0].from;
  const t = (f - STAGES[0].from) / total;
  const layer = idx === 4 ? Math.max(1, Math.round(interpolate(local, [10, dur - 30], [1, LAYERS], { ...clamp }))) : idx > 4 ? LAYERS : 0;
  return (
    <>
      <div style={{ position: "absolute", left: 96, top: 84, opacity: p * (1 - out), transform: `translateY(${(1 - p) * -16}px)` }}>
        <div style={{ fontFamily: theme.fonts.mono, fontSize: 22, letterSpacing: "0.3em", color: C.cyan }}>{`${pad(idx + 1)} / ${pad(STAGES.length)}`}</div>
        <div style={{ fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 58, letterSpacing: "-0.02em", color: "#fff", textShadow: `0 0 34px ${C.cyan}88`, marginTop: 4 }}>{st.name}</div>
        <div style={{ fontFamily: theme.fonts.display, fontWeight: 500, fontSize: 26, color: C.textDim, marginTop: 4, maxWidth: 560 }}>{st.sub}</div>
      </div>
      {layer > 0 && (
        <div style={{ position: "absolute", right: 110, top: 96, textAlign: "right", fontFamily: theme.fonts.mono }}>
          <div style={{ fontSize: 18, letterSpacing: "0.25em", color: C.textDim }}>LAYER</div>
          <div style={{ fontSize: 54, fontWeight: 700, color: "#fff", textShadow: `0 0 24px ${C.magenta}` }}>
            {pad(layer)}
            <span style={{ fontSize: 26, color: C.textDim }}>{` / ${pad(LAYERS)}`}</span>
          </div>
        </div>
      )}
      {/* progress line */}
      <div style={{ position: "absolute", left: 96, right: 96, bottom: 64, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.1)" }}>
        <div style={{ width: `${Math.min(1, Math.max(0, t)) * 100}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.cyan}, ${C.magenta})`, boxShadow: `0 0 14px ${C.cyan}` }} />
        {STAGES.map((s, i) => {
          const x = ((s.from - STAGES[0].from) / total) * 100;
          const on = f >= s.from;
          return <div key={s.id} style={{ position: "absolute", left: `${x}%`, top: -5, width: 3, height: 13, borderRadius: 2, background: on ? C.cyan : "rgba(255,255,255,0.25)" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 96, bottom: 80, fontFamily: theme.fonts.mono, fontSize: 15, letterSpacing: "0.2em", color: C.textDim, opacity: 0.8 }}>{`T ${(frame / DESIGN_FPS).toFixed(1).padStart(4, "0")}s`}</div>
    </>
  );
};
