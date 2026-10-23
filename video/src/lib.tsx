import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "./theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Deterministic PRNG so every frame renders the same network.
export const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

export const BgMesh: React.FC<{ hue?: number }> = ({ hue = 0 }) => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 55) * 60;
  const d2 = Math.cos(frame / 70) * 50;
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <div style={{ position: "absolute", width: 1400, height: 1400, borderRadius: "50%", top: -600, left: -300 + d1, filter: "blur(70px)", background: `radial-gradient(circle, ${theme.colors.violet}${hue ? "55" : "44"}, transparent 62%)` }} />
      <div style={{ position: "absolute", width: 1200, height: 1200, borderRadius: "50%", bottom: -560, right: -300 - d2, filter: "blur(80px)", background: `radial-gradient(circle, ${theme.colors.cyan}30, transparent 65%)` }} />
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", top: 200, right: 300 + d1, filter: "blur(90px)", background: `radial-gradient(circle, ${theme.colors.magenta}22, transparent 65%)` }} />
    </AbsoluteFill>
  );
};

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.blue, mixBlendMode: "soft-light", opacity: 0.2 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.18), transparent 26%, transparent 74%, rgba(0,0,0,0.28))" }} />
  </AbsoluteFill>
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", backgroundImage: noise, backgroundSize: "220px", backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`, opacity: 0.07, mixBlendMode: "overlay" }} />
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.5) 100%)" }} />
);

// Wrapper that adds grade + grain + vignette on top of a scene.
export const Finish: React.FC = () => (
  <>
    <Grade />
    <Grain />
    <Vignette />
  </>
);

export const fadeInOut = (frame: number, dur: number, inF = 10, outF = 10) =>
  interpolate(frame, [0, inF, dur - outF, dur], [0, 1, 1, 0], clamp);
