import React, { useMemo } from "react";
import { rng } from "./lib";
import { layerColor, theme } from "./theme";

const LAYERS = 16;
const SPACING = 300;
const COLS = 8;
const ROWS = 5;
const FOCAL = 900;

type Node = { x: number; y: number };

// One fixed network, projected through a moving camera. Layers are planes of
// nodes; each node links to 3 nodes in the next plane (the "weights").
const buildNetwork = (): Node[][] => {
  const r = rng(7);
  return Array.from({ length: LAYERS }, () =>
    Array.from({ length: COLS * ROWS }, (_, i) => ({
      x: ((i % COLS) / (COLS - 1) - 0.5) * 2200 + (r() - 0.5) * 140,
      y: (Math.floor(i / COLS) / (ROWS - 1) - 0.5) * 1300 + (r() - 0.5) * 140,
    }))
  );
};

export const NeuralField: React.FC<{
  camZ: number; // camera depth, units
  waveZ?: number; // depth of the activation wave (bright band)
  brightness?: number; // 0..1 overall
  roll?: number; // slight camera roll, degrees
  pulse?: number; // 0..1 beat pulse
}> = ({ camZ, waveZ = -9999, brightness = 1, roll = 0, pulse = 0 }) => {
  const net = useMemo(buildNetwork, []);
  const { w, h } = theme.size;
  const cx = w / 2;
  const cy = h / 2;

  const project = (n: Node, z: number) => {
    const d = z - camZ;
    const s = FOCAL / d;
    return { x: cx + n.x * s, y: cy + n.y * s, s, d };
  };

  const lines: React.ReactNode[] = [];
  const dots: React.ReactNode[] = [];

  for (let l = 0; l < LAYERS; l++) {
    const z = l * SPACING + 400;
    const d = z - camZ;
    if (d < 120 || d > 4200) continue;
    const t = l / (LAYERS - 1);
    const col = layerColor(t);
    const fog = Math.min(1, Math.max(0, 1 - (d - 800) / 3400)) * Math.min(1, (d - 120) / 260);
    const wave = Math.exp(-(((z - waveZ) / 380) ** 2));
    const nextZ = z + SPACING;

    for (let i = 0; i < net[l].length; i++) {
      const a = project(net[l][i], z);
      const lit = Math.min(1, wave + pulse * 0.25);
      dots.push(
        <circle key={`d${l}-${i}`} cx={a.x} cy={a.y} r={Math.max(1.2, 6 * a.s * (1 + lit * 0.8))} fill={col} opacity={(0.35 + lit * 0.65) * fog * brightness} />
      );
      if (l < LAYERS - 1) {
        for (const off of [0, 1, COLS]) {
          const j = (i + off) % net[l + 1].length;
          const b = project(net[l + 1][j], nextZ);
          const lw = Math.exp(-(((z + SPACING / 2 - waveZ) / 380) ** 2));
          lines.push(
            <line key={`l${l}-${i}-${off}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={Math.max(0.5, 1.6 * a.s) * (1 + lw * 1.6)} opacity={(0.1 + lw * 0.7) * fog * brightness} />
          );
        }
      }
    }
  }

  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, transform: `rotate(${roll}deg)`, filter: "drop-shadow(0 0 6px rgba(80,160,255,0.55))" }}>
      {lines}
      {dots}
    </svg>
  );
};

export const LAYER_DEPTH = { spacing: SPACING, first: 400, last: (LAYERS - 1) * SPACING + 400 };
