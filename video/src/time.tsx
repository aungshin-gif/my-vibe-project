import React from "react";
import { Sequence, useCurrentFrame } from "remotion";

// All animation is authored in "design frames" at 30fps. The video is rendered
// at 90fps, so every render frame advances the design clock by 1/SUB frames
// (fractional), giving native 90fps motion instead of interpolated frames.
export const DESIGN_FPS = 30;
export const RENDER_FPS = 90;
export const SUB = RENDER_FPS / DESIGN_FPS;

// Design-frame clock (fractional), local to the enclosing Seq.
export const useF = () => useCurrentFrame() / SUB;

// Sequence that takes design frames.
export const Seq: React.FC<{ from: number; durationInFrames?: number; children: React.ReactNode }> = ({ from, durationInFrames, children }) => (
  <Sequence from={Math.round(from * SUB)} durationInFrames={durationInFrames === undefined ? undefined : Math.round(durationInFrames * SUB)}>
    {children}
  </Sequence>
);
