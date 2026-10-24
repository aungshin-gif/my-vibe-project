import React from "react";
import { interpolate, spring } from "remotion";
import { Chip } from "../Chip";
import { clamp, rng } from "../lib";
import { theme } from "../theme";
import { DESIGN_FPS, useF } from "../time";
import { LAYERS } from "../timeline2";

// The six levels, each a component that runs on its own local clock (frame 0
// is the first frame of that level). Everything is a visual explanation of a
// generic decoder-only transformer, not of any specific model's internals.
const C = theme.colors;
const TOKENS = ["Hello", ",", "Claude", "."];
const XS = [785, 1045, 1305, 1565]; // token columns in the content area
const mono = theme.fonts.mono;
const disp = theme.fonts.display;

const fade = (s: number, dur: number, inF = 8, outF = 8) => interpolate(s, [0, inF, dur - outF, dur], [0, 1, 1, 0], clamp);

// diverging cell colour: cyan for negative, magenta for positive
const cell = (v: number) => (v >= 0 ? `hsla(298,100%,62%,${0.2 + 0.8 * Math.min(1, v)})` : `hsla(196,100%,58%,${0.2 + 0.8 * Math.min(1, -v)})`);

const Label: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; align?: "left" | "center" | "right"; o?: number }> = ({ x, y, text, color = C.textDim, size = 20, align = "center", o = 1 }) => (
  <div style={{ position: "absolute", left: align === "center" ? x - 300 : align === "left" ? x : x - 600, top: y, width: align === "center" ? 600 : 600, textAlign: align, fontFamily: mono, fontSize: size, color, opacity: o, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{text}</div>
);

// ───────────────────────── 1 · Embedding ─────────────────────────
type V3 = [number, number, number];
const CLOUD: V3[] = (() => {
  const r = rng(21);
  const centres: V3[] = [[-0.6, -0.3, 0.3], [0.1, 0.4, -0.4], [0.5, -0.1, 0.5], [0.6, 0.4, -0.2], [-0.2, 0.0, -0.6], [-0.5, 0.5, 0.0], [0.2, -0.5, -0.1]];
  return Array.from({ length: 420 }, (_, i) => {
    const c = centres[i % centres.length];
    return [c[0] + (r() - 0.5) * 0.5, c[1] + (r() - 0.5) * 0.5, c[2] + (r() - 0.5) * 0.5] as V3;
  });
})();
const TOKEN_POS: V3[] = [[-0.55, -0.25, 0.3], [0.05, 0.35, -0.4], [0.45, -0.1, 0.5], [0.6, 0.4, -0.2]];
const NEIGHBOURS: { t: string; p: V3 }[] = [{ t: "Hi", p: [-0.65, -0.17, 0.22] }, { t: "Hey", p: [-0.47, -0.34, 0.42] }];

const project = (p: V3, yaw: number) => {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const x1 = p[0] * c + p[2] * s;
  const z1 = -p[0] * s + p[2] * c;
  const tilt = 0.35;
  const y2 = p[1] * Math.cos(tilt) - z1 * Math.sin(tilt);
  const z2 = p[1] * Math.sin(tilt) + z1 * Math.cos(tilt);
  const k = 3 / (3 + z2);
  return { x: 1175 + x1 * 330 * k, y: 600 + y2 * 330 * k, k, z: z2 };
};

export const Embedding: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const fps = DESIGN_FPS;
  const yaw = 0.5 + s * 0.016;
  const o = fade(s, dur, 6, 8);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {CLOUD.map((p, i) => {
          const q = project(p, yaw);
          const a = interpolate(s, [i * 0.08, i * 0.08 + 12], [0, 1], clamp);
          return <circle key={i} cx={q.x} cy={q.y} r={3.6 * q.k} fill={i % 3 === 0 ? C.magenta : i % 3 === 1 ? C.cyan : C.violet} opacity={a * (0.35 + 0.55 * q.k * 0.8)} />;
        })}
        {/* semantic neighbours of "Hello" */}
        {NEIGHBOURS.map((n) => {
          const a = project(TOKEN_POS[0], yaw);
          const b = project(n.p, yaw);
          const p = interpolate(s, [36, 50], [0, 1], clamp);
          return (
            <g key={n.t} opacity={p}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.cyan} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.7} />
              <circle cx={b.x} cy={b.y} r={6} fill={C.cyan} />
              <text x={b.x - 14} y={b.y + 30} fill={C.textDim} fontSize={20} fontFamily={mono} textAnchor="middle">{n.t}</text>
            </g>
          );
        })}
        {TOKENS.map((t, i) => {
          const p = spring({ frame: s - 4 - i * 7, fps, config: theme.spring.smooth });
          const pt = project(TOKEN_POS[i], yaw);
          const px = interpolate(p, [0, 1], [960, pt.x]);
          const py = interpolate(p, [0, 1], [540, pt.y]);
          const lab = interpolate(s, [16 + i * 7, 28 + i * 7], [0, 1], clamp);
          const bx = px + (i % 2 ? -310 : 56);
          const by = py - (i < 2 ? 112 : -34);
          const [x, y, z] = TOKEN_POS[i];
          return (
            <g key={t}>
              <line x1={px} y1={py} x2={bx + (i % 2 ? 254 : 0)} y2={by + 37} stroke={C.magenta} strokeWidth={1.5} opacity={0.8 * lab} />
              <circle cx={px} cy={py} r={13 * pt.k} fill={i % 2 ? C.magenta : C.cyan} style={{ filter: `drop-shadow(0 0 14px ${i % 2 ? C.magenta : C.cyan})` }} />
              <circle cx={px} cy={py} r={24 * pt.k + Math.sin(s / 5 + i) * 2} fill="none" stroke="#fff" strokeWidth={1.5} opacity={0.5 * p} />
              <g opacity={lab} transform={`translate(${bx} ${by})`}>
                <rect width={254} height={74} rx={10} fill="rgba(6,10,28,0.78)" stroke={C.cyan} strokeWidth={1.5} />
                <text x={16} y={30} fill="#fff" fontSize={26} fontWeight={700} fontFamily={disp}>{t === "," ? "“ , ”" : t}</text>
                <text x={16} y={58} fill={C.cyan} fontSize={17} fontFamily={mono}>{`x ${x.toFixed(2)}  y ${y.toFixed(2)}  z ${z.toFixed(2)}`}</text>
              </g>
            </g>
          );
        })}
      </svg>
      {/* chips shrinking into points as they leave the black hole */}
      {TOKENS.map((t, i) => {
        const p = spring({ frame: s - 4 - i * 7, fps, config: theme.spring.smooth });
        const pt = project(TOKEN_POS[i], yaw);
        const px = interpolate(p, [0, 1], [960, pt.x]);
        const py = interpolate(p, [0, 1], [540, pt.y]);
        return <Chip key={t} text={t} x={px} y={py} p={1 - Math.min(1, p * 1.6)} scale={0.8 * (1 - p)} glow={1} hot={i % 2 === 1} seed={i} />;
      })}
      <Label x={1175} y={950} text="3-D PROJECTION OF A HIGH-DIMENSIONAL EMBEDDING SPACE" color={C.textDim} size={18} o={interpolate(s, [24, 38], [0, 1], clamp)} />
    </div>
  );
};

// ───────────────────────── 2 · Position ─────────────────────────
const ROWS = 12;
const base = (c: number, r: number) => Math.sin(r * 1.1 + c * 2.3) * 0.9;
const pe = (c: number, r: number) => Math.sin(c * (r + 1) * 0.55) * 0.8;

export const Position: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const o = fade(s, dur, 6, 6);
  const blend = interpolate(s, [18, 36], [0, 1], { easing: theme.ease.inOut, ...clamp });
  const wave = (k: number, x: number) => Math.sin(((x - 560) / 1220) * Math.PI * 2 * k + s * 0.12 * k);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {TOKENS.map((t, c) => {
          const appear = interpolate(s, [c * 3, c * 3 + 10], [0, 1], clamp);
          return (
            <g key={t} opacity={appear} transform={`translate(0 ${(1 - appear) * 20})`}>
              {Array.from({ length: ROWS }, (_, r) => {
                const v = Math.max(-1, Math.min(1, base(c, r) + blend * pe(c, r)));
                return <rect key={r} x={XS[c] - 24} y={338 + r * 28} width={48} height={22} rx={5} fill={cell(v)} stroke="rgba(255,255,255,0.12)" />;
              })}
              <text x={XS[c]} y={306} fill="#fff" fontSize={26} fontWeight={700} fontFamily={disp} textAnchor="middle">{t}</text>
              <text x={XS[c]} y={710} fill={C.cyan} fontSize={20} fontFamily={mono} textAnchor="middle">{`pos ${c}`}</text>
            </g>
          );
        })}
        {/* three sine "clocks" of different speed */}
        {[1, 2.5, 5].map((k, wi) => {
          const y = 800 + wi * 58;
          const draw = interpolate(s, [8 + wi * 4, 22 + wi * 4], [0, 1], clamp);
          const pts = Array.from({ length: 62 }, (_, i) => 560 + i * 20);
          const d = pts.map((x, i) => `${i ? "L" : "M"} ${x} ${y + wave(k, x) * 22}`).join(" ");
          return (
            <g key={k}>
              <path d={d} fill="none" stroke={[C.cyan, C.violet, C.magenta][wi]} strokeWidth={3} strokeLinecap="round" strokeDasharray={1800} strokeDashoffset={1800 * (1 - draw)} opacity={0.9} />
              {XS.map((x, c) => {
                const t = interpolate(s, [18 + c * 2 + wi, 34 + c * 2 + wi], [0, 1], { easing: theme.ease.inOut, ...clamp });
                const sy = y + wave(k, x) * 22;
                const ty = 338 + 12 * 28;
                return t > 0 && t < 1 ? <circle key={c} cx={x} cy={interpolate(t, [0, 1], [sy, ty])} r={5} fill="#fff" opacity={1 - t} style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} /> : null;
              })}
            </g>
          );
        })}
        <text x={560} y={758} fill={C.textDim} fontSize={19} fontFamily={mono}>POSITION SIGNAL (SINE WAVES OF DIFFERENT SPEED)</text>
        <text x={1175} y={600 + 90} fill={C.magenta} fontSize={64} fontWeight={700} fontFamily={disp} textAnchor="middle" opacity={0}>+</text>
      </svg>
    </div>
  );
};

// ───────────────────────── 3 · Self-attention ─────────────────────────
const W: number[][] = [[1, 0, 0, 0], [0.45, 0.55, 0, 0], [0.15, 0.25, 0.6, 0], [0.2, 0.1, 0.35, 0.35]];
const HEADS = [rng(3), rng(8), rng(13)].map((r) => W.map((row, i) => row.map((v, j) => (j <= i ? (v > 0 ? Math.min(1, v * (0.5 + r())) : 0) : 0))));

const Matrix: React.FC<{ x: number; y: number; size: number; m: number[][]; rows: number; color: string; label?: string; showLabels?: boolean }> = ({ x, y, size, m, rows, color, label, showLabels = false }) => (
  <g>
    {label && <text x={x + (size * 4) / 2} y={y - 16} fill={color} fontSize={19} fontFamily={mono} textAnchor="middle">{label}</text>}
    {m.map((row, i) =>
      row.map((v, j) => {
        const masked = j > i;
        const lit = i < rows ? 1 : 0;
        return (
          <g key={`${i}-${j}`}>
            <rect x={x + j * size} y={y + i * size} width={size - 4} height={size - 4} rx={size * 0.1} fill={masked ? "rgba(255,255,255,0.03)" : color} opacity={masked ? 1 : lit * (0.12 + 0.88 * v)} stroke="rgba(255,255,255,0.1)" />
            {masked && lit > 0 && <path d={`M ${x + j * size + 8} ${y + i * size + size - 12} L ${x + j * size + size - 12} ${y + i * size + 8}`} stroke="rgba(255,255,255,0.18)" strokeWidth={2} />}
            {showLabels && !masked && lit > 0 && v > 0.01 && <text x={x + j * size + (size - 4) / 2} y={y + i * size + size / 2 + 5} fill="#fff" fontSize={size * 0.26} fontFamily={mono} textAnchor="middle">{v.toFixed(2)}</text>}
          </g>
        );
      })
    )}
  </g>
);

export const Attention: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const fps = DESIGN_FPS;
  const o = fade(s, dur, 6, 8);
  const rows = Math.max(0, Math.min(4, Math.floor((s - 26) / 11) + 1));
  const active = Math.min(3, Math.max(0, rows - 1));
  const qkv = interpolate(s, [6, 22], [0, 1], { easing: theme.ease.out, ...clamp });
  const mx = 640;
  const my = 560;
  const size = 96;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="att2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.cyan} />
            <stop offset="1" stopColor={C.magenta} />
          </linearGradient>
        </defs>
        {/* Q K V per token */}
        {TOKENS.map((t, i) =>
          [["Q", C.cyan, -52], ["K", C.violet, 0], ["V", C.magenta, 52]].map(([l, col, dx]) => (
            <g key={`${t}${l}`} opacity={qkv} transform={`translate(${XS[i] + (dx as number)} ${(1 - qkv) * -30})`}>
              {Array.from({ length: 5 }, (_, r) => (
                <rect key={r} x={-15} y={392 + r * 19} width={30} height={15} rx={4} fill={col as string} opacity={0.25 + 0.7 * Math.abs(Math.sin(i * 1.3 + r * 0.9 + (l as string).charCodeAt(0)))} />
              ))}
              <text x={0} y={386} fill={col as string} fontSize={17} fontWeight={700} fontFamily={mono} textAnchor="middle">{l as string}</text>
            </g>
          ))
        )}
        {/* the active row looks back at earlier tokens */}
        {rows > 0 &&
          W[active].map((w, j) => {
            if (j > active || w <= 0 || j === active) return null;
            const x1 = XS[active];
            const x2 = XS[j];
            const lift = 70 + (active - j) * 40;
            const d = `M ${x1} 250 C ${x1} ${250 - lift}, ${x2} ${250 - lift}, ${x2} 250`;
            return <path key={j} d={d} fill="none" stroke="url(#att2)" strokeWidth={3 + w * 12} strokeLinecap="round" opacity={0.9} style={{ filter: `drop-shadow(0 0 12px ${C.violet})` }} />;
          })}
        <Matrix x={mx} y={my} size={size} m={W} rows={rows} color={C.cyan} label="ATTENTION  (QUERY × KEY)" showLabels />
        {TOKENS.map((t, i) => (
          <g key={t}>
            <text x={mx - 14} y={my + i * size + size / 2 + 4} fill={i === active && rows > 0 ? "#fff" : C.textDim} fontSize={19} fontFamily={mono} textAnchor="end">{t}</text>
            <text x={mx + i * size + (size - 4) / 2} y={my + 4 * size + 16} fill={C.textDim} fontSize={19} fontFamily={mono} textAnchor="middle">{t}</text>
          </g>
        ))}
        {/* active row highlight */}
        {rows > 0 && <rect x={mx - 6} y={my + active * size - 4} width={4 * size + 8} height={size + 4} rx={12} fill="none" stroke="#fff" strokeWidth={2} opacity={0.65} />}
        {/* other heads */}
        {HEADS.map((m, h) => {
          const p = interpolate(s, [46 + h * 6, 60 + h * 6], [0, 1], { easing: theme.ease.out, ...clamp });
          const x = 1130 + h * 250;
          return (
            <g key={h} opacity={p} transform={`translate(0 ${(1 - p) * 24})`}>
              <Matrix x={x} y={my + 20} size={54} m={m} rows={4} color={[C.violet, C.magenta, C.blue][h]} label={`HEAD ${h + 2}`} />
            </g>
          );
        })}
        <text x={1500} y={my + 290} fill={C.textDim} fontSize={19} fontFamily={mono} textAnchor="middle" opacity={interpolate(s, [60, 72], [0, 1], clamp)}>SEVERAL HEADS, DIFFERENT PATTERNS</text>
        <text x={mx + 200} y={my + 4 * size + 62} fill={C.magenta} fontSize={19} fontFamily={mono} textAnchor="middle" opacity={interpolate(s, [30, 42], [0, 1], clamp)}>HATCHED = MASKED (A TOKEN CANNOT SEE THE FUTURE)</text>
      </svg>
      {TOKENS.map((t, i) => (
        <Chip key={t} text={t} x={XS[i]} y={310} p={spring({ frame: s - i * 3, fps, config: theme.spring.smooth })} scale={0.62} glow={i === active && rows > 0 ? 1 : 0.35} hot={i % 2 === 1} seed={i} />
      ))}
    </div>
  );
};

// ───────────────────────── 4 · Feed-forward ─────────────────────────
export const FeedForward: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const o = fade(s, dur, 6, 6);
  const N_IN = 12;
  const COLS = 4;
  const inX = 640;
  const hidX = 880;
  const outX = 1210;
  const sumX = 1420;
  const y0 = 330;
  const rh = 30;
  const inV = (r: number) => Math.sin(r * 1.1 + 6.9) * 0.9; // the "Claude" vector
  const hid = (c: number, r: number) => Math.sin(c * 1.9 + r * 0.8 + 1) * 0.95;
  const expand = interpolate(s, [8, 22], [0, 1], { easing: theme.ease.out, ...clamp });
  const act = interpolate(s, [20, 34], [0, 1], clamp);
  const sweepY = interpolate(s, [20, 34], [y0 - 20, y0 + N_IN * rh + 20], clamp);
  const shrink = interpolate(s, [32, 44], [0, 1], { easing: theme.ease.inOut, ...clamp });
  const add = interpolate(s, [40, 50], [0, 1], clamp);
  const outV = (r: number) => Math.max(-1, Math.min(1, (inV(r) * 0.55 + Math.cos(r * 0.9) * 0.6 * shrink)));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <text x={inX + 24} y={y0 - 36} fill="#fff" fontSize={24} fontWeight={700} fontFamily={disp} textAnchor="middle">Claude</text>
        {/* input vector */}
        {Array.from({ length: N_IN }, (_, r) => (
          <rect key={r} x={inX} y={y0 + r * rh} width={48} height={rh - 5} rx={5} fill={cell(inV(r))} stroke="rgba(255,255,255,0.12)" />
        ))}
        {/* fan-out lines */}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={inX + 48} y1={y0 + (i % N_IN) * rh + 12} x2={hidX} y2={y0 + ((i * 5) % N_IN) * rh + 12} stroke={C.cyan} strokeWidth={1.5} opacity={0.35 * expand} />
        ))}
        {/* wide hidden layer (4x wider) */}
        {Array.from({ length: COLS }, (_, c) =>
          Array.from({ length: N_IN }, (_, r) => {
            const v = hid(c, r);
            const dead = v < 0 && act > 0.5 && sweepY > y0 + r * rh;
            return <rect key={`${c}-${r}`} x={hidX + c * 58} y={y0 + r * rh} width={50} height={rh - 5} rx={5} fill={dead ? "rgba(255,255,255,0.05)" : cell(v)} opacity={expand} stroke="rgba(255,255,255,0.1)" />;
          })
        )}
        {act > 0 && act < 1 && <line x1={hidX - 10} y1={sweepY} x2={hidX + COLS * 58} y2={sweepY} stroke="#fff" strokeWidth={3} style={{ filter: `drop-shadow(0 0 12px ${C.cyan})` }} />}
        {/* fan-in */}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={hidX + COLS * 58} y1={y0 + ((i * 7) % N_IN) * rh + 12} x2={outX} y2={y0 + (i % N_IN) * rh + 12} stroke={C.violet} strokeWidth={1.5} opacity={0.35 * shrink} />
        ))}
        {Array.from({ length: N_IN }, (_, r) => (
          <rect key={r} x={outX} y={y0 + r * rh} width={48} height={rh - 5} rx={5} fill={cell(outV(r))} opacity={0.15 + 0.85 * shrink} stroke="rgba(255,255,255,0.12)" />
        ))}
        {/* residual connection around the block */}
        <path d={`M ${inX + 24} ${y0 - 10} C ${inX + 24} ${y0 - 120}, ${sumX} ${y0 - 120}, ${sumX} ${y0 + 6 * rh - 30}`} fill="none" stroke={C.magenta} strokeWidth={4} strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - interpolate(s, [10, 38], [0, 1], clamp))} style={{ filter: `drop-shadow(0 0 10px ${C.magenta})` }} />
        <g opacity={add} transform={`translate(${sumX} ${y0 + 6 * rh})`}>
          <circle r={30} fill="rgba(6,10,28,0.85)" stroke={C.magenta} strokeWidth={3} />
          <path d="M -14 0 H 14 M 0 -14 V 14" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
        </g>
        <line x1={outX + 48} y1={y0 + 6 * rh} x2={sumX - 30} y2={y0 + 6 * rh} stroke={C.violet} strokeWidth={3} opacity={add} />
        {/* captions */}
        <g fontFamily={mono} fontSize={19} fill={C.textDim} textAnchor="middle">
          <text x={inX + 24} y={y0 + N_IN * rh + 34} opacity={interpolate(s, [0, 8], [0, 1], clamp)}>INPUT</text>
          <text x={hidX + 116} y={y0 + N_IN * rh + 34} opacity={expand}>EXPAND ×4</text>
          <text x={hidX + 116} y={y0 + N_IN * rh + 62} fill={C.cyan} opacity={act}>ACTIVATION: NEGATIVES SWITCH OFF</text>
          <text x={outX + 24} y={y0 + N_IN * rh + 34} opacity={shrink}>COMPRESS</text>
          <text x={sumX} y={y0 + 6 * rh + 62} fill={C.magenta} opacity={add}>ADD (RESIDUAL)</text>
        </g>
        {/* add & norm: the summed vector is rescaled to a steady range */}
        <g opacity={interpolate(s, [44, 52], [0, 1], clamp)} transform="translate(1560 330)">
          <text x={90} y={-16} fill="#fff" fontSize={22} fontWeight={700} fontFamily={disp} textAnchor="middle">NORMALISE</text>
          {Array.from({ length: 10 }, (_, i) => {
            const raw = 40 + Math.abs(Math.sin(i * 1.7)) * 150;
            const nrm = interpolate(s, [46, 54], [raw, 110], { ...clamp });
            return <rect key={i} x={i * 18} y={200 - nrm} width={13} height={nrm} rx={4} fill={C.cyan} opacity={0.85} />;
          })}
          <line x1={-6} y1={90} x2={186} y2={90} stroke={C.magenta} strokeDasharray="6 6" strokeWidth={2} />
        </g>
      </svg>
    </div>
  );
};

// ───────────────────────── 5 · Layer stack ─────────────────────────
export const LayerStack: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const o = fade(s, dur, 6, 6);
  const F = 760;
  const SP = 240;
  const cam = interpolate(s, [0, dur - 6], [-300, (LAYERS - 1) * SP], { easing: theme.ease.inOut, ...clamp });
  const cx = 1175;
  const cy = 600;
  // far layers first so the near ones sit on top
  const order = Array.from({ length: LAYERS }, (_, i) => LAYERS - 1 - i);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {order.map((i) => {
          const d = i * SP - cam + 320;
          if (d < 330 || d > 4200) return null;
          const k = F / d;
          const w = 980 * k;
          const h = 400 * k;
          const t = i / (LAYERS - 1);
          const col = `hsl(${192 + t * 106},100%,62%)`;
          const fog = Math.min(1, (d - 330) / 260) * Math.min(1, (4200 - d) / 2200);
          const lit = Math.exp(-(((d - 760) / 380) ** 2));
          const x = cx - w / 2;
          const y = cy - h / 2;
          return (
            <g key={i} opacity={fog}>
              <rect x={x} y={y} width={w} height={h} rx={26 * k} fill={col} fillOpacity={0.04 + lit * 0.12} stroke={col} strokeWidth={Math.max(1.2, 5 * k)} strokeOpacity={0.3 + lit * 0.7} style={{ filter: lit > 0.2 ? `drop-shadow(0 0 ${16 * k}px ${col})` : undefined }} />
              <rect x={x + w * 0.06} y={y + h * 0.18} width={w * 0.42} height={h * 0.64} rx={14 * k} fill={col} fillOpacity={0.08 + lit * 0.26} stroke={col} strokeOpacity={0.5} strokeWidth={Math.max(1, 2.5 * k)} />
              <rect x={x + w * 0.52} y={y + h * 0.18} width={w * 0.42} height={h * 0.64} rx={14 * k} fill={col} fillOpacity={0.08 + lit * 0.26} stroke={col} strokeOpacity={0.5} strokeWidth={Math.max(1, 2.5 * k)} />
              {k > 0.85 && k < 1.5 && (
                <>
                  <text x={x + w * 0.27} y={cy + 8 * k} fill="#fff" fontSize={34 * k} fontWeight={700} fontFamily={disp} textAnchor="middle" opacity={0.9}>ATTENTION</text>
                  <text x={x + w * 0.73} y={cy + 8 * k} fill="#fff" fontSize={34 * k} fontWeight={700} fontFamily={disp} textAnchor="middle" opacity={0.9}>FEED-FORWARD</text>
                  <text x={x + 24 * k} y={y - 14 * k} fill={col} fontSize={24 * k} fontFamily={mono}>{`LAYER ${String(i + 1).padStart(2, "0")}`}</text>
                </>
              )}
            </g>
          );
        })}
        {/* the four vectors travelling down the stack */}
        {TOKENS.map((t, i) => (
          <circle key={t} cx={cx + (i - 1.5) * 38} cy={cy + Math.sin(s / 4 + i) * 6} r={9} fill={i % 2 ? C.magenta : C.cyan} style={{ filter: `drop-shadow(0 0 14px ${i % 2 ? C.magenta : C.cyan})` }} />
        ))}
      </svg>
      <Label x={1175} y={960} text="THE HIDDEN STATE IS REFINED A LITTLE MORE AT EVERY LAYER" size={18} o={interpolate(s, [8, 20], [0, 1], clamp)} />
    </div>
  );
};

// ───────────────────────── 6 · Output logits ─────────────────────────
const VOCAB = 150;
const PEAKS: { i: number; t: string; p: number }[] = [
  { i: 22, t: "Hello", p: 0.62 },
  { i: 41, t: "Hi", p: 0.17 },
  { i: 63, t: "Hey", p: 0.09 },
  { i: 88, t: "Greetings", p: 0.05 },
  { i: 106, t: "Good", p: 0.04 },
  { i: 129, t: "Welcome", p: 0.03 },
];
const NOISE = (() => {
  const r = rng(99);
  return Array.from({ length: VOCAB }, () => 0.03 + r() * 0.1);
})();

export const Logits: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useF();
  const o = fade(s, dur, 6, 10);
  const x0 = 770;
  const step = 7;
  const baseY = 840;
  const maxH = 440;
  const rise = (i: number) => interpolate(s, [8 + i * 0.12, 24 + i * 0.12], [0, 1], { easing: theme.ease.out, ...clamp });
  const soft = interpolate(s, [28, 44], [0, 1], { easing: theme.ease.inOut, ...clamp });
  const logit = (i: number) => {
    const pk = PEAKS.find((p) => p.i === i);
    return pk ? Math.pow(pk.p / 0.62, 0.45) : NOISE[i];
  };
  const prob = (i: number) => {
    const pk = PEAKS.find((p) => p.i === i);
    return pk ? pk.p / 0.62 : NOISE[i] * 0.07;
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* final vector (last position) */}
        <text x={640} y={300} fill="#fff" fontSize={24} fontWeight={700} fontFamily={disp} textAnchor="middle">last position</text>
        {Array.from({ length: 12 }, (_, r) => (
          <rect key={r} x={616} y={324 + r * 28} width={48} height={22} rx={5} fill={cell(Math.sin(r * 1.3 + 2))} opacity={interpolate(s, [0, 8], [0, 1], clamp)} stroke="rgba(255,255,255,0.12)" />
        ))}
        {/* fan out to the vocabulary */}
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={664} y1={480} x2={x0 - 10} y2={baseY - 40 - i * 22} stroke={C.violet} strokeWidth={1.5} opacity={0.4 * interpolate(s, [4, 14], [0, 1], clamp)} />
        ))}
        {/* vocabulary bars */}
        {Array.from({ length: VOCAB }, (_, i) => {
          const pk = PEAKS.find((p) => p.i === i);
          const h = Math.max(3, maxH * rise(i) * (logit(i) * (1 - soft) + prob(i) * soft));
          const col = pk ? (pk.i === 22 ? C.cyan : C.magenta) : C.blue;
          return <rect key={i} x={x0 + i * step} y={baseY - h} width={4.5} height={h} rx={2} fill={col} opacity={pk ? 1 : 0.5} style={pk ? { filter: `drop-shadow(0 0 10px ${col})` } : undefined} />;
        })}
        {PEAKS.map((pk) => {
          const h = maxH * rise(pk.i) * (logit(pk.i) * (1 - soft) + prob(pk.i) * soft);
          const x = x0 + pk.i * step + 2;
          const a = interpolate(s, [26, 38], [0, 1], clamp);
          return (
            <g key={pk.t} opacity={a}>
              <text x={x} y={baseY - h - 40} fill={pk.i === 22 ? C.cyan : "#fff"} fontSize={pk.i === 22 ? 30 : 22} fontWeight={700} fontFamily={disp} textAnchor="middle">{pk.t}</text>
              <text x={x} y={baseY - h - 14} fill={C.textDim} fontSize={18} fontFamily={mono} textAnchor="middle">{soft > 0.5 ? pk.p.toFixed(2) : ""}</text>
            </g>
          );
        })}
        <line x1={x0 - 14} y1={baseY + 8} x2={x0 + VOCAB * step + 8} y2={baseY + 8} stroke={C.cyan} strokeWidth={2} opacity={0.7} />
        <text x={x0} y={baseY + 40} fill={C.textDim} fontSize={19} fontFamily={mono}>EVERY WORD IN THE VOCABULARY →</text>
        <text x={x0 + VOCAB * step} y={baseY + 40} fill={C.cyan} fontSize={19} fontFamily={mono} textAnchor="end" opacity={interpolate(s, [8, 20], [0, 1], clamp) * (1 - soft)}>LOGITS (RAW SCORES)</text>
        <text x={x0 + VOCAB * step} y={baseY + 40} fill={C.magenta} fontSize={19} fontFamily={mono} textAnchor="end" opacity={soft}>SOFTMAX → PROBABILITIES</text>
      </svg>
    </div>
  );
};
