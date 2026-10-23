import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { beatPulse } from "./beats";
import { BgMesh, clamp, Finish } from "./lib";
import { NeuralField } from "./NeuralField";
import { Rail } from "./Rail";
import { Tokenize } from "./scenes/Tokenize";
import { NextToken } from "./scenes/NextToken";
import { PULSE_FRAME, T } from "./timeline";
import { theme } from "./theme";

// Scenes 2-5 as one continuous camera move through the network (no hard cuts):
// dive in -> slow drift (tokenize, next-token) -> pull back out.
const camZ = (f: number) => {
  if (f < 125) return interpolate(f, [0, 125], [0, 1700], { easing: theme.ease.inOut });
  if (f < 455) return interpolate(f, [125, 455], [1700, 2500], { easing: theme.ease.out, ...clamp });
  return interpolate(f, [455, 502], [2500, 500], { easing: theme.ease.in, ...clamp });
};

const waveZ = (f: number) => {
  if (f < 125) return interpolate(f, [0, 125], [200, 3000], { easing: theme.ease.out });
  if (f < 400) return 1900 + Math.sin(f / 26) * 500; // slow shimmer while computing
  return interpolate(f, [PULSE_FRAME - 6, PULSE_FRAME + 36], [4600, 300], { easing: theme.ease.inOut, ...clamp });
};

// Streaks rushing past the camera as it dives into the message (frames 0-45).
const Dive: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 8, 34, 48], [0, 1, 1, 0], clamp);
  if (fade <= 0) return null;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: fade }}>
      {Array.from({ length: 70 }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const sp = 0.6 + ((i * 53) % 10) / 10;
        const r = interpolate(frame, [0, 46], [30, 1100 * sp], { easing: theme.ease.in, ...clamp });
        const len = r * 0.35;
        const col = i % 3 === 0 ? theme.colors.magenta : i % 3 === 1 ? theme.colors.cyan : theme.colors.violet;
        return <line key={i} x1={960 + Math.cos(a) * (r - len)} y1={540 + Math.sin(a) * (r - len)} x2={960 + Math.cos(a) * r} y2={540 + Math.sin(a) * r} stroke={col} strokeWidth={2 + sp * 2} strokeLinecap="round" />;
      })}
    </svg>
  );
};

// "Response ready": a cyan -> violet ring races out through the whole scene.
const ReadyPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [PULSE_FRAME, PULSE_FRAME + 34], [0, 1], { easing: theme.ease.out, ...clamp });
  if (t <= 0 || t >= 1) return null;
  const r = 80 + t * 1500;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 960 - r, top: 540 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `6px solid ${theme.colors.cyan}`, boxShadow: `0 0 80px ${theme.colors.cyan}, inset 0 0 120px ${theme.colors.violet}`, opacity: (1 - t) * 0.9 }} />
    </AbsoluteFill>
  );
};

export const LlmUniverse: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  const open = interpolate(frame, [0, 22], [1, 0], { ...clamp });
  const wash = interpolate(frame, [492, 509], [0, 1], { easing: theme.ease.in, ...clamp });
  const dim = interpolate(frame, [110, 150], [1, 0.62], { ...clamp }) * interpolate(frame, [400, 440], [1, 0.8], { ...clamp });

  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <BgMesh />
      <NeuralField camZ={camZ(frame)} waveZ={waveZ(frame)} brightness={dim} pulse={pulse} roll={Math.sin(frame / 90) * 1.2} />

      <Dive />
      <Sequence from={T.tokenize.from} durationInFrames={T.tokenize.dur}>
        <Tokenize />
      </Sequence>
      <Sequence from={T.next.from} durationInFrames={T.next.dur}>
        <NextToken />
      </Sequence>
      <Rail />
      <ReadyPulse />

      <Finish />

      {/* entry flash from the monitor / exit wash back toward it */}
      <AbsoluteFill style={{ background: `radial-gradient(circle, #FFFFFF, ${theme.colors.cyan})`, opacity: open * 0.85 }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle, #FFFFFF, ${theme.colors.cyan})`, opacity: wash }} />
    </AbsoluteFill>
  );
};
