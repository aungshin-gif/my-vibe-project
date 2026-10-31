import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { KD, pulse } from "./beats";
import { COLUMNS, NOTE, ROWS, SOURCE, Row } from "./data";
import { LOGOS, LogoName, Confetti, CornerClaude, INK, ORANGE, Paper, Ring, Sparkles, ease, hit, useT } from "./common";
import { franklin, mono, playfair } from "./fonts";

// The full LiveBench 2.0 table: every row, every column. Rows land on the kicks in waves, numbers count up,
// the top-5 shading sweeps across the columns, then the Claude rows pulse.
export const BENCH_START = KD[8]; // 19.007
export const BENCH_END = KD[16]; // 22.77

const X0 = 90;
const NAME_W = 470;
const COLW = [118, 118, 108, 108, 140, 150, 130, 140, 160];
const COLX = COLW.map((_, i) => X0 + NAME_W + COLW.slice(0, i).reduce((a, b) => a + b, 0));
const TOP = 200;
const HEAD_H = 50;
const ROW_H = 36;
const WAVES = [KD[8], KD[9], KD[10], KD[11], KD[12]];
const rowAt = (i: number) => (i < 4 ? WAVES[0] + i * 0.035 : i < 9 ? WAVES[1] + (i - 4) * 0.035 : i < 13 ? WAVES[2] + (i - 9) * 0.035 : i < 16 ? WAVES[3] + (i - 13) * 0.035 : WAVES[4] + (i - 16) * 0.035);
const KEYS = ["overall", "agentic", "design", "coding", "browser", "data", "research", "reasoning"] as const;
// rank (1 = best) of each row in each column, for the top-5 shading
const RANK: Record<string, number[]> = {};
KEYS.forEach((k) => {
  const sorted = [...ROWS].map((r) => r[k]).sort((a, b) => b - a);
  RANK[k] = ROWS.map((r) => sorted.indexOf(r[k]) + 1);
});

const logoFor = (n: string): LogoName | null =>
  n.startsWith("GPT") ? "chatgpt" : n.startsWith("Gemini") ? "gemini" : n.startsWith("DeepSeek") ? "deepseek" : n.startsWith("Kimi") ? "kimi" : n.startsWith("Grok") ? "grok" : n.startsWith("MiMo") ? "mimo" : n.startsWith("MiniMax") ? "minimax" : n.startsWith("Mistral") ? "mistral" : n.startsWith("Muse") ? "metaai" : null;

export const Bench: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const head = hit(t, KD[8]);
  const shadeT = KD[13];
  const claudePulse = (t >= KD[14] && t < KD[14] + 0.4 ? Math.exp(-(t - KD[14]) * 8) : 0) + (t >= KD[15] && t < KD[15] + 0.4 ? Math.exp(-(t - KD[15]) * 8) : 0);
  const stamp = hit(t, KD[14], { damping: 8, stiffness: 300, mass: 0.7 });
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Paper />
      <Sparkles x={960} y={540} t={t} n={8} radius={860} color="#eadfc9" seed={8} />
      <div style={{ position: "absolute", left: X0, right: X0, top: 40, height: 5, background: INK }} />
      <div style={{ position: "absolute", left: X0, top: 62, fontFamily: franklin, fontWeight: 800, fontSize: 24, letterSpacing: "0.3em", color: ORANGE, opacity: Math.min(1, head) }}>THE LEADERBOARD · {SOURCE.toUpperCase()}</div>
      <div style={{ position: "absolute", left: X0, top: 94, fontFamily: playfair, fontWeight: 900, fontSize: 72, color: INK, lineHeight: 1, opacity: Math.min(1, head), transform: `translateY(${(1 - Math.min(1, head)) * 40}px)` }}>Claude leads the board</div>
      <div style={{ position: "absolute", left: X0, top: 172, fontFamily: franklin, fontWeight: 600, fontSize: 24, color: "#6b5d4d", opacity: ease(t, KD[8] + 0.2, KD[8] + 0.45) }}>Fable 5.1 is #1 overall and in Coding · Opus 5.5 leads Design</div>
      {/* header */}
      <div style={{ position: "absolute", left: X0, top: TOP + 14, width: 1740, height: HEAD_H, opacity: Math.min(1, head * 2) }}>
        <div style={{ position: "absolute", left: 0, top: 10, fontFamily: mono, fontWeight: 600, fontSize: 18, letterSpacing: "0.12em", color: "#7a6e60" }}>MODEL</div>
        {[...COLUMNS.map((c) => c.label), "COST / TASK"].map((l, i) => (
          <div key={l} style={{ position: "absolute", left: COLX[i] - X0, width: COLW[i] - 14, textAlign: "right", top: 10, fontFamily: mono, fontWeight: 600, fontSize: 17, letterSpacing: "0.06em", color: i === 0 ? INK : "#7a6e60", whiteSpace: "nowrap" }}>
            {l}
          </div>
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: INK }} />
      </div>
      {ROWS.map((r: Row, i) => {
        const at = rowAt(i);
        const k = Math.max(0, hit(t, at, { damping: 13, stiffness: 260, mass: 0.7 }));
        const y = TOP + 14 + HEAD_H + i * ROW_H;
        const cl = !!r.claude;
        const glow = cl ? claudePulse : 0;
        const cnt = ease(t, at, at + 0.5);
        return (
          <div key={r.name} style={{ position: "absolute", left: X0, top: y, width: 1740, height: ROW_H, opacity: Math.min(1, k * 3), transform: `translateY(${(1 - Math.min(1, k)) * 26}px)`, background: cl ? `rgba(217,119,87,${0.1 + glow * 0.25})` : "transparent", borderBottom: "1px solid rgba(60,44,28,0.14)" }}>
            {cl && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: ORANGE }} />}
            <div style={{ position: "absolute", left: 16, top: 0, height: ROW_H, display: "flex", alignItems: "center", gap: 10, fontFamily: franklin, fontWeight: cl ? 800 : 600, fontSize: 22, color: INK, whiteSpace: "nowrap" }}>
              {cl ? <Img src={staticFile("mog/claude.png")} style={{ width: 28, height: 28, transform: `rotate(${t * 120}deg)` }} /> : logoFor(r.name) ? <Img src={staticFile(LOGOS[logoFor(r.name)!].src)} style={{ width: 28, height: 28, objectFit: "contain" }} /> : <span style={{ width: 28 }} />}
              {r.name}
              {r.open && <span style={{ fontFamily: mono, fontWeight: 600, fontSize: 13, color: "#2f7d4f", border: "1.5px solid #2f7d4f", borderRadius: 6, padding: "0 6px" }}>open</span>}
            </div>
            {KEYS.map((key, ci) => {
              const v = r[key];
              const rank = RANK[key][i];
              const sh = rank <= 5 ? ease(t, shadeT + ci * 0.06, shadeT + ci * 0.06 + 0.25) * (0.42 - (rank - 1) * 0.07) : 0;
              return (
                <div key={key} style={{ position: "absolute", left: COLX[ci] - X0 - 6, width: COLW[ci] - 8, top: 2, height: ROW_H - 4, borderRadius: 5, background: `rgba(217,119,87,${sh})`, textAlign: "right", paddingRight: 8, fontFamily: mono, fontWeight: ci === 0 ? 700 : 600, fontSize: 21, color: INK, lineHeight: `${ROW_H - 4}px` }}>
                  {(v * cnt).toFixed(1)}
                </div>
              );
            })}
            <div style={{ position: "absolute", left: COLX[8] - X0, width: COLW[8] - 14, top: 0, textAlign: "right", fontFamily: mono, fontWeight: 600, fontSize: 21, color: "#4a3f33", lineHeight: `${ROW_H}px` }}>${(r.cost * cnt).toFixed(3)}</div>
          </div>
        );
      })}
      <Ring x={420} y={TOP + 14 + HEAD_H + 18} t={t} at={KD[14]} size={90} color="#D97757" w={6} />
      <div style={{ position: "absolute", right: 110, top: 78, transform: `rotate(-8deg) scale(${Math.max(0, stamp)})`, border: "6px solid #c0361e", color: "#c0361e", fontFamily: franklin, fontWeight: 800, fontSize: 46, letterSpacing: "0.1em", padding: "4px 22px", borderRadius: 8, opacity: 0.92 }}>FABLE 5.1 · #1</div>
      <div style={{ position: "absolute", left: X0, right: 150, bottom: 28, fontFamily: mono, fontSize: 15, lineHeight: 1.45, color: "#8a7d6c", opacity: ease(t, KD[12], KD[12] + 0.3) }}>// {NOTE}</div>
      <Confetti x={520} y={TOP + 80} t={t} at={KD[14]} n={40} />
      <CornerClaude t={t} y={72} />
      <AbsoluteFill style={{ background: "#fff", opacity: 0 * p }} />
    </AbsoluteFill>
  );
};
