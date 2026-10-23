import { nearestBeatFrame } from "./beats";

// Scenes 2-5 of the 25s cut = 17s (510 frames @30fps). Frames are local to
// this composition; it is placed at 5s..22s of the final edit.
export const T = {
  total: 510,
  tokenize: { from: 110, dur: 165 },
  next: { from: 260, dur: 165 },
  construct: { from: 415, dur: 95 },
  stepLen: 35,
  firstStep: 268,
} as const;

export const RESPONSE = ["Hello", "!", "How", "can", "I", "help", "you", "?"];
export const INPUT = ["Hello", ",", "Claude", "."];

export const stepStart = (k: number) => T.firstStep + k * T.stepLen;

// When each response token locks into the rail. First four land on the beat
// grid inside the probability scene; the rest follow in Scene 5.
export const lockFrames: number[] = [
  ...[0, 1, 2, 3].map((k) => nearestBeatFrame(stepStart(k) + 24)),
  428,
  435,
  442,
  449,
];

export const PULSE_FRAME = 458; // cyan/violet "response ready" pulse
