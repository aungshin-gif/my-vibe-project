import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ChatUi } from "../ChatUi";
import { clamp, Finish } from "../lib";
import { theme } from "../theme";

// Scene 1 (5s = 150f): the 3s Higgsfield clip of the man typing, then a
// close-up of the chat where "Hello, Claude." is sent. Ends in a cyan flash
// that hands over to the dive into the model (Scene 2).
export const CLIP_FRAMES = 90;
const XFADE_FROM = 74;
export const OPEN_FRAMES = 150;

const ClipLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [XFADE_FROM, CLIP_FRAMES], [1, 0], { easing: theme.ease.inOut, ...clamp });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <OffthreadVideo src={staticFile("scene1.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

const ChatLayer: React.FC = () => {
  const frame = useCurrentFrame(); // local to the Sequence below
  const o = interpolate(frame, [0, CLIP_FRAMES - XFADE_FROM], [0, 1], { easing: theme.ease.inOut, ...clamp });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <ChatUi mode="send" />
    </AbsoluteFill>
  );
};

const FlashOut: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [OPEN_FRAMES - 12, OPEN_FRAMES - 1], [0, 0.85], { easing: theme.ease.in, ...clamp });
  return <AbsoluteFill style={{ background: `radial-gradient(circle, #FFFFFF, ${theme.colors.cyan})`, opacity: o }} />;
};

export const Open: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.bg }}>
    <Sequence from={0} durationInFrames={CLIP_FRAMES}>
      <ClipLayer />
    </Sequence>
    <Sequence from={XFADE_FROM} durationInFrames={OPEN_FRAMES - XFADE_FROM}>
      <ChatLayer />
    </Sequence>
    <Finish />
    <FlashOut />
  </AbsoluteFill>
);
