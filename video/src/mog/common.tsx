import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { anton, poppins } from "./fonts";

export const MOG_FPS = 60;
export const useT = () => useCurrentFrame() / MOG_FPS;
export const ease = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
export const pop = (t: number, at: number, cfg = { damping: 11, stiffness: 170, mass: 0.7 }) => spring({ frame: Math.max(0, (t - at) * MOG_FPS), fps: MOG_FPS, config: cfg });

export const ORANGE = "#D97757";
export const INK = "#1d1a17";
export const PAPER = "#F3EAD7";

// Logo artwork (cut from the reference frames; the Claude mark is the supplied artwork).
export const LOGOS: Record<string, { src: string; ratio: number }> = {
  chatgpt: { src: "mog/chatgpt.png", ratio: 737 / 728 },
  gemini: { src: "mog/gemini.png", ratio: 779 / 767 },
  copilot: { src: "mog/copilot.png", ratio: 763 / 833 },
  perplexity: { src: "mog/perplexity.png", ratio: 816 / 716 },
  claude: { src: "mog/claude.png", ratio: 1 },
};

export const Logo: React.FC<{ name: keyof typeof LOGOS; size: number; x: number; y: number; scale?: number; rotate?: number; opacity?: number }> = ({ name, size, x, y, scale = 1, rotate = 0, opacity = 1 }) => {
  const l = LOGOS[name];
  const h = size;
  const w = size * l.ratio;
  return <Img src={staticFile(l.src)} style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${scale}) rotate(${rotate}deg)`, opacity, objectFit: "contain" }} />;
};

// Brand-colour wordmark chip for products whose artwork is not in the reference.
export const Chip: React.FC<{ label: string; color: string; x: number; y: number; size?: number; scale?: number; opacity?: number }> = ({ label, color, x, y, size = 64, scale = 1, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})`, opacity, fontFamily: poppins, fontWeight: 800, fontSize: size, color, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{label}</div>
);

// Outlined caption: white fill with a black outline, like the reference.
export const Caption: React.FC<{ text: string; x: number; y: number; size?: number; scale?: number; opacity?: number }> = ({ text, x, y, size = 56, scale = 1, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})`, opacity, fontFamily: poppins, fontWeight: 700, fontSize: size, color: "#fff", WebkitTextStroke: `${Math.max(2, size * 0.06)}px #000`, paintOrder: "stroke fill", letterSpacing: "-0.01em", whiteSpace: "nowrap", textAlign: "center" }}>{text}</div>
);

export const Mogged: React.FC<{ x: number; y: number; t: number; at: number; size?: number }> = ({ x, y, t, at, size = 54 }) => {
  if (t < at) return null;
  const k = Math.min(1, (t - at) / 0.18);
  const s = interpolate(k, [0, 1], [2.6, 1], { extrapolateRight: "clamp" });
  const rot = -5 + (1 - k) * 8;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, k * 3), background: "#0b0b0b", padding: `${size * 0.04}px ${size * 0.2}px`, border: "3px solid #fff", boxShadow: "6px 6px 0 #e5251f" }}>
      <span style={{ fontFamily: anton, fontSize: size, letterSpacing: "0.04em", color: "#ff2b2b", WebkitTextStroke: "1.5px #fff", paintOrder: "stroke fill" }}>MOGGED</span>
    </div>
  );
};

// warm paper: base colour, fibres, grain, vignette and a hint of halftone dots
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

// deterministic paper confetti burst from (x, y) starting at `at`
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
