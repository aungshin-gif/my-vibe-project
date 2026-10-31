import { continueRender, delayRender, staticFile } from "remotion";

// Fonts are bundled locally (public/mog/fonts) so rendering never needs the network.
const FILES: [string, number, string, string][] = [  ["Poppins", 600, "normal", "Poppins-600-normal.woff2"],
  ["Poppins", 700, "normal", "Poppins-700-normal.woff2"],
  ["Poppins", 800, "normal", "Poppins-800-normal.woff2"],
  ["Anton", 400, "normal", "Anton-400-normal.woff2"],
  ["Playfair Display", 500, "italic", "PlayfairDisplay-500-italic.woff2"],
  ["Playfair Display", 700, "italic", "PlayfairDisplay-700-italic.woff2"],
  ["Playfair Display", 700, "normal", "PlayfairDisplay-700-normal.woff2"],
  ["Playfair Display", 900, "normal", "PlayfairDisplay-900-normal.woff2"],
  ["Libre Franklin", 500, "normal", "LibreFranklin-500-normal.woff2"],
  ["Libre Franklin", 600, "normal", "LibreFranklin-600-normal.woff2"],
  ["Libre Franklin", 700, "normal", "LibreFranklin-700-normal.woff2"],
  ["Libre Franklin", 800, "normal", "LibreFranklin-800-normal.woff2"],
  ["Source Serif 4", 400, "italic", "SourceSerif4-400-italic.woff2"],
  ["Source Serif 4", 400, "normal", "SourceSerif4-400-normal.woff2"],
];

const handle = delayRender("fonts");
Promise.all(
  FILES.map(([family, weight, style, file]) => new FontFace(family, `url(${staticFile("mog/fonts/" + file)})`, { weight: String(weight), style }).load().then((f) => document.fonts.add(f))),
)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));

export const poppins = "Poppins, sans-serif";
export const anton = "Anton, Impact, sans-serif";
export const playfair = "'Playfair Display', Georgia, serif";
export const playfairItalic = "'Playfair Display', Georgia, serif";
export const franklin = "'Libre Franklin', Inter, sans-serif";
export const mono = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
export const serif = "'Source Serif 4', Georgia, serif";
