// Beat grid of the track, measured from the sub-bass kick (a kick on every beat, 148 BPM) - NOT from the snare/hat
// off-beats. beat(n) = time of kick n. Bars start on beats 1, 5, 9, ... so that the drop (beat 29) is a downbeat.
export const GRID0 = 0.403;
export const PERIOD = 0.4035;
export const beat = (n: number): number => GRID0 + PERIOD * n;
export const bar = (m: number): number => beat(1 + 4 * m);
export const DROP = beat(29); // 12.105 - the loud section starts here

// Measured sub-bass kicks (the track is hard-tek: after the drop the kicks are syncopated, so they are NOT on a grid).
export const PRE_KICKS = [11.499, 11.899, 12.31, 12.713]; // build-up after the grid runs out (beat 26 = 10.894)
export const DROP2 = 13.06; // the first heavy kick of the drop
export const KD = [13.06, 13.431, 13.874, 14.321, 14.725, 15.044, 15.539, 16.213, 16.76, 17.111, 17.546, 17.953, 18.268, 19.007, 19.542, 19.989, 20.236, 20.775, 21.094, 21.497, 22.024, 22.77, 23.109, 23.556, 23.916, 25.217, 25.616, 25.959, 26.33, 26.673];
export const HITS: number[] = [0.103, ...Array.from({ length: 27 }, (_, n) => beat(n)), ...PRE_KICKS, ...KD];

// 1 on a hit, decaying over ~0.25s
export const pulse = (t: number, decay = 9): number => {
  let v = 0;
  for (const h of HITS) {
    if (t >= h && t - h < 0.8) v = Math.max(v, Math.exp(-(t - h) * decay));
  }
  return v;
};
