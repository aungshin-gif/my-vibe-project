import React from "react";
import { AbsoluteFill } from "remotion";
import { bar, beat, pulse } from "./beats";
import { Logo, LogoName, PhraseCaption, Ring, Sparkles, hit, useT } from "./common";

// White screen, the logos chill together. ChatGPT (left) stays; guests land on the beat and every caption stays
// on screen for 1-1.5 s. Phrase changes follow the vocal: 1.4s "But I am not so ready...", 3.6s "Now I see...", 6.8s "I need...".
const LX = 470;
const GX = 1390;
const Y = 610;
export const CHILL_END = bar(5); // 8.877 - Claude walks in on this downbeat

type Guest = { id: LogoName; land: number; exit: number; line: string; lineAt: number; lineUntil: number; reply: string; replyAt: number; replyUntil: number; dx?: number };
const GUESTS: Guest[] = [
  { id: "gemini", land: bar(0), exit: beat(8) - 0.05, line: "Why do I over correct?", lineAt: beat(2), lineUntil: beat(5.5), reply: "Focus more", replyAt: beat(5.5), replyUntil: beat(8) - 0.05 },
  { id: "copilot", land: beat(8), exit: beat(15) - 0.05, line: "Why am I everywhere?", lineAt: beat(9), lineUntil: beat(12.5), reply: "Seen before", replyAt: beat(12.5), replyUntil: beat(15) - 0.05 },
  { id: "perplexity", land: beat(15), exit: CHILL_END, line: "Why does nobody use me?", lineAt: beat(16), lineUntil: beat(19.5), reply: "Tell me more", replyAt: beat(19.5), replyUntil: CHILL_END - 0.05 },
];
// Grok and DeepSeek hang out next to Perplexity in the last stretch
const EXTRA: { id: LogoName; land: number; dx: number; size: number }[] = [
  { id: "grok", land: beat(16), dx: -270, size: 190 },
  { id: "deepseek", land: beat(17), dx: 270, size: 190 },
];

export const Chill: React.FC = () => {
  const t = useT();
  const p = pulse(t);
  const bob = (k: number) => Math.sin(t * 2.4 + k) * 10;
  const sq = (sc: number) => ({ sx: sc * (1 + p * 0.05), sy: sc * (1 - p * 0.05) });
  const chat = hit(t, 0.103);
  const chatS = sq(Math.max(0, chat));
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <div style={{ position: "absolute", left: LX - 130, top: Y + 170, width: 260, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.08)", transform: `scaleX(${0.85 + 0.15 * Math.sin(t * 2.4)})` }} />
      <Ring x={LX} y={Y} t={t} at={0.103} size={170} />
      <Sparkles x={LX} y={Y} t={t} n={5} radius={210} seed={1} />
      <Logo name="chatgpt" size={270} x={LX} y={Y + bob(0)} scale={chatS.sx} scaleY={chatS.sy} rotate={Math.sin(t * 1.4) * 3} />
      {GUESTS.map((g, i) => {
        if (t < g.land - 0.1 || t > g.exit + 0.3) return null;
        const k = hit(t, g.land, { damping: 10, stiffness: 260, mass: 0.7 });
        const out = 1 - Math.min(1, Math.max(0, (t - (g.exit - 0.12)) / 0.3));
        const s = sq(Math.max(0, k) * out);
        const mid = g.id === "perplexity";
        const gx = GX + (mid ? 0 : 0);
        return (
          <React.Fragment key={g.id}>
            <Ring x={gx} y={Y} t={t} at={g.land} size={190} />
            <Sparkles x={gx} y={Y} t={t} n={6} radius={230} seed={i + 3} />
            <div style={{ position: "absolute", left: gx - 140, top: Y + 170, width: 280, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.08)", transform: `scaleX(${(0.85 + 0.15 * Math.sin(t * 2.4 + 1)) * Math.max(0, k) * out})` }} />
            <Logo name={g.id} size={260} x={gx + (1 - Math.min(1, k)) * 600} y={Y + bob(i + 1) - (1 - Math.min(1, k)) * 120} scale={s.sx} scaleY={s.sy} rotate={Math.sin(t * 1.7 + i) * 4 + (1 - Math.min(1, k)) * 40} />
            <PhraseCaption text={g.line} x={gx} y={Y - 270} t={t} at={g.lineAt} until={g.lineUntil} size={66} />
            <PhraseCaption text={g.reply} x={LX} y={Y - 270} t={t} at={g.replyAt} until={g.replyUntil} size={66} />
          </React.Fragment>
        );
      })}
      {EXTRA.map((e, i) => {
        if (t < e.land - 0.1) return null;
        const k = hit(t, e.land, { damping: 10, stiffness: 260, mass: 0.7 });
        const out = 1 - Math.min(1, Math.max(0, (t - (CHILL_END - 0.12)) / 0.3));
        const s = sq(Math.max(0, k) * out);
        return (
          <React.Fragment key={e.id}>
            <Ring x={GX + e.dx} y={Y + 40} t={t} at={e.land} size={110} />
            <Logo name={e.id} size={e.size} x={GX + e.dx + (1 - Math.min(1, k)) * 400} y={Y + 40 + bob(i + 4)} scale={s.sx} scaleY={s.sy} rotate={Math.sin(t * 1.9 + i * 2) * 5} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
