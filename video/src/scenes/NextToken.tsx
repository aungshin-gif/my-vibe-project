import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Chip, chipW } from "../Chip";
import { clamp } from "../lib";
import { lockFrames, RESPONSE, stepStart, T } from "../timeline";
import { railLayout } from "../Rail";
import { theme } from "../theme";

// Scene 4: a holographic probability landscape. Each step shows candidate
// tokens as bars; the winner lifts out and locks into the rail on a beat.
const STEPS: { c: string; p: number }[][] = [
  [{ c: "Hello", p: 0.62 }, { c: "Hi", p: 0.17 }, { c: "Hey", p: 0.09 }, { c: "Greetings", p: 0.05 }, { c: "Good", p: 0.04 }, { c: "Welcome", p: 0.03 }],
  [{ c: "!", p: 0.58 }, { c: ",", p: 0.21 }, { c: ".", p: 0.1 }, { c: "there", p: 0.06 }, { c: "—", p: 0.03 }, { c: "…", p: 0.02 }],
  [{ c: "How", p: 0.44 }, { c: "I", p: 0.22 }, { c: "What", p: 0.12 }, { c: "Nice", p: 0.1 }, { c: "It", p: 0.07 }, { c: "Glad", p: 0.05 }],
  [{ c: "can", p: 0.51 }, { c: "may", p: 0.17 }, { c: "do", p: 0.14 }, { c: "are", p: 0.08 }, { c: "could", p: 0.06 }, { c: "would", p: 0.04 }],
];

const BAR_W = 128;
const BAR_GAP = 56;
const MAX_H = 310;
const BASE_Y = 820;

export const NextToken: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + T.next.from; // global frame
  const { fps } = useVideoConfig();
  const dur = T.next.dur;
  const xs0 = 960 - (6 * BAR_W + 5 * BAR_GAP) / 2 + BAR_W / 2;
  const rail = railLayout();

  const exit = interpolate(local, [dur - 22, dur - 8], [0, 1], { easing: theme.ease.in, ...clamp });

  // Which step is active
  const step = Math.min(3, Math.max(0, Math.floor((frame - stepStart(0)) / T.stepLen)));
  const sf = frame - stepStart(step); // frame inside step
  const stepIn = spring({ frame: frame - stepStart(step), fps, config: theme.spring.smooth });
  const lock = lockFrames[step];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit }}>
      {/* floor grid, tilted into perspective */}
      <div style={{ position: "absolute", inset: 0, perspective: 1500, perspectiveOrigin: "50% 40%" }}>
        <div style={{ position: "absolute", left: 160, top: 560, width: 1600, height: 520, transform: "rotateX(62deg)", transformOrigin: "50% 0%", opacity: stepIn * 0.9 }}>
          {Array.from({ length: 14 }, (_, i) => (
            <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: i * 40, height: 2, background: `linear-gradient(90deg, transparent, ${theme.colors.cyan}88, transparent)` }} />
          ))}
          {Array.from({ length: 21 }, (_, i) => (
            <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: i * 80, width: 2, background: `linear-gradient(180deg, ${theme.colors.violet}99, transparent)` }} />
          ))}
        </div>
      </div>

      {/* probability bars for the active step */}
      {STEPS[step].map((cand, i) => {
        const x = xs0 + i * (BAR_W + BAR_GAP);
        const grow = spring({ frame: sf - i * 2, fps, config: theme.spring.smooth });
        // probabilities keep "updating" a little before settling
        const settle = interpolate(sf, [0, 20], [1, 0], { ...clamp });
        const wobble = 1 + Math.sin(frame / 5 + i * 1.9) * 0.12 * settle;
        const h = Math.max(6, (cand.p / 0.62) * MAX_H * grow * wobble);
        const win = i === 0;
        const taken = frame >= lock - 12; // winner has left the bar
        const lit = win ? 1 : 0.45;
        const c1 = win ? theme.colors.cyan : theme.colors.violet;
        const c2 = win ? theme.colors.magenta : theme.colors.blue;
        return (
          <React.Fragment key={cand.c + i}>
            <div style={{ position: "absolute", left: x - BAR_W / 2, top: BASE_Y - h, width: BAR_W, height: h, borderRadius: 12, background: `linear-gradient(180deg, ${c1}, ${c2})`, opacity: (taken && win ? 0.35 : lit) * Math.min(1, grow), boxShadow: win ? `0 0 50px ${theme.colors.cyan}99` : `0 0 24px ${c1}55` }} />
            {!(taken && win) && (
              <div style={{ position: "absolute", left: x - 100, top: BASE_Y - h - 66, width: 200, textAlign: "center", fontFamily: theme.fonts.display, fontWeight: 600, fontSize: 38, color: theme.colors.text, opacity: Math.min(1, grow) * (win ? 1 : 0.75) }}>
                {cand.c}
              </div>
            )}
            <div style={{ position: "absolute", left: x - 100, top: BASE_Y + 14, width: 200, textAlign: "center", fontFamily: theme.fonts.mono, fontSize: 26, color: theme.colors.textDim, opacity: Math.min(1, grow) }}>
              {(cand.p * (1 + (wobble - 1) * 0.3)).toFixed(2)}
            </div>
          </React.Fragment>
        );
      })}

      {/* winner lifts out of its bar and flies up to its slot in the rail */}
      {[0, 1, 2, 3].map((k) => {
        const lf = lockFrames[k];
        const t = interpolate(frame, [lf - 12, lf], [0, 1], { easing: theme.ease.out, ...clamp });
        if (t <= 0 || t >= 1 || k !== step) return null;
        const barH = (STEPS[k][0].p / 0.62) * MAX_H;
        const sx = xs0;
        const sy = BASE_Y - barH - 40;
        const x = interpolate(t, [0, 1], [sx, rail.x[k]]);
        const y = interpolate(t, [0, 1], [sy, rail.y(frame)]);
        return <Chip key={k} text={RESPONSE[k]} x={x} y={y} p={0.6 + 0.4 * t} glow={0.9} hot />;
      })}
    </div>
  );
};

export { chipW };
