import { useState, useEffect, useRef } from "react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');`;

const css = `
${FONT_IMPORT}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --parchment: #0f0c08;
  --parchment-mid: #1a1410;
  --ink: #e8dcc8;
  --ink-dim: #a89880;
  --gold: #c9a84c;
  --gold-bright: #f0c060;
  --blood: #8b1a1a;
  --crimson: #c0392b;
  --glow: rgba(201,168,76,0.12);
  --border: rgba(201,168,76,0.25);
  --border-bright: rgba(201,168,76,0.5);
}

body {
  background: var(--parchment);
  color: var(--ink);
  font-family: 'EB Garamond', serif;
  min-height: 100vh;
  overflow-x: hidden;
}

.grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.6;
  z-index: 1000;
}

.vignette {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%);
  z-index: 999;
}

.app {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px 80px;
  position: relative;
  z-index: 1;
}

/* ── HEADER ── */
.header {
  text-align: center;
  padding: 72px 0 48px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 48px;
}

.eyebrow {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--gold);
  text-transform: uppercase;
  margin-bottom: 24px;
  opacity: 0.8;
}

.title {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(2.2rem, 6vw, 3.8rem);
  font-weight: 900;
  color: var(--gold-bright);
  line-height: 1.1;
  margin-bottom: 20px;
  text-shadow: 0 0 60px rgba(240,192,96,0.3), 0 2px 4px rgba(0,0,0,0.8);
}

.subtitle {
  font-family: 'EB Garamond', serif;
  font-style: italic;
  color: var(--ink-dim);
  font-size: 1.15rem;
  line-height: 1.6;
  margin-bottom: 32px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0.5;
  margin-top: 32px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--gold), transparent);
}
.divider-glyph {
  color: var(--gold);
  font-size: 14px;
  font-family: 'Cinzel', serif;
}

/* ── INPUT ── */
.input-section { margin-bottom: 40px; }

.input-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--gold);
  text-transform: uppercase;
  margin-bottom: 14px;
  opacity: 0.9;
}

.input-wrapper {
  position: relative;
  padding: 2px;
  background: linear-gradient(135deg, var(--gold) 0%, transparent 50%, var(--gold) 100%);
  border-radius: 4px;
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  background: var(--parchment-mid);
  border: none;
  border-radius: 3px;
  padding: 18px 20px;
  color: var(--ink);
  font-family: 'EB Garamond', serif;
  font-size: 1.1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 90px;
  outline: none;
  transition: background 0.2s;
}
.input-field:focus { background: #211c14; }
.input-field::placeholder { color: var(--ink-dim); opacity: 0.5; font-style: italic; }
.input-field:disabled { opacity: 0.5; cursor: not-allowed; }

.simulate-btn {
  width: 100%;
  background: linear-gradient(135deg, #2a2010 0%, #3d3018 50%, #2a2010 100%);
  border: 1px solid var(--border-bright);
  color: var(--gold-bright);
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  padding: 16px 24px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.simulate-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(201,168,76,0.08) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}
.simulate-btn:hover:not(:disabled)::before { opacity: 1; }
.simulate-btn:hover:not(:disabled) {
  border-color: var(--gold-bright);
  box-shadow: 0 0 20px rgba(201,168,76,0.2), inset 0 0 20px rgba(201,168,76,0.05);
}
.simulate-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── LOADING ── */
.loading {
  text-align: center;
  padding: 64px 0;
}
.loading-orb {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid var(--border);
  border-top-color: var(--gold);
  animation: spin 1.4s linear infinite;
  margin: 0 auto 28px;
  box-shadow: 0 0 30px rgba(201,168,76,0.3);
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text {
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  color: var(--gold);
  letter-spacing: 0.1em;
  margin-bottom: 10px;
  min-height: 1.4em;
  transition: opacity 0.3s;
}
.loading-flavor {
  font-style: italic;
  color: var(--ink-dim);
  font-size: 0.95rem;
}

/* ── ERROR ── */
.error-box {
  background: rgba(139,26,26,0.15);
  border: 1px solid rgba(192,57,43,0.4);
  color: #e88;
  padding: 14px 18px;
  border-radius: 3px;
  font-size: 0.9rem;
  margin-top: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* ── SIMULATION ── */
.simulation { animation: fadeIn 0.6s ease both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.sim-header {
  text-align: center;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(201,168,76,0.05) 0%, transparent 100%);
  border-radius: 4px;
  padding: 40px 32px;
  margin-bottom: 48px;
  position: relative;
}
.sim-header::before {
  content: '';
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 1px;
  background: linear-gradient(to right, transparent, var(--gold-bright), transparent);
}

.sim-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  font-weight: 700;
  color: var(--gold-bright);
  text-shadow: 0 0 40px rgba(240,192,96,0.4);
  margin-bottom: 14px;
  line-height: 1.2;
}
.sim-tagline {
  font-style: italic;
  color: var(--ink-dim);
  font-size: 1.1rem;
  margin-bottom: 28px;
}

.sim-stats {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 28px;
}
.stat {
  background: rgba(201,168,76,0.06);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 14px 20px;
  text-align: center;
  min-width: 140px;
  flex: 1;
}
.stat-value {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  color: var(--gold);
  margin-bottom: 5px;
  line-height: 1.4;
}
.stat-label {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-dim);
  opacity: 0.6;
  font-family: 'Cinzel', serif;
}

/* ── TIMELINE ── */
.timeline {
  position: relative;
  padding-left: 28px;
  margin-bottom: 48px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 0; top: 8px; bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, var(--gold), transparent);
  opacity: 0.3;
}

.era {
  position: relative;
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease both;
}
.era:nth-child(1) { animation-delay: 0.05s; }
.era:nth-child(2) { animation-delay: 0.1s; }
.era:nth-child(3) { animation-delay: 0.15s; }
.era:nth-child(4) { animation-delay: 0.2s; }
.era:nth-child(5) { animation-delay: 0.25s; }
.era:nth-child(6) { animation-delay: 0.3s; }
.era:nth-child(7) { animation-delay: 0.35s; }
.era:nth-child(8) { animation-delay: 0.4s; }

.era-dot {
  position: absolute;
  left: -32px;
  top: 6px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--gold);
  border: 1px solid var(--gold-bright);
  box-shadow: 0 0 8px rgba(201,168,76,0.5);
}
.era-dot.catastrophe {
  background: var(--crimson);
  border-color: #e05040;
  box-shadow: 0 0 8px rgba(192,57,43,0.6);
}
.era-dot.golden {
  background: var(--gold-bright);
  box-shadow: 0 0 12px rgba(240,192,96,0.7);
}

.era-year {
  font-family: 'Cinzel', serif;
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  color: var(--gold);
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 6px;
}
.era-title {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 10px;
  letter-spacing: 0.02em;
}
.era-title.catastrophe { color: #e07060; }
.era-title.golden { color: var(--gold-bright); }

.era-body {
  color: var(--ink-dim);
  font-size: 1.05rem;
  line-height: 1.75;
}
.era-body em {
  color: var(--ink);
  font-style: italic;
}

/* ── FATE ── */
.fate-banner {
  text-align: center;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(139,26,26,0.08) 0%, rgba(201,168,76,0.04) 100%);
  border-radius: 4px;
  padding: 32px;
  margin-bottom: 36px;
  position: relative;
}
.fate-banner::before, .fate-banner::after {
  content: '⸻';
  display: block;
  color: var(--gold);
  opacity: 0.4;
  font-size: 1.2rem;
  margin-bottom: 14px;
}
.fate-banner::after { margin-top: 14px; margin-bottom: 0; }
.fate-label {
  font-family: 'Cinzel', serif;
  font-size: 0.72rem;
  letter-spacing: 0.25em;
  color: var(--gold);
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 14px;
}
.fate-text {
  font-size: 1.15rem;
  font-style: italic;
  color: var(--ink-dim);
  line-height: 1.75;
}

/* ── RESET BUTTON ── */
.reset-btn {
  display: block;
  margin: 0 auto;
  background: none;
  border: 1px solid var(--border);
  color: var(--ink-dim);
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  padding: 12px 28px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.25s;
}
.reset-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
}
`;

const LOADING_PHRASES = [
  "Consulting the elder gods…",
  "Weaving the threads of fate…",
  "Etching history into stone…",
  "Summoning civilizations from the void…",
  "The stars align…",
  "Empires rise in the dark…",
];

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

export default function App() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [error, setError] = useState("");
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
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
        setLoadingPhrase(LOADING_PHRASES[i]);
      }, 2200);
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
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const data: Simulation = await res.json();
      setSimulation(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setSimulation(null);
    setInput("");
    setError("");
  };

  const renderBody = (text: string) => {
    if (!text) return null;
    return text.split(/(\*[^*]+\*)/g).map((part, i) =>
      part.startsWith("*") && part.endsWith("*")
        ? <em key={i}>{part.slice(1, -1)}</em>
        : part
    );
  };

  const eraClass = (type: string) => {
    if (["catastrophe", "decline", "end"].includes(type)) return "catastrophe";
    if (["golden", "renaissance"].includes(type)) return "golden";
    return "";
  };

  return (
    <>
      <div className="grain" />
      <div className="vignette" />
      <div className="app">
        <header className="header">
          <p className="eyebrow">⁕ The Oracle of Ages ⁕</p>
          <h1 className="title">Tiny World<br />Simulator</h1>
          <p className="subtitle">Speak one sentence. Watch a thousand years unfold.</p>
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-glyph">✦</span>
            <div className="divider-line" />
          </div>
        </header>

        {status !== "done" && (
          <div className="input-section">
            <label className="input-label">Describe your civilization</label>
            <div className="input-wrapper">
              <textarea
                className="input-field"
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. A society of blind astronomers who navigate by sound…"
                disabled={status === "loading"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); simulate(); }
                }}
              />
            </div>
            <button
              className="simulate-btn"
              onClick={simulate}
              disabled={status === "loading" || !input.trim()}
            >
              {status === "loading" ? "Consulting the Oracle…" : "✦  Begin the Simulation  ✦"}
            </button>
            {status === "error" && <div className="error-box">{error}</div>}
          </div>
        )}

        {status === "loading" && (
          <div className="loading">
            <div className="loading-orb" />
            <p className="loading-text">{loadingPhrase}</p>
            <p className="loading-flavor">A thousand years takes but a moment…</p>
          </div>
        )}

        {status === "done" && simulation && (
          <div className="simulation">
            <div className="sim-header">
              <h2 className="sim-name">{simulation.name}</h2>
              <p className="sim-tagline">"{simulation.tagline}"</p>
              <div className="divider" style={{ opacity: 1 }}>
                <div className="divider-line" />
                <span className="divider-glyph">⚔</span>
                <div className="divider-line" />
              </div>
              <div className="sim-stats">
                <div className="stat">
                  <span className="stat-value">{simulation.duration}</span>
                  <span className="stat-label">Duration</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{simulation.population_peak}</span>
                  <span className="stat-label">Peak Population</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{simulation.territory}</span>
                  <span className="stat-label">Territory</span>
                </div>
              </div>
            </div>

            <div className="timeline">
              {(simulation.eras || []).map((era, i) => (
                <div className="era" key={i}>
                  <div className={`era-dot ${eraClass(era.type)}`} />
                  <p className="era-year">{era.year}</p>
                  <h3 className={`era-title ${eraClass(era.type)}`}>{era.title}</h3>
                  <p className="era-body">{renderBody(era.body)}</p>
                </div>
              ))}
            </div>

            <div className="fate-banner">
              <p className="fate-label">Final Reckoning</p>
              <p className="fate-text">"{simulation.fate}"</p>
            </div>

            <button className="reset-btn" onClick={reset}>↺  Summon Another World</button>
          </div>
        )}
      </div>
    </>
  );
}
