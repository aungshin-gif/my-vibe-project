import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { anton, franklin, poppins } from "./fonts";

export const MOG_FPS = 60;
export const useT = () => useCurrentFrame() / MOG_FPS;
export const ease = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

// Animations are started a little BEFORE the beat so that their visible impact lands on it.
export const LEAD = 0.06;
const SNAP = { damping: 13, stiffness: 300, mass: 0.6 };
export const hit = (t: number, at: number, cfg = SNAP): number => spring({ frame: Math.max(0, (t - at + LEAD) * MOG_FPS), fps: MOG_FPS, config: cfg });

export const ORANGE = "#D97757";
export const INK = "#1d1a17";
export const PAPER = "#F3EAD7";

export const LOGOS = {
  chatgpt: { src: "mog/chatgpt.png", ratio: 737 / 728 },
  gemini: { src: "mog/gemini.png", ratio: 779 / 767 },
  copilot: { src: "mog/copilot.png", ratio: 763 / 833 },
  perplexity: { src: "mog/perplexity.png", ratio: 816 / 716 },
  claude: { src: "mog/claude.png", ratio: 1 },
  grok: { src: "mog/grok.svg", ratio: 1 },
  deepseek: { src: "mog/deepseek.svg", ratio: 1 },
} as const;
export type LogoName = keyof typeof LOGOS;

export const Logo: React.FC<{ name: LogoName; size: number; x: number; y: number; scale?: number; scaleY?: number; rotate?: number; opacity?: number }> = ({ name, size, x, y, scale = 1, scaleY, rotate = 0, opacity = 1 }) => {
  const l = LOGOS[name];
  const w = size * l.ratio;
  return <Img src={staticFile(l.src)} style={{ position: "absolute", left: x - w / 2, top: y - size / 2, width: w, height: size, transform: `scale(${scale}, ${scaleY ?? scale}) rotate(${rotate}deg)`, opacity, objectFit: "contain" }} />;
};

// Outlined caption: white fill with a black outline, like the reference.
export const Caption: React.FC<{ text: string; x: number; y: number; size?: number; scale?: number; opacity?: number; rotate?: number }> = ({ text, x, y, size = 56, scale = 1, opacity = 1, rotate = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`, opacity, fontFamily: poppins, fontWeight: 700, fontSize: size, color: "#fff", WebkitTextStroke: `${Math.max(3, size * 0.07)}px #000`, paintOrder: "stroke fill", letterSpacing: "-0.01em", whiteSpace: "nowrap", textAlign: "center" }}>{text}</div>
);

// Caption whose words land one by one on half-beats (natural word spacing, hidden words keep their place).
export const WordCaption: React.FC<{ text: string; x: number; y: number; t: number; at: number; size?: number; gap?: number; until?: number }> = ({ text, x, y, t, at, size = 64, gap = 0.2015, until = 1e9 }) => {
  if (t < at - 0.1 || t > until) return null;
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", display: "flex", gap: size * 0.3, whiteSpace: "nowrap" }}>
      {words.map((w, i) => {
        const k = hit(t, at + i * gap);
        const kk = Math.min(1.15, k);
        return (
          <span key={i} style={{ display: "inline-block", fontFamily: poppins, fontWeight: 700, fontSize: size, color: "#fff", WebkitTextStroke: `${Math.max(3, size * 0.07)}px #000`, paintOrder: "stroke fill", letterSpacing: "-0.01em", transform: `translateY(${(1 - Math.min(1, kk)) * -26}px) rotate(${(1 - Math.min(1, kk)) * -7}deg) scale(${Math.max(0, kk)})`, opacity: t >= at + i * gap - 0.08 ? 1 : 0 }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Mogged: React.FC<{ x: number; y: number; t: number; at: number; size?: number }> = ({ x, y, t, at, size = 54 }) => {
  if (t < at - LEAD) return null;
  const k = Math.min(1, Math.max(0, (t - at + LEAD) / 0.16));
  const s = interpolate(k, [0, 1], [2.8, 1]);
  const rot = -5 + (1 - k) * 9;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, k * 4), background: "#0b0b0b", padding: `${size * 0.04}px ${size * 0.2}px`, border: "3px solid #fff", boxShadow: "6px 6px 0 #e5251f" }}>
      <span style={{ fontFamily: anton, fontSize: size, letterSpacing: "0.04em", color: "#ff2b2b", WebkitTextStroke: "1.5px #fff", paintOrder: "stroke fill" }}>MOGGED</span>
    </div>
  );
};

// expanding shock ring, fired on a beat
export const Ring: React.FC<{ x: number; y: number; t: number; at: number; size?: number; color?: string; w?: number; life?: number }> = ({ x, y, t, at, size = 300, color = "#000", w = 5, life = 0.7 }) => {
  const dt = t - at;
  if (dt < 0 || dt > life) return null;
  const k = dt / life;
  const r = size * (0.55 + 1.1 * (1 - Math.pow(1 - k, 3)));
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${w * (1 - k) + 1}px solid ${color}`, opacity: 1 - k }} />;
};

// small floating plus / star sparkles
export const Sparkles: React.FC<{ x: number; y: number; t: number; n?: number; color?: string; radius?: number; seed?: number }> = ({ x, y, t, n = 6, color = "#bdb5a6", radius = 190, seed = 0 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const a = ((i * 137.5 + seed * 40) % 360) * (Math.PI / 180) + t * (0.5 + (i % 3) * 0.15);
      const r = radius * (0.75 + 0.35 * Math.sin(t * 1.3 + i * 2));
      const s = 14 + (i % 3) * 7;
      return (
        <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * r - s, top: y + Math.sin(a) * r * 0.8 - s, width: s * 2, height: s * 2, transform: `rotate(${t * 80 + i * 40}deg) scale(${0.7 + 0.3 * Math.sin(t * 4 + i)})` }}>
          <div style={{ position: "absolute", left: s - 2, top: 0, width: 4, height: s * 2, background: color, borderRadius: 2 }} />
          <div style={{ position: "absolute", top: s - 2, left: 0, height: 4, width: s * 2, background: color, borderRadius: 2 }} />
        </div>
      );
    })}
  </>
);

// radial sun-burst rays
export const Burst: React.FC<{ x: number; y: number; t: number; at: number; color?: string; life?: number }> = ({ x, y, t, at, color = "#D97757", life = 0.9 }) => {
  const dt = t - at;
  if (dt < 0 || dt > life) return null;
  const k = dt / life;
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, width: 12, height: 360 * (1 - k * 0.3), background: color, opacity: (1 - k) * 0.9, borderRadius: 6, transformOrigin: "50% 0%", transform: `translate(-50%, ${60 + 320 * k}px) rotate(${i * 22.5 + 180}deg) translateY(${-(60 + 320 * k)}px)` }} />
      ))}
    </>
  );
};

export const Confetti: React.FC<{ x: number; y: number; t: number; at: number; n?: number }> = ({ x, y, t, at, n = 46 }) => {
  if (t < at || t > at + 2.2) return null;
  const dt = t - at;
  const cols = [ORANGE, "#1d1a17", "#e8c26a", "#c0361e", "#f7efe0"];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = ((i * 137.5) % 360) * (Math.PI / 180);
        const sp = 380 + ((i * 53) % 420);
        const px = x + Math.cos(a) * sp * dt * (1 - dt * 0.25);
        const py = y + Math.sin(a) * sp * dt * (1 - dt * 0.25) + 520 * dt * dt;
        const rot = (i * 47 + dt * (300 + (i % 5) * 120)) % 360;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: 14 + (i % 4) * 5, height: 8 + (i % 3) * 4, background: cols[i % cols.length], transform: `rotate(${rot}deg)`, opacity: 1 - ease(dt, 1.4, 2.2) }} />;
      })}
    </>
  );
};

// scrolling ticker band
export const Ticker: React.FC<{ items: string[]; y: number; t: number; speed?: number; bg?: string; fg?: string; size?: number }> = ({ items, y, t, speed = 160, bg = "#1d1a17", fg = "#F3EAD7", size = 30 }) => {
  const text = items.join("   ✦   ") + "   ✦   ";
  const w = text.length * size * 0.62;
  const off = (t * speed) % w;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: size * 1.9, background: bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -off, top: size * 0.4, whiteSpace: "nowrap", fontFamily: franklin, fontWeight: 800, fontSize: size, letterSpacing: "0.12em", color: fg }}>{text + text + text}</div>
    </div>
  );
};

// warm paper: base colour, fibres, grain, vignette
export const Paper: React.FC<{ tint?: string }> = ({ tint = PAPER }) => {
  const f = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.27 0 0 0 0 0.17 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`;
  const fibre = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012 0.5' numOctaves='2' seed='9'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.4 0 0 0 0 0.28 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='600' height='600' filter='url(%23f)'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill style={{ background: tint }}>
      <AbsoluteFill style={{ backgroundImage: fibre, backgroundSize: "600px", opacity: 0.55, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ backgroundImage: noise, backgroundSize: "300px", backgroundPosition: `${(f * 3) % 300}px ${(f * 5) % 300}px`, opacity: 0.22, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(120,84,40,0.32) 100%)" }} />
    </AbsoluteFill>
  );
};

// a sheet of warm paper lying on a white background
export const Sheet: React.FC<{ x: number; y: number; w: number; h: number; rotate?: number; scale?: number; children?: React.ReactNode }> = ({ x, y, w, h, rotate = 0, scale = 1, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rotate}deg) scale(${scale})`, boxShadow: "0 24px 60px rgba(60,44,28,0.28), 0 2px 0 rgba(60,44,28,0.18)", borderRadius: 6, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, transform: `translate(${-x}px, ${-y}px)` }} />
    <div style={{ position: "absolute", inset: 0, width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <PaperFill />
      </div>
      {children}
    </div>
  </div>
);
const PaperFill: React.FC = () => {
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.27 0 0 0 0 0.17 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: PAPER }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: noise, backgroundSize: "300px", opacity: 0.2, mixBlendMode: "multiply" }} />
    </>
  );
};
