import React from "react";
import { AbsoluteFill } from "remotion";
import { DROP, bar, beat, pulse } from "./beats";
import { Burst, Logo, LogoName, Mogged, Ring, Sparkles, WordCaption, ease, hit, useT } from "./common";

// Claude lands on the downbeat; the others stack up on half-beats; MOGGED stamps hit on six consecutive kicks.
const STACK: { id: LogoName; y: number; size: number }[] = [
  { id: "gemini", y: 140, size: 120 },
  { id: "chatgpt", y: 295, size: 124 },
  { id: "perplexity", y: 450, size: 124 },
  { id: "copilot", y: 610, size: 118 },
  { id: "grok", y: 770, size: 118 },
  { id: "deepseek", y: 930, size: 124 },
];
const ENTER = [0, 1, 2, 3, 4, 5].map((i) => bar(5) + i * 0.2018); // half-beats from the downbeat
const STAMPS = [23, 24, 25, 26, 27, 28].map((n) => beat(n)); // 9.684 ... 11.701
const SX = 480;
const CX = 1440;
export const MOG_START = bar(5);
export const MOG_END = DROP;

export const MogScene: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const shake = STAMPS.reduce((m, s) => (t >= s - 0.04 && t - s < 0.3 ? Math.max(m, Math.exp(-(t - s) * 18)) : m), 0);
  const sx = Math.sin(t * 95) * 14 * shake;
  const sy = Math.cos(t * 85) * 10 * shake;
  const claude = hit(t, MOG_START, { damping: 9, stiffness: 150, mass: 0.9 });
  const spin = (1 - Math.min(1, claude)) * -360 + Math.sin(t * 1.4) * 4;
  const late = t >= beat(28) + 0.2;
  return (
    <AbsoluteFill style={{ background: "#fff", transform: `translate(${sx}px, ${sy}px)` }}>
      <Burst x={CX} y={560} t={t} at={MOG_START} />
      <Ring x={CX} y={560} t={t} at={MOG_START} size={260} color="#D97757" w={8} />
      <Sparkles x={CX} y={560} t={t} n={8} radius={290} color="#e8b9a5" seed={5} />
      {STACK.map((s, i) => {
        const k = Math.max(0, hit(t, ENTER[i]));
        const stamped = t >= STAMPS[i] - 0.02;
        const sc = k * (stamped ? 0.9 : 1) * (1 + p * 0.03);
        return (
          <React.Fragment key={s.id}>
            <Ring x={SX} y={s.y} t={t} at={ENTER[i]} size={90} life={0.5} w={4} />
            <Logo name={s.id} size={s.size} x={SX - (1 - Math.min(1, k)) * 260} y={s.y + (stamped ? 6 : 0)} scale={sc} rotate={stamped ? Math.sin((t - STAMPS[i]) * 40) * 5 * Math.exp(-(t - STAMPS[i]) * 8) : 0} />
          </React.Fragment>
        );
      })}
      {STACK.map((s, i) => (
        <React.Fragment key={`m${s.id}`}>
          <Ring x={SX + 70} y={s.y + 30} t={t} at={STAMPS[i]} size={110} color="#e5251f" w={6} life={0.5} />
          <Mogged x={SX + 90} y={s.y + 34} t={t} at={STAMPS[i]} size={s.id === "grok" || s.id === "deepseek" ? 38 : 40} />
        </React.Fragment>
      ))}
      <Logo name="claude" size={340} x={CX} y={560} scale={Math.max(0, claude) * (1 + p * 0.06)} rotate={spin + (late ? Math.sin((t - beat(28) - 0.2) * 14) * 6 : 0)} />
      <WordCaption text="Why do you mog all of us?" x={940} y={560} t={t} at={beat(22) + 0.0} until={beat(28) + 0.18} size={46} />
      <WordCaption text="I don't know" x={940} y={560} t={t} at={beat(28) + 0.2018} size={52} />
      <AbsoluteFill style={{ background: "#fff", opacity: ease(t, DROP - 0.16, DROP) }} />
    </AbsoluteFill>
  );
};
