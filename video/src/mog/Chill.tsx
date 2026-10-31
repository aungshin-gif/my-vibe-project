import React from "react";
import { AbsoluteFill } from "remotion";
import { nearestKick, pulse } from "./beats";
import { Caption, Chip, Logo, ease, pop, useT } from "./common";

// White screen, the logos chill together. The chat-bot on the left stays; a new guest drops in on a kick every ~2.2s.
type Guest = { id: "gemini" | "copilot" | "perplexity" | "grok" | "deepseek"; from: number; to: number; guestLine: string; leftLine: string };
const GUESTS: Guest[] = [
  { id: "gemini", from: 0.08, to: 2.6, guestLine: "Why do I over correct?", leftLine: "Focus more" },
  { id: "copilot", from: 2.6, to: 4.9, guestLine: "Why am I everywhere?", leftLine: "Seen before" },
  { id: "perplexity", from: 4.9, to: 7.0, guestLine: "Why does nobody use me?", leftLine: "Tell me more" },
  { id: "grok", from: 7.0, to: 7.8, guestLine: "Am I funny yet?", leftLine: "" },
  { id: "deepseek", from: 7.8, to: 8.7, guestLine: "Why am I so cheap?", leftLine: "" },
];
const LX = 520;
const GX = 1320;
const Y = 590;

const GuestMark: React.FC<{ id: Guest["id"]; x: number; y: number; scale: number; rotate: number }> = ({ id, x, y, scale, rotate }) => {
  if (id === "grok") return <Chip label="Grok" color="#111" x={x} y={y} size={110} scale={scale} />;
  if (id === "deepseek") return <Chip label="DeepSeek" color="#4D6BFE" x={x} y={y} size={96} scale={scale} />;
  return <Logo name={id} size={250} x={x} y={y} scale={scale} rotate={rotate} />;
};

export const Chill: React.FC = () => {
  const t = useT();
  const bob = (k: number) => Math.sin(t * 2.2 + k) * 9;
  const p = pulse(t);
  const chatScale = pop(t, 0.0) * (1 + p * 0.04);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Logo name="chatgpt" size={260} x={LX} y={Y + bob(0)} scale={chatScale} rotate={Math.sin(t * 1.3) * 3} />
      {GUESTS.map((g, i) => {
        const from = i === 0 ? 0.08 : nearestKick(g.from);
        if (t < from || t > g.to + 0.4) return null;
        const inn = pop(t, from);
        const out = 1 - ease(t, g.to - 0.12, g.to + 0.3);
        const s = Math.max(0, inn) * out * (1 + p * 0.05);
        const speakGuest = t >= from + 0.35 && t < from + (g.to - from) * 0.62;
        const speakLeft = g.leftLine && t >= from + (g.to - from) * 0.62 && t < g.to;
        return (
          <React.Fragment key={g.id}>
            <GuestMark id={g.id} x={GX} y={Y + bob(i + 1)} scale={s} rotate={Math.sin(t * 1.7 + i) * 4} />
            {speakGuest && <Caption text={g.guestLine} x={GX} y={Y - 235} size={66} scale={pop(t, from + 0.35)} />}
            {speakLeft && <Caption text={g.leftLine} x={LX} y={Y - 235} size={66} scale={pop(t, from + (g.to - from) * 0.62)} />}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
