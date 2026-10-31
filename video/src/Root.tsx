import React from "react";
import { Composition } from "remotion";
import { Mog, MOG_FRAMES } from "./mog/Mog";
import { Full, FULL_FRAMES } from "./Full";
import { LlmUniverse } from "./LlmUniverse";
import { Full2, FULL2_FRAMES } from "./Full2";
import { T } from "./timeline";
import { RENDER_FPS, SUB } from "./time";
import { theme } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="Full" component={Full} durationInFrames={FULL_FRAMES * SUB} fps={RENDER_FPS} width={theme.size.w} height={theme.size.h} />
    <Composition id="Mog" component={Mog} durationInFrames={MOG_FRAMES} fps={60} width={1920} height={1080} />
    <Composition id="Full2" component={Full2} durationInFrames={FULL2_FRAMES * SUB} fps={RENDER_FPS} width={theme.size.w} height={theme.size.h} />
    <Composition id="LlmUniverse" component={LlmUniverse} durationInFrames={T.total * SUB} fps={RENDER_FPS} width={theme.size.w} height={theme.size.h} />
  </>
);
