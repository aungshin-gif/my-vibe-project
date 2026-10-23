import React from "react";
import { Composition } from "remotion";
import { Full, FULL_FRAMES } from "./Full";
import { LlmUniverse } from "./LlmUniverse";
import { T } from "./timeline";
import { RENDER_FPS, SUB } from "./time";
import { theme } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="Full" component={Full} durationInFrames={FULL_FRAMES * SUB} fps={RENDER_FPS} width={theme.size.w} height={theme.size.h} />
    <Composition id="LlmUniverse" component={LlmUniverse} durationInFrames={T.total * SUB} fps={RENDER_FPS} width={theme.size.w} height={theme.size.h} />
  </>
);
