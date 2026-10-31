import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Bench, BENCH_END, BENCH_START } from "./Bench";
import { CHILL_END, Chill } from "./Chill";
import { ChatPage, CodePage, FlashPage, NamesPage, PAGE, TermPage } from "./Pages";
import { KD } from "./beats";
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
    <Sequence from={S(PAGE.chat[0])} durationInFrames={S(PAGE.chat[1]) - S(PAGE.chat[0])}>
      <ChatPage />
    </Sequence>
    <Sequence from={S(KD[13])} durationInFrames={S(KD[14]) - S(KD[13])}>
      <FlashPage i={0} />
    </Sequence>
    <Sequence from={S(KD[14])} durationInFrames={S(KD[15]) - S(KD[14])}>
      <FlashPage i={1} />
    </Sequence>
    <Sequence from={S(KD[15])} durationInFrames={S(KD[16]) - S(KD[15])}>
      <FlashPage i={2} />
    </Sequence>
    <Sequence from={S(KD[16])} durationInFrames={S(KD[17]) - S(KD[16])}>
      <FlashPage i={3} />
    </Sequence>
    <Sequence from={S(KD[17])} durationInFrames={S(KD[18]) - S(KD[17])}>
      <FlashPage i={4} />
    </Sequence>
    <Sequence from={S(KD[18])} durationInFrames={S(KD[19]) - S(KD[18])}>
      <FlashPage i={5} />
    </Sequence>
    <Sequence from={S(PAGE.term[0])} durationInFrames={S(PAGE.term[1]) - S(PAGE.term[0])}>
      <TermPage />
    </Sequence>
    <Sequence from={S(PAGE.code[0])} durationInFrames={S(PAGE.code[1]) - S(PAGE.code[0])}>
      <CodePage />
    </Sequence>
    <Sequence from={S(PAGE.names[0])} durationInFrames={S(PAGE.names[1]) - S(PAGE.names[0])}>
      <NamesPage />
    </Sequence>
    <Sequence from={S(OUTRO_START)} durationInFrames={MOG_FRAMES - S(OUTRO_START)}>
      <Outro start={OUTRO_START} />
    </Sequence>
  </AbsoluteFill>
);
