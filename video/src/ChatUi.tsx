import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./lib";
import { theme } from "./theme";

// Stylised chat window used for the opening/ending close-ups. Drawn in
// CSS/SVG so it stays crisp and fully legible (AI video garbles UI text).
const CLAY = "#D97757";

const Spark: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    {Array.from({ length: 10 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: size * 0.1, height: size * 0.44, background: CLAY, borderRadius: size, transformOrigin: "50% 0%", transform: `translateX(-50%) rotate(${36 * i}deg) translateY(${size * 0.06}px)` }} />
    ))}
  </div>
);

const typed = (text: string, frame: number, start: number, perChar: number) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((frame - start) / perChar))));

const Cursor: React.FC<{ frame: number }> = ({ frame }) => (
  <span style={{ display: "inline-block", width: 3, height: "1em", marginLeft: 3, background: theme.colors.cyan, verticalAlign: "text-bottom", opacity: Math.floor(frame / 8) % 2 ? 0.2 : 1 }} />
);

export type ChatMode = "send" | "reply";

// send:  "Hello, Claude." is typed into the input box, then sent (Enter).
// reply: the message is already sent; Claude's answer types out.
export const ChatUi: React.FC<{ mode: ChatMode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const msg = "Hello, Claude.";
  const answer = "Hello! How can I help you?";

  const enter = spring({ frame, fps, config: theme.spring.smooth });
  const sendAt = 34; // frame Enter is pressed (send mode)
  const sent = mode === "reply" || frame >= sendAt;
  const inputText = mode === "send" && frame < sendAt ? typed(msg, frame, 6, 2) : "";
  const userP = mode === "reply" ? 1 : spring({ frame: frame - sendAt, fps, config: theme.spring.snappy });
  const replyText = mode === "reply" ? typed(answer, frame, 22, 1.6) : "";
  const replyP = mode === "reply" ? spring({ frame: frame - 14, fps, config: theme.spring.smooth }) : 0;
  const breathe = 1 + Math.sin(frame / 22) * 0.004;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 40%, #0B1230 0%, #04050C 70%)" }}>
      <div style={{ width: 1280, height: 760, borderRadius: 28, background: "linear-gradient(180deg, #14172B, #0D0F1F)", border: `1.5px solid ${theme.colors.cyan}66`, boxShadow: `0 0 80px ${theme.colors.cyan}44, 0 0 200px ${theme.colors.violet}33`, opacity: enter, transform: `scale(${(0.94 + 0.06 * enter) * breathe})`, display: "flex", flexDirection: "column", fontFamily: theme.fonts.display, color: theme.colors.text, overflow: "hidden" }}>
        {/* title bar */}
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 14, padding: "0 28px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <Spark size={30} />
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em" }}>Claude</div>
        </div>

        {/* conversation */}
        <div style={{ flex: 1, padding: "40px 56px", display: "flex", flexDirection: "column", gap: 28 }}>
          {sent && (
            <div style={{ alignSelf: "flex-end", maxWidth: 700, padding: "20px 30px", borderRadius: 22, fontSize: 40, fontWeight: 500, background: `linear-gradient(135deg, ${theme.colors.blue}66, ${theme.colors.violet}55)`, border: `1px solid ${theme.colors.cyan}55`, opacity: Math.min(1, userP), transform: `translateY(${(1 - Math.min(1, userP)) * 26}px)` }}>
              {msg}
            </div>
          )}
          {mode === "reply" && (
            <div style={{ display: "flex", gap: 22, alignItems: "flex-start", opacity: Math.min(1, replyP), transform: `translateY(${(1 - Math.min(1, replyP)) * 26}px)` }}>
              <div style={{ marginTop: 8 }}>
                <Spark size={48} />
              </div>
              <div style={{ fontSize: 44, fontWeight: 500, lineHeight: 1.3, paddingTop: 2 }}>
                {replyText}
                {replyText.length < answer.length && <Cursor frame={frame} />}
              </div>
            </div>
          )}
        </div>

        {/* input box */}
        <div style={{ margin: "0 40px 36px", height: 84, borderRadius: 22, display: "flex", alignItems: "center", padding: "0 30px", fontSize: 34, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <span style={{ color: inputText ? theme.colors.text : theme.colors.textDim }}>{inputText || "Message Claude"}</span>
          {mode === "send" && frame < sendAt && <Cursor frame={frame} />}
          <div style={{ marginLeft: "auto", width: 48, height: 48, borderRadius: 14, background: CLAY, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${interpolate(frame, [sendAt - 2, sendAt, sendAt + 6], [1, 0.86, 1], clamp)})` }}>
            <div style={{ width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: "16px solid #1A0F0A" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
