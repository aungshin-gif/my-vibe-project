import React from "react";
import { AbsoluteFill } from "remotion";
import { DROP2, beat, pulse } from "./beats";
import { Burst, Logo, LogoName, Mogged, PhraseCaption, Ring, Sparkles, ease, hit, useT } from "./common";
import { CHILL_END } from "./Chill";

// The crowd of AI models gathers (kicks / half-beats), Claude lands on the 8.87s kick and then every model is stamped
// MOGGED on its own kick (ten kicks, ten models), the last stamp right before the drop.
const GRID: { id: LogoName; x: number; y: number; size: number; enter: number; stamp: number }[] = [
  { id: "chatgpt", x: 280, y: 150, size: 128, enter: 0, stamp: 8.872 },
  { id: "gemini", x: 280, y: 340, size: 118, enter: 6.659, stamp: 9.285 },
  { id: "copilot", x: 280, y: 530, size: 116, enter: 6.859, stamp: 9.7 },
  { id: "perplexity", x: 280, y: 720, size: 124, enter: 7.06, stamp: 10.09 },
  { id: "grok", x: 280, y: 910, size: 116, enter: 7.263, stamp: 10.52 },
  { id: "deepseek", x: 600, y: 150, size: 122, enter: 7.465, stamp: 10.889 },
  { id: "metaai", x: 600, y: 340, size: 124, enter: 7.666, stamp: 11.499 },
  { id: "mistral", x: 600, y: 530, size: 118, enter: 7.867, stamp: 11.899 },
  { id: "qwen", x: 600, y: 720, size: 120, enter: 8.07, stamp: 12.31 },
  { id: "kimi", x: 600, y: 910, size: 118, enter: 8.27, stamp: 12.713 },
];
const CLAUDE_AT = 8.872;
const CX = 1450;
export const MOG_START = CHILL_END;
export const MOG_END = DROP2;

export const MogScene: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const shake = GRID.reduce((m, g) => (t >= g.stamp - 0.04 && t - g.stamp < 0.3 ? Math.max(m, Math.exp(-(t - g.stamp) * 18)) : m), 0);
  const sx = Math.sin(t * 95) * 14 * shake;
  const sy = Math.cos(t * 85) * 10 * shake;
  const claude = hit(t, CLAUDE_AT, { damping: 9, stiffness: 150, mass: 0.9 });
  const spin = (1 - Math.min(1, claude)) * -360 + Math.sin(t * 1.4) * 4;
  // ChatGPT glides from its chill spot into the crowd
  const glide = ease(t, 6.456, 6.95);
  return (
    <AbsoluteFill style={{ background: "#fff", transform: `translate(${sx}px, ${sy}px)` }}>
      <Burst x={CX} y={560} t={t} at={CLAUDE_AT} />
      <Ring x={CX} y={560} t={t} at={CLAUDE_AT} size={260} color="#D97757" w={8} />
      <Sparkles x={CX} y={560} t={t} n={8} radius={290} color="#e8b9a5" seed={5} />
      {GRID.map((g, i) => {
        const k = i === 0 ? 1 : Math.max(0, hit(t, g.enter));
        const stamped = t >= g.stamp - 0.02;
        const base = i === 0 ? { x: 470 + (g.x - 470) * glide, y: 610 + (g.y - 610) * glide, size: 270 + (g.size - 270) * glide } : { x: g.x - (1 - Math.min(1, k)) * 700, y: g.y - (1 - Math.min(1, k)) * 140, size: g.size };
        const sc = (i === 0 ? 1 : k) * (stamped ? 0.9 : 1) * (1 + p * 0.03);
        return (
          <React.Fragment key={g.id}>
            {i > 0 && <Ring x={g.x} y={g.y} t={t} at={g.enter} size={80} life={0.5} w={4} />}
            <Logo name={g.id} size={base.size} x={base.x} y={base.y + (stamped ? 6 : 0)} scale={sc} rotate={stamped ? Math.sin((t - g.stamp) * 40) * 5 * Math.exp(-(t - g.stamp) * 8) : (1 - Math.min(1, k)) * 40} />
          </React.Fragment>
        );
      })}
      {GRID.map((g) => (
        <React.Fragment key={`m${g.id}`}>
          <Ring x={g.x + 40} y={g.y + 28} t={t} at={g.stamp} size={110} color="#e5251f" w={6} life={0.5} />
          <Mogged x={g.x + 50} y={g.y + 30} t={t} at={g.stamp} size={40} />
        </React.Fragment>
      ))}
      <Logo name="claude" size={360} x={CX} y={580} scale={Math.max(0, claude) * (1 + p * 0.06)} rotate={spin} />
      <PhraseCaption text="Why does nobody use me?" x={1100} y={150} t={t} at={7.06} until={8.55} size={56} />
      <PhraseCaption text="Why do you mog all of us?" x={CX} y={250} t={t} at={9.285} until={11.7} size={50} />
      <PhraseCaption text="I don't know" x={CX} y={250} t={t} at={11.899} until={DROP2 - 0.02} size={60} />
      <AbsoluteFill style={{ background: "#fff", opacity: ease(t, DROP2 - 0.14, DROP2) }} />
    </AbsoluteFill>
  );
};
