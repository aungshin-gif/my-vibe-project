// Beat grid detected from the supplied song (Dark Beach). Used only to time
// pulses/locks; the soundtrack itself is added by the user in their editor.
export const BPM = 129.2;
export const FIRST_BEAT_S = 0.209;
const FPS = 30;

export const framesPerBeat = (FPS * 60) / BPM;

// 0..1 spike on every beat, decaying fast. `offsetFrames` shifts the grid so a
// beat lands where the sequence wants it (e.g. the token lock-ins).
export const beatPulse = (frame: number, offsetFrames = 0): number => {
  const t = (frame - offsetFrames - FIRST_BEAT_S * FPS) / framesPerBeat;
  const phase = t - Math.floor(t);
  return Math.exp(-phase * 7);
};

// Beat frame closest to `frame`.
export const nearestBeatFrame = (frame: number): number => {
  const n = Math.round((frame - FIRST_BEAT_S * FPS) / framesPerBeat);
  return Math.round(FIRST_BEAT_S * FPS + n * framesPerBeat);
};

// Frame of the nth beat counted from `start`.
export const beatFrame = (start: number, n: number): number =>
  Math.round(start + n * framesPerBeat);
