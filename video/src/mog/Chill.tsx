import React from "react";
import { AbsoluteFill } from "remotion";
import { bar, beat, pulse } from "./beats";
import { Logo, LogoName, Ring, Sparkles, WordCaption, hit, useT } from "./common";

// White screen, the logos chill together. ChatGPT (left) stays; a guest lands on every bar line (4 beats each).
type Guest = { id: LogoName; line: string; reply: string };
const GUESTS: Guest[] = [
  { id: "gemini", line: "Why do I over correct?", reply: "Focus more" },
  { id: "copilot", line: "Why am I everywhere?", reply: "Seen before" },
  { id: "perplexity", line: "Why does nobody use me?", reply: "Tell me more" },
  { id: "grok", line: "Am I funny yet?", reply: "Not really" },
  { id: "deepseek", line: "Why am I so cheap?", reply: "Don't tell them" },
];
const LX = 470;
const GX = 1390;
const Y = 610;
export const CHILL_END = bar(5); // 8.877 - Claude walks in on this downbeat

export const Chill: React.FC = () => {
  const t = useT();
  const p = pulse(t);
  const bob = (k: number) => Math.sin(t * 2.4 + k) * 10;
  const sq = (sc: number) => ({ sx: sc * (1 + p * 0.05), sy: sc * (1 - p * 0.05) }); // squash on every kick
  const chat = hit(t, 0.103);
  const chatS = sq(Math.max(0, chat));
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {/* ground shadows */}
      <div style={{ position: "absolute", left: LX - 130, top: Y + 170, width: 260, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.08)", transform: `scaleX(${0.85 + 0.15 * Math.sin(t * 2.4)})` }} />
      <Ring x={LX} y={Y} t={t} at={0.103} size={170} />
      <Sparkles x={LX} y={Y} t={t} n={5} radius={210} seed={1} />
      <Logo name="chatgpt" size={270} x={LX} y={Y + bob(0)} scale={chatS.sx} scaleY={chatS.sy} rotate={Math.sin(t * 1.4) * 3} />
      {GUESTS.map((g, i) => {
        const start = i === 0 ? bar(0) : bar(i);
        const end = bar(i + 1);
        if (t < start - 0.1 || t > end + 0.3) return null;
        const k = hit(t, start, { damping: 10, stiffness: 260, mass: 0.7 });
        const out = 1 - Math.min(1, Math.max(0, (t - (end - 0.14)) / 0.3));
        const s = sq(Math.max(0, k) * out);
        return (
          <React.Fragment key={g.id}>
            <Ring x={GX} y={Y} t={t} at={start} size={190} />
            <Sparkles x={GX} y={Y} t={t} n={6} radius={230} seed={i + 3} />
            <div style={{ position: "absolute", left: GX - 140, top: Y + 170, width: 280, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.08)", transform: `scaleX(${(0.85 + 0.15 * Math.sin(t * 2.4 + 1)) * Math.max(0, k) * out})` }} />
            <Logo name={g.id} size={g.id === "deepseek" ? 250 : 260} x={GX + (1 - Math.min(1, k)) * 600} y={Y + bob(i + 1) - (1 - Math.min(1, k)) * 120} scale={s.sx} scaleY={s.sy} rotate={Math.sin(t * 1.7 + i) * 4 + (1 - Math.min(1, k)) * 40} />
            <WordCaption text={g.line} x={GX} y={Y - 270} t={t} at={start + 0.4035} until={start + 2 * 0.4035} size={64} />
            <WordCaption text={g.reply} x={LX} y={Y - 270} t={t} at={start + 2 * 0.4035 + 0.0} until={end - 0.02} size={64} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
