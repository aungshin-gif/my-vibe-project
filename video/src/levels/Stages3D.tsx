import React from "react";
import { interpolate, spring } from "remotion";
import { Chip } from "../Chip";
import { arc3, arrow3, axes, Canvas3D, Cam, cube3, Ctx, dot3, farToNear, floor3, line3, poly3, proj, text3, V3 } from "../g3d";
import { clamp, rng } from "../lib";
import { theme } from "../theme";
import { DESIGN_FPS, useF } from "../time";
import { LAYERS } from "../timeline2";

// The six levels as true 3D scenes (orbit camera, XYZ axes with numbered
// ticks, shaded cubes). Each runs on its own local clock. They illustrate a
// generic decoder-only transformer, not any specific model's internals.
const C = theme.colors;
const TOKENS = ["Hello", ",", "Claude", "."];
const mono = theme.fonts.mono;
const disp = theme.fonts.display;

const fade = (s: number, dur: number, inF = 8, outF = 8) => interpolate(s, [0, inF, dur - outF, dur], [0, 1, 1, 0], clamp);
const ease = theme.ease.inOut;

const POS: [number, number, number] = [0, 0, 0];
const CYAN = 192;
const MAG = 298;
const VIO = 266;
// value -> cube colour (cyan = negative, magenta = positive)
const valHsl = (v: number): [number, number, number] => (v >= 0 ? [MAG, 100, 46 + 22 * Math.min(1, v)] : [CYAN, 100, 44 + 22 * Math.min(1, -v)]);

const Caption: React.FC<{ x?: number; y: number; text: string; color?: string; size?: number; o?: number }> = ({ x = 1175, y, text, color = C.textDim, size = 20, o = 1 }) => (
  <div style={{ position: "absolute", left: x - 700, top: y, width: 1400, textAlign: "center", fontFamily: mono, fontSize: size, color, opacity: o, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{text}</div>
);

// rounded tag drawn on the canvas, anchored to a 3D point
const tag = (ctx: Ctx, cam: Cam, p: V3, title: string, sub: string, color: string, a = 1, dx = 28, dy = -64) => {
  const q = proj(p, cam);
  if (!q.vis || a <= 0.01) return;
  const w = Math.max(220, title.length * 17 + 40);
  const x = q.x + dx;
  const y = q.y + dy;
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(q.x, q.y);
  ctx.lineTo(dx > 0 ? x : x + w, y + 34);
  ctx.stroke();
  ctx.fillStyle = "rgba(6,10,28,0.82)";
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 68, 10);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  ctx.font = `700 25px ${disp}`;
  ctx.fillText(title, x + 14, y + 29);
  ctx.fillStyle = color;
  ctx.font = `500 17px ${mono}`;
  ctx.fillText(sub, x + 14, y + 55);
  ctx.globalAlpha = 1;
};

// ───────────────────────── 1 · Embedding ─────────────────────────
const CENTRES: V3[] = [[-1.7, -0.8, 0.8], [0.3, 1.1, -1.4], [1.5, -0.4, 1.5], [1.9, 1.2, -0.7], [-0.6, 0.1, -1.7], [-1.4, 1.4, 0.0], [0.6, -1.3, -0.4]];
const CLOUD: V3[] = (() => {
  const r = rng(21);
  return Array.from({ length: 460 }, (_, i) => {
    const c = CENTRES[i % CENTRES.length];
    return [c[0] + (r() - 0.5) * 1.5, c[1] + (r() - 0.5) * 1.5, c[2] + (r() - 0.5) * 1.5] as V3;
  });
})();
const TOK: V3[] = [[-1.6, -0.5, 0.9], [0.2, 1.2, -1.3], [1.5, -0.2, 1.5], [1.8, 1.1, -0.7]];
const NEIGH: { t: string; p: V3 }[] = [{ t: "Hi", p: [-1.85, -0.25, 0.65] }, { t: "Hey", p: [-1.35, -0.8, 1.15] }];

export const Embedding: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const fps = DESIGN_FPS;
  const cam: Cam = { yaw: interpolate(s, [0, dur], [-0.8, 0.5], { easing: ease }), pitch: 0.36, dist: 8.6, target: [0, 0.2, 0] };
  const o = fade(s, dur, 8, 10);
  const grow = (i: number) => interpolate(s, [16 + i * 9, 44 + i * 9], [0, 1], { easing: theme.ease.out, ...clamp });
  const draw = (ctx: Ctx, c: Cam) => {
    floor3(ctx, c, { y: -1.9, half: 3.6, step: 0.6, alpha: 0.9 });
    axes(ctx, c, { len: 3, step: 0.5, names: ["X", "Y", "Z"] });
    // cloud of other words
    const pts = farToNear(CLOUD, (p) => p, c);
    pts.forEach((p, i) => {
      const a = interpolate(s, [i * 0.04, i * 0.04 + 14], [0, 0.85], clamp);
      dot3(ctx, c, p, 0.035, [i % 3 === 0 ? MAG : i % 3 === 1 ? CYAN : VIO, 100, 62], a);
    });
    // token vectors: arrow from the origin, drop line, floor ring, sphere, tag
    TOK.forEach((p, i) => {
      const g = grow(i);
      const tip: V3 = [p[0] * g, p[1] * g, p[2] * g];
      const col = i % 2 ? C.magenta : C.cyan;
      const h = i % 2 ? MAG : CYAN;
      line3(ctx, c, tip, [tip[0], -1.9, tip[2]], col, 1.3, 0.55 * g);
      poly3(ctx, c, Array.from({ length: 25 }, (_, k) => [tip[0] + Math.cos((k / 24) * 6.283) * 0.22, -1.9, tip[2] + Math.sin((k / 24) * 6.283) * 0.22] as V3), col, 1.5, 0.7 * g);
      arrow3(ctx, c, POS, tip, col, 3.2, 0.95 * g);
      if (g > 0.6) dot3(ctx, c, tip, 0.13, [h, 100, 58], Math.min(1, (g - 0.6) * 3));
      tag(ctx, c, TOK[i], TOKENS[i] === "," ? "comma" : TOKENS[i], `x ${TOK[i][0].toFixed(2)}  y ${TOK[i][1].toFixed(2)}  z ${TOK[i][2].toFixed(2)}`, col, interpolate(s, [34 + i * 9, 50 + i * 9], [0, 1], clamp) * 0.95, i % 2 ? -250 : 30, i < 2 ? -92 : 22);
    });
    // words with similar meaning sit close together; the angle between vectors is small
    const near = interpolate(s, [84, 104], [0, 1], clamp);
    NEIGH.forEach((n) => {
      line3(ctx, c, TOK[0], n.p, C.cyan, 1.4, 0.8 * near);
      dot3(ctx, c, n.p, 0.09, [CYAN, 100, 60], near);
      text3(ctx, c, [n.p[0], n.p[1] - 0.32, n.p[2]], n.t, { size: 22, color: "#fff", alpha: near });
      arrow3(ctx, c, POS, n.p, "rgba(150,230,255,1)", 1.8, 0.6 * near);
    });
    if (near > 0) {
      const a = TOK[0];
      const b = NEIGH[0].p;
      const nrm = (v: V3) => {
        const m = Math.hypot(v[0], v[1], v[2]);
        return [v[0] / m, v[1] / m, v[2] / m] as V3;
      };
      const na = nrm(a);
      const nb = nrm(b);
      poly3(ctx, c, Array.from({ length: 13 }, (_, k) => {
        const t = k / 12;
        const m = nrm([na[0] + (nb[0] - na[0]) * t, na[1] + (nb[1] - na[1]) * t, na[2] + (nb[2] - na[2]) * t]);
        return [m[0] * 0.9, m[1] * 0.9, m[2] * 0.9] as V3;
      }), "#fff", 2.4, near, 8);
      text3(ctx, c, [na[0] * 0.75 + 0.2, na[1] * 0.75 + 0.35, na[2] * 0.75], "small angle", { size: 17, color: "#fff", mono: true, alpha: near, weight: 500 });
    }
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Canvas3D cam={cam} draw={draw} />
      {TOKENS.map((t, i) => {
        const p = spring({ frame: s - 2 - i * 6, fps, config: theme.spring.smooth });
        const q = proj(TOK[i], cam);
        const x = interpolate(p, [0, 1], [960, q.x]);
        const y = interpolate(p, [0, 1], [540, q.y]);
        return <Chip key={t} text={t} x={x} y={y} p={Math.max(0, 1 - p * 1.4)} scale={0.8 * (1 - p * 0.7)} glow={1} hot={i % 2 === 1} seed={i} />;
      })}
      <Caption y={968} text="EACH TOKEN BECOMES A VECTOR · 3 OF THE MANY DIMENSIONS ARE SHOWN" o={interpolate(s, [24, 40], [0, 1], clamp)} />
    </div>
  );
};

// ───────────────────────── 2 · Position ─────────────────────────
const ROWS = 12;
const COLX = [-3.3, -1.1, 1.1, 3.3];
const baseV = (c: number, r: number) => Math.sin(r * 1.1 + c * 2.3) * 0.9;
const peV = (c: number, r: number) => Math.sin(c * (r + 1) * 0.55) * 0.8;
const WAVES = [{ k: 1, y: 1.6, col: C.cyan }, { k: 2.5, y: 0.4, col: C.violet }, { k: 5, y: -0.8, col: C.magenta }];

export const Position: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const cam: Cam = { yaw: interpolate(s, [0, dur], [-0.55, 0.4], { easing: ease }), pitch: 0.3, dist: 11.5, target: [0, 0.55, -0.6] };
  const o = fade(s, dur, 8, 10);
  const blend = interpolate(s, [34, 70], [0, 1], { easing: ease, ...clamp });
  const waveY = (w: (typeof WAVES)[number], x: number) => w.y + Math.sin(((x + 4.4) / 8.8) * Math.PI * 2 * w.k + s * 0.1 * w.k) * 0.32;
  const draw = (ctx: Ctx, c: Cam) => {
    floor3(ctx, c, { y: -2.5, half: 4.4, step: 0.8, alpha: 0.8 });
    axes(ctx, c, { len: 3.8, step: 1, names: ["POS", "VAL", "DIM"] });
    // three sine "clocks" on a back wall
    WAVES.forEach((w, wi) => {
      const draw01 = interpolate(s, [8 + wi * 6, 36 + wi * 6], [0, 1], clamp);
      const n = 60;
      const pts = Array.from({ length: Math.max(2, Math.floor(n * draw01)) }, (_, i) => {
        const x = -4.4 + (i / (n - 1)) * 8.8;
        return [x, waveY(w, x), -2.8] as V3;
      });
      poly3(ctx, c, pts, w.col, 3.4, 0.95, 14);
      line3(ctx, c, [-4.5, w.y, -2.8], [4.5, w.y, -2.8], w.col, 1, 0.25);
    });
    // token columns of cubes
    const order = farToNear(COLX.flatMap((x, ci) => Array.from({ length: ROWS }, (_, r) => ({ ci, r, x }))), (e) => [e.x, -1.2 + e.r * 0.34, 0], c);
    order.forEach(({ ci, r, x }) => {
      const appear = interpolate(s, [ci * 4 + r * 0.5, ci * 4 + r * 0.5 + 12], [0, 1], clamp);
      const v = Math.max(-1, Math.min(1, baseV(ci, r) + blend * peV(ci, r)));
      const zOff = blend * peV(ci, r) * 0.5; // position signal pushes cubes in depth
      cube3(ctx, c, [x, -1.2 + r * 0.34, zOff], [0.62, 0.28, 0.62], valHsl(v), 0.95 * appear);
    });
    // samples travelling from the waves into the columns
    WAVES.forEach((w, wi) => {
      COLX.forEach((x, ci) => {
        const t = interpolate(s, [30 + ci * 4 + wi * 2, 58 + ci * 4 + wi * 2], [0, 1], { easing: ease, ...clamp });
        if (t <= 0 || t >= 1) return;
        const a: V3 = [x, waveY(w, x), -2.8];
        const b: V3 = [x, 1.4 + wi * 0.15, 0];
        dot3(ctx, c, [a[0], a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], 0.1, [195, 100, 70], 1 - t * 0.7);
      });
    });
    COLX.forEach((x, ci) => {
      text3(ctx, c, [x, 3.2, 0], TOKENS[ci], { size: 28, color: "#fff", weight: 700 });
      text3(ctx, c, [x, -2.35, 1.3], `pos ${ci}`, { size: 20, color: C.cyan, mono: true, weight: 500 });
    });
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Canvas3D cam={cam} draw={draw} />
      <Caption y={968} text="THE SAME WORD AT A DIFFERENT POSITION GETS A DIFFERENT SIGNAL ADDED" o={interpolate(s, [20, 36], [0, 1], clamp)} />
    </div>
  );
};

// ───────────────────────── 3 · Self-attention ─────────────────────────
const W: number[][] = [[1, 0, 0, 0], [0.45, 0.55, 0, 0], [0.15, 0.25, 0.6, 0], [0.2, 0.1, 0.35, 0.35]];
const HEAD_W = [rng(3), rng(8), rng(13)].map((r) => W.map((row, i) => row.map((v, j) => (j <= i ? (v > 0 ? Math.min(1, v * (0.5 + r())) : 0) : 0))));
const TX = [-3.3, -1.1, 1.1, 3.3];
const CELL = 0.82;
const MX0 = -1.64; // matrix origin (x), cells span 4*CELL
const MZ0 = 2.4;
const MY = -2.2;

const matrix3 = (ctx: Ctx, c: Cam, m: number[][], o: { x0: number; z0: number; y: number; cell: number; rows: number; hue: number; hmax: number; alpha?: number; outline?: number }) => {
  const cells: { i: number; j: number }[] = [];
  m.forEach((row, i) => row.forEach((_, j) => cells.push({ i, j })));
  farToNear(cells, ({ i, j }) => [o.x0 + (j + 0.5) * o.cell, o.y, o.z0 + (i + 0.5) * o.cell], c).forEach(({ i, j }) => {
    const masked = j > i;
    const lit = i < o.rows;
    const h = masked ? 0.05 : Math.max(0.05, m[i][j] * o.hmax * (lit ? 1 : 0));
    const p: V3 = [o.x0 + (j + 0.5) * o.cell, o.y + h / 2, o.z0 + (i + 0.5) * o.cell];
    cube3(ctx, c, p, [o.cell * 0.86, h, o.cell * 0.86], masked ? [230, 20, 24] : [o.hue, 100, 56], (o.alpha ?? 1) * (masked ? 0.9 : lit ? 1 : 0.25));
    if (masked && lit) {
      const a: V3 = [p[0] - o.cell * 0.3, o.y + 0.07, p[2] - o.cell * 0.3];
      const b: V3 = [p[0] + o.cell * 0.3, o.y + 0.07, p[2] + o.cell * 0.3];
      const a2: V3 = [p[0] - o.cell * 0.3, o.y + 0.07, p[2] + o.cell * 0.3];
      const b2: V3 = [p[0] + o.cell * 0.3, o.y + 0.07, p[2] - o.cell * 0.3];
      line3(ctx, c, a, b, "rgba(255,255,255,0.35)", 1.5, o.alpha ?? 1);
      line3(ctx, c, a2, b2, "rgba(255,255,255,0.35)", 1.5, o.alpha ?? 1);
    }
  });
};

export const Attention: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const cam: Cam = { yaw: interpolate(s, [0, dur], [-0.5, 0.42], { easing: ease }), pitch: 0.5, dist: 12.8, target: [0.3, 1.35, 0.6] };
  const o = fade(s, dur, 8, 10);
  const rows = Math.max(0, Math.min(4, Math.floor((s - 40) / 20) + 1));
  const active = Math.min(3, Math.max(0, rows - 1));
  const qkv = interpolate(s, [8, 34], [0, 1], { easing: theme.ease.out, ...clamp });
  const heads = interpolate(s, [118, 150], [0, 1], { easing: theme.ease.out, ...clamp });
  const draw = (ctx: Ctx, c: Cam) => {
    floor3(ctx, c, { y: MY - 0.02, half: 5, step: 1, alpha: 0.7 });
    axes(ctx, c, { len: 4.6, step: 1, alpha: 0.6, names: ["TOKEN", "HEIGHT", "TOKEN"] });
    // token plates, Q K V stacks
    TOKENS.forEach((t, i) => {
      cube3(ctx, c, [TX[i], 2.0, -1.5], [1.7, 0.56, 0.4], i % 2 ? [VIO, 80, 48] : [215, 90, 52], 0.95);
      text3(ctx, c, [TX[i], 2.0, -1.72], t, { size: 26, color: "#fff", weight: 700 });
      (["Q", "K", "V"] as const).forEach((l, li) => {
        const x = TX[i] + (li - 1) * 0.62;
        const col: [number, number, number] = li === 0 ? [CYAN, 100, 56] : li === 1 ? [VIO, 90, 62] : [MAG, 100, 60];
        for (let r = 0; r < 5; r++) {
          const v = 0.4 + 0.6 * Math.abs(Math.sin(i * 1.3 + r * 0.9 + li));
          cube3(ctx, c, [x, 0.85 - r * 0.3 - (1 - qkv) * 1.2, -0.4], [0.22, 0.2, 0.22], [col[0], col[1], col[2] * (0.6 + 0.5 * v)], qkv);
        }
        text3(ctx, c, [x, 1.25 - (1 - qkv) * 1.2, -0.4], l, { size: 17, color: `hsl(${col[0]},100%,70%)`, mono: true, weight: 700, alpha: qkv });
      });
    });
    // the active query looks back at earlier tokens
    if (rows > 0) {
      W[active].forEach((w, j) => {
        if (j >= active || w <= 0) return;
        poly3(ctx, c, arc3([TX[active], 2.4, -1.5], [TX[j], 2.4, -1.5], 1 + (active - j) * 0.55), C.magenta, 2 + w * 12, 0.9, 16);
        line3(ctx, c, [TX[j], 1.7, -1.5], [MX0 + (j + 0.5) * CELL, MY + 0.6, MZ0 + (active + 0.5) * CELL], C.cyan, 1.2, 0.35 + w * 0.4);
      });
      line3(ctx, c, [TX[active], 1.7, -1.5], [MX0 + (active + 0.5) * CELL, MY + 0.6, MZ0 + (active + 0.5) * CELL], "#fff", 1.6, 0.6);
    }
    // attention weights as a 3-D bar chart (rows = query, columns = key); upper triangle masked
    matrix3(ctx, c, W, { x0: MX0, z0: MZ0, y: MY, cell: CELL, rows, hue: CYAN, hmax: 2.1 });
    TOKENS.forEach((t, i) => {
      text3(ctx, c, [MX0 - 0.5, MY + 0.05, MZ0 + (i + 0.5) * CELL], t === "," ? "," : t, { size: 20, color: i === active && rows > 0 ? "#fff" : C.textDim, align: "right", mono: true, weight: 500 });
      text3(ctx, c, [MX0 + (i + 0.5) * CELL, MY + 0.05, MZ0 + 4 * CELL + 0.45], t, { size: 20, color: C.textDim, mono: true, weight: 500 });
    });
    // other attention heads as translucent trays floating above/behind
    HEAD_W.forEach((m, h) => {
      const y = MY + 1.0 + h * 1.35 + (1 - heads) * -2;
      matrix3(ctx, c, m, { x0: 4.8, z0: -0.6, y, cell: 0.5, rows: 4, hue: [VIO, MAG, 215][h], hmax: 0.7, alpha: 0.9 * heads });
      text3(ctx, c, [5.8, y + 0.9, -0.9], `HEAD ${h + 2}`, { size: 17, color: C.textDim, mono: true, alpha: heads, weight: 600 });
    });
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Canvas3D cam={cam} draw={draw} />
      <Caption y={968} text="EVERY TOKEN SCORES THE TOKENS BEFORE IT · HATCHED CELLS = MASKED (NO PEEKING AT THE FUTURE)" o={interpolate(s, [30, 46], [0, 1], clamp)} />
    </div>
  );
};

// ───────────────────────── 4 · Feed-forward ─────────────────────────
const NIN = 12;
const inVal = (r: number) => Math.sin(r * 1.1 + 6.9) * 0.9;
const hidVal = (col: number, r: number, dz: number) => Math.sin(col * 1.9 + r * 0.8 + 1 + dz * 2) * 0.95;

export const FeedForward: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const cam: Cam = { yaw: interpolate(s, [0, dur], [-0.62, 0.3], { easing: ease }), pitch: 0.34, dist: 14, target: [0.2, 0.6, 0] };
  const o = fade(s, dur, 8, 10);
  const expand = interpolate(s, [10, 34], [0, 1], { easing: theme.ease.out, ...clamp });
  const sweep = interpolate(s, [40, 70], [-2.8, 2.8], { easing: ease, ...clamp });
  const shrink = interpolate(s, [64, 88], [0, 1], { easing: ease, ...clamp });
  const resid = interpolate(s, [20, 80], [0, 1], { easing: ease, ...clamp });
  const addN = interpolate(s, [84, 100], [0, 1], clamp);
  const norm = interpolate(s, [100, 122], [0, 1], { easing: ease, ...clamp });
  const ry = (r: number) => -2.3 + r * 0.42;
  const outVal = (r: number) => Math.max(-1, Math.min(1, inVal(r) * 0.55 + Math.cos(r * 0.9) * 0.6 * shrink));
  const draw = (ctx: Ctx, c: Cam) => {
    floor3(ctx, c, { y: -2.9, half: 7, step: 1, alpha: 0.6 });
    axes(ctx, c, { len: 6, step: 1, alpha: 0.5, labels: false, names: ["FLOW", "WIDTH", "Z"] });
    // fan lines
    for (let i = 0; i < 18; i++) {
      line3(ctx, c, [-5.4, ry(i % NIN), 0], [-2.0, ry((i * 5) % NIN), (i % 2 ? 0.5 : -0.5)], C.cyan, 1.2, 0.3 * expand);
      line3(ctx, c, [1.3, ry((i * 7) % NIN), (i % 2 ? 0.5 : -0.5)], [4.0, ry(i % NIN), 0], C.violet, 1.2, 0.3 * shrink);
    }
    // cubes: input column, 4x wider hidden block, output column
    type Cb = { p: V3; s: V3; col: [number, number, number]; a: number };
    const list: Cb[] = [];
    for (let r = 0; r < NIN; r++) list.push({ p: [-5.4, ry(r), 0], s: [0.5, 0.36, 0.5], col: valHsl(inVal(r)), a: 1 });
    for (let col = 0; col < 4; col++)
      for (let r = 0; r < NIN; r++)
        for (const dz of [-0.5, 0.5]) {
          const v = hidVal(col, r, dz);
          const dead = v < 0 && ry(r) < sweep;
          const sz = dead ? 0.1 : 0.44;
          list.push({ p: [-2.0 + col * 0.95 + (1 - expand) * -1.2 * (3 - col) * 0.3, ry(r), dz * expand], s: [0.5 * (0.4 + 0.6 * expand), sz, 0.44], col: dead ? [230, 25, 24] : valHsl(v), a: expand });
        }
    for (let r = 0; r < NIN; r++) {
      const v = outVal(r);
      const hh = interpolate(norm, [0, 1], [0.2 + Math.abs(Math.sin(r * 1.7)) * 0.5, 0.36]);
      list.push({ p: [4.0, ry(r), 0], s: [0.5, hh, 0.5], col: valHsl(v), a: 0.15 + 0.85 * shrink });
    }
    farToNear(list, (e) => e.p, c).forEach((e) => cube3(ctx, c, e.p, e.s, e.col, e.a));
    // activation sweep plane
    if (s > 38 && s < 74) {
      const a = 0.9;
      poly3(ctx, c, [[-2.4, sweep, -0.9], [1.5, sweep, -0.9], [1.5, sweep, 0.9], [-2.4, sweep, 0.9], [-2.4, sweep, -0.9]], "#fff", 2.6, a, 16);
    }
    // residual connection over the top, merging at the add node
    const arcPts = arc3([-5.4, 2.6, 0], [6.1, 0.1, 0], 1.7, 40);
    poly3(ctx, c, arcPts.slice(0, Math.max(2, Math.floor(arcPts.length * resid))), C.magenta, 4.2, 0.95, 18);
    if (addN > 0) {
      poly3(ctx, c, Array.from({ length: 25 }, (_, k) => [6.1, 0.1 + Math.cos((k / 24) * 6.283) * 0.55, Math.sin((k / 24) * 6.283) * 0.55] as V3), C.magenta, 3.6, addN, 14);
      line3(ctx, c, [6.1, -0.25, 0], [6.1, 0.45, 0], "#fff", 3, addN);
      line3(ctx, c, [5.75, 0.1, 0], [6.45, 0.1, 0], "#fff", 3, addN);
      arrow3(ctx, c, [4.4, 0.1, 0], [5.5, 0.1, 0], C.violet, 2.4, addN);
    }
    // labels in 3-D
    text3(ctx, c, [-5.4, 3.0, 0], "Claude", { size: 26, color: "#fff", weight: 700 });
    text3(ctx, c, [-5.4, -3.15, 0], "INPUT", { size: 18, color: C.textDim, mono: true, alpha: expand > 0 ? 1 : 0.6 });
    text3(ctx, c, [-0.5, -3.15, 0], "EXPAND ×4", { size: 18, color: C.cyan, mono: true, alpha: expand });
    text3(ctx, c, [-0.5, -3.7, 0], "ACTIVATION: NEGATIVES SWITCH OFF", { size: 18, color: "#fff", mono: true, alpha: interpolate(s, [40, 52], [0, 1], clamp) * (s < 76 ? 1 : 0.4) });
    text3(ctx, c, [4.0, -3.15, 0], "COMPRESS", { size: 18, color: C.violet, mono: true, alpha: shrink });
    text3(ctx, c, [6.1, -0.9, 0], "ADD", { size: 18, color: C.magenta, mono: true, alpha: addN });
    text3(ctx, c, [4.0, -3.7, 0], "NORMALISE", { size: 18, color: C.cyan, mono: true, alpha: norm });
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Canvas3D cam={cam} draw={draw} />
      <Caption y={968} text="WIDEN · SWITCH OFF WEAK SIGNALS · COMPRESS · ADD BACK THE ORIGINAL · RESCALE" o={interpolate(s, [16, 32], [0, 1], clamp)} />
    </div>
  );
};

// ───────────────────────── 5 · Layer stack ─────────────────────────
const SP = 1.7;
export const LayerStack: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const camZ = interpolate(s, [0, dur - 10], [-4, (LAYERS - 1) * SP - 4.5], { easing: ease, ...clamp });
  const cam: Cam = { yaw: Math.sin(s / 38) * 0.3, pitch: 0.16 + Math.sin(s / 50) * 0.04, dist: 6.4, target: [0, 0, camZ], roll: Math.sin(s / 45) * 0.04 };
  const o = fade(s, dur, 8, 10);
  const draw = (ctx: Ctx, c: Cam) => {
    // depth axis through the stack with a numbered tick per layer
    line3(ctx, c, [0, -2.6, -6], [0, -2.6, LAYERS * SP + 4], C.violet, 2, 0.6);
    for (let i = 0; i < LAYERS; i++) {
      const z = i * SP;
      line3(ctx, c, [-0.18, -2.6, z], [0.18, -2.6, z], C.violet, 1.6, 0.8);
      if (i % 4 === 3) text3(ctx, c, [0.5, -2.85, z], `L${i + 1}`, { size: 18, color: C.violet, mono: true, weight: 600 });
    }
    text3(ctx, c, [0, -3.3, camZ + 5], "Z · DEPTH (LAYERS)", { size: 19, color: C.violet, mono: true, weight: 700, alpha: 0.9 });
    const idx = Array.from({ length: LAYERS }, (_, i) => i);
    const nearest = idx.filter((i) => i * SP - camZ >= 2.4).sort((a, b) => a - b)[0];
    farToNear(idx, (i) => [0, 0, i * SP], c).forEach((i) => {
      const z = i * SP;
      const rel = z - camZ;
      if (rel < 1.4) return;
      const t = i / (LAYERS - 1);
      const h = 192 + t * 106;
      const near = Math.exp(-(((rel - 4.2) / 2.4) ** 2));
      const a = Math.min(1, (rel - 1.4) / 2) * Math.min(1, (26 - rel) / 10);
      cube3(ctx, c, [0, 0, z], [7.4, 3.5, 0.16], [h, 85, 30 + near * 24], 0.3 + near * 0.25, true);
      cube3(ctx, c, [-1.85, 0, z], [3.1, 2.3, 0.52], [h, 100, 46 + near * 14], 0.7 * a);
      cube3(ctx, c, [1.85, 0, z], [3.1, 2.3, 0.52], [h + 24, 100, 46 + near * 14], 0.7 * a);
      if (i === nearest) {
        text3(ctx, c, [-1.85, 0, z - 0.34], "ATTENTION", { size: 25, color: "#fff", weight: 700, alpha: a });
        text3(ctx, c, [1.85, 0, z - 0.34], "FEED-FORWARD", { size: 25, color: "#fff", weight: 700, alpha: a });
        text3(ctx, c, [-3.4, 2.1, z - 0.2], `LAYER ${String(i + 1).padStart(2, "0")}`, { size: 22, color: `hsl(${h},100%,72%)`, mono: true, weight: 700, align: "left", alpha: a });
      }
    });
    // the four token vectors spiral down the stack
    TOKENS.forEach((t, i) => {
      const ph = s / 6 + i * 1.57;
      const p: V3 = [Math.cos(ph) * 0.9, Math.sin(ph) * 0.9, camZ + 3.4];
      poly3(ctx, c, Array.from({ length: 10 }, (_, k) => {
        const pp = ph - k * 0.16;
        return [Math.cos(pp) * 0.9, Math.sin(pp) * 0.9, camZ + 3.4 - k * 0.12] as V3;
      }), i % 2 ? C.magenta : C.cyan, 3, 0.7, 10);
      dot3(ctx, c, p, 0.13, [i % 2 ? MAG : CYAN, 100, 62], 1);
    });
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Canvas3D cam={cam} draw={draw} />
      <Caption y={968} text="THE SAME TWO-PART BLOCK, REPEATED · THE HIDDEN STATE IS REFINED AT EVERY LAYER" o={interpolate(s, [8, 22], [0, 1], clamp)} />
    </div>
  );
};

// ───────────────────────── 6 · Output logits ─────────────────────────
const VCOLS = 15;
const VROWS = 10;
const VSP = 0.62;
const PEAKS: { i: number; t: string; p: number }[] = [
  { i: 52, t: "Hello", p: 0.62 },
  { i: 31, t: "Hi", p: 0.17 },
  { i: 97, t: "Hey", p: 0.09 },
  { i: 74, t: "Greetings", p: 0.05 },
  { i: 12, t: "Good", p: 0.04 },
  { i: 123, t: "Welcome", p: 0.03 },
];
const NOISE = (() => {
  const r = rng(99);
  return Array.from({ length: VCOLS * VROWS }, () => 0.03 + r() * 0.12);
})();

export const Logits: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const cam: Cam = { yaw: interpolate(s, [0, dur], [-0.85, 0.3], { easing: ease }), pitch: interpolate(s, [0, 70, dur], [0.62, 0.42, 0.34], clamp), dist: 15, target: [0.5, 0.4, 0] };
  const o = fade(s, dur, 8, 12);
  const rise = (i: number) => interpolate(s, [12 + (i % VCOLS) * 0.9 + Math.floor(i / VCOLS) * 1.5, 40 + (i % VCOLS) * 0.9 + Math.floor(i / VCOLS) * 1.5], [0, 1], { easing: theme.ease.out, ...clamp });
  const soft = interpolate(s, [64, 90], [0, 1], { easing: ease, ...clamp });
  const base = -1.5;
  const pk = (i: number) => PEAKS.find((p) => p.i === i);
  const height = (i: number) => {
    const p = pk(i);
    const logit = p ? 0.9 + Math.pow(p.p / 0.62, 0.5) * 2.4 : NOISE[i] * 3.2;
    const prob = p ? (p.p / 0.62) * 4.2 : NOISE[i] * 0.35;
    return Math.max(0.05, rise(i) * (logit * (1 - soft) + prob * soft));
  };
  const cellPos = (i: number): V3 => [((i % VCOLS) - (VCOLS - 1) / 2) * VSP, base, (Math.floor(i / VCOLS) - (VROWS - 1) / 2) * VSP];
  const draw = (ctx: Ctx, c: Cam) => {
    floor3(ctx, c, { y: base - 0.02, half: 5.6, step: 0.62, alpha: 0.5 });
    // axes along the grid's front-left corner
    const ox = -5.3;
    const oz = 3.4;
    arrow3(ctx, c, [ox, base, oz], [ox + 11.2, base, oz], C.cyan, 2.4, 0.9);
    arrow3(ctx, c, [ox, base, oz], [ox, base + 5.4, oz], C.magenta, 2.4, 0.9);
    arrow3(ctx, c, [ox, base, oz], [ox, base, oz - 7.6], C.violet, 2.4, 0.9);
    for (let k = 0; k <= 5; k++) {
      line3(ctx, c, [ox - 0.07, base + k, oz], [ox + 0.07, base + k, oz], C.magenta, 1.4, 0.8);
      text3(ctx, c, [ox - 0.3, base + k, oz], k.toFixed(0), { size: 15, color: C.magenta, mono: true, weight: 500, align: "right" });
    }
    for (let k = 0; k <= 14; k += 2) text3(ctx, c, [ox + 0.4 + k * 0.76, base - 0.05, oz + 0.36], String(k * 10), { size: 14, color: C.cyan, mono: true, weight: 500 });
    text3(ctx, c, [ox + 11.7, base, oz], "X · WORD", { size: 19, color: C.cyan, mono: true, weight: 700, align: "left" });
    text3(ctx, c, [ox, base + 5.75, oz], "Y · SCORE", { size: 19, color: C.magenta, mono: true, weight: 700 });
    // last-position vector feeding the vocabulary
    for (let r = 0; r < NIN; r++) cube3(ctx, c, [-7.6, -1.3 + r * 0.34, 0], [0.4, 0.26, 0.4], valHsl(Math.sin(r * 1.3 + 2)), interpolate(s, [0, 12], [0, 1], clamp));
    text3(ctx, c, [-7.6, -1.95, 0], "last position", { size: 21, color: "#fff", weight: 700 });
    for (let i = 0; i < 16; i++) line3(ctx, c, [-7.3, -1.3 + (i % NIN) * 0.34, 0], [-5.3, base + 0.1, ((i % VROWS) - (VROWS - 1) / 2) * VSP], C.violet, 1.1, 0.4 * interpolate(s, [6, 20], [0, 1], clamp));
    // the vocabulary as a skyline
    const ids = Array.from({ length: VCOLS * VROWS }, (_, i) => i);
    farToNear(ids, cellPos, c).forEach((i) => {
      const p = pk(i);
      const h = height(i);
      const q = cellPos(i);
      const col: [number, number, number] = p ? (p.i === 52 ? [CYAN, 100, 56] : [MAG, 100, 58]) : [222, 90, 46];
      cube3(ctx, c, [q[0], base + h / 2, q[2]], [VSP * 0.62, h, VSP * 0.62], col, p ? 1 : 0.72);
    });
    // labels and a beam above the winner
    PEAKS.forEach((p) => {
      const q = cellPos(p.i);
      const h = height(p.i);
      const a = interpolate(s, [44, 60], [0, 1], clamp);
      text3(ctx, c, [q[0], base + h + 0.45, q[2]], p.t, { size: p.i === 52 ? 30 : 22, color: p.i === 52 ? C.cyan : "#fff", weight: 700, alpha: a });
      if (soft > 0.5) text3(ctx, c, [q[0], base + h + 0.1, q[2]], p.p.toFixed(2), { size: 18, color: C.textDim, mono: true, alpha: (soft - 0.5) * 2 });
    });
    const w = cellPos(52);
    line3(ctx, c, [w[0], base + height(52), w[2]], [w[0], base + height(52) + 2.6, w[2]], C.cyan, 3, 0.8 * soft);
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Canvas3D cam={cam} draw={draw} />
      <Caption y={968} text="ONE SCORE PER WORD (LOGITS)  →  SOFTMAX TURNS SCORES INTO PROBABILITIES" o={interpolate(s, [16, 30], [0, 1], clamp)} />
    </div>
  );
};

