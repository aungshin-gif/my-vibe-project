import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { KICKS, pulse } from "./beats";
import { INK, ORANGE, Paper, ease, pop, useT } from "./common";
import { franklin, playfair, playfairItalic } from "./fonts";

// "ANTHROPIC" built letter by letter on the kicks, the O is the spinning Claude mark.
const LETTERS = ["A", "N", "T", "H", "R", "*", "P", "I", "C"];
const REVEAL = [12.92, 12.92, 13.71, 13.71, 14.153, 14.524, 14.965, 14.965, 15.2];

export const Masthead: React.FC<{ start: number }> = ({ start }) => {
  const t = useT() + start;
  const p = pulse(t);
  const slide = 1 - ease(t, 12.85, 13.05);
  const underline = ease(t, 14.3, 15.0);
  return (
    <AbsoluteFill>
      <Paper />
      <AbsoluteFill style={{ transform: `translateY(${slide * 1080}px)` }}>
        <div style={{ position: "absolute", left: 120, right: 120, top: 120, height: 6, background: INK }} />
        <div style={{ position: "absolute", left: 120, right: 120, top: 134, height: 2, background: INK }} />
        <div style={{ position: "absolute", left: 120, right: 120, top: 150, display: "flex", justifyContent: "space-between", fontFamily: franklin, fontWeight: 700, fontSize: 24, letterSpacing: "0.22em", color: INK }}>
          <span>VOL. V · NO. 5.5</span>
          <span>SAN FRANCISCO · EST. 2021</span>
          <span>THE OPUS EDITION</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: playfair, fontWeight: 900, fontSize: 250, letterSpacing: "-0.01em", color: INK, whiteSpace: "nowrap", lineHeight: 1, transform: `scale(${1 + p * 0.012})` }}>
          {LETTERS.map((c, i) => {
            const k = pop(t, REVEAL[i], { damping: 13, stiffness: 190, mass: 0.7 });
            const common: React.CSSProperties = { display: "inline-block", transform: `translateY(${(1 - Math.min(1.1, k)) * 220}px) rotate(${(1 - Math.min(1, k)) * -12}deg)`, opacity: Math.min(1, k * 2) };
            if (c === "*")
              return (
                <span key={i} style={{ ...common, width: 190, height: 190, verticalAlign: "middle", margin: "0 12px" }}>
                  <Img src={staticFile("mog/claude.png")} style={{ width: 190, height: 190, transform: `rotate(${(t - 14.5) * 90}deg)` }} />
                </span>
              );
            return (
              <span key={i} style={common}>
                {c}
              </span>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: playfairItalic, fontStyle: "italic", fontWeight: 500, fontSize: 64, color: INK, opacity: ease(t, 14.2, 14.5) }}>
          Claude Opus 5.5 &nbsp;·&nbsp; Fable 5.1
          <div style={{ margin: "14px auto 0", height: 5, width: 760 * underline, background: ORANGE }} />
        </div>
        <div style={{ position: "absolute", left: 120, right: 120, bottom: 120, height: 2, background: INK }} />
        <div style={{ position: "absolute", left: 120, right: 120, bottom: 132, height: 6, background: INK }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 168, textAlign: "center", fontFamily: franklin, fontWeight: 600, fontSize: 26, letterSpacing: "0.3em", color: INK, opacity: ease(t, 14.7, 15.0) }}>
          BUILT TO BE HELPFUL, HONEST AND HARMLESS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
