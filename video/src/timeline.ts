import { nearestBeatFrame } from "./beats";

// Scenes 2-5 of the 30s cut = 22s (660 frames @30fps), placed after the 4.6s
// opening. Frames below are local to this composition.
export const T = {
  total: 660,
  tokenize: { from: 100, dur: 140 },
  next: { from: 236, dur: 296 },
  stepLen: 36,
  firstStep: 242,
} as const;

export const RESPONSE = ["Hello", "!", "How", "can", "I", "help", "you", "?"];
export const INPUT = ["Hello", ",", "Claude", "."];

export const stepStart = (k: number) => T.firstStep + k * T.stepLen;

// One token is chosen per step, locking into the rail on a beat.
export const lockFrames: number[] = RESPONSE.map((_, k) => nearestBeatFrame(stepStart(k) + 26));

export const RAIL_DROP: [number, number] = [516, 546]; // rail moves to centre
export const PULSE_FRAME = 552; // cyan/violet "response ready" pulse
export const PULLBACK_FROM = 572; // camera starts travelling back
