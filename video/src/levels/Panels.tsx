import React from "react";
import { interpolate } from "remotion";
import { clamp, rng } from "../lib";
import { theme } from "../theme";
import { useF } from "../time";
import { STAGES } from "../timeline2";

const C = theme.colors;
const MONO = theme.fonts.mono;
const TOKENS = ["Hello", "!", "How", "can", "I", "help", "you", "?"];
const ease = (t: number) => interpolate(t, [0, 1], [0, 1], { easing: theme.ease.out, ...clamp });
const pad2 = (n: number) => String(n).padStart(2, "0");

// ---- shared card ------------------------------------------------------------
const Card: React.FC<{ kind: string; title: string; w: number; h: number; children: React.ReactNode }> = ({ kind, title, w, h, children }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: 22, border: "1px solid rgba(120,220,255,0.28)", background: "linear-gradient(160deg, rgba(14,22,44,0.82), rgba(8,10,24,0.72))", boxShadow: `0 0 50px ${C.cyan}22, inset 0 0 40px rgba(34,225,255,0.05)`, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 22, top: 16, fontFamily: MONO, fontSize: 17, letterSpacing: "0.22em", color: C.cyan }}>{kind}</div>
    <div style={{ position: "absolute", right: 22, top: 16, fontFamily: MONO, fontSize: 17, letterSpacing: "0.12em", color: C.textDim }}>{title}</div>
    <div style={{ position: "absolute", inset: 0, top: 48 }}>{children}</div>
  </div>
);

const W = 600;
const H = 540;

// ---- 1. Embedding: points in 3D vector space with XYZ axes -------------------
const POINTS = (() => {
  const r = rng(7);
  const groups = [
    { name: "Hello", c: [0.55, 0.35, 0.4] },
    { name: "Claude", c: [-0.5, 0.45, -0.3] },
    { name: "help", c: [0.15, -0.5, 0.55] },
    { name: "you", c: [-0.45, -0.35, 0.35] },
  ];
  const pts: { g: number; p: number[] }[] = [];
  groups.forEach((g, gi) => {
    for (let i = 0; i < 12; i++) pts.push({ g: gi, p: g.c.map((v) => v + (r() - 0.5) * 0.28) });
  });
  return { groups, pts };
})();

const Embedding: React.FC<{ p: number; f: number }> = ({ p, f }) => {
  const yaw = 0.5 + f * 0.012;
  const pitch = 0.42;
  const proj = (x: number, y: number, z: number): [number, number, number] => {
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y1 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
    const s = 1 / (1 - z2 * 0.35);
    return [W / 2 + x1 * 210 * s, 250 - y1 * 210 * s, s];
  };
  const o = proj(0, 0, 0);
  const axes: [string, number[], string][] = [["X", [1, 0, 0], C.cyan], ["Y", [0, 1, 0], C.magenta], ["Z", [0, 0, 1], C.violet]];
  const reveal = ease(p / 0.45);
  const converge = ease((p - 0.4) / 0.4);
  return (
    <svg width={W} height={H - 48}>
      {/* floor grid */}
      {Array.from({ length: 9 }, (_, i) => {
        const v = -1 + i * 0.25;
        const a = proj(v, -0.8, -1);
        const b = proj(v, -0.8, 1);
        const c = proj(-1, -0.8, v);
        const d = proj(1, -0.8, v);
        return (
          <g key={i} stroke="rgba(80,180,255,0.16)" strokeWidth={1}>
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
            <line x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} />
          </g>
        );
      })}
      {axes.map(([n, v, col]) => {
        const e = proj(v[0] * 1.05, v[1] * 1.05, v[2] * 1.05);
        const t1 = proj(v[0] * 0.5, v[1] * 0.5, v[2] * 0.5);
        return (
          <g key={n}>
            <line x1={o[0]} y1={o[1]} x2={e[0]} y2={e[1]} stroke={col} strokeWidth={2.5} style={{ filter: `drop-shadow(0 0 6px ${col})` }} />
            <text x={e[0] + 8} y={e[1] + 5} fill={col} fontFamily={MONO} fontWeight={700} fontSize={20}>{n}</text>
            <text x={t1[0] + 8} y={t1[1] - 6} fill={col} fontFamily={MONO} fontSize={13} opacity={0.8}>0.5</text>
          </g>
        );
      })}
      {POINTS.pts.map((pt, i) => {
        const a = Math.min(1, Math.max(0, reveal * 1.4 - (i / POINTS.pts.length) * 0.4));
        const g = POINTS.groups[pt.g].c;
        const pp = pt.p.map((v, k) => v + (g[k] - v) * converge * 0.55);
        const [x, y, s] = proj(pp[0], pp[1], pp[2]);
        const col = [C.cyan, C.magenta, C.violet, C.blue][pt.g];
        return <circle key={i} cx={x} cy={y} r={6.5 * s} fill={col} opacity={a * 0.9} style={{ filter: `drop-shadow(0 0 6px ${col})` }} />;
      })}
      {POINTS.groups.map((g, gi) => {
        const [x, y] = proj(g.c[0], g.c[1], g.c[2]);
        const a = ease((p - 0.5) / 0.25);
        return (
          <g key={g.name} opacity={a}>
            <text x={x + 16} y={y - 16} fill="#fff" fontFamily={theme.fonts.display} fontWeight={600} fontSize={22}>{g.name}</text>
            <text x={x + 16} y={y + 4} fill={C.textDim} fontFamily={MONO} fontSize={13}>{`[${g.c.map((v) => v.toFixed(2)).join(", ")}]`}</text>
          </g>
        );
      })}
      <text x={26} y={H - 76} fill={C.textDim} fontFamily={MONO} fontSize={15}>similar words land close together</text>
    </svg>
  );
};

// ---- 2. Position: sine waves + per-token position ---------------------------
const Position: React.FC<{ p: number; f: number }> = ({ p, f }) => {
  const x0 = 50;
  const x1 = W - 40;
  const cy = 190;
  const amp = 90;
  const freqs = [0.9, 1.8, 3.6];
  const cols = [C.cyan, C.violet, C.magenta];
  const n = TOKENS.length;
  const drawn = ease(p / 0.5);
  const xs = (i: number) => x0 + 20 + (i / (n - 1)) * (x1 - x0 - 40);
  const curve = (fr: number) => {
    const pts: string[] = [];
    const steps = Math.round(120 * drawn);
    for (let k = 0; k <= steps; k++) {
      const t = k / 120;
      const x = x0 + t * (x1 - x0);
      const y = cy - Math.sin(t * Math.PI * 2 * fr + f * 0.03) * amp * (0.55 + 0.45 * Math.cos(fr));
      pts.push(`${k === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const tokP = ease((p - 0.35) / 0.4);
  return (
    <svg width={W} height={H - 48}>
      <line x1={x0} y1={cy} x2={x1} y2={cy} stroke="rgba(255,255,255,0.18)" />
      <line x1={x0} y1={cy - amp - 14} x2={x0} y2={cy + amp + 14} stroke="rgba(255,255,255,0.18)" />
      <text x={x0 - 6} y={cy - amp - 20} fill={C.textDim} fontFamily={MONO} fontSize={13}>+1</text>
      <text x={x0 - 6} y={cy + amp + 30} fill={C.textDim} fontFamily={MONO} fontSize={13}>-1</text>
      {freqs.map((fr, i) => (
        <path key={i} d={curve(fr)} fill="none" stroke={cols[i]} strokeWidth={3} style={{ filter: `drop-shadow(0 0 6px ${cols[i]})` }} opacity={0.9} />
      ))}
      {TOKENS.map((t, i) => {
        const x = xs(i);
        const a = Math.min(1, Math.max(0, tokP * 1.6 - (i / n) * 0.6));
        const tt = (x - x0) / (x1 - x0);
        return (
          <g key={i} opacity={a}>
            <line x1={x} y1={cy - amp - 8} x2={x} y2={cy + amp + 8} stroke="rgba(255,255,255,0.22)" strokeDasharray="4 5" />
            {freqs.map((fr, k) => {
              const y = cy - Math.sin(tt * Math.PI * 2 * fr + f * 0.03) * amp * (0.55 + 0.45 * Math.cos(fr));
              return <circle key={k} cx={x} cy={y} r={6} fill={cols[k]} style={{ filter: `drop-shadow(0 0 7px ${cols[k]})` }} />;
            })}
            <text x={x} y={cy + amp + 54} fill={C.textDim} fontFamily={MONO} fontSize={14} textAnchor="middle">{`pos ${i}`}</text>
            <text x={x} y={cy + amp + 78} fill="#fff" fontFamily={theme.fonts.display} fontWeight={600} fontSize={18} textAnchor="middle">{t}</text>
          </g>
        );
      })}
      <text x={26} y={H - 76} fill={C.textDim} fontFamily={MONO} fontSize={15}>wave pattern = word order, added to every vector</text>
    </svg>
  );
};

// ---- 3. Attention: heatmap + links between tokens -----------------------------
const ATT = (() => {
  const r = rng(21);
  return TOKENS.map((_, i) =>
    TOKENS.map((__, j) => {
      if (j > i) return 0;
      const base = r() * 0.5 + (j === i ? 0.35 : 0) + (j === 0 ? 0.25 : 0);
      return Math.min(1, base);
    }),
  );
})();

const Attention: React.FC<{ p: number }> = ({ p }) => {
  const n = TOKENS.length;
  const cell = 36;
  const gx = 196;
  const gy = 112;
  const reveal = ease(p / 0.7);
  const focus = Math.min(n - 1, Math.floor(p * n));
  return (
    <svg width={W} height={H - 48}>
      {/* token chips + arcs */}
      {TOKENS.map((t, i) => {
        const x = gx + i * cell + cell / 2;
        return (
          <g key={`t${i}`}>
            <text x={x} y={gy - 18} fill="#fff" fontFamily={theme.fonts.display} fontWeight={600} fontSize={15} textAnchor="middle" transform={`rotate(-35 ${x} ${gy - 18})`}>{t}</text>
            <text x={gx - 12} y={gy + i * cell + cell / 2 + 5} fill="#fff" fontFamily={theme.fonts.display} fontWeight={600} fontSize={15} textAnchor="end">{t}</text>
          </g>
        );
      })}
      {ATT.map((row, i) =>
        row.map((v, j) => {
          const a = Math.min(1, Math.max(0, reveal * (n + 2) - i - 0.5));
          const hot = i === focus ? 1 : 0;
          return <rect key={`${i}-${j}`} x={gx + j * cell + 2} y={gy + i * cell + 2} width={cell - 4} height={cell - 4} rx={7} fill={v > 0 ? (v > 0.6 ? C.magenta : C.cyan) : "rgba(255,255,255,0.04)"} opacity={v > 0 ? (0.15 + v * 0.85) * a * (0.65 + 0.35 * hot) : 0.5} style={{ filter: v > 0.6 && a > 0.5 ? `drop-shadow(0 0 8px ${C.magenta})` : "none" }} />;
        }),
      )}
      {/* arcs from the focused token back to the tokens it reads */}
      {ATT[focus].map((v, j) => {
        if (j >= focus || v < 0.3) return null;
        const x0 = gx + focus * cell + cell / 2;
        const x1 = gx + j * cell + cell / 2;
        const mid = (x0 + x1) / 2;
        const lift = 20 + (x0 - x1) * 0.2;
        return <path key={j} d={`M ${x0} ${gy + n * cell + 18} Q ${mid} ${gy + n * cell + 18 + lift} ${x1} ${gy + n * cell + 18}`} fill="none" stroke={C.cyan} strokeWidth={2 + v * 4} opacity={0.35 + v * 0.55} style={{ filter: `drop-shadow(0 0 6px ${C.cyan})` }} />;
      })}
      <text x={26} y={H - 76} fill={C.textDim} fontFamily={MONO} fontSize={15}>{`"${TOKENS[focus]}" reads earlier tokens - brighter = more weight`}</text>
    </svg>
  );
};

// ---- 4. Feed-forward engine: expand, filter, compress --------------------------
const Engine: React.FC<{ p: number; f: number }> = ({ p, f }) => {
  const cy = 215;
  const bars = (n: number, x: number, h: number, col: string, k: number) =>
    Array.from({ length: n }, (_, i) => {
      const hh = h * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + k + f * 0.04)));
      const bw = Math.min(26, 150 / n);
      const bx = x + i * (bw + 4);
      return <rect key={i} x={bx} y={cy - hh / 2} width={bw} height={hh} rx={4} fill={col} opacity={0.9} style={{ filter: `drop-shadow(0 0 5px ${col})` }} />;
    });
  const flow = ease(p / 0.4);
  const gate = ease((p - 0.4) / 0.3);
  const out = ease((p - 0.65) / 0.3);
  const dots = Array.from({ length: 6 }, (_, i) => ((f * 0.025 + i / 6) % 1));
  const path = (t: number) => 40 + t * 520;
  return (
    <svg width={W} height={H - 48}>
      {/* machine frame */}
      <rect x={30} y={cy - 130} width={540} height={260} rx={22} fill="rgba(34,225,255,0.04)" stroke="rgba(120,220,255,0.32)" strokeWidth={1.5} />
      <path d={`M 40 ${cy} H 560`} stroke="rgba(120,220,255,0.28)" strokeWidth={2} strokeDasharray="6 7" />
      {/* input d */}
      <g opacity={flow}>{bars(4, 50, 80, C.cyan, 0)}</g>
      {/* expand 4d */}
      <g opacity={flow}>
        <path d={`M 160 ${cy - 40} L 215 ${cy - 100} L 215 ${cy + 100} L 160 ${cy + 40} Z`} fill="rgba(124,92,255,0.18)" stroke={C.violet} strokeWidth={1.5} />
        {bars(10, 222, 150, C.violet, 3)}
      </g>
      {/* filter */}
      <g opacity={gate}>
        <rect x={330} y={cy - 108} width={24} height={216} rx={8} fill="none" stroke={C.magenta} strokeWidth={2} style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }} />
        <text x={342} y={cy - 120} fill={C.magenta} fontFamily={MONO} fontSize={14} textAnchor="middle">GELU</text>
      </g>
      {/* compress */}
      <g opacity={out}>
        <path d={`M 400 ${cy - 100} L 455 ${cy - 40} L 455 ${cy + 40} L 400 ${cy + 100} Z`} fill="rgba(34,225,255,0.14)" stroke={C.cyan} strokeWidth={1.5} />
        {bars(4, 470, 80, C.cyan, 5)}
      </g>
      {dots.map((t, i) => (
        <circle key={i} cx={path(t)} cy={cy + Math.sin(t * 9 + i) * 3} r={4} fill="#fff" opacity={0.7 * flow} style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} />
      ))}
      <g fontFamily={MONO} fontSize={16} fill={C.textDim} textAnchor="middle">
        <text x={102} y={cy + 160}>d</text>
        <text x={310} y={cy + 160}>4 x d</text>
        <text x={512} y={cy + 160}>d</text>
      </g>
      <g fontFamily={MONO} fontSize={14} fill={C.textDim} textAnchor="middle" opacity={0.9}>
        <text x={102} y={cy + 182}>vector</text>
        <text x={310} y={cy + 182}>expanded</text>
        <text x={512} y={cy + 182}>compressed</text>
      </g>
      <text x={26} y={H - 76} fill={C.textDim} fontFamily={MONO} fontSize={15}>expand - filter - compress, once per token</text>
    </svg>
  );
};

// ---- 5. Layer stack: 24 blocks + rising curve ---------------------------------
const Stack: React.FC<{ p: number }> = ({ p }) => {
  const L = 24;
  const lit = Math.floor(ease(p / 0.9) * L);
  const cols = 8;
  const bx = 36;
  const by = 36;
  const bw = 58;
  const bh = 50;
  const gx0 = 50;
  const gy0 = 330;
  const gw = 500;
  const gh = 130;
  const pts = Array.from({ length: lit + 1 }, (_, i) => {
    const t = i / L;
    const v = 1 - Math.exp(-3.2 * t);
    return [gx0 + t * gw, gy0 + gh - v * gh] as const;
  });
  return (
    <svg width={W} height={H - 48}>
      {Array.from({ length: L }, (_, i) => {
        const x = bx + (i % cols) * (bw + 12);
        const y = by + Math.floor(i / cols) * (bh + 14);
        const on = i < lit;
        const cur = i === lit - 1;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={10} fill={on ? "rgba(34,225,255,0.18)" : "rgba(255,255,255,0.04)"} stroke={cur ? C.magenta : on ? C.cyan : "rgba(255,255,255,0.14)"} strokeWidth={cur ? 3 : 1.5} style={{ filter: cur ? `drop-shadow(0 0 10px ${C.magenta})` : "none" }} />
            <text x={x + bw / 2} y={y + bh / 2 + 6} fill={on ? "#fff" : C.textDim} fontFamily={MONO} fontSize={17} textAnchor="middle">{pad2(i + 1)}</text>
          </g>
        );
      })}
      {/* chart */}
      <line x1={gx0} y1={gy0 + gh} x2={gx0 + gw} y2={gy0 + gh} stroke="rgba(255,255,255,0.2)" />
      <line x1={gx0} y1={gy0} x2={gx0} y2={gy0 + gh} stroke="rgba(255,255,255,0.2)" />
      <text x={gx0 + 10} y={gy0 - 6} fill={C.textDim} fontFamily={MONO} fontSize={13}>understanding</text>
      <text x={gx0 + gw} y={gy0 + gh + 24} fill={C.textDim} fontFamily={MONO} fontSize={13} textAnchor="end">layer</text>
      {pts.length > 1 && <path d={pts.map((q, i) => `${i ? "L" : "M"} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ")} fill="none" stroke={C.cyan} strokeWidth={3.5} style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} />}
      {pts.length > 1 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={7} fill={C.magenta} style={{ filter: `drop-shadow(0 0 10px ${C.magenta})` }} />}
      <text x={26} y={H - 76} fill={C.textDim} fontFamily={MONO} fontSize={15}>{`layer ${pad2(Math.max(1, lit))} / ${L} - the same block, repeated`}</text>
    </svg>
  );
};

// ---- 6. Logits: probability bars ----------------------------------------------
const CAND: [string, number][] = [
  ["Hello", 0.58],
  ["Hi", 0.17],
  ["Hey", 0.08],
  ["Sure", 0.05],
  ["Good", 0.04],
  ["Yes", 0.03],
  ["I", 0.03],
  ["Greetings", 0.02],
];
const Logits: React.FC<{ p: number }> = ({ p }) => {
  const rowH = 52;
  const x0 = 170;
  const maxW = 380;
  const grow = ease(p / 0.55);
  const pick = ease((p - 0.65) / 0.25);
  return (
    <svg width={W} height={H - 48}>
      {CAND.map(([w, v], i) => {
        const a = Math.min(1, Math.max(0, grow * 1.5 - i * 0.08));
        const win = i === 0;
        const bw = v * maxW * 1.5 * a;
        const col = win ? C.magenta : C.cyan;
        return (
          <g key={w} opacity={win ? 1 : 1 - pick * 0.55}>
            <text x={x0 - 14} y={36 + i * rowH + 8} fill={win ? "#fff" : C.text} fontFamily={theme.fonts.display} fontWeight={win ? 700 : 500} fontSize={22} textAnchor="end">{w}</text>
            <rect x={x0} y={36 + i * rowH - 12} width={maxW} height={26} rx={8} fill="rgba(255,255,255,0.05)" />
            <rect x={x0} y={36 + i * rowH - 12} width={bw} height={26} rx={8} fill={col} style={{ filter: `drop-shadow(0 0 ${win ? 12 + pick * 10 : 6}px ${col})` }} />
            <text x={x0 + Math.max(bw, 40) + 10} y={36 + i * rowH + 7} fill={C.textDim} fontFamily={MONO} fontSize={16}>{`${Math.round(v * 100 * a)}%`}</text>
          </g>
        );
      })}
      <text x={26} y={H - 76} fill={C.textDim} fontFamily={MONO} fontSize={15}>one score per word - the winner becomes the next token</text>
    </svg>
  );
};

// ---- dispatcher -----------------------------------------------------------------
const PANELS: { kind: string; title: string }[] = [
  { kind: "COORDINATE", title: "embedding space  x / y / z" },
  { kind: "GRAPH", title: "position signal" },
  { kind: "GRAPH", title: "attention weights" },
  { kind: "ENGINE", title: "feed-forward block" },
  { kind: "ENGINE", title: "24 layers" },
  { kind: "GRAPH", title: "next-word probability" },
];

export const StagePanel: React.FC<{ f: number }> = ({ f }) => {
  const frame = useF();
  const idx = Math.max(0, STAGES.findIndex((s) => f >= s.from && f < s.to));
  const st = STAGES[idx];
  const local = f - st.from;
  const dur = st.to - st.from;
  const p = Math.min(1, Math.max(0, local / dur));
  const op = interpolate(local, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp);
  const shift = interpolate(local, [0, 12], [28, 0], { easing: theme.ease.out, ...clamp });
  const meta = PANELS[idx];
  const body =
    idx === 0 ? <Embedding p={p} f={frame} /> : idx === 1 ? <Position p={p} f={frame} /> : idx === 2 ? <Attention p={p} /> : idx === 3 ? <Engine p={p} f={frame} /> : idx === 4 ? <Stack p={p} /> : <Logits p={p} />;
  return (
    <div style={{ position: "absolute", left: 540, top: 270, opacity: op, transform: `translateX(${shift}px)` }}>
      <Card kind={`${pad2(idx + 1)} / ${meta.kind}`} title={meta.title} w={W} h={H}>
        {body}
      </Card>
    </div>
  );
};
