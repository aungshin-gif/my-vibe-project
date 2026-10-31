import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { KD, pulse } from "./beats";
import { Confetti, CornerClaude, ORANGE, Ring, ease, hit, useT } from "./common";
import { franklin, mono, serif } from "./fonts";

// Claude.ai look: soft off-white canvas, sidebar, rounded chat, serif replies, orange accent
const BG = "#FAF9F5";
const SIDE = "#F0EEE6";
const LINE = "#E6E3D8";
const TEXT = "#2B2A27";
const MUTED = "#7B776B";
const INK = TEXT;

export const CODE_START = KD[16]; // = BENCH_END, no gap between the two pages
export const CODE_END = KD[30];
const typed = (s: string, t: number, at: number, cps: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - at) * cps))));

const A0 = KD[16]; // chat
const B0 = KD[19]; // artifact code
const C0 = KD[22]; // chart + tests
const TERM = [
  { at: A0 + 0.45, text: "Reading src/checkout.test.ts", color: MUTED, cps: 110 },
  { at: A0 + 0.7, text: "Found a race in the retry backoff.", color: TEXT, cps: 90 },
  { at: A0 + 1.0, text: "- await sleep(50)", color: "#C0361E", cps: 120 },
  { at: A0 + 1.12, text: "+ await retry(fetchCart, { jitter: true })", color: "#2F7D4F", cps: 140 },
  { at: A0 + 1.4, text: "All 1,284 tests passed", color: "#2F7D4F", cps: 110 },
];
const CODE: { text: string; c: string }[][] = [
  [{ text: "def", c: ORANGE }, { text: " rank(models, bench):", c: INK }],
  [{ text: "    scores = {m: bench.run(m) ", c: INK }, { text: "for", c: ORANGE }, { text: " m ", c: INK }, { text: "in", c: ORANGE }, { text: " models}", c: INK }],
  [{ text: "    ", c: INK }, { text: "return", c: ORANGE }, { text: " sorted(scores, key=scores.get)", c: INK }],
  [{ text: "", c: INK }],
  [{ text: "const", c: ORANGE }, { text: " best = ", c: INK }, { text: "await", c: ORANGE }, { text: " claude.messages.create({", c: INK }],
  [{ text: "  model: ", c: INK }, { text: '"claude-opus-5-5"', c: "#2f7d4f" }, { text: ",", c: INK }],
  [{ text: "  max_tokens: ", c: INK }, { text: "4096", c: "#2f6bb0" }, { text: ",", c: INK }],
  [{ text: "});  ", c: INK }, { text: "// ship it", c: MUTED }],
];



const SIDEITEMS = ["Fix flaky checkout test", "Rank the models", "Benchmark summary", "Ship notes", "Refactor retry logic", "Release checklist"];

export const CodeScene: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const a = Math.min(1, Math.max(0, hit(t, A0, { damping: 14, stiffness: 200, mass: 0.8 })));
  const b = Math.max(0, hit(t, B0, { damping: 13, stiffness: 180, mass: 0.8 }));
  const c = Math.max(0, hit(t, C0, { damping: 13, stiffness: 180, mass: 0.8 }));
  const shipAt = KD[27];
  const ship = hit(t, shipAt, { damping: 8, stiffness: 320, mass: 0.7 });
  const shake = t >= shipAt - 0.04 && t < shipAt + 0.3 ? Math.exp(-(t - shipAt) * 18) : 0;
  const draw = ease(t, C0 + 0.05, C0 + 0.8);
  const len = 640;
  const mark = ease(t, B0 + 0.7, B0 + 0.95);
  const tests = Math.min(1284, Math.floor(1284 * ease(t, C0, C0 + 0.8)));
  const replyAt = A0 + 0.3;
  return (
    <AbsoluteFill style={{ background: BG, transform: `translate(${Math.sin(t * 95) * 12 * shake}px, ${Math.cos(t * 80) * 9 * shake}px)` }}>
      {/* sidebar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 300, background: SIDE, borderRight: `1px solid ${LINE}`, opacity: Math.min(1, a * 2) }}>
        <div style={{ position: "absolute", left: 28, top: 30, fontFamily: serif, fontWeight: 600, fontSize: 38, color: TEXT }}>Claude</div>
        <div style={{ position: "absolute", left: 22, top: 100, width: 256, height: 52, borderRadius: 12, background: "#fff", border: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 12, paddingLeft: 16, fontFamily: franklin, fontWeight: 600, fontSize: 21, color: ORANGE }}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>+</span> New chat
        </div>
        <div style={{ position: "absolute", left: 28, top: 190, fontFamily: franklin, fontWeight: 700, fontSize: 15, letterSpacing: "0.14em", color: MUTED }}>RECENTS</div>
        {SIDEITEMS.map((x, i) => (
          <div key={x} style={{ position: "absolute", left: 14, top: 224 + i * 54, width: 272, height: 44, borderRadius: 10, background: i === 0 ? "#E6E2D6" : "transparent", fontFamily: franklin, fontWeight: i === 0 ? 600 : 400, fontSize: 19, color: TEXT, lineHeight: "44px", paddingLeft: 14, whiteSpace: "nowrap", overflow: "hidden", opacity: ease(t, A0 + 0.1 + i * 0.05, A0 + 0.3 + i * 0.05) }}>{x}</div>
        ))}
        <div style={{ position: "absolute", left: 22, bottom: 24, width: 256, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: ORANGE, color: "#fff", fontFamily: franklin, fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
          <div style={{ fontFamily: franklin, fontSize: 18, color: TEXT }}>Anthropic fan</div>
        </div>
      </div>
      {/* top bar */}
      <div style={{ position: "absolute", left: 300, right: 0, top: 0, height: 92, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", paddingLeft: 40, fontFamily: franklin, fontWeight: 600, fontSize: 22, color: TEXT, opacity: Math.min(1, a * 2) }}>
        Fix flaky checkout test <span style={{ margin: "0 14px", color: MUTED }}>·</span> <span style={{ color: MUTED, fontWeight: 500 }}>Claude Opus 5.5</span>
      </div>
      <CornerClaude t={t} y={46} />
      {/* chat column */}
      <div style={{ position: "absolute", left: 340, top: 128, width: 700, opacity: Math.min(1, a * 2), transform: `translateY(${(1 - a) * 40}px)` }}>
        <div style={{ marginLeft: "auto", width: "fit-content", maxWidth: 560, background: SIDE, borderRadius: 22, padding: "16px 26px", fontFamily: serif, fontSize: 30, color: TEXT }}>
          {typed("Fix the flaky checkout test", t, A0 + 0.05, 60)}
        </div>
        {t >= replyAt && (
          <div style={{ marginTop: 40, display: "flex", gap: 18 }}>
            <Img src={staticFile("mog/claude.png")} style={{ width: 44, height: 44, marginTop: 4, transform: `rotate(${t * 140}deg)` }} />
            <div style={{ fontFamily: serif, fontSize: 31, lineHeight: 1.5, color: TEXT, width: 620 }}>
              {TERM.map((l, i) => {
                const isCode = l.text.startsWith("-") || l.text.startsWith("+");
                return (
                  <div key={i} style={{ color: l.color, whiteSpace: "pre", fontFamily: isCode ? mono : serif, fontSize: isCode ? 25 : 31, background: isCode ? "#F3F1EA" : "transparent", borderRadius: 8, padding: isCode ? "2px 12px" : 0, margin: isCode ? "4px 0" : 0, minHeight: isCode ? 0 : 0, fontWeight: i === TERM.length - 1 ? 600 : 400 }}>
                    {typed(l.text, t, l.at, l.cps)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Ring x={690} y={170} t={t} at={A0} size={220} w={5} />
      {/* tests chip */}
      <div style={{ position: "absolute", left: 400, top: 700, width: 520, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 18, boxShadow: "0 6px 24px rgba(60,50,30,0.08)", padding: "18px 26px", transform: `scale(${Math.max(0, hit(t, C0 + 0.2))})`, transformOrigin: "left top" }}>
        <div style={{ fontFamily: franklin, fontWeight: 700, fontSize: 17, letterSpacing: "0.16em", color: MUTED }}>TESTS PASSING</div>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 76, color: "#2F7D4F", lineHeight: 1.15 }}>{tests.toLocaleString("en-US")}</div>
        <div style={{ height: 10, borderRadius: 5, background: "#ECE9DF", marginTop: 6 }}>
          <div style={{ width: `${(tests / 1284) * 100}%`, height: "100%", borderRadius: 5, background: "#2F7D4F" }} />
        </div>
      </div>
      {/* input box */}
      <div style={{ position: "absolute", left: 340, top: 940, width: 700, height: 90, borderRadius: 26, background: "#fff", border: `1.5px solid ${LINE}`, boxShadow: "0 4px 18px rgba(60,50,30,0.06)", fontFamily: franklin, fontSize: 23, color: MUTED, paddingLeft: 28, lineHeight: "90px", opacity: Math.min(1, a * 2) }}>
        Reply to Claude…
        <div style={{ position: "absolute", right: 18, top: 19, width: 52, height: 52, borderRadius: 14, background: ORANGE, color: "#fff", fontSize: 28, textAlign: "center", lineHeight: "50px" }}>↑</div>
      </div>
      {/* artifact panel: code */}
      <div style={{ position: "absolute", left: 1080, top: 120, width: 800, height: 450, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 20, boxShadow: "0 10px 36px rgba(60,50,30,0.10)", transform: `translateX(${(1 - Math.min(1, b)) * 900}px) scale(${1 + p * 0.004})`, overflow: "hidden" }}>
        <div style={{ height: 56, borderBottom: `1px solid ${LINE}`, background: BG, display: "flex", alignItems: "center", paddingLeft: 24, gap: 14, fontFamily: franklin, fontWeight: 600, fontSize: 19, color: TEXT }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: ORANGE }} /> rank.py <span style={{ color: MUTED, fontWeight: 500 }}>Code</span>
        </div>
        <div style={{ position: "relative", padding: "18px 24px", fontFamily: mono, fontSize: 24, lineHeight: 1.55 }}>
          <div style={{ position: "absolute", left: 66, top: 18 + 1.55 * 24 * 5 + 4, width: 520 * mark, height: 36, background: "rgba(217,119,87,0.20)", borderRadius: 4 }} />
          {CODE.map((ln, i) => {
            const at = B0 + 0.05 + i * 0.07;
            const chars = Math.max(0, Math.floor((t - at) * 150));
            let used = 0;
            return (
              <div key={i} style={{ whiteSpace: "pre", display: "flex", position: "relative" }}>
                <span style={{ width: 44, color: "#BDB8A8" }}>{i + 1}</span>
                {ln.map((seg, j) => {
                  const take = Math.max(0, Math.min(seg.text.length, chars - used));
                  used += seg.text.length;
                  return (
                    <span key={j} style={{ color: seg.c, fontWeight: seg.c === ORANGE ? 700 : 400 }}>{seg.text.slice(0, take)}</span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <Ring x={1480} y={345} t={t} at={B0} size={300} w={5} />
      {/* artifact panel: chart */}
      <div style={{ position: "absolute", left: 1080, top: 600, width: 800, height: 400, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 20, boxShadow: "0 10px 36px rgba(60,50,30,0.10)", transform: `scale(${c})`, transformOrigin: "center top" }}>
        <svg width="800" height="400" viewBox="0 0 800 400">
          <text x="34" y="52" fontFamily={franklin} fontWeight="700" fontSize="21" letterSpacing="3" fill={MUTED}>TASKS SOLVED OVER TIME</text>
          <path d="M60 90 V340 H750" fill="none" stroke="#D9D5C7" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 310 C170 300 260 315 360 305 S580 290 740 292" fill="none" stroke="#B9B3A1" strokeWidth="5" strokeLinecap="round" strokeDasharray={len + 100} strokeDashoffset={(len + 100) * (1 - draw)} />
          <path d="M60 320 C150 290 230 300 330 235 S540 150 740 110" fill="none" stroke={ORANGE} strokeWidth="9" strokeLinecap="round" strokeDasharray={len + 140} strokeDashoffset={(len + 140) * (1 - draw)} />
          <circle cx="740" cy="110" r={12 * draw} fill={ORANGE} />
          <text x="600" y="88" fontFamily={franklin} fontWeight="800" fontSize="26" fill="#A8442A" opacity={draw}>Claude</text>
          <text x="610" y="282" fontFamily={franklin} fontWeight="600" fontSize="22" fill={MUTED} opacity={draw}>the rest</text>
        </svg>
      </div>
      <div style={{ position: "absolute", left: 480, top: 540, fontFamily: franklin, fontWeight: 800, fontSize: 84, letterSpacing: "0.04em", color: "#C0361E", border: "8px solid #C0361E", padding: "0 28px", borderRadius: 10, transform: `rotate(-8deg) scale(${Math.max(0, ship)})`, opacity: 0.95, background: "rgba(250,249,245,0.85)" }}>SHIPPED</div>
      <Confetti x={700} y={600} t={t} at={shipAt} n={50} />
    </AbsoluteFill>
  );
};
