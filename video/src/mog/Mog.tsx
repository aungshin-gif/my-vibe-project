import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Bench, BENCH_END, BENCH_START } from "./Bench";
import { CHILL_END, Chill } from "./Chill";
import { CODE_END, CODE_START, CodeScene } from "./CodeScene";
import { Caption, CornerClaude, MOG_FPS, Paper, Ring, hit, useT } from "./common";
import { KD, pulse } from "./beats";
import "./fonts";
import { MAST_END, MAST_START, Masthead } from "./Masthead";
import { MOG_END, MOG_START, MogScene } from "./MogScene";
import { OUTRO_START, Outro } from "./Outro";

// All times are seconds of the track (27.26s). Scene cuts sit on bar lines (kick grid, see beats.ts).
export const MOG_SECONDS = 27.26;
export const MOG_FRAMES = Math.round(MOG_SECONDS * MOG_FPS);
const S = (t: number) => Math.round(t * MOG_FPS);

// NEW PAGE on the vocal: the lyric alone on a warm page, no MOGGED.
const LYRIC_START = KD[1];
const LYRIC_END = KD[4];
const LyricPage: React.FC = () => {
  const t = useT() + LYRIC_START;
  const p = pulse(t);
  const a = Math.max(0, hit(t, KD[1]));
  const b = Math.max(0, hit(t, KD[2]));
  return (
    <AbsoluteFill>
      <Paper />
      <Ring x={960} y={540} t={t} at={KD[1]} size={500} color="#D97757" w={8} />
      <Caption text="I don't know" x={960} y={400} size={84} scale={a * (1 + p * 0.03)} />
      <Caption text="How can I live forever?" x={960} y={560} size={110} scale={b * (1 + p * 0.03)} />
      <CornerClaude t={t} />
    </AbsoluteFill>
  );
};

export const Mog: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <Audio src={staticFile("mog/song.wav")} />
    <Sequence from={0} durationInFrames={S(CHILL_END)}>
      <Chill />
    </Sequence>
    <Sequence from={S(MOG_START)} durationInFrames={S(MOG_END) - S(MOG_START)}>
      <MogScene start={MOG_START} />
    </Sequence>
    <Sequence from={S(LYRIC_START)} durationInFrames={S(LYRIC_END) - S(LYRIC_START)}>
      <LyricPage />
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
