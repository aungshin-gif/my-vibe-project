import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { KD, pulse } from "./beats";
import { BENCH } from "./data";
import { Confetti, INK, ORANGE, Ring, Sheet, Sparkles, Ticker, ease, hit, useT } from "./common";
import { franklin, playfair, serif } from "./fonts";

// White desk, a sheet of warm paper with the scoreboard. Rows land on the kicks; the Claude row lands on the downbeat.
const AT = [KD[8], KD[9], KD[10], KD[11], KD[12], KD[13]]; // DeepSeek, Grok, Gemini, GPT, Fable, Opus (landing order)
const ORDER_AT = [AT[5], AT[4], AT[3], AT[2], AT[1], AT[0]]; // table row i (Opus first) -> its landing time
export const BENCH_START = KD[7];
export const BENCH_END = KD[17];
const MIN = 70;
const MAX = 100;
const TILES = [
  { label: "CODING", v: 93.1 },
  { label: "REASONING", v: 91.8 },
  { label: "AGENTS", v: 89.6 },
];

export const Bench: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const sheet = hit(t, BENCH_START, { damping: 14, stiffness: 140, mass: 0.9 });
  const head = hit(t, KD[7]);
  const opus = KD[13];
  const stamp = hit(t, KD[14], { damping: 8, stiffness: 300, mass: 0.7 });
  const shake = t >= opus - 0.04 && t < opus + 0.3 ? Math.exp(-(t - opus) * 18) : 0;
  const arrow = ease(t, KD[13] + 0.2, KD[13] + 0.7);
  return (
    <AbsoluteFill style={{ background: "#fff", transform: `translate(${Math.sin(t * 95) * 10 * shake}px, ${Math.cos(t * 80) * 8 * shake}px)` }}>
      <Sparkles x={960} y={540} t={t} n={10} radius={840} color="#e5ddcf" seed={8} />
      <Sheet x={90} y={70} w={1740} h={820} rotate={-0.6 + Math.sin(t * 1.1) * 0.25} scale={Math.max(0, sheet) * (1 + p * 0.004)}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 30, height: 5, background: INK }} />
        <div style={{ position: "absolute", left: 40, top: 52, fontFamily: franklin, fontWeight: 800, fontSize: 24, letterSpacing: "0.3em", color: ORANGE, opacity: Math.min(1, head) }}>THE SCOREBOARD</div>
        <div style={{ position: "absolute", left: 40, top: 86, fontFamily: playfair, fontWeight: 900, fontSize: 80, color: INK, lineHeight: 1, opacity: Math.min(1, head), transform: `translateY(${(1 - Math.min(1, head)) * 40}px)` }}>Claude takes the top spot</div>
        <div style={{ position: "absolute", left: 40, top: 184, fontFamily: serif, fontStyle: "italic", fontSize: 28, color: "#5a4f43", opacity: ease(t, KD[7] + 0.2, KD[7] + 0.5) }}>
          {BENCH.metric} · higher is better
        </div>
        {BENCH.rows.map((r, i) => {
          const at = ORDER_AT[i];
          const k = Math.max(0, hit(t, at, { damping: 13, stiffness: 240, mass: 0.7 }));
          const fill = ease(t, at, at + 0.4);
          const value = (r.score * fill).toFixed(1);
          const y = 238 + i * 92;
          const w = ((r.score - MIN) / (MAX - MIN)) * 940 * fill;
          const lead = i === 0;
          return (
            <div key={r.name} style={{ position: "absolute", left: 40, top: y, width: 1640, height: 80, opacity: Math.min(1, k * 3), transform: `translateX(${(1 - Math.min(1, k)) * -140}px) scale(${lead ? 1 + p * 0.012 : 1})` }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 380, height: 84, display: "flex", alignItems: "center", gap: 16, fontFamily: franklin, fontWeight: lead ? 800 : 600, fontSize: 33, color: INK }}>
                {r.claude ? <Img src={staticFile("mog/claude.png")} style={{ width: 52, height: 52, transform: `rotate(${t * 70}deg)` }} /> : <span style={{ width: 52, height: 52, borderRadius: 26, background: "#cfc3ac", display: "inline-block" }} />}
                {r.name}
              </div>
              <div style={{ position: "absolute", left: 400, top: 12, width: 940, height: 58, background: "rgba(60,44,28,0.10)", borderRadius: 8 }} />
              <div style={{ position: "absolute", left: 400, top: 12, width: Math.max(0, w), height: 58, background: r.claude ? ORANGE : "#7a6e60", borderRadius: 8, boxShadow: r.claude ? "0 0 0 3px rgba(29,26,23,0.9)" : "none" }} />
              <div style={{ position: "absolute", left: 1370, top: 6, fontFamily: playfair, fontWeight: 900, fontSize: 54, color: r.claude ? "#a8442a" : INK }}>{value}</div>
            </div>
          );
        })}
        <Ring x={520} y={330} t={t} at={opus} size={80} color="#D97757" w={7} />
        {/* hand-drawn arrow pointing at the Claude row */}
        <svg width="260" height="170" viewBox="0 0 260 170" style={{ position: "absolute", left: 1400, top: 90 }}>
          <path d="M240 20 C170 10 90 40 70 120" fill="none" stroke="#c0361e" strokeWidth="6" strokeLinecap="round" strokeDasharray="300" strokeDashoffset={300 * (1 - arrow)} />
          <path d="M50 96 L68 130 L98 108" fill="none" stroke="#c0361e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity={ease(arrow, 0.8, 1)} />
        </svg>
        <div style={{ position: "absolute", left: 1470, top: 28, fontFamily: playfair, fontStyle: "italic", fontWeight: 700, fontSize: 36, color: "#c0361e", opacity: arrow }}>that&apos;s us</div>
        <div style={{ position: "absolute", right: 60, top: 70, transform: `rotate(-9deg) scale(${Math.max(0, stamp)})`, border: "6px solid #c0361e", color: "#c0361e", fontFamily: franklin, fontWeight: 800, fontSize: 50, letterSpacing: "0.1em", padding: "6px 24px", borderRadius: 8, opacity: 0.92 }}>NO. 1</div>
        <div style={{ position: "absolute", left: 40, bottom: 22, fontFamily: franklin, fontWeight: 500, fontSize: 20, letterSpacing: "0.08em", color: "#7a6e60" }}>ILLUSTRATIVE FIGURES FOR THIS VIDEO — NOT OFFICIAL BENCHMARK RESULTS</div>
      </Sheet>
      {/* stat tiles flipping in on the last bar */}
      {TILES.map((tl, i) => {
        const at = [KD[15], KD[16], KD[16] + 0.26][i];
        const k = hit(t, at, { damping: 12, stiffness: 240, mass: 0.7 });
        const flip = (1 - Math.min(1, k)) * 90;
        const n = (tl.v * ease(t, at, at + 0.5)).toFixed(1);
        return (
          <div key={tl.label} style={{ position: "absolute", left: 0, top: 0 }}>
            <div style={{ position: "absolute", left: 90 + i * 350, top: 905, width: 320, height: 118, background: i === 0 ? ORANGE : "#fbf6ea", border: `3px solid ${INK}`, borderRadius: 14, transform: `perspective(700px) rotateX(${flip}deg) scale(${Math.max(0, k)})`, boxShadow: "8px 10px 0 rgba(60,44,28,0.2)", padding: "10px 22px", opacity: Math.min(1, k * 2) }}>
              <div style={{ fontFamily: franklin, fontWeight: 800, fontSize: 20, letterSpacing: "0.2em", color: i === 0 ? "#fff" : "#7a6e60" }}>{tl.label}</div>
              <div style={{ fontFamily: playfair, fontWeight: 900, fontSize: 56, color: i === 0 ? "#fff" : INK, lineHeight: 1.05 }}>{n}</div>
            </div>
          </div>
        );
      })}
      <Confetti x={720} y={420} t={t} at={opus} />
      <Ticker items={["CLAUDE OPUS 5.5", "FABLE 5.1", "NO. 1 ON THE SCOREBOARD", "ALL OTHERS MOGGED"]} y={0} t={t} size={22} bg="#D97757" fg="#fff" />
    </AbsoluteFill>
  );
};
