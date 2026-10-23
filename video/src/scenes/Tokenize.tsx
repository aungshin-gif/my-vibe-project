import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Chip, chipW, GAP } from "../Chip";
import { clamp } from "../lib";
import { INPUT, T } from "../timeline";
import { theme } from "../theme";

// Scene 3: the message becomes tokens, each gets an embedding (bars) and
// attention arcs light up between related tokens.
const ATTN: [number, number, number][] = [
  [0, 1, 0.5],
  [0, 2, 0.9],
  [1, 2, 0.35],
  [2, 3, 0.6],
  [0, 3, 0.4],
];

export const Tokenize: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = T.tokenize.dur;

  const widths = INPUT.map(chipW);
  const total = widths.reduce((a, b) => a + b, 0) + GAP * 2 * (INPUT.length - 1);
  let cursor = 960 - total / 2;
  const xs = widths.map((w) => {
    const x = cursor + w / 2;
    cursor += w + GAP * 2;
    return x;
  });

  const exit = interpolate(frame, [dur - 14, dur - 2], [0, 1], { easing: theme.ease.in, ...clamp });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit, transform: `translateY(${-exit * 60}px) scale(${1 + exit * 0.1})` }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {ATTN.map(([a, b, wgt], i) => {
          const start = 52 + i * 5;
          const draw = interpolate(frame, [start, start + 24], [0, 1], { easing: theme.ease.out, ...clamp });
          const x1 = xs[a];
          const x2 = xs[b];
          const lift = 90 + Math.abs(b - a) * 55;
          const d = `M ${x1} 500 C ${x1} ${500 - lift}, ${x2} ${500 - lift}, ${x2} 500`;
          const len = 900;
          const col = i % 2 ? theme.colors.violet : theme.colors.cyan;
          return (
            <path key={i} d={d} fill="none" stroke={col} strokeWidth={2 + wgt * 7} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} opacity={(0.35 + wgt * 0.6) * (0.85 + 0.15 * Math.sin(frame / 9 + i))} style={{ filter: `drop-shadow(0 0 10px ${col})` }} />
          );
        })}
      </svg>

      {INPUT.map((t, i) => {
        const p = spring({ frame: frame - 6 - i * 9, fps, config: theme.spring.bouncy });
        const y = 540 + Math.sin(frame / 24 + i * 1.3) * 8;
        const barP = spring({ frame: frame - 34 - i * 6, fps, config: theme.spring.smooth });
        return (
          <React.Fragment key={t + i}>
            <Chip text={t} x={xs[i]} y={y} p={p} glow={0.4} />
            {/* contextual embedding: a short bar profile under each token */}
            <div style={{ position: "absolute", left: xs[i] - 56, top: 620, width: 112, height: 70, display: "flex", alignItems: "flex-end", gap: 6 }}>
              {Array.from({ length: 8 }, (_, k) => {
                const h = (0.25 + 0.75 * Math.abs(Math.sin((i + 1) * 1.7 + k * 0.9 + frame / 40))) * 70 * barP;
                return <div key={k} style={{ width: 8, height: h, borderRadius: 4, background: `linear-gradient(180deg, ${theme.colors.cyan}, ${theme.colors.violet})`, opacity: 0.85 }} />;
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
