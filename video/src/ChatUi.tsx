import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./lib";
import { theme } from "./theme";

// Dark chat app used for the opening/ending close-ups, laid out like the
// Claude app: sidebar (nav, recents, profile with plan) + conversation +
// input. Drawn in CSS/SVG so it stays crisp and legible.
const CLAY = "#D97757";
const UI = {
  main: "#1C1B19",
  side: "#262522",
  line: "rgba(255,255,255,0.08)",
  bubble: "#2E2C29",
  dim: "#A9A59D",
  text: "#F1EEE8",
};

const Spark: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
    {Array.from({ length: 10 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: size * 0.1, height: size * 0.44, background: CLAY, borderRadius: size, transformOrigin: "50% 0%", transform: `translateX(-50%) rotate(${36 * i}deg) translateY(${size * 0.06}px)` }} />
    ))}
  </div>
);

// Simple line icons (no emoji; they would ignore the palette).
const Icon: React.FC<{ kind: "plus" | "search" | "box" | "grid" | "chat" }> = ({ kind }) => {
  const s = { stroke: UI.dim, strokeWidth: 2.2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={30} height={30} viewBox="0 0 24 24" style={{ flex: "none" }}>
      {kind === "plus" && <path d="M12 5v14M5 12h14" {...s} />}
      {kind === "search" && (<><circle cx="11" cy="11" r="6.5" {...s} /><path d="M16 16l4.5 4.5" {...s} /></>)}
      {kind === "box" && <path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8" {...s} />}
      {kind === "grid" && <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" {...s} />}
      {kind === "chat" && <path d="M5 6h14v10H10l-4 3v-3H5z" {...s} />}
    </svg>
  );
};

const NAV: { icon: "plus" | "search" | "box" | "grid" | "chat"; label: string }[] = [
  { icon: "plus", label: "New chat" },
  { icon: "search", label: "Search" },
  { icon: "box", label: "Projects" },
  { icon: "grid", label: "Artifacts" },
];
const RECENTS = ["Landing page copy", "Weekly planning", "Bot error debugging"];

const typed = (text: string, frame: number, start: number, perChar: number) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((frame - start) / perChar))));

const Cursor: React.FC<{ frame: number }> = ({ frame }) => (
  <span style={{ display: "inline-block", width: 3, height: "1em", marginLeft: 3, background: CLAY, verticalAlign: "text-bottom", opacity: Math.floor(frame / 8) % 2 ? 0.2 : 1 }} />
);

const Avatar: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flex: "none", border: `2px solid ${theme.colors.cyan}88`, boxShadow: `0 0 24px ${theme.colors.cyan}44` }}>
    <Img src={staticFile("avatar.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
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
  const push = interpolate(frame, [0, 120], [1, 1.035], { easing: theme.ease.inOut, ...clamp });

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", fontFamily: theme.fonts.display, color: UI.text, opacity: enter, transform: `scale(${(1.03 - 0.03 * enter) * push})`, display: "flex" }}>
      {/* sidebar */}
      <div style={{ width: 520, background: UI.side, borderRight: `1px solid ${UI.line}`, display: "flex", flexDirection: "column", padding: "36px 28px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 12px 30px" }}>
          <Spark size={40} />
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.01em" }}>Claude</div>
        </div>
        {NAV.map((n) => (
          <div key={n.label} style={{ display: "flex", alignItems: "center", gap: 20, height: 64, padding: "0 14px", fontSize: 29, fontWeight: 500, color: UI.text, borderRadius: 14 }}>
            <Icon kind={n.icon} />
            {n.label}
          </div>
        ))}
        <div style={{ margin: "34px 14px 12px", fontSize: 22, fontWeight: 600, letterSpacing: "0.06em", color: UI.dim }}>RECENTS</div>
        {RECENTS.map((r, i) => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 18, height: 60, padding: "0 14px", fontSize: 26, fontWeight: 500, color: i === 0 ? UI.text : UI.dim, background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent", borderRadius: 14 }}>
            <Icon kind="chat" />
            {r}
          </div>
        ))}
        {/* profile: photo, name, plan */}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 22, padding: "22px 14px 0", borderTop: `1px solid ${UI.line}` }}>
          <Avatar size={112} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 34, fontWeight: 600 }}>Karinas</div>
            <div style={{ alignSelf: "flex-start", padding: "3px 16px", borderRadius: 999, fontSize: 24, fontWeight: 600, color: CLAY, border: `1.5px solid ${CLAY}`, background: `${CLAY}1F` }}>Pro</div>
          </div>
        </div>
      </div>

      {/* conversation */}
      <div style={{ flex: 1, background: UI.main, display: "flex", flexDirection: "column", padding: "56px 90px 48px" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 40 }}>
          {sent && (
            <div style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 20, opacity: Math.min(1, userP), transform: `translateY(${(1 - Math.min(1, userP)) * 26}px)` }}>
              <div style={{ padding: "22px 34px", borderRadius: 26, fontSize: 44, fontWeight: 500, background: UI.bubble, border: `1px solid ${UI.line}` }}>{msg}</div>
              <Avatar size={64} />
            </div>
          )}
          {mode === "reply" && (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", opacity: Math.min(1, replyP), transform: `translateY(${(1 - Math.min(1, replyP)) * 26}px)` }}>
              <div style={{ marginTop: 6 }}>
                <Spark size={56} />
              </div>
              <div style={{ fontSize: 48, fontWeight: 500, lineHeight: 1.3 }}>
                {replyText}
                {replyText.length < answer.length && <Cursor frame={frame} />}
              </div>
            </div>
          )}
        </div>

        {/* input box */}
        <div style={{ height: 112, borderRadius: 30, display: "flex", alignItems: "center", gap: 22, padding: "0 30px", fontSize: 36, background: UI.bubble, border: `1px solid ${UI.line}`, boxShadow: `0 0 50px ${theme.colors.cyan}22` }}>
          <Icon kind="plus" />
          <span style={{ color: inputText ? UI.text : UI.dim }}>{inputText || "Message Claude"}</span>
          {mode === "send" && frame < sendAt && <Cursor frame={frame} />}
          <div style={{ marginLeft: "auto", width: 62, height: 62, borderRadius: 18, background: CLAY, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${interpolate(frame, [sendAt - 2, sendAt, sendAt + 6], [1, 0.86, 1], clamp)})` }}>
            <div style={{ width: 0, height: 0, borderLeft: "11px solid transparent", borderRight: "11px solid transparent", borderBottom: "20px solid #1A0F0A" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
