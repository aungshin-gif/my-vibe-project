import React from "react";
import { interpolate, spring } from "remotion";
import { clamp } from "../lib";
import { theme } from "../theme";
import { DESIGN_FPS, useF } from "../time";
import { LAYERS, STAGES } from "../timeline2";

const C = theme.colors;
const TICK = "rgba(120,220,255,0.55)";

// Screen focus point per stage (drives the coordinate markers on the rulers).
const FOCUS: [number, number][] = [[1175, 610], [1175, 520], [1175, 480], [1100, 640], [960, 540], [1280, 700]];

export const focusAt = (f: number): { x: number; y: number } => {
  const mid = STAGES.map((s) => (s.from + s.to) / 2);
  const x = interpolate(f, mid, FOCUS.map((p) => p[0]), clamp);
  const y = interpolate(f, mid, FOCUS.map((p) => p[1]), clamp);
  return { x, y };
};

export const layerAt = (f: number): number => {
  const st = STAGES[4];
  if (f < st.from) return 1;
  if (f >= st.to) return LAYERS;
  return Math.max(1, Math.round(interpolate(f, [st.from, st.to - 6], [1, LAYERS], { easing: theme.ease.inOut, ...clamp })));
};

const pad = (n: number, w = 2) => String(Math.round(n)).padStart(w, "0");

// Viewport frame: corner brackets, rulers with pixel coordinates on the top
// and left edges, a moving focus marker, camera readout and an axes gizmo.
export const FrameHud: React.FC<{ f: number }> = ({ f }) => {
  const frame = useF();
  const { x: fx, y: fy } = focusAt(f);
  const ticksX = Array.from({ length: 38 }, (_, i) => 60 + i * 48);
  const ticksY = Array.from({ length: 22 }, (_, i) => 60 + i * 48);
  const yaw = frame * 0.9;
  const ax = (a: number, len: number) => [Math.cos(((yaw + a) * Math.PI) / 180) * len, Math.sin(((yaw + a) * Math.PI) / 180) * len * 0.45];
  const X = ax(0, 34);
  const Y: [number, number] = [0, -34];
  const Z = ax(120, 34);
  const gx = 1790;
  const gy = 960;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {/* corner brackets */}
      {[
        [48, 48, 1, 1],
        [1872, 48, -1, 1],
        [48, 1032, 1, -1],
        [1872, 1032, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M ${x} ${y + sy * 90} L ${x} ${y} L ${x + sx * 90} ${y}`} fill="none" stroke={C.cyan} strokeWidth={3} strokeLinecap="round" opacity={0.85} style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} />
      ))}
      {/* rulers */}
      {ticksX.map((x, i) => (
        <g key={`x${x}`}>
          <line x1={x} y1={48} x2={x} y2={i % 5 === 0 ? 64 : 56} stroke={TICK} strokeWidth={1.5} />
          {i % 5 === 0 && (
            <text x={x} y={84} fill={TICK} fontSize={15} fontFamily={theme.fonts.mono} textAnchor="middle">
              {pad(x, 4)}
            </text>
          )}
        </g>
      ))}
      {ticksY.map((y, i) => (
        <g key={`y${y}`}>
          <line x1={48} y1={y} x2={i % 5 === 0 ? 64 : 56} y2={y} stroke={TICK} strokeWidth={1.5} />
          {i % 5 === 0 && (
            <text x={72} y={y + 5} fill={TICK} fontSize={15} fontFamily={theme.fonts.mono}>
              {pad(y, 4)}
            </text>
          )}
        </g>
      ))}
      {/* focus markers on the rulers + faint crosshair */}
      <path d={`M ${fx - 9} 48 L ${fx + 9} 48 L ${fx} 64 Z`} fill={C.magenta} style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
      <path d={`M 48 ${fy - 9} L 48 ${fy + 9} L 64 ${fy} Z`} fill={C.magenta} style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
      <line x1={fx} y1={64} x2={fx} y2={1032} stroke={C.magenta} strokeWidth={1} opacity={0.12} />
      <line x1={64} y1={fy} x2={1872} y2={fy} stroke={C.magenta} strokeWidth={1} opacity={0.12} />
      <g transform={`translate(${fx} ${fy})`} opacity={0.8}>
        <circle r={22} fill="none" stroke={C.magenta} strokeWidth={1.5} />
        <path d="M -34 0 H -14 M 14 0 H 34 M 0 -34 V -14 M 0 14 V 34" stroke={C.magenta} strokeWidth={1.5} />
      </g>
      {/* readouts */}
      <g fontFamily={theme.fonts.mono} fontSize={18} fill={C.textDim}>
        <text x={90} y={1004}>{`CAM  X ${(fx - 960).toFixed(0).padStart(5, " ")}  Y ${(fy - 540).toFixed(0).padStart(5, " ")}  Z ${(-12.8 + f * 0.012).toFixed(2)}`}</text>
        <text x={90} y={1028} fill={TICK}>{`FOCUS ${pad(fx, 4)} , ${pad(fy, 4)}`}</text>
      </g>
      {/* axes gizmo */}
      <g transform={`translate(${gx} ${gy})`} fontFamily={theme.fonts.mono} fontSize={15} fontWeight={700}>
        <line x1={0} y1={0} x2={X[0]} y2={X[1]} stroke={C.cyan} strokeWidth={3} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Y[0]} y2={Y[1]} stroke={C.magenta} strokeWidth={3} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Z[0]} y2={Z[1]} stroke={C.violet} strokeWidth={3} strokeLinecap="round" />
        <text x={X[0] * 1.35} y={X[1] * 1.35 + 5} fill={C.cyan} textAnchor="middle">X</text>
        <text x={Y[0]} y={Y[1] - 8} fill={C.magenta} textAnchor="middle">Y</text>
        <text x={Z[0] * 1.35} y={Z[1] * 1.35 + 5} fill={C.violet} textAnchor="middle">Z</text>
      </g>
    </svg>
  );
};

const Check: React.FC = () => (
  <svg width={26} height={26} viewBox="0 0 24 24">
    <path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke={C.cyan} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Left rail listing the six levels; the active one is highlighted.
export const LevelRail: React.FC<{ f: number }> = ({ f }) => {
  const frame = useF();
  const fps = DESIGN_FPS;
  const rowH = 74;
  const y0 = 300;
  return (
    <div style={{ position: "absolute", left: 96, top: y0, width: 400 }}>
      {STAGES.map((st, i) => {
        const active = f >= st.from && f < st.to;
        const done = f >= st.to;
        const enter = spring({ frame: frame - (i * 4 + 4), fps, config: theme.spring.smooth });
        const prog = active ? (f - st.from) / (st.to - st.from) : done ? 1 : 0;
        return (
          <div key={st.id} style={{ position: "relative", height: rowH, display: "flex", alignItems: "center", gap: 18, padding: "0 18px", borderRadius: 16, opacity: enter * (active ? 1 : done ? 0.62 : 0.4), transform: `translateX(${(1 - enter) * -40}px)`, background: active ? "linear-gradient(90deg, rgba(34,225,255,0.20), rgba(34,225,255,0.02))" : "transparent", borderLeft: `3px solid ${active ? C.cyan : "rgba(255,255,255,0.12)"}`, boxShadow: active ? `0 0 30px ${C.cyan}33` : "none" }}>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: 22, color: active ? C.cyan : C.textDim, width: 34 }}>{pad(i + 1)}</span>
            <span style={{ fontFamily: theme.fonts.display, fontWeight: 600, fontSize: 30, color: C.text, flex: 1, whiteSpace: "nowrap" }}>{st.name}</span>
            {done && <Check />}
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 8, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.08)", opacity: active ? 1 : 0 }}>
              <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.cyan}, ${C.magenta})` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Title card for the active level, plus the layer readout.
export const Title: React.FC<{ f: number }> = ({ f }) => {
  const fps = DESIGN_FPS;
  const idx = Math.max(0, STAGES.findIndex((s) => f >= s.from && f < s.to));
  const st = STAGES[idx];
  const local = f - st.from;
  const dur = st.to - st.from;
  const p = spring({ frame: local, fps, config: theme.spring.smooth });
  const out = interpolate(local, [dur - 8, dur - 1], [0, 1], { easing: theme.ease.in, ...clamp });
  const showLayer = idx >= 2;
  const layer = layerAt(f);
  return (
    <>
      <div style={{ position: "absolute", left: 560, right: 560, top: 96, textAlign: "center", opacity: p * (1 - out), transform: `translateY(${(1 - p) * -22}px)` }}>
        <div style={{ fontFamily: theme.fonts.mono, fontSize: 24, letterSpacing: "0.3em", color: C.cyan }}>{`LEVEL ${pad(idx + 1)} / ${pad(STAGES.length)}`}</div>
        <div style={{ fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 68, letterSpacing: "-0.02em", color: "#fff", textShadow: `0 0 36px ${C.cyan}88`, marginTop: 6 }}>{st.name}</div>
        <div style={{ fontFamily: theme.fonts.display, fontWeight: 500, fontSize: 28, color: C.textDim, marginTop: 4 }}>{st.sub}</div>
      </div>
      {showLayer && (
        <div style={{ position: "absolute", right: 120, top: 112, textAlign: "right", fontFamily: theme.fonts.mono }}>
          <div style={{ fontSize: 20, letterSpacing: "0.25em", color: C.textDim }}>LAYER</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#fff", textShadow: `0 0 24px ${C.magenta}` }}>
            {pad(layer)}
            <span style={{ fontSize: 28, color: C.textDim }}>{` / ${pad(LAYERS)}`}</span>
          </div>
        </div>
      )}
    </>
  );
};
