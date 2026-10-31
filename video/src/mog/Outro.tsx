import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { KD, pulse } from "./beats";
import { Burst, Confetti, INK, ORANGE, Ring, Sparkles, ease, hit, useT } from "./common";
import { franklin, playfair, playfairItalic } from "./fonts";

export const OUTRO_START = KD[31]; // 25.39

export const Outro: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const k = hit(t, OUTRO_START, { damping: 9, stiffness: 170, mass: 0.9 });
  const spin = (1 - Math.min(1, k)) * -420 + (t - OUTRO_START) * 30;
  const fade = ease(t, 26.75, 27.26);
  const l1 = hit(t, KD[32]);
  const l2 = hit(t, KD[33]);
  const l3 = hit(t, KD[34]);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {/* warm paper glow behind the mark */}
      <div style={{ position: "absolute", left: 960 - 560, top: 400 - 380, width: 1120, height: 760, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(243,234,215,1), rgba(243,234,215,0))", opacity: Math.min(1, k) }} />
      <Burst x={960} y={390} t={t} at={OUTRO_START} />
      <Ring x={960} y={390} t={t} at={OUTRO_START} size={300} color="#D97757" w={9} life={0.9} />
      <Ring x={960} y={390} t={t} at={KD[33]} size={260} color="#D97757" w={5} />
      <Sparkles x={960} y={390} t={t} n={10} radius={380} color="#e8b9a5" seed={4} />
      <Img src={staticFile("mog/claude.png")} style={{ position: "absolute", left: 960 - 240, top: 150, width: 480, height: 480, transform: `scale(${Math.max(0, k) * (1 + p * 0.05)}) rotate(${spin}deg)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontFamily: playfair, fontWeight: 900, fontSize: 120, color: INK, lineHeight: 1, opacity: Math.min(1, l1 * 2), transform: `translateY(${(1 - Math.min(1, l1)) * 60}px) scale(${0.9 + 0.1 * Math.min(1.1, l1)})` }}>Claude Opus 5.5</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: playfairItalic, fontStyle: "italic", fontWeight: 500, fontSize: 70, color: "#a8442a", opacity: Math.min(1, l2 * 2), transform: `translateY(${(1 - Math.min(1, l2)) * 60}px)` }}>&amp; Fable 5.1</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", fontFamily: franklin, fontWeight: 800, fontSize: 36, letterSpacing: `${0.55 - 0.25 * ease(t, KD[34], KD[34] + 0.7)}em`, color: ORANGE, opacity: Math.min(1, l3 * 2) }}>ANTHROPIC</div>
      <Confetti x={960} y={390} t={t} at={OUTRO_START} n={60} />
      <AbsoluteFill style={{ background: "#fff", opacity: fade }} />
    </AbsoluteFill>
  );
};
