// Beat grid of the track, measured from the sub-bass kick (a kick on every beat, 148 BPM) - NOT from the snare/hat
// off-beats. beat(n) = time of kick n. Bars start on beats 1, 5, 9, ... so that the drop (beat 29) is a downbeat.
export const GRID0 = 0.403;
export const PERIOD = 0.4035;
export const beat = (n: number): number => GRID0 + PERIOD * n;
export const bar = (m: number): number => beat(1 + 4 * m);
export const DROP = beat(29); // 12.105 - the loud section starts here

// kicks after the drop are syncopated, so the measured ones are used there
const LATE = [13.153, 13.743, 14.173, 14.573, 14.853, 15.043, 15.253, 15.493, 15.783, 16.273, 16.563, 16.963, 17.403, 17.673, 17.863, 18.213, 18.483, 19.503, 19.793, 20.193, 20.583, 21.033, 21.433, 21.943, 22.233, 23.013, 23.423, 23.813, 24.703, 25.203, 25.613, 25.843, 26.053, 26.273, 26.643, 27.073];
export const HITS: number[] = [0.103, ...Array.from({ length: 31 }, (_, n) => beat(n)), ...LATE];

// 1 on a hit, decaying over ~0.25s
export const pulse = (t: number, decay = 9): number => {
  let v = 0;
  for (const h of HITS) {
    if (t >= h && t - h < 0.8) v = Math.max(v, Math.exp(-(t - h) * decay));
  }
  return v;
};
