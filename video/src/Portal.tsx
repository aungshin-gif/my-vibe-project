import React, { useLayoutEffect, useRef } from "react";
import { interpolate } from "remotion";
import { clamp, rng } from "./lib";
import { theme } from "./theme";
import { useF } from "./time";
import { BH_FROM } from "./timeline2";

// Stargate-style portal: five counter-rotating segmented rings in a tilted 3D
// frame, a swirling energy vortex inside, jagged arcs jumping between the
// rings and a white-hot core. The camera falls through it into a white-out.
const W = theme.size.w;
const H = theme.size.h;
const HI = 2;
const CX = W / 2;
const CY = H / 2;

type Sw = { a: number; u: number; s: number; j: number };
const SWIRL: Sw[] = (() => {
  const r = rng(17);
  return Array.from({ length: 3600 }, () => ({ a: r() * Math.PI * 2, u: Math.pow(r(), 0.8), s: 1.5 + r() * 3, j: r() }));
})();

const RINGS = [
  { r: 1.0, n: 48, speed: 0.012, w: 7, hue: 192, gap: 0.45 },
  { r: 1.14, n: 36, speed: -0.009, w: 11, hue: 215, gap: 0.3 },
  { r: 1.3, n: 60, speed: 0.006, w: 6, hue: 266, gap: 0.55 },
  { r: 1.46, n: 24, speed: -0.014, w: 16, hue: 285, gap: 0.2 },
  { r: 1.64, n: 72, speed: 0.004, w: 5, hue: 298, gap: 0.5 },
];

export const Portal: React.FC = () => {
  const f = useF();
  const ref = useRef<HTMLCanvasElement>(null);
  const alpha = interpolate(f, [BH_FROM, BH_FROM + 14], [0, 1], clamp);
  const grow = theme.ease.out(interpolate(f, [BH_FROM, BH_FROM + 36], [0, 1], clamp));
  const fall = theme.ease.in(interpolate(f, [260, 297], [0, 1], clamp));

  useLayoutEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (alpha <= 0) return;
    ctx.scale(HI, HI);
    ctx.lineCap = "round";

    const R = 120 + 150 * grow; // inner ring radius
    const k = 1 + Math.pow(fall, 3) * 14;
    const tilt = 0.95 + Math.sin(f / 40) * 0.08;
    const yaw = Math.sin(f / 55) * 0.25;
    ctx.save();
    ctx.translate(CX, CY);
    ctx.scale(k, k);
    ctx.globalAlpha = alpha;

    // 3D-rotate a point of the ring plane (x, y, 0) and project it
    const P = (x: number, y: number): [number, number, number] => {
      const y1 = y * Math.cos(tilt);
      const z1 = y * Math.sin(tilt);
      const x2 = x * Math.cos(yaw) + z1 * Math.sin(yaw);
      const z2 = -x * Math.sin(yaw) + z1 * Math.cos(yaw);
      const s = 1 / (1 - z2 / 2400);
      return [x2 * s, y1 * s, s];
    };

    // halo
    const halo = ctx.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 3.2);
    halo.addColorStop(0, "rgba(120,200,255,0.30)");
    halo.addColorStop(0.45, "rgba(120,80,255,0.14)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = halo;
    ctx.fillRect(-W, -H, W * 2, H * 2);

    // vortex: logarithmic spiral arms pulled toward the core
    for (const p of SWIRL) {
      const rr = R * 0.98 * p.u;
      const ang = p.a + (1 - p.u) * 7.5 + f * (0.04 + (1 - p.u) * 0.2);
      const [x, y, s] = P(Math.cos(ang) * rr, Math.sin(ang) * rr);
      const hue = p.u < 0.3 ? 190 : p.u < 0.65 ? 230 : 285;
      const l = 94 - p.u * 36;
      ctx.fillStyle = `hsla(${hue},100%,${l}%,${0.35 + (1 - p.u) * 0.6})`;
      const sz = p.s * s * (0.7 + (1 - p.u));
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    }

    // rings: segmented arcs, rotating at different speeds
    for (const [ri, ring] of RINGS.entries()) {
      const rr = R * ring.r;
      const rot = f * ring.speed * 6 + ri;
      ctx.shadowColor = `hsl(${ring.hue},100%,65%)`;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = `hsla(${ring.hue},100%,${ri === 0 ? 82 : 66}%,0.95)`;
      ctx.lineWidth = ring.w;
      for (let i = 0; i < ring.n; i++) {
        const a0 = rot + (i / ring.n) * Math.PI * 2;
        const a1 = a0 + ((1 - ring.gap) / ring.n) * Math.PI * 2;
        ctx.beginPath();
        for (let t = 0; t <= 4; t++) {
          const a = a0 + ((a1 - a0) * t) / 4;
          const [x, y] = P(Math.cos(a) * rr, Math.sin(a) * rr);
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
    // fine tick marks around the outermost ring
    ctx.strokeStyle = "rgba(190,240,255,0.7)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2 - f * 0.004;
      const r1 = R * 1.78;
      const r2 = R * (i % 5 === 0 ? 1.9 : 1.84);
      const [x1, y1] = P(Math.cos(a) * r1, Math.sin(a) * r1);
      const [x2, y2] = P(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // energy arcs jumping between the inner and outer rings
    const lr = rng(Math.floor(f / 3) + 3);
    ctx.strokeStyle = "rgba(220,250,255,0.95)";
    ctx.shadowColor = "#7fe3ff";
    ctx.shadowBlur = 16;
    for (let b = 0; b < 6; b++) {
      const a = lr() * Math.PI * 2;
      ctx.lineWidth = 1.6 + lr() * 2;
      ctx.beginPath();
      for (let t = 0; t <= 8; t++) {
        const rr = R * (1.02 + (t / 8) * 0.62);
        const ja = a + (t > 0 && t < 8 ? (lr() - 0.5) * 0.09 : 0);
        const [x, y] = P(Math.cos(ja) * rr, Math.sin(ja) * rr);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // white-hot core
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, R * (0.45 + fall * 0.9));
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(0.4, "rgba(150,230,255,0.85)");
    core.addColorStop(1, "rgba(120,100,255,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, R * (0.45 + fall * 0.9), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // fall into the portal: white-out
    if (fall > 0.84) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(235,250,255,${Math.min(1, (fall - 0.84) / 0.14)})`;
      ctx.fillRect(0, 0, W, H);
    }
  });

  return <canvas ref={ref} width={W * HI} height={H * HI} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />;
};
