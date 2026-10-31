import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { KD, pulse } from "./beats";
import { Confetti, CornerClaude, INK, ORANGE, Ring, Sheet, Sparkles, ease, hit, useT } from "./common";
import { franklin, mono, playfair } from "./fonts";

export const CODE_START = KD[18];
export const CODE_END = KD[30];
const typed = (s: string, t: number, at: number, cps: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - at) * cps))));

const A0 = KD[18]; // terminal  20.15
const B0 = KD[21]; // editor    21.36
const C0 = KD[24]; // chart + tests 22.57
const TERM = [
  { at: A0, text: '$ claude "fix the flaky checkout test"', color: "#f3eadb", cps: 90 },
  { at: A0 + 0.5, text: "● Reading src/checkout.test.ts", color: "#d6c9b0", cps: 110 },
  { at: A0 + 0.7, text: "● Found race in retry backoff", color: "#d6c9b0", cps: 110 },
  { at: A0 + 0.9, text: "- await sleep(50)", color: "#ff8c7a", cps: 120 },
  { at: A0 + 1.0, text: "+ await retry(fetchCart, { jitter: true })", color: "#9be08a", cps: 140 },
  { at: A0 + 1.3, text: "✓ 1,284 tests passed", color: "#9be08a", cps: 110 },
];
const CODE: { text: string; c: string }[][] = [
  [{ text: "def", c: ORANGE }, { text: " rank(models, bench):", c: INK }],
  [{ text: "    scores = {m: bench.run(m) ", c: INK }, { text: "for", c: ORANGE }, { text: " m ", c: INK }, { text: "in", c: ORANGE }, { text: " models}", c: INK }],
  [{ text: "    ", c: INK }, { text: "return", c: ORANGE }, { text: " sorted(scores, key=scores.get)", c: INK }],
  [{ text: "", c: INK }],
  [{ text: "const", c: ORANGE }, { text: " best = ", c: INK }, { text: "await", c: ORANGE }, { text: " claude.messages.create({", c: INK }],
  [{ text: "  model: ", c: INK }, { text: '"claude-opus-5-5"', c: "#2f7d4f" }, { text: ",", c: INK }],
  [{ text: "  max_tokens: ", c: INK }, { text: "4096", c: "#2f6bb0" }, { text: ",", c: INK }],
  [{ text: "});  ", c: INK }, { text: "// ship it", c: "#8a7d6c" }],
];

const Tape: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 150, height: 44, background: "rgba(232,214,160,0.78)", transform: `rotate(${r}deg)`, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
);

const FLOATERS = ["{ }", "=>", "</>", "0x1F", "async", "()", "#!", "[ ]", "&&", "::"];

export const CodeScene: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const a = hit(t, A0, { damping: 13, stiffness: 180, mass: 0.8 });
  const b = hit(t, B0, { damping: 13, stiffness: 180, mass: 0.8 });
  const c = hit(t, C0, { damping: 13, stiffness: 180, mass: 0.8 });
  const shipAt = KD[27];
  const ship = hit(t, shipAt, { damping: 8, stiffness: 320, mass: 0.7 });
  const shake = t >= shipAt - 0.04 && t < shipAt + 0.3 ? Math.exp(-(t - shipAt) * 18) : 0;
  const draw = ease(t, C0 + 0.05, C0 + 0.8);
  const len = 640;
  // marker highlight sweeping over the "model" line of the editor
  const mark = ease(t, B0 + 0.7, B0 + 0.95);
  const tests = Math.min(1284, Math.floor(1284 * ease(t, C0, C0 + 0.8)));
  return (
    <AbsoluteFill style={{ background: "#fff", transform: `translate(${Math.sin(t * 95) * 12 * shake}px, ${Math.cos(t * 80) * 9 * shake}px)` }}>
      {FLOATERS.map((f, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 211 + t * (30 + i * 7)) % 2100 - 120, top: 60 + ((i * 97) % 900), fontFamily: mono, fontWeight: 700, fontSize: 40 + (i % 3) * 14, color: "#ece5d8", transform: `rotate(${Math.sin(t + i) * 8}deg)` }}>{f}</div>
      ))}
      <Sparkles x={960} y={540} t={t} n={8} radius={800} color="#eadfc9" seed={11} />
      <div style={{ position: "absolute", left: 100, top: 50, fontFamily: franklin, fontWeight: 800, fontSize: 26, letterSpacing: "0.3em", color: ORANGE, opacity: ease(t, A0, A0 + 0.2) }}>THE ENGINEERING DESK</div>
      <CornerClaude t={t} />
      {/* A: terminal */}
      <div style={{ position: "absolute", left: 90, top: 130, width: 900, height: 470, background: "#1d1a17", borderRadius: 14, boxShadow: "12px 16px 0 rgba(60,44,28,0.22)", transform: `translateX(${(1 - Math.min(1, a)) * -1200}px) rotate(-2deg) scale(${1 + p * 0.006})`, padding: "26px 30px", fontFamily: mono, fontSize: 27, lineHeight: 1.55 }}>
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
        <span style={{ display: "inline-block", width: 14, height: 28, background: "#f3eadb", opacity: Math.floor(t * 4) % 2 }} />
      </div>
      <Tape x={440} y={112} r={-4} />
      <Ring x={540} y={365} t={t} at={A0} size={260} w={6} />
      {/* B: editor on a sheet of paper */}
      <Sheet x={930} y={300} w={900} h={470} rotate={1.6} scale={Math.max(0, b) * (1 + p * 0.006)}>
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, padding: "26px 30px", fontFamily: mono, fontSize: 28, lineHeight: 1.6, border: `3px solid ${INK}`, borderRadius: 6 }}>
          <div style={{ position: "absolute", left: 66, top: 26 + 1.6 * 28 * 5 + 4, width: 560 * mark, height: 40, background: "rgba(255,196,64,0.55)", borderRadius: 4 }} />
          {CODE.map((ln, i) => {
            const at = B0 + 0.05 + i * 0.07;
            const chars = Math.max(0, Math.floor((t - at) * 150));
            let used = 0;
            return (
              <div key={i} style={{ whiteSpace: "pre", display: "flex", position: "relative" }}>
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
      </Sheet>
      <Tape x={1290} y={282} r={3} />
      <Ring x={1380} y={535} t={t} at={B0} size={300} w={6} />
      {/* C: chart + live test counter */}
      <Sheet x={110} y={650} w={800} h={380} rotate={-1.2} scale={Math.max(0, c)}>
        <div style={{ position: "absolute", inset: 0, border: `3px solid ${INK}`, borderRadius: 6 }}>
          <svg width="800" height="380" viewBox="0 0 800 380">
            <text x="30" y="46" fontFamily={franklin} fontWeight="800" fontSize="24" letterSpacing="3" fill={INK}>TASKS SOLVED OVER TIME</text>
            <path d="M60 80 V320 H740" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            <path d="M60 290 C170 280 260 295 360 285 S580 270 730 272" fill="none" stroke="#8d8171" strokeWidth="5" strokeLinecap="round" strokeDasharray={len + 100} strokeDashoffset={(len + 100) * (1 - draw)} />
            <path d="M60 300 C150 270 230 280 330 215 S540 130 730 92" fill="none" stroke={ORANGE} strokeWidth="9" strokeLinecap="round" strokeDasharray={len + 140} strokeDashoffset={(len + 140) * (1 - draw)} />
            <circle cx="730" cy="92" r={12 * draw} fill={ORANGE} stroke={INK} strokeWidth="3" />
            <text x="590" y="70" fontFamily={franklin} fontWeight="800" fontSize="26" fill="#a8442a" opacity={draw}>Claude</text>
            <text x="600" y="264" fontFamily={franklin} fontWeight="600" fontSize="22" fill="#7a6e60" opacity={draw}>the rest</text>
          </svg>
        </div>
      </Sheet>
      <Tape x={420} y={630} r={-3} />
      <div style={{ position: "absolute", left: 960, top: 800, width: 380, height: 190, background: "#fbf6ea", border: `3px solid ${INK}`, borderRadius: 14, boxShadow: "10px 12px 0 rgba(60,44,28,0.2)", transform: `rotate(1deg) scale(${Math.max(0, hit(t, C0 + 0.2))})`, padding: "16px 24px" }}>
        <div style={{ fontFamily: franklin, fontWeight: 800, fontSize: 20, letterSpacing: "0.2em", color: "#7a6e60" }}>TESTS PASSING</div>
        <div style={{ fontFamily: playfair, fontWeight: 900, fontSize: 84, color: "#2f7d4f", lineHeight: 1.1 }}>{tests.toLocaleString("en-US")}</div>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 20, height: 12, borderRadius: 6, background: "rgba(60,44,28,0.12)" }}>
          <div style={{ width: `${(tests / 1284) * 100}%`, height: "100%", borderRadius: 6, background: "#2f7d4f" }} />
        </div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 830, fontFamily: franklin, fontWeight: 800, fontSize: 96, letterSpacing: "0.04em", color: "#c0361e", border: "8px solid #c0361e", padding: "0 28px", borderRadius: 10, transform: `rotate(-8deg) scale(${Math.max(0, ship)})`, opacity: 0.95 }}>SHIPPED</div>
      <Confetti x={1560} y={880} t={t} at={shipAt} n={50} />
    </AbsoluteFill>
  );
};
