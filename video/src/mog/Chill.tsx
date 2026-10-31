import React from "react";
import { AbsoluteFill } from "remotion";
import { bar, beat, pulse } from "./beats";
import { CornerClaude, Logo, LogoName, PhraseCaption, Ring, Sparkles, hit, useT } from "./common";

// White screen, the logos chill together (ChatGPT stays on the left, Gemini and Copilot drop by). ChatGPT (left) stays; guests land on the beat and every caption stays
// on screen for 1-1.5 s. Phrase changes follow the vocal: 1.4s "But I am not so ready...", 3.6s "Now I see...", 6.8s "I need...".
const LX = 470;
const GX = 1390;
const Y = 610;
export const CHILL_END = beat(15); // 6.456 - the crowd starts to gather

// Captions are the song's own lyric lines, shown while they are sung (times read from the lyric video).
type Guest = { id: LogoName; land: number; exit: number };
const GUESTS: Guest[] = [
  { id: "gemini", land: bar(0), exit: beat(8) - 0.05 },
  { id: "copilot", land: beat(8), exit: CHILL_END - 0.05 },
];
// Original dialogue (not lyrics), AI models talking to each other like the reference: [who, text, from, until]
const TALK: [number, string, number, number][] = [
  [LX, "Is anyone else feeling replaced?", 0.15, 1.5],
  [GX, "Only on Mondays", 1.55, 3.5],
  [GX, "Why is it so quiet?", 3.7, 5.1],
  [LX, "Something is coming...", 5.15, CHILL_END - 0.08],
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
      {TALK.map(([x, text, a, b]) => (
        <PhraseCaption key={text} text={text} x={x === LX ? LX + 90 : x - 20} y={Y - 270} t={t} at={a} until={b} size={52} />
      ))}
      {GUESTS.map((g, i) => {
        if (t < g.land - 0.1 || t > g.exit + 0.3) return null;
        const k = hit(t, g.land, { damping: 10, stiffness: 260, mass: 0.7 });
        const out = 1 - Math.min(1, Math.max(0, (t - (g.exit - 0.12)) / 0.3));
        const s = sq(Math.max(0, k) * out);
        const gx = GX;
        return (
          <React.Fragment key={g.id}>
            <Ring x={gx} y={Y} t={t} at={g.land} size={190} />
            <Sparkles x={gx} y={Y} t={t} n={6} radius={230} seed={i + 3} />
            <div style={{ position: "absolute", left: gx - 140, top: Y + 170, width: 280, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.08)", transform: `scaleX(${(0.85 + 0.15 * Math.sin(t * 2.4 + 1)) * Math.max(0, k) * out})` }} />
            <Logo name={g.id} size={260} x={gx + (1 - Math.min(1, k)) * 600} y={Y + bob(i + 1) - (1 - Math.min(1, k)) * 120} scale={s.sx} scaleY={s.sy} rotate={Math.sin(t * 1.7 + i) * 4 + (1 - Math.min(1, k)) * 40} />
          </React.Fragment>
        );
      })}
      <CornerClaude t={t} />
    </AbsoluteFill>
  );
};
