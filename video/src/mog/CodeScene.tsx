import React from "react";
import { AbsoluteFill } from "remotion";
import { pulse } from "./beats";
import { INK, ORANGE, Paper, ease, pop, useT } from "./common";
import { franklin, mono } from "./fonts";

const typed = (s: string, t: number, at: number, cps: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - at) * cps))));

const TERM = [
  { at: 20.2, text: '$ claude "fix the flaky checkout test"', color: "#f3eadb", cps: 42 },
  { at: 20.85, text: "● Reading src/checkout.test.ts", color: "#d6c9b0", cps: 60 },
  { at: 21.05, text: "● Found race in retry backoff", color: "#d6c9b0", cps: 60 },
  { at: 21.3, text: "- await sleep(50)", color: "#ff8c7a", cps: 60 },
  { at: 21.45, text: "+ await retry(fetchCart, { jitter: true })", color: "#9be08a", cps: 70 },
  { at: 21.75, text: "✓ 1,284 tests passed", color: "#9be08a", cps: 60 },
];
const CODE: { text: string; c: string }[][] = [
  [{ text: "def", c: ORANGE }, { text: " rank", c: "#1d1a17" }, { text: "(models, bench):", c: "#1d1a17" }],
  [{ text: "    scores = ", c: "#1d1a17" }, { text: "{m: bench.run(m) ", c: "#1d1a17" }, { text: "for", c: ORANGE }, { text: " m ", c: "#1d1a17" }, { text: "in", c: ORANGE }, { text: " models}", c: "#1d1a17" }],
  [{ text: "    ", c: "#1d1a17" }, { text: "return", c: ORANGE }, { text: " sorted(scores, key=scores.get)", c: "#1d1a17" }],
  [{ text: "", c: "#1d1a17" }],
  [{ text: "const", c: ORANGE }, { text: " best = ", c: "#1d1a17" }, { text: "await", c: ORANGE }, { text: " claude.messages.create({", c: "#1d1a17" }],
  [{ text: "  model: ", c: "#1d1a17" }, { text: '"claude-opus-5-5"', c: "#2f7d4f" }, { text: ",", c: "#1d1a17" }],
  [{ text: "  max_tokens: ", c: "#1d1a17" }, { text: "4096", c: "#2f6bb0" }, { text: ",", c: "#1d1a17" }],
  [{ text: "});  ", c: "#1d1a17" }, { text: "// ship it", c: "#8a7d6c" }],
];

const Tape: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 150, height: 44, background: "rgba(232,214,160,0.75)", transform: `rotate(${r}deg)`, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
);

export const CodeScene: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const a = pop(t, 20.17, { damping: 15, stiffness: 120, mass: 0.9 });
  const b = pop(t, 21.41, { damping: 15, stiffness: 120, mass: 0.9 });
  const c = pop(t, 22.71, { damping: 15, stiffness: 120, mass: 0.9 });
  const ship = pop(t, 23.82, { damping: 9, stiffness: 210, mass: 0.7 });
  const shake = t >= 23.82 && t < 24.1 ? Math.exp(-(t - 23.82) * 18) : 0;
  const draw = ease(t, 22.8, 24.0);
  const lineLen = 640;
  return (
    <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 90) * 12 * shake}px, ${Math.cos(t * 80) * 9 * shake}px)` }}>
      <Paper />
      <div style={{ position: "absolute", left: 130, top: 60, fontFamily: franklin, fontWeight: 800, fontSize: 26, letterSpacing: "0.3em", color: ORANGE, opacity: ease(t, 20.17, 20.4) }}>THE ENGINEERING DESK</div>
      {/* A: terminal */}
      <div style={{ position: "absolute", left: 90, top: 130, width: 900, height: 470, background: "#1d1a17", borderRadius: 14, boxShadow: "10px 14px 0 rgba(60,44,28,0.25)", transform: `translateX(${(1 - Math.min(1, a)) * -1100}px) rotate(-2deg) scale(${1 + p * 0.006})`, padding: "26px 30px", fontFamily: mono, fontSize: 27, lineHeight: 1.55 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((col) => (
            <span key={col} style={{ width: 16, height: 16, borderRadius: 8, background: col }} />
          ))}
        </div>
        {TERM.map((l, i) => (
          <div key={i} style={{ color: l.color, whiteSpace: "pre", fontWeight: i === 0 ? 700 : 400 }}>
            {typed(l.text, t, l.at, l.cps)}
          </div>
        ))}
        <span style={{ display: "inline-block", width: 14, height: 28, background: "#f3eadb", opacity: Math.floor(t * 3) % 2 }} />
      </div>
      <Tape x={440} y={112} r={-4} />
      {/* B: editor */}
      <div style={{ position: "absolute", left: 930, top: 300, width: 900, height: 470, background: "#fbf6ea", border: `3px solid ${INK}`, borderRadius: 10, boxShadow: "10px 14px 0 rgba(60,44,28,0.25)", transform: `translateX(${(1 - Math.min(1, b)) * 1100}px) rotate(1.6deg) scale(${1 + p * 0.006})`, padding: "26px 30px", fontFamily: mono, fontSize: 28, lineHeight: 1.6 }}>
        {CODE.map((ln, i) => {
          const at = 21.45 + i * 0.18;
          const chars = Math.max(0, Math.floor((t - at) * 70));
          let used = 0;
          return (
            <div key={i} style={{ whiteSpace: "pre", display: "flex" }}>
              <span style={{ width: 48, color: "#b4a68f" }}>{i + 1}</span>
              {ln.map((seg, j) => {
                const take = Math.max(0, Math.min(seg.text.length, chars - used));
                used += seg.text.length;
                return (
                  <span key={j} style={{ color: seg.c, fontWeight: seg.c === ORANGE ? 700 : 400 }}>
                    {seg.text.slice(0, take)}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      <Tape x={1290} y={282} r={3} />
      {/* C: chart */}
      <div style={{ position: "absolute", left: 130, top: 640, width: 760, height: 380, background: "#fbf6ea", border: `3px solid ${INK}`, borderRadius: 10, boxShadow: "10px 14px 0 rgba(60,44,28,0.25)", transform: `translateY(${(1 - Math.min(1, c)) * 700}px) rotate(-1.2deg)` }}>
        <svg width="760" height="380" viewBox="0 0 760 380">
          <text x="30" y="46" fontFamily={franklin} fontWeight="800" fontSize="24" letterSpacing="3" fill={INK}>TASKS SOLVED OVER TIME</text>
          <path d="M60 80 V320 H710" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M60 290 C170 280 260 295 360 285 S560 270 700 272" fill="none" stroke="#8d8171" strokeWidth="5" strokeLinecap="round" strokeDasharray={lineLen} strokeDashoffset={lineLen * (1 - draw)} />
          <path d="M60 300 C150 270 230 280 330 215 S520 130 700 92" fill="none" stroke={ORANGE} strokeWidth="9" strokeLinecap="round" strokeDasharray={lineLen + 120} strokeDashoffset={(lineLen + 120) * (1 - draw)} />
          <circle cx="700" cy="92" r={12 * draw} fill={ORANGE} stroke={INK} strokeWidth="3" />
          <text x="560" y="70" fontFamily={franklin} fontWeight="800" fontSize="26" fill="#a8442a" opacity={draw}>Claude</text>
          <text x="560" y="264" fontFamily={franklin} fontWeight="600" fontSize="22" fill="#7a6e60" opacity={draw}>the rest</text>
        </svg>
      </div>
      <Tape x={420} y={620} r={-3} />
      <div style={{ position: "absolute", right: 130, top: 810, fontFamily: franklin, fontWeight: 800, fontSize: 120, letterSpacing: "0.04em", color: "#c0361e", border: "8px solid #c0361e", padding: "0 28px", borderRadius: 10, transform: `rotate(-8deg) scale(${Math.max(0, ship)})`, opacity: 0.95 }}>SHIPPED</div>
    </AbsoluteFill>
  );
};
