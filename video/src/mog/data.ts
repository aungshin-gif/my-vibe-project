// LiveBench 2.0 (Abacus AI) leaderboard rows, transcribed from the two screenshots supplied with the request.
export type Row = { name: string; open?: boolean; claude?: boolean; overall: number; agentic: number; design: number; coding: number; browser: number; data: number; research: number; reasoning: number; cost: number };
export const COLUMNS = [
  { key: "overall", label: "OVERALL" },
  { key: "agentic", label: "AGENTIC" },
  { key: "design", label: "DESIGN" },
  { key: "coding", label: "CODING" },
  { key: "browser", label: "BROWSER USE" },
  { key: "data", label: "DATA ANALYSIS" },
  { key: "research", label: "RESEARCH" },
  { key: "reasoning", label: "REASONING" },
] as const;
export const ROWS: Row[] = [
  { name: "Claude Fable 5.1", claude: true, overall: 85.7, agentic: 77.9, design: 83.4, coding: 97.7, browser: 89.8, data: 80.3, research: 82.0, reasoning: 91.7, cost: 7.406 },
  { name: "GPT-6 Astra", overall: 85.6, agentic: 77.5, design: 82.0, coding: 93.7, browser: 91.3, data: 83.0, research: 85.2, reasoning: 92.7, cost: 4.828 },
  { name: "Claude Opus 5.5", claude: true, overall: 85.1, agentic: 72.8, design: 86.9, coding: 96.3, browser: 88.4, data: 80.3, research: 85.0, reasoning: 92.2, cost: 4.82 },
  { name: "GPT-6.1 Sol", overall: 84.1, agentic: 68.7, design: 82.1, coding: 96.0, browser: 93.3, data: 82.7, research: 83.5, reasoning: 92.6, cost: 0.819 },
  { name: "Claude Sonnet 5.5", claude: true, overall: 80.0, agentic: 63.4, design: 85.0, coding: 94.7, browser: 89.3, data: 59.5, research: 83.6, reasoning: 91.6, cost: 4.14 },
  { name: "Gemini 4 Argon", overall: 79.3, agentic: 61.2, design: 73.7, coding: 89.7, browser: 82.8, data: 85.2, research: 83.1, reasoning: 95.1, cost: 1.916 },
  { name: "GPT-6.1 Terra", overall: 77.8, agentic: 48.6, design: 82.3, coding: 94.3, browser: 93.1, data: 82.3, research: 73.9, reasoning: 88.7, cost: 0.665 },
  { name: "Muse Wonder 1.0", overall: 74.2, agentic: 52.6, design: 75.1, coding: 86.2, browser: 60.0, data: 81.6, research: 88.0, reasoning: 90.6, cost: 2.015 },
  { name: "DeepSeek V4.1 Flash 1017", open: true, overall: 72.9, agentic: 35.7, design: 83.4, coding: 96.0, browser: 67.2, data: 79.5, research: 79.5, reasoning: 89.1, cost: 0.185 },
  { name: "Kimi K3.1 Pro", overall: 71.3, agentic: 39.1, design: 77.8, coding: 81.8, browser: 75.9, data: 79.1, research: 77.9, reasoning: 91.1, cost: 1.044 },
  { name: "Grok 4.7", overall: 70.1, agentic: 46.1, design: 78.0, coding: 84.5, browser: 49.3, data: 76.9, research: 86.4, reasoning: 82.7, cost: 2.913 },
  { name: "Claude Haiku 5.5", claude: true, overall: 69.8, agentic: 40.0, design: 83.1, coding: 91.4, browser: 69.5, data: 53.1, research: 81.9, reasoning: 82.4, cost: 0.905 },
  { name: "MiMo V2.6 Pro", open: true, overall: 68.5, agentic: 35.2, design: 78.5, coding: 81.5, browser: 77.3, data: 72.3, research: 76.7, reasoning: 79.6, cost: 0.183 },
  { name: "GPT-5.6 Terra", overall: 67.8, agentic: 33.1, design: 76.0, coding: 86.2, browser: 70.3, data: 79.3, research: 60.4, reasoning: 90.6, cost: 1.916 },
  { name: "Grok 4.6", overall: 67.8, agentic: 28.0, design: 79.8, coding: 89.1, browser: 49.4, data: 75.3, research: 84.5, reasoning: 91.2, cost: 1.422 },
  { name: "MiniMax M3.1 Flash", open: true, overall: 66.9, agentic: 28.8, design: 74.0, coding: 83.9, browser: 80.6, data: 71.4, research: 72.7, reasoning: 82.9, cost: 0.153 },
  { name: "GPT-6 Luna", overall: 64.6, agentic: 30.9, design: 82.5, coding: 84.5, browser: 70.3, data: 73.4, research: 43.5, reasoning: 81.8, cost: 0.124 },
  { name: "Kimi K3", open: true, overall: 64.6, agentic: 26.4, design: 77.2, coding: 59.3, browser: 75.2, data: 78.7, research: 79.0, reasoning: 90.7, cost: 2.089 },
  { name: "Mistral Large 4 1029", open: true, overall: 63.5, agentic: 27.5, design: 76.3, coding: 95.4, browser: 17.4, data: 76.6, research: 79.7, reasoning: 85.2, cost: 0.487 },
];
export const SOURCE = "LiveBench 2.0 · Abacus AI";
export const NOTE = "Overall = weighted mean of the suites with a score (Long Agentic ×2, Design ×1.5, Coding ×1.5, the rest ×1) · shading = top 5 per column · Cost per successful task = (Σ cost ÷ Σ tasks ÷ score) × 100";
