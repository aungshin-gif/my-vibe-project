// Kick-drum hits of the track (seconds), found by analysing the audio.
export const KICKS = [0.081, 0.58, 1.161, 1.382, 1.788, 2.183, 2.589, 2.995, 3.796, 4.203, 4.609, 5.016, 5.41, 5.817, 6.223, 6.641, 7.024, 7.43, 8.022, 8.243, 8.638, 9.044, 9.451, 9.857, 10.252, 10.658, 11.064, 11.726, 12.922, 13.711, 14.153, 14.524, 14.965, 15.325, 15.755, 16.254, 16.939, 17.38, 17.786, 18.193, 18.599, 18.866, 19.075, 19.389, 20.167, 20.608, 20.968, 21.409, 21.78, 22.21, 22.709, 23.046, 23.394, 23.824, 24.625, 25.821, 26.25, 26.61, 27.051];

export const nearestKick = (t: number): number => KICKS.reduce((best, k) => (Math.abs(k - t) < Math.abs(best - t) ? k : best), KICKS[0]);

// 1 right on a kick, decaying to 0 over ~0.25s
export const pulse = (t: number, decay = 9): number => {
  let v = 0;
  for (const k of KICKS) {
    if (t >= k && t - k < 0.7) v = Math.max(v, Math.exp(-(t - k) * decay));
  }
  return v;
};
