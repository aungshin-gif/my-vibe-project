// The track is hard-tek with a steady four-on-the-floor kick at 148.8 BPM from the first bar to the end (fitted on the sub-bass
// kicks and confirmed by a beat tracker). beat(n) is the ATTACK of kick n (the sub-bass peak comes ~35 ms later), so a visual that
// lands on beat(n) lands on the kick, not behind it. The rolling bass notes between the kicks are NOT beats.
export const PERIOD = 0.4033;
export const GRID0 = 0.3841;
export const beat = (n: number): number => GRID0 + PERIOD * n;
export const bar = (m: number): number => beat(1 + 4 * m);

export const DROP2 = beat(31); // 12.887 - first heavy kick of the drop
export const PRE_KICKS: number[] = [];
export const KD: number[] = Array.from({ length: 36 }, (_, i) => beat(31 + i)); // kicks of the drop section, n = 31 ... 66
export const HITS: number[] = [0.103, ...Array.from({ length: 67 }, (_, n) => beat(n))];

// 1 on a hit, decaying over ~0.25s
export const pulse = (t: number, decay = 9): number => {
  let v = 0;
  for (const h of HITS) {
    if (t >= h && t - h < 0.8) v = Math.max(v, Math.exp(-(t - h) * decay));
  }
  return v;
};
