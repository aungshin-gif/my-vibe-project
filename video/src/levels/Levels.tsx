import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, staticFile } from "remotion";
import { Backdrop } from "../LlmUniverse";
import { clamp, Finish } from "../lib";
import { theme } from "../theme";
import { Seq, useF } from "../time";
import { INSERT, LEVELS_FROM, LEVELS_TO } from "../timeline2";
import { FrameHud, LevelRail, Title } from "./Hud";

const Fader: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;

// Seconds 10-25 of the 45s cut: the message emerges from the black hole and
// the six levels of the computation are shown one after another. The last
// frames dissolve into the original scene backdrop at the matching time.
export const LevelsScene: React.FC = () => {
  const L = useF();
  const f = L + LEVELS_FROM;
  const total = LEVELS_TO - LEVELS_FROM;
  const END_FROM = total - 50; // where the dissolve into the old backdrop starts
  const content = interpolate(L, [total - 20, total - 4], [1, 0], clamp);
  const toOld = interpolate(L, [total - 50, total - 2], [0, 1], { easing: theme.ease.inOut, ...clamp });
  const emerge = interpolate(L, [0, 18], [1, 0], { easing: theme.ease.out, ...clamp });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* one continuous 3D flight (pre-rendered with three.js, see scripts/river) */}
      <Fader o={1 - toOld}>
        <OffthreadVideo src={staticFile("river90.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Fader>
      {/* inner frame = f - INSERT, so this is exactly the old scene's backdrop */}
      <Seq from={END_FROM}>
        <Seq from={-(END_FROM + (LEVELS_FROM - INSERT))}>
          <Fader o={toOld}>
            <Backdrop />
          </Fader>
        </Seq>
      </Seq>
      <Fader o={content}>
        <FrameHud f={f} />
        <LevelRail f={f} />
        <Title f={f} />
        <Finish />
      </Fader>
      <AbsoluteFill style={{ background: `radial-gradient(circle, #FFFFFF, ${theme.colors.cyan})`, opacity: emerge * 0.95 }} />
    </AbsoluteFill>
  );
};
