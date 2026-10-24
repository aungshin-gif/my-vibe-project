import React, { useLayoutEffect, useRef } from "react";
import { interpolate } from "remotion";
import { clamp, rng } from "./lib";
import { theme } from "./theme";
import { useF } from "./time";
import { BH_FROM } from "./timeline2";

// Black hole drawn on a canvas: event horizon, photon ring, a tilted
// accretion disk (inner = hot cyan/white, outer = violet/magenta) and a
// lensed copy of the far side of the disk bent over and under the horizon.
const W = theme.size.w;
const H = theme.size.h;
const HI = 2;
const CX = W / 2;
const CY = H / 2;
const TILT = -0.32;
const SQUASH = 0.28;

type P = { phi: number; r: number; s: number; hue: number; l: number; j: number };
const PARTS: P[] = (() => {
  const r = rng(5);
  return Array.from({ length: 4200 }, () => {
    const u = r();
    const rad = 1.45 + Math.pow(u, 1.6) * 4.2; // denser near the hole
    const hue = rad < 2.2 ? 192 : rad < 3.6 ? 266 : 298;
    return { phi: r() * Math.PI * 2, r: rad, s: 2.4 + r() * 3.6, hue: r() < 0.05 ? 28 : hue, l: rad < 2.2 ? 82 : rad < 3.6 ? 66 : 58, j: r() };
  });
})();

export const BlackHole: React.FC = () => {
  const f = useF();
  const ref = useRef<HTMLCanvasElement>(null);

  const alpha = interpolate(f, [BH_FROM, BH_FROM + 12], [0, 1], clamp);
  const grow = theme.ease.out(interpolate(f, [BH_FROM, BH_FROM + 34], [0, 1], clamp));
  const fall = theme.ease.in(interpolate(f, [262, 297], [0, 1], clamp));

  useLayoutEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (alpha <= 0) return;
    ctx.scale(HI, HI);

    const rh = 28 + 150 * grow;
    const k = 1 + Math.pow(fall, 3) * 15;
    ctx.save();
    ctx.translate(CX, CY);
    ctx.scale(k, k);
    ctx.globalAlpha = alpha;

    const place = (p: P) => {
      const phi = p.phi + f * (0.5 / Math.pow(p.r, 1.5));
      const x0 = Math.cos(phi) * p.r * rh;
      const y0 = Math.sin(phi) * p.r * rh * SQUASH;
      const x = x0 * Math.cos(TILT) - y0 * Math.sin(TILT);
      const y = x0 * Math.sin(TILT) + y0 * Math.cos(TILT);
      const dop = 0.55 + 0.45 * Math.cos(phi - Math.PI * 0.85); // approaching side brighter
      return { x, y, back: Math.sin(phi) < 0, dop };
    };
    const dot = (x: number, y: number, p: P, a: number) => {
      ctx.fillStyle = `hsla(${p.hue},100%,${p.l}%,${Math.min(1, a * 1.25)})`;
      ctx.fillRect(x - p.s / 2, y - p.s / 2, p.s, p.s);
    };

    // soft halo behind everything
    const halo = ctx.createRadialGradient(0, 0, rh * 0.8, 0, 0, rh * 6);
    halo.addColorStop(0, "rgba(140,90,255,0.35)");
    halo.addColorStop(0.4, "rgba(60,110,255,0.12)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = halo;
    ctx.fillRect(-W, -H, W * 2, H * 2);

    // glowing bands of the disk (inner = hot white-cyan, outer = violet / magenta)
    const BANDS: [number, number, number, number][] = [[1.7, 192, 0.55, 10], [2.3, 215, 0.4, 18], [3.0, 266, 0.34, 26], [3.9, 285, 0.26, 36], [4.9, 298, 0.16, 48]];
    const band = (a0: number, a1: number) => {
      for (const [r, hue, a, w] of BANDS) {
        ctx.strokeStyle = `hsla(${hue},100%,${r < 2.4 ? 80 : 62}%,${a})`;
        ctx.lineWidth = w * (rh / 150) + 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * rh, r * rh * SQUASH, TILT, a0, a1);
        ctx.stroke();
      }
    };
    band(Math.PI, Math.PI * 2);

    // far side of the disk + its lensed images over / under the horizon
    for (const p of PARTS) {
      const q = place(p);
      if (!q.back) continue;
      const a = (0.25 + 0.7 * q.dop) * 0.85;
      dot(q.x, q.y, p, a);
      const lift = rh * 1.16 + Math.abs(q.y) * 0.32;
      dot(q.x * 0.9, -lift, p, a * 0.55);
      dot(q.x * 0.9, lift, p, a * 0.3);
    }

    // event horizon + photon ring
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(0, 0, rh, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    for (const [w, a] of [[16, 0.18], [8, 0.4], [3, 0.95]] as const) {
      ctx.strokeStyle = `rgba(190,240,255,${a})`;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.arc(0, 0, rh * 1.04, 0, Math.PI * 2);
      ctx.stroke();
    }

    // near side of the disk, in front of the horizon
    band(0, Math.PI);
    for (const p of PARTS) {
      const q = place(p);
      if (q.back) continue;
      dot(q.x, q.y, p, (0.3 + 0.7 * q.dop) * 0.95);
    }
    ctx.restore();

    // the screen goes black as the horizon swallows the camera
    if (fall > 0.88) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(0,0,0,${Math.min(1, (fall - 0.88) / 0.1)})`;
      ctx.fillRect(0, 0, W, H);
    }
  });

  return <canvas ref={ref} width={W * HI} height={H * HI} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />;
};
