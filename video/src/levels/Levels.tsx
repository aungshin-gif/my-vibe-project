import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Backdrop } from "../LlmUniverse";
import { BgMesh, clamp, Finish } from "../lib";
import { theme } from "../theme";
import { Seq, useF } from "../time";
import { INSERT, LEVELS_FROM, LEVELS_TO, STAGES } from "../timeline2";
import { FrameHud, LevelRail, Title } from "./Hud";
import { Attention, Embedding, FeedForward, LayerStack, Logits, Position } from "./Stages";

const COMPONENTS = { embed: Embedding, pos: Position, attn: Attention, ffn: FeedForward, stack: LayerStack, logits: Logits } as const;

// Quiet blueprint backdrop: mesh glow, fine grid and a slow scan line.
const LevelsBackdrop: React.FC = () => {
  const f = useF();
  const scan = ((f * 5) % 1300) - 110;
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <BgMesh hue={1} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(80,180,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(80,180,255,0.07) 1px, transparent 1px)", backgroundSize: "96px 96px", opacity: 0.8 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: scan, height: 120, background: "linear-gradient(180deg, transparent, rgba(34,225,255,0.07), transparent)" }} />
    </AbsoluteFill>
  );
};

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
      <Fader o={1 - toOld}>
        <LevelsBackdrop />
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
        {STAGES.map((st) => {
          const Comp = COMPONENTS[st.id];
          return (
            <Seq key={st.id} from={st.from - LEVELS_FROM} durationInFrames={st.to - st.from}>
              <Comp dur={st.to - st.from} />
            </Seq>
          );
        })}
        <FrameHud f={f} />
        <LevelRail f={f} />
        <Title f={f} />
        <Finish />
      </Fader>
      <AbsoluteFill style={{ background: `radial-gradient(circle, #FFFFFF, ${theme.colors.cyan})`, opacity: emerge * 0.95 }} />
    </AbsoluteFill>
  );
};
