import { useState, useEffect, useRef } from "react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Cinzel:wght@400;500;600&display=swap');`;

const css = `
${FONT_IMPORT}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --void: #070510;
  --deep: #0e0b1a;
  --card: rgba(255,255,255,0.035);
  --ember: #e85c20;
  --ember-dim: rgba(232,92,32,0.15);
  --arcane: #9d4edd;
  --arcane-dim: rgba(157,78,221,0.12);
  --gold: #f5b942;
  --gold-bright: #ffd27a;
  --gold-dim: rgba(245,185,66,0.1);
  --blood: #c0392b;
  --ice: #a8edea;
  --ink: #ddd0ff;
  --ink-dim: #8b7faa;
}

html { scroll-behavior: smooth; }

body {
  background: var(--void);
  color: var(--ink);
  font-family: 'Cormorant Garamond', Georgia, serif;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── PARTICLES ── */
.particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.particle {
  position: absolute;
  border-radius: 50%;
  animation: floatUp linear infinite;
  opacity: 0;
}
@keyframes floatUp {
  0%   { opacity: 0; transform: translateY(0) scale(1); }
  10%  { opacity: 1; }
  90%  { opacity: 0.4; }
  100% { opacity: 0; transform: translateY(-100vh) scale(0.5); }
}

/* ── ARCANE BG CIRCLE ── */
.bg-sigil {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 700px);
  height: min(90vw, 700px);
  pointer-events: none;
  opacity: 0.04;
  z-index: 0;
  animation: rotateSigil 120s linear infinite;
}
@keyframes rotateSigil { to { transform: translate(-50%, -50%) rotate(360deg); } }

/* ── LAYOUT ── */
.app {
  position: relative;
  z-index: 1;
  max-width: 780px;
  margin: 0 auto;
  padding: 0 24px 100px;
}

/* ── HEADER ── */
.header {
  text-align: center;
  padding: 80px 0 56px;
  position: relative;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Cinzel', serif;
  font-size: 10px;
  letter-spacing: 0.35em;
  color: var(--arcane);
  text-transform: uppercase;
  background: rgba(157,78,221,0.1);
  border: 1px solid rgba(157,78,221,0.25);
  border-radius: 100px;
  padding: 6px 16px;
  margin-bottom: 36px;
  backdrop-filter: blur(4px);
}
.badge-dot {
  width: 5px; height: 5px;
  background: var(--arcane);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--arcane);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--arcane); }
  50% { opacity: 0.4; box-shadow: 0 0 2px var(--arcane); }
}

.title {
  font-family: 'Cinzel Decorative', serif;
  font-weight: 900;
  font-size: clamp(2.6rem, 7vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, #ff9e4a 0%, #f5b942 25%, #ffd27a 50%, #e06cff 75%, #9d4edd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 40px rgba(157,78,221,0.4));
  margin-bottom: 24px;
}

.subtitle {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 300;
  font-style: italic;
  font-size: 1.25rem;
  color: var(--ink-dim);
  letter-spacing: 0.02em;
  line-height: 1.6;
  margin-bottom: 40px;
}

.ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
  opacity: 0.35;
}
.ornament-line {
  height: 1px;
  width: 100px;
  background: linear-gradient(to right, transparent, var(--arcane));
}
.ornament-line:last-child {
  background: linear-gradient(to left, transparent, var(--arcane));
}
.ornament-diamond {
  width: 7px; height: 7px;
  background: var(--arcane);
  transform: rotate(45deg);
  box-shadow: 0 0 10px var(--arcane);
}

/* ── INPUT SECTION ── */
.input-section {
  margin-bottom: 40px;
}

.input-label {
  font-family: 'Cinzel', serif;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--arcane);
  text-transform: uppercase;
  display: block;
  margin-bottom: 12px;
  opacity: 0.8;
}

.input-outer {
  position: relative;
  margin-bottom: 16px;
}
.input-outer::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: linear-gradient(135deg, var(--ember), var(--arcane), var(--gold));
  border-radius: 8px;
  opacity: 0.4;
  transition: opacity 0.3s;
  z-index: 0;
}
.input-outer:focus-within::before { opacity: 0.9; }

.input-field {
  position: relative;
  z-index: 1;
  width: 100%;
  background: #0e0b1a;
  border: none;
  border-radius: 7px;
  padding: 20px 22px;
  color: var(--ink);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.6;
  resize: none;
  outline: none;
  min-height: 96px;
  transition: background 0.2s;
}
.input-field:focus { background: #13102b; }
.input-field::placeholder { color: var(--ink-dim); opacity: 0.4; font-style: italic; }
.input-field:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-simulate {
  width: 100%;
  background: linear-gradient(135deg, #1a0e2e 0%, #2d1a4a 50%, #1a0e2e 100%);
  border: 1px solid rgba(157,78,221,0.45);
  color: var(--ink);
  font-family: 'Cinzel', serif;
  font-size: 0.82rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 18px 24px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.35s;
  position: relative;
  overflow: hidden;
}
.btn-simulate::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(157,78,221,0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}
.btn-simulate:hover:not(:disabled)::after { opacity: 1; }
.btn-simulate:hover:not(:disabled) {
  border-color: rgba(157,78,221,0.8);
  color: #fff;
  box-shadow: 0 0 30px rgba(157,78,221,0.25), 0 0 60px rgba(157,78,221,0.1);
}
.btn-simulate:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── ERROR ── */
.error-pill {
  background: rgba(192,57,43,0.12);
  border: 1px solid rgba(192,57,43,0.35);
  color: #f88;
  border-radius: 6px;
  padding: 12px 18px;
  font-size: 0.95rem;
  margin-top: 14px;
  line-height: 1.6;
}

/* ── LOADING ── */
.loading {
  text-align: center;
  padding: 80px 0;
}
.orbit-container {
  width: 80px; height: 80px;
  position: relative;
  margin: 0 auto 36px;
}
.orbit-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid transparent;
  animation: spinRing 2s linear infinite;
}
.orbit-ring:nth-child(1) {
  border-top-color: var(--arcane);
  border-right-color: rgba(157,78,221,0.2);
  animation-duration: 1.6s;
}
.orbit-ring:nth-child(2) {
  inset: 10px;
  border-top-color: var(--gold);
  border-left-color: rgba(245,185,66,0.2);
  animation-duration: 2.4s;
  animation-direction: reverse;
}
.orbit-ring:nth-child(3) {
  inset: 22px;
  border-bottom-color: var(--ember);
  border-right-color: rgba(232,92,32,0.2);
  animation-duration: 1.9s;
}
.orbit-core {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 12px; height: 12px;
  background: var(--arcane);
  border-radius: 50%;
  box-shadow: 0 0 20px var(--arcane), 0 0 40px rgba(157,78,221,0.5);
  animation: coreBreath 2s ease-in-out infinite;
}
@keyframes spinRing { to { transform: rotate(360deg); } }
@keyframes coreBreath {
  0%, 100% { box-shadow: 0 0 20px var(--arcane), 0 0 40px rgba(157,78,221,0.5); }
  50% { box-shadow: 0 0 8px var(--arcane), 0 0 16px rgba(157,78,221,0.3); }
}
.loading-phrase {
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  color: var(--arcane);
  margin-bottom: 12px;
  animation: phraseFade 0.4s ease both;
  min-height: 1.4em;
}
@keyframes phraseFade { from { opacity: 0; } to { opacity: 1; } }
.loading-sub {
  font-style: italic;
  color: var(--ink-dim);
  font-size: 1rem;
  opacity: 0.6;
}

/* ── SIMULATION ── */
.simulation {
  animation: fadeUp 0.7s ease both;
}
@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

/* SIM HERO */
.sim-hero {
  text-align: center;
  margin-bottom: 56px;
  position: relative;
}
.sim-hero-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 400px; height: 200px;
  background: radial-gradient(ellipse, rgba(157,78,221,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.sim-eyebrow {
  font-family: 'Cinzel', serif;
  font-size: 9px;
  letter-spacing: 0.4em;
  color: var(--arcane);
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 16px;
}
.sim-name {
  font-family: 'Cinzel Decorative', serif;
  font-weight: 700;
  font-size: clamp(1.8rem, 4.5vw, 3.2rem);
  background: linear-gradient(135deg, #ffd27a, #f5b942, #e06cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.15;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 24px rgba(245,185,66,0.3));
}
.sim-tagline {
  font-style: italic;
  font-weight: 300;
  font-size: 1.2rem;
  color: var(--ink-dim);
  margin-bottom: 36px;
  line-height: 1.6;
}

/* STATS */
.stats-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.stat-card {
  background: var(--card);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 16px 20px;
  min-width: 0;
  flex: 1;
  text-align: center;
  backdrop-filter: blur(4px);
  transition: border-color 0.25s, transform 0.25s;
}
.stat-card:hover {
  border-color: rgba(157,78,221,0.3);
  transform: translateY(-2px);
}
.stat-icon {
  font-size: 1.4rem;
  display: block;
  margin-bottom: 8px;
}
.stat-val {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  color: var(--gold);
  line-height: 1.4;
  margin-bottom: 5px;
}
.stat-key {
  display: block;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-dim);
  opacity: 0.5;
  font-family: 'Cinzel', serif;
}

/* ── ERAS ── */
.eras-heading {
  font-family: 'Cinzel', serif;
  font-size: 10px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--ink-dim);
  opacity: 0.5;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.eras-heading::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, rgba(255,255,255,0.06), transparent);
}

.era-card {
  background: var(--card);
  border: 1px solid rgba(255,255,255,0.05);
  border-left: 3px solid var(--arcane);
  border-radius: 0 8px 8px 0;
  padding: 24px 26px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s, border-color 0.25s;
  animation: fadeUp 0.5s ease both;
  backdrop-filter: blur(4px);
}
.era-card:hover { transform: translateX(4px); }
.era-card.catastrophe { border-left-color: var(--ember); }
.era-card.catastrophe::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, var(--ember-dim), transparent 60%);
  pointer-events: none;
}
.era-card.golden { border-left-color: var(--gold); }
.era-card.golden::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, var(--gold-dim), transparent 60%);
  pointer-events: none;
}
.era-card.founding { border-left-color: var(--ice); }
.era-card.discovery { border-left-color: #34d399; }
.era-card.renaissance { border-left-color: #60a5fa; }
.era-card.end { border-left-color: #6b7280; }

.era-card:nth-child(1) { animation-delay: 0.05s; }
.era-card:nth-child(2) { animation-delay: 0.1s; }
.era-card:nth-child(3) { animation-delay: 0.15s; }
.era-card:nth-child(4) { animation-delay: 0.2s; }
.era-card:nth-child(5) { animation-delay: 0.25s; }
.era-card:nth-child(6) { animation-delay: 0.3s; }
.era-card:nth-child(7) { animation-delay: 0.35s; }
.era-card:nth-child(8) { animation-delay: 0.4s; }

.era-type-badge {
  position: relative;
  z-index: 1;
  display: inline-block;
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 100px;
  margin-bottom: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--ink-dim);
}
.era-card.catastrophe .era-type-badge { color: var(--ember); border-color: rgba(232,92,32,0.3); background: rgba(232,92,32,0.08); }
.era-card.golden .era-type-badge { color: var(--gold); border-color: rgba(245,185,66,0.3); background: rgba(245,185,66,0.08); }
.era-card.founding .era-type-badge { color: var(--ice); border-color: rgba(168,237,234,0.3); background: rgba(168,237,234,0.08); }
.era-card.discovery .era-type-badge { color: #34d399; border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.08); }
.era-card.renaissance .era-type-badge { color: #60a5fa; border-color: rgba(96,165,250,0.3); background: rgba(96,165,250,0.08); }

.era-year {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--ink-dim);
  opacity: 0.5;
  position: absolute;
  top: 24px; right: 24px;
}
.era-title {
  position: relative;
  z-index: 1;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 1.2rem;
  color: var(--ink);
  margin-bottom: 10px;
  letter-spacing: 0.01em;
  line-height: 1.3;
}
.era-body {
  position: relative;
  z-index: 1;
  font-weight: 300;
  font-size: 1.08rem;
  color: var(--ink-dim);
  line-height: 1.8;
}
.era-body em { color: var(--ink); font-style: italic; }

/* ── FATE ── */
.fate-section {
  margin: 48px 0 36px;
  text-align: center;
  position: relative;
}
.fate-backdrop {
  position: absolute;
  inset: -1px;
  background: linear-gradient(135deg, rgba(232,92,32,0.05), rgba(157,78,221,0.05), rgba(245,185,66,0.05));
  border-radius: 12px;
  z-index: 0;
}
.fate-inner {
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 40px 32px;
  backdrop-filter: blur(8px);
}
.fate-crown {
  font-size: 2rem;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 12px rgba(245,185,66,0.5));
}
.fate-label {
  font-family: 'Cinzel', serif;
  font-size: 9px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--gold);
  opacity: 0.6;
  margin-bottom: 18px;
}
.fate-text {
  font-size: 1.25rem;
  font-style: italic;
  font-weight: 300;
  color: var(--ink-dim);
  line-height: 1.75;
  max-width: 500px;
  margin: 0 auto;
}

/* ── RESET ── */
.btn-reset {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;
  background: none;
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--ink-dim);
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 14px 32px;
  cursor: pointer;
  border-radius: 100px;
  transition: all 0.3s;
}
.btn-reset:hover {
  border-color: rgba(157,78,221,0.5);
  color: var(--arcane);
  box-shadow: 0 0 20px rgba(157,78,221,0.1);
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(157,78,221,0.3); border-radius: 4px; }
`;

const PARTICLES_CONFIG = Array.from({ length: 28 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  width: `${2 + Math.random() * 3}px`,
  height: `${2 + Math.random() * 3}px`,
  animationDuration: `${8 + Math.random() * 18}s`,
  animationDelay: `${Math.random() * 12}s`,
  background: i % 3 === 0 ? "rgba(157,78,221,0.6)" : i % 3 === 1 ? "rgba(245,185,66,0.4)" : "rgba(232,92,32,0.4)",
}));

const LOADING_PHRASES = [
  "Consulting the elder gods…",
  "Weaving the threads of fate…",
  "Summoning empires from the void…",
  "Carving history into obsidian…",
  "The stars align above a new world…",
  "Civilizations rise in the dark…",
  "Blood is spilled. Legends are born…",
];

const ERA_ICONS: Record<string, string> = {
  founding: "⚑",
  golden: "✦",
  conflict: "⚔",
  discovery: "◎",
  catastrophe: "☄",
  renaissance: "❧",
  decline: "☽",
  end: "✦",
};

interface Era {
  year: string;
  type: string;
  title: string;
  body: string;
}

interface Simulation {
  name: string;
  tagline: string;
  duration: string;
  population_peak: string;
  territory: string;
  eras: Era[];
  fate: string;
}

const SIGIL_SVG = (
  <svg
    className="bg-sigil"
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="250" cy="250" r="240" stroke="white" strokeWidth="0.5" />
    <circle cx="250" cy="250" r="180" stroke="white" strokeWidth="0.5" />
    <circle cx="250" cy="250" r="120" stroke="white" strokeWidth="0.5" />
    {Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const x1 = 250 + Math.cos(angle) * 120;
      const y1 = 250 + Math.sin(angle) * 120;
      const x2 = 250 + Math.cos(angle) * 240;
      const y2 = 250 + Math.sin(angle) * 240;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.4" />;
    })}
    {Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      const nx = 250 + Math.cos(angle) * 180;
      const ny = 250 + Math.sin(angle) * 180;
      const nx2 = 250 + Math.cos(angle + Math.PI * 2 / 3) * 180;
      const ny2 = 250 + Math.sin(angle + Math.PI * 2 / 3) * 180;
      return <line key={i} x1={nx} y1={ny} x2={nx2} y2={ny2} stroke="white" strokeWidth="0.4" />;
    })}
  </svg>
);

export default function App() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [error, setError] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [phraseKey, setPhraseKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (status === "loading") {
      let i = 0;
      intervalRef.current = setInterval(() => {
        i = (i + 1) % LOADING_PHRASES.length;
        setPhraseIdx(i);
        setPhraseKey((k) => k + 1);
      }, 2400);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

  const simulate = async () => {
    if (!input.trim()) return;
    setStatus("loading");
    setError("");
    setSimulation(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input.trim() }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(b.error || `HTTP ${res.status}`);
      }
      setSimulation(await res.json());
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  const reset = () => { setStatus("idle"); setSimulation(null); setInput(""); setError(""); };

  const renderBody = (text: string) =>
    text.split(/(\*[^*]+\*)/g).map((part, i) =>
      part.startsWith("*") && part.endsWith("*")
        ? <em key={i}>{part.slice(1, -1)}</em>
        : part
    );

  const eraClass = (type: string) =>
    ["catastrophe", "decline"].includes(type) ? "catastrophe"
    : ["golden"].includes(type) ? "golden"
    : type === "founding" ? "founding"
    : type === "discovery" ? "discovery"
    : type === "renaissance" ? "renaissance"
    : type === "end" ? "end"
    : "";

  return (
    <>
      {SIGIL_SVG}
      <div className="particles" aria-hidden>
        {PARTICLES_CONFIG.map((p, i) => (
          <span key={i} className="particle" style={p} />
        ))}
      </div>

      <div className="app">
        <header className="header">
          <div className="badge">
            <span className="badge-dot" />
            The Oracle of Ages
          </div>
          <h1 className="title">Tiny World<br />Simulator</h1>
          <p className="subtitle">Speak one sentence.<br />Watch a thousand years unfold.</p>
          <div className="ornament">
            <div className="ornament-line" />
            <div className="ornament-diamond" />
            <div className="ornament-line" />
          </div>
        </header>

        {status !== "done" && (
          <div className="input-section">
            <label className="input-label" htmlFor="civ-input">Describe your civilization</label>
            <div className="input-outer">
              <textarea
                id="civ-input"
                className="input-field"
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. A society of blind astronomers who navigate entirely by sound…"
                disabled={status === "loading"}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); simulate(); } }}
              />
            </div>
            <button
              className="btn-simulate"
              onClick={simulate}
              disabled={status === "loading" || !input.trim()}
            >
              {status === "loading" ? "Consulting the Oracle…" : "✦  Begin the Simulation  ✦"}
            </button>
            {status === "error" && <div className="error-pill">{error}</div>}
          </div>
        )}

        {status === "loading" && (
          <div className="loading">
            <div className="orbit-container">
              <div className="orbit-ring" />
              <div className="orbit-ring" />
              <div className="orbit-ring" />
              <div className="orbit-core" />
            </div>
            <p className="loading-phrase" key={phraseKey}>{LOADING_PHRASES[phraseIdx]}</p>
            <p className="loading-sub">A thousand years takes but a moment…</p>
          </div>
        )}

        {status === "done" && simulation && (
          <div className="simulation">
            <div className="sim-hero">
              <div className="sim-hero-glow" aria-hidden />
              <p className="sim-eyebrow">✦ &nbsp; Chronicle of Ages &nbsp; ✦</p>
              <h2 className="sim-name">{simulation.name}</h2>
              <p className="sim-tagline">"{simulation.tagline}"</p>
              <div className="stats-row">
                <div className="stat-card">
                  <span className="stat-icon">⏳</span>
                  <span className="stat-val">{simulation.duration}</span>
                  <span className="stat-key">Duration</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">👁</span>
                  <span className="stat-val">{simulation.population_peak}</span>
                  <span className="stat-key">Peak Population</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🗺</span>
                  <span className="stat-val">{simulation.territory}</span>
                  <span className="stat-key">Territory</span>
                </div>
              </div>
            </div>

            <p className="eras-heading">The Chronicle</p>

            <div>
              {(simulation.eras || []).map((era, i) => (
                <div key={i} className={`era-card ${eraClass(era.type)}`}>
                  <span className="era-type-badge">
                    {ERA_ICONS[era.type] || "◈"} &nbsp; {era.type}
                  </span>
                  <p className="era-year">{era.year}</p>
                  <h3 className="era-title">{era.title}</h3>
                  <p className="era-body">{renderBody(era.body)}</p>
                </div>
              ))}
            </div>

            <div className="fate-section">
              <div className="fate-backdrop" aria-hidden />
              <div className="fate-inner">
                <div className="fate-crown">☽</div>
                <p className="fate-label">Final Reckoning</p>
                <p className="fate-text">"{simulation.fate}"</p>
              </div>
            </div>

            <button className="btn-reset" onClick={reset}>
              ↺ &nbsp; Summon Another World
            </button>
          </div>
        )}
      </div>
    </>
  );
}
