import React from "react";
import { AbsoluteFill } from "remotion";
import { pulse } from "./beats";
import { Caption, Chip, Logo, Mogged, ease, pop, useT } from "./common";

// Claude walks in; everybody else gets stacked up and stamped MOGGED on the kicks.
const STACK = [
  { kind: "logo", id: "gemini", y: 150, at: 8.64 },
  { kind: "logo", id: "chatgpt", y: 315, at: 9.04 },
  { kind: "logo", id: "perplexity", y: 480, at: 9.45 },
  { kind: "logo", id: "copilot", y: 650, at: 9.86 },
  { kind: "chip", id: "Grok", color: "#111", y: 800, at: 10.25 },
  { kind: "chip", id: "DeepSeek", color: "#4D6BFE", y: 925, at: 10.65 },
] as const;
const STAMPS = [10.25, 10.66, 11.06, 11.43, 11.73, 12.0];
const SX = 500;
const CX = 1430;

export const MogScene: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  // screen shake after each stamp
  const shake = STAMPS.reduce((m, s) => (t >= s && t - s < 0.25 ? Math.max(m, Math.exp(-(t - s) * 20)) : m), 0);
  const sx = Math.sin(t * 90) * 14 * shake;
  const sy = Math.cos(t * 80) * 10 * shake;
  const claudeIn = pop(t, 8.55, { damping: 12, stiffness: 120, mass: 0.9 });
  const spin = (1 - Math.min(1, claudeIn)) * -300 + Math.sin(t * 1.4) * 4;
  const quote = t < 11.65 ? "Why do you mog all of us?" : "I don't know";
  return (
    <AbsoluteFill style={{ background: "#fff", transform: `translate(${sx}px, ${sy}px)` }}>
      {STACK.map((s, i) => {
        const sc = Math.max(0, pop(t, s.at)) * (1 + p * 0.03);
        const sink = STAMPS[i] !== undefined && t >= STAMPS[i] ? 0.86 : 1;
        const y = s.y + (STAMPS[i] !== undefined && t >= STAMPS[i] ? 6 : 0);
        return s.kind === "logo" ? (
          <Logo key={s.id} name={s.id} size={s.id === "copilot" ? 124 : 132} x={SX} y={y} scale={sc * sink} />
        ) : (
          <Chip key={s.id} label={s.id} color={s.color} x={SX} y={y} size={s.id === "Grok" ? 58 : 50} scale={sc * sink} />
        );
      })}
      {STACK.map((s, i) => (STAMPS[i] !== undefined ? <Mogged key={`m${s.id}`} x={SX + 100} y={s.y + 40} t={t} at={STAMPS[i]} size={s.kind === "chip" ? 34 : 44} /> : null))}
      <Logo name="claude" size={340} x={CX} y={560} scale={Math.max(0, claudeIn) * (1 + p * 0.05)} rotate={spin} />
      <Caption text={quote} x={950} y={560} size={46} scale={pop(t, quote === "I don't know" ? 11.65 : 8.8)} opacity={ease(t, 8.75, 8.9)} />
      {/* white flash into the paper world */}
      <AbsoluteFill style={{ background: "#fff", opacity: ease(t, 12.45, 12.9) }} />
    </AbsoluteFill>
  );
};
