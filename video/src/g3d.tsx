import React, { useLayoutEffect, useRef } from "react";
import { theme } from "./theme";

// Small canvas 3D toolkit: orbit camera, perspective projection, axes with
// numbered ticks, floor grid, shaded cubes, arrows, glow spheres, 3D text.
// Y is up. 1 world unit is ~110px at the target distance.
export type V3 = [number, number, number];
export type Ctx = CanvasRenderingContext2D;
export type Cam = { yaw: number; pitch: number; dist: number; target: V3; roll?: number };

const W = theme.size.w;
const H = theme.size.h;
const HI = 2;
const FOCAL = 1100;
export const CX = 1175; // content centre (the level rail owns the left side)
export const CY = 590;

export const proj = (p: V3, cam: Cam) => {
  const x = p[0] - cam.target[0];
  const y = p[1] - cam.target[1];
  const z = p[2] - cam.target[2];
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const y2 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  const d = Math.max(0.2, cam.dist + z2);
  const k = FOCAL / d;
  let sx = x1 * k;
  let sy2 = -y2 * k;
  if (cam.roll) {
    const c = Math.cos(cam.roll);
    const s = Math.sin(cam.roll);
    [sx, sy2] = [sx * c - sy2 * s, sx * s + sy2 * c];
  }
  return { x: CX + sx, y: CY + sy2, k, d, vis: z2 + cam.dist > 0.4 };
};

const fog = (d: number, cam: Cam) => Math.max(0.12, Math.min(1, 1.25 - (d - cam.dist + 5) / 26));

export const Canvas3D: React.FC<{ cam: Cam; draw: (ctx: Ctx, cam: Cam) => void }> = ({ cam, draw }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.scale(HI, HI);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    draw(ctx, cam);
  });
  return <canvas ref={ref} width={W * HI} height={H * HI} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />;
};

export const line3 = (ctx: Ctx, cam: Cam, a: V3, b: V3, color: string, width = 2, alpha = 1) => {
  const pa = proj(a, cam);
  const pb = proj(b, cam);
  if (!pa.vis && !pb.vis) return;
  ctx.globalAlpha = alpha * fog((pa.d + pb.d) / 2, cam);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(pa.x, pa.y);
  ctx.lineTo(pb.x, pb.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

export const poly3 = (ctx: Ctx, cam: Cam, pts: V3[], color: string, width = 2, alpha = 1, glow = 0) => {
  const ps = pts.map((p) => proj(p, cam));
  if (ps.every((p) => !p.vis)) return;
  ctx.globalAlpha = alpha * fog(ps[Math.floor(ps.length / 2)].d, cam);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
  }
  ctx.beginPath();
  ps.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
};

// Glowing sphere: bright core, coloured body, soft halo. r in world units.
export const dot3 = (ctx: Ctx, cam: Cam, p: V3, r: number, hsl: [number, number, number], alpha = 1) => {
  const q = proj(p, cam);
  if (!q.vis) return;
  const R = Math.max(1.5, r * q.k);
  const a = alpha * fog(q.d, cam);
  const g = ctx.createRadialGradient(q.x - R * 0.25, q.y - R * 0.3, R * 0.05, q.x, q.y, R * 2.4);
  g.addColorStop(0, `hsla(${hsl[0]},${hsl[1]}%,92%,${a})`);
  g.addColorStop(0.28, `hsla(${hsl[0]},${hsl[1]}%,${hsl[2]}%,${a})`);
  g.addColorStop(0.42, `hsla(${hsl[0]},${hsl[1]}%,${hsl[2] - 14}%,${a * 0.45})`);
  g.addColorStop(1, `hsla(${hsl[0]},${hsl[1]}%,${hsl[2]}%,0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(q.x, q.y, R * 2.4, 0, Math.PI * 2);
  ctx.fill();
};

export const arrow3 = (ctx: Ctx, cam: Cam, a: V3, b: V3, color: string, width = 3, alpha = 1) => {
  const pa = proj(a, cam);
  const pb = proj(b, cam);
  if (!pa.vis && !pb.vis) return;
  const al = alpha * fog(pb.d, cam);
  ctx.globalAlpha = al;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(pa.x, pa.y);
  ctx.lineTo(pb.x, pb.y);
  ctx.stroke();
  const ang = Math.atan2(pb.y - pa.y, pb.x - pa.x);
  const hl = 9 + width * 2.2;
  ctx.beginPath();
  ctx.moveTo(pb.x, pb.y);
  ctx.lineTo(pb.x - Math.cos(ang - 0.4) * hl, pb.y - Math.sin(ang - 0.4) * hl);
  ctx.lineTo(pb.x - Math.cos(ang + 0.4) * hl, pb.y - Math.sin(ang + 0.4) * hl);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
};

export const text3 = (ctx: Ctx, cam: Cam, p: V3, text: string, o: { size?: number; color?: string; align?: CanvasTextAlign; weight?: number; mono?: boolean; alpha?: number; dx?: number; dy?: number } = {}) => {
  const q = proj(p, cam);
  if (!q.vis) return;
  const size = o.size ?? 18;
  ctx.globalAlpha = (o.alpha ?? 1) * Math.min(1, fog(q.d, cam) * 1.3);
  ctx.fillStyle = o.color ?? "#EAF6FF";
  ctx.font = `${o.weight ?? 600} ${size}px ${o.mono ? theme.fonts.mono : theme.fonts.display}`;
  ctx.textAlign = o.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, q.x + (o.dx ?? 0), q.y + (o.dy ?? 0));
  ctx.globalAlpha = 1;
};

export const AXIS = { x: theme.colors.cyan, y: theme.colors.magenta, z: theme.colors.violet } as const;

// X / Y / Z axes through the origin with arrow tips, tick marks and numbers.
export const axes = (ctx: Ctx, cam: Cam, o: { len?: number; step?: number; alpha?: number; labels?: boolean; names?: [string, string, string] } = {}) => {
  const L = o.len ?? 3;
  const step = o.step ?? 0.5;
  const a = o.alpha ?? 1;
  const names = o.names ?? ["X", "Y", "Z"];
  const dirs: [V3, V3, string][] = [
    [[1, 0, 0], [0, 0, 1], AXIS.x],
    [[0, 1, 0], [1, 0, 0], AXIS.y],
    [[0, 0, 1], [1, 0, 0], AXIS.z],
  ];
  dirs.forEach(([d, perp, col], ai) => {
    line3(ctx, cam, [-d[0] * L, -d[1] * L, -d[2] * L], [0, 0, 0], col, 1.5, 0.35 * a);
    arrow3(ctx, cam, [0, 0, 0], [d[0] * L, d[1] * L, d[2] * L], col, 2.6, 0.95 * a);
    for (let t = step; t <= L - 0.01; t += step) {
      for (const sgn of [1, -1]) {
        const c: V3 = [d[0] * t * sgn, d[1] * t * sgn, d[2] * t * sgn];
        const tk = 0.07;
        line3(ctx, cam, [c[0] - perp[0] * tk, c[1] - perp[1] * tk, c[2] - perp[2] * tk], [c[0] + perp[0] * tk, c[1] + perp[1] * tk, c[2] + perp[2] * tk], col, 1.4, 0.7 * a);
        if (o.labels !== false && Math.abs(t / step - Math.round(t / step)) < 0.01 && Math.round(t / step) % 2 === 0) {
          text3(ctx, cam, [c[0] + perp[0] * 0.2, c[1] + perp[1] * 0.2 - (ai === 0 ? 0.16 : 0), c[2] + perp[2] * 0.2], (t * sgn).toFixed(1), { size: 15, color: col, mono: true, weight: 500, alpha: 0.85 * a });
        }
      }
    }
    text3(ctx, cam, [d[0] * (L + 0.35), d[1] * (L + 0.35), d[2] * (L + 0.35)], names[ai], { size: 28, color: col, weight: 800, alpha: a });
  });
};

export const floor3 = (ctx: Ctx, cam: Cam, o: { y?: number; half?: number; step?: number; alpha?: number } = {}) => {
  const y = o.y ?? -1.6;
  const h = o.half ?? 4;
  const st = o.step ?? 0.5;
  const a = o.alpha ?? 0.5;
  for (let t = -h; t <= h + 0.001; t += st) {
    const edge = Math.abs(t) > h - 0.01 ? 1.6 : 1;
    line3(ctx, cam, [t, y, -h], [t, y, h], "rgba(80,190,255,1)", 1 * edge, a * 0.32);
    line3(ctx, cam, [-h, y, t], [h, y, t], "rgba(80,190,255,1)", 1 * edge, a * 0.32);
  }
};

const FACES: { idx: number[]; n: V3 }[] = [
  { idx: [0, 1, 2, 3], n: [0, 0, -1] },
  { idx: [5, 4, 7, 6], n: [0, 0, 1] },
  { idx: [4, 0, 3, 7], n: [-1, 0, 0] },
  { idx: [1, 5, 6, 2], n: [1, 0, 0] },
  { idx: [3, 2, 6, 7], n: [0, 1, 0] },
  { idx: [4, 5, 1, 0], n: [0, -1, 0] },
];
const LIGHT: V3 = [0.35, 0.85, -0.4];

// Shaded cuboid (centre c, size s). hsl base colour; faces lit by a fixed light.
export const cube3 = (ctx: Ctx, cam: Cam, c: V3, s: V3 | number, hsl: [number, number, number], alpha = 1, edge = true) => {
  const [sx, sy, sz] = typeof s === "number" ? [s, s, s] : s;
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  const v: V3[] = [
    [c[0] - hx, c[1] - hy, c[2] - hz], [c[0] + hx, c[1] - hy, c[2] - hz], [c[0] + hx, c[1] + hy, c[2] - hz], [c[0] - hx, c[1] + hy, c[2] - hz],
    [c[0] - hx, c[1] - hy, c[2] + hz], [c[0] + hx, c[1] - hy, c[2] + hz], [c[0] + hx, c[1] + hy, c[2] + hz], [c[0] - hx, c[1] + hy, c[2] + hz],
  ];
  const P = v.map((p) => proj(p, cam));
  if (P.every((p) => !p.vis)) return;
  const a = alpha * fog(proj(c, cam).d, cam);
  const faces = FACES.map((f) => {
    const pts = f.idx.map((i) => P[i]);
    // screen-space winding: front faces have a consistent sign
    const area = pts.reduce((acc, p, i) => {
      const q = pts[(i + 1) % pts.length];
      return acc + (p.x * q.y - q.x * p.y);
    }, 0);
    const depth = pts.reduce((m, p) => m + p.d, 0) / pts.length;
    const lit = Math.max(0, f.n[0] * LIGHT[0] + f.n[1] * LIGHT[1] + f.n[2] * LIGHT[2]);
    return { pts, area, depth, lit };
  })
    .filter((f) => f.area < 0)
    .sort((x, y) => y.depth - x.depth);
  for (const f of faces) {
    ctx.globalAlpha = a;
    ctx.fillStyle = `hsl(${hsl[0]},${hsl[1]}%,${Math.round(hsl[2] * (0.42 + 0.7 * f.lit))}%)`;
    ctx.beginPath();
    f.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
    if (edge) {
      ctx.strokeStyle = `hsla(${hsl[0]},${hsl[1]}%,${Math.min(92, hsl[2] + 26)}%,${a * 0.55})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
};

// Back-to-front order for a list of positions (largest depth first).
export const farToNear = <T,>(items: T[], pos: (t: T) => V3, cam: Cam): T[] =>
  [...items].sort((a, b) => proj(pos(b), cam).d - proj(pos(a), cam).d);

export const hsl = (h: number, s: number, l: number, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

// 3D bezier-ish arc between two points, lifted by `lift` in Y.
export const arc3 = (a: V3, b: V3, lift: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + Math.sin(Math.PI * t) * lift, a[2] + (b[2] - a[2]) * t] as V3;
  });
