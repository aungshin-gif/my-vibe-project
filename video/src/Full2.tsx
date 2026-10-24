import React from "react";
import { AbsoluteFill } from "remotion";
import { Universe2 } from "./Universe2";
import { Open, OPEN_FRAMES } from "./scenes/Open";
import { Close, CLOSE_FRAMES } from "./scenes/Close";
import { Seq } from "./time";
import { UNIVERSE2_TOTAL } from "./timeline2";

// 45s cut: opening 4.6s + scene with the 15s insert (37s) + closing 3.4s.
export const FULL2_FRAMES = OPEN_FRAMES + UNIVERSE2_TOTAL + CLOSE_FRAMES;

export const Full2: React.FC = () => (
  <AbsoluteFill>
    <Seq from={0} durationInFrames={OPEN_FRAMES}>
      <Open />
    </Seq>
    <Seq from={OPEN_FRAMES} durationInFrames={UNIVERSE2_TOTAL}>
      <Universe2 />
    </Seq>
    <Seq from={OPEN_FRAMES + UNIVERSE2_TOTAL} durationInFrames={CLOSE_FRAMES}>
      <Close />
    </Seq>
  </AbsoluteFill>
);
