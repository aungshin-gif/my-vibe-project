import React from "react";
import { AbsoluteFill } from "remotion";
import { LlmUniverse } from "./LlmUniverse";
import { LevelsScene } from "./levels/Levels";
import { Seq } from "./time";
import { BH_FROM, CUT, LEVELS_FROM, LEVELS_TO, SUCK_LOCAL } from "./timeline2";

// The scene of the 30s cut with the 15s "levels" insert after tokenization:
//   [0, 300)      original scene; the tokens fall into a black hole (from 214)
//   [300, 686)    emerge from the black hole, six levels of computation
//   [686, ...)    original scene again, shifted by the insert (frame - 450)
export const Universe2: React.FC = () => (
  <AbsoluteFill>
    <Seq from={0} durationInFrames={LEVELS_FROM}>
      <LlmUniverse suck={SUCK_LOCAL} bhFrom={BH_FROM} showNext={false} />
    </Seq>
    <Seq from={LEVELS_FROM} durationInFrames={LEVELS_TO - LEVELS_FROM}>
      <LevelsScene />
    </Seq>
    <Seq from={LEVELS_TO}>
      <Seq from={-CUT}>
        <LlmUniverse showTokenize={false} />
      </Seq>
    </Seq>
  </AbsoluteFill>
);
