import React from "react";
import { interpolate, spring } from "remotion";
import { Chip, chipW, GAP } from "../Chip";
import { clamp } from "../lib";
import { INPUT, T } from "../timeline";
import { theme } from "../theme";
import { useF, DESIGN_FPS } from "../time";

// Scene 3: the raw message is scanned by a beam and cut into token blocks.
// Each block gets an embedding profile and attention arcs light up between
// related tokens, with pulses travelling along them.
const ATTN: [number, number, number][] = [
  [0, 1, 0.5],
  [0, 2, 0.9],
  [1, 2, 0.35],
  [2, 3, 0.6],
  [0, 3, 0.4],
];
const BEAM_FROM = 8;
const BEAM_TO = 52;

export const Tokenize: React.FC = () => {
  const frame = useF();
  const fps = DESIGN_FPS;
  const dur = T.tokenize.dur;

  const widths = INPUT.map(chipW);
  const total = widths.reduce((a, b) => a + b, 0) + GAP * 2 * (INPUT.length - 1);
  let cursor = 960 - total / 2;
  const xs = widths.map((w) => {
    const x = cursor + w / 2;
    cursor += w + GAP * 2;
    return x;
  });
  const left = xs[0] - widths[0] / 2 - 40;
  const right = xs[xs.length - 1] + widths[widths.length - 1] / 2 + 40;
  const beamX = interpolate(frame, [BEAM_FROM, BEAM_TO], [left, right], { easing: theme.ease.inOut, ...clamp });
  const beamO = interpolate(frame, [BEAM_FROM - 4, BEAM_FROM, BEAM_TO, BEAM_TO + 8], [0, 1, 1, 0], clamp);
  const rawO = interpolate(frame, [0, 6, BEAM_TO - 14, BEAM_TO], [0, 1, 1, 0], clamp);
  // once the beam has passed, the blocks pop out one by one
  const passFrame = (i: number) => BEAM_TO - 8 + i * 5;

  const exit = interpolate(frame, [dur - 14, dur - 2], [0, 1], { easing: theme.ease.in, ...clamp });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit, transform: `translateY(${-exit * 60}px) scale(${1 + exit * 0.1})` }}>
      {/* raw message, scanned */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", fontFamily: theme.fonts.display, fontWeight: 600, fontSize: 112, color: "#fff", letterSpacing: "-0.02em", opacity: rawO, textShadow: `0 0 40px ${theme.colors.cyan}` }}>
        Hello, Claude.
      </div>
      <div style={{ position: "absolute", left: beamX - 3, top: 330, width: 6, height: 420, opacity: beamO, background: `linear-gradient(180deg, transparent, ${theme.colors.cyan}, #fff, ${theme.colors.magenta}, transparent)`, boxShadow: `0 0 60px 10px ${theme.colors.cyan}` }} />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="attn" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={theme.colors.cyan} />
            <stop offset="1" stopColor={theme.colors.magenta} />
          </linearGradient>
        </defs>
        {ATTN.map(([a, b, wgt], i) => {
          const start = 66 + i * 5;
          const draw = interpolate(frame, [start, start + 24], [0, 1], { easing: theme.ease.out, ...clamp });
          const x1 = xs[a];
          const x2 = xs[b];
          const lift = 100 + Math.abs(b - a) * 60;
          const d = `M ${x1} 490 C ${x1} ${490 - lift}, ${x2} ${490 - lift}, ${x2} 490`;
          const len = 1000;
          const travel = (frame * (9 + wgt * 6) + i * 120) % (len + 160);
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="url(#attn)" strokeWidth={2 + wgt * 7} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} opacity={0.3 + wgt * 0.5} style={{ filter: `drop-shadow(0 0 10px ${theme.colors.violet})` }} />
              <path d={d} fill="none" stroke="#fff" strokeWidth={3 + wgt * 3} strokeLinecap="round" strokeDasharray="26 1200" strokeDashoffset={-travel + 160} opacity={draw > 0.95 ? 0.9 : 0} style={{ filter: `drop-shadow(0 0 12px ${theme.colors.cyan})` }} />
            </g>
          );
        })}
      </svg>

      {INPUT.map((t, i) => {
        const p = spring({ frame: frame - passFrame(i), fps, config: theme.spring.bouncy });
        const y = 540 + Math.sin(frame / 24 + i * 1.3) * 6;
        const barP = spring({ frame: frame - passFrame(i) - 10, fps, config: theme.spring.smooth });
        return (
          <React.Fragment key={t + i}>
            <Chip text={t} x={xs[i]} y={y} p={p} glow={0.5} hot={i % 2 === 1} seed={i} tilt={(xs[i] - 960) / 90} />
            {/* contextual embedding: a short bar profile under each token */}
            <div style={{ position: "absolute", left: xs[i] - 60, top: 630, width: 120, height: 80, display: "flex", alignItems: "flex-end", gap: 7 }}>
              {Array.from({ length: 8 }, (_, k) => {
                const h = (0.25 + 0.75 * Math.abs(Math.sin((i + 1) * 1.7 + k * 0.9 + frame / 40))) * 80 * barP;
                return <div key={k} style={{ width: 9, height: h, borderRadius: 5, background: `linear-gradient(180deg, ${theme.colors.cyan}, ${theme.colors.violet})`, opacity: 0.9, boxShadow: `0 0 10px ${theme.colors.cyan}88` }} />;
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
