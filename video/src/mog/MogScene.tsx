import React from "react";
import { AbsoluteFill } from "remotion";
import { KD, beat, pulse } from "./beats";
import { Burst, CornerClaude, Logo, LogoName, Mogged, PhraseCaption, Ring, Sparkles, ease, hit, useT } from "./common";
import { CHILL_END } from "./Chill";

// 1) the crowd of 16 AI models gathers, 2) Claude lands on the 8.87s kick and the crowd shivers while the tension builds
// on every kick (no stamps yet), 3) the DROP (13.06): two models are stamped MOGGED on every heavy kick.
const COLS = [230, 470, 710, 950];
const ROWS = [170, 390, 610, 830];
const IDS: LogoName[] = ["chatgpt", "gemini", "copilot", "perplexity", "grok", "deepseek", "metaai", "mistral", "qwen", "kimi", "minimax", "cohere", "huggingface", "zhipu", "ernie", "mimo"];
const ENTER = [0, 16, 16, 16.5, 16.5, 17, 17, 17.5, 17.5, 18, 18, 18.5, 18.5, 19, 19, 19.5].map((n, i) => (i === 0 ? 0 : beat(n))); // two per half-beat
const STAMP_AT = IDS.map((_, i) => KD[Math.floor(i / 2)]); // pair k is stamped on drop kick k
const CLAUDE_AT = beat(21);
const CX = 1500;
export const MOG_START = CHILL_END;
export const MOG_END = KD[8];

export const MogScene: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const preKicks = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((n) => beat(n));
  // tension: shiver grows toward the drop
  const tension = ease(t, CLAUDE_AT, KD[0]);
  const shiver = (i: number) => (t >= CLAUDE_AT && t < KD[0] ? Math.sin(t * 70 + i * 1.7) * (1 + 7 * tension) * (0.4 + p) : 0);
  const shake = STAMP_AT.reduce((m, s) => (t >= s && t - s < 0.3 ? Math.max(m, Math.exp(-(t - s) * 18)) : m), 0);
  const sx = Math.sin(t * 95) * 16 * shake;
  const sy = Math.cos(t * 85) * 11 * shake;
  const claude = hit(t, CLAUDE_AT, { damping: 9, stiffness: 150, mass: 0.9 });
  const charge = 1 + tension * 0.18 + p * 0.05;
  const spin = (1 - Math.min(1, claude)) * -360 + Math.sin(t * 1.4) * 4 + (t > CLAUDE_AT ? (t - CLAUDE_AT) * (40 + 220 * tension * tension) : 0);
  const glide = ease(t, beat(15), beat(16));
  const flash = t < KD[0] ? ease(t, KD[0] - 0.2, KD[0]) : 1 - ease(t, KD[0], KD[0] + 0.25);
  return (
    <AbsoluteFill style={{ background: "#fff", transform: `translate(${sx}px, ${sy}px)` }}>
      <Burst x={CX} y={560} t={t} at={CLAUDE_AT} />
      <Ring x={CX} y={560} t={t} at={CLAUDE_AT} size={260} color="#D97757" w={8} />
      {preKicks.filter((k) => k > CLAUDE_AT && k < KD[0]).map((k, i) => (
        <Ring key={k} x={CX} y={560} t={t} at={k} size={200 + i * 18} color="#D97757" w={4 + i * 0.6} life={0.8} />
      ))}
      <Ring x={CX} y={560} t={t} at={KD[0]} size={420} color="#D97757" w={14} life={0.9} />
      <Sparkles x={CX} y={560} t={t} n={8} radius={300} color="#e8b9a5" seed={5} />
      {IDS.map((id, i) => {
        const cx = COLS[i % 4];
        const cy = ROWS[Math.floor(i / 4)];
        const e = ENTER[i];
        const k = i === 0 ? 1 : Math.max(0, hit(t, e));
        const stamped = t >= STAMP_AT[i];
        const base = i === 0 ? { x: 470 + (cx - 470) * glide, y: 610 + (cy - 610) * glide, size: 270 + (132 - 270) * glide } : { x: cx - (1 - Math.min(1, k)) * 700 + shiver(i), y: cy - (1 - Math.min(1, k)) * 140 + shiver(i + 5) * 0.6, size: 132 };
        const sc = (i === 0 ? 1 : k) * (stamped ? 0.9 : 1) * (1 + p * 0.03);
        return (
          <React.Fragment key={id}>
            {i > 0 && <Ring x={cx} y={cy} t={t} at={e} size={80} life={0.5} w={4} />}
            <Logo name={id} size={base.size} x={base.x} y={base.y + (stamped ? 6 : 0)} scale={sc} rotate={stamped ? Math.sin((t - STAMP_AT[i]) * 40) * 5 * Math.exp(-(t - STAMP_AT[i]) * 8) : (1 - Math.min(1, k)) * 40 + shiver(i + 9) * 0.5} />
          </React.Fragment>
        );
      })}
      {IDS.map((id, i) => {
        const cx = COLS[i % 4];
        const cy = ROWS[Math.floor(i / 4)];
        return (
          <React.Fragment key={`m${id}`}>
            <Ring x={cx + 36} y={cy + 30} t={t} at={STAMP_AT[i]} size={100} color="#e5251f" w={6} life={0.5} />
            <Mogged x={cx + 46} y={cy + 32} t={t} at={STAMP_AT[i]} size={40} />
          </React.Fragment>
        );
      })}
      <Logo name="claude" size={380} x={CX} y={580} scale={Math.max(0, claude) * charge} rotate={spin} />
      <PhraseCaption text="Pick me too!" x={1100} y={80} t={t} at={beat(17)} until={beat(21) - 0.1} size={52} />
      <PhraseCaption text="Why do you mog all of us?" x={CX} y={250} t={t} at={beat(22)} until={beat(28)} size={50} />
      <PhraseCaption text="I don't know" x={CX} y={250} t={t} at={beat(29)} until={KD[0] - 0.02} size={60} />
      <CornerClaude t={t} />
      <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, flash) * 0.95 }} />
    </AbsoluteFill>
  );
};
