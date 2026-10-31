import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { beat } from "./beats";
import { MOG_FPS, useT } from "./common";
import { franklin, mono } from "./fonts";

// Diagnostic: which row flashes exactly on the "dun-dun" you hear?
const GRID = Array.from({ length: 67 }, (_, n) => beat(n));
const BASS = [0.103, 0.403, 0.803, 1.203, 1.603, 2.013, 2.413, 2.823, 3.223, 3.623, 4.023, 4.433, 4.833, 5.243, 5.643, 6.043, 6.453, 6.863, 7.263, 7.663, 8.053, 8.453, 9.273, 9.673, 10.893, 11.393, 11.793, 12.97, 13.071, 13.263, 13.433, 13.547, 13.796, 13.897, 14.239, 14.643, 15.056, 15.286, 15.397, 15.565, 15.81, 15.948, 16.064, 16.169, 16.328, 16.481, 16.669, 17.022, 17.289, 17.456, 17.57, 17.869, 18.273, 18.378, 18.513, 18.624, 18.791, 18.917, 19.019, 19.204, 19.321, 19.555, 19.707, 19.887, 20.001, 20.258];
const ROWS: { label: string; sub: string; hits: number[]; color: string }[] = [
  { label: "A", sub: "steady kick grid", hits: GRID, color: "#D97757" },
  { label: "B", sub: "heavy bass hits (the rolling dun-dun in the drop)", hits: BASS, color: "#2f6bb0" },
  { label: "C", sub: "A but 0.10s LATER", hits: GRID.map((h) => h + 0.1), color: "#2f7d4f" },
  { label: "D", sub: "A but 0.10s EARLIER", hits: GRID.map((h) => h - 0.1), color: "#8a5cf6" },
];

export const TEST_FRAMES = Math.round(27.26 * MOG_FPS);
export const BeatTest: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Audio src={staticFile("mog/song.wav")} />
      <div style={{ position: "absolute", left: 80, top: 50, fontFamily: franklin, fontWeight: 800, fontSize: 44, color: "#1d1a17" }}>BEAT TEST - which row flashes ON the thud?</div>
      <div style={{ position: "absolute", right: 80, top: 56, fontFamily: mono, fontWeight: 700, fontSize: 40, color: "#1d1a17" }}>{t.toFixed(2)}s</div>
      {ROWS.map((r, i) => {
        const on = r.hits.some((h) => t >= h && t < h + 0.09);
        return (
          <div key={r.label} style={{ position: "absolute", left: 80, top: 190 + i * 210, width: 1760, height: 170, display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ width: 150, height: 150, borderRadius: 75, background: on ? r.color : "#eee", border: "6px solid " + r.color, transform: `scale(${on ? 1.08 : 1})` }} />
            <div style={{ fontFamily: franklin, fontWeight: 800, fontSize: 80, color: r.color, width: 90 }}>{r.label}</div>
            <div style={{ fontFamily: franklin, fontWeight: 600, fontSize: 38, color: "#3a332b" }}>{r.sub}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
