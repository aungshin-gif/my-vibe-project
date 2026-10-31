import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Bench, BENCH_END, BENCH_START } from "./Bench";
import { CHILL_END, Chill } from "./Chill";
import { CODE_END, CODE_START, CodeScene } from "./CodeScene";
import { MOG_FPS } from "./common";
import "./fonts";
import { MAST_END, MAST_START, Masthead } from "./Masthead";
import { MOG_END, MOG_START, MogScene } from "./MogScene";
import { OUTRO_START, Outro } from "./Outro";

// All times are seconds of the track (27.26s). Scene cuts sit on bar lines (kick grid, see beats.ts).
export const MOG_SECONDS = 27.26;
export const MOG_FRAMES = Math.round(MOG_SECONDS * MOG_FPS);
const S = (t: number) => Math.round(t * MOG_FPS);

export const Mog: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <Audio src={staticFile("mog/song.wav")} />
    <Sequence from={0} durationInFrames={S(CHILL_END)}>
      <Chill />
    </Sequence>
    <Sequence from={S(MOG_START)} durationInFrames={S(MOG_END) - S(MOG_START)}>
      <MogScene start={MOG_START} />
    </Sequence>
    <Sequence from={S(MAST_START)} durationInFrames={S(MAST_END) - S(MAST_START)}>
      <Masthead start={MAST_START} />
    </Sequence>
    <Sequence from={S(BENCH_START)} durationInFrames={S(BENCH_END) - S(BENCH_START)}>
      <Bench start={BENCH_START} />
    </Sequence>
    <Sequence from={S(CODE_START)} durationInFrames={S(CODE_END) - S(CODE_START)}>
      <CodeScene start={CODE_START} />
    </Sequence>
    <Sequence from={S(OUTRO_START)} durationInFrames={MOG_FRAMES - S(OUTRO_START)}>
      <Outro start={OUTRO_START} />
    </Sequence>
  </AbsoluteFill>
);
