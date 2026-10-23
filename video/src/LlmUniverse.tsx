import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { beatPulse } from "./beats";
import { DataStorm } from "./DataStorm";
import { BgMesh, clamp, Finish } from "./lib";
import { Rail } from "./Rail";
import { Tokenize } from "./scenes/Tokenize";
import { NextToken } from "./scenes/NextToken";
import { PULLBACK_FROM, PULSE_FRAME, T } from "./timeline";
import { theme } from "./theme";
import { useF, Seq } from "./time";

// Scenes 2-5 as one continuous camera move: dive down a ring tunnel (fast),
// cruise through the token stream while it thinks, then pull back out.
const speedAt = (f: number) =>
  interpolate(f, [0, 30, 110, 240, PULLBACK_FROM, PULLBACK_FROM + 24, T.total], [74, 64, 18, 12, 8, -58, -84], clamp);

// Integrates speed per design frame; the fractional part keeps it smooth at 90fps.
const camZAt = (f: number) => {
  const whole = Math.floor(f);
  let z = 0;
  for (let g = 0; g < whole; g++) z += speedAt(g);
  return z + (f - whole) * speedAt(whole);
};

// "Response ready": a cyan -> violet ring races out through the whole scene.
const ReadyPulse: React.FC = () => {
  const frame = useF();
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
  const frame = useF();
  const pulse = beatPulse(frame);
  const open = interpolate(frame, [0, 22], [1, 0], clamp);
  const wash = interpolate(frame, [T.total - 18, T.total - 1], [0, 1], { easing: theme.ease.in, ...clamp });

  // tunnel is bold on entry and exit, subtle while thinking; token rain peaks mid-scene
  const tunnel = interpolate(frame, [0, 120, 200, 540, 590, T.total], [1, 1, 0.42, 0.42, 0.9, 1], clamp);
  const tokens = interpolate(frame, [0, 70, 150, 540, 600, T.total], [0.3, 0.7, 1, 1, 0.5, 0.25], clamp);

  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <BgMesh />
      <DataStorm camZ={camZAt(frame)} speed={speedAt(frame)} tunnel={tunnel} tokens={tokens} pulse={pulse} />

      <Seq from={T.tokenize.from} durationInFrames={T.tokenize.dur}>
        <Tokenize />
      </Seq>
      <Seq from={T.next.from} durationInFrames={T.next.dur}>
        <NextToken />
      </Seq>
      <Rail />
      <ReadyPulse />

      <Finish />

      {/* entry flash from the monitor / exit wash back toward it */}
      <AbsoluteFill style={{ background: `radial-gradient(circle, #FFFFFF, ${theme.colors.cyan})`, opacity: open * 0.85 }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle, #FFFFFF, ${theme.colors.cyan})`, opacity: wash }} />
    </AbsoluteFill>
  );
};
