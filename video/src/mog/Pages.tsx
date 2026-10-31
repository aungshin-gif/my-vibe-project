import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { KD, pulse } from "./beats";
import { Confetti, CornerClaude, ORANGE, Ring, ease, hit, useT } from "./common";
import { franklin, mono, serif } from "./fonts";
import { ROWS } from "./data";

// Fast back half: seven short pages, each 3-5 kicks long, every cut on a kick of the drop.
export const BG = "#FAF9F5";
const SIDE = "#F0EEE6";
const LINE = "#E6E3D8";
const TEXT = "#2B2A27";
const MUTED = "#7B776B";
const GREEN = "#2F7D4F";
const typed = (s: string, t: number, at: number, cps: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - at) * cps))));
const pop = (t: number, at: number) => Math.max(0, hit(t, at, { damping: 12, stiffness: 240, mass: 0.75 }));

export const PAGE = {
  chat: [KD[10], KD[13]],
  code: [KD[13], KD[16]],
  chart: [KD[16], KD[19]],
  stats: [KD[19], KD[22]],
  term: [KD[22], KD[25]],
  names: [KD[25], KD[30]],
} as const;

const Frame: React.FC<{ t: number; children: React.ReactNode; bg?: string }> = ({ t, children, bg = BG }) => (
  <AbsoluteFill style={{ background: bg }}>
    {children}
    <CornerClaude t={t} />
  </AbsoluteFill>
);

// 1) a Claude.ai chat
export const ChatPage: React.FC = () => {
  const s = PAGE.chat[0];
  const t = useT() + s;
  const a = pop(t, s);
  const lines = [
    { at: s + 0.35, text: "Reading src/checkout.test.ts", color: MUTED },
    { at: s + 0.55, text: "Found a race in the retry backoff.", color: TEXT },
    { at: s + 0.8, text: "- await sleep(50)", color: "#C0361E", code: true },
    { at: s + 0.9, text: "+ await retry(fetchCart, { jitter: true })", color: GREEN, code: true },
    { at: s + 1.15, text: "All 1,284 tests passed", color: GREEN, bold: true },
  ];
  return (
    <Frame t={t}>
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 92, borderBottom: `1px solid ${LINE}`, fontFamily: franklin, fontWeight: 600, fontSize: 24, color: TEXT, lineHeight: "92px", paddingLeft: 60 }}>Claude <span style={{ color: MUTED, fontWeight: 500 }}>· Opus 5.5</span></div>
      <div style={{ position: "absolute", left: 360, top: 160, width: 1200, transform: `translateY(${(1 - Math.min(1, a)) * 60}px)`, opacity: Math.min(1, a * 2) }}>
        <div style={{ marginLeft: "auto", width: "fit-content", background: SIDE, borderRadius: 28, padding: "20px 34px", fontFamily: serif, fontSize: 42, color: TEXT }}>{typed("Fix the flaky checkout test", t, s + 0.05, 70)}</div>
        <div style={{ marginTop: 54, display: "flex", gap: 24 }}>
          <Img src={staticFile("mog/claude.png")} style={{ width: 60, height: 60, marginTop: 6, transform: `rotate(${t * 140}deg)` }} />
          <div style={{ fontFamily: serif, fontSize: 44, lineHeight: 1.55, color: TEXT }}>
            {lines.map((l, i) => (
              <div key={i} style={{ whiteSpace: "pre", color: l.color, fontFamily: l.code ? mono : serif, fontSize: l.code ? 34 : 44, background: l.code ? "#F3F1EA" : "transparent", borderRadius: 10, padding: l.code ? "2px 16px" : 0, margin: l.code ? "6px 0" : 0, width: "fit-content", fontWeight: l.bold ? 600 : 400 }}>{typed(l.text, t, l.at, 120)}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 360, top: 930, width: 1200, height: 100, borderRadius: 30, background: "#fff", border: `1.5px solid ${LINE}`, fontFamily: franklin, fontSize: 26, color: MUTED, paddingLeft: 32, lineHeight: "100px" }}>
        Reply to Claude…<div style={{ position: "absolute", right: 20, top: 22, width: 56, height: 56, borderRadius: 16, background: ORANGE, color: "#fff", fontSize: 30, textAlign: "center", lineHeight: "54px" }}>↑</div>
      </div>
      <Ring x={960} y={180} t={t} at={s} size={300} w={5} />
    </Frame>
  );
};

// 2) the code artifact, big
const CODE: { text: string; c: string }[][] = [
  [{ text: "def", c: ORANGE }, { text: " rank(models, bench):", c: TEXT }],
  [{ text: "    scores = {m: bench.run(m) ", c: TEXT }, { text: "for", c: ORANGE }, { text: " m ", c: TEXT }, { text: "in", c: ORANGE }, { text: " models}", c: TEXT }],
  [{ text: "    ", c: TEXT }, { text: "return", c: ORANGE }, { text: " sorted(scores, key=scores.get)", c: TEXT }],
  [{ text: "", c: TEXT }],
  [{ text: "best = ", c: TEXT }, { text: "await", c: ORANGE }, { text: " claude.messages.create({", c: TEXT }],
  [{ text: "  model: ", c: TEXT }, { text: '"claude-opus-5-5"', c: GREEN }, { text: ",", c: TEXT }],
  [{ text: "  max_tokens: ", c: TEXT }, { text: "4096", c: "#2F6BB0" }, { text: ",", c: TEXT }],
  [{ text: "});  ", c: TEXT }, { text: "// ship it", c: MUTED }],
];
export const CodePage: React.FC = () => {
  const s = PAGE.code[0];
  const t = useT() + s;
  const a = pop(t, s);
  const mark = ease(t, s + 0.5, s + 0.75);
  return (
    <Frame t={t} bg="#F3F1EA">
      <div style={{ position: "absolute", left: 220, top: 150, width: 1480, height: 790, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 28, boxShadow: "0 16px 60px rgba(60,50,30,0.12)", overflow: "hidden", transform: `scale(${0.9 + 0.1 * Math.min(1, a)}) translateY(${(1 - Math.min(1, a)) * 80}px)`, opacity: Math.min(1, a * 2) }}>
        <div style={{ height: 80, borderBottom: `1px solid ${LINE}`, background: BG, display: "flex", alignItems: "center", paddingLeft: 36, gap: 18, fontFamily: franklin, fontWeight: 600, fontSize: 28, color: TEXT }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: ORANGE }} /> rank.py <span style={{ color: MUTED, fontWeight: 500 }}>Code</span>
        </div>
        <div style={{ position: "relative", padding: "34px 40px", fontFamily: mono, fontSize: 46, lineHeight: 1.5 }}>
          <div style={{ position: "absolute", left: 110, top: 34 + 1.5 * 46 * 5 + 4, width: 880 * mark, height: 62, background: "rgba(217,119,87,0.20)", borderRadius: 6 }} />
          {CODE.map((ln, i) => {
            const chars = Math.max(0, Math.floor((t - (s + 0.08 + i * 0.07)) * 170));
            let used = 0;
            return (
              <div key={i} style={{ whiteSpace: "pre", display: "flex", position: "relative" }}>
                <span style={{ width: 70, color: "#BDB8A8" }}>{i + 1}</span>
                {ln.map((seg, j) => {
                  const take = Math.max(0, Math.min(seg.text.length, chars - used));
                  used += seg.text.length;
                  return <span key={j} style={{ color: seg.c, fontWeight: seg.c === ORANGE ? 700 : 400 }}>{seg.text.slice(0, take)}</span>;
                })}
              </div>
            );
          })}
        </div>
      </div>
      <Ring x={960} y={540} t={t} at={s} size={500} w={6} />
    </Frame>
  );
};

// 3) the chart
export const ChartPage: React.FC = () => {
  const s = PAGE.chart[0];
  const t = useT() + s;
  const a = pop(t, s);
  const draw = ease(t, s + 0.1, s + 0.9);
  const len = 1500;
  return (
    <Frame t={t}>
      <div style={{ position: "absolute", left: 160, top: 90, fontFamily: franklin, fontWeight: 700, fontSize: 30, letterSpacing: "0.16em", color: MUTED, opacity: Math.min(1, a * 2) }}>TASKS SOLVED OVER TIME</div>
      <div style={{ position: "absolute", left: 160, top: 150, width: 1600, height: 800, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 28, boxShadow: "0 16px 60px rgba(60,50,30,0.10)", transform: `scale(${0.92 + 0.08 * Math.min(1, a)})` }}>
        <svg width="1600" height="800" viewBox="0 0 1600 800">
          <path d="M120 120 V690 H1500" fill="none" stroke="#D9D5C7" strokeWidth="4" strokeLinecap="round" />
          <path d="M120 640 C380 620 560 650 760 630 S1180 600 1480 604" fill="none" stroke="#B9B3A1" strokeWidth="9" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
          <path d="M120 660 C320 600 480 620 680 500 S1100 280 1480 190" fill="none" stroke={ORANGE} strokeWidth="18" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
          <circle cx="1480" cy="190" r={24 * draw} fill={ORANGE} />
          <text x="1220" y="150" fontFamily={franklin} fontWeight="800" fontSize="54" fill="#A8442A" opacity={draw}>Claude</text>
          <text x="1260" y="580" fontFamily={franklin} fontWeight="600" fontSize="40" fill={MUTED} opacity={draw}>the rest</text>
        </svg>
      </div>
      <Confetti x={1640} y={340} t={t} at={s + 0.9} n={30} />
    </Frame>
  );
};

// 4) three real numbers from the board
export const StatsPage: React.FC = () => {
  const s = PAGE.stats[0];
  const t = useT() + s;
  const p = pulse(t);
  const fable = ROWS[0], opus = ROWS[2];
  const cards = [
    { at: KD[19], big: fable.overall.toFixed(1), label: "OVERALL", who: "Claude Fable 5.1 · #1" },
    { at: KD[20], big: fable.coding.toFixed(1), label: "CODING", who: "Claude Fable 5.1 · #1" },
    { at: KD[21], big: opus.design.toFixed(1), label: "DESIGN", who: "Claude Opus 5.5 · #1" },
  ];
  return (
    <Frame t={t}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: franklin, fontWeight: 800, fontSize: 30, letterSpacing: "0.3em", color: ORANGE }}>LIVEBENCH 2.0 · ABACUS AI</div>
      {cards.map((c, i) => {
        const k = pop(t, c.at);
        return (
          <div key={i} style={{ position: "absolute", left: 90 + i * 600, top: 190, width: 540, height: 700, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 32, boxShadow: "0 16px 50px rgba(60,50,30,0.10)", transform: `scale(${k * (1 + p * 0.01)}) translateY(${(1 - Math.min(1, k)) * 80}px)`, textAlign: "center" }}>
            <div style={{ marginTop: 80, fontFamily: franklin, fontWeight: 700, fontSize: 36, letterSpacing: "0.2em", color: MUTED }}>{c.label}</div>
            <div style={{ marginTop: 40, fontFamily: serif, fontWeight: 600, fontSize: 230, color: TEXT, lineHeight: 1 }}>{c.big}</div>
            <div style={{ margin: "50px auto 0", width: 90, height: 8, borderRadius: 4, background: ORANGE }} />
            <div style={{ marginTop: 40, fontFamily: franklin, fontWeight: 600, fontSize: 34, color: "#A8442A" }}>{c.who}</div>
            <Ring x={270} y={320} t={t} at={c.at} size={300} w={5} />
          </div>
        );
      })}
    </Frame>
  );
};

// 5) Claude Code terminal
export const TermPage: React.FC = () => {
  const s = PAGE.term[0];
  const t = useT() + s;
  const a = pop(t, s);
  const L = [
    { at: s + 0.05, text: '$ claude "ship the fix"', color: "#F3EADB", cps: 80 },
    { at: s + 0.4, text: "● Running 1,284 tests…", color: "#CFC3AC", cps: 100 },
    { at: s + 0.65, text: "✓ all green", color: "#9BE08A", cps: 100 },
    { at: s + 0.85, text: "● git push origin main", color: "#CFC3AC", cps: 100 },
    { at: s + 1.05, text: "✓ deployed to production", color: "#9BE08A", cps: 100 },
  ];
  return (
    <Frame t={t} bg="#F3F1EA">
      <div style={{ position: "absolute", left: 200, top: 170, width: 1520, height: 740, background: "#1F1D1A", borderRadius: 26, boxShadow: "0 24px 70px rgba(40,30,20,0.28)", padding: "40px 54px", fontFamily: mono, fontSize: 46, lineHeight: 1.6, transform: `scale(${0.9 + 0.1 * Math.min(1, a)})`, opacity: Math.min(1, a * 2) }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 26 }}>{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c }} />)}</div>
        {L.map((l, i) => <div key={i} style={{ color: l.color, whiteSpace: "pre" }}>{typed(l.text, t, l.at, l.cps)}</div>)}
      </div>
    </Frame>
  );
};

// 6) the names + SHIPPED, then the outro takes over
export const NamesPage: React.FC = () => {
  const s = PAGE.names[0];
  const t = useT() + s;
  const p = pulse(t);
  const a = pop(t, s);
  const b = pop(t, KD[26]);
  const ship = pop(t, KD[27]);
  const shake = t >= KD[27] - 0.04 && t < KD[27] + 0.3 ? Math.exp(-(t - KD[27]) * 18) : 0;
  return (
    <Frame t={t}>
      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 95) * 12 * shake}px, ${Math.cos(t * 80) * 9 * shake}px)` }}>
        <Img src={staticFile("mog/claude.png")} style={{ position: "absolute", left: 760, top: 110, width: 400, height: 400, transform: `scale(${a}) rotate(${t * 100}deg)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: serif, fontWeight: 600, fontSize: 150, color: TEXT, transform: `scale(${a * (1 + p * 0.012)})` }}>Claude Opus 5.5</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", fontFamily: serif, fontStyle: "italic", fontSize: 110, color: "#A8442A", transform: `scale(${b})` }}>& Fable 5.1</div>
        <div style={{ position: "absolute", right: 140, top: 130, fontFamily: franklin, fontWeight: 800, fontSize: 110, letterSpacing: "0.04em", color: "#C0361E", border: "10px solid #C0361E", padding: "0 30px", borderRadius: 12, transform: `rotate(-8deg) scale(${ship})`, background: "rgba(250,249,245,0.9)" }}>SHIPPED</div>
        <Confetti x={1500} y={260} t={t} at={KD[27]} n={60} />
      </AbsoluteFill>
    </Frame>
  );
};
