import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { LlmUniverse } from "./LlmUniverse";
import { Open, OPEN_FRAMES } from "./scenes/Open";
import { Close, CLOSE_FRAMES } from "./scenes/Close";
import { T } from "./timeline";

// Full 25s cut: Scene 1 (5s) + Scenes 2-5 (17s) + Scene 6 (3s) = 750 frames.
export const FULL_FRAMES = OPEN_FRAMES + T.total + CLOSE_FRAMES;

export const Full: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={OPEN_FRAMES}>
      <Open />
    </Sequence>
    <Sequence from={OPEN_FRAMES} durationInFrames={T.total}>
      <LlmUniverse />
    </Sequence>
    <Sequence from={OPEN_FRAMES + T.total} durationInFrames={CLOSE_FRAMES}>
      <Close />
    </Sequence>
  </AbsoluteFill>
);
