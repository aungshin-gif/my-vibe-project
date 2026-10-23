import React, { useLayoutEffect, useRef } from "react";

import { rng } from "./lib";
import { theme } from "./theme";
import { useF } from "./time";

// Sci-fi backdrop drawn on a canvas (thousands of elements stay cheap):
//  - a tunnel of glowing rings the camera flies down,
//  - speed streaks rushing past,
//  - a rain of subword tokens streaming through 3D lanes.
// All of it is a fixed world seen through a moving camera (camZ).
const W = theme.size.w;
const H = theme.size.h;
const FOCAL = 900;
const CX = W / 2;
const CY = H / 2;

const RINGS = 26;
const RING_GAP = 240;
const LOOP = 6000;

const HUES = [190, 222, 266, 298]; // cyan, blue, violet, magenta
const WORDS = [
  "the", "un", "ing", "Hello", "tion", "How", "can", "I", "help", "you", "?", "!",
  "Cla", "ude", "def", "for", "in", "and", "of", "to", "{", "}", "0x1F", "42",
  "##s", "<s>", "sys", "user", "ed", "re", "pre", "er", "al", "is", "a", "that",
];

type Streak = { a: number; r: number; z: number; len: number; hue: number; w: number };
type Tok = { x: number; y: number; z: number; t: string; hue: number; d: number };

const mod = (v: number, m: number) => ((v % m) + m) % m;

const build = () => {
  const r = rng(11);
  const streaks: Streak[] = Array.from({ length: 560 }, () => ({
    a: r() * Math.PI * 2,
    r: 330 + r() * 1300,
    z: r() * LOOP,
    len: 0.6 + r() * 1.4,
    hue: HUES[Math.floor(r() * 4)],
    w: 0.3 + r() * 0.7,
  }));
  const toks: Tok[] = Array.from({ length: 84 }, () => ({
    x: (r() - 0.5) * 3000,
    y: (r() - 0.5) * 1700,
    z: r() * LOOP,
    t: WORDS[Math.floor(r() * WORDS.length)],
    hue: HUES[Math.floor(r() * 4)],
    d: r() * 6.28,
  }));
  return { streaks, toks };
};
const WORLD = build();

export const DataStorm: React.FC<{
  camZ: number; // camera depth
  speed: number; // units/frame, stretches the streaks
  tunnel: number; // 0..1 ring tunnel strength
  tokens: number; // 0..1 token rain strength
  pulse?: number; // 0..1 beat pulse
}> = ({ camZ, speed, tunnel, tokens, pulse = 0 }) => {
  const frame = useF();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // core glow at the vanishing point
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, 620);
    g.addColorStop(0, `hsla(196,100%,70%,${0.22 * tunnel + pulse * 0.08})`);
    g.addColorStop(0.35, `hsla(266,100%,60%,${0.16 * tunnel})`);
    g.addColorStop(1, "hsla(266,100%,50%,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // tunnel rings
    const span = RINGS * RING_GAP;
    for (let i = 0; i < RINGS; i++) {
      const z = mod(i * RING_GAP - camZ, span);
      if (z < 70) continue;
      const s = FOCAL / z;
      const rad = 620 * s;
      if (rad > 2600) continue;
      const fog = Math.min(1, (z - 70) / 220) * Math.pow(Math.max(0, 1 - z / span), 1.1);
      const alpha = tunnel * fog;
      if (alpha < 0.01) continue;
      const hue = HUES[i % 4];
      const rot = i * 0.21 + frame * 0.004 * (i % 2 ? 1 : -1);
      const sides = 10;
      const lw = Math.max(1, 7 * s) * (1 + pulse * 0.5);
      ctx.strokeStyle = `hsla(${hue},100%,64%,${alpha})`;
      ctx.lineWidth = lw;
      ctx.setLineDash(i % 3 === 0 ? [rad * 0.14, rad * 0.07] : []);
      ctx.beginPath();
      for (let k = 0; k <= sides; k++) {
        const a = rot + (k / sides) * Math.PI * 2;
        const px = CX + Math.cos(a) * rad;
        const py = CY + Math.sin(a) * rad * 0.62;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // speed streaks
    for (const st of WORLD.streaks) {
      const z1 = mod(st.z - camZ, LOOP);
      if (z1 < 50) continue;
      const z2 = z1 + 40 + Math.abs(speed) * 7 * st.len;
      const s1 = FOCAL / z1;
      const s2 = FOCAL / z2;
      const x = Math.cos(st.a) * st.r;
      const y = Math.sin(st.a) * st.r * 0.62;
      const fog = Math.min(1, (z1 - 50) / 200) * (1 - z1 / LOOP);
      const alpha = (0.2 + 0.55 * st.w) * fog * (0.35 + 0.65 * Math.min(1, Math.abs(speed) / 14 + tunnel * 0.5));
      ctx.strokeStyle = `hsla(${st.hue},100%,68%,${alpha})`;
      ctx.lineWidth = Math.max(0.8, 3.2 * s1 * st.w);
      ctx.beginPath();
      ctx.moveTo(CX + x * s1, CY + y * s1);
      ctx.lineTo(CX + x * s2, CY + y * s2);
      ctx.stroke();
    }

    // token rain: glass chips with subword text, drifting in 3D lanes
    if (tokens > 0.01) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const tk of WORLD.toks) {
        const z = mod(tk.z - camZ * 0.55, LOOP);
        if (z < 260) continue;
        const s = FOCAL / z;
        const fs = 30 * s;
        if (fs < 6) continue;
        const fog = Math.min(1, (z - 260) / 300) * Math.pow(1 - z / LOOP, 1.4);
        const alpha = tokens * fog;
        if (alpha < 0.02) continue;
        const px = CX + (tk.x + Math.sin(frame / 45 + tk.d) * 36) * s;
        const py = CY + (tk.y + Math.cos(frame / 55 + tk.d) * 24) * s;
        const w = (tk.t.length * 18 + 36) * s;
        const h = 50 * s;
        ctx.fillStyle = `hsla(${tk.hue},100%,60%,${alpha * 0.14})`;
        ctx.strokeStyle = `hsla(${tk.hue},100%,68%,${alpha * 0.85})`;
        ctx.lineWidth = Math.max(1, 2 * s);
        ctx.beginPath();
        ctx.roundRect(px - w / 2, py - h / 2, w, h, 12 * s);
        ctx.fill();
        ctx.stroke();
        ctx.font = `600 ${fs.toFixed(1)}px ${theme.fonts.mono}`;
        ctx.fillStyle = `hsla(${tk.hue},100%,86%,${alpha})`;
        ctx.fillText(tk.t, px, py + 1);
      }
    }
  });

  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />;
};
