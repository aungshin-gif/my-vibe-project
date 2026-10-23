import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ChatUi } from "../ChatUi";
import { clamp, Finish } from "../lib";
import { theme } from "../theme";

// Scene 6 (3s = 90f): the still of the man, camera slowly pulling back (scale
// 1.14 -> 1.0) while the cyan wash from the model fades away, then a close-up
// of Claude's reply typing out, then a smooth fade to black.
export const CLOSE_FRAMES = 90;
const SWITCH = 36;

const Man: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, SWITCH + 10], [1.14, 1.0], { easing: theme.ease.out, ...clamp });
  const o = interpolate(frame, [SWITCH - 8, SWITCH + 8], [1, 0], { easing: theme.ease.inOut, ...clamp });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img src={staticFile("character.png")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
    </AbsoluteFill>
  );
};

const ChatLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 14], [0, 1], { easing: theme.ease.inOut, ...clamp });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <ChatUi mode="reply" />
    </AbsoluteFill>
  );
};

const Wash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 14], [0.85, 0], { easing: theme.ease.out, ...clamp });
  return <AbsoluteFill style={{ background: `radial-gradient(circle, #FFFFFF, ${theme.colors.cyan})`, opacity: o }} />;
};

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [CLOSE_FRAMES - 18, CLOSE_FRAMES - 1], [0, 1], { easing: theme.ease.inOut, ...clamp });
  return <AbsoluteFill style={{ background: "#000", opacity: o }} />;
};

export const Close: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.bg }}>
    <Sequence from={0} durationInFrames={SWITCH + 10}>
      <Man />
    </Sequence>
    <Sequence from={SWITCH - 8}>
      <ChatLayer />
    </Sequence>
    <Finish />
    <Wash />
    <FadeOut />
  </AbsoluteFill>
);
