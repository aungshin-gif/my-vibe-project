import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Chip, chipW, GAP } from "./Chip";
import { beatPulse } from "./beats";
import { clamp } from "./lib";
import { lockFrames, RESPONSE } from "./timeline";
import { theme } from "./theme";

// Final sentence row. Tokens are laid out at their final positions; each one
// "locks in" at its lock frame. Row starts near the top, then drops to centre.
export const railLayout = () => {
  const widths = RESPONSE.map(chipW);
  const total = widths.reduce((a, b) => a + b, 0) + GAP * (RESPONSE.length - 1);
  let cursor = 960 - total / 2;
  const x = widths.map((w) => {
    const c = cursor + w / 2;
    cursor += w + GAP;
    return c;
  });
  const y = (frame: number) =>
    interpolate(frame, [412, 442], [190, 540], { easing: theme.ease.inOut, ...clamp });
  return { x, y, total };
};

export const Rail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { x, y } = railLayout();
  const yy = y(frame);
  const exit = interpolate(frame, [486, 500], [0, 1], { easing: theme.ease.in, ...clamp });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {RESPONSE.slice(0, -1).map((_, i) => {
          const a = lockFrames[i];
          const b = lockFrames[i + 1];
          const draw = interpolate(frame, [b - 2, b + 8], [0, 1], { ...clamp });
          if (frame < a) return null;
          const x1 = x[i] + chipW(RESPONSE[i]) / 2;
          const x2 = x[i + 1] - chipW(RESPONSE[i + 1]) / 2;
          return <line key={i} x1={x1} y1={yy} x2={x1 + (x2 - x1) * draw} y2={yy} stroke={theme.colors.cyan} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${theme.colors.cyan})` }} />;
        })}
      </svg>
      {RESPONSE.map((t, i) => {
        const p = spring({ frame: frame - lockFrames[i], fps, config: theme.spring.bouncy });
        const pulse = frame >= lockFrames[i] ? beatPulse(frame) * 0.5 : 0;
        return <Chip key={i} text={t} x={x[i]} y={yy} p={p} glow={0.5 + pulse} hot={i % 2 === 0} />;
      })}
    </div>
  );
};
