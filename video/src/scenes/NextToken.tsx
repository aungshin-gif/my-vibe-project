import React from "react";
import { interpolate, spring } from "remotion";
import { Chip, chipW } from "../Chip";
import { beatPulse } from "../beats";
import { clamp } from "../lib";
import { lockFrames, RESPONSE, stepStart, T } from "../timeline";
import { railLayout } from "../Rail";
import { theme } from "../theme";
import { useF, DESIGN_FPS } from "../time";

// Scene 4: next-token selection. The token rain streams behind (DataStorm);
// here, for each step, candidate tokens fly out of the stream and orbit a
// HUD reticle. Beams carry their probability (thickness + flowing light). The
// strongest candidate is chosen, flies up and locks into the sentence rail.
const STEPS: { c: string; p: number }[][] = [
  [{ c: "Hello", p: 0.62 }, { c: "Hi", p: 0.17 }, { c: "Hey", p: 0.09 }, { c: "Greetings", p: 0.05 }, { c: "Good", p: 0.04 }, { c: "Welcome", p: 0.03 }],
  [{ c: "!", p: 0.58 }, { c: ",", p: 0.21 }, { c: ".", p: 0.1 }, { c: "there", p: 0.06 }, { c: "—", p: 0.03 }, { c: "…", p: 0.02 }],
  [{ c: "How", p: 0.44 }, { c: "I", p: 0.22 }, { c: "What", p: 0.12 }, { c: "Nice", p: 0.1 }, { c: "It", p: 0.07 }, { c: "Glad", p: 0.05 }],
  [{ c: "can", p: 0.51 }, { c: "may", p: 0.17 }, { c: "do", p: 0.14 }, { c: "are", p: 0.08 }, { c: "could", p: 0.06 }, { c: "would", p: 0.04 }],
  [{ c: "I", p: 0.55 }, { c: "we", p: 0.14 }, { c: "you", p: 0.12 }, { c: "one", p: 0.08 }, { c: "let", p: 0.06 }, { c: "shall", p: 0.05 }],
  [{ c: "help", p: 0.48 }, { c: "assist", p: 0.2 }, { c: "serve", p: 0.1 }, { c: "guide", p: 0.09 }, { c: "do", p: 0.07 }, { c: "aid", p: 0.06 }],
  [{ c: "you", p: 0.66 }, { c: "your", p: 0.11 }, { c: "the", p: 0.09 }, { c: "them", p: 0.06 }, { c: "all", p: 0.05 }, { c: "us", p: 0.03 }],
  [{ c: "?", p: 0.7 }, { c: ".", p: 0.12 }, { c: "today", p: 0.07 }, { c: "!", p: 0.05 }, { c: ",", p: 0.04 }, { c: "—", p: 0.02 }],
];
// which orbit slot the winner sits in, per step (so it moves around)
const WIN_SLOT = [1, 4, 0, 3, 2, 5, 1, 4];

const C = { x: 960, y: 620 };
const RX = 590;
const RY = 270;
const slotPos = (slot: number) => {
  const a = ((-150 + slot * 60) * Math.PI) / 180;
  return { x: C.x + Math.cos(a) * RX, y: C.y + Math.sin(a) * RY };
};

const Reticle: React.FC<{ frame: number; lockPulse: number }> = ({ frame, lockPulse }) => {
  const beat = beatPulse(frame);
  const ring = (r: number, dash: string, speed: number, color: string, w: number) => (
    <circle cx={C.x} cy={C.y} r={r} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dash} transform={`rotate(${frame * speed} ${C.x} ${C.y})`} opacity={0.85} />
  );
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="core">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor={theme.colors.cyan} />
          <stop offset="1" stopColor={theme.colors.violet} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g style={{ filter: `drop-shadow(0 0 10px ${theme.colors.cyan})` }}>
        {ring(110, "30 14", 1.2, theme.colors.cyan, 3)}
        {ring(160, "6 10", -0.8, theme.colors.violet, 2.5)}
        {ring(214, "120 40 20 40", 0.5, theme.colors.magenta, 3)}
        {Array.from({ length: 48 }, (_, i) => {
          const a = ((i / 48) * 360 + frame * 0.3) * (Math.PI / 180);
          const r1 = 238;
          const r2 = i % 4 === 0 ? 262 : 250;
          return <line key={i} x1={C.x + Math.cos(a) * r1} y1={C.y + Math.sin(a) * r1} x2={C.x + Math.cos(a) * r2} y2={C.y + Math.sin(a) * r2} stroke={theme.colors.cyan} strokeWidth={i % 4 === 0 ? 3 : 1.5} opacity={0.6} />;
        })}
      </g>
      <circle cx={C.x} cy={C.y} r={50 + beat * 14 + lockPulse * 40} fill="url(#core)" opacity={0.95} />
      {lockPulse > 0 && <circle cx={C.x} cy={C.y} r={90 + (1 - lockPulse) * 260} fill="none" stroke="#fff" strokeWidth={3} opacity={lockPulse * 0.8} />}
    </svg>
  );
};

export const NextToken: React.FC = () => {
  const local = useF();
  const frame = local + T.next.from; // global frame
  const fps = DESIGN_FPS;
  const dur = T.next.dur;
  const rail = railLayout();

  const fade = interpolate(local, [0, 18, dur - 24, dur - 6], [0, 1, 1, 0], clamp);
  const step = Math.min(7, Math.max(0, Math.floor((frame - stepStart(0)) / T.stepLen)));
  const sf = frame - stepStart(step);
  const lock = lockFrames[step];
  const flightFrom = lock - 10;
  const lockPulse = interpolate(frame - lock, [0, 14], [1, 0], clamp) * (frame >= lock ? 1 : 0);
  const cands = STEPS[step];
  const winSlot = WIN_SLOT[step];
  const inRange = frame >= stepStart(0) - 6;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      <Reticle frame={frame} lockPulse={lockPulse} />

      {inRange &&
        cands.map((cand, i) => {
          const slot = (i + winSlot) % 6;
          const target = slotPos(slot);
          const win = i === 0;
          const spawn = spring({ frame: sf - i * 1.5, fps, config: { damping: 16, stiffness: 150, mass: 0.7 } });
          // fly out of the stream toward the orbit slot
          const far = { x: C.x + (target.x - C.x) * 2.3, y: C.y + (target.y - C.y) * 2.3 };
          const px = interpolate(spawn, [0, 1], [far.x, target.x]);
          const py = interpolate(spawn, [0, 1], [far.y, target.y]);
          const settle = interpolate(sf, [0, 14], [1, 0], clamp);
          const wob = 1 + Math.sin(frame / 4 + i * 1.9) * 0.14 * settle;
          const prob = cand.p * wob;
          const picked = sf >= 12; // evaluation done, highlight the winner
          const dim = picked && !win ? interpolate(sf, [12, 24], [1, 0.28], clamp) : 1;
          const gone = frame >= lock ? interpolate(frame - lock, [0, 8], [1, 0], clamp) : 1;
          const op = Math.min(1, spawn) * dim * gone;
          const scale = (win && picked ? interpolate(sf, [12, 22], [0.86, 1.04], clamp) : 0.86) * interpolate(spawn, [0, 1], [0.45, 1]);
          const flying = win && frame >= flightFrom;
          const barW = 2 + cand.p * 20;
          return (
            <React.Fragment key={cand.c + i}>
              {/* probability beam: centre -> candidate, light flows inward */}
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: op }}>
                <line x1={px} y1={py} x2={C.x} y2={C.y} stroke={win && picked ? theme.colors.cyan : theme.colors.violet} strokeWidth={barW * 0.45} opacity={0.35 + cand.p * 0.6} style={{ filter: `drop-shadow(0 0 ${6 + cand.p * 22}px ${win && picked ? theme.colors.cyan : theme.colors.violet})` }} />
                <line x1={px} y1={py} x2={C.x} y2={C.y} stroke="#fff" strokeWidth={Math.max(2, barW * 0.3)} strokeLinecap="round" strokeDasharray="12 34" strokeDashoffset={-(frame * (3 + cand.p * 22))} opacity={0.25 + cand.p} />
              </svg>
              {!flying && <Chip text={cand.c} x={px} y={py} p={op} glow={win && picked ? 1 : 0.25 + cand.p} hot={win} scale={scale} seed={i} tilt={(px - C.x) / 55} />}
              {!flying && (
                <div style={{ position: "absolute", left: px - 80, top: py + 52 * scale + 14, width: 160, textAlign: "center", fontFamily: theme.fonts.mono, fontSize: 26, fontWeight: 700, color: win && picked ? theme.colors.cyan : theme.colors.textDim, opacity: op, textShadow: win && picked ? `0 0 14px ${theme.colors.cyan}` : "none" }}>
                  {prob.toFixed(2)}
                </div>
              )}
            </React.Fragment>
          );
        })}

      {/* winner flies up and locks into the sentence rail */}
      {inRange &&
        (() => {
          const t = interpolate(frame, [flightFrom, lock], [0, 1], { easing: theme.ease.out, ...clamp });
          if (t <= 0 || t >= 1) return null;
          const from = slotPos((0 + winSlot) % 6);
          const x = interpolate(t, [0, 1], [from.x, rail.x[step]]);
          const y = interpolate(t, [0, 1], [from.y, rail.y(frame)]);
          return <Chip key="ghost" text={RESPONSE[step]} x={x} y={y} p={1} glow={1} hot scale={interpolate(t, [0, 1], [1.04, 1])} seed={step} />;
        })()}
    </div>
  );
};

export { chipW };
