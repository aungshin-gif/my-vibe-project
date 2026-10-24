// 60s cut: a 30s "how the model computes" insert (portal + 6 levels) is
// built into the 30s cut right after the message has been tokenized.
// Frames are design frames (30fps), local to Universe2.
import { T } from "./timeline";

export const INSERT = 900; // 30s added
export const CUT = 236; // old Universe frame where the insert goes
export const BH_FROM = 214; // portal starts growing (overlaps old Tokenize)
export const SUCK_LOCAL = 120; // Tokenize-local frame the tokens start falling
export const LEVELS_FROM = 300;
export const LEVELS_TO = CUT + INSERT; // 1136
export const UNIVERSE2_TOTAL = T.total + INSERT; // 1110

export const STAGES = [
  { id: "embed", name: "Embedding", sub: "each token becomes a point in vector space", from: 300, to: 450 },
  { id: "pos", name: "Position", sub: "word order is written into every vector", from: 450, to: 570 },
  { id: "attn", name: "Self-attention", sub: "tokens look back and gather context", from: 570, to: 740 },
  { id: "ffn", name: "Feed-forward", sub: "each vector is expanded, filtered, compressed", from: 740, to: 870 },
  { id: "stack", name: "Layer stack", sub: "the same block repeats, layer after layer", from: 870, to: 1000 },
  { id: "logits", name: "Output logits", sub: "one score for every word in the vocabulary", from: 1000, to: 1136 },
] as const;

// Illustrative depth shown on screen (not a claim about any real model).
export const LAYERS = 24;
