import React from "react";
import { Composition } from "remotion";
import { LlmUniverse } from "./LlmUniverse";
import { T } from "./timeline";
import { theme } from "./theme";

export const Root: React.FC = () => (
  <Composition
    id="LlmUniverse"
    component={LlmUniverse}
    durationInFrames={T.total}
    fps={theme.fps}
    width={theme.size.w}
    height={theme.size.h}
  />
);
