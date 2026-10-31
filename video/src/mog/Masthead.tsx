import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { KD, pulse } from "./beats";
import { CornerClaude, Ring, Sparkles, Ticker, INK, ORANGE, Paper, ease, hit, useT } from "./common";
import { franklin, playfair, playfairItalic } from "./fonts";

// "ANTHROPIC" built letter by letter on the kicks; the O is the spinning Claude mark.
const LETTERS = ["A", "N", "T", "H", "R", "*", "P", "I", "C"];
const S0 = KD[8]; // 16.76
const REVEAL = [KD[8], KD[8] + 0.2, KD[9], KD[9] + 0.2, KD[10], KD[10] + 0.2, KD[11], KD[11] + 0.2, KD[12]];
export const MAST_START = KD[8];
export const MAST_END = KD[13];

export const Masthead: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const slide = 1 - ease(t, S0 - 0.22, S0 + 0.02);
  const underline = ease(t, KD[12], KD[12] + 0.5);
  const date = "VOL. V · NO. 5.5";
  const typed = date.slice(0, Math.max(0, Math.floor((t - S0) * 40)));
  return (
    <AbsoluteFill>
      <Paper />
      <AbsoluteFill style={{ transform: `translateY(${slide * 1080}px)` }}>
        {/* page-turn flash line */}
        <div style={{ position: "absolute", left: 120, right: 120, top: 120, height: 6, background: INK }} />
        <div style={{ position: "absolute", left: 120, right: 120, top: 134, height: 2, background: INK }} />
        <div style={{ position: "absolute", left: 120, right: 120, top: 150, display: "flex", justifyContent: "space-between", fontFamily: franklin, fontWeight: 700, fontSize: 24, letterSpacing: "0.22em", color: INK }}>
          <span>{typed}</span>
          <span style={{ opacity: ease(t, S0 + 0.3, S0 + 0.5) }}>SAN FRANCISCO · EST. 2021</span>
          <span style={{ opacity: ease(t, S0 + 0.6, S0 + 0.8) }}>THE OPUS EDITION</span>
        </div>
        {/* halftone dots wiping across */}
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 130 + i * 62, top: 235, width: 18, height: 18, borderRadius: 9, background: ORANGE, opacity: 0.8 * ease(t, S0 + 0.1 + i * 0.03, S0 + 0.3 + i * 0.03) * (0.5 + 0.5 * Math.sin(t * 6 + i)) }} />
        ))}
        <Ring x={960} y={470} t={t} at={KD[10] + 0.2} size={300} color="#D97757" w={8} />
        <Sparkles x={960} y={470} t={t} n={8} radius={520} color="#b99f7d" seed={2} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: playfair, fontWeight: 900, fontSize: 250, letterSpacing: "-0.01em", color: INK, whiteSpace: "nowrap", lineHeight: 1, transform: `scale(${1 + p * 0.014})` }}>
          {LETTERS.map((c, i) => {
            const k = hit(t, REVEAL[i], { damping: 11, stiffness: 260, mass: 0.7 });
            const common: React.CSSProperties = { display: "inline-block", transform: `translateY(${(1 - Math.min(1.15, k)) * 260}px) rotate(${(1 - Math.min(1, k)) * -14}deg) scale(${1 + (1 - Math.min(1, k)) * 0.3}, ${Math.min(1.2, 0.7 + k * 0.3)})`, opacity: Math.min(1, k * 3) };
            if (c === "*")
              return (
                <span key={i} style={{ ...common, width: 190, height: 190, verticalAlign: "middle", margin: "0 12px" }}>
                  <Img src={staticFile("mog/claude.png")} style={{ width: 190, height: 190, transform: `rotate(${(t - REVEAL[i]) * 140}deg)` }} />
                </span>
              );
            return (
              <span key={i} style={common}>
                {c}
              </span>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: playfairItalic, fontStyle: "italic", fontWeight: 500, fontSize: 64, color: INK, opacity: ease(t, KD[12] - 0.05, KD[12] + 0.2), transform: `translateY(${(1 - ease(t, KD[12] - 0.05, KD[12] + 0.25)) * 30}px)` }}>
          Claude Opus 5.5 &nbsp;·&nbsp; Fable 5.1
          <div style={{ margin: "14px auto 0", height: 5, width: 760 * underline, background: ORANGE }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: franklin, fontWeight: 600, fontSize: 26, letterSpacing: "0.3em", color: INK, opacity: ease(t, (KD[12] + 0.3), (KD[12] + 0.3) + 0.2) }}>
          BUILT TO BE HELPFUL, HONEST AND HARMLESS
        </div>
        <Ticker items={["BREAKING", "CLAUDE OPUS 5.5 IS HERE", "FABLE 5.1 JOINS THE TABLE", "THE TABLE HAS BEEN MOGGED"]} y={900} t={t} />
        <div style={{ position: "absolute", left: 120, right: 120, bottom: 70, height: 2, background: INK }} />
      </AbsoluteFill>
      <CornerClaude t={t} y={64} />
    </AbsoluteFill>
  );
};
