import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { pulse } from "./beats";
import { Confetti, INK, ORANGE, Paper, ease, pop, useT } from "./common";
import { franklin, playfair, playfairItalic } from "./fonts";

export const Outro: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const k = pop(t, 24.65, { damping: 12, stiffness: 120, mass: 0.9 });
  const spin = (1 - Math.min(1, k)) * -420 + (t - 24.65) * 24;
  const fade = ease(t, 26.7, 27.26);
  return (
    <AbsoluteFill>
      <Paper />
      <Img src={staticFile("mog/claude.png")} style={{ position: "absolute", left: 960 - 240, top: 150, width: 480, height: 480, transform: `scale(${Math.max(0, k) * (1 + p * 0.05)}) rotate(${spin}deg)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", fontFamily: playfair, fontWeight: 900, fontSize: 120, color: INK, lineHeight: 1, opacity: ease(t, 25.0, 25.3), transform: `translateY(${(1 - ease(t, 25.0, 25.35)) * 40}px)` }}>Claude Opus 5.5</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: playfairItalic, fontStyle: "italic", fontWeight: 500, fontSize: 70, color: "#a8442a", opacity: ease(t, 25.45, 25.75), transform: `translateY(${(1 - ease(t, 25.45, 25.8)) * 40}px)` }}>&amp; Fable 5.1</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", fontFamily: franklin, fontWeight: 800, fontSize: 34, letterSpacing: `${0.5 - 0.2 * ease(t, 25.8, 26.6)}em`, color: ORANGE, opacity: ease(t, 25.8, 26.1) }}>ANTHROPIC</div>
      <Confetti x={960} y={390} t={t} at={24.65} n={60} />
      <AbsoluteFill style={{ background: "#fff", opacity: fade }} />
    </AbsoluteFill>
  );
};
