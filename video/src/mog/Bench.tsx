import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { pulse } from "./beats";
import { BENCH } from "./data";
import { Confetti, INK, ORANGE, Paper, ease, pop, useT } from "./common";
import { franklin, playfair, serif } from "./fonts";

const ROW_AT = [18.2, 17.786, 16.939, 16.254, 15.755, 15.34]; // top row (Opus) lands last, on its own kick
const MIN = 70;
const MAX = 100;

export const Bench: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const head = pop(t, 15.34, { damping: 16, stiffness: 140, mass: 0.8 });
  const stamp = pop(t, 18.6, { damping: 9, stiffness: 200, mass: 0.7 });
  const shake = t >= 18.2 && t < 18.5 ? Math.exp(-(t - 18.2) * 18) : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 90) * 10 * shake}px, ${Math.cos(t * 80) * 8 * shake}px)` }}>
      <Paper />
      <div style={{ position: "absolute", left: 130, right: 130, top: 70, height: 5, background: INK }} />
      <div style={{ position: "absolute", left: 130, top: 94, fontFamily: franklin, fontWeight: 800, fontSize: 26, letterSpacing: "0.3em", color: ORANGE, opacity: Math.min(1, head) }}>THE SCOREBOARD</div>
      <div style={{ position: "absolute", left: 130, top: 130, fontFamily: playfair, fontWeight: 900, fontSize: 84, color: INK, lineHeight: 1, opacity: Math.min(1, head), transform: `translateY(${(1 - Math.min(1, head)) * 40}px)` }}>Claude takes the top spot</div>
      <div style={{ position: "absolute", left: 130, top: 232, fontFamily: serif, fontWeight: 400, fontStyle: "italic", fontSize: 30, color: "#5a4f43", opacity: ease(t, 15.5, 15.8) }}>
        {BENCH.metric} · higher is better
      </div>
      {BENCH.rows.map((r, i) => {
        const at = ROW_AT[i];
        const k = Math.max(0, pop(t, at, { damping: 14, stiffness: 150, mass: 0.8 }));
        const fill = ease(t, at + 0.05, at + 0.55);
        const value = (r.score * fill).toFixed(1);
        const y = 330 + i * 108;
        const w = ((r.score - MIN) / (MAX - MIN)) * 1000 * fill;
        const lead = i === 0;
        return (
          <div key={r.name} style={{ position: "absolute", left: 130, top: y, width: 1660, height: 88, opacity: Math.min(1, k * 2), transform: `translateX(${(1 - Math.min(1, k)) * -80}px) scale(${lead ? 1 + p * 0.012 : 1})` }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 380, height: 88, display: "flex", alignItems: "center", gap: 16, fontFamily: franklin, fontWeight: lead ? 800 : 600, fontSize: 34, color: INK }}>
              {r.claude ? <Img src={staticFile("mog/claude.png")} style={{ width: 54, height: 54, transform: `rotate(${t * 40}deg)` }} /> : <span style={{ width: 54, height: 54, borderRadius: 27, background: "#cfc3ac", display: "inline-block" }} />}
              {r.name}
            </div>
            <div style={{ position: "absolute", left: 400, top: 14, width: 1000, height: 60, background: "rgba(60,44,28,0.10)", borderRadius: 8 }} />
            <div style={{ position: "absolute", left: 400, top: 14, width: Math.max(0, w), height: 60, background: r.claude ? ORANGE : "#7a6e60", borderRadius: 8, boxShadow: r.claude ? "0 0 0 3px rgba(29,26,23,0.9)" : "none" }} />
            <div style={{ position: "absolute", left: 1430, top: 8, fontFamily: playfair, fontWeight: 900, fontSize: 56, color: r.claude ? "#a8442a" : INK }}>{value}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 150, top: 150, transform: `rotate(-9deg) scale(${Math.max(0, stamp)})`, border: "6px solid #c0361e", color: "#c0361e", fontFamily: franklin, fontWeight: 800, fontSize: 52, letterSpacing: "0.1em", padding: "6px 24px", borderRadius: 8 }}>NO. 1</div>
      <Confetti x={1250} y={420} t={t} at={18.2} />
      <div style={{ position: "absolute", left: 130, bottom: 40, fontFamily: franklin, fontWeight: 500, fontSize: 22, letterSpacing: "0.08em", color: "#7a6e60" }}>ILLUSTRATIVE FIGURES FOR THIS VIDEO — NOT OFFICIAL BENCHMARK RESULTS</div>
    </AbsoluteFill>
  );
};
