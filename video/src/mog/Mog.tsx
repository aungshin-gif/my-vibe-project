import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Bench } from "./Bench";
import { Chill } from "./Chill";
import { CodeScene } from "./CodeScene";
import { MOG_FPS } from "./common";
import "./fonts";
import { Masthead } from "./Masthead";
import { MogScene } from "./MogScene";
import { Outro } from "./Outro";

// All times are seconds of the track (27.26s). Scenes are cut on kick hits.
export const MOG_SECONDS = 27.26;
export const MOG_FRAMES = Math.round(MOG_SECONDS * MOG_FPS);
const S = (t: number) => Math.round(t * MOG_FPS);
const SCENES: [number, number][] = [
  [0, 8.5],
  [8.5, 12.92],
  [12.92, 15.33],
  [15.33, 20.17],
  [20.17, 24.6],
  [24.6, MOG_SECONDS],
];

export const Mog: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <Audio src={staticFile("mog/song.mp3")} />
    <Sequence from={S(SCENES[0][0])} durationInFrames={S(SCENES[0][1]) - S(SCENES[0][0])}>
      <Chill />
    </Sequence>
    <Sequence from={S(SCENES[1][0])} durationInFrames={S(SCENES[1][1]) - S(SCENES[1][0])}>
      <MogScene start={SCENES[1][0]} />
    </Sequence>
    <Sequence from={S(SCENES[2][0])} durationInFrames={S(SCENES[2][1]) - S(SCENES[2][0])}>
      <Masthead start={SCENES[2][0]} />
    </Sequence>
    <Sequence from={S(SCENES[3][0])} durationInFrames={S(SCENES[3][1]) - S(SCENES[3][0])}>
      <Bench start={SCENES[3][0]} />
    </Sequence>
    <Sequence from={S(SCENES[4][0])} durationInFrames={S(SCENES[4][1]) - S(SCENES[4][0])}>
      <CodeScene start={SCENES[4][0]} />
    </Sequence>
    <Sequence from={S(SCENES[5][0])} durationInFrames={MOG_FRAMES - S(SCENES[5][0])}>
      <Outro start={SCENES[5][0]} />
    </Sequence>
  </AbsoluteFill>
);
